import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.region = configService.get<string>('MINIO_REGION', 'us-east-1');
    this.endpoint = configService.get<string>(
      'MINIO_ENDPOINT',
      'http://localhost:9000',
    );
    this.bucket = configService.get<string>('MINIO_BUCKET', 'quran-academy');

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: configService.get<string>('MINIO_ACCESS_KEY', ''),
        secretAccessKey: configService.get<string>('MINIO_SECRET_KEY', ''),
      },
      forcePathStyle: true,
    });
  }

  async getSignedUploadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  getRecordingKey(classId: string): string {
    return `classes/${classId}/recording.mp4`;
  }

  getRecordingUrl(classId: string): string {
    return `https://${this.endpoint}/${this.bucket}/classes/${classId}/recording.mp4`;
  }
}
