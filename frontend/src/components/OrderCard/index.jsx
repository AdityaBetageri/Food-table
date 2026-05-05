import React, { useState } from 'react';
import StatusBadge from '../StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { timeAgo } from '../../utils/dateUtils';
import { ChefHat, CheckCircle, Truck, CreditCard, StickyNote, Loader2 } from 'lucide-react';

import { groupOrderItems } from '../../utils/orderUtils';

const statusActions = {
  new: { label: 'Start Preparing', next: 'preparing', color: '#F39C12', Icon: ChefHat },
  preparing: { label: 'Mark Ready', next: 'ready', color: '#27AE60', Icon: CheckCircle },
  ready: { label: 'Mark Served', next: 'served', color: '#95A5A6', Icon: Truck },
  served: { label: 'Mark Paid', next: 'paid', color: '#2C3E50', Icon: CreditCard },
};

const borderColors = {
  new: '#3498DB', preparing: '#F39C12', ready: '#27AE60', served: '#95A5A6', paid: '#2C3E50',
};

export default function OrderCard({ order, onStatusChange, showActions = true }) {
  const { _id, tableNumber, orderNumber, items = [], total, status, createdAt, specialInstructions, isUpdated } = order;
  const action = statusActions[status];
  const [isLoading, setIsLoading] = useState(false);

  const displayItems = groupOrderItems(items);

  const handleStatusChange = async (orderId, next) => {
    setIsLoading(true);
    try {
      await onStatusChange(orderId, next);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0',
        borderLeft: `4px solid ${borderColors[status] || '#E2E8F0'}`,
        padding: '18px', transition: 'all 0.25s ease',
        animation: status === 'new' ? 'fadeIn 0.4s ease' : 'none',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: 'linear-gradient(135deg, #1B4F72, #2E86C1)', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            T{tableNumber}
          </span>
          {orderNumber && (
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748B' }}>
              #{orderNumber.toString().padStart(3, '0')}
            </span>
          )}
          <StatusBadge status={status} label={isUpdated && status === 'new' ? 'Again' : undefined} />
        </div>
        <span style={{ fontSize: '12px', color: '#A0AEC0' }}>{timeAgo(createdAt)}</span>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
        {displayItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: idx < displayItems.length - 1 ? '1px dashed #EDF2F7' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</span>
                  {item.isAddition && (
                    <span style={{ fontSize: '10px', background: '#FFF9C4', color: '#F57F17', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, border: '1px solid #FBC02D', letterSpacing: '0.5px' }}>
                      NEW
                    </span>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#A0AEC0' }}>× {item.qty}</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#4A5568' }}>{formatCurrency(item.price * item.qty)}</span>
          </div>
        ))}
        {items.map((item, idx) =>
          item.notes ? (
            <div key={`note-${idx}`} style={{ fontSize: '12px', color: '#B7770D', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <StickyNote size={12} /> {item.name}: {item.notes}
            </div>
          ) : null
        )}
        {specialInstructions && (
          <div style={{ fontSize: '12px', color: '#B7770D', fontStyle: 'italic', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <StickyNote size={12} /> Note: {specialInstructions}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #EDF2F7' }}>
        <span style={{ fontSize: '17px', fontWeight: 800, color: '#1B4F72' }}>{formatCurrency(total)}</span>
        {showActions && action && onStatusChange && (
          <button
            onClick={() => handleStatusChange(_id, action.next)}
            disabled={isLoading}
            style={{
              padding: '8px 18px', borderRadius: '8px', background: action.color, color: '#fff',
              fontSize: '13px', fontWeight: 700, border: 'none', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px',
            }}
            onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}40`; } }}
            onMouseLeave={(e) => { if (!isLoading) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; } }}
          >
            {isLoading ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <action.Icon size={14} />
            )}
            {isLoading ? 'Updating...' : action.label}
          </button>
        )}
      </div>
    </div>
  );
}