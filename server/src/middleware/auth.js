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

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Missing Bearer token.' });
  }

  // TODO: Naisha - implement jwt.verify(token, process.env.JWT_SECRET)
  // For now in scaffold: mock decode
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Invalid token format.' });
  }

  // Temporary stub for development: pass through
  next();
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    // TODO: Naisha - check req.user.role in allowedRoles
    // if (!req.user || !allowedRoles.includes(req.user.role)) {
    //   return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
    // }
    next();
  };
};
