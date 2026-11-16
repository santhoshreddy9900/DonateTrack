import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  AlertCircle,
  Tag
} from 'lucide-react';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { donationService } from '../services/api';

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

export default function Donations({ 
  isAddModalOpen, 
  setIsAddModalOpen, 
  showToast, 
  onDataChanged, 
  refreshTrigger 
}) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Edit State
  const [editingDonation, setEditingDonation] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State
  const initialForm = {
    itemName: '',
    category: 'Clothes & Apparel',
    quantity: 1,
    unit: 'units',
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    donationDate: new Date().toISOString().split('T')[0],
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDonations();
  }, [selectedCategory, refreshTrigger]);

  const fetchDonations = async (query = search) => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.search = query.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await donationService.getAll(params);
      if (res.success) {
        setDonations(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonations(search);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (donation) => {
    setEditingDonation(donation);
    setFormData({
      itemName: donation.itemName,
      category: donation.category,
      quantity: donation.quantity,
      unit: donation.unit || 'units',
      donorName: donation.donorName,
      donorPhone: donation.donorPhone || '',
      donorEmail: donation.donorEmail || '',
      donationDate: new Date(donation.donationDate).toISOString().split('T')[0],
      notes: donation.notes || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.itemName.trim()) {
      setFormError('Please enter the item name.');
      return;
    }
    if (!formData.donorName.trim()) {
      setFormError('Please enter donor name.');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingDonation) {
        const res = await donationService.update(editingDonation._id, formData);
        showToast(res.message || 'Donation updated successfully!', 'success');
        setIsEditModalOpen(false);
      } else {
        const res = await donationService.create(formData);
        showToast(res.message || 'Donation recorded successfully!', 'success');
        setIsAddModalOpen(false);
      }
      setFormData(initialForm);
      fetchDonations();
      onDataChanged();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, itemName) => {
    if (!window.confirm(`Are you sure you want to delete this donation record for "${itemName}"?`)) {
      return;
    }

    try {
      const res = await donationService.delete(id);
      showToast(res.message || 'Donation record deleted.', 'success');
      fetchDonations();
      onDataChanged();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="donations-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Donation Records</h2>
          <p className="page-subtitle">Track and record items donated by students, faculty, and sponsors.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Donation</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} className="search-bar" style={{ minWidth: '280px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by item, donor name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                type="button" 
                onClick={() => { setSearch(''); fetchDonations(''); }}
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

      {/* Donations Table */}
      {loading ? (
        <LoadingSpinner text="Loading donation records..." />
      ) : donations.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={HeartHandshake}
            title="No Donations Found"
            message={search || selectedCategory !== 'All' ? 'No donations match your filter criteria.' : 'No donations recorded yet. Click below to add the first donation!'}
            actionLabel="Add Donation"
            onAction={handleOpenAdd}
          />
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Donor Details</th>
                <th>Donation Date</th>
                <th>Notes</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.itemName}</div>
                  </td>
                  <td>
                    <span className="badge badge-blue">{item.category}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.95rem' }}>
                      +{item.quantity}
                    </span>{' '}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.donorName}</div>
                    {(item.donorPhone || item.donorEmail) && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.donorPhone} {item.donorEmail && `• ${item.donorEmail}`}
                      </div>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(item.donationDate).toLocaleDateString()}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                    {item.notes || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button
                        className="btn-icon"
                        title="Edit Donation"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete Donation"
                        onClick={() => handleDelete(item._id, item.itemName)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Donation Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Donation Record' : 'Record New Donation'}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <div>{formError}</div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label required">Item Name</label>
            <input
              type="text"
              name="itemName"
              className="form-input"
              placeholder="e.g. Warm Blankets, Rice Bags, Notebooks"
              value={formData.itemName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                className="form-input"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Measurement Unit</label>
              <input
                type="text"
                name="unit"
                className="form-input"
                placeholder="e.g. units, pieces, boxes, bags, sets"
                value={formData.unit}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Donation Date</label>
              <input
                type="date"
                name="donationDate"
                className="form-input"
                value={formData.donationDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Donor Name / Organization</label>
            <input
              type="text"
              name="donorName"
              className="form-input"
              placeholder="e.g. NSS Club, Prof. Sharma, Alumni 2024"
              value={formData.donorName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Donor Phone</label>
              <input
                type="tel"
                name="donorPhone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.donorPhone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Donor Email</label>
              <input
                type="email"
                name="donorEmail"
                className="form-input"
                placeholder="donor@college.edu"
                value={formData.donorEmail}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              name="notes"
              className="form-textarea"
              placeholder="e.g. Packed in 5 cartons, verified quality"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEditModalOpen ? 'Save Changes' : 'Record Donation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
