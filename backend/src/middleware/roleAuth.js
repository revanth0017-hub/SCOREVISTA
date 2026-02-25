export const requireUser = (req, res, next) => {
  if (req.role !== 'user') {
    return res.status(403).json({ success: false, message: 'User access required' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  console.log('requireAdmin check:', { role: req.role, userId: req.user?._id });
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

export const requireAdminSport = (req, res, next) => {
  console.log('requireAdminSport check:', { 
    role: req.role, 
    sport: req.sport,
    sportCategory: req.sportCategory,
    userId: req.user?._id,
    userSport: req.user?.sportCategory 
  });
  if (req.role !== 'admin' || !req.sport) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin sport context required. Please log out and log in again.' 
    });
  }
  next();
};

export const adminSportMatch = (paramKey = 'sport') => (req, res, next) => {
  const resourceSport = (req.params[paramKey] || req.query[paramKey] || req.body?.sport || '').toLowerCase();
  if (req.role === 'admin' && req.sport && resourceSport && req.sport !== resourceSport) {
    return res.status(403).json({ success: false, message: 'Access limited to your assigned sport' });
  }
  next();
};
