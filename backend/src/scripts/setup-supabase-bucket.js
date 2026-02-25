import '../config/env.js';
import { supabase, BUCKET_HIGHLIGHTS } from '../config/supabase.js';

async function setupBucket() {
  if (!supabase) {
    console.error('❌ Supabase is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      process.exit(1);
    }

    const bucketExists = buckets.some(b => b.name === BUCKET_HIGHLIGHTS);

    if (bucketExists) {
      console.log(`✅ Bucket "${BUCKET_HIGHLIGHTS}" already exists`);
    } else {
      console.log(`📦 Creating bucket "${BUCKET_HIGHLIGHTS}"...`);
      
      const { data, error: createError } = await supabase.storage.createBucket(BUCKET_HIGHLIGHTS, {
        public: true,
        fileSizeLimit: 200 * 1024 * 1024, // 200MB
        allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime']
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        process.exit(1);
      }

      console.log(`✅ Bucket "${BUCKET_HIGHLIGHTS}" created successfully`);
    }

    // Test upload permissions
    console.log('🔍 Testing upload permissions...');
    const testFileName = `test-${Date.now()}.txt`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_HIGHLIGHTS)
      .upload(testFileName, 'test content', { upsert: true });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      process.exit(1);
    }

    // Clean up test file
    await supabase.storage.from(BUCKET_HIGHLIGHTS).remove([testFileName]);
    console.log('✅ Upload permissions verified');
    console.log('\n✨ Supabase bucket setup complete!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

setupBucket();
