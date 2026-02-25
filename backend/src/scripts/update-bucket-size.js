import 'dotenv/config';
import { supabase, BUCKET_HIGHLIGHTS } from '../config/supabase.js';

async function updateBucketSize() {
  console.log('Updating bucket file size limit...\n');
  
  if (!supabase) {
    console.error('❌ Supabase not configured');
    process.exit(1);
  }

  try {
    // Update bucket to allow larger files (500MB)
    const { data, error } = await supabase.storage.updateBucket(BUCKET_HIGHLIGHTS, {
      public: true,
      fileSizeLimit: 524288000, // 500MB in bytes
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
    });

    if (error) {
      console.error('❌ Error updating bucket:', error.message);
      process.exit(1);
    }

    console.log('✅ Bucket updated successfully!');
    console.log('   New file size limit: 500MB');
    console.log('   Allowed mime types: video/mp4, video/webm, video/quicktime, video/x-matroska');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

updateBucketSize();
