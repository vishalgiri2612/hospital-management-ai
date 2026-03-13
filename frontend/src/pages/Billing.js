import React, { useEffect, useState } from 'react';
import api from '../services/api';

const STATUS_BADGE = { paid: 'badge-success', partial: 'badge-warning', pending: 'badge-info', overdue: 'badge-error' };

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    api.get('/billing', { params: { page, limit: 10 } })
      .then((r) => {
        setBills(r.data.data || []);
        setPagination(r.data.pagination);
      })
      .catch(() => setBills([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <h2>Billing & Payments</h2>
      </div>
      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr><td colSpan="7"><div className="empty-state"><p>No bills found</p></div></td></tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id}>
                      <td><code>{bill.bill_number}</code></td>
                      <td>{bill.patient?.first_name} {bill.patient?.last_name}</td>
                      <td>{bill.bill_date?.split('T')[0]}</td>
                      <td>${parseFloat(bill.total_amount || 0).toFixed(2)}</td>
                      <td>${parseFloat(bill.paid_amount || 0).toFixed(2)}</td>
                      <td>${(parseFloat(bill.total_amount || 0) - parseFloat(bill.paid_amount || 0)).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[bill.status] || 'badge-secondary'}`}>
                          {bill.status}
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
    </div>
  );
}
