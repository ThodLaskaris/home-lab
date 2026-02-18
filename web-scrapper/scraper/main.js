import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { config } = await import('./config/config.js');
const { pingService, validateConfig, handlerService } = await import('./services/index.js');

/**
 * Main entry point for the scraper application. Validates configuration, checks service availability, and routes to the appropriate handler based on command-line arguments.
 * @throws Will throw an error if the configuration is invalid, the target service is down, or if an invalid mode is specified.
 */
async function main() {
    const [,, mode, targetUrl] = process.argv;

    try {
        await pingService(config);
        await validateConfig(config);

        const validModes = {
            '--catalog': () => handlerService.handleCatalogSync(config),
            '--receipt': () => handlerService.handleReceiptProcess(targetUrl, config)
        }
        if (!validModes[mode]) throw new Error(`BR- ${config.settings.errors.noModeGiven}`);
        await validModes[mode]();
    }
    catch (error) {
        process.stderr.write(`${error.message}\n`);
        process.exit(1);
    }
}
main().catch(() => process.exit(1));
