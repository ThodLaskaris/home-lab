import { config } from './config/config.js';
import { pingService, validateConfig, runScraper } from './services/index.js';
import { saveResults } from './services/fileService.js';

async function main() {
 
    try {
        await validateConfig(config);
        await pingService(config);

        const result = await runScraper(config);
        
        if (!result || !result.items || result.items.length === 0) {
            console.warn(config.settings.errors.noResults);
            return;
        }
        // await saveResults(result);
        
    } catch (error) {
        console.error(config.settings.errors.validationFailed, error.message);
    }
}
main();