import { Collection, Db, ObjectId } from 'mongodb';
import { VideoMetadata, VideoProcessingStatus, VideoProcessingResult } from '../types/video.types';

export class VideoModel {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection('videos');
  }

  async create(videoData: Omit<VideoMetadata, 'id' | 'createdAt' | 'updatedAt'>): Promise<VideoMetadata> {
    const now = new Date();
    const doc = {
      ...videoData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(doc);
    
    return {
      id: result.insertedId.toString(),
      ...doc,
    };
  }

  async findById(id: string): Promise<VideoMetadata | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    
    if (!doc) {
      return null;
    }

    return {
      id: doc._id.toString(),
      productId: doc.productId,
      originalFilename: doc.originalFilename,
      originalPath: doc.originalPath,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      duration: doc.duration,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByProductId(productId: string): Promise<VideoMetadata[]> {
    const docs = await this.collection.find({ productId }).toArray();
    
    return docs.map(doc => ({
      id: doc._id.toString(),
      productId: doc.productId,
      originalFilename: doc.originalFilename,
      originalPath: doc.originalPath,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      duration: doc.duration,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async updateStatus(id: string, status: VideoProcessingStatus): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      }
    );
  }

  async updateProcessingResult(id: string, result: Partial<VideoProcessingResult>): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...result,
          status: 'completed',
          updatedAt: new Date()
        } 
      }
    );
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}
