import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly s3Client: S3Client;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('MINIO_ENDPOINT', 'http://localhost:9000'),
      region: this.configService.get<string>('MINIO_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true,
    });
    this.endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'http://localhost:9000');
  }

  private getBucketName(orgId: string): string {
    return `${orgId}-quran-academy`;
  }

  async getPresignedUploadUrl(
    orgId: string,
    key: string,
    expiresIn: number = 3600,
  ): Promise<{ uploadUrl: string; bucket: string; key: string }> {
    const bucket = this.getBucketName(orgId);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    return {
      uploadUrl,
      bucket,
      key,
    };
  }

  async getPresignedDownloadUrl(orgId: string, key: string, expiresIn: number = 3600): Promise<string> {
    const bucket = this.getBucketName(orgId);
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteObject(orgId: string, key: string): Promise<void> {
    const bucket = this.getBucketName(orgId);
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  getPublicUrl(orgId: string, key: string): string {
    const bucket = this.getBucketName(orgId);
    return `${this.endpoint}/${bucket}/${key}`;
  }

  async ensureBucket(orgId: string): Promise<void> {
    const bucket = this.getBucketName(orgId);
    try {
      const command = new CreateBucketCommand({ Bucket: bucket });
      await this.s3Client.send(command);
      this.logger.log(`Created bucket: ${bucket}`);
    } catch (error: any) {
      if (error.name !== 'BucketAlreadyExists' && error.name !== 'BucketAlreadyOwnedByYou') {
        throw error;
      }
    }
  }
}
