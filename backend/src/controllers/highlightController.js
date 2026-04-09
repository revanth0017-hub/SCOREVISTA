import mongoose from 'mongoose';
import Highlight from '../models/Highlight.js';
import Sport from '../models/Sport.js';
import { uploadVideoToSupabase, unlinkSafe } from '../utils/supabaseUpload.js';

export async function list(req, res, next) {
  try {
    const { sportId } = req.query;
    if (!sportId) return res.status(400).json({ success: false, message: 'sportId query param is required' });
    if (!mongoose.Types.ObjectId.isValid(sportId)) {
      return res.status(400).json({ success: false, message: 'Invalid sportId' });
    }
    const list = await Highlight.find({ sport: sportId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list, message: 'Highlights fetched' });
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
    const { title, sportId, matchId, description, duration, date } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title required' });
    if (!sportId) return res.status(400).json({ success: false, message: 'sportId required' });
    if (!mongoose.Types.ObjectId.isValid(sportId)) return res.status(400).json({ success: false, message: 'Invalid sportId' });
    if (matchId && !mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ success: false, message: 'Invalid matchId' });
    }

    const sportDoc = await Sport.findById(sportId).lean();
    if (!sportDoc) return res.status(404).json({ success: false, message: 'Sport not found' });

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
      title: title.trim(),
      sport: sportId,
      match: matchId || undefined,
      description,
      videoUrl,
      thumbnailUrl: req.body.thumbnailUrl,
      duration,
      views: 0,
      date: date || new Date().toISOString().split('T')[0],
    });
    
    const io = req.app.get('io');
    if (io) io.emit('highlightAdded', doc);
    res.status(201).json({ success: true, data: doc, message: 'Highlight created' });
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
