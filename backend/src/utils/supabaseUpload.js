import { supabase, BUCKET_HIGHLIGHTS } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function uploadVideoToSupabase(filePath, fileName) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  const fileBuffer = fs.readFileSync(filePath);
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const { data, error } = await supabase.storage
    .from(BUCKET_HIGHLIGHTS)
    .upload(safeName, fileBuffer, {
      contentType: 'video/mp4',
      upsert: false,
    });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(BUCKET_HIGHLIGHTS).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export function unlinkSafe(filePath) {
  try {
    const full = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../../uploads', path.basename(filePath));
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch (_) {}
}
