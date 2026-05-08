import React, { useState, useEffect } from 'react';
import { Building2, Lock, Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../services/api';

export default function Settings() {
  const { user, setUser } = useAuth();
  
  // Hotel Profile state
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    city: '',
    open: '09:00',
    close: '23:00'
  });
  
  // Ordering settings state
  const [settings, setSettings] = useState({
    acceptOrders: true,
    playSound: true,
    autoPrint: false
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user && user.hotel) {
      setProfile({
        name: user.hotel.name || '',
        address: user.hotel.address || '',
        city: user.hotel.city || '',
        open: user.hotel.timings?.open || '09:00',
        close: user.hotel.timings?.close || '23:00'
      });
      if (user.hotel.settings) {
        setSettings({
          acceptOrders: user.hotel.settings.acceptOrders !== false,
          playSound: user.hotel.settings.playSound !== false,
          autoPrint: user.hotel.settings.autoPrint === true
        });
      }
    }
  }, [user]);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setSaveMessage('');
    try {
      const payload = {
        name: profile.name,
        address: profile.address,
        city: profile.city,
        timings: { open: profile.open, close: profile.close }
      };
      await authAPI.updateHotel(payload);
      
      // Update local context
      setUser(prev => ({
        ...prev,
        hotelName: profile.name,
        city: profile.city,
        hotel: {
          ...prev.hotel,
          name: profile.name,
          address: profile.address,
          city: profile.city,
          timings: { open: profile.open, close: profile.close }
        }
      }));
      setSaveMessage('Profile saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await authAPI.updateHotel({ settings: newSettings });
      setUser(prev => ({
        ...prev,
        hotel: {
          ...prev.hotel,
          settings: newSettings
        }
      }));
    } catch (err) {
      // Revert if failed
      setSettings(settings);
      alert('Failed to update setting');
    }
  };

  return (
    <div style={{ animation: 'fadeIn .5s ease' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: '24px' }}>Settings</h1>
      <div style={{ display: 'grid', gap: '24px', maxWidth: '600px' }}>
        {/* Restaurant Profile */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} style={{ color: '#2E86C1' }} /> Restaurant Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Restaurant Name</label>
              <input className="form-input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="Full address" />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
            </div>
            <div className="grid-2" style={{ gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Opening Time</label>
                <input className="form-input" type="time" value={profile.open} onChange={e => setProfile({...profile, open: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Closing Time</label>
                <input className="form-input" type="time" value={profile.close} onChange={e => setProfile({...profile, close: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              <button 
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: savingProfile ? 0.7 : 1 }}
              >
                {savingProfile ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
              {saveMessage && (
                <span style={{ fontSize: '13px', color: saveMessage.includes('Failed') ? '#E74C3C' : '#27AE60', fontWeight: 600 }}>
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ordering Settings */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={18} style={{ color: '#F39C12' }} /> Ordering Settings
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings.acceptOrders}
                onChange={e => handleSettingChange('acceptOrders', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#2E86C1' }} 
              />
              <span style={{ fontSize: '14px' }}>Accept orders (uncheck to pause ordering)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings.playSound}
                onChange={e => handleSettingChange('playSound', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#2E86C1' }} 
              />
              <span style={{ fontSize: '14px' }}>Play sound on new orders</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings.autoPrint}
                onChange={e => handleSettingChange('autoPrint', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#2E86C1' }} 
              />
              <span style={{ fontSize: '14px' }}>Auto-print bills when order completed</span>
            </label>
          </div>
        </div>

        {/* Account Security (Mock) */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} style={{ color: '#E74C3C' }} /> Account Security
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <button className="btn btn-outline" style={{ alignSelf: 'flex-start' }} onClick={() => alert('Password update requested. Please contact admin for now.')}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}