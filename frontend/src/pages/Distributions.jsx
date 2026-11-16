import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  User, 
  Boxes, 
  AlertCircle,
  CheckCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { distributionService, recipientService, inventoryService } from '../services/api';

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

export default function Distributions({ 
  isAddModalOpen, 
  setIsAddModalOpen, 
  preselectedItem, 
  setPreselectedItem,
  showToast, 
  onDataChanged, 
  refreshTrigger 
}) {
  const [distributions, setDistributions] = useState([]);
  const [recipientsList, setRecipientsList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form State
  const initialForm = {
    recipientId: '',
    itemName: '',
    category: '',
    quantity: 1,
    unit: 'units',
    distributionDate: new Date().toISOString().split('T')[0],
    distributedBy: 'Student Volunteer',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [availableStock, setAvailableStock] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDistributions();
  }, [selectedCategory, refreshTrigger]);

  useEffect(() => {
    // Fetch recipients and available inventory for form dropdowns
    loadDropdownData();
  }, [refreshTrigger]);

  useEffect(() => {
    if (preselectedItem && isAddModalOpen) {
      setFormData((prev) => ({
        ...prev,
        itemName: preselectedItem.itemName,
        category: preselectedItem.category,
        unit: preselectedItem.unit || 'units',
        quantity: 1
      }));
      setAvailableStock(preselectedItem.availableStock);
    }
  }, [preselectedItem, isAddModalOpen]);

  const loadDropdownData = async () => {
    try {
      const [recRes, invRes] = await Promise.all([
        recipientService.getAll({ limit: 100 }),
        inventoryService.getAll()
      ]);
      if (recRes.success) setRecipientsList(recRes.data);
      if (invRes.success) setInventoryList(invRes.data);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    }
  };

  const fetchDistributions = async (query = search) => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.search = query.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await distributionService.getAll(params);
      if (res.success) {
        setDistributions(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDistributions(search);
  };

  const handleItemSelect = (e) => {
    const selectedName = e.target.value;
    const foundItem = inventoryList.find((i) => i.itemName.toLowerCase() === selectedName.toLowerCase());

    if (foundItem) {
      setFormData((prev) => ({
        ...prev,
        itemName: foundItem.itemName,
        category: foundItem.category,
        unit: foundItem.unit || 'units',
        quantity: Math.min(prev.quantity || 1, foundItem.remainingStock || 1)
      }));
      setAvailableStock(foundItem.remainingStock);
    } else {
      setFormData((prev) => ({ ...prev, itemName: selectedName }));
      setAvailableStock(null);
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setAvailableStock(null);
    setPreselectedItem(null);
    setFormError('');
    loadDropdownData();
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.recipientId) {
      setFormError('Please select a recipient.');
      return;
    }
    if (!formData.itemName) {
      setFormError('Please select an item to distribute.');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setFormError('Quantity must be at least 1.');
      return;
    }

    if (availableStock !== null && Number(formData.quantity) > availableStock) {
      setFormError(`Insufficient stock! Cannot distribute ${formData.quantity} items. Only ${availableStock} units available.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await distributionService.create(formData);
      showToast(res.message || 'Items distributed successfully!', 'success');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      setPreselectedItem(null);
      fetchDistributions();
      onDataChanged();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, itemName, qty, unit) => {
    if (!window.confirm(`Are you sure you want to cancel and delete this distribution of ${qty} ${unit} of "${itemName}"? The stock will be returned to inventory.`)) {
      return;
    }

    try {
      const res = await distributionService.delete(id);
      showToast(res.message || 'Distribution cancelled and inventory restored.', 'success');
      fetchDistributions();
      onDataChanged();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="distributions-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Distribution Management</h2>
          <p className="page-subtitle">Hand over collected items to recipients with automated inventory deductions.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Distribute Items</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} className="search-bar" style={{ minWidth: '280px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by recipient, item, or volunteer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                type="button" 
                onClick={() => { setSearch(''); fetchDistributions(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            )}
          </form>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-muted)" />
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
        </div>
      </div>

      {/* Distributions Table */}
      {loading ? (
        <LoadingSpinner text="Loading distribution history..." />
      ) : distributions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Share2}
            title="No Distributions Recorded"
            message={search || selectedCategory !== 'All' ? 'No distribution records match your search.' : 'No items have been distributed yet. Click below to start distributing!'}
            actionLabel="Distribute Items"
            onAction={handleOpenAdd}
          />
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Recipient Name</th>
                <th>Item Distributed</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Distribution Date</th>
                <th>Handled By</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {distributions.map((dist) => (
                <tr key={dist._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{dist.recipientName}</div>
                    {dist.recipient?.phone && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {dist.recipient.phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{dist.itemName}</div>
                  </td>
                  <td>
                    <span className="badge badge-blue">{dist.category}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
                      {dist.quantity}
                    </span>{' '}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dist.unit}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(dist.distributionDate).toLocaleDateString()}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {dist.distributedBy}
                  </td>
                  <td>
                    <span className={`badge ${dist.status === 'Completed' ? 'badge-green' : 'badge-amber'}`}>
                      {dist.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-icon danger"
                      title="Cancel & Revert Distribution"
                      onClick={() => handleDelete(dist._id, dist.itemName, dist.quantity, dist.unit)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Distribution Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPreselectedItem(null);
        }}
        title="Record Aid Distribution"
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="alert alert-danger">
              <ShieldAlert size={18} />
              <div>{formError}</div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label required">Select Recipient</label>
            <select
              name="recipientId"
              className="form-select"
              value={formData.recipientId}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientId: e.target.value }))}
              required
            >
              <option value="">-- Choose Registered Recipient / Shelter --</option>
              {recipientsList.map((rec) => (
                <option key={rec._id} value={rec._id}>
                  {rec.name} ({rec.organizationOrShelter || rec.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Select Inventory Item</label>
            <select
              name="itemName"
              className="form-select"
              value={formData.itemName}
              onChange={handleItemSelect}
              required
            >
              <option value="">-- Choose Item from Inventory --</option>
              {inventoryList.map((item) => (
                <option 
                  key={item.id} 
                  value={item.itemName} 
                  disabled={item.remainingStock <= 0}
                >
                  {item.itemName} — [{item.category}] ({item.remainingStock} {item.unit} available {item.remainingStock <= 0 ? '- OUT OF STOCK' : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Live Inventory Stock Card */}
          {availableStock !== null && (
            <div 
              style={{
                background: availableStock > 0 ? 'var(--primary-50)' : 'var(--danger-bg)',
                border: `1px solid ${availableStock > 0 ? 'var(--primary-200)' : 'var(--danger-border)'}`,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Boxes size={18} color={availableStock > 0 ? 'var(--primary-600)' : 'var(--danger)'} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: availableStock > 0 ? 'var(--primary-800)' : 'var(--danger-text)' }}>
                  Current Inventory Available:
                </span>
              </div>
              <strong style={{ fontSize: '1.1rem', color: availableStock > 0 ? 'var(--primary-700)' : 'var(--danger)' }}>
                {availableStock} {formData.unit}
              </strong>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Distribution Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                max={availableStock !== null ? availableStock : undefined}
                className="form-input"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                required
              />
              {availableStock !== null && Number(formData.quantity) > availableStock && (
                <small style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  ⚠️ Cannot exceed available stock of {availableStock} {formData.unit}!
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Distribution Date</label>
              <input
                type="date"
                name="distributionDate"
                className="form-input"
                value={formData.distributionDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, distributionDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Distributed By (Volunteer / Staff)</label>
            <input
              type="text"
              name="distributedBy"
              className="form-input"
              placeholder="e.g. Volunteer Aarav Sharma, Red Cross Volunteer"
              value={formData.distributedBy}
              onChange={(e) => setFormData((prev) => ({ ...prev, distributedBy: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Handover Notes / Verification</label>
            <textarea
              name="notes"
              className="form-textarea"
              placeholder="e.g. Signed receipt on file, handover photo taken"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setPreselectedItem(null);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || (availableStock !== null && (availableStock <= 0 || Number(formData.quantity) > availableStock))}
            >
              {submitting ? 'Processing...' : 'Confirm Distribution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
