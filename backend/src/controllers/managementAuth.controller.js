const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  db, collection, doc, addDoc, getDoc, getDocs,
  query, where, docToObj, docsToArray
} = require('../db/firebase');

/**
 * Generate JWT token for admin users
 * Uses a distinct payload shape so it can't be confused with regular user tokens
 */
function generateAdminToken(admin) {
  return jwt.sign(
    { adminId: admin._id, role: 'superadmin', isMgmt: true },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * POST /api/management/auth/login
 * Authenticates against the separate 'admins' collection
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Query the 'admins' collection — completely separate from 'users'
    const q = query(collection(db, 'admins'), where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);

    if (snap.empty) {
      return res.status(401).json({ message: 'Invalid credentials. Access restricted.' });
    }

    const adminDoc = snap.docs[0];
    const adminData = adminDoc.data();

    if (!adminData.isActive) {
      return res.status(403).json({ message: 'This admin account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, adminData.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Access restricted.' });
    }

    const admin = { _id: adminDoc.id, ...adminData };
    const token = generateAdminToken(admin);

    res.json({
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'superadmin',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/management/auth/me
 * Returns the currently authenticated admin's info
 */
exports.getMe = async (req, res, next) => {
  try {
    res.json({
      admin: {
        _id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: 'superadmin',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/management/auth/register
 * Creates a new admin account. Requires the MGMT_SETUP_KEY for authorization.
 * Any team member with the setup key can register.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, setupKey } = req.body;

    // Require a setup key from environment variable for security
    if (setupKey !== process.env.MGMT_SETUP_KEY) {
      return res.status(403).json({ message: 'Invalid setup key. Contact your team lead for the key.' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if this email is already registered as admin
    const q = query(collection(db, 'admins'), where('email', '==', email.toLowerCase()));
    const existingSnap = await getDocs(q);
    if (!existingSnap.empty) {
      return res.status(400).json({ message: 'An admin with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const adminRef = await addDoc(collection(db, 'admins'), {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    // Auto-login after registration
    const admin = { _id: adminRef.id, name, email: email.toLowerCase(), role: 'superadmin' };
    const token = generateAdminToken(admin);

    res.status(201).json({
      message: 'Admin account created successfully.',
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'superadmin',
      },
    });
  } catch (err) {
    next(err);
  }
};
