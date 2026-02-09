import { config } from './config/config.js';
import { pingService, validateConfig, runScraper } from './services/index.js';

async function main() {
 
    try {
        await validateConfig(config);
        await pingService(config);
        await runScraper(config);
    } catch (error) {
        console.error(config.settings.errors.validationFailed, error.message);
    }
}
main();