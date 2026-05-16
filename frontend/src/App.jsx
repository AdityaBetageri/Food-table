import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import CustomerMenu from './pages/CustomerMenu';
import Overview from './pages/Dashboard/Overview';
import LiveOrders from './pages/Dashboard/LiveOrders';
import MenuManager from './pages/Dashboard/MenuManager';
import TableManager from './pages/Dashboard/TableManager';
import StaffManager from './pages/Dashboard/StaffManager';
import Analytics from './pages/Dashboard/Analytics';
import Settings from './pages/Dashboard/Settings';
import NotFound from './pages/NotFound';
import ManagementDashboard from './pages/ManagementDashboard';
import ManagementLogin from './pages/ManagementDashboard/ManagementLogin';

// Legal Pages
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import Terms from './pages/Legal/Terms';
import CookiesPolicy from './pages/Legal/CookiesPolicy';

// Components
import Sidebar from './components/Sidebar';

import { Menu, UtensilsCrossed } from 'lucide-react';

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  let showWarning = false;
  let expireText = '';
  let isExpired = false;
  if (user?.hotel?.planExpiresAt) {
    const expireDate = new Date(user.hotel.planExpiresAt);
    const now = new Date();
    const diffTime = Math.abs(expireDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (expireDate < now) {
      isExpired = true;
      showWarning = true;
      expireText = 'Your plan has expired. Please contact support to renew.';
    } else if (diffDays <= 2) {
      showWarning = true;
      expireText = `Your plan expires in ${diffDays} day(s). Please contact support to renew.`;
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      <div
        className={`dashboard-mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className={`dashboard-main ${collapsed ? 'collapsed' : ''}`}>
        <div className="mobile-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1B4F72', fontWeight: 800, fontSize: '20px', fontFamily: "'Outfit',sans-serif" }}>
            <UtensilsCrossed size={20} style={{ color: '#5DADE2' }} />
            <span>Try<span style={{ color: '#5DADE2' }}>Scan</span></span>
          </div>
          <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
        <div className="dashboard-content">
          {showWarning && !isExpired && (
            <div style={{ background: '#FADBD8', color: '#C0392B', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span> {expireText}
            </div>
          )}
          {isExpired ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '20px' }}>
              <div style={{ background: '#FADBD8', borderRadius: '100%', height: '95px', width: '95px', padding: '5px', marginBottom: '20px' }}>
                <span style={{ fontSize: '48px' }}>⚠️</span>
              </div>
              <h2 style={{ color: '#C0392B', marginBottom: '12px', fontSize: '24px', fontWeight: 700 }}>Plan Expired</h2>
              <p style={{ color: '#5D6D7E', fontSize: '16px', maxWidth: '400px', lineHeight: 1.6 }}>
                Your subscription plan has expired. You cannot access the platform features until you renew your plan. Please contact support or your account manager to renew.
              </p>
            </div>
          ) : (
            <Outlet context={{ setMobileOpen }} />
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Public routes — anyone can access */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/menu" element={<CustomerMenu />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<Terms />} />
              <Route path="/cookies-policy" element={<CookiesPolicy />} />

              {/* Guest-only routes — logged-in users get redirected to /dashboard */}
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/management/login" element={<ManagementLogin />} />

              {/* Protected routes — must be logged in (valid cookie) */}
              <Route path="/management" element={<ManagementDashboard />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Overview />} />
                <Route path="orders" element={<LiveOrders />} />
                <Route path="menu" element={<MenuManager />} />
                <Route path="tables" element={<TableManager />} />
                <Route path="staff" element={<StaffManager />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
