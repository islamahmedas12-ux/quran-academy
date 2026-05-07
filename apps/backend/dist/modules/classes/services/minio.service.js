"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MinioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let MinioService = MinioService_1 = class MinioService {
    configService;
    logger = new common_1.Logger(MinioService_1.name);
    s3Client;
    bucket;
    region;
    endpoint;
    constructor(configService) {
        this.configService = configService;
        this.region = configService.get('MINIO_REGION', 'us-east-1');
        this.endpoint = configService.get('MINIO_ENDPOINT', 'http://localhost:9000');
        this.bucket = configService.get('MINIO_BUCKET', 'quran-academy');
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            endpoint: this.endpoint,
            credentials: {
                accessKeyId: configService.get('MINIO_ACCESS_KEY', ''),
                secretAccessKey: configService.get('MINIO_SECRET_KEY', ''),
            },
            forcePathStyle: true,
        });
    }
    async getSignedUploadUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    async getSignedDownloadUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
    }
    getRecordingKey(classId) {
        return `classes/${classId}/recording.mp4`;
    }
    getRecordingUrl(classId) {
        return `https://${this.endpoint}/${this.bucket}/classes/${classId}/recording.mp4`;
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = MinioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MinioService);
//# sourceMappingURL=minio.service.js.map