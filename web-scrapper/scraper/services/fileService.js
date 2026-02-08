import fs from 'fs';
import { Packr } from 'msgpackr';

const packr = new Packr({ structuredClone: true });

/**
 * Saves the provided data to a MessagePack file. If the data is empty or null, it logs a warning and skips file creation.
 * @param {*} data 
 * @param {*} filename 
 * @returns 
 */
export async function saveResults(data, filename = 'results.msgpack') {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        console.warn('No data to save. Skipping file creation..')
        return;
    }
    try {
        const binaryBuffer = packr.pack(data);
        fs.writeFileSync(filename, binaryBuffer);

        const FileSizeInBytes = (binaryBuffer.length / (1024 * 1024)).toFixed(2);
        console.log(`Data persisted to ${filename} (${FileSizeInBytes} MB)`);
    }
    catch (error) {
    throw new Error(`File System Error: ${error.message}`);
    }
}