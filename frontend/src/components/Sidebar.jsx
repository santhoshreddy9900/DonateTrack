import React from 'react';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  Boxes, 
  Users, 
  Share2, 
  BarChart3, 
  X,
  ShieldCheck,
  Package
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'donations', label: 'Donations', icon: HeartHandshake },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'recipients', label: 'Recipients', icon: Users },
  { id: 'distributions', label: 'Distributions', icon: Share2 },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, dbStatus }) {
  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)} 
          aria-hidden="true" 
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon-wrapper">
            <Package size={22} />
          </div>
          <div className="brand-info">
            <h2>DonateTrack</h2>
            <span>Campus Drive Tracker</span>
          </div>
          {isOpen && (
            <button 
              className="btn-icon mobile-menu-btn" 
              style={{ marginLeft: 'auto', color: '#94a3b8' }}
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className={`status-dot ${dbStatus?.isConnected ? '' : 'offline'}`} />
            <span>
              {dbStatus?.isConnected ? 'MongoDB Connected' : 'Database Disconnected'}
            </span>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.25rem' }}>
            College CSR Inventory v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
