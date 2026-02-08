
export const STORE_SELECTORS = {
    product: '.product',
    title: '.product__title, .item-name, h3',
    price: '.priceWrp',
    image: '.product_innerTop img',
    cookieButton: 'button:has-text("Αποδοχή όλων")',
};

export const ERROR_MESSAGE = {
    productNotFound: 'Το προϊόν δεν βρέθηκε.',
    priceNotFound: 'Η τιμή δεν βρέθηκε ή δεν είναι σε αναγνωρίσιμη μορφή.',
    titleNotFound: 'Ο τίτλος δεν βρέθηκε.',
    imageNotFound: 'Η εικόνα δεν βρέθηκε.',
    serviceIsDown: 'Η υπηρεσία είναι προσωρινά μη διαθέσιμη. Παρακαλώ δοκιμάστε ξανά αργότερα.',
    missingTarget: 'Δεν έχει οριστεί προϊόν για την αναζήτηση. Παρακαλώ προσθέστε ένα προϊόν και δοκιμάστε ξανά.',
    missingBaseUrl: 'Η βασική διεύθυνση URL δεν έχει οριστεί. Παρακαλώ ορίστε μια έγκυρη βασική διεύθυνση URL και δοκιμάστε ξανά.',
    noResults: 'Δεν βρέθηκαν προϊόντα στη διαδρομή.'
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
    headless: false,
    maxResults: 1000,
    concurrency: 17
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