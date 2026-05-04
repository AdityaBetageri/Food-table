const QRCode = require('qrcode');
const {
  db, collection, doc, addDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, where, docToObj, docsToArray,
} = require('../db/firebase');

exports.getAll = async (req, res, next) => {
  try {
    const q = query(collection(db, 'tables'), where('hotelId', '==', req.user.hotelId));
    const snap = await getDocs(q);
    const tables = docsToArray(snap).sort((a, b) => a.tableNumber - b.tableNumber);
    res.json(tables);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { tableNumber, capacity, customName } = req.body;
    if (!tableNumber) return res.status(400).json({ message: 'Table number is required.' });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const qrUrl = `${clientUrl}/menu?table=${tableNumber}&hotel=${req.user.hotelId}`;
    const qrCodeData = await QRCode.toDataURL(qrUrl, {
      width: 400, margin: 2, color: { dark: '#1B4F72', light: '#FFFFFF' }
    });

    const data = {
      hotelId: req.user.hotelId,
      tableNumber: Number(tableNumber),
      customName: customName || `Table ${tableNumber}`,
      capacity: Number(capacity) || 4,
      qrCodeUrl: qrUrl,
      qrCodeData,
      status: 'empty',
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'tables'), data);
    res.status(201).json({ _id: ref.id, ...data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const ref = doc(db, 'tables', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId) {
      return res.status(404).json({ message: 'Table not found.' });
    }
    const { customName } = req.body;
    await updateDoc(ref, { customName });
    res.json({ message: 'Table updated.' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const ref = doc(db, 'tables', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId) {
      return res.status(404).json({ message: 'Table not found.' });
    }
    await deleteDoc(ref);
    res.json({ message: 'Table deleted.', table: docToObj(snap) });
  } catch (err) { next(err); }
};

exports.getQR = async (req, res, next) => {
  try {
    const ref = doc(db, 'tables', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId) {
      return res.status(404).json({ message: 'Table not found.' });
    }
    let table = docToObj(snap);
    if (!table.qrCodeData) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const qrUrl = `${clientUrl}/menu?table=${table.tableNumber}&hotel=${req.user.hotelId}`;
      const qrCodeData = await QRCode.toDataURL(qrUrl, {
        width: 400, margin: 2, color: { dark: '#1B4F72', light: '#FFFFFF' }
      });
      await updateDoc(ref, { qrCodeUrl: qrUrl, qrCodeData });
      table.qrCodeUrl = qrUrl;
      table.qrCodeData = qrCodeData;
    }
    res.json({
      tableNumber: table.tableNumber,
      qrCodeUrl: table.qrCodeUrl,
      qrCodeData: table.qrCodeData,
    });
  } catch (err) { next(err); }
};
