const bcrypt = require('bcryptjs');
const {
  db, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, docToObj, docsToArray,
} = require('../db/firebase');

exports.getAll = async (req, res, next) => {
  try {
    const q = query(
      collection(db, 'users'), 
      where('hotelId', '==', req.user.hotelId),
      where('role', 'in', ['chef', 'waiter', 'cashier'])
    );
    const snap = await getDocs(q);
    const staff = docsToArray(snap).map(u => { delete u.password; return u; }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(staff);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const existing = await getDocs(q);
    if (!existing.empty) return res.status(400).json({ message: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const data = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone: phone || '',
      hotelId: req.user.hotelId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'users'), data);
    const staffObj = { _id: ref.id, ...data };
    delete staffObj.password;
    res.status(201).json(staffObj);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const ref = doc(db, 'users', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId || snap.data().role === 'owner') {
      return res.status(404).json({ message: 'Staff member not found.' });
    }
    await updateDoc(ref, { isActive: !snap.data().isActive });
    const updated = docToObj(await getDoc(ref));
    delete updated.password;
    res.json({ message: 'Staff status updated.', staff: updated });
  } catch (err) { next(err); }
};

exports.hardDelete = async (req, res, next) => {
  try {
    const ref = doc(db, 'users', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId || snap.data().role === 'owner') {
      return res.status(404).json({ message: 'Staff member not found.' });
    }
    await deleteDoc(ref);
    res.json({ message: 'Staff member permanently deleted.' });
  } catch (err) { next(err); }
};
