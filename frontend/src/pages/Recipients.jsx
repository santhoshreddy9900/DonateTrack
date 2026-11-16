import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Package
} from 'lucide-react';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { recipientService } from '../services/api';

export default function Recipients({ 
  showToast, 
  onDataChanged, 
  refreshTrigger 
}) {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [viewingRecipient, setViewingRecipient] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    phone: '',
    address: '',
    requiredItems: '',
    organizationOrShelter: '',
    familyMembersCount: 1,
    status: 'Active',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchRecipients();
  }, [statusFilter, refreshTrigger]);

  const fetchRecipients = async (query = search) => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.search = query.trim();
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await recipientService.getAll(params);
      if (res.success) {
        setRecipients(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipients(search);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setEditingRecipient(null);
    setFormData(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecipient(rec);
    setFormData({
      name: rec.name,
      phone: rec.phone,
      address: rec.address,
      requiredItems: Array.isArray(rec.requiredItems) ? rec.requiredItems.join(', ') : rec.requiredItems,
      organizationOrShelter: rec.organizationOrShelter || '',
      familyMembersCount: rec.familyMembersCount || 1,
      status: rec.status || 'Active',
      notes: rec.notes || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenView = async (id) => {
    setHistoryLoading(true);
    try {
      const res = await recipientService.getById(id);
      if (res.success) {
        setViewingRecipient(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setFormError('Please fill in recipient name, phone number, and address.');
      return;
    }

    if (!formData.requiredItems.trim()) {
      setFormError('Please specify at least one required item.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRecipient) {
        const res = await recipientService.update(editingRecipient._id, formData);
        showToast(res.message || 'Recipient updated successfully!', 'success');
      } else {
        const res = await recipientService.create(formData);
        showToast(res.message || 'Recipient registered successfully!', 'success');
      }
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchRecipients();
      onDataChanged();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete recipient "${name}"?`)) {
      return;
    }

    try {
      const res = await recipientService.delete(id);
      showToast(res.message || 'Recipient removed.', 'success');
      fetchRecipients();
      onDataChanged();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="recipients-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Recipient Management</h2>
          <p className="page-subtitle">Register and track beneficiaries, orphanages, shelters, and families in need.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Register Recipient</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearchSubmit} className="search-bar" style={{ minWidth: '280px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by name, phone, address, or item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                type="button" 
                onClick={() => { setSearch(''); fetchRecipients(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            )}
          </form>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recipients List Table */}
      {loading ? (
        <LoadingSpinner text="Loading recipients list..." />
      ) : recipients.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No Recipients Found"
            message={search || statusFilter !== 'All' ? 'No recipients match the filter criteria.' : 'No recipients registered yet.'}
            actionLabel="Register Recipient"
            onAction={handleOpenAdd}
          />
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Recipient / Shelter</th>
                <th>Contact Phone</th>
                <th>Location / Address</th>
                <th>Required Items</th>
                <th>Beneficiaries</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((rec) => (
                <tr key={rec._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rec.name}</div>
                    {rec.organizationOrShelter && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {rec.organizationOrShelter}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                      <Phone size={14} color="var(--primary-600)" />
                      <span>{rec.phone}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      <MapPin size={14} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{rec.address}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '260px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {rec.requiredItems?.map((reqItem, idx) => (
                        <span key={idx} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
                          {reqItem}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{rec.familyMembersCount || 1}</span> persons
                  </td>
                  <td>
                    <span className={`badge ${rec.status === 'Active' ? 'badge-blue' : rec.status === 'Fulfilled' ? 'badge-green' : 'badge-amber'}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      <button
                        className="btn-icon"
                        title="View Details & History"
                        onClick={() => handleOpenView(rec._id)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        title="Edit Recipient"
                        onClick={() => handleOpenEdit(rec)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete Recipient"
                        onClick={() => handleDelete(rec._id, rec.name)}
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

      {/* Register / Edit Recipient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecipient ? 'Edit Recipient Profile' : 'Register New Recipient'}
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <div>{formError}</div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label required">Recipient / Organization Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. City Children Shelter or Family Head Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Affiliated Shelter / NGO (Optional)</label>
              <input
                type="text"
                name="organizationOrShelter"
                className="form-input"
                placeholder="e.g. Hope Social Trust"
                value={formData.organizationOrShelter}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Address / Distribution Point</label>
            <textarea
              name="address"
              className="form-textarea"
              placeholder="Complete street address, landmark, or campus drop point"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Required Items (comma-separated)</label>
            <input
              type="text"
              name="requiredItems"
              className="form-input"
              placeholder="e.g. Thermal Blankets, Rice Bags, Notebooks, Winter Jackets"
              value={formData.requiredItems}
              onChange={handleInputChange}
              required
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
              Separate multiple items with commas.
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Beneficiaries / Family Count</label>
              <input
                type="number"
                name="familyMembersCount"
                min="1"
                className="form-input"
                value={formData.familyMembersCount}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active (Needs Help)</option>
                <option value="Pending">Pending Verification</option>
                <option value="Fulfilled">Fulfilled</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              name="notes"
              className="form-textarea"
              placeholder="Verification details, emergency needs, or volunteer notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingRecipient ? 'Save Changes' : 'Register Recipient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Recipient Details & Distribution History View Modal */}
      <Modal
        isOpen={!!viewingRecipient}
        onClose={() => setViewingRecipient(null)}
        title="Recipient Profile & Aid History"
        maxWidth="680px"
      >
        {viewingRecipient && (
          <div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{viewingRecipient.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{viewingRecipient.organizationOrShelter || 'Individual Beneficiary'}</div>
                </div>
                <span className={`badge ${viewingRecipient.status === 'Active' ? 'badge-blue' : 'badge-green'}`}>
                  {viewingRecipient.status}
                </span>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><strong>Phone:</strong> {viewingRecipient.phone}</div>
                <div><strong>Beneficiaries:</strong> {viewingRecipient.familyMembersCount} persons</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {viewingRecipient.address}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Required Aid Items:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {viewingRecipient.requiredItems?.map((it, i) => (
                <span key={i} className="badge badge-blue">{it}</span>
              ))}
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              Distribution History ({viewingRecipient.distributionHistory?.length || 0} events):
            </h4>
            {viewingRecipient.distributionHistory?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No items distributed to this recipient yet.
              </p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Date</th>
                      <th>Volunteer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingRecipient.distributionHistory.map((dh) => (
                      <tr key={dh._id}>
                        <td style={{ fontWeight: 600 }}>{dh.itemName}</td>
                        <td><span className="badge badge-gray">{dh.category}</span></td>
                        <td><strong style={{ color: '#059669' }}>{dh.quantity}</strong> {dh.unit}</td>
                        <td>{new Date(dh.distributionDate).toLocaleDateString()}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{dh.distributedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setViewingRecipient(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
