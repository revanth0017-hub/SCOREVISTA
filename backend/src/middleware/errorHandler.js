export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000) {
    // Mongo duplicate key error. `keyPattern` is present for newer drivers, but some
    // versions/contexts only include `keyValue`.  Use whichever is available so the
    // frontend can show a field-specific message.
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    return res.status(409).json({ success: false, message: 'Duplicate value', field });
  }
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}
