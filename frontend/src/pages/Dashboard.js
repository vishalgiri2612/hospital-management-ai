import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setStats(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return null;

  const riskChartData = {
    labels: (stats.patient_risk_distribution || []).map((r) => r.level),
    datasets: [
      {
        data: (stats.patient_risk_distribution || []).map((r) => r.count),
        backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#880e4f'],
      },
    ],
  };

  const appointmentStatusData = {
    labels: Object.keys(stats.appointments?.by_status || {}),
    datasets: [
      {
        label: 'Appointments',
        data: Object.values(stats.appointments?.by_status || {}),
        backgroundColor: '#42a5f5',
      },
    ],
  };

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <h4>{stats.overview.total_patients.toLocaleString()}</h4>
            <p>Total Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👨‍⚕️</div>
          <div className="stat-info">
            <h4>{stats.overview.total_doctors.toLocaleString()}</h4>
            <p>Active Doctors</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📅</div>
          <div className="stat-info">
            <h4>{stats.overview.today_appointments.toLocaleString()}</h4>
            <p>Today's Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">💰</div>
          <div className="stat-info">
            <h4>{stats.overview.pending_bills.toLocaleString()}</h4>
            <p>Pending Bills</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚠️</div>
          <div className="stat-info">
            <h4>{stats.overview.low_stock_alerts.toLocaleString()}</h4>
            <p>Low Stock Alerts</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h3>Patient Risk Distribution</h3>
          </div>
          {stats.patient_risk_distribution?.length > 0 ? (
            <Pie data={riskChartData} options={{ responsive: true }} />
          ) : (
            <div className="empty-state"><p>No risk data available</p></div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Appointments by Status</h3>
          </div>
          {Object.keys(stats.appointments?.by_status || {}).length > 0 ? (
            <Bar
              data={appointmentStatusData}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          ) : (
            <div className="empty-state"><p>No appointment data available</p></div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Revenue Summary</h3>
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Billed</p>
              <h4 style={{ fontSize: '1.2rem' }}>${stats.revenue.total_billed.toLocaleString()}</h4>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Collected</p>
              <h4 style={{ fontSize: '1.2rem' }}>${stats.revenue.total_collected.toLocaleString()}</h4>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Collection Rate</p>
              <h4 style={{ fontSize: '1.2rem', color: 'var(--success)' }}>{stats.revenue.collection_rate}%</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
