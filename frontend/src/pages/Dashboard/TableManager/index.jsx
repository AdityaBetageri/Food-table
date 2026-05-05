import React, { useState, useEffect } from 'react';
import { Plus, Download, Trash2, Loader2, Pencil } from 'lucide-react';
import { tableAPI } from '../../../services/api';
import Modal from '../../../components/Modal';

const statusConfig = {
  empty: { label: 'Empty', color: '#27AE60', bg: '#E8F8F0' },
  active: { label: 'Active', color: '#F39C12', bg: '#FEF5E7' },
  awaiting_payment: { label: 'Awaiting Payment', color: '#E74C3C', bg: '#FDEDEC' },
};

export default function TableManager() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingQR, setDownloadingQR] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({ tableNumber: '', customName: '', capacity: '4' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const data = await tableAPI.getAll();
      setTables(data || []);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1;
      const payload = {
        tableNumber: formData.tableNumber || nextNum,
        capacity: Number(formData.capacity),
        customName: formData.customName || `Table ${formData.tableNumber || nextNum}`
      };
      const newTable = await tableAPI.create(payload);
      setTables(prev => [...prev, newTable].sort((a, b) => a.tableNumber - b.tableNumber));
      setShowAddModal(false);
      setFormData({ tableNumber: '', customName: '', capacity: '4' });
    } catch (err) {
      alert(err.message || 'Failed to create table');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await tableAPI.update(selectedTable._id, { customName: formData.customName });
      setTables(prev => prev.map(t => t._id === selectedTable._id ? { ...t, customName: formData.customName } : t));
      setShowEditModal(false);
      setSelectedTable(null);
    } catch (err) {
      alert('Failed to update table name');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (table) => {
    setSelectedTable(table);
    setFormData({ customName: table.customName || '' });
    setShowEditModal(true);
  };

  const removeTable = async (id) => {
    if (!confirm('Permanently delete this table? This cannot be undone.')) return;
    try {
      await tableAPI.delete(id);
      setTables(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete table');
    }
  };

  const downloadQR = async (table) => {
    try {
      setDownloadingQR(table._id);
      const data = await tableAPI.getQR(table._id);
      
      const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

      // Load both images
      const [qrImg, logoImg] = await Promise.all([
        loadImage(data.qrCodeData),
        loadImage('/assets/logo.png').catch(() => null) // Fallback if logo fails
      ]);

      if (!logoImg) {
        // Fallback to original if logo not found
        const link = document.createElement('a');
        link.href = data.qrCodeData;
        link.download = `Table-${table.tableNumber}-QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;
      const ctx = canvas.getContext('2d');

      // Draw QR
      ctx.drawImage(qrImg, 0, 0);

      // Logo settings
      const logoSize = canvas.width * 0.22;
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;

      // White background for logo
      ctx.fillStyle = 'white';
      ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);

      // Draw logo
      ctx.drawImage(logoImg, x, y, logoSize, logoSize);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `Table-${table.tableNumber}-QR-Branded.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(err.message || 'Failed to download QR code');
    } finally {
      setDownloadingQR(null);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #E2E8F0',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    background: '#F8FAFC',
    marginTop: '6px'
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>Loading tables from server...</div>;
  }

  return (
    <div style={{ animation: 'fadeIn .5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>Tables & QR Codes</h1>
        <button className="btn btn-primary" onClick={() => { setFormData({ tableNumber: '', customName: '', capacity: '4' }); setShowAddModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Table
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {Object.entries(statusConfig).map(([key, val]) => {
          const count = tables.filter(t => t.status === key).length;
          return (
            <div key={key} style={{ padding: '12px 20px', borderRadius: '10px', background: val.bg, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: val.color }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: val.color }}>{count} {val.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {tables.map(table => {
          const sc = statusConfig[table.status] || statusConfig.empty;
          return (
            <div key={table._id} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0', textAlign: 'center', transition: 'all .25s' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: sc.bg, border: `2px solid ${sc.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px', fontWeight: 800, color: sc.color, fontFamily: "'Outfit',sans-serif" }}>
                {table.tableNumber}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{table.customName || `Table ${table.tableNumber}`}</div>
              <div style={{ fontSize: '12px', color: '#A0AEC0', marginBottom: '8px' }}>{table.capacity} seats</div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, color: sc.color, background: sc.bg }}>{sc.label}</span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px', justifyContent: 'center' }}>
                <button className="btn btn-sm btn-outline" onClick={() => openEditModal(table)} title="Edit Name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Pencil size={12} />
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => downloadQR(table)} disabled={downloadingQR === table._id} title="Download QR" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {downloadingQR === table._id ? <Loader2 size={12} /> : <Download size={12} />} QR
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => removeTable(table._id)} title="Delete" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
        {tables.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#718096', border: '2px dashed #CBD5E0', borderRadius: '14px' }}>
            No tables found. Click "Add Table" to create your first one.
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Table">
        <form onSubmit={handleAddTable} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Table Number (Leave blank for next available)</label>
            <input type="number" style={inputStyle} value={formData.tableNumber} onChange={e => setFormData({...formData, tableNumber: e.target.value})} placeholder="e.g. 5" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Custom Name (Optional)</label>
            <input type="text" style={inputStyle} value={formData.customName} onChange={e => setFormData({...formData, customName: e.target.value})} placeholder="e.g. Poolside 1" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Seating Capacity</label>
            <input type="number" style={inputStyle} value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} placeholder="e.g. 4" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ marginTop: '10px', height: '48px', fontWeight: 700 }}>
            {submitting ? <Loader2 className="spin" size={20} /> : 'Create Table'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Table Name">
        <form onSubmit={handleEditTable} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Custom Name</label>
            <input required type="text" style={inputStyle} value={formData.customName} onChange={e => setFormData({...formData, customName: e.target.value})} placeholder="e.g. Poolside 1" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ marginTop: '10px', height: '48px', fontWeight: 700 }}>
            {submitting ? <Loader2 className="spin" size={20} /> : 'Update Table Name'}
          </button>
        </form>
      </Modal>
    </div>
  );
}