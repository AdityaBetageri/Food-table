import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidth = size === 'sm' ? '420px' : size === 'lg' ? '720px' : '560px';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '16px', width: '90%', maxWidth,
          maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid #E2E8F0',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                color: '#A0AEC0', cursor: 'pointer', border: 'none', background: 'none',
              }}
              onMouseEnter={(e) => (e.target.style.background = '#F7FAFC')}
              onMouseLeave={(e) => (e.target.style.background = 'none')}
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}