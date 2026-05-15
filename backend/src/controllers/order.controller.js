const {
  db, collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, docToObj, docsToArray,
} = require('../db/firebase');

exports.create = async (req, res, next) => {
  try {
    const { hotelId, tableNumber, items, specialInstructions, orderId } = req.body;
    if (!hotelId || !tableNumber || !items || items.length === 0) {
      return res.status(400).json({ message: 'hotelId, tableNumber, and items are required.' });
    }

    // If orderId is provided, try to append to that specific order
    if (orderId) {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const activeOrder = { _id: orderSnap.id, ...orderSnap.data() };
        
        // Only append if it's not paid yet
        if (activeOrder.status !== 'paid') {
          const additionalTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
          const newTotal = activeOrder.total + additionalTotal;
          
          const updatedItems = [...activeOrder.items];
          
          items.forEach(newItem => {
            // Always add as a new line item for additions to help the chef identify new orders
            updatedItems.push({ 
              ...newItem, 
              isAddition: true, 
              status: 'new',
              addedAt: new Date().toISOString() 
            });
          });

          await updateDoc(orderRef, {
            items: updatedItems,
            total: newTotal,
            updatedAt: new Date().toISOString(),
            status: 'new',
            isUpdated: true
          });

          const updatedOrder = { ...activeOrder, items: updatedItems, total: newTotal, status: 'new', isUpdated: true };
          
          const io = req.app.get('io');
          if (io) {
            io.to(`hotel_${hotelId}`).emit('new_order', updatedOrder);
          }
          return res.status(200).json(updatedOrder);
        }
      }
    }

    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const q = query(collection(db, 'tables'), where('hotelId', '==', hotelId), where('tableNumber', '==', Number(tableNumber)));
    const tableSnap = await getDocs(q);
    let tableId = null;
    let tableDocRef = null;
    if (!tableSnap.empty) {
      tableId = tableSnap.docs[0].id;
      tableDocRef = doc(db, 'tables', tableId);
    }

    // Generate unique sequential order number from 1 for this hotel
    const qCount = query(collection(db, 'orders'), where('hotelId', '==', hotelId));
    const countSnap = await getDocs(qCount);
    const orderNumber = countSnap.size + 1;

    const orderData = {
      hotelId,
      tableId,
      tableNumber: Number(tableNumber),
      orderNumber,
      items: items.map(item => ({ ...item, status: 'new' })),
      total,
      specialInstructions: specialInstructions || '',
      status: 'new',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    const order = { _id: orderRef.id, ...orderData };

    if (tableDocRef) {
      await updateDoc(tableDocRef, { status: 'active' });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`hotel_${hotelId}`).emit('new_order', order);
    }
    res.status(201).json(order);
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    let q = query(collection(db, 'orders'), where('hotelId', '==', req.user.hotelId));
    if (req.query.status) {
      q = query(q, where('status', '==', req.query.status));
    }
    const snap = await getDocs(q);
    let orders = docsToArray(snap);

    if (req.query.date) {
      const start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);
      orders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ orders });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const ref = doc(db, 'orders', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json(docToObj(snap));
  } catch (err) { next(err); }
};

exports.getPublicOrder = async (req, res, next) => {
  try {
    const ref = doc(db, 'orders', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    const order = docToObj(snap);
    // Return only necessary info for the customer
    res.json({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt
    });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'preparing', 'ready', 'served', 'paid'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be: ${validStatuses.join(', ')}` });
    }

    const ref = doc(db, 'orders', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const updates = { status, updatedAt: new Date().toISOString() };
    if (status === 'paid') {
      updates.paymentStatus = 'paid';
    }

    // Clear 'isAddition' flag from items and reset 'isUpdated' when moving away from 'new' status
    // This ensures that only actually new items in the next update will have the 'NEW' badge
    if (status !== 'new') {
      const items = snap.data().items || [];
      updates.items = items.map(item => {
        const itemStatus = (item.status === 'served' || item.status === 'paid') ? item.status : status;
        return { ...item, isAddition: false, status: itemStatus };
      });
      updates.isUpdated = false;
    }

    await updateDoc(ref, updates);
    const order = docToObj(await getDoc(ref));

    if (order.tableId) {
      const tableRef = doc(db, 'tables', order.tableId);
      const tableSnap = await getDoc(tableRef);
      if (tableSnap.exists()) {
        let tableStatus = 'active';
        if (status === 'paid') tableStatus = 'empty';
        else if (status === 'served') tableStatus = 'awaiting_payment';

        await updateDoc(tableRef, { status: tableStatus });

        const io = req.app.get('io');
        if (io) {
          io.to(`hotel_${order.hotelId}`).emit('table_status_update', {
            tableId: order.tableId,
            tableNumber: order.tableNumber,
            status: tableStatus,
          });
        }
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`hotel_${order.hotelId}`).emit('order_status_update', {
        orderId: order._id,
        status: order.status,
        order,
      });
      if (status === 'ready') {
        io.to(`hotel_${order.hotelId}`).emit('order_ready', {
          orderId: order._id,
          tableNumber: order.tableNumber,
          order,
        });
      }
    }
    res.json(order);
  } catch (err) { next(err); }
};

exports.updatePayment = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ['pending', 'cash', 'online', 'paid'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: `Invalid payment status. Must be: ${validStatuses.join(', ')}` });
    }

    const ref = doc(db, 'orders', req.params.id);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().hotelId !== req.user.hotelId) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const updates = { paymentStatus, updatedAt: new Date().toISOString() };
    if (['cash', 'online', 'paid'].includes(paymentStatus)) {
      updates.status = 'paid';
      
      // Clear 'isAddition' flag from items and reset 'isUpdated' when order is finalized
      const items = snap.data().items || [];
      updates.items = items.map(item => ({ ...item, isAddition: false, status: 'paid' }));
      updates.isUpdated = false;
    }

    await updateDoc(ref, updates);
    const order = docToObj(await getDoc(ref));

    const io = req.app.get('io');
    if (io) {
      io.to(`hotel_${order.hotelId}`).emit('payment_confirmed', {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        order,
      });
    }
    res.json(order);
  } catch (err) { next(err); }
};
