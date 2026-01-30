/**
 * Database Migration Runner
 * Executes SQL migration files in order
 */

import fs from 'fs';
import path from 'path';
import { query, closePool } from '../postgres';

const MIGRATIONS_DIR = __dirname;

async function runMigrations() {
  console.log('🔄 Starting database migrations...');

  try {
    // Create migrations tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Get list of migration files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('ℹ️  No migration files found');
      return;
    }

    // Get already executed migrations
    const result = await query('SELECT filename FROM migrations');
    const executedMigrations = new Set(
      result.rows.map((row: any) => row.filename)
    );

    // Execute pending migrations
    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`▶️  Executing ${file}...`);
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        await query(sql);
        await query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
        console.log(`✅ ${file} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing ${file}:`, error);
        throw error;
      }
    }

    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration process failed:', error);
      process.exit(1);
    });
}

export default runMigrations;
