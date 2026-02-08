import { STORE_SETTINGS, SCRAPE_SETTINGS, ERROR_MESSAGE, STORE_SELECTORS } from "../common/baseSettings.js";

export const config = {
    baseUrl: STORE_SETTINGS.baseUrl,
    selectors: {
        product: STORE_SELECTORS.product,
        title: STORE_SELECTORS.title,
        price: STORE_SELECTORS.price,
        image: STORE_SELECTORS.image,
        cookieButton: STORE_SELECTORS.cookieButton,
    },
    browserOptions: {
        headless: SCRAPE_SETTINGS.headless,
        timeout: SCRAPE_SETTINGS.timeout,
        userAgent: SCRAPE_SETTINGS.userAgent,
        viewport: SCRAPE_SETTINGS.viewport,
        concurrency: SCRAPE_SETTINGS.concurrency 
    },
    settings: {
        maxResults: SCRAPE_SETTINGS.maxResults,
        storeName: STORE_SETTINGS.storeName,
        errors: ERROR_MESSAGE
    }
};