const {
  db, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, docToObj, docsToArray,
} = require('../db/firebase');

/**
 * GET /api/menu/:hotelId — Public
 */
exports.getByHotel = async (req, res, next) => {
  try {
    const q = query(collection(db, 'menuItems'), where('hotelId', '==', req.params.hotelId));
    const snap = await getDocs(q);
    // Sort in memory to avoid Firestore composite index requirements
    let items = docsToArray(snap);
    items.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/menu — Owner only
 */
exports.create = async (req, res, next) => {
  try {
    const { name, category, price, image, description, isVeg, isAvailable } = req.body;
    const data = {
      hotelId: req.user.hotelId,
      name,
      category,
      price: Number(price),
      image: image || '',
      description: description || '',
      isVeg: isVeg !== undefined ? isVeg : true,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'menuItems'), data);

    // Notify clients
    const io = req.app.get('io');
    if (io) io.to(`hotel_${req.user.hotelId}`).emit('menu_update', { type: 'create' });

    res.status(201).json({ _id: ref.id, ...data });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/menu/:id — Owner only
 */
exports.update = async (req, res, next) => {
  try {
    const ref = doc(db, 'menuItems', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    if (updates.price) updates.price = Number(updates.price);
    await updateDoc(ref, updates);
    const updated = await getDoc(ref);

    // Notify clients
    const io = req.app.get('io');
    if (io) io.to(`hotel_${req.user.hotelId}`).emit('menu_update', { type: 'update' });

    res.json(docToObj(updated));
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/menu/:id — Owner only
 */
exports.remove = async (req, res, next) => {
  try {
    const ref = doc(db, 'menuItems', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }
    await deleteDoc(ref);

    // Notify clients
    const io = req.app.get('io');
    if (io) io.to(`hotel_${req.user.hotelId}`).emit('menu_update', { type: 'delete' });

    res.json({ message: 'Menu item deleted.', item: docToObj(snap) });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/menu/:id/toggle — Owner only
 */
exports.toggle = async (req, res, next) => {
  try {
    const ref = doc(db, 'menuItems', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }
    const newAvailability = !snap.data().isAvailable;
    await updateDoc(ref, { isAvailable: newAvailability });
    const updated = await getDoc(ref);

    // Notify clients
    const io = req.app.get('io');
    if (io) io.to(`hotel_${req.user.hotelId}`).emit('menu_update', { type: 'toggle' });

    res.json(docToObj(updated));
  } catch (err) {
    next(err);
  }
};
