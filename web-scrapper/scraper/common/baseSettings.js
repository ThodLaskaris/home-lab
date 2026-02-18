const env = (key, fallback) => process.env[key] ?? fallback;
const envInt = (key, fallback) => parseInt(process.env[key], 10) || fallback;
const envFloat = (key, fallback) => parseFloat(process.env[key]) || fallback;
const envBool = (key, fallback) => process.env[key] !== undefined ? process.env[key] === 'true' : fallback;
const envList = (key, fallback) => process.env[key] ? process.env[key].split(',').map(s => s.trim()) : fallback;

export const STORE_SELECTORS = {
    product:      env('SELECTOR_PRODUCT', '.product'),
    title:        env('SELECTOR_TITLE', '.product__title, .item-name, h3'),
    price:        env('SELECTOR_PRICE', '.priceWrp'),
    image:        env('SELECTOR_IMAGE', '.product_innerTop img'),
    cookieButton: env('SELECTOR_COOKIE_BUTTON', 'button:has-text("Αποδοχή όλων")'),
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

export const BASE_URL = env('BASE_URL', 'https://www.sklavenitis.gr');

export const STORE_SETTINGS = {
    baseUrl: BASE_URL,
    storeName: env('STORE_NAME', 'Σκλαβενίτης'),
    currency: env('CURRENCY', 'EUR')
};

export const SCRAPE_SETTINGS = {
    userAgent: env('USER_AGENT', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'),
    viewport: {
        width: envInt('VIEWPORT_WIDTH', 1280),
        height: envInt('VIEWPORT_HEIGHT', 800)
    },
    timeout: envInt('NAVIGATION_TIMEOUT_MS', 60000),
    headless: envBool('HEADLESS', true),
    maxResults: envInt('MAX_RESULTS', 1000),
    concurrency: envInt('CONCURRENCY', 15),
    testUrl: 'HelloWorld',
    batchDelayMs: envInt('BATCH_DELAY_MS', 3000),
    retryBatchSize: envInt('RETRY_BATCH_SIZE', 5),
    matchScoreThreshold: envFloat('MATCH_SCORE_THRESHOLD', 0.35),
    servicePingTimeoutMs: envInt('SERVICE_PING_TIMEOUT_MS', 5000),
    cookieCheckTimeoutMs: envInt('COOKIE_CHECK_TIMEOUT_MS', 3000),
    pageLoadWaitMs: envInt('PAGE_LOAD_WAIT_MS', 1000),
    scrollDistance: envInt('SCROLL_DISTANCE', 400),
    scrollIntervalMs: envInt('SCROLL_INTERVAL_MS', 800),
    scrollEndKeyWaitMs: envInt('SCROLL_END_KEY_WAIT_MS', 5000),
    scrollFinalWaitMs: envInt('SCROLL_FINAL_WAIT_MS', 3000),
};

export const GRPC_SETTINGS = {
    host: env('GRPC_HOST', '127.0.0.1:50051'),
    keepaliveTimeMs: envInt('GRPC_KEEPALIVE_TIME_MS', 120000),
    keepaliveTimeoutMs: envInt('GRPC_KEEPALIVE_TIMEOUT_MS', 20000),
    minPingIntervalMs: envInt('GRPC_MIN_PING_INTERVAL_MS', 60000),
    readyTimeoutS: envInt('GRPC_READY_TIMEOUT_S', 5),
};

export const SCRAPING_FILTERS = {
    categoriesPath: env('CATEGORIES_PATH', '/katigories/'),
    domainFilter: env('DOMAIN_FILTER', 'sklavenitis.gr/'),
    apiEndpointFilter: env('API_ENDPOINT_FILTER', 'getproducts'),
    excludedUrlPatterns: envList('EXCLUDED_URL_PATTERNS', ['exypiretisi-pelaton', 'e-shop-info', 'log-in', '/katigories/', '/about/']),
    blockedResourceTypes: envList('BLOCKED_RESOURCE_TYPES', ['png', 'jpg', 'jpeg', 'gif', 'webp', 'css', 'woff', 'pdf']),
};

export const config = {
    baseUrl: BASE_URL,
    settings: {
        ...STORE_SETTINGS,
        errors: ERROR_MESSAGE
    },
    browserOptions: SCRAPE_SETTINGS,
    selectors: STORE_SELECTORS,
    grpc: GRPC_SETTINGS,
    filters: SCRAPING_FILTERS
};
