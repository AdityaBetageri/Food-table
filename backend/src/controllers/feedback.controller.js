const { db, collection, addDoc, getDocs, query, where, docsToArray } = require('../db/firebase');

exports.submit = async (req, res, next) => {
  try {
    const { orderId, hotelId, rating, foodRating, comment } = req.body;
    if (!hotelId || !rating) return res.status(400).json({ message: 'hotelId and rating are required.' });

    const data = {
      orderId: orderId || null,
      hotelId,
      rating: Number(rating),
      foodRating: foodRating ? Number(foodRating) : null,
      comment: comment || '',
      createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'feedback'), data);
    res.status(201).json({ _id: ref.id, ...data });
  } catch (err) { next(err); }
};

exports.getAllForHotel = async (req, res, next) => {
  try {
    const q = query(collection(db, 'feedback'), where('hotelId', '==', req.user.hotelId));
    const snap = await getDocs(q);
    const feedbackList = docsToArray(snap).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(feedbackList);
  } catch (err) { next(err); }
};

