import { ConfigService } from '@nestjs/config';
export declare class MinioService {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucket;
    private readonly endpoint;
    constructor(configService: ConfigService);
    getPresignedUploadUrl(key: string, expiresIn?: number): Promise<{
        uploadUrl: string;
        bucket: string;
        key: string;
    }>;
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    deleteObject(key: string): Promise<void>;
    getPublicUrl(key: string): string;
}
