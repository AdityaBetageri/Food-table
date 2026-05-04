/**
 * Role-based Authorization Middleware Factory
 * Usage: roleGuard('owner', 'chef') — allows only those roles
 * Must be used AFTER auth middleware (req.user must exist)
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
}

module.exports = roleGuard;
