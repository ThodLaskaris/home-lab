import { ERROR_MESSAGE } from '../common/baseSettings.js';

/**
 * Pings the target service to check if it's reachable and responsive.
 * @param {Object} config - The configuration object containing the baseUrl.
 * @throws Will throw an error if the service is down or unreachable.
 */

export async function pingService(config) {
    try {
        const response = await fetch(config.baseUrl, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            throw new Error(`Status: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        const reason = error.name === 'AbortError' ? 'Timeout' : error.message;
        throw new Error(`${ERROR_MESSAGE.serviceIsDown} \nReason: ${reason}`)
    }
}

/**
 * Validates the configuration object to ensure all required fields are present and correctly formatted.
 * @param {Object} config - The configuration object to validate.
 * @throws Will throw an error if any required field is missing or incorrectly formatted.
 */

export async function validateConfig(config) {
    if (!config)
        throw new Error(ERROR_MESSAGE.serviceIsDown);

    const errors = [];

    if (!config.selectors?.product)
        errors.push(`NF- ${ERROR_MESSAGE.productNotFound}`);

    if (!config.selectors?.price)
        errors.push(`NF- ${ERROR_MESSAGE.priceNotFound}`);

    if (!config.selectors?.title)
        errors.push(`NF- ${ERROR_MESSAGE.titleNotFound}`);

    if (!config.selectors?.image)
        errors.push(`NF- ${ERROR_MESSAGE.imageNotFound}`);

    if (errors.length > 0)
        throw new Error(`Error: ${errors.join('\n')}`)
}