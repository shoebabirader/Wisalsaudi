import { VideoModel } from '../models/video.model';
import { VideoMetadata, VideoValidationError } from '../types/video.types';
import { getMongoDB } from '../db/mongodb';
import fs from 'fs/promises';
import path from 'path';

export class VideoService {
  private videoModel: VideoModel;
  private uploadDir: string;

  constructor() {
    const db = getMongoDB();
    this.videoModel = new VideoModel(db);
    this.uploadDir = path.join(process.cwd(), 'uploads', 'videos');
  }

  async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  validateVideoFile(file: Express.Multer.File): VideoValidationError[] {
    const errors: VideoValidationError[] = [];
    
    // Validate file format
    const allowedFormats = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedFormats.includes(file.mimetype)) {
      errors.push({
        field: 'file',
        message: `Invalid video format. Allowed formats: MP4, MOV, WebM. Received: ${file.mimetype}`,
      });
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: `File size exceeds maximum allowed size of 500MB. File size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      });
    }

    return errors;
  }

  async uploadVideo(
    productId: string,
    file: Express.Multer.File
  ): Promise<VideoMetadata> {
    // Validate the video file
    const validationErrors = this.validateVideoFile(file);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.map(e => e.message).join(', '));
    }

    // Ensure upload directory exists
    await this.ensureUploadDirectory();

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${productId}_${timestamp}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    // Move file to permanent location
    await fs.writeFile(filePath, file.buffer);

    // Create video metadata record
    const videoMetadata = await this.videoModel.create({
      productId,
      originalFilename: file.originalname,
      originalPath: filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: 'uploaded',
    });

    return videoMetadata;
  }

  async getVideoById(id: string): Promise<VideoMetadata | null> {
    return this.videoModel.findById(id);
  }

  async getVideosByProductId(productId: string): Promise<VideoMetadata[]> {
    return this.videoModel.findByProductId(productId);
  }

  async deleteVideo(id: string): Promise<void> {
    const video = await this.videoModel.findById(id);
    
    if (!video) {
      throw new Error('Video not found');
    }

    // Delete physical file
    try {
      await fs.unlink(video.originalPath);
    } catch (error) {
      console.error('Error deleting video file:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await this.videoModel.delete(id);
  }
}
