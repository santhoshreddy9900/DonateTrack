import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Share2, 
  TrendingUp,
  Package
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { inventoryService } from '../services/api';

const STATUS_OPTIONS = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];
const CATEGORIES = [
  'All',
  'Clothes & Apparel',
  'Food & Groceries',
  'Books & Stationery',
  'Medical & Hygiene',
  'Blankets & Bedding',
  'Toys & Recreation',
  'Other Essentials'
];

export default function Inventory({ 
  onDistributeItem, 
  showToast, 
  refreshTrigger 
}) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, selectedStatus, refreshTrigger]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const [invRes, sumRes] = await Promise.all([
        inventoryService.getAll(params),
        inventoryService.getSummary()
      ]);

      if (invRes.success) setItems(invRes.data);
      if (sumRes.success) setSummary(sumRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const getStatusBadge = (status, remainingStock) => {
    if (remainingStock <= 0 || status === 'Out of Stock') {
      return (
        <span className="badge badge-red">
          <XCircle size={12} /> Out of Stock
        </span>
      );
    }
    if (remainingStock <= 10 || status === 'Low Stock') {
      return (
        <span className="badge badge-amber">
          <AlertTriangle size={12} /> Low Stock
        </span>
      );
    }
    return (
      <span className="badge badge-green">
        <CheckCircle size={12} /> In Stock
      </span>
    );
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory Management</h2>
          <p className="page-subtitle">
            Automated stock calculations: Collected vs Distributed vs Available Balance.
          </p>
        </div>
      </div>

      {/* Stock Summary Strip */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--primary-600)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Items Collected</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {summary.totalCollected.toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--success)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Items Distributed</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-text)', marginTop: '0.2rem' }}>
              {summary.totalDistributed.toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid var(--warning)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Remaining Stock</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-text)', marginTop: '0.2rem' }}>
              {summary.availableInventory.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} className="search-bar" style={{ minWidth: '280px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search inventory items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                type="button" 
                onClick={() => { setSearch(''); fetchInventory(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            )}
          </form>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <LoadingSpinner text="Calculating live inventory stock..." />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Boxes}
            title="No Items in Inventory"
            message="No stock items match your filter criteria or no donations have been recorded yet."
          />
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Collected</th>
                <th style={{ textAlign: 'right' }}>Distributed</th>
                <th style={{ textAlign: 'right' }}>Remaining Stock</th>
                <th style={{ textAlign: 'center' }}>Stock Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.itemName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      From {item.donationCount} donation(s)
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-blue">{item.category}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.totalCollected} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                    {item.totalDistributed} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span 
                      style={{ 
                        fontWeight: 700, 
                        fontSize: '1rem',
                        color: item.remainingStock > 0 ? 'var(--primary-700)' : 'var(--danger)'
                      }}
                    >
                      {item.remainingStock}
                    </span>{' '}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {getStatusBadge(item.stockStatus, item.remainingStock)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      disabled={item.remainingStock <= 0}
                      title={item.remainingStock <= 0 ? 'Cannot distribute - item is out of stock' : 'Distribute this item'}
                      onClick={() => onDistributeItem({ itemName: item.itemName, category: item.category, availableStock: item.remainingStock, unit: item.unit })}
                    >
                      <Share2 size={13} />
                      <span>Distribute</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
