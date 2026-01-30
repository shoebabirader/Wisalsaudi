import { Request, Response } from 'express';
import { VideoService } from '../services/video.service';
import { VideoProcessorService } from '../services/videoProcessor.service';

let videoService: VideoService;
let videoProcessorService: VideoProcessorService;

// Lazy initialization to ensure MongoDB is connected
const getVideoService = () => {
  if (!videoService) {
    videoService = new VideoService();
  }
  return videoService;
};

const getVideoProcessorService = () => {
  if (!videoProcessorService) {
    videoProcessorService = new VideoProcessorService();
  }
  return videoProcessorService;
};

export const uploadVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({
        error: {
          code: 'MISSING_PRODUCT_ID',
          message: 'Product ID is required',
          messageAr: 'معرف المنتج مطلوب',
        },
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        error: {
          code: 'MISSING_FILE',
          message: 'Video file is required',
          messageAr: 'ملف الفيديو مطلوب',
        },
      });
      return;
    }

    const videoMetadata = await getVideoService().uploadVideo(productId, req.file);

    // Trigger video processing asynchronously (don't wait for it)
    getVideoProcessorService().processVideo(videoMetadata.id).catch((error) => {
      console.error('Background video processing failed:', error);
    });

    res.status(201).json({
      success: true,
      data: {
        videoId: videoMetadata.id,
        productId: videoMetadata.productId,
        status: videoMetadata.status,
        originalFilename: videoMetadata.originalFilename,
        fileSize: videoMetadata.fileSize,
        createdAt: videoMetadata.createdAt,
      },
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({
      error: {
        code: 'UPLOAD_FAILED',
        message: errorMessage,
        messageAr: 'فشل تحميل الفيديو',
      },
    });
  }
};

export const getVideoStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const video = await getVideoService().getVideoById(id);

    if (!video) {
      res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
          messageAr: 'الفيديو غير موجود',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        videoId: video.id,
        productId: video.productId,
        status: video.status,
        originalFilename: video.originalFilename,
        fileSize: video.fileSize,
        duration: video.duration,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error getting video status:', error);
    
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch video status',
        messageAr: 'فشل في جلب حالة الفيديو',
      },
    });
  }
};

export const deleteVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await getVideoService().deleteVideo(id);

    res.json({
      success: true,
      message: 'Video deleted successfully',
      messageAr: 'تم حذف الفيديو بنجاح',
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'Video not found') {
      res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: errorMessage,
          messageAr: 'الفيديو غير موجود',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete video',
        messageAr: 'فشل في حذف الفيديو',
      },
    });
  }
};

export const regenerateThumbnail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const video = await getVideoService().getVideoById(id);

    if (!video) {
      res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
          messageAr: 'الفيديو غير موجود',
        },
      });
      return;
    }

    // Trigger video processing again
    await getVideoProcessorService().processVideo(id);

    res.json({
      success: true,
      message: 'Video processing triggered',
      messageAr: 'تم تشغيل معالجة الفيديو',
    });
  } catch (error) {
    console.error('Error regenerating thumbnail:', error);
    
    res.status(500).json({
      error: {
        code: 'REGENERATE_FAILED',
        message: 'Failed to regenerate thumbnail',
        messageAr: 'فشل في إعادة إنشاء الصورة المصغرة',
      },
    });
  }
};
