const validate = (schema) => (req, res, next) => {
  try {
    // Log the raw body before parsing to capture incoming payload types
    try {
      console.debug('Validating request for', req.method, req.originalUrl, 'raw body:', req.body);
    } catch (logErr) {}

    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    // Debug: log the request body and validation error to help diagnose failures
    try {
      console.debug('Validation failed for', req.method, req.originalUrl, 'body:', req.body);
      if (err && Array.isArray(err.errors)) console.debug('Zod errors:', err.errors);
      else console.debug('Validation error:', err && err.message ? err.message : err);
    } catch (logErr) {
      // ignore logging errors
    }

    // Guard against Zod-like errors
    if (err && Array.isArray(err.errors)) {
      return res.status(400).json({
        errors: err.errors.map(e => ({
          field: e.path && e.path.length ? e.path.join('.') : null,
          message: e.message,
        })),
      });
    }

    return res.status(400).json({
      errors: [
        {
          field: null,
          message: err && err.message ? err.message : 'Invalid request',
        },
      ],
    });
  }
};

module.exports = validate;