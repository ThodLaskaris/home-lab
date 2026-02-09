
export async function handleCookies(page, config) {
    const cookieSelector = config.selectors.cookieButton;
    if (!cookieSelector) return;
    try {
        const btn = page.locator(cookieSelector).first();
        if (await btn.isVisible({ timeout: 3000 })) await btn.click();
    } catch (e) {
        console.warn('Cookie handling failed:', e.message);
    }
}

export async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 400; 
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 800); 
        });
    });

    for (let i = 0; i < 4; i++) {
        await page.keyboard.press('End');
        console.log(`Waiting for lazy buffer.. (${i + 1}/4)`);
        await page.waitForTimeout(5000); 
    }
    await page.waitForTimeout(3000);
}

export async function extractData(productLocator, config) {

    const title = await productLocator.locator(config.selectors.title)
    .first()
    .innerText()
    .catch(() => 'NF');

    const rawPrice = await productLocator.locator(config.selectors.price)
    .first()
    .innerText()
    .catch(() => 'NF');

    const image = await productLocator.locator(config.selectors.image)
    .first()
    .getAttribute('src')
    .catch(() => 'NF');

    let cleanPrice = 0;
    if (rawPrice !== 'NF') {
        const priceMatch = rawPrice.match(/(\d+,\d+)/);
        cleanPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;
    }

    return { n: title.trim(), p: cleanPrice, i: image !== 'NF' ? image.split('/').slice(-2).join('/') : 'NF' };
}

export async function scrapeUrl(context, url, config) {
    const page = await context.newPage();
    let apiDataAccumulator = [];

    page.on('response', async (response) => {
        const reqUrl = response.url();
        if (reqUrl.includes('getproducts')) {
            try {
                const json = await response.json();
                if (json.Products && Array.isArray(json.Products)) {
                    const mapped = json.Products.map(p => ({
                        n: p.Title,
                        p: p.Price,
                        i: p.Image
                    }));
                    apiDataAccumulator.push(...mapped);
                }
            } catch (e) {}
        }
    });

    await page.route('**/*.{png,jpg,jpeg,gif,webp,css,woff,pdf}', route => route.abort());

    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(1000); // Safety wait για το API
        await autoScroll(page);

        if (apiDataAccumulator.length === 0) {
            const productLocators = page.locator(config.selectors.product);
            const count = await productLocators.count();
            for (let i = 0; i < count; i++) {
                const data = await extractData(productLocators.nth(i), config);
                if (data.n !== 'NF' && data.p > 0) apiDataAccumulator.push(data);
            }
        } else {
            console.log(`API Intercepted: Found ${apiDataAccumulator.length} items for ${url}`);
        }
        const uniqueItems = Array.from(
            new Map(apiDataAccumulator.map(item => [item.n + item.p, item])).values()
        );

        return uniqueItems;
    } catch (err) {
        console.error(`Error on ${url}:`, err.message);
        return [];
    } finally {
        await page.close();
    }
}

export async function discoverTargets(page, config) {
    const url = `${config.baseUrl}/katigories/`;
    console.log(`Start at ${url} ..`);
    
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await handleCookies(page, config);
        await page.waitForLoadState('domcontentloaded');

        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.includes('sklavenitis.gr/'));
        });

        const pattern = /\/[a-z0-9-]+\/[a-z0-9-]+\/?$/; 
        return [...new Set(links)].filter(link => 
            pattern.test(link) && 
            !['exypiretisi-pelaton', 'e-shop-info', 'log-in', '/katigories/', '/about/'].some(s => link.includes(s))
        );
    } catch (err) {
        console.error("Discovery Fail:", err.message);
        return [];
    }
}