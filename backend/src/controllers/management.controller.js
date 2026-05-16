const {
  db, collection, getDocs, query, where, docsToArray, doc, getDoc, updateDoc, addDoc, deleteDoc, orderBy
} = require('../db/firebase');

exports.getData = async (req, res, next) => {
  try {
    // 1. Fetch all hotels
    const hotelsSnap = await getDocs(collection(db, 'hotels'));
    const hotelsList = docsToArray(hotelsSnap);

    // 2. Fetch all users (to get owners)
    const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'owner')));
    const usersList = docsToArray(usersSnap);
    const usersMap = {};
    usersList.forEach(u => usersMap[u._id] = u);

    // 3. Fetch all tables (to count per hotel)
    const tablesSnap = await getDocs(collection(db, 'tables'));
    const tablesList = docsToArray(tablesSnap);
    const tablesCountMap = {};
    tablesList.forEach(t => {
      tablesCountMap[t.hotelId] = (tablesCountMap[t.hotelId] || 0) + 1;
    });

    // 4. Fetch all orders (to calculate revenue and daily activity)
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const allOrders = docsToArray(ordersSnap);

    const hotelRevenueMap = {};
    const hotelDailyActivity = [];
    const platformDaily = {};

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    // Initialize platformDaily for last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      platformDaily[dateStr] = { day: dayName, visitors: 0, orders: 0 };
    }

    allOrders.forEach(o => {
      // Revenue
      hotelRevenueMap[o.hotelId] = (hotelRevenueMap[o.hotelId] || 0) + (o.total || 0);

      // Platform Daily
      const dateStr = o.createdAt ? o.createdAt.split('T')[0] : null;
      if (dateStr && platformDaily[dateStr]) {
        platformDaily[dateStr].orders++;
        // Mock visitors as orders * 1.5 for realism if not tracked
        platformDaily[dateStr].visitors += 2;
      }
    });

    // Format HOTELS_DATA
    const hotelsData = hotelsList.map(h => {
      const owner = usersMap[h.ownerId] || { name: 'Unknown', email: 'N/A' };
      const revenue = hotelRevenueMap[h._id] || 0;
      return {
        id: h._id,
        name: h.name,
        city: h.city || 'N/A',
        owner: owner.name,
        email: owner.email,
        phone: h.phone || 'N/A',
        tables: tablesCountMap[h._id] || 0,
        status: h.approvalStatus === 'pending' ? 'pending' : h.approvalStatus === 'denied' ? 'blocked' : (h.isActive ? 'active' : 'blocked'),
        joinedDate: h.createdAt ? h.createdAt.split('T')[0] : 'N/A',
        revenue: `₹${revenue.toLocaleString()}`,
        dailyUsers: Math.round(revenue / 500) || 0, // Mocking daily users based on revenue
        planExpiresAt: h.planExpiresAt || null
      };
    });

    // Format DAILY_PLATFORM
    const dailyPlatform = Object.values(platformDaily);

    // Format HOTEL_DAILY_ACTIVITY (Heatmap)
    // For each hotel, get order counts for last 7 days
    hotelsList.forEach(h => {
      const activityData = new Array(7).fill(0);
      const hotelOrders = allOrders.filter(o => o.hotelId === h._id);

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const count = hotelOrders.filter(o => o.createdAt && o.createdAt.split('T')[0] === dateStr).length;
        activityData[6 - i] = count;
      }

      hotelDailyActivity.push({
        hotelId: h._id,
        data: activityData
      });
    });

    res.json({
      hotelsData,
      dailyPlatform,
      hotelDailyActivity
    });
  } catch (err) {
    next(err);
  }
};

exports.updateHotelStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'blocked', 'pending'

    const hotelRef = doc(db, 'hotels', id);
    const snap = await getDoc(hotelRef);
    if (!snap.exists()) return res.status(404).json({ message: 'Hotel not found.' });

    const hotelData = snap.data();
    const isActive = status === 'active';
    const approvalStatus = status === 'active' ? 'accepted' : status === 'blocked' ? 'denied' : 'pending';

    await updateDoc(hotelRef, { isActive, approvalStatus });

    // Also update the owner user's approvalStatus
    if (hotelData.ownerId) {
      const userRef = doc(db, 'users', hotelData.ownerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, { approvalStatus });
      }
    }

    res.json({ message: `Hotel status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
};

exports.updateHotelPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { months } = req.body;

    const monthsNum = parseInt(months, 10);
    if (!months || isNaN(monthsNum) || monthsNum <= 0) {
      return res.status(400).json({ message: 'Invalid months value. Must be a positive integer.' });
    }

    const hotelRef = doc(db, 'hotels', id);
    const snap = await getDoc(hotelRef);
    if (!snap.exists()) return res.status(404).json({ message: 'Hotel not found.' });

    const hotelData = snap.data();
    let currentDate = hotelData.planExpiresAt ? new Date(hotelData.planExpiresAt) : new Date();

    // If expired, start from today
    if (currentDate < new Date()) {
      currentDate = new Date();
    }

    currentDate.setMonth(currentDate.getMonth() + monthsNum);
    const planExpiresAt = currentDate.toISOString();

    await updateDoc(hotelRef, { planExpiresAt });

    // Also update the owner user's planExpiresAt
    if (hotelData.ownerId) {
      const userRef = doc(db, 'users', hotelData.ownerId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        await updateDoc(userRef, { planExpiresAt });
      }
    }
    res.json({ message: `Plan updated. Expires on ${currentDate.toDateString()}`, planExpiresAt });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/management/access-requests
 * Fetch all pending access requests from Firestore
 */
exports.getAccessRequests = async (req, res, next) => {
  try {
    const q = query(collection(db, 'accessRequests'), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    const requests = docsToArray(snap);

    // Sort by createdAt descending
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Format time-ago strings
    const now = new Date();
    const formatted = requests.map(r => {
      const created = new Date(r.createdAt);
      const diffMs = now - created;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let requestedAt;
      if (diffMins < 1) requestedAt = 'Just now';
      else if (diffMins < 60) requestedAt = `${diffMins} min ago`;
      else if (diffHours < 24) requestedAt = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      else requestedAt = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      return {
        id: r._id,
        name: r.hotelName,
        city: r.city || 'N/A',
        owner: r.ownerName,
        email: r.ownerEmail,
        phone: r.phone || 'N/A',
        hotelId: r.hotelId,
        ownerId: r.ownerId,
        message: r.message,
        requestedAt,
        createdAt: r.createdAt,
      };
    });

    res.json({ requests: formatted });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/management/access-requests/:id/approve
 * Approve an access request — activate user & hotel
 */
exports.approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the access request
    const reqRef = doc(db, 'accessRequests', id);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) {
      return res.status(404).json({ message: 'Access request not found.' });
    }

    const requestData = reqSnap.data();

    // Update user: set approvalStatus to 'accepted'
    if (requestData.ownerId) {
      const userRef = doc(db, 'users', requestData.ownerId);
      await updateDoc(userRef, { approvalStatus: 'accepted', isActive: true });
    }

    // Update hotel: set approvalStatus to 'accepted' and isActive to true
    if (requestData.hotelId) {
      const hotelRef = doc(db, 'hotels', requestData.hotelId);
      await updateDoc(hotelRef, { approvalStatus: 'accepted', isActive: true });
    }

    // Update access request status
    await updateDoc(reqRef, { status: 'accepted', respondedAt: new Date().toISOString() });

    res.json({ message: `${requestData.hotelName} has been approved and activated.` });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/management/access-requests/:id/deny
 * Deny an access request
 */
exports.denyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the access request
    const reqRef = doc(db, 'accessRequests', id);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) {
      return res.status(404).json({ message: 'Access request not found.' });
    }

    const requestData = reqSnap.data();

    // Update user: set approvalStatus to 'denied'
    if (requestData.ownerId) {
      const userRef = doc(db, 'users', requestData.ownerId);
      await updateDoc(userRef, { approvalStatus: 'denied' });
    }

    // Update hotel: set approvalStatus to 'denied'
    if (requestData.hotelId) {
      const hotelRef = doc(db, 'hotels', requestData.hotelId);
      await updateDoc(hotelRef, { approvalStatus: 'denied', isActive: false });
    }

    // Update access request status
    await updateDoc(reqRef, { status: 'denied', respondedAt: new Date().toISOString() });

    res.json({ message: `${requestData.hotelName} has been denied.` });
  } catch (err) {
    next(err);
  }
};
