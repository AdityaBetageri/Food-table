const {
  db, collection, getDocs, query, where, docsToArray
} = require('../db/firebase');

exports.getSummary = async (req, res, next) => {
  try {
    const hotelId = req.user.hotelId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const ordersSnap = await getDocs(query(collection(db, 'orders'), where('hotelId', '==', hotelId)));
    const allOrders = docsToArray(ordersSnap);
    
    const todayOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= today && d <= endOfDay;
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

    const statusCounts = { new: 0, preparing: 0, ready: 0, served: 0, paid: 0 };
    todayOrders.forEach(o => {
      if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
    });

    const itemCounts = {};
    allOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { name: item.name, qty: 0, revenue: 0 };
        }
        itemCounts[item.name].qty += item.qty;
        itemCounts[item.name].revenue += item.price * item.qty;
      });
    });
    const topItems = Object.values(itemCounts).sort((a, b) => b.qty - a.qty).slice(0, 10);

    const weeklyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= day && d <= dayEnd;
      });
      weeklyRevenue.push({
        date: day.toISOString().split('T')[0],
        day: day.toLocaleDateString('en', { weekday: 'short' }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      });
    }

    const feedbackSnap = await getDocs(query(collection(db, 'feedback'), where('hotelId', '==', hotelId)));
    const feedback = docsToArray(feedbackSnap);
    const avgRating = feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : 0;

    res.json({
      todayRevenue, totalRevenue, todayOrderCount: todayOrders.length, totalOrderCount: allOrders.length,
      statusCounts, topItems, weeklyRevenue, avgRating: parseFloat(avgRating), feedbackCount: feedback.length,
    });
  } catch (err) { next(err); }
};

exports.getExportData = async (req, res, next) => {
  try {
    const hotelId = req.user.hotelId;

    // Support both ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD and legacy ?days=N
    let since, until;
    if (req.query.startDate && req.query.endDate) {
      since = new Date(req.query.startDate);
      since.setHours(0, 0, 0, 0);
      until = new Date(req.query.endDate);
      until.setHours(23, 59, 59, 999);
    } else {
      const days = parseInt(req.query.days, 10) || 7;
      since = new Date();
      since.setDate(since.getDate() - (days - 1));
      since.setHours(0, 0, 0, 0);
      until = new Date();
      until.setHours(23, 59, 59, 999);
    }

    const ordersSnap = await getDocs(query(collection(db, 'orders'), where('hotelId', '==', hotelId)));
    const allOrders = docsToArray(ordersSnap);

    const rangeOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= since && d <= until;
    });

    // Build daily map for every date in the range
    const dailyMap = {};
    const cursor = new Date(since);
    while (cursor <= until) {
      const key = cursor.toISOString().split('T')[0];
      dailyMap[key] = {
        date: key,
        day: cursor.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: 0, orders: 0,
      };
      cursor.setDate(cursor.getDate() + 1);
    }
    rangeOrders.forEach(o => {
      const key = new Date(o.createdAt).toISOString().split('T')[0];
      if (dailyMap[key]) {
        dailyMap[key].revenue += o.total;
        dailyMap[key].orders += 1;
      }
    });

    // Top items
    const itemCounts = {};
    rangeOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCounts[item.name]) itemCounts[item.name] = { name: item.name, qty: 0, revenue: 0 };
        itemCounts[item.name].qty += item.qty;
        itemCounts[item.name].revenue += item.price * item.qty;
      });
    });
    const topItems = Object.values(itemCounts).sort((a, b) => b.qty - a.qty);

    const totalRevenue = rangeOrders.reduce((sum, o) => sum + o.total, 0);

    const exportOrders = rangeOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(o => ({
        orderNumber: o.orderNumber,
        tableNumber: o.tableNumber,
        items: o.items.map(i => `${i.name} x${i.qty}`).join(', '),
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: new Date(o.createdAt).toLocaleString('en-IN'),
      }));

    const startLabel = since.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const endLabel   = until.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    res.json({
      dateRange: `${startLabel} — ${endLabel}`,
      totalOrders: rangeOrders.length,
      totalRevenue,
      daily: Object.values(dailyMap),
      topItems,
      orders: exportOrders,
    });
  } catch (err) { next(err); }
};

exports.getHeatmap = async (req, res, next) => {
  try {
    const ordersSnap = await getDocs(query(collection(db, 'orders'), where('hotelId', '==', req.user.hotelId)));
    const orders = docsToArray(ordersSnap);
    const heatmap = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => heatmap[day] = new Array(24).fill(0));

    orders.forEach(order => {
      const d = new Date(order.createdAt);
      heatmap[days[d.getDay()]][d.getHours()]++;
    });

    res.json({ heatmap, days });
  } catch (err) { next(err); }
};
