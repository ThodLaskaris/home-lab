import { chromium } from 'playwright';
import { grpcClient } from './grpc-client.js';
import { scrapeUrl, discoverTargets } from './automation.js';

export async function runScraper(config) {
    const browser = await chromium.launch({ headless: config.browserOptions.headless });
    try {
        const context = await browser.newContext({ userAgent: config.browserOptions.userAgent });

        const discPage = await context.newPage();
        const targets = await discoverTargets(discPage, config);
        await discPage.close();

        if (!targets.length) {
            return;
        }

        const concurrency = config.browserOptions.concurrency || 17;
        const retryQueue = [];
        let streamError = null;

        const stream = grpcClient.StreamProducts((err) => {
            if (err) streamError = err;
        });

        const toStore = (items) => {
            if (streamError) return;
            items.forEach(i => stream.write({
                name: i.n,
                price: i.p,
                image: i.i,
                category: i.c,
                url: i.u
            }));
        };

        for (let i = 0; i < targets.length; i += concurrency) {
            if (streamError) break;
            const batch = targets.slice(i, i + concurrency);

            const res = await Promise.all(batch.map(async (u) => {
                try {
                    return await scrapeUrl(context, u, config);
                } catch {
                    retryQueue.push(u);
                    return [];
                }
            }));

            toStore(res.flat());
            if (i + concurrency < targets.length) await new Promise(r => setTimeout(r, 3000));
        }

        if (retryQueue.length > 0 && !streamError) {
            for (let j = 0; j < retryQueue.length; j += 5) {
                if (streamError) break;
                const rRes = await Promise.all(
                    retryQueue.slice(j, j + 5).map(u => scrapeUrl(context, u, config).catch(() => []))
                );
                toStore(rRes.flat());
            }
        }

        stream.end();

        if (streamError) {
            throw new Error(`gRPC Stream Error: ${streamError.message}`);
        }
    } finally {
        await browser.close();
    }
}