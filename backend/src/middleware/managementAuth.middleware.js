const jwt = require('jsonwebtoken');
const { db, doc, getDoc, docToObj } = require('../db/firebase');

/**
 * Management Auth Middleware
 * Verifies the JWT token against the 'admins' collection (NOT 'users').
 * This ensures regular hotel owner tokens cannot access management routes.
 */
async function managementAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Management access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify this is a management token (has isMgmt flag and adminId)
    if (!decoded.isMgmt || !decoded.adminId) {
      return res.status(403).json({ message: 'Invalid management credentials. Access denied.' });
    }

    // Look up admin in the 'admins' collection
    const adminSnap = await getDoc(doc(db, 'admins', decoded.adminId));
    if (!adminSnap.exists()) {
      return res.status(401).json({ message: 'Admin account not found or deactivated.' });
    }

    const admin = docToObj(adminSnap);
    if (!admin.isActive) {
      return res.status(401).json({ message: 'Admin account deactivated.' });
    }

    req.admin = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid management token.' });
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Management session expired. Please log in again.' });
    return res.status(500).json({ message: 'Management authentication error.' });
  }
}

module.exports = managementAuth;
