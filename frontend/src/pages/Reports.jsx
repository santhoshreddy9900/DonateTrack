import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  Download, 
  Boxes, 
  HeartHandshake, 
  Share2, 
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { reportService } from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Reports({ showToast, refreshTrigger }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [refreshTrigger]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await reportService.getCategoryStats();
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.categories) return;

    const headers = ['Category', 'Total Collected', 'Total Distributed', 'Remaining Stock', 'Donation Records', 'Distribution Records', 'Fulfillment Rate (%)'];
    const rows = reportData.categories.map((c) => [
      `"${c.category}"`,
      c.totalCollected,
      c.totalDistributed,
      c.remainingStock,
      c.donationCount,
      c.distributionCount,
      `${c.fulfillmentRate}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DonateTrack_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report exported to CSV successfully!', 'success');
  };

  if (loading && !reportData) {
    return <LoadingSpinner text="Generating analytical reports..." />;
  }

  const { overall, categories = [] } = reportData || {};

  // Chart 1: Category-wise Bar Chart (Collected vs Distributed vs Remaining)
  const barChartData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        label: 'Collected Items',
        data: categories.map((c) => c.totalCollected),
        backgroundColor: '#2563eb',
        borderRadius: 6
      },
      {
        label: 'Distributed Items',
        data: categories.map((c) => c.totalDistributed),
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: 'Remaining in Stock',
        data: categories.map((c) => c.remainingStock),
        backgroundColor: '#f59e0b',
        borderRadius: 6
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Inter', size: 12 } }
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  // Chart 2: Category Distribution Share Doughnut
  const doughnutData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        data: categories.map((c) => c.totalCollected),
        backgroundColor: [
          '#2563eb',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#64748b'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'Inter', size: 11 }, boxWidth: 12 }
      }
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports & Drive Analytics</h2>
          <p className="page-subtitle">Category-wise breakdown, impact metrics, and balance inventory reports.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportCSV}>
          <Download size={16} />
          <span>Export Report (CSV)</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Collected"
          value={overall?.totalCollected || 0}
          subtext="Cumulative items received"
          icon={HeartHandshake}
          color="blue"
        />
        <StatCard
          title="Total Distributed"
          value={overall?.totalDistributed || 0}
          subtext="Items provided to beneficiaries"
          icon={Share2}
          color="emerald"
        />
        <StatCard
          title="Remaining Inventory"
          value={overall?.remainingInventory || 0}
          subtext="Net balance in campus storage"
          icon={Boxes}
          color="amber"
        />
      </div>

      {/* Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category-wise Collected vs Distributed vs Balance</h3>
          </div>
          <div className="card-body" style={{ height: '340px' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Donation Share by Category</h3>
          </div>
          <div className="card-body" style={{ height: '340px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

      </div>

      {/* Category-wise Statistics Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Comprehensive Category-wise Statistics</h3>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Collected Items</th>
                  <th style={{ textAlign: 'right' }}>Distributed Items</th>
                  <th style={{ textAlign: 'right' }}>Remaining Stock</th>
                  <th style={{ textAlign: 'center' }}>Fulfillment Rate</th>
                  <th style={{ textAlign: 'center' }}>Activity Events</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.category}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{cat.category}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                      {cat.totalCollected.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                      {cat.totalDistributed.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span 
                        style={{ 
                          fontWeight: 700, 
                          color: cat.remainingStock > 0 ? 'var(--primary-700)' : 'var(--danger)' 
                        }}
                      >
                        {cat.remainingStock.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${cat.fulfillmentRate}%`, 
                              backgroundColor: cat.fulfillmentRate >= 80 ? '#10b981' : '#3b82f6' 
                            }} 
                          />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{cat.fulfillmentRate}%</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {cat.donationCount} donations • {cat.distributionCount} distributions
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
