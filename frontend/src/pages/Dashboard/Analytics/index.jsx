import React, { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Package, BarChart3, Clock, TrendingUp, UtensilsCrossed, Download, X, FileText, Loader, CalendarRange, ListOrdered } from 'lucide-react';
import { analyticsAPI } from '../../../services/api';
import { formatCurrency } from '../../../utils/formatCurrency';

/* ─── Lazy-load jsPDF so the main bundle stays light ─── */
async function generatePDF({ exportData, exportType }) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const { dateRange, totalOrders, totalRevenue, daily, topItems, orders } = exportData;

  const pageW = doc.internal.pageSize.getWidth();
  const now = new Date().toLocaleString('en-IN');
  const blue = [27, 79, 114];
  const lightBlue = [46, 134, 193];
  const darkText = [26, 32, 44];
  const mutedText = [100, 116, 139];

  /* ── Header banner ── */
  doc.setFillColor(...blue);
  doc.rect(0, 0, pageW, 70, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TryScan — Sales Report', 40, 30);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${dateRange}   |   Generated: ${now}`, 40, 50);

  /* ── Summary cards ── */
  let y = 90;
  const cardW = (pageW - 80) / 2;

  const summaryCards = [
    { label: 'Total Orders', value: totalOrders.toString() },
    { label: 'Total Revenue', value: `Rs. ${totalRevenue.toFixed(2)}` },
  ];

  summaryCards.forEach((card, i) => {
    const x = 40 + i * (cardW + 16);
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(x, y, cardW, 48, 6, 6, 'F');
    doc.setTextColor(...mutedText);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(card.label.toUpperCase(), x + 12, y + 17);
    doc.setTextColor(...blue);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + 12, y + 38);
  });

  y += 68;

  /* ─────────────── ANALYTICS SECTION ─────────────── */
  if (exportType === 'analytics' || exportType === 'both') {
    /* Daily Revenue Table */
    doc.setTextColor(...darkText);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Revenue Breakdown', 40, y + 18);
    y += 26;

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Orders', 'Revenue (Rs.)']],
      body: daily.map(d => [d.day, d.orders, d.revenue.toFixed(2)]),
      headStyles: { fillColor: blue, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: darkText },
      alternateRowStyles: { fillColor: [247, 250, 252] },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: 40, right: 40 },
    });

    y = doc.lastAutoTable.finalY + 24;

    /* Top Items Table */
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text('Top Performing Items', 40, y + 2);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['Item Name', 'Qty Sold', 'Revenue (Rs.)']],
      body: topItems.slice(0, 10).map(t => [t.name, t.qty, t.revenue.toFixed(2)]),
      headStyles: { fillColor: lightBlue, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: darkText },
      alternateRowStyles: { fillColor: [247, 250, 252] },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } },
      margin: { left: 40, right: 40 },
    });

    y = doc.lastAutoTable.finalY + 24;
  }

  /* ─────────────── ORDERS SECTION ─────────────── */
  if (exportType === 'orders' || exportType === 'both') {
    /* Check space — add new page if needed */
    if (y > 600) { doc.addPage(); y = 40; }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkText);
    doc.text('Order Details', 40, y + 2);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [['#', 'Table', 'Items', 'Total (Rs.)', 'Status', 'Payment', 'Date']],
      body: orders.map(o => [
        o.orderNumber,
        `T${o.tableNumber}`,
        o.items.length > 60 ? o.items.substring(0, 60) + '…' : o.items,
        o.total.toFixed(2),
        o.status,
        o.paymentStatus,
        o.createdAt,
      ]),
      headStyles: { fillColor: blue, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: darkText },
      alternateRowStyles: { fillColor: [247, 250, 252] },
      columnStyles: {
        0: { cellWidth: 24, halign: 'center' },
        1: { cellWidth: 28, halign: 'center' },
        2: { cellWidth: 145 },
        3: { cellWidth: 60, halign: 'right' },
        4: { cellWidth: 50, halign: 'center' },
        5: { cellWidth: 50, halign: 'center' },
        6: { cellWidth: 90 },
      },
      margin: { left: 40, right: 40 },
    });
  }

  /* ── Footer on every page ── */
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    doc.text(`Page ${p} of ${totalPages}  |  TryScan - Sales - Report`, pageW / 2, doc.internal.pageSize.getHeight() - 18, { align: 'center' });
  }

  const label = exportType === 'both' ? 'full-report' : exportType;
  doc.save(`tryscan-${label}-${Date.now()}.pdf`);
}

/* ─── helpers ─── */
function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* ─────────────── Export Confirmation Modal ─────────────── */
function ExportModal({ isOpen, onClose, onConfirm, loading }) {
  const today = toLocalISO(new Date());
  const defaultStart = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return toLocalISO(d); })();

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);
  const [exportType, setExportType] = useState('both');
  const [dateError, setDateError] = useState('');

  if (!isOpen) return null;

  const typeOptions = [
    { value: 'orders', Icon: ListOrdered, label: 'Orders Only', desc: 'Order details with status & payment info' },
    { value: 'analytics', Icon: BarChart3, label: 'Analytics Only', desc: 'Daily revenue breakdown + top items' },
    { value: 'both', Icon: FileText, label: 'Full Report (Recommended)', desc: 'Analytics summary + complete order list' },
  ];

  function handleConfirm() {
    if (!startDate || !endDate) { setDateError('Please select both dates.'); return; }
    if (startDate > endDate) { setDateError('Start date must be before end date.'); return; }
    setDateError('');
    onConfirm({ startDate, endDate, exportType });
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '20px', width: '90%', maxWidth: '500px',
          boxShadow: '0 24px 70px rgba(0,0,0,0.25)', animation: 'fadeIn 0.3s ease',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1B4F72, #2E86C1)',
          padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
              <FileText size={20} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '17px', fontFamily: "'Outfit', sans-serif" }}>Export Report</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Download as PDF</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Date Range Pickers */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              <CalendarRange size={13} /> Date Range
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[{ id: 'export-start', label: 'From', value: startDate, onChange: e => { setStartDate(e.target.value); setDateError(''); }, max: endDate },
              { id: 'export-end', label: 'To', value: endDate, onChange: e => { setEndDate(e.target.value); setDateError(''); }, min: startDate, max: today }]
                .map(f => (
                  <div key={f.id}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '5px' }}>{f.label}</div>
                    <input
                      id={f.id}
                      type="date"
                      value={f.value}
                      max={f.max}
                      min={f.min}
                      onChange={f.onChange}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
                        border: `2px solid ${dateError ? '#E74C3C' : '#E2E8F0'}`,
                        outline: 'none', color: '#1A202C', background: '#FAFAFA',
                        fontFamily: 'inherit', cursor: 'pointer',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#2E86C1')}
                      onBlur={e => (e.target.style.borderColor = dateError ? '#E74C3C' : '#E2E8F0')}
                    />
                  </div>
                ))}
            </div>
            {dateError && <div style={{ color: '#E74C3C', fontSize: '12px', marginTop: '6px' }}>{dateError}</div>}
          </div>

          {/* Export Type */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Export Content
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {typeOptions.map(({ value, Icon, label, desc }) => {
                const active = exportType === value;
                return (
                  <button
                    key={value}
                    onClick={() => setExportType(value)}
                    style={{
                      padding: '11px 14px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
                      border: `2px solid ${active ? '#2E86C1' : '#E2E8F0'}`,
                      background: active ? '#EBF5FB' : '#FAFAFA',
                      transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '12px',
                    }}
                  >
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                      background: active ? '#2E86C115' : '#E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} style={{ color: active ? '#2E86C1' : '#64748B' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: active ? '#1B4F72' : '#1A202C' }}>{label}</div>
                      <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '1px' }}>{desc}</div>
                    </div>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${active ? '#2E86C1' : '#CBD5E0'}`,
                      background: active ? '#2E86C1' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {active && <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '11px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                border: '2px solid #E2E8F0', background: '#fff', color: '#64748B', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E0'; e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff'; }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                flex: 2, padding: '11px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1B4F72, #2E86C1)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 14px rgba(46,134,193,0.35)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Download size={15} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Main Analytics Page ─────────────── */
export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

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

  const handleExport = useCallback(async ({ startDate, endDate, exportType }) => {
    setExportLoading(true);
    try {
      const exportData = await analyticsAPI.getExport(startDate, endDate);
      await generatePDF({ exportData, exportType });
      setExportModalOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>Loading analytics...</div>;
  }

  if (!data) return null;

  const weeklyRevenue = [...data.weeklyRevenue].reverse();
  const maxRevenue = Math.max(...weeklyRevenue.map(d => d.revenue), 1000);
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
      {/* Page header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", margin: 0 }}>
          Sales Analytics
        </h1>

        {/* ─── Export Button ─── */}
        <button
          id="export-analytics-btn"
          onClick={() => setExportModalOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #1B4F72, #2E86C1)',
            color: '#fff', boxShadow: '0 4px 14px rgba(46,134,193,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,134,193,0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(46,134,193,0.3)';
          }}
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

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
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>₹{(d.revenue / 1000).toFixed(1)}k</span>
                <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: 'linear-gradient(180deg, #2E86C1, #1B4F72)', height: `${(d.revenue / maxRevenue) * 160}px`, transition: 'height 1s ease', minHeight: '10px' }} />
                <span style={{ fontSize: '12px', color: '#A0AEC0', fontWeight: 500 }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
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

      {/* Export Confirmation Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => !exportLoading && setExportModalOpen(false)}
        onConfirm={handleExport}
        loading={exportLoading}
      />
    </div>
  );
}