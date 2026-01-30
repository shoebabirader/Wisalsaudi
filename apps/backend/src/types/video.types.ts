export interface VideoUploadRequest {
  productId: string;
  file: Express.Multer.File;
}

export interface VideoMetadata {
  id: string;
  productId: string;
  originalFilename: string;
  originalPath: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  status: VideoProcessingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type VideoProcessingStatus = 
  | 'uploaded'
  | 'processing'
  | 'completed'
  | 'failed';

export interface VideoProcessingResult {
  videoId: string;
  thumbnail: string;
  resolutions: {
    '480p': VideoResolution;
    '720p': VideoResolution;
    '1080p': VideoResolution;
  };
  hlsUrl: string;
}

export interface VideoResolution {
  url: string;
  hlsUrl: string;
  segments: string[];
}

export interface VideoValidationError {
  field: string;
  message: string;
}
