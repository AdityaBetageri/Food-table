const jwt = require('jsonwebtoken');
const { db, doc, getDoc, docToObj } = require('../db/firebase');

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userSnap = await getDoc(doc(db, 'users', decoded.userId));
    if (!userSnap.exists()) {
      return res.status(401).json({ message: 'Invalid token or account deactivated.' });
    }
    
    const user = docToObj(userSnap);
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated.' });
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hotelId: user.hotelId,
      phone: user.phone,
    };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token.' });
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired.' });
    return res.status(500).json({ message: 'Authentication error.' });
  }
}
module.exports = auth;
