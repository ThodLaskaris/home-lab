/**
 * Pings the target service to check if it's reachable and responsive.
 * @param {Object} config - The configuration object containing the baseUrl.
 * @throws Will throw an error if the service is down or unreachable.
 */

export async function pingService(config) {
    try {
        const response = await fetch(config.baseUrl, {
            method: 'HEAD',
            signal: AbortSignal.timeout(config.browserOptions.servicePingTimeoutMs)
        });

        if (!response.ok) {
            throw new Error(`Status: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        const reason = error.name === 'AbortError' ? 'Timeout' : error.message;
        throw new Error(`${config.settings.errors.serviceIsDown} \nReason: ${reason}`)
    }
}

/**
 * Validates the configuration object to ensure all required fields are present and correctly formatted.
 * @param {Object} config - The configuration object to validate.
 * @throws Will throw an error if any required field is missing or incorrectly formatted.
 */

export async function validateConfig(config) {
    if (!config)
        throw new Error(config.settings.errors.serviceIsDown);

    const errors = [];

    if (!config.selectors?.product)
        errors.push(`NF- ${config.settings.errors.productNotFound}`);

    if (!config.selectors?.price)
        errors.push(`NF- ${config.settings.errors.priceNotFound}`);

    if (!config.selectors?.title)
        errors.push(`NF- ${config.settings.errors.titleNotFound}`);

    if (!config.selectors?.image)
        errors.push(`NF- ${config.settings.errors.imageNotFound}`);

    if (errors.length > 0)
        throw new Error(`Error: ${errors.join('\n')}`)
}