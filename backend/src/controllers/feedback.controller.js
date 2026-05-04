const { db, collection, addDoc } = require('../db/firebase');

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
