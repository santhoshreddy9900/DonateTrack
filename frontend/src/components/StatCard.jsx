import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'blue' }) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-content">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{formattedValue ?? 0}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div className={`stat-icon-wrapper ${color}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
