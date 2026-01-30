import { Router } from 'express';
import multer from 'multer';
import { uploadVideo, getVideoStatus, deleteVideo, regenerateThumbnail } from '../controllers/video.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

// POST /api/videos/upload - Upload a video (seller only)
router.post(
  '/upload',
  authenticate,
  requireRole('seller', 'admin'),
  upload.single('video'),
  uploadVideo
);

// GET /api/videos/:id/status - Get video processing status
router.get(
  '/:id/status',
  authenticate,
  getVideoStatus
);

// POST /api/videos/:id/regenerate-thumbnail - Regenerate thumbnail and reprocess video
router.post(
  '/:id/regenerate-thumbnail',
  authenticate,
  requireRole('seller', 'admin'),
  regenerateThumbnail
);

// DELETE /api/videos/:id - Delete a video (seller only)
router.delete(
  '/:id',
  authenticate,
  requireRole('seller', 'admin'),
  deleteVideo
);

export default router;
