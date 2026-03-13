import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    api.get('/medical-records', { params: { page, limit: 10 } })
      .then((r) => {
        setRecords(r.data.data || []);
        setPagination(r.data.pagination);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <h2>Medical Records (EHR)</h2>
      </div>
      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Diagnosis</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan="6"><div className="empty-state"><p>No records found</p></div></td></tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id}>
                      <td><code>{r.record_id}</code></td>
                      <td>{r.patient?.first_name} {r.patient?.last_name}</td>
                      <td>Dr. {r.doctor?.last_name}</td>
                      <td>{r.record_type?.replace('_', ' ')}</td>
                      <td>{r.diagnosis || '—'}</td>
                      <td>{r.record_date}</td>
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
    </div>
  );
}
