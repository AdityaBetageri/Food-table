import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, ShieldCheck, TrendingUp, CheckCircle2,
  XCircle, Clock, Search, ArrowLeft, Activity,
  ChevronDown, AlertCircle, Bell, Mail, Loader2, X,
  BarChart3, Hotel, Globe, Ban, UserCheck, Eye, LogOut
} from 'lucide-react';
import api from '../../services/api';
import './styles.css';

const TABS = [
  { id: 'overview', label: 'Overview', Icon: Building2 },
  { id: 'control', label: 'Control Panel', Icon: ShieldCheck },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
];

function StatCard({ label, value, Icon, color, change }) {
  return (
    <div className="mgmt-stat-card">
      <div className="mgmt-stat-top">
        <span className="mgmt-stat-label">{label}</span>
        <div className="mgmt-stat-icon" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <div className="mgmt-stat-value">{value}</div>
      {change && (
        <span className="mgmt-stat-change" style={{ color }}>
          <TrendingUp size={12} /> {change}
        </span>
      )}
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({ hotels }) {
  const [search, setSearch] = useState('');
  const owners = [...new Set(hotels.map(h => h.owner))];
  const active = hotels.filter(h => h.status === 'active').length;
  const pending = hotels.filter(h => h.status === 'pending').length;

  const filtered = useMemo(() =>
    hotels.filter(h =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase()) ||
      h.owner.toLowerCase().includes(search.toLowerCase())
    ), [search, hotels]);

  return (
    <div style={{ animation: 'fadeIn .5s ease' }}>
      <div className="mgmt-grid-4">
        <StatCard label="Total Hotels" value={hotels.length} Icon={Building2} color="#2E86C1" change={`${active} active`} />
        <StatCard label="Hotel Owners" value={owners.length} Icon={Users} color="#9B59B6" change="Registered" />
        <StatCard label="Total Tables" value={hotels.reduce((s, h) => s + h.tables, 0)} Icon={Hotel} color="#27AE60" change="Across platform" />
        <StatCard label="Pending Approval" value={pending} Icon={Clock} color="#F39C12" change="Awaiting review" />
      </div>

      <div className="mgmt-card">
        <div className="mgmt-card-hdr">
          <h3 className="mgmt-card-title"><Building2 size={18} style={{ color: '#2E86C1' }} /> All Registered Hotels</h3>
          <div className="mgmt-search-wrap">
            <Search size={16} className="mgmt-search-icon" />
            <input type="text" placeholder="Search hotels, cities, owners..." className="mgmt-search" value={search} onChange={e => setSearch(e.target.value)} id="hotel-search" />
          </div>
        </div>
        <div className="mgmt-tbl-wrap">
          <table className="mgmt-tbl" id="hotels-table">
            <thead><tr>
              <th>Hotel Name</th><th>City</th><th>Owner</th><th>Phone</th><th>Tables</th><th>Revenue</th><th>Daily Users</th><th>Joined</th><th>Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600, color: '#1A202C' }}>{h.name}</td>
                  <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#64748B' }}><Globe size={12} />{h.city}</span></td>
                  <td>{h.owner}</td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>{h.phone}</td>
                  <td style={{ textAlign: 'center' }}>{h.tables}</td>
                  <td style={{ fontWeight: 600, color: '#27AE60', fontFamily: "'Outfit',sans-serif" }}>{h.revenue}</td>
                  <td style={{ textAlign: 'center' }}>{h.dailyUsers}</td>
                  <td style={{ color: '#A0AEC0', fontSize: 13 }}>{h.joinedDate}</td>
                  <td><span className={`mgmt-badge mgmt-badge-${h.status}`}>{h.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#A0AEC0' }}>No hotels found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ACCESS_REQUESTS are now fetched from the backend */

/* ─── Notifications Modal ─── */
function NotificationsModal({ accessRequests, loadingId, approveRequest, denyRequest, onClose }) {
  return (
    <div className="mgmt-modal-overlay" onClick={onClose}>
      <div className="mgmt-notif-panel" onClick={e => e.stopPropagation()}>
        <div className="mgmt-notif-header">
          <h4><Mail size={18} style={{ color: '#2E86C1' }} /> Notifications & Requests</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="mgmt-notif-count">{accessRequests.length} new</span>
            <button className="mgmt-notif-close" onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        {accessRequests.length === 0 ? (
          <div className="mgmt-notif-empty"><CheckCircle2 size={32} style={{ color: '#27AE60', opacity: .5 }} /><p>No pending requests</p></div>
        ) : (
          <div className="mgmt-notif-list">
            {accessRequests.map(r => (
              <div key={r.id} className="mgmt-notif-item">
                <div className="mgmt-notif-item-top">
                  <strong>{r.name}</strong>
                  <span className="mgmt-notif-time">{r.requestedAt}</span>
                </div>
                <div className="mgmt-notif-meta"><Globe size={11} /> {r.city} &middot; {r.owner} &middot; {r.email} &middot; {r.phone}</div>
                <p className="mgmt-notif-msg">"{r.message}"</p>
                <div className="mgmt-notif-actions">
                  <button disabled={loadingId === `approve-${r.id}`} className="mgmt-act-btn mgmt-act-approve" onClick={() => approveRequest(r)} id={`req-approve-${r.id}`}>
                    {loadingId === `approve-${r.id}` ? <Loader2 size={13} className="mgmt-spinner" /> : <CheckCircle2 size={13} />} {loadingId === `approve-${r.id}` ? 'Approving...' : 'Approve'}
                  </button>
                  <button disabled={loadingId === `deny-${r.id}`} className="mgmt-act-btn mgmt-act-block" onClick={() => denyRequest(r)} id={`req-deny-${r.id}`}>
                    {loadingId === `deny-${r.id}` ? <Loader2 size={13} className="mgmt-spinner" /> : <XCircle size={13} />} {loadingId === `deny-${r.id}` ? 'Denying...' : 'Deny'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Control Panel Tab ─── */
function ControlTab({ hotels, setHotels, accessRequests, log, changeStatus, loadingId, approveRequest, denyRequest }) {
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? hotels : hotels.filter(h => h.status === filter);

  return (
    <div style={{ animation: 'fadeIn .5s ease' }}>
      <div className="mgmt-grid-3">
        <StatCard label="Active Hotels" value={hotels.filter(h => h.status === 'active').length} Icon={CheckCircle2} color="#27AE60" />
        <StatCard label="Pending Hotels" value={hotels.filter(h => h.status === 'pending').length} Icon={Clock} color="#F39C12" />
        <StatCard label="Blocked Hotels" value={hotels.filter(h => h.status === 'blocked').length} Icon={Ban} color="#E74C3C" />
      </div>

      {/* Pending Requests Section */}
      {accessRequests.length > 0 && (
        <div className="mgmt-card" style={{ marginBottom: 24, border: '1px solid rgba(243,156,18,.3)', background: 'rgba(243,156,18,.02)' }}>
          <div className="mgmt-card-hdr">
            <h3 className="mgmt-card-title" style={{ color: '#B7770D' }}><Mail size={18} /> New Access Requests ({accessRequests.length})</h3>
          </div>
          <div className="mgmt-control-list">
            {accessRequests.map(r => (
              <div key={r.id} className="mgmt-control-row" style={{ background: '#fff', borderLeft: '4px solid #F39C12' }}>
                <div className="mgmt-control-info">
                  <div className="mgmt-control-name">{r.hotelName || r.name}</div>
                  <div className="mgmt-control-meta">
                    <Globe size={12} /> {r.city} &middot; <Users size={12} /> {r.ownerName || r.owner} &middot; <Mail size={12} /> {r.ownerEmail || r.email}
                  </div>
                  <div className="mgmt-control-meta" style={{ color: '#2E86C1', fontWeight: 600, marginTop: 4 }}>
                    <Activity size={12} /> Contact: <a href={`tel:${r.phone}`} style={{ color: '#2E86C1', textDecoration: 'none' }}>{r.phone}</a>
                  </div>
                </div>
                <div className="mgmt-control-actions">
                  <button disabled={loadingId === `approve-${r.id}`} className="mgmt-act-btn mgmt-act-approve" onClick={() => approveRequest(r)}>
                    {loadingId === `approve-${r.id}` ? <Loader2 size={14} className="mgmt-spinner" /> : <CheckCircle2 size={14} />} Approve
                  </button>
                  <button disabled={loadingId === `deny-${r.id}`} className="mgmt-act-btn mgmt-act-block" onClick={() => denyRequest(r)}>
                    {loadingId === `deny-${r.id}` ? <Loader2 size={14} className="mgmt-spinner" /> : <XCircle size={14} />} Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="mgmt-card">
        <div className="mgmt-card-hdr">
          <h3 className="mgmt-card-title"><ShieldCheck size={18} style={{ color: '#2E86C1' }} /> Hotel Access Control</h3>
          <div className="mgmt-filters-wrap">
            <div className="mgmt-filters">
              {['all', 'active', 'pending', 'blocked'].map(f => (
                <button key={f} className={`mgmt-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? hotels.length : hotels.filter(h => h.status === f).length})</button>
              ))}
            </div>
          </div>
        </div>

        <div className="mgmt-control-list">
          {shown.map(h => (
            <div key={h.id} className="mgmt-control-row">
              <div className="mgmt-control-info">
                <div className="mgmt-control-name">{h.name}</div>
                <div className="mgmt-control-meta"><Globe size={12} /> {h.city} &middot; {h.owner} &middot; {h.tables} tables</div>
                {h.phone && <div className="mgmt-control-meta"><Activity size={12} /> {h.phone}</div>}
              </div>
              <span className={`mgmt-badge mgmt-badge-${h.status}`}>{h.status}</span>
              <div className="mgmt-control-actions">
                {h.status !== 'active' && <button disabled={loadingId === `change-${h.id}-active`} className="mgmt-act-btn mgmt-act-approve" onClick={() => changeStatus(h.id, 'active')} id={`activate-${h.id}`}>{loadingId === `change-${h.id}-active` ? <Loader2 size={14} className="mgmt-spinner" /> : <CheckCircle2 size={14} />} {loadingId === `change-${h.id}-active` ? 'Activating...' : 'Activate'}</button>}
                {h.status !== 'blocked' && <button disabled={loadingId === `change-${h.id}-blocked`} className="mgmt-act-btn mgmt-act-block" onClick={() => changeStatus(h.id, 'blocked')} id={`block-${h.id}`}>{loadingId === `change-${h.id}-blocked` ? <Loader2 size={14} className="mgmt-spinner" /> : <Ban size={14} />} {loadingId === `change-${h.id}-blocked` ? 'Blocking...' : 'Block'}</button>}
                {h.status !== 'pending' && <button disabled={loadingId === `change-${h.id}-pending`} className="mgmt-act-btn mgmt-act-pending" onClick={() => changeStatus(h.id, 'pending')} id={`pending-${h.id}`}>{loadingId === `change-${h.id}-pending` ? <Loader2 size={14} className="mgmt-spinner" /> : <Clock size={14} />} {loadingId === `change-${h.id}-pending` ? 'Setting...' : 'Pending'}</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {log.length > 0 && (
        <div className="mgmt-card" style={{ marginTop: 20 }}>
          <h3 className="mgmt-card-title"><Activity size={18} style={{ color: '#2E86C1' }} /> Action Log</h3>
          <div className="mgmt-log">
            {log.map((l, i) => (
              <div key={i} className={`mgmt-log-row mgmt-log-${l.action}`}>
                {l.action === 'active' || l.action === 'approved & activated' ? <CheckCircle2 size={14} /> : l.action === 'blocked' ? <XCircle size={14} /> : l.action === 'denied' ? <XCircle size={14} /> : <Clock size={14} />}
                <span><strong>{l.name}</strong> → <strong>{l.action}</strong></span>
                <span className="mgmt-log-time">{l.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Analytics Tab ─── */
function AnalyticsTab({ hotels, dailyPlatform, hotelDailyActivity }) {
  const maxV = Math.max(...(dailyPlatform || []).map(d => d.visitors), 1);
  const totalV = (dailyPlatform || []).reduce((s, d) => s + d.visitors, 0);
  const totalO = (dailyPlatform || []).reduce((s, d) => s + d.orders, 0);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ animation: 'fadeIn .5s ease' }}>
      <div className="mgmt-grid-4">
        <StatCard label="Weekly Visitors" value={totalV.toLocaleString()} Icon={Users} color="#2E86C1" change="Last 7 days" />
        <StatCard label="Daily Average" value={Math.round(totalV / 7).toLocaleString()} Icon={Activity} color="#27AE60" change="Per day" />
        <StatCard label="Weekly Orders" value={totalO.toLocaleString()} Icon={TrendingUp} color="#9B59B6" change="Platform-wide" />
        <StatCard label="Conversion" value={`${((totalO / totalV) * 100).toFixed(1)}%`} Icon={UserCheck} color="#E67E22" change="Visitor → order" />
      </div>

      <div className="mgmt-charts-grid">
        {/* Platform Bar Chart */}
        <div className="mgmt-card">
          <h3 className="mgmt-card-title"><BarChart3 size={18} style={{ color: '#2E86C1' }} /> Platform Usage Trends</h3>
          <div className="mgmt-bar-chart">
            {(dailyPlatform || []).map((d, i) => (
              <div key={i} className="mgmt-bar-col">
                <span className="mgmt-bar-val" style={{ color: '#2E86C1' }}>{d.visitors}</span>
                <span className="mgmt-bar-val" style={{ color: '#9B59B6', fontSize: 10 }}>{d.orders}</span>
                <div className="mgmt-bar-pair">
                  <div className="mgmt-bar mgmt-bar-v" style={{ height: `${(d.visitors / maxV) * 150}px` }} />
                  <div className="mgmt-bar mgmt-bar-o" style={{ height: `${(d.orders / maxV) * 150}px` }} />
                </div>
                <span className="mgmt-bar-label">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="mgmt-legend">
            <span><span className="mgmt-dot" style={{ background: 'linear-gradient(180deg,#2E86C1,#1B4F72)' }} /> Visitors</span>
            <span><span className="mgmt-dot" style={{ background: 'linear-gradient(180deg,#BB8FCE,#9B59B6)' }} /> Orders</span>
          </div>
        </div>

        {/* Per-Hotel Daily Users */}
        <div className="mgmt-card">
          <h3 className="mgmt-card-title"><Eye size={18} style={{ color: '#1B4F72' }} /> Daily Users per Hotel</h3>
          <div className="mgmt-hotel-activity">
            {hotels.filter(h => h.status === 'active').map(h => (
              <div key={h.id} className="mgmt-ha-row">
                <div className="mgmt-ha-info">
                  <span className="mgmt-ha-name">{h.name}</span>
                  <span className="mgmt-ha-count">{h.dailyUsers}/day</span>
                </div>
                <div className="mgmt-ha-bar-bg">
                  <div className="mgmt-ha-bar" style={{ width: `${(h.dailyUsers / 420) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-Hotel Weekly Heatmap */}
      <div className="mgmt-card">
        <h3 className="mgmt-card-title"><Activity size={18} style={{ color: '#2E86C1' }} /> Hotel Activity Heatmap (Weekly)</h3>
        <div className="mgmt-tbl-wrap">
          <table className="mgmt-tbl mgmt-heat-tbl">
            <thead><tr><th>Hotel</th>{days.map(d => <th key={d}>{d}</th>)}<th>Total</th></tr></thead>
            <tbody>
              {(hotelDailyActivity || []).map(ha => {
                const hotel = hotels.find(h => h.id === ha.hotelId);
                if (!hotel) return null;
                const max = Math.max(...ha.data, 1);
                const total = ha.data.reduce((a, b) => a + b, 0);
                return (
                  <tr key={ha.hotelId}>
                    <td style={{ fontWeight: 600 }}>{hotel.name}</td>
                    {ha.data.map((v, i) => {
                      const intensity = Math.round((v / max) * 4);
                      return <td key={i}><div className={`mgmt-heat-cell heat-${intensity}`}>{v}</div></td>;
                    })}
                    <td style={{ fontWeight: 700, color: '#2E86C1' }}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [hotels, setHotels] = useState([]);
  const [dailyPlatform, setDailyPlatform] = useState([]);
  const [hotelDailyActivity, setHotelDailyActivity] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [log, setLog] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('mgmt_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  // ─── Auth Guard: verify management session on mount ───
  useEffect(() => {
    const token = localStorage.getItem('mgmt_token');
    if (!token) {
      navigate('/management/login', { replace: true });
      return;
    }
    api.managementAuth.getMe()
      .then((data) => {
        setAdmin(data.admin);
        setAuthChecked(true);
      })
      .catch(() => {
        localStorage.removeItem('mgmt_token');
        localStorage.removeItem('mgmt_admin');
        navigate('/management/login', { replace: true });
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('mgmt_token');
    localStorage.removeItem('mgmt_admin');
    navigate('/management/login', { replace: true });
  };

  const changeStatus = async (id, newStatus) => {
    setLoadingId(`change-${id}-${newStatus}`);
    try {
      await api.management.updateStatus(id, newStatus);
      setHotels(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));
      const hotel = hotels.find(h => h.id === id);
      setLog(prev => [{ name: hotel?.name || id, action: newStatus, time: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      alert('Failed to update hotel status: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const approveRequest = async (req) => {
    setLoadingId(`approve-${req.id}`);
    try {
      await api.management.approveRequest(req.id);
      setAccessRequests(prev => prev.filter(r => r.id !== req.id));
      setHotels(prev => [...prev, { id: req.hotelId, name: req.name, city: req.city, owner: req.owner, email: req.email, phone: req.phone || '', tables: 0, status: 'active', joinedDate: new Date().toISOString().split('T')[0], revenue: '₹0', dailyUsers: 0 }]);
      setLog(prev => [{ name: req.name, action: 'approved & activated', time: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      alert('Failed to approve request: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const denyRequest = async (req) => {
    setLoadingId(`deny-${req.id}`);
    try {
      await api.management.denyRequest(req.id);
      setAccessRequests(prev => prev.filter(r => r.id !== req.id));
      setLog(prev => [{ name: req.name, action: 'denied', time: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      alert('Failed to deny request: ' + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    if (authChecked) fetchData();
  }, [authChecked]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [data, requestsData] = await Promise.all([
        api.management.getData(),
        api.management.getAccessRequests().catch(() => ({ requests: [] })),
      ]);
      setHotels(data.hotelsData);
      setDailyPlatform(data.dailyPlatform);
      setHotelDailyActivity(data.hotelDailyActivity);
      setAccessRequests(requestsData.requests || []);
    } catch (err) {
      console.error('Failed to fetch management data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while verifying auth
  if (!authChecked) {
    return (
      <div className="mgmt-page">
        <div className="mgmt-loading" style={{ minHeight: '100vh' }}>
          <Loader2 size={40} className="mgmt-spinner" />
          <p>Verifying management access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mgmt-page">
      <header className="mgmt-header">
        <div className="mgmt-header-left">
          <button className="mgmt-back" onClick={() => navigate('/management')} id="mgmt-back-btn"><img src="frontend/assets/logo.png" alt="logo" size={18} /></button>
          <div>
            <button><h1 className="mgmt-title" onClick={() => navigate('/management')}>Management Dashboard</h1></button>
            <p className="mgmt-subtitle">Platform administration & hotel oversight</p>
          </div>
        </div>
        <div className="mgmt-header-right">
          <button
            className="mgmt-notif-btn"
            onClick={() => setShowNotif(true)}
            style={{ position: 'relative' }}
            title="Notifications & Requests"
            id="notif-bell"
          >
            <Bell size={18} />
            {accessRequests.length > 0 && <span className="mgmt-notif-dot">{accessRequests.length}</span>}
          </button>
          <span className="mgmt-admin-tag">
            <ShieldCheck size={14} /> 
            <span style={{ marginLeft: 2 }}>{admin?.name ? `Hi, ${admin.name}` : 'Platform Admin'}</span>
          </span>
          <button
            className="mgmt-logout-btn"
            onClick={handleLogout}
            title="Logout"
            id="mgmt-logout-btn"
          >
            <LogOut size={16} />
            <span className="mgmt-logout-text">Logout</span>
          </button>
        </div>
      </header>

      <nav className="mgmt-tabs" id="mgmt-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`mgmt-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)} id={`tab-${t.id}`}>
            <t.Icon size={17} /><span>{t.label}</span>
            {t.id === 'control' && accessRequests.length > 0 && (
              <span style={{
                marginLeft: '4px', padding: '1px 7px', borderRadius: '10px',
                fontSize: '10px', fontWeight: 700, background: '#E74C3C', color: '#fff',
              }}>{accessRequests.length}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="mgmt-main">
        {loading ? (
          <div className="mgmt-loading">
            <Loader2 size={40} className="mgmt-spinner" />
            <p>Loading platform data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab hotels={hotels} />}
            {activeTab === 'control' && <ControlTab hotels={hotels} setHotels={setHotels} accessRequests={accessRequests} log={log} changeStatus={changeStatus} loadingId={loadingId} approveRequest={approveRequest} denyRequest={denyRequest} />}
            {activeTab === 'analytics' && <AnalyticsTab hotels={hotels} dailyPlatform={dailyPlatform} hotelDailyActivity={hotelDailyActivity} />}
          </>
        )}
      </main>

      {/* Notifications & Requests Modal */}
      {showNotif && (
        <NotificationsModal
          accessRequests={accessRequests}
          loadingId={loadingId}
          approveRequest={approveRequest}
          denyRequest={denyRequest}
          onClose={() => setShowNotif(false)}
        />
      )}
    </div>
  );
}
