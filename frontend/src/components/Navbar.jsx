import React from 'react';
import { Menu, Plus, Share2, RefreshCw } from 'lucide-react';

export default function Navbar({ onToggleSidebar, activeTab, onOpenDonationModal, onOpenDistributionModal, onRefresh }) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'donations': return 'Donation Management';
      case 'inventory': return 'Live Inventory Management';
      case 'recipients': return 'Recipient Directory';
      case 'distributions': return 'Distribution Management';
      case 'reports': return 'Reports & Impact Analytics';
      default: return 'DonateTrack';
    }
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {getTabTitle()}
          </h1>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="btn-icon"
          title="Refresh Data"
          onClick={onRefresh}
        >
          <RefreshCw size={17} />
        </button>

        <button 
          className="btn btn-secondary" 
          onClick={onOpenDonationModal}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
        >
          <Plus size={15} />
          <span style={{ display: 'inline-block' }}>New Donation</span>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={onOpenDistributionModal}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
        >
          <Share2 size={15} />
          <span style={{ display: 'inline-block' }}>Distribute</span>
        </button>
      </div>
    </header>
  );
}
