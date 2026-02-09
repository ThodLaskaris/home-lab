import { chromium } from 'playwright'; 
import { grpcClient } from './grpc-client.js';
import { scrapeUrl, discoverTargets } from './automation.js';

export async function runScraper(config) {
    const browser = await chromium.launch({ headless: config.browserOptions.headless });
    const context = await browser.newContext({ userAgent: config.browserOptions.userAgent });
    
    const discPage = await context.newPage();
    const targets = await discoverTargets(discPage, config);
    await discPage.close();
    
    if (!targets.length) {
        await browser.close();
        return;
    }

    const concurrency = config.browserOptions.concurrency || 17;
    const retryQueue = []; 
    let nodeSideCount = 0; 

    const stream = grpcClient.StreamProducts((err, res) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(`Go Sync: ${res.message}`);
            console.log(`Total items processed by Node: ${nodeSideCount}`); 
        }
    });

    const toStore = (items) => {
        nodeSideCount += items.length;
        items.forEach(i => stream.write({ name: i.n, price: i.p, image: i.i }));
    };

    try {
        for (let i = 0; i < targets.length; i += concurrency) {
            const batch = targets.slice(i, i + concurrency);
            console.log(`Processing batch: ${i + 1} to ${Math.min(i + concurrency, targets.length)}`);

            const res = await Promise.all(batch.map(async (u) => {
                try { 
                    return await scrapeUrl(context, u, config); 
                } catch (e) { 
                    retryQueue.push(u); 
                    return []; 
                }
            }));
            
            toStore(res.flat());
            if (i + concurrency < targets.length) await new Promise(r => setTimeout(r, 3000));
        }

        if (retryQueue.length > 0) {
            console.log(`Retrying ${retryQueue.length} failed URLs`);
            for (let j = 0; j < retryQueue.length; j += 5) {
                const rRes = await Promise.all(
                    retryQueue.slice(j, j + 5).map(u => scrapeUrl(context, u, config).catch(() => []))
                );
                toStore(rRes.flat());
            }
        }
    } finally {
        stream.end(); 
        await browser.close();
    }
}