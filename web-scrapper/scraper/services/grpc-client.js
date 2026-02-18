import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { GRPC_SETTINGS } from '../common/baseSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = process.env.PROTO_PATH || path.resolve(__dirname, '../../../go-engine/proto/scraper.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const scraperProto = grpc.loadPackageDefinition(packageDefinition).proto;

export const grpcClient = new scraperProto.DataProcessor(
    GRPC_SETTINGS.host,
    grpc.credentials.createInsecure(),
    {
        'grpc.keepalive_time_ms': GRPC_SETTINGS.keepaliveTimeMs,
        'grpc.keepalive_timeout_ms': GRPC_SETTINGS.keepaliveTimeoutMs,
        'grpc.http2.min_ping_interval_without_data_ms': GRPC_SETTINGS.minPingIntervalMs,
    }
);

export const waitForGrpcReady = () => {
    return new Promise((resolve, reject) => {
        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + GRPC_SETTINGS.readyTimeoutS);

        grpcClient.waitForReady(deadline, (err) => {
            if (err) {
                return reject(new Error(`gRPC server at ${GRPC_SETTINGS.host} is unreachable: ${err.message}`));
            }
            resolve();
        });
    });
};
