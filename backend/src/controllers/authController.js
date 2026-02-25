import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export async function registerUser(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ email, password, name: name || email.split('@')[0] });
    const token = signToken({ id: user._id, role: 'user' });
    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken({ id: user._id, role: 'user' });
    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function requestAdminOTP(req, res, next) {
  try {
    const { email, name, password, sportCategory } = req.body;

    // Validate required fields
    if (!email || !name || !password || !sportCategory) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, password and sport category are required',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const sportLower = sportCategory.trim().toLowerCase();

    // Check if admin already exists for this sport
    const existingActive = await Admin.findOne({ sportCategory: sportLower, isActive: true });
    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: 'Sport already managed by another admin',
      });
    }

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Generate unique admin code using crypto
    const randomBytes = crypto.randomBytes(6).toString('hex').toUpperCase();
    const sportPrefix = sportLower.slice(0, 6).toUpperCase();
    const adminCode = `${sportPrefix}-${randomBytes}`;

    // Create new admin
    const admin = await Admin.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password, // Will be hashed by pre-save hook
      sportCategory: sportLower,
      adminCode,
      isActive: true,
    });

    // Generate JWT token
    const token = signToken({ id: admin._id, role: 'admin', sportCategory: admin.sportCategory });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      adminCode,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        sportCategory: admin.sportCategory,
        role: 'admin',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyAdminOTP(req, res, next) {
  // This endpoint is deprecated - use /admin/signup instead
  res.status(410).json({
    success: false,
    message: 'This endpoint is deprecated. Please use /api/auth/admin/signup instead.',
  });
}

export async function loginAdmin(req, res, next) {
  try {
    const { email, password, adminCode } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }
    if (!adminCode) {
      return res.status(400).json({ success: false, message: 'Admin code is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = adminCode.trim().toUpperCase();

    // Find admin by email and include password
    const admin = await Admin.findOne({ email: normalizedEmail, isActive: true }).select('+password');
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email' });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Verify admin code
    if (admin.adminCode !== normalizedCode) {
      return res.status(401).json({ success: false, message: 'Invalid admin code' });
    }

    // Generate JWT token
    const token = signToken({ id: admin._id, role: 'admin', sportCategory: admin.sportCategory });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        sportCategory: admin.sportCategory,
        role: 'admin',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    if (req.role === 'admin') {
      return res.json({
        success: true,
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          sportCategory: req.user.sportCategory,
          role: 'admin',
        },
      });
    }
    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: 'user',
      },
    });
  } catch (err) {
    next(err);
  }
}
