import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import Inventory from './pages/Inventory';
import Recipients from './pages/Recipients';
import Distributions from './pages/Distributions';
import Reports from './pages/Reports';

import { systemService } from './services/api';

import './styles/index.css';
import './styles/components.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ isConnected: true, host: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Global modals
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [preselectedItem, setPreselectedItem] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDataChanged = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await systemService.getHealth();
      if (res && res.database) {
        setDbStatus(res.database);
      }
    } catch (err) {
      setDbStatus({ isConnected: false, host: 'Disconnected' });
    }
  };

  const handleDistributeFromInventory = (item) => {
    setPreselectedItem(item);
    setIsDistributionModalOpen(true);
    setActiveTab('distributions');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          activeTab={activeTab}
          onOpenDonationModal={() => {
            setIsDonationModalOpen(true);
            setActiveTab('donations');
          }}
          onOpenDistributionModal={() => {
            setIsDistributionModalOpen(true);
            setActiveTab('distributions');
          }}
          onRefresh={handleDataChanged}
        />

        <main className="page-wrapper">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenDonationModal={() => {
                setIsDonationModalOpen(true);
                setActiveTab('donations');
              }}
              onOpenDistributionModal={() => {
                setIsDistributionModalOpen(true);
                setActiveTab('distributions');
              }}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'donations' && (
            <Donations
              isAddModalOpen={isDonationModalOpen}
              setIsAddModalOpen={setIsDonationModalOpen}
              showToast={showToast}
              onDataChanged={handleDataChanged}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              onDistributeItem={handleDistributeFromInventory}
              showToast={showToast}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'recipients' && (
            <Recipients
              showToast={showToast}
              onDataChanged={handleDataChanged}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'distributions' && (
            <Distributions
              isAddModalOpen={isDistributionModalOpen}
              setIsAddModalOpen={setIsDistributionModalOpen}
              preselectedItem={preselectedItem}
              setPreselectedItem={setPreselectedItem}
              showToast={showToast}
              onDataChanged={handleDataChanged}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              showToast={showToast}
              refreshTrigger={refreshTrigger}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
