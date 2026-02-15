import { STORE_SETTINGS, SCRAPE_SETTINGS, ERROR_MESSAGE, STORE_SELECTORS } from '../common/baseSettings.js';

export const config = {
    baseUrl: STORE_SETTINGS.baseUrl,
    selectors: { ...STORE_SELECTORS },
    browserOptions: { ...SCRAPE_SETTINGS },
    settings: {
        maxResults: SCRAPE_SETTINGS.maxResults,
        storeName: STORE_SETTINGS.storeName,
        testUrl: SCRAPE_SETTINGS.testUrl,
        errors: { ...ERROR_MESSAGE }
    }
}