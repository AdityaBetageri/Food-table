import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { Plus, Minus, ImageOff } from 'lucide-react';

export default function MenuItemCard({ item, cartQty = 0, onIncrease, onDecrease, compact = false, hideAddButton = false }) {
  const { name, price, image, description, category, isVeg, isAvailable = true } = item;

  return (
    <div
      style={{
        background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
        overflow: 'hidden', transition: 'all 0.25s ease',
        opacity: isAvailable ? 1 : 0.55, cursor: isAvailable ? 'pointer' : 'default',
        display: 'flex', flexDirection: compact ? 'row' : 'column',
        boxShadow: cartQty > 0 ? '0 4px 12px rgba(46, 134, 193, 0.15)' : 'none',
        borderColor: cartQty > 0 ? '#2E86C1' : '#E2E8F0'
      }}
      onMouseEnter={(e) => { if (isAvailable) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = cartQty > 0 ? '0 4px 12px rgba(46, 134, 193, 0.15)' : ''; }}
    >
      {/* Image */}
      <div
        style={{
          width: compact ? '100px' : '100%', height: compact ? '100px' : '160px',
          background: 'linear-gradient(135deg, #E8F0FE, #D1E3FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden', position: 'relative',
        }}
      >
        {image ? (
          <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ImageOff size={compact ? 28 : 40} style={{ color: '#94A3B8' }} />
        )}
        {/* Veg/Non-veg badge */}
        <span style={{ position: 'absolute', top: '8px', left: '8px', width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${isVeg ? '#27AE60' : '#C0392B'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isVeg ? '#27AE60' : '#C0392B' }} />
        </span>
        {!isAvailable && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#C0392B', fontSize: '13px' }}>
            Out of Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: compact ? '12px' : '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {category && !compact && (
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#2E86C1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{category}</span>
        )}
        <h4 style={{ fontSize: compact ? '14px' : '16px', fontWeight: 700, color: '#1A202C', margin: 0, fontFamily: "'Outfit', sans-serif" }}>{name}</h4>
        {description && !compact && (
          <p style={{ fontSize: '13px', color: '#718096', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{description}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#1B4F72' }}>{formatCurrency(price)}</span>
          
          {isAvailable && !hideAddButton && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {cartQty > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', borderRadius: '10px', padding: '4px', border: '1px solid #E2E8F0' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDecrease(); }}
                    style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fff', border: '1px solid #E2E8F0', color: '#1B4F72', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '18px', textAlign: 'center', color: '#1B4F72' }}>{cartQty}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onIncrease(); }}
                    style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#1B4F72', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onIncrease(); }}
                  style={{
                    padding: '6px 16px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #1B4F72, #2E86C1)', color: '#fff',
                    fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 4px 12px rgba(27, 79, 114, 0.2)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
                >
                  <Plus size={14} /> ADD
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}