const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  db, collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, docToObj, docsToArray, auth
} = require('../db/firebase');
const { sendPasswordResetEmail } = require('firebase/auth');

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

/**
 * Helper to call Firebase Auth REST API
 */
async function callFirebaseREST(action, body) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${FIREBASE_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error?.message || 'Firebase Auth Error');
    error.code = data.error?.message;
    throw error;
  }
  return data;
}

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role, hotelId: user.hotelId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Build user response object matching frontend expectations
 */
async function buildUserResponse(user) {
  const userObj = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    hotelId: user.hotelId,
  };
  if (user.hotelId) {
    const hotelSnap = await getDoc(doc(db, 'hotels', user.hotelId));
    if (hotelSnap.exists()) {
      const hotel = hotelSnap.data();
      userObj.hotelName = hotel.name;
      userObj.city = hotel.city || '';
      userObj.hotel = {
        name: hotel.name,
        address: hotel.address || '',
        city: hotel.city || '',
        timings: hotel.timings || { open: '09:00', close: '23:00' },
        settings: hotel.settings || { acceptOrders: true, playSound: true, autoPrint: false }
      };
    }
  }
  return userObj;
}

/**
 * PUT /api/auth/hotel
 */
exports.updateHotel = async (req, res, next) => {
  try {
    const hotelId = req.user.hotelId;
    if (!hotelId) return res.status(403).json({ message: 'No hotel associated with this account' });

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.address !== undefined) updates.address = req.body.address;
    if (req.body.city !== undefined) updates.city = req.body.city;
    if (req.body.timings !== undefined) updates.timings = req.body.timings;
    if (req.body.settings !== undefined) updates.settings = req.body.settings;

    await updateDoc(doc(db, 'hotels', hotelId), updates);
    res.json({ message: 'Hotel updated successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, hotelName, email, phone, city, password } = req.body;

    // Check if email exists
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Also create user in Firebase Authentication so password reset works
    try {
      await callFirebaseREST('signUp', {
        email: email.toLowerCase(),
        password: password,
        returnSecureToken: false
      });
    } catch (authErr) {
      // If user already exists in Auth but not in our Firestore, we can proceed
      if (!authErr.message.includes('EMAIL_EXISTS')) {
        console.error('Firebase Auth Registration Error:', authErr.message);
        // We don't block the whole registration if Auth fails (maybe it's already there),
        // but we should probably know.
      }
    }

    // Create hotel first (with pending approval)
    const hotelRef = await addDoc(collection(db, 'hotels'), {
      name: hotelName || `${name}'s Restaurant`,
      city: city || '',
      phone: phone || '',
      isActive: false, // inactive until approved
      approvalStatus: 'pending',
      timings: { open: '09:00', close: '23:00' },
      logo: '',
      address: '',
      createdAt: new Date().toISOString(),
    });

    // Create user linked to hotel (with pending approval)
    const userRef = await addDoc(collection(db, 'users'), {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'owner',
      phone: phone || '',
      hotelId: hotelRef.id,
      isActive: true,
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
    });

    // Update hotel with ownerId
    await updateDoc(doc(db, 'hotels', hotelRef.id), { ownerId: userRef.id });

    // Create access request notification for management dashboard
    await addDoc(collection(db, 'accessRequests'), {
      hotelId: hotelRef.id,
      hotelName: hotelName || `${name}'s Restaurant`,
      ownerId: userRef.id,
      ownerName: name,
      ownerEmail: email.toLowerCase(),
      phone: phone || '',
      city: city || '',
      status: 'pending',
      message: `${name} registered ${hotelName || 'a new restaurant'} and is requesting access to the platform.`,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      approvalStatus: 'pending',
      message: "We received your request, we'll reach you soon.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userDoc = snap.docs[0];
    const userData = userDoc.data();

    if (!userData.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated.' });
    }

    // Check approval status
    const approvalStatus = userData.approvalStatus || 'accepted'; // legacy users treated as accepted
    if (approvalStatus === 'pending') {
      return res.status(403).json({
        message: "We received your request, we'll reach you soon.",
        approvalStatus: 'pending',
      });
    }
    if (approvalStatus === 'denied') {
      return res.status(403).json({
        message: 'Your access request has been denied. Please contact support for more information.',
        approvalStatus: 'denied',
      });
    }

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = { _id: userDoc.id, ...userData };
    const token = generateToken(user);
    const userResponse = await buildUserResponse(user);

    res.json({ token, user: userResponse });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const userResponse = await buildUserResponse(req.user);
    res.json({ user: userResponse });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-email
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    
    // Check if the user exists in our Firestore database
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);
    
    // For security, always return success even if user not in Firestore
    if (snap.empty) {
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }
    
    try {
      // Use REST API to send password reset email
      await callFirebaseREST('sendOobCode', {
        requestType: 'PASSWORD_RESET',
        email: email.toLowerCase()
      });
      console.log(`Password reset email sent to: ${email}`);
    } catch (firebaseErr) {
      console.error('Firebase Auth Error (Reset Password):', firebaseErr.message);
      
      // If user not found in Auth but exists in Firestore, we should probably tell them to register properly or handle it
      if (firebaseErr.message === 'EMAIL_NOT_FOUND') {
        // Attempt to "provision" them in Auth if they exist in Firestore? 
        // We don't have their password, so we can't.
        return res.status(400).json({ 
          message: 'This account was created before email integration. Please contact support or register again.' 
        });
      }
      
      return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }

    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    next(err);
  }
};
