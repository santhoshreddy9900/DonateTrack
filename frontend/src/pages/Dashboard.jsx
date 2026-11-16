import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Share2, 
  Boxes, 
  Users, 
  Calendar, 
  ArrowRight, 
  Package, 
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { reportService } from '../services/api';

export default function Dashboard({ 
  onNavigate, 
  onOpenDonationModal, 
  onOpenDistributionModal,
  refreshTrigger 
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportService.getDashboard();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner text="Fetching drive statistics..." />;
  }

  const { summary, recentDonations = [], recentDistributions = [], categoryStats = [] } = data || {};

  return (
    <div className="dashboard-page">
      {error && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* 4 Primary Metric Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Donations Collected"
          value={summary?.totalCollected || 0}
          subtext={`From ${summary?.totalDonationRecords || 0} donation events`}
          icon={HeartHandshake}
          color="blue"
        />
        <StatCard
          title="Total Items Distributed"
          value={summary?.totalDistributed || 0}
          subtext={`Across ${summary?.totalDistributionRecords || 0} handovers`}
          icon={Share2}
          color="emerald"
        />
        <StatCard
          title="Available Inventory"
          value={summary?.availableInventory || 0}
          subtext="Ready for distribution in stock"
          icon={Boxes}
          color="amber"
        />
        <StatCard
          title="Registered Recipients"
          value={summary?.totalRecipients || 0}
          subtext={`${summary?.activeRecipients || 0} currently active`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Quick Actions & Welcome Banner */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '1.75rem', 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', 
          color: '#ffffff',
          padding: '1.5rem 1.75rem' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              College Donation Drive Inventory Tracker
            </h2>
            <p style={{ color: '#bfdbfe', fontSize: '0.9rem', maxWidth: '650px' }}>
              Real-time monitoring of campus collection drives, stock availability, recipient requirements, and verified aid distributions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-secondary" 
              onClick={onOpenDonationModal}
              style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 600 }}
            >
              + Record Donation
            </button>
            <button 
              className="btn" 
              onClick={onOpenDistributionModal}
              style={{ background: '#10b981', color: '#ffffff', fontWeight: 600 }}
            >
              Distribute to Recipient
            </button>
          </div>
        </div>
      </div>

      {/* Category Overview Cards */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Category Inventory Summary
          </h3>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => onNavigate('inventory')}
          >
            View Full Inventory <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {categoryStats.map((cat) => (
            <div key={cat.category} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {cat.category}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {cat.remainingStock}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  in stock
                </span>
              </div>
              <div style={{ marginTop: '0.65rem', background: '#f1f5f9', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${cat.fulfillmentRate}%`, 
                    backgroundColor: cat.fulfillmentRate > 80 ? '#10b981' : '#3b82f6',
                    borderRadius: '4px'
                  }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                <span>Collected: {cat.totalCollected}</span>
                <span>Distributed: {cat.totalDistributed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities Section (Two Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Recent Donations */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HeartHandshake size={18} color="#2563eb" />
              <h3 className="card-title">Recent Donation Activities</h3>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => onNavigate('donations')}
            >
              View All
            </button>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            {recentDonations.length === 0 ? (
              <EmptyState 
                title="No recent donations" 
                message="No donations have been recorded yet."
              />
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Donor</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDonations.map((d) => (
                      <tr key={d._id}>
                        <td style={{ fontWeight: 600 }}>{d.itemName}</td>
                        <td>
                          <span className="badge badge-blue">{d.category}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--primary-700)' }}>+{d.quantity}</strong> {d.unit}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{d.donorName}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(d.donationDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Distributions */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={18} color="#10b981" />
              <h3 className="card-title">Recent Distribution Activities</h3>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => onNavigate('distributions')}
            >
              View All
            </button>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            {recentDistributions.length === 0 ? (
              <EmptyState 
                title="No recent distributions" 
                message="No distribution activities recorded yet."
              />
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Item Distributed</th>
                      <th>Qty</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDistributions.map((dist) => (
                      <tr key={dist._id}>
                        <td style={{ fontWeight: 600 }}>{dist.recipientName}</td>
                        <td>{dist.itemName}</td>
                        <td>
                          <strong style={{ color: '#059669' }}>{dist.quantity}</strong> {dist.unit}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(dist.distributionDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="badge badge-green">{dist.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
