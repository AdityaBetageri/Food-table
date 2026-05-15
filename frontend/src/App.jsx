import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

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
            <span>Table<span style={{ color: '#5DADE2' }}>Tap</span></span>
          </div>
          <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
        <div className="dashboard-content">
          <Outlet context={{ setMobileOpen }} />
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
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/menu" element={<CustomerMenu />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<Terms />} />
              <Route path="/cookies-policy" element={<CookiesPolicy />} />
              <Route path="/management/login" element={<ManagementLogin />} />
              <Route path="/management" element={<ManagementDashboard />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
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
