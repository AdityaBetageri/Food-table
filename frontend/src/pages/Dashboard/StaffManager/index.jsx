import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { Plus, ChefHat, UserCheck, Wallet, Ban, Check, Loader2, Trash2 } from 'lucide-react';
import { staffAPI } from '../../../services/api';

const roleConfig = {
  chef: { Icon: ChefHat, color: '#F39C12', bg: '#FEF5E7' },
  waiter: { Icon: UserCheck, color: '#2E86C1', bg: '#EBF5FB' },
  cashier: { Icon: Wallet, color: '#27AE60', bg: '#E8F8F0' },
};

export default function StaffManager() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'waiter', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await staffAPI.getAll();
      setStaff(data || []);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newStaff = await staffAPI.create(formData);
      setStaff(prev => [newStaff, ...prev]);
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', role: 'waiter', phone: '' });
    } catch (err) {
      alert(err.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (s) => {
    try {
      await staffAPI.toggleStatus(s._id);
      fetchStaff(); 
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteStaff = async (id) => {
    if (!confirm('Permanently delete this staff member? This cannot be undone.')) return;
    try {
      await staffAPI.delete(id);
      setStaff(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert('Failed to delete staff member');
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

  return (
    <div style={{ animation: 'fadeIn .5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>Staff Manager</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#A0AEC0' }}>Loading staff...</div>
      ) : (
        <div className="dashboard-staff-grid">
          {staff.map(s => {
            const rc = roleConfig[s.role] || roleConfig.waiter;
            const { Icon } = rc;
            return (
              <div key={s._id} style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0', opacity: s.isActive ? 1 : 0.6, transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} style={{ color: rc.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#A0AEC0' }}>{s.email}</div>
                  </div>
                  <button onClick={() => deleteStaff(s._id)} style={{ padding: '8px', borderRadius: '8px', color: '#E53E3E', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Delete Staff">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: rc.color, background: rc.bg, textTransform: 'capitalize' }}>{s.role}</span>
                  <button className="btn btn-sm btn-outline" onClick={() => toggleActive(s)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {s.isActive ? <><Ban size={12} /> Deactivate</> : <><Check size={12} /> Activate</>}
                  </button>
                </div>
              </div>
            );
          })}
          {staff.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#A0AEC0', border: '2px dashed #E2E8F0', borderRadius: '14px' }}>
              No staff members found.
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Staff Member">
        <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Full Name</label>
            <input required type="text" style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Email Address</label>
            <input required type="email" style={inputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. john@hotel.com" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>
          <div className="grid-2" style={{ gap: '12px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Password</label>
              <input required type="password" style={inputStyle} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Min 6 chars" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Phone (Optional)</label>
              <input type="text" style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone number" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Role</label>
            <select style={inputStyle} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'}>
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ marginTop: '10px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px', fontWeight: 700 }}>
            {submitting ? <Loader2 className="spin" size={20} /> : 'Create Staff Account'}
          </button>
        </form>
      </Modal>
    </div>
  );
}