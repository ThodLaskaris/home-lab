import { chromium } from 'playwright';
import { grpcClient } from './grpc-client.js';
import { scrapeUrl, handleCookies} from './automation.js'
import { config } from '../config/config.js';

async function discoverTargets(page, config) {
    const categoriesUrl = `${config.baseUrl}/katigories/`; 
    console.log(`Discovery starting at ${categoriesUrl}...`);
    
    try {
        await page.goto(categoriesUrl, { waitUntil: 'networkidle', timeout: 60000 });
        await handleCookies(page, config);
        await page.waitForLoadState('domcontentloaded');

        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.includes('sklavenitis.gr/'));
        });

        const categoryPattern = /\/[a-z0-9-]+\/[a-z0-9-]+\/?$/; 
        const filtered = [...new Set(links)].filter(link => 
            categoryPattern.test(link) && 
            !['exypiretisi-pelaton', 'e-shop-info', 'log-in', '/katigories/', '/about/'].some(s => link.includes(s))
        );
        return filtered;
    } catch (err) {
        console.error("Discovery Fail ", err.message);
        return [];
    }
}

export async function runScraper(config) {
    const browser = await chromium.launch({ headless: config.browserOptions.headless });
    const context = await browser.newContext({ userAgent: config.browserOptions.userAgent });
    const discoveryPage = await context.newPage();
    
    const dynamicTargets = await discoverTargets(discoveryPage, config);
    await discoveryPage.close();
    
    if (dynamicTargets.length === 0) {
        console.error('Discovery failed. The cookie banner probably blocked the menu.');
        await browser.close();
        return;
    }
    const CONCURRENCY = config.browserOptions.concurrency || 17;
    let totalStreamedCount = 0; 

    const stream = grpcClient.StreamProducts((error, response) => {
        if (error) console.error('gRPC Finalization Error:', error);
        else console.log('Go Service finalized:', response.message);
    });

    try {
        for (let i = 0; i < dynamicTargets.length; i += CONCURRENCY) {
            const batch = dynamicTargets.slice(i, i + CONCURRENCY);
            console.log(`Batch Processing: ${i + 1} to ${Math.min(i + CONCURRENCY, dynamicTargets.length)} of ${dynamicTargets.length}`);

            const batchResults = await Promise.all(
                batch.map(url => scrapeUrl(context, url, config))
            );
            
            const cleanBatch = batchResults.flat();
            totalStreamedCount += cleanBatch.length;

            cleanBatch.forEach(item => {
                stream.write({
                    name: item.n,
                    price: item.p,
                    image: item.i
                });
            });

            console.log(`Streamed ${cleanBatch.length} items to Go.`);

            if (i + CONCURRENCY < dynamicTargets.length) {
                await new Promise(r => setTimeout(r, 4000));
            }
        }
        stream.end();
    } catch (err) {
        console.error('Scraper Core ', err.message);
    } finally {
        await browser.close();
    }
}