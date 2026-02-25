import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('JWT_SECRET not set. Auth will fail.');
}

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('+password');
      if (!admin || !admin.isActive) {
        console.log('Admin auth failed:', { adminId: decoded.id, found: !!admin, active: admin?.isActive });
        return res.status(401).json({ success: false, message: 'Invalid or inactive admin' });
      }
      console.log('Admin authenticated:', { 
        id: admin._id, 
        email: admin.email, 
        sportCategory: admin.sportCategory 
      });
      req.user = admin;
      req.role = 'admin';
      req.sport = admin.sportCategory;
      req.sportCategory = admin.sportCategory;
    } else {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
      req.role = 'user';
    }
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    next(err);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return next();
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (admin?.isActive) {
        req.user = admin;
        req.role = 'admin';
        req.sport = admin.sportCategory;
        req.sportCategory = admin.sportCategory;
      }
    } else {
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        req.role = 'user';
      }
    }
    next();
  } catch {
    next();
  }
};
