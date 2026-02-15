
export const STORE_SELECTORS = {
    product: '.product',
    title: '.product__title, .item-name, h3',
    price: '.priceWrp',
    image: '.product_innerTop img',
    cookieButton: 'button:has-text("Αποδοχή όλων")',
};

export const ERROR_MESSAGE = {
    productNotFound: 'Product not found.',
    priceNotFound: 'Price not found or invalid format.',
    titleNotFound: 'Title not found.',
    imageNotFound: 'Image not found.',
    serviceIsDown: 'Service is temporarily unavailable. Please try again later.',
    missingTarget: 'No search target defined. Please add a product and try again.',
    missingBaseUrl: 'Base URL is not defined. Please set a valid base URL and try again.',
    noResults: 'No products found in the specified path.',
    noReceiptUrl: 'No receipt URL provided. Please provide a valid receipt URL and try again.',
    noModeGiven: 'No mode specified. Please choose either "--catalog" or "--receipt" mode and try again.',
    iFrameNotFound: 'iFrame source not found in the provided URL. Please check the URL and try again.'
};

export const BASE_URL = 'https://www.sklavenitis.gr';

export const STORE_SETTINGS = {
    baseUrl: BASE_URL,
    storeName: 'Σκλαβενίτης',
    currency: 'EUR'
};

export const SCRAPE_SETTINGS = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    timeout: 60000,
    headless: true,
    maxResults: 1000,
    concurrency: 15,
    testUrl: 'HelloWorld'
};

export const config = {
    baseUrl: BASE_URL,
    settings: {
        ...STORE_SETTINGS,
        errors: ERROR_MESSAGE
    },
    browserOptions: SCRAPE_SETTINGS,
    selectors: STORE_SELECTORS
};