import React from 'react';
import { Circle, Clock, CheckCircle, FileText, CreditCard } from 'lucide-react';

const STATUS_CONFIG = {
  new: { label: 'New', Icon: Circle, color: '#3498DB', bg: 'rgba(52,152,219,0.12)' },
  preparing: { label: 'Preparing', Icon: Clock, color: '#F39C12', bg: 'rgba(243,156,18,0.12)' },
  ready: { label: 'Ready', Icon: CheckCircle, color: '#27AE60', bg: 'rgba(39,174,96,0.12)' },
  served: { label: 'Served', Icon: FileText, color: '#95A5A6', bg: 'rgba(149,165,166,0.12)' },
  paid: { label: 'Paid', Icon: CreditCard, color: '#2C3E50', bg: 'rgba(44,62,80,0.12)' },
};

export default function StatusBadge({ status = 'new', size = 'md', label }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const { Icon } = config;
  const displayLabel = label || config.label;
  const fontSize = size === 'sm' ? '11px' : size === 'lg' ? '14px' : '12px';
  const padding = size === 'sm' ? '3px 8px' : size === 'lg' ? '6px 16px' : '4px 12px';
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding,
        borderRadius: '999px',
        fontSize,
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}20`,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={iconSize} />
      <span>{displayLabel}</span>
    </span>
  );
}