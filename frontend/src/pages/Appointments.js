import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, createAppointment, cancelAppointment } from '../store/slices/appointmentSlice';
import api from '../services/api';

const STATUS_BADGE = {
  scheduled: 'badge-info',
  confirmed: 'badge-success',
  in_progress: 'badge-warning',
  completed: 'badge-success',
  cancelled: 'badge-secondary',
  no_show: 'badge-error',
};

export default function Appointments() {
  const dispatch = useDispatch();
  const { appointments, loading, pagination } = useSelector((state) => state.appointments);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '09:00',
    type: 'consultation', reason: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchAppointments({ page, limit: 10 }));
  }, [dispatch, page]);

  useEffect(() => {
    if (showModal) {
      Promise.all([
        api.get('/patients', { params: { limit: 100 } }),
        api.get('/doctors', { params: { limit: 100 } }),
      ]).then(([pRes, dRes]) => {
        setPatients(pRes.data.data || []);
        setDoctors(dRes.data.data || []);
      });
    }
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const result = await dispatch(createAppointment(form));
    if (result.type === 'appointments/create/fulfilled') {
      setShowModal(false);
      setForm({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '09:00', type: 'consultation', reason: '' });
    } else {
      setFormError(result.payload || 'Failed to schedule appointment');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this appointment?')) {
      dispatch(cancelAppointment({ id, reason: 'Cancelled by staff' }));
    }
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <h2>Appointments</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Schedule Appointment
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan="8"><div className="empty-state"><p>No appointments found</p></div></td></tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td><code>{apt.appointment_id}</code></td>
                      <td>{apt.patient?.first_name} {apt.patient?.last_name}</td>
                      <td>Dr. {apt.doctor?.last_name}</td>
                      <td>{apt.appointment_date}</td>
                      <td>{apt.appointment_time?.slice(0, 5)}</td>
                      <td>{apt.type?.replace('_', ' ')}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[apt.status] || 'badge-secondary'}`}>
                          {apt.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {apt.status === 'scheduled' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleCancel(apt.id)}>
                            Cancel
                          </button>
                        )}
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
              <h3>Schedule Appointment</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Patient *</label>
                <select className="form-control" required value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
                  <option value="">Select patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.patient_id})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Doctor *</label>
                <select className="form-control" required value={form.doctor_id}
                  onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
                  <option value="">Select doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} - {d.specialization}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" className="form-control" required value={form.appointment_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input type="time" className="form-control" required value={form.appointment_time}
                    onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="form-control" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {['consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist', 'telemedicine'].map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea className="form-control" rows={3} value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
