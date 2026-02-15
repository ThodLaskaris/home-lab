import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = process.env.PROTO_PATH || path.resolve(__dirname, '../../../go-engine/proto/scraper.proto');
const GRPC_HOST = process.env.GRPC_HOST || '127.0.0.1:50051';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const scraperProto = grpc.loadPackageDefinition(packageDefinition).proto;

export const grpcClient = new scraperProto.DataProcessor(
    GRPC_HOST,
    grpc.credentials.createInsecure(),
    {
        'grpc.keepalive_time_ms': 120000,
        'grpc.keepalive_timeout_ms': 20000,
        'grpc.http2.min_ping_interval_without_data_ms': 60000,
    }
);

export const waitForGrpcReady = () => {
    return new Promise((resolve, reject) => {
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 5);

        grpcClient.waitForReady(deadline, (err) => {
            if (err) {
                return reject(new Error(`gRPC server at ${GRPC_HOST} is unreachable: ${err.message}`));
            }
            resolve();
        });
    });
};