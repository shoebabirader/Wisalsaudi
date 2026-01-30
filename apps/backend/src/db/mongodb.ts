import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wisal';
  
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    
    console.log('✅ Connected to MongoDB');
    
    // Create indexes
    await createIndexes(db);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✅ Disconnected from MongoDB');
  }
}

export function getMongoDB(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return db;
}

async function createIndexes(database: Db): Promise<void> {
  const productsCollection = database.collection('products');
  
  // Text search index for product name, description, and tags
  await productsCollection.createIndex(
    {
      name: 'text',
      nameAr: 'text',
      description: 'text',
      descriptionAr: 'text',
      tags: 'text',
    },
    {
      weights: {
        name: 10,
        nameAr: 10,
        tags: 5,
        description: 1,
        descriptionAr: 1,
      },
      name: 'product_text_search',
    }
  );
  
  // Index for category filtering
  await productsCollection.createIndex({ categoryId: 1 }, { name: 'category_index' });
  
  // Index for seller filtering
  await productsCollection.createIndex({ sellerId: 1 }, { name: 'seller_index' });
  
  // Index for price range filtering
  await productsCollection.createIndex({ price: 1 }, { name: 'price_index' });
  
  // Index for rating filtering
  await productsCollection.createIndex({ 'rating.average': -1 }, { name: 'rating_index' });
  
  // Index for status filtering
  await productsCollection.createIndex({ status: 1 }, { name: 'status_index' });
  
  // Index for stock availability
  await productsCollection.createIndex({ 'inventory.inStock': 1 }, { name: 'stock_index' });
  
  // Compound index for common queries
  await productsCollection.createIndex(
    { status: 1, 'inventory.inStock': 1, categoryId: 1 },
    { name: 'common_query_index' }
  );
  
  // Index for sorting by creation date
  await productsCollection.createIndex({ createdAt: -1 }, { name: 'created_date_index' });
  
  console.log('✅ MongoDB indexes created');
}
