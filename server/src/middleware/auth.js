/**
 * ============================================================================
 * TODO: NAISHA - Authentication & Role-Based Access Middleware
 * ============================================================================
 * 1. authenticate(req, res, next):
 *    - Extract Bearer token from req.headers.authorization
 *    - Verify token using jsonwebtoken (JWT_SECRET from .env)
 *    - Attach decoded user object { id, name, email, role } to req.user
 *    - Return 401 if missing or invalid token
 *
 * 2. requireRole(allowedRoles):
 *    - High-order middleware: (allowedRoles) => (req, res, next) => ...
 *    - Verify req.user exists and req.user.role is in allowedRoles array
 *    - Return 403 { message: "Access forbidden: insufficient role permissions" } if unauthorized
 */
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer '))
    return res.status(401).json({ message: 'Authentication required. Missing Bearer token.' });
  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const requireRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role))
    return res.status(403).json({ message: 'Access forbidden: insufficient role permissions' });
  next();
};