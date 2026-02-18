import {extractAeedeData, grpcClient, processReceiptMatches, runScraper} from './index.js';
import {waitForGrpcReady} from "./grpc-client.js";

export const handlerService = {
    handleCatalogSync: async (config) => {
        try {
            await waitForGrpcReady();
            await runScraper(config);
        } catch (error) {
            throw error;
        }
    },

    handleReceiptProcess: async (targetUrl, config) => {
        try {
            const urlToUse = targetUrl || config.settings.testUrl;
            if (!urlToUse) throw new Error(`NF- ${config.settings.errors.noReceiptUrl}`);

            await waitForGrpcReady();
            const { items, errors } = await extractAeedeData(urlToUse);

            if (errors.length > 0) {
                console.warn(`${errors.length}`);
            }
            if (!items || items.length === 0) {
                throw new Error(`BR- No items found for ${urlToUse}`);
            }
            console.table(items);
            return await processReceiptMatches(items, grpcClient, config);
        } catch (error) {
            console.error(`Fail ${error.message}`);
            throw error;
        }
    }
}