import 'dotenv/config';
import { supabase, BUCKET_HIGHLIGHTS } from '../config/supabase.js';

async function testSupabase() {
  console.log('Testing Supabase connection...\n');
  
  console.log('Environment variables:');
  console.log(`  SUPABASE_URL: ${process.env.SUPABASE_URL || 'NOT SET'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '***' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-10) : 'NOT SET'}`);
  console.log();
  
  if (!supabase) {
    console.error('❌ Supabase client is not initialized');
    console.error('   Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }
  
  console.log('✅ Supabase client initialized');
  console.log(`   Bucket name: ${BUCKET_HIGHLIGHTS}\n`);
  
  try {
    // Test 1: List buckets
    console.log('Test 1: Listing all buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      throw listError;
    }
    
    console.log(`✅ Found ${buckets.length} buckets:`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    console.log();
    
    // Test 2: Check if our bucket exists
    const bucketExists = buckets.some(b => b.name === BUCKET_HIGHLIGHTS);
    if (!bucketExists) {
      console.error(`❌ Bucket '${BUCKET_HIGHLIGHTS}' not found!`);
      console.log('   Creating bucket...');
      
      const { error: createError } = await supabase.storage.createBucket(BUCKET_HIGHLIGHTS, {
        public: true,
        fileSizeLimit: 209715200 // 200MB
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        throw createError;
      }
      console.log(`✅ Bucket '${BUCKET_HIGHLIGHTS}' created successfully`);
    } else {
      console.log(`✅ Bucket '${BUCKET_HIGHLIGHTS}' exists`);
    }
    console.log();
    
    // Test 3: Try to list files in the bucket
    console.log(`Test 3: Listing files in '${BUCKET_HIGHLIGHTS}'...`);
    const { data: files, error: filesError } = await supabase.storage
      .from(BUCKET_HIGHLIGHTS)
      .list();
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError.message);
      throw filesError;
    }
    
    console.log(`✅ Successfully accessed bucket (${files.length} files found)`);
    if (files.length > 0) {
      files.slice(0, 5).forEach(file => {
        console.log(`   - ${file.name}`);
      });
    }
    console.log();
    
    // Test 4: Get public URL format
    const { data: urlData } = supabase.storage
      .from(BUCKET_HIGHLIGHTS)
      .getPublicUrl('test.mp4');
    
    console.log('✅ Public URL format:');
    console.log(`   ${urlData.publicUrl}`);
    console.log();
    
    console.log('🎉 All tests passed! Supabase is properly configured.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause.message || error.cause);
    }
    if (error.statusCode) {
      console.error(`   Status code: ${error.statusCode}`);
    }
    if (error.stack && error.message === 'fetch failed') {
      console.error('\n   This usually means:');
      console.error('   1. Network/firewall blocking the request');
      console.error('   2. Supabase URL is incorrect');
      console.error('   3. No internet connection');
    }
    process.exit(1);
  }
}

testSupabase();
