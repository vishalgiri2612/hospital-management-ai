import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { initSocket, disconnectSocket } from '../../services/socket';

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/patients', icon: '👥', label: 'Patients' },
  { path: '/doctors', icon: '👨‍⚕️', label: 'Doctors' },
  { path: '/appointments', icon: '📅', label: 'Appointments' },
  { path: '/medical-records', icon: '📋', label: 'Medical Records' },
  { path: '/billing', icon: '💰', label: 'Billing' },
  { path: '/inventory', icon: '📦', label: 'Inventory' },
  { path: '/admin', icon: '⚙️', label: 'Admin Panel', roles: ['admin'] },
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const socket = initSocket();

    socket.on('emergency_alert', (data) => {
      setNotifications((prev) => [
        { id: Date.now(), type: 'emergency', message: `Emergency: ${data.patient_name}`, ...data },
        ...prev.slice(0, 9),
      ]);
    });

    socket.on('appointment_created', (data) => {
      setNotifications((prev) => [
        { id: Date.now(), type: 'info', message: `New appointment: ${data.appointment_id}` },
        ...prev.slice(0, 9),
      ]);
    });

    return () => disconnectSocket();
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>🏥 HMS</h1>
          <p>Hospital Management System</p>
        </div>
        <ul className="sidebar-nav">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <button
            className="btn btn-secondary"
            style={{ width: '100%', color: 'white', background: 'rgba(255,255,255,0.2)', border: 'none' }}
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              style={{ display: 'none' }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h2>Welcome, {user?.email || 'User'}</h2>
          </div>
          <div className="topbar-actions">
            {notifications.length > 0 && (
              <div className="notification-badge">
                <span>🔔</span>
                <span>{Math.min(notifications.length, 9)}</span>
              </div>
            )}
            <span
              className={`badge ${
                user?.role === 'admin'
                  ? 'badge-error'
                  : user?.role === 'doctor'
                  ? 'badge-info'
                  : 'badge-success'
              }`}
            >
              {user?.role || 'User'}
            </span>
          </div>
        </div>

        {notifications.length > 0 && (
          <div style={{ padding: '0 24px' }}>
            {notifications.slice(0, 1).map((n) => (
              <div
                key={n.id}
                className={`alert ${n.type === 'emergency' ? 'alert-error' : 'alert-warning'}`}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span>{n.message}</span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
