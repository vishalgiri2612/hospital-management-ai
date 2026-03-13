import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/doctors', { params: { search, limit: 20 } })
      .then((r) => setDoctors(r.data.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <h2>Doctors</h2>
      </div>
      <div className="card">
        <div className="search-bar">
          <input className="form-control search-input" placeholder="Search doctors..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Experience</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr><td colSpan="7"><div className="empty-state"><p>No doctors found</p></div></td></tr>
                ) : (
                  doctors.map((d) => (
                    <tr key={d.id}>
                      <td><code>{d.doctor_id}</code></td>
                      <td>Dr. {d.first_name} {d.last_name}</td>
                      <td>{d.specialization}</td>
                      <td>{d.department || '—'}</td>
                      <td>{d.years_of_experience ? `${d.years_of_experience} yrs` : '—'}</td>
                      <td>{d.rating ? `⭐ ${d.rating}` : '—'}</td>
                      <td>
                        <span className={`badge ${d.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {d.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
