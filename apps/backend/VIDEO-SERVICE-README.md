# Video Processing Service

The video processing service handles video uploads, transcoding, and storage for the WISAL e-commerce platform.

## Features

- **Video Upload**: Accept video files via multipart form upload
- **Format Validation**: Support MP4, MOV, and WebM formats
- **Size Validation**: Maximum file size of 500MB
- **Duration Validation**: Maximum video duration of 60 seconds
- **Multi-Resolution Transcoding**: Generate 480p, 720p, and 1080p versions
- **HLS Streaming**: Create HLS manifests for adaptive bitrate streaming
- **Thumbnail Generation**: Extract thumbnail at 2-second mark
- **S3 Storage**: Optional upload to AWS S3 or compatible storage
- **Product Integration**: Automatically update product records with video URLs

## Prerequisites

### 1. FFmpeg Installation

FFmpeg must be installed on your system. See [FFMPEG-SETUP.md](./FFMPEG-SETUP.md) for installation instructions.

### 2. AWS S3 Configuration (Optional)

If you want to use S3 storage, configure the following environment variables in `.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=wisal-videos
```

If S3 is not configured, videos will be stored locally in the `uploads/` directory.

## API Endpoints

### Upload Video

**POST** `/api/videos/upload`

Upload a video file for processing.

**Authentication**: Required (Seller or Admin)

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `video`: Video file (MP4, MOV, or WebM)
  - `productId`: Product ID to associate with the video

**Response**:
```json
{
  "success": true,
  "data": {
    "videoId": "507f1f77bcf86cd799439011",
    "productId": "507f191e810c19729de860ea",
    "status": "uploaded",
    "originalFilename": "product-demo.mp4",
    "fileSize": 15728640,
    "createdAt": "2024-01-28T10:30:00.000Z"
  }
}
```

**Processing**: Video processing happens asynchronously in the background.

### Get Video Status

**GET** `/api/videos/:id/status`

Check the processing status of a video.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "videoId": "507f1f77bcf86cd799439011",
    "productId": "507f191e810c19729de860ea",
    "status": "completed",
    "originalFilename": "product-demo.mp4",
    "fileSize": 15728640,
    "duration": 45,
    "createdAt": "2024-01-28T10:30:00.000Z",
    "updatedAt": "2024-01-28T10:35:00.000Z"
  }
}
```

**Status Values**:
- `uploaded`: Video uploaded, waiting for processing
- `processing`: Video is being transcoded
- `completed`: Video processing completed successfully
- `failed`: Video processing failed

### Regenerate Thumbnail

**POST** `/api/videos/:id/regenerate-thumbnail`

Reprocess a video (regenerate thumbnail and transcoded versions).

**Authentication**: Required (Seller or Admin)

**Response**:
```json
{
  "success": true,
  "message": "Video processing triggered",
  "messageAr": "تم تشغيل معالجة الفيديو"
}
```

### Delete Video

**DELETE** `/api/videos/:id`

Delete a video and all its processed files.

**Authentication**: Required (Seller or Admin)

**Response**:
```json
{
  "success": true,
  "message": "Video deleted successfully",
  "messageAr": "تم حذف الفيديو بنجاح"
}
```

## Video Processing Pipeline

When a video is uploaded, the following steps occur:

1. **Upload**: Video file is received and validated
2. **Storage**: Original file is stored temporarily
3. **Duration Check**: Video duration is validated (max 60 seconds)
4. **Thumbnail Extraction**: Thumbnail is extracted at 2-second mark
5. **Transcoding**: Video is transcoded to 480p, 720p, and 1080p
6. **HLS Generation**: HLS manifests and segments are created for each resolution
7. **Master Playlist**: Master HLS playlist is created for adaptive streaming
8. **S3 Upload** (if configured): All files are uploaded to S3
9. **Product Update**: Product record is updated with video URLs
10. **Status Update**: Video status is set to "completed"

## File Structure

### Local Storage

```
uploads/
├── videos/              # Original uploaded videos
│   └── {productId}_{timestamp}.mp4
└── processed/           # Processed videos
    └── {videoId}/
        ├── thumbnail.jpg
        ├── 480p.mp4
        ├── 480p.m3u8
        ├── 480p_segment_000.ts
        ├── 480p_segment_001.ts
        ├── ...
        ├── 720p.mp4
        ├── 720p.m3u8
        ├── 720p_segment_000.ts
        ├── ...
        ├── 1080p.mp4
        ├── 1080p.m3u8
        ├── 1080p_segment_000.ts
        ├── ...
        └── master.m3u8
```

### S3 Storage

```
s3://wisal-videos/
└── videos/
    └── {videoId}/
        ├── thumbnail.jpg
        ├── 480p.mp4
        ├── 480p.m3u8
        ├── 480p_segment_000.ts
        ├── ...
        ├── 720p.mp4
        ├── 720p.m3u8
        ├── ...
        ├── 1080p.mp4
        ├── 1080p.m3u8
        ├── ...
        └── master.m3u8
```

## Error Handling

### Validation Errors

**Invalid Format**:
```json
{
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Invalid video format. Allowed formats: MP4, MOV, WebM. Received: video/avi",
    "messageAr": "فشل تحميل الفيديو"
  }
}
```

**File Too Large**:
```json
{
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "File size exceeds maximum allowed size of 500MB. File size: 650.00MB",
    "messageAr": "فشل تحميل الفيديو"
  }
}
```

**Duration Too Long**:
Video will be marked as "failed" with error logged. Check video status for details.

### Processing Errors

If video processing fails, the video status will be set to "failed". Check server logs for detailed error information.

## Testing

### Manual Testing with cURL

```bash
# Upload a video
curl -X POST http://localhost:3001/api/videos/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "productId=507f191e810c19729de860ea"

# Check video status
curl -X GET http://localhost:3001/api/videos/VIDEO_ID/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Delete a video
curl -X DELETE http://localhost:3001/api/videos/VIDEO_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Testing with Postman

1. Create a new POST request to `http://localhost:3001/api/videos/upload`
2. Set Authorization header with Bearer token
3. In Body tab, select "form-data"
4. Add key "video" with type "File" and select a video file
5. Add key "productId" with your product ID
6. Send the request

## Performance Considerations

- **Processing Time**: Video processing is CPU-intensive and can take 2-5 minutes depending on video length and server resources
- **Storage**: Each video generates ~3x the original size (3 resolutions + HLS segments)
- **Bandwidth**: S3 uploads can be slow on poor connections
- **Concurrent Processing**: Consider implementing a job queue (e.g., Bull with Redis) for production

## Production Recommendations

1. **Job Queue**: Use Bull or similar for background processing
2. **CDN**: Configure CloudFlare or similar CDN for video delivery
3. **Monitoring**: Set up alerts for failed video processing
4. **Cleanup**: Implement periodic cleanup of old/unused videos
5. **Scaling**: Consider dedicated video processing workers
6. **Optimization**: Implement video compression before transcoding
7. **Security**: Use signed URLs for video access in production

## Troubleshooting

### FFmpeg Not Found

**Error**: `ffmpeg: command not found`

**Solution**: Install FFmpeg. See [FFMPEG-SETUP.md](./FFMPEG-SETUP.md)

### S3 Upload Fails

**Error**: `Failed to upload file to S3`

**Solution**: 
- Verify AWS credentials are correct
- Check S3 bucket exists and is accessible
- Verify IAM permissions include `s3:PutObject`

### Video Processing Hangs

**Solution**:
- Check FFmpeg is working: `ffmpeg -version`
- Check server resources (CPU, memory)
- Review server logs for errors
- Try with a smaller test video

### Product Not Updated

**Solution**:
- Verify product exists in database
- Check product ID is correct
- Review server logs for errors
- Product update failure doesn't fail video processing

## Database Schema

### Videos Collection (MongoDB)

```javascript
{
  _id: ObjectId,
  productId: String,
  originalFilename: String,
  originalPath: String,
  fileSize: Number,
  mimeType: String,
  duration: Number,
  status: String, // 'uploaded', 'processing', 'completed', 'failed'
  thumbnail: String,
  hlsUrl: String,
  resolutions: {
    '480p': {
      url: String,
      hlsUrl: String,
      segments: [String]
    },
    '720p': { ... },
    '1080p': { ... }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Related Documentation

- [FFMPEG-SETUP.md](./FFMPEG-SETUP.md) - FFmpeg installation guide
- [Product Service](./src/services/product.service.ts) - Product integration
- [S3 Storage Service](./src/services/s3Storage.service.ts) - S3 storage implementation
