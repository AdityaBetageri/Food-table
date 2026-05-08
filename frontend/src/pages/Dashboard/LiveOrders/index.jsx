import React, { useState } from 'react';
import { useOrders } from '../../../hooks/useOrders';
import OrderCard from '../../../components/OrderCard';
import { Package, Circle, Clock, CheckCircle, FileText, Inbox } from 'lucide-react';

const TABS = [
  { key: '', label: 'All Orders', Icon: Package },
  { key: 'new', label: 'New', Icon: Circle },
  { key: 'preparing', label: 'Preparing', Icon: Clock },
];

export default function LiveOrders() {
  const [activeTab, setActiveTab] = useState('');
  const { orders, loading, updateOrderStatus } = useOrders(activeTab);

  // Filter out served and paid orders from the default 'All Orders' tab
  const displayOrders = orders.filter(o => {
    if (activeTab === '') {
      return !['served', 'paid'].includes(o.status);
    }
    return true; // Already filtered by hook if activeTab is not empty
  });

  return (
    <div style={{ animation: 'fadeIn .5s ease' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: '24px' }}>Live Orders</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const { Icon } = t;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '8px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 600,
              border: '2px solid', borderColor: activeTab === t.key ? '#2E86C1' : '#E2E8F0',
              background: activeTab === t.key ? 'rgba(46,134,193,.1)' : '#fff',
              color: activeTab === t.key ? '#2E86C1' : '#64748B', cursor: 'pointer',
              transition: 'all .2s', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /><span>Loading orders...</span></div>
      ) : displayOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Inbox size={48} style={{ color: '#A0AEC0' }} /></div>
          <div className="empty-state-title">No orders found</div>
          <div className="empty-state-desc">Orders will appear here in real-time when customers place them.</div>
        </div>
      ) : (
        <div className="dashboard-orders-grid">
          {displayOrders.map(order => (
            <OrderCard key={order._id} order={order} onStatusChange={updateOrderStatus} />
          ))}
        </div>
      )}
    </div>
  );
}