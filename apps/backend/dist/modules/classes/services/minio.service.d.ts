import { ConfigService } from '@nestjs/config';
export declare class MinioService {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    private readonly region;
    private readonly endpoint;
    constructor(configService: ConfigService);
    getSignedUploadUrl(key: string, expiresIn?: number): Promise<string>;
    getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    getRecordingKey(classId: string): string;
    getRecordingUrl(classId: string): string;
}
