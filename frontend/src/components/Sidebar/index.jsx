import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingCart, BookOpen, Table2, Users,
  BarChart3, Settings, ChefHat, LogOut, UtensilsCrossed
} from 'lucide-react';

const LINKS = {
  owner: [
    { path: '/dashboard', label: 'Overview', Icon: LayoutDashboard },
    { path: '/dashboard/orders', label: 'Live Orders', Icon: ShoppingCart },
    { path: '/dashboard/menu', label: 'Menu', Icon: BookOpen },
    { path: '/dashboard/tables', label: 'Tables & QR', Icon: Table2 },
    { path: '/dashboard/staff', label: 'Staff', Icon: Users },
    { path: '/dashboard/analytics', label: 'Analytics', Icon: BarChart3 },
    { path: '/dashboard/settings', label: 'Settings', Icon: Settings },
  ],
  chef: [{ path: '/dashboard/orders', label: 'Kitchen Queue', Icon: ChefHat }],
  waiter: [{ path: '/dashboard/orders', label: 'Orders', Icon: ShoppingCart }],
  cashier: [{ path: '/dashboard/orders', label: 'Orders', Icon: ShoppingCart }],
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = LINKS[user?.role] || LINKS.owner;

  const handleLinkClick = () => {
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <aside className={`sidebar-aside ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,.08)', minHeight: '64px' }}>
        <UtensilsCrossed size={24} style={{ color: '#5DADE2', flexShrink: 0 }} />
        {!collapsed && (
          <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", whiteSpace: 'nowrap' }}>
            Try<span style={{ color: '#5DADE2' }}>Scan</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {links.map(l => {
          const active = l.path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(l.path);
          const { Icon } = l;
          return (
            <Link
              key={l.path}
              to={l.path}
              onClick={handleLinkClick}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                borderRadius: '10px', marginBottom: '4px', fontSize: '14px',
                fontWeight: active ? 600 : 400, color: active ? '#fff' : '#94A3B8',
                background: active ? 'rgba(46,134,193,.2)' : 'transparent',
                textDecoration: 'none', transition: 'all .2s', whiteSpace: 'nowrap',
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{l.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        {!collapsed && user && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>{user.name || 'User'}</div>
            <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'capitalize' }}>{user.role || 'owner'}</div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '10px 16px', borderRadius: '8px', color: '#F87171', fontSize: '13px',
            fontWeight: 600, background: 'rgba(248,113,113,.1)', border: 'none', cursor: 'pointer',
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}