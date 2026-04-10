import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV = [
  { to: '/citizen', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/citizen/report', label: 'Report Issue', icon: '📝' },
  { to: '/citizen/my-complaints', label: 'Complaints', icon: '📋' },
];

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

export default function CitizenSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏙️</div>
        <div>
          <div className="sidebar-logo-text">CitizenConnect</div>
          <div className="sidebar-logo-sub">Citizen Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            {({ isActive }) => (
              <span className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <ThemeToggle />

      <div className="sidebar-user">
        <div className="avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Citizen</div>
        </div>
        <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: 4 }}>⎋</button>
      </div>
    </aside>
  );
}
