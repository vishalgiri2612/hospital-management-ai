import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/capacity-forecast', { params: { days: 7 } }),
    ])
      .then(([statsRes, forecastRes]) => {
        setStats(statsRes.data.data);
        setForecast(forecastRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const forecastChartData = forecast?.forecast
    ? {
        labels: forecast.forecast.map((d) => d.date),
        datasets: [
          {
            label: 'Predicted Admissions',
            data: forecast.forecast.map((d) => d.predicted_admissions),
            backgroundColor: '#42a5f5',
          },
          {
            label: 'Required Beds',
            data: forecast.forecast.map((d) => d.required_beds),
            backgroundColor: '#ef9a9a',
          },
        ],
      }
    : null;

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>⚙️ Admin Panel</h2>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div className="stat-info">
              <h4>{stats.overview.total_patients}</h4>
              <p>Total Patients</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">👨‍⚕️</div>
            <div className="stat-info">
              <h4>{stats.overview.total_doctors}</h4>
              <p>Active Doctors</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">💰</div>
            <div className="stat-info">
              <h4>${stats.revenue.total_billed.toLocaleString()}</h4>
              <p>Total Billed (30d)</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">📈</div>
            <div className="stat-info">
              <h4>{stats.revenue.collection_rate}%</h4>
              <p>Collection Rate</p>
            </div>
          </div>
        </div>
      )}

      <div className="charts-grid">
        {forecastChartData && (
          <div className="card">
            <div className="card-header">
              <h3>🤖 AI Capacity Forecast (7 Days)</h3>
            </div>
            <Bar data={forecastChartData} options={{ responsive: true }} />
            {forecast.peak_day && (
              <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Peak day predicted: <strong>{forecast.peak_day.date}</strong> with {forecast.peak_day.predicted_admissions} admissions
              </p>
            )}
          </div>
        )}

        {stats && (
          <div className="card">
            <div className="card-header">
              <h3>Patient Risk Distribution</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {(stats.patient_risk_distribution || []).map((r) => (
                <div key={r.level} style={{ padding: '12px', background: 'var(--bg-light)', borderRadius: '8px' }}>
                  <p className={`risk-${r.level}`} style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {r.level} Risk
                  </p>
                  <h3 style={{ fontSize: '1.5rem' }}>{r.count}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
