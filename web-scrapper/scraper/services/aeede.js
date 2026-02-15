import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config/config.js';

export const extractAeedeData = async (mainUrl) => {
    console.log('Starting extraction...');
    const errors = [];
    const items = [];

    const getRequestConfig = () => ({
        headers: { 'User-Agent': config.browserOptions.userAgent }
    });

    try {
        const { data: mainHtml } = await axios.get(mainUrl, getRequestConfig());
        const $main = cheerio.load(mainHtml);

        const iFrameSrc = $main('iframe#iframeContent').attr('src');
        if (!iFrameSrc) throw new Error(`NF- ${config.settings.errors.iFrameNotFound}`);

        const fullIFrameUrl = iFrameSrc.startsWith('http')
            ? iFrameSrc : `${new URL(mainUrl).origin}${iFrameSrc}`;

        console.log(`Accessing internal source: ${fullIFrameUrl}`);
        const { data: tableHtml } = await axios.get(fullIFrameUrl, getRequestConfig());
        const $table = cheerio.load(tableHtml);

        $table('table tbody tr').each((index, element) => {
            try {
                const cells = $table(element).find('td');
                if (cells.length < 5) return;

                const name = cells.eq(1).text().trim();
                const unit = cells.eq(2).text().trim();
                const rawQuantity = cells.eq(3).text().trim();
                const rawPrice = cells.eq(4).text().trim();

                if (name && rawPrice) {
                    const cleanPrice = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
                    const cleanQuantity = parseFloat(rawQuantity.replace(/\./g, '').replace(',', '.'));

                    items.push({
                        name,
                        price: cleanPrice,
                        quantity: cleanQuantity || 0,
                        unit: unit || 'unknown'
                    });
                }
            } catch (lineError) {
                errors.push(`Line ${index + 1}: ${lineError.message}`);
            }
        });

        console.log(`Extracted ${items.length} items`);
        return { items, errors };

    } catch (error) {
        console.error('Extraction failed:', error.message);
        return { items: [], errors: [error.message, ...errors] };
    }
};