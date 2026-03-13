import React, { useEffect, useState } from 'react';
import api from '../services/api';

const STATUS_BADGE = { in_stock: 'badge-success', low_stock: 'badge-warning', out_of_stock: 'badge-error', discontinued: 'badge-secondary' };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    api.get('/inventory', { params: { page, limit: 10, search } })
      .then((r) => {
        setItems(r.data.data || []);
        setPagination(r.data.pagination);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <h2>Inventory Management</h2>
      </div>
      <div className="card">
        <div className="search-bar">
          <input className="form-control search-input" placeholder="Search inventory..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>In Stock</th>
                  <th>Min Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan="7"><div className="empty-state"><p>No items found</p></div></td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td><code>{item.item_code}</code></td>
                      <td>{item.name}</td>
                      <td>{item.category?.replace('_', ' ')}</td>
                      <td style={{ fontWeight: item.quantity_in_stock <= item.minimum_stock_level ? 'bold' : 'normal', color: item.quantity_in_stock <= item.minimum_stock_level ? 'var(--error)' : 'inherit' }}>
                        {item.quantity_in_stock}
                      </td>
                      <td>{item.minimum_stock_level}</td>
                      <td>{item.unit}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[item.status] || 'badge-secondary'}`}>
                          {item.status?.replace('_', ' ')}
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
