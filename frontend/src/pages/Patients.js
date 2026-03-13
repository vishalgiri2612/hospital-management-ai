import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients, createPatient } from '../store/slices/patientSlice';

const RISK_BADGE = {
  low: 'badge-success',
  medium: 'badge-warning',
  high: 'badge-error',
  critical: 'badge-error',
};

export default function Patients() {
  const dispatch = useDispatch();
  const { patients, loading, pagination } = useSelector((state) => state.patients);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', gender: 'male', phone: '', email: '', blood_type: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchPatients({ page, limit: 10, search }));
  }, [dispatch, page, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const result = await dispatch(createPatient(form));
    if (result.type === 'patients/create/fulfilled') {
      setShowModal(false);
      setForm({ first_name: '', last_name: '', date_of_birth: '', gender: 'male', phone: '', email: '', blood_type: '' });
    } else {
      setFormError(result.payload || 'Failed to create patient');
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <h2>Patients</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Patient
        </button>
      </div>

      <div className="card">
        <div className="search-bar">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by name or patient ID..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Blood Type</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state"><p>No patients found</p></div>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id}>
                      <td><code>{patient.patient_id}</code></td>
                      <td>{patient.first_name} {patient.last_name}</td>
                      <td>{patient.date_of_birth}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.blood_type || '—'}</td>
                      <td>
                        <span className={`badge ${RISK_BADGE[patient.risk_level] || 'badge-secondary'}`}>
                          {patient.risk_level || 'unknown'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${patient.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {patient.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
                <span>Page {page} of {pagination.totalPages}</span>
                <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Register New Patient</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input className="form-control" required value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input className="form-control" required value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" className="form-control" required value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select className="form-control" value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-control" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Blood Type</label>
                <select className="form-control" value={form.blood_type}
                  onChange={(e) => setForm({ ...form, blood_type: e.target.value })}>
                  <option value="">Select...</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
