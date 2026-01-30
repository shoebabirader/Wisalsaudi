import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs/promises';
import path from 'path';

export class S3StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.S3_BUCKET_NAME || 'wisal-videos';

    // Initialize S3 client
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(
    filePath: string,
    s3Key: string,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    try {
      // Read file from disk
      const fileContent = await fs.readFile(filePath);

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      // Return the S3 URL
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file to S3: ${error}`);
    }
  }

  async uploadDirectory(
    localDir: string,
    s3Prefix: string
  ): Promise<string[]> {
    const uploadedUrls: string[] = [];

    try {
      // Read all files in directory
      const files = await this.getFilesRecursively(localDir);

      // Upload each file
      for (const file of files) {
        const relativePath = path.relative(localDir, file);
        const s3Key = path.join(s3Prefix, relativePath).replace(/\\/g, '/');
        
        // Determine content type
        const contentType = this.getContentType(file);
        
        const url = await this.uploadFile(file, s3Key, contentType);
        uploadedUrls.push(url);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading directory to S3:', error);
      throw new Error(`Failed to upload directory to S3: ${error}`);
    }
  }

  async deleteFile(s3Key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file from S3: ${error}`);
    }
  }

  async deleteDirectory(s3Prefix: string): Promise<void> {
    // Note: This is a simplified version. For production, you'd want to list
    // all objects with the prefix and delete them in batches
    console.log(`Deleting S3 directory: ${s3Prefix}`);
    // Implementation would require listing objects and deleting them
  }

  async getSignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  private async getFilesRecursively(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await this.getFilesRecursively(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    const contentTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.m3u8': 'application/vnd.apple.mpegurl',
      '.ts': 'video/mp2t',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  isConfigured(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET_NAME
    );
  }
}
