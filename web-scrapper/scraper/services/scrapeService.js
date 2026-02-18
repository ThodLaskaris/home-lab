import { chromium } from 'playwright';
import { grpcClient } from './grpc-client.js';
import { scrapeUrl, discoverTargets } from './automation.js';

export async function runScraper(config) {
    const browser = await chromium.launch({ headless: config.browserOptions.headless });
    const context = await browser.newContext({ userAgent: config.browserOptions.userAgent });

    try {
        const discPage = await context.newPage();
        const targets = await discoverTargets(discPage, config);
        await discPage.close();

        if (!targets.length) {
            await browser.close();
            return;
        }

        const concurrency = config.browserOptions.concurrency;
        const retryQueue = [];

        const stream = grpcClient.StreamProducts((err) => {
            if (err) throw new Error(`gRPC Stream Error: ${err.message}`);
        });

        const toStore = (items) => {
            items.forEach(i => stream.write({
                name: i.n,
                price: i.p,
                image: i.i,
                category: i.c,
                url: i.u
            }));
        };

        for (let i = 0; i < targets.length; i += concurrency) {
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
            if (i + concurrency < targets.length) await new Promise(r => setTimeout(r, config.browserOptions.batchDelayMs));
        }

        if (retryQueue.length > 0) {
            const retryBatchSize = config.browserOptions.retryBatchSize;
            for (let j = 0; j < retryQueue.length; j += retryBatchSize) {
                const rRes = await Promise.all(
                    retryQueue.slice(j, j + retryBatchSize).map(u => scrapeUrl(context, u, config).catch(() => []))
                );
                toStore(rRes.flat());
            }
        }

        stream.end();
    } finally {
        await browser.close();
    }
}