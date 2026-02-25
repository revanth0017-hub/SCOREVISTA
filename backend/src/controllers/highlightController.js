import Highlight from '../models/Highlight.js';
import { uploadVideoToSupabase, unlinkSafe } from '../utils/supabaseUpload.js';

export async function list(req, res, next) {
  try {
    const { sport } = req.query;
    const filter = {};
    if (sport) filter.sport = sport.trim().toLowerCase();
    const list = await Highlight.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const doc = await Highlight.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Highlight not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { title, sport, description, duration, date } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    
    const sportVal = (sport || req.sport || '').trim() || 'general';
    let videoUrl = req.body.videoUrl;
    
    // Handle file upload if present
    if (req.file?.path) {
      try {
        console.log('Uploading video to Supabase:', req.file.filename);
        videoUrl = await uploadVideoToSupabase(req.file.path, req.file.filename);
        console.log('Video uploaded successfully:', videoUrl);
      } catch (uploadErr) {
        console.error('Supabase upload error:', uploadErr);
        unlinkSafe(req.file.path);
        const msg = uploadErr.message || 'Video upload failed';
        return res.status(500).json({ 
          success: false, 
          message: `Video upload failed: ${msg}`,
          details: uploadErr.message
        });
      } finally {
        unlinkSafe(req.file.path);
      }
    }
    
    if (!videoUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Video URL or file required' 
      });
    }
    
    const doc = await Highlight.create({
      title,
      sport: sportVal,
      description,
      videoUrl,
      thumbnailUrl: req.body.thumbnailUrl,
      duration,
      views: 0,
      date: date || new Date().toISOString().split('T')[0],
    });
    
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (req.file?.path) unlinkSafe(req.file.path);
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await Highlight.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Highlight not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await Highlight.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Highlight not found' });
    res.json({ success: true, message: 'Highlight deleted' });
  } catch (err) {
    next(err);
  }
}
