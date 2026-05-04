import React, { useState, useEffect } from 'react';
import MenuItemCard from '../../../components/MenuItemCard';
import Modal from '../../../components/Modal';
import { Plus, Search, Pencil, Ban, Check, Trash2, UtensilsCrossed, Upload, Loader2 } from 'lucide-react';
import { menuAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function MenuManager() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', price: '', category: '', description: '', isVeg: true, image: ''
  });

  const categories = ['All', ...new Set(items.map(i => i.category))];

  useEffect(() => {
    if (user?.hotelId) {
      fetchMenu();
    }
  }, [user]);

  const fetchMenu = async () => {
    try {
      const data = await menuAPI.getByHotel(user.hotelId);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || i.category === category;
    return matchSearch && matchCat;
  });

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await menuAPI.toggle(id);
      setItems(prev => prev.map(i => i._id === id ? { ...i, isAvailable: !currentStatus } : i));
    } catch (err) {
      alert("Failed to update availability");
    }
  };

  const deleteItem = async (id) => {
    if (confirm('Permanently delete this menu item?')) {
      try {
        await menuAPI.delete(id);
        setItems(prev => prev.filter(i => i._id !== id));
      } catch (err) {
        alert("Failed to delete item");
      }
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name, price: item.price, category: item.category,
        description: item.description || '', isVeg: item.isVeg, image: item.image || ''
      });
    } else {
      setEditItem(null);
      setFormData({ name: '', price: '', category: '', description: '', isVeg: true, image: '' });
    }
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editItem) {
        const updated = await menuAPI.update(editItem._id, formData);
        setItems(prev => prev.map(i => i._id === editItem._id ? updated : i));
      } else {
        const added = await menuAPI.create(formData);
        setItems(prev => [...prev, added]);
      }
      setShowModal(false);
    } catch (err) {
      alert("Failed to save menu item");
    } finally {
      setSubmitting(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>Menu Manager</h1>
        <button className="btn btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
          <input 
            style={{ ...inputStyle, paddingLeft: '40px', marginTop: 0 }} 
            placeholder="Search menu items..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            onFocus={e => e.target.style.borderColor = '#2E86C1'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, border: '1px solid', borderColor: category === c ? '#2E86C1' : '#E2E8F0', background: category === c ? '#2E86C1' : '#fff', color: category === c ? '#fff' : '#64748B', cursor: 'pointer', transition: 'all 0.2s' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#A0AEC0' }}>Loading menu...</div>
      ) : filtered.length === 0 ? (
        <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: '#718096', border: '2px dashed #E2E8F0', borderRadius: '14px' }}>
          <div style={{ marginBottom: '16px' }}><UtensilsCrossed size={48} style={{ color: '#CBD5E0', margin: '0 auto' }} /></div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#4A5568' }}>No items found</div>
          <div style={{ fontSize: '14px' }}>Click 'Add Item' to create your first menu item.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {filtered.map(item => (
            <div key={item._id} style={{ position: 'relative' }}>
              <MenuItemCard item={item} hideAddButton={true} />
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button className="btn btn-sm btn-outline" onClick={() => openModal(item)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Pencil size={12} /> Edit
                </button>
                <button className="btn btn-sm btn-outline" onClick={() => toggleAvailability(item._id, item.isAvailable)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.isAvailable ? <><Ban size={12} /> Disable</> : <><Check size={12} /> Enable</>}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteItem(item._id)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Item' : 'Add New Item'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Item Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              {formData.image ? (
                <div style={{ position: 'relative' }}>
                  <img src={formData.image} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #E2E8F0' }} />
                  <button type="button" onClick={() => setFormData({...formData, image: ''})} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#E53E3E', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}>×</button>
                </div>
              ) : (
                <label style={{ width: '80px', height: '80px', background: '#F8FAFC', border: '2px dashed #CBD5E0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#2E86C1'} onMouseLeave={e => e.currentTarget.style.borderColor = '#CBD5E0'}>
                  <Upload size={24} color="#A0AEC0" />
                  <span style={{ fontSize: '10px', color: '#A0AEC0', marginTop: '4px' }}>Upload</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              )}
              <div style={{ fontSize: '12px', color: '#718096', maxWidth: '200px' }}>Recommend 1:1 ratio. Max 2MB.</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Item Name *</label>
              <input required style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Margherita Pizza" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Price (₹) *</label>
              <input required type="number" style={inputStyle} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="299" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Category *</label>
              <input required style={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Mains, Starters" onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Dietary</label>
              <select style={inputStyle} value={formData.isVeg ? 'veg' : 'nonveg'} onChange={e => setFormData({...formData, isVeg: e.target.value === 'veg'})} onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'}>
                <option value="veg">Vegetarian (Green)</option>
                <option value="nonveg">Non-Vegetarian (Red)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#4A5568' }}>Description</label>
            <textarea style={{ ...inputStyle, resize: 'vertical' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Short description of the item..." rows={3} onFocus={e => e.target.style.borderColor = '#2E86C1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ height: '44px', padding: '0 24px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ height: '44px', padding: '0 24px', minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {submitting ? <Loader2 className="spin" size={18} /> : (editItem ? 'Save Changes' : 'Create Item')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}