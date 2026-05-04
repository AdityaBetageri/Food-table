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
