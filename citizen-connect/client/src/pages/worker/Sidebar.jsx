import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV = [
  { to: '/worker',          label: 'Available Jobs', icon: '📋', end: true },
  { to: '/worker/my-jobs',  label: 'My Jobs',        icon: '🗂️' },
];

const SPEC_LABELS = {
  road_worker:       '🛣️ Road Worker',
  sanitation_worker: '🗑️ Sanitation',
  electrical_worker: '💡 Electrical',
  general_worker:    '🔧 General',
};

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button className="theme-toggle" onClick={toggle} title="Toggle dark mode">
      <span style={{ fontSize: 15 }}>{isDark ? '🌙' : '☀️'}</span>
      <span className="theme-toggle-label">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
      <span className={`toggle-track ${isDark ? 'on' : ''}`}>
        <span className={`toggle-thumb ${isDark ? 'on' : ''}`} />
      </span>
    </button>
  );
}

export default function WorkerSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const earnings = user?.workerEarnings || 0;
  const done     = user?.completedJobsCount || 0;
  const spec     = SPEC_LABELS[user?.specialization] || '🔧 General';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg,#0891b2,#0284c7)' }}>🔧</div>
        <div>
          <div className="sidebar-logo-text">CitizenConnect</div>
          <div className="sidebar-logo-sub">Worker Portal</div>
        </div>
      </div>

      {/* Specialization badge */}
      <div style={{ padding: '10px 14px', margin: '10px 10px 0', background: 'rgba(59,130,246,0.12)', borderRadius: 8, fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>
        {spec}
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            {({ isActive }) => (
              <span className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <span style={{ fontSize: 17 }}>{icon}</span>
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <ThemeToggle />

      {/* Earnings panel */}
      <div style={{ margin: '0 10px 10px', background: 'rgba(22,163,74,0.12)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(22,163,74,0.2)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#86efac', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Your Earnings</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80', fontFamily: 'Outfit,sans-serif' }}>₹{earnings.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: '#86efac', marginTop: 2 }}>{done} job{done !== 1 ? 's' : ''} completed</div>
      </div>

      <div className="sidebar-user">
        <div className="avatar" style={{ background: 'linear-gradient(135deg,#0891b2,#0284c7)' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name">{user?.name}</div>
          <div style={{ fontSize: 11, color: '#0ea5e9' }}>Field Worker</div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} title="Logout"
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, padding: 4 }}>⎋</button>
      </div>
    </aside>
  );
}

