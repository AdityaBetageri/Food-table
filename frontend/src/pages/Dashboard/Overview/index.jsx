import React, { useState, useEffect } from 'react';
import { IndianRupee, ShoppingCart, Armchair, Star, Flame, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import { useOrders } from '../../../hooks/useOrders';
import OrderCard from '../../../components/OrderCard';
import { analyticsAPI, feedbackAPI } from '../../../services/api';

const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        size={14}
        style={{
          color: i <= rating ? '#F1C40F' : '#E2E8F0',
          fill: i <= rating ? '#F1C40F' : 'none',
          marginRight: '2px'
        }}
      />
    );
  }
  return <div style={{ display: 'flex', alignItems: 'center' }}>{stars}</div>;
};

export default function Overview() {
  const { orders, updateOrderStatus } = useOrders('');
  const [avgRating, setAvgRating] = useState('0.0');
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    analyticsAPI.getSummary().then(data => {
      setAvgRating(data.avgRating?.toString() || '0.0');
    }).catch(err => console.error(err));

    feedbackAPI.getAll().then(data => {
      setFeedbacks(data || []);
    }).catch(err => console.error(err));
  }, []);
  
  const ordersToday = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.createdAt).toDateString() === today;
  });
  
  const revenueToday = ordersToday
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const ordersToPay = orders.filter(o => o.status === 'served');

  // Compute top items from all orders dynamically
  const itemCounts = {};
  orders.forEach(o => {
    (o.items || []).forEach(i => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
    });
  });
  const computedTopItems = Object.entries(itemCounts)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const maxQty = computedTopItems[0]?.qty || 1;
  const topItems = computedTopItems.map(t => ({ ...t, pct: (t.qty / maxQty) * 100 }));

  const stats = [
    { label: "Today's Revenue", value: `₹${revenueToday.toLocaleString()}`, Icon: IndianRupee, change: '', color: '#27AE60' },
    { label: 'Orders Today', value: ordersToday.length.toString(), Icon: ShoppingCart, change: '', color: '#2E86C1' },
    { label: 'Pending Payment', value: ordersToPay.length.toString(), Icon: Armchair, change: '', color: '#F39C12' },
    { label: 'Avg Rating', value: avgRating, Icon: Star, change: '', color: '#9B59B6' },
  ];

  return (
    <div style={{ animation: 'fadeIn .5s ease' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: '24px' }}>Dashboard Overview</h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0', transition: 'all .25s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{s.label}</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.Icon size={20} style={{ color: s.color }} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1A202C', fontFamily: "'Outfit',sans-serif" }}>{s.value}</div>
            {s.change && (
              <span style={{ fontSize: '12px', color: s.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <TrendingUp size={12} /> {s.change} from yesterday
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Left Column containing Top Selling Items and Feedbacks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Items */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} style={{ color: '#E74C3C' }} /> Top Selling Items
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topItems.map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</span>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>{item.qty} sold</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: '#EDF2F7' }}>
                    <div style={{ height: '100%', borderRadius: '3px', width: `${item.pct}%`, background: 'linear-gradient(90deg, #1B4F72, #2E86C1)', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Feedbacks */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: '#9B59B6' }} /> Customer Feedbacks
            </h3>
            
            <style>{`
              .feedback-card {
                transition: all 0.25s ease;
              }
              .feedback-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                border-color: #CBD5E1 !important;
              }
            `}</style>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
              {feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#A0AEC0' }}>
                  <MessageSquare size={32} style={{ color: '#E2E8F0', marginBottom: '8px', marginLeft: 'auto', marginRight: 'auto' }} />
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>No feedbacks received yet</div>
                </div>
              ) : (
                feedbacks.map((item) => (
                  <div
                    key={item._id}
                    className="feedback-card"
                    style={{
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderStars(item.rating)}
                        {item.foodRating && (
                          <span style={{ fontSize: '10px', fontWeight: 600, background: '#E8F8F5', color: '#117A65', padding: '2px 6px', borderRadius: '4px' }}>
                            Food: {item.foodRating}★
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    {item.comment ? (
                      <p style={{ fontSize: '13.5px', color: '#334155', margin: '4px 0 0 0', lineHeight: '1.4', fontWeight: '400' }}>
                        "{item.comment}"
                      </p>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                        Rated {item.rating} stars without a comment
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Orders to Pay */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#2E86C1' }} /> Orders to Pay
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto', paddingRight: '8px' }}>
            {ordersToPay.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#A0AEC0' }}>No pending payments</div>
            ) : (
              ordersToPay.map((o) => (
                <OrderCard key={o._id} order={o} onStatusChange={updateOrderStatus} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}