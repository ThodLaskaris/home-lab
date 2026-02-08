import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, '../scraper.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const scraperProto = grpc.loadPackageDefinition(packageDefinition).scraper;

export const grpcClient = new scraperProto.DataProcessor(
    'localhost:50051',
    grpc.credentials.createInsecure()
);