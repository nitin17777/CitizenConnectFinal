import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = [
  {
    value: 'road_worker',
    label: '🛣️ Road Worker',
    desc: 'Handles: Potholes & Road Damage',
    categories: ['🕳️ Pothole', '🛣️ Road Damage'],
  },
  {
    value: 'sanitation_worker',
    label: '🗑️ Sanitation Worker',
    desc: 'Handles: Garbage & Sewage / Drainage',
    categories: ['🗑️ Garbage', '🚧 Sewage / Waterlogging'],
  },
  {
    value: 'electrical_worker',
    label: '💡 Electrical Worker',
    desc: 'Handles: Street Light & Electrical Faults',
    categories: ['💡 Street Light'],
  },
  {
    value: 'general_worker',
    label: '🔧 General Worker',
    desc: 'Handles: Other & Miscellaneous Issues',
    categories: ['📌 Other / General'],
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loginAsDemo } = useAuth();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  const [tab,  setTab]  = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen', specialization: 'general_worker' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.role, form.specialization);
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    try {
      await loginAsDemo(role);
      navigate('/dashboard');
    } catch {
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const DEMO_ROLES = [
    { role: 'citizen', label: 'Citizen',      sub: 'Submit & track complaints', icon: '👤', color: '#7c3aed' },
    { role: 'worker',  label: 'Field Worker', sub: 'View & resolve assigned jobs', icon: '🔧', color: '#059669' },
    { role: 'admin',   label: 'Admin',        sub: 'Manage all complaints & workers', icon: '🛡️', color: '#2563eb' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0f172a' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', transition: 'background 0.3s ease' }}>
      {/* Floating theme toggle */}
      <button onClick={toggle} title="Toggle dark mode"
        style={{ position: 'fixed', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 999, border: '1px solid', borderColor: isDark ? '#334155' : '#e2e8f0', background: isDark ? '#1e293b' : '#fff', color: isDark ? '#94a3b8' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s ease', zIndex: 100 }}>
        {isDark ? '🌙 Dark' : '☀️ Light'}
        <span style={{ width: 32, height: 18, borderRadius: 999, background: isDark ? '#2563eb' : '#cbd5e1', position: 'relative', display: 'inline-block', transition: 'background 0.25s' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: isDark ? 17 : 3, transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
        </span>
      </button>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#2563eb,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px' }}>🏙️</div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 26, color: isDark ? '#f1f5f9' : '#0f172a' }}>CitizenConnect</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>AI-Powered Civic Complaint Platform</p>
        </div>

        {/* Quick Demo */}
        <div style={{ background: isDark ? '#1e293b' : '#fff', borderRadius: 14, padding: 20, marginBottom: 16, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>⚡ Quick Demo Access</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_ROLES.map(({ role, label, sub, icon, color }) => (
              <button key={role} onClick={() => handleDemo(role)} disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 9, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, background: isDark ? '#273448' : '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
                onMouseOver={e => { e.currentTarget.style.background = isDark ? '#1d3a5f' : '#f0f9ff'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                onMouseOut={e => { e.currentTarget.style.background = isDark ? '#273448' : '#f8fafc'; e.currentTarget.style.borderColor = isDark ? '#334155' : '#e2e8f0'; }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: isDark ? '#f1f5f9' : '#0f172a' }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Auth Form */}
        <div style={{ background: isDark ? '#1e293b' : '#fff', borderRadius: 14, padding: 24, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, marginBottom: 20 }}>
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', fontWeight: 600, fontSize: 14, color: tab === t ? '#2563eb' : '#94a3b8', borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required className="form-input" placeholder="John Doe" />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="form-input" placeholder="you@email.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required className="form-input" placeholder="••••••••" />
            </div>

            {tab === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select name="role" value={form.role} onChange={handleChange} className="form-input">
                    <option value="citizen">Citizen</option>
                    <option value="worker">Field Worker</option>
                  </select>
                </div>

                {form.role === 'worker' && (
                  <div className="form-group">
                    <label className="form-label">Your Specialization</label>
                    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                      Choose what type of civic issues you'll handle. Only matching verified issues will appear in your job queue.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {SPECIALIZATIONS.map((s) => {
                        const isSelected = form.specialization === s.value;
                        return (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, specialization: s.value }))}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                              padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                              textAlign: 'left', width: '100%', transition: 'all 0.15s',
                              border: `2px solid ${isSelected ? '#2563eb' : isDark ? '#334155' : '#e2e8f0'}`,
                              background: isSelected ? (isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff') : (isDark ? '#273448' : '#f8fafc'),
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: 14, color: isSelected ? '#2563eb' : (isDark ? '#f1f5f9' : '#0f172a') }}>
                                {s.label}
                              </span>
                              {isSelected && (
                                <span style={{ fontSize: 11, background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>Selected</span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{s.desc}</div>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {s.categories.map(cat => (
                                <span key={cat} style={{
                                  fontSize: 11, padding: '2px 8px', borderRadius: 999,
                                  background: isSelected ? 'rgba(37,99,235,0.12)' : (isDark ? '#1e293b' : '#f1f5f9'),
                                  color: isSelected ? '#2563eb' : '#64748b',
                                  border: `1px solid ${isSelected ? '#bfdbfe' : (isDark ? '#334155' : '#e2e8f0')}`,
                                  fontWeight: 500,
                                }}>
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? '⏳ Please wait…' : tab === 'login' ? '🔐 Sign In' : '🚀 Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
