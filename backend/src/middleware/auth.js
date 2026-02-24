const jwt = require('jsonwebtoken');
const { db } = require('../migrate');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  // Fast-fail for missing bearer headers to make 401 causes obvious in API clients.
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = header.split(' ')[1];
    // `JWT_SECRET` mismatch between issued token and runtime env is a common 401 source.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Treat inactive users as unauthorized so disabled accounts lose access immediately.
    const user = db.prepare('SELECT * FROM users WHERE user_id = ? AND status = ?').get(decoded.userId, 'active');
    if (!user) return res.status(401).json({ error: 'User not found or inactive' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    // Role-name string mismatches are the most common RBAC bug; inspect req.user.role first.
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function auditLog(entityType, action) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Audit logging is intentionally non-blocking so business endpoints still return
      // even if audit insert fails (e.g., transient DB write issue).
      if (res.statusCode < 400 && req.user) {
        try {
          const { v4: uuidv4 } = require('uuid');
          db.prepare(`
            INSERT INTO audit_logs (log_id, entity_type, entity_id, action, performed_by_user_id, performed_by_institution_id, ip_address, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            uuidv4(),
            entityType,
            data?.request_id || data?.institution_id || data?.individual_id || req.params.id || 'system',
            action,
            req.user.user_id,
            req.user.institution_id,
            req.ip,
            JSON.stringify({ method: req.method, path: req.path })
          );
        } catch (e) { /* don't fail request on audit error */ }
      }
      return originalJson(data);
    };
    next();
  };
}

module.exports = { authenticate, authorize, auditLog };
