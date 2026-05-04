export const HOTELS_DATA = [
  { id: 1, name: 'The Grand Palace', city: 'Mumbai', owner: 'Rajesh Sharma', email: 'rajesh@grandpalace.in', phone: '+91 98765 43210', tables: 25, status: 'active', joinedDate: '2025-11-15', revenue: '₹4,52,000', dailyUsers: 320 },
  { id: 2, name: 'Spice Garden Resort', city: 'Bangalore', owner: 'Priya Nair', email: 'priya@spicegarden.in', phone: '+91 87654 32109', tables: 18, status: 'active', joinedDate: '2025-12-02', revenue: '₹3,18,500', dailyUsers: 275 },
  { id: 3, name: 'Ocean Breeze Diner', city: 'Goa', owner: 'Carlos D\'Souza', email: 'carlos@oceanbreeze.in', phone: '+91 76543 21098', tables: 12, status: 'active', joinedDate: '2026-01-10', revenue: '₹2,75,000', dailyUsers: 190 },
  { id: 4, name: 'Hilltop Café', city: 'Shimla', owner: 'Anita Verma', email: 'anita@hilltop.in', phone: '+91 65432 10987', tables: 8, status: 'pending', joinedDate: '2026-02-18', revenue: '₹1,45,200', dailyUsers: 95 },
  { id: 5, name: 'Royal Tandoor', city: 'Delhi', owner: 'Vikram Singh', email: 'vikram@royaltandoor.in', phone: '+91 54321 09876', tables: 20, status: 'active', joinedDate: '2026-03-05', revenue: '₹3,92,800', dailyUsers: 410 },
  { id: 6, name: 'Lakeview Bistro', city: 'Udaipur', owner: 'Meera Patel', email: 'meera@lakeview.in', phone: '+91 43210 98765', tables: 15, status: 'active', joinedDate: '2026-03-22', revenue: '₹2,10,600', dailyUsers: 180 },
  { id: 7, name: 'Bamboo Kitchen', city: 'Kolkata', owner: 'Sanjay Das', email: 'sanjay@bamboo.in', phone: '+91 32109 87654', tables: 10, status: 'blocked', joinedDate: '2026-04-01', revenue: '₹98,400', dailyUsers: 0 },
  { id: 8, name: 'Coastal Flavors', city: 'Chennai', owner: 'Lakshmi Iyer', email: 'lakshmi@coastal.in', phone: '+91 21098 76543', tables: 14, status: 'pending', joinedDate: '2026-04-28', revenue: '₹0', dailyUsers: 0 },
  { id: 9, name: 'Mountain View Restaurant', city: 'Dehradun', owner: 'Rohit Kapoor', email: 'rohit@mountainview.co', phone: '+91 10987 65432', tables: 9, status: 'pending', joinedDate: '2026-04-29', revenue: '₹0', dailyUsers: 0 },
  { id: 10, name: 'Sunrise Eatery', city: 'Jaipur', owner: 'Deepak Rathore', email: 'deepak@sunrise.in', phone: '+91 09876 54321', tables: 11, status: 'active', joinedDate: '2026-04-30', revenue: '₹58,200', dailyUsers: 125 },
];

export const DAILY_PLATFORM = [
  { day: 'Mon', visitors: 1240, orders: 380 },
  { day: 'Tue', visitors: 1580, orders: 445 },
  { day: 'Wed', visitors: 1120, orders: 310 },
  { day: 'Thu', visitors: 1750, orders: 520 },
  { day: 'Fri', visitors: 2100, orders: 680 },
  { day: 'Sat', visitors: 2850, orders: 920 },
  { day: 'Sun', visitors: 2400, orders: 780 },
];

export const HOTEL_DAILY_ACTIVITY = [
  { hotelId: 1, data: [42, 55, 38, 60, 72, 95, 80] },
  { hotelId: 2, data: [35, 40, 30, 48, 58, 75, 65] },
  { hotelId: 3, data: [22, 28, 18, 30, 38, 50, 42] },
  { hotelId: 5, data: [50, 62, 45, 70, 85, 110, 90] },
  { hotelId: 6, data: [20, 26, 18, 28, 35, 48, 38] },
  { hotelId: 10, data: [15, 18, 12, 20, 25, 32, 28] },
];
