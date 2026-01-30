import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { ObjectId } from 'mongodb';
import { VideoModel } from '../models/video.model';
import { getMongoDB } from '../db/mongodb';
import { S3StorageService } from './s3Storage.service';
import { ProductModel } from '../models/product.model';

export interface TranscodingOptions {
  resolution: '480p' | '720p' | '1080p';
  width: number;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
}

export class VideoProcessorService {
  private videoModel: VideoModel;
  private productModel: ProductModel;
  private s3Storage: S3StorageService;
  private outputDir: string;

  constructor() {
    const db = getMongoDB();
    this.videoModel = new VideoModel(db);
    this.productModel = new ProductModel();
    this.s3Storage = new S3StorageService();
    this.outputDir = path.join(process.cwd(), 'uploads', 'processed');
  }

  private getTranscodingOptions(): TranscodingOptions[] {
    return [
      {
        resolution: '480p',
        width: 854,
        height: 480,
        videoBitrate: '1000k',
        audioBitrate: '128k',
      },
      {
        resolution: '720p',
        width: 1280,
        height: 720,
        videoBitrate: '2500k',
        audioBitrate: '128k',
      },
      {
        resolution: '1080p',
        width: 1920,
        height: 1080,
        videoBitrate: '5000k',
        audioBitrate: '192k',
      },
    ];
  }

  async ensureOutputDirectory(videoId: string): Promise<string> {
    const videoDir = path.join(this.outputDir, videoId);
    try {
      await fs.access(videoDir);
    } catch {
      await fs.mkdir(videoDir, { recursive: true });
    }
    return videoDir;
  }

  async extractThumbnail(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: ['2'],
          filename: 'thumbnail.jpg',
          folder: path.dirname(outputPath),
          size: '1280x720',
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });
  }

  async getVideoDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration || 0);
        }
      });
    });
  }

  async transcodeVideo(
    inputPath: string,
    outputPath: string,
    options: TranscodingOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .size(`${options.width}x${options.height}`)
        .videoBitrate(options.videoBitrate)
        .audioBitrate(options.audioBitrate)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async generateHLSPlaylist(
    inputPath: string,
    outputDir: string,
    resolution: string
  ): Promise<string> {
    const playlistPath = path.join(outputDir, `${resolution}.m3u8`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-codec: copy',
          '-start_number 0',
          '-hls_time 10',
          '-hls_list_size 0',
          '-f hls',
        ])
        .output(playlistPath)
        .on('end', () => resolve(playlistPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  async createMasterPlaylist(
    videoDir: string,
    resolutions: string[]
  ): Promise<string> {
    const masterPlaylistPath = path.join(videoDir, 'master.m3u8');
    
    const bandwidthMap: Record<string, number> = {
      '480p': 1000000,
      '720p': 2500000,
      '1080p': 5000000,
    };

    const resolutionMap: Record<string, string> = {
      '480p': '854x480',
      '720p': '1280x720',
      '1080p': '1920x1080',
    };

    let content = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    for (const resolution of resolutions) {
      const bandwidth = bandwidthMap[resolution];
      const resolutionStr = resolutionMap[resolution];
      
      content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolutionStr}\n`;
      content += `${resolution}.m3u8\n\n`;
    }

    await fs.writeFile(masterPlaylistPath, content);
    return masterPlaylistPath;
  }

  async processVideo(videoId: string): Promise<void> {
    try {
      // Update status to processing
      await this.videoModel.updateStatus(videoId, 'processing');

      // Get video metadata
      const video = await this.videoModel.findById(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      // Validate video duration (max 60 seconds)
      const duration = await this.getVideoDuration(video.originalPath);
      if (duration > 60) {
        await this.videoModel.updateStatus(videoId, 'failed');
        throw new Error(`Video duration exceeds 60 seconds. Duration: ${duration.toFixed(2)}s`);
      }

      // Create output directory
      const videoDir = await this.ensureOutputDirectory(videoId);

      // Extract thumbnail at 2-second mark
      const thumbnailPath = path.join(videoDir, 'thumbnail.jpg');
      await this.extractThumbnail(video.originalPath, thumbnailPath);

      // Transcode to multiple resolutions
      const transcodingOptions = this.getTranscodingOptions();
      const resolutions: string[] = [];

      for (const options of transcodingOptions) {
        const outputPath = path.join(videoDir, `${options.resolution}.mp4`);
        await this.transcodeVideo(video.originalPath, outputPath, options);
        
        // Generate HLS playlist for this resolution
        await this.generateHLSPlaylist(outputPath, videoDir, options.resolution);
        resolutions.push(options.resolution);
      }

      // Create master HLS playlist
      await this.createMasterPlaylist(videoDir, resolutions);

      // Determine base URL (S3 or local)
      let baseUrl: string;
      let thumbnailUrl: string;
      let hlsUrl: string;

      if (this.s3Storage.isConfigured()) {
        // Upload to S3
        console.log(`Uploading video ${videoId} to S3...`);
        const s3Prefix = `videos/${videoId}`;
        await this.s3Storage.uploadDirectory(videoDir, s3Prefix);
        
        baseUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Prefix}`;
        thumbnailUrl = `${baseUrl}/thumbnail.jpg`;
        hlsUrl = `${baseUrl}/master.m3u8`;
      } else {
        // Use local URLs
        console.log(`S3 not configured, using local storage for video ${videoId}`);
        baseUrl = `/uploads/processed/${videoId}`;
        thumbnailUrl = `${baseUrl}/thumbnail.jpg`;
        hlsUrl = `${baseUrl}/master.m3u8`;
      }

      // Update video record with processing results
      const processingResult = {
        videoId,
        thumbnail: thumbnailUrl,
        hlsUrl: hlsUrl,
        resolutions: {
          '480p': {
            url: `${baseUrl}/480p.mp4`,
            hlsUrl: `${baseUrl}/480p.m3u8`,
            segments: [],
          },
          '720p': {
            url: `${baseUrl}/720p.mp4`,
            hlsUrl: `${baseUrl}/720p.m3u8`,
            segments: [],
          },
          '1080p': {
            url: `${baseUrl}/1080p.mp4`,
            hlsUrl: `${baseUrl}/1080p.m3u8`,
            segments: [],
          },
        },
      };

      await this.videoModel.updateProcessingResult(videoId, processingResult);

      // Update product record with video URLs
      await this.updateProductWithVideo(video.productId, {
        id: videoId,
        url: `${baseUrl}/1080p.mp4`,
        hlsUrl: hlsUrl,
        thumbnail: thumbnailUrl,
        duration: Math.floor(duration),
        order: 0,
      });

      console.log(`Video ${videoId} processed successfully`);
    } catch (error) {
      console.error(`Error processing video ${videoId}:`, error);
      await this.videoModel.updateStatus(videoId, 'failed');
      throw error;
    }
  }

  private async updateProductWithVideo(
    productId: string,
    videoData: {
      id: string;
      url: string;
      hlsUrl: string;
      thumbnail: string;
      duration: number;
      order: number;
    }
  ): Promise<void> {
    try {
      const product = await this.productModel.findById(productId);
      
      if (!product) {
        console.warn(`Product ${productId} not found, skipping video update`);
        return;
      }

      // Add video to product's videos array
      const videos = product.videos || [];
      
      // Check if video already exists
      const existingIndex = videos.findIndex(v => v.id === videoData.id);
      
      if (existingIndex >= 0) {
        // Update existing video
        videos[existingIndex] = {
          ...videos[existingIndex],
          ...videoData,
        };
      } else {
        // Add new video
        videos.push(videoData);
      }

      // Update product directly using MongoDB collection
      // This bypasses the model's update method which requires sellerId
      const db = getMongoDB();
      const productsCollection = db.collection('products');
      
      await productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        { 
          $set: { 
            videos,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log(`Updated product ${productId} with video ${videoData.id}`);
    } catch (error) {
      console.error(`Error updating product with video:`, error);
      // Don't throw - video processing succeeded even if product update failed
    }
  }
}
