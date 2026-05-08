import React, { useState, useEffect } from 'react';
import { IndianRupee, Package, BarChart3, Clock, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { analyticsAPI } from '../../../services/api';
import { formatCurrency } from '../../../utils/formatCurrency';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const summary = await analyticsAPI.getSummary();
      setData(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>Loading analytics...</div>;
  }

  if (!data) return null;

  const weeklyRevenue = [...data.weeklyRevenue].reverse(); // Get chronological order
  const maxRevenue = Math.max(...weeklyRevenue.map(d => d.revenue), 1000);

  // Use topItems to display instead of categoryBreakdown
  const topItems = data.topItems || [];
  const maxItemQty = Math.max(...topItems.map(t => t.qty), 1);

  const avgOrderValue = data.totalOrderCount > 0 
    ? data.totalRevenue / data.totalOrderCount 
    : 0;

  const weeklyTotal = data.weeklyRevenue.reduce((sum, d) => sum + d.revenue, 0);

  const summaryCards = [
    { label: 'Weekly Revenue', value: formatCurrency(weeklyTotal), Icon: IndianRupee, color: '#27AE60' },
    { label: 'Total Orders', value: data.totalOrderCount.toString(), Icon: Package, color: '#2E86C1' },
    { label: 'Avg Order Value', value: formatCurrency(avgOrderValue), Icon: BarChart3, color: '#9B59B6' },
    { label: 'Avg Rating', value: `${data.avgRating} ★`, Icon: Clock, color: '#F39C12' },
  ];

  return (
    <div style={{ animation: 'fadeIn .5s ease' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: '24px' }}>Sales Analytics</h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {summaryCards.map((s, i) => {
          const { Icon } = s;
          return (
            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1A202C', fontFamily: "'Outfit',sans-serif" }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-charts-grid" style={{ gap: '24px' }}>
        {/* Bar Chart */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: '#2E86C1' }} /> 7-Day Revenue
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px' }}>
            {weeklyRevenue.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative', group: 'true' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>₹{(d.revenue / 1000).toFixed(1)}k</span>
                <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: 'linear-gradient(180deg, #2E86C1, #1B4F72)', height: `${(d.revenue / maxRevenue) * 160}px`, transition: 'height 1s ease', minHeight: '10px' }} />
                <span style={{ fontSize: '12px', color: '#A0AEC0', fontWeight: 500 }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items Breakdown */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UtensilsCrossed size={18} style={{ color: '#1B4F72' }} /> Top Performing Items
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topItems.length === 0 ? (
              <div style={{ color: '#A0AEC0', textAlign: 'center', padding: '20px' }}>No items sold yet</div>
            ) : (
              topItems.slice(0, 5).map((c, i) => {
                const pct = (c.qty / maxItemQty) * 100;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{c.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>{c.qty} sold</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: '#EDF2F7' }}>
                      <div style={{ height: '100%', borderRadius: '4px', width: `${pct}%`, background: '#2E86C1', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}