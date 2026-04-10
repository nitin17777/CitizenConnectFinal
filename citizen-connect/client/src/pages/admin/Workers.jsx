// ── Admin Workers — Premium Redesign ─────────────────────────────────────────
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const SPEC_CONFIG = {
  road_worker:       { label: '🛣️ Road Worker',       cls: 'badge-road_worker' },
  sanitation_worker: { label: '🗑️ Sanitation Worker', cls: 'badge-sanitation_worker' },
  electrical_worker: { label: '💡 Electrical Worker', cls: 'badge-electrical_worker' },
  general_worker:    { label: '🔧 General Worker',    cls: 'badge-general_worker' },
};

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

function WorkerDetailModal({ user, onClose }) {
  if (!user) return null;
  const s    = user.liveStats || {};
  const spec = SPEC_CONFIG[user.specialization] || SPEC_CONFIG.general_worker;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>👤 Worker Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg)', borderRadius: 12, marginBottom: 18, border: '1px solid var(--border)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 800, flexShrink: 0 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{user.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.email}</div>
            {user.phone && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📞 {user.phone}</div>}
          </div>
          <span className={`badge ${spec.cls}`}>{spec.label}</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Active Jobs',    value: s.activeJobs || 0,          icon: '🔧', color: '#2563eb', bg: '#dbeafe' },
            { label: 'Pending Verify', value: s.pendingVerification || 0,  icon: '⏳', color: '#d97706', bg: '#fef3c7' },
            { label: 'Completed Jobs', value: s.completedJobs || 0,        icon: '✅', color: '#16a34a', bg: '#dcfce7' },
            { label: 'Total Handled',  value: s.totalHandled || 0,         icon: '📋', color: '#7c3aed', bg: '#ede9fe' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'Outfit,sans-serif' }}>{value}</div>
              <div style={{ fontSize: 12, color, opacity: 0.8 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Earnings */}
        <div style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', borderRadius: 12, padding: '18px 20px', color: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.8, marginBottom: 4 }}>Total Earnings</div>
          <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'Outfit,sans-serif' }}>₹{(user.workerEarnings || 0).toLocaleString()}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>From {user.completedJobsCount || 0} verified completions</div>
        </div>
        {user.city && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>📍 {user.city}</div>}
      </div>
    </div>
  );
}

export default function AdminWorkers() {
  const [workers,       setWorkers]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [form,          setForm]          = useState({ name: '', email: '', password: '', specialization: 'general_worker' });
  const [submitting,    setSubmitting]    = useState(false);
  const [detailUser,    setDetailUser]    = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(null);

  useEffect(() => { fetchWorkers(); }, []);

  async function fetchWorkers() {
    try {
      const res = await api.get('/admin/workers');
      setWorkers(res.data.workers || []);
    } catch { toast.error('Failed to load workers'); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register', { ...form, role: 'worker' });
      toast.success('Worker registered!');
      setForm({ name: '', email: '', password: '', specialization: 'general_worker' });
      fetchWorkers();
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setSubmitting(false); }
  }

  async function handleViewDetail(workerId) {
    setLoadingDetail(workerId);
    try {
      const res = await api.get(`/admin/user/${workerId}`);
      setDetailUser(res.data.user);
    } catch { toast.error('Failed to load worker details'); }
    finally { setLoadingDetail(null); }
  }

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="shimmer-box" style={{ height: 44, width: '30%', borderRadius: 10, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <div key={i} className="card shimmer-box" style={{ height: 82 }} />)}
          </div>
          <div className="card shimmer-box" style={{ height: 320 }} />
        </div>
      </div>
    );
  }

  const totalEarnings = workers.reduce((s, w) => s + (w.workerEarnings || 0), 0);
  const totalDone     = workers.reduce((s, w) => s + (w.completedJobsCount || 0), 0);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div className="fade-in" style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>👷 Field Workers</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{workers.length} registered</p>
          <span className="section-tagline">Your work creates real impact.</span>
        </div>
      </div>

      {/* ── Summary mini-stats ── */}
      {workers.length > 0 && (
        <div className="fade-in-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Workers',    value: workers.length,                 icon: '👷', color: '#2563eb', bg: '#dbeafe' },
            { label: 'Jobs Completed',   value: totalDone,                      icon: '✅', color: '#16a34a', bg: '#dcfce7' },
            { label: 'Total Earnings Out', value: `₹${totalEarnings.toLocaleString()}`, icon: '💸', color: '#7c3aed', bg: '#ede9fe' },
          ].map(s => (
            <div key={s.label} className="stat-card card-lift">
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="fade-in-3" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* ── Workers List ── */}
        <div>
          {workers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👷</div>
              <h3>No workers registered yet</h3>
              <p>Use the form to add your first field worker.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {workers.map((w) => {
                const spec = SPEC_CONFIG[w.specialization] || SPEC_CONFIG.general_worker;
                return (
                  <div key={w._id} className="card card-lift" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Avatar */}
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                        {w.name?.[0]?.toUpperCase()}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{w.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{w.email}</div>
                        {w.city && <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>📍 {w.city}</div>}
                      </div>
                      {/* Right column */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
                        <span className={`badge ${spec.cls}`}>{spec.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                          <span className="cost-chip">₹{(w.workerEarnings || 0).toLocaleString()}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{w.completedJobsCount || 0} done</span>
                        </div>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => handleViewDetail(w._id)}
                          disabled={loadingDetail === w._id}>
                          {loadingDetail === w._id ? '⏳' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Register Form ── */}
        <div className="card" style={{ position: 'sticky', top: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', fontFamily: 'Outfit,sans-serif' }}>➕ Register Worker</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Add a new field worker to the platform</p>
          </div>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="john@city.gov" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                Issues are auto-routed to workers by category match.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {SPECIALIZATIONS.map((s) => {
                  const isSelected = form.specialization === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm({ ...form, specialization: s.value })}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                        padding: '10px 12px', borderRadius: 9, cursor: 'pointer',
                        textAlign: 'left', width: '100%', transition: 'all 0.15s',
                        border: `2px solid ${isSelected ? '#2563eb' : 'var(--border)'}`,
                        background: isSelected ? 'rgba(37,99,235,0.08)' : 'var(--bg)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: isSelected ? '#2563eb' : 'var(--text)' }}>
                          {s.label}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: 10, background: '#2563eb', color: '#fff', padding: '1px 7px', borderRadius: 999, fontWeight: 700 }}>✓</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>{s.desc}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {s.categories.map(cat => (
                          <span key={cat} style={{
                            fontSize: 10, padding: '2px 7px', borderRadius: 999,
                            background: isSelected ? 'rgba(37,99,235,0.1)' : 'var(--bg-card)',
                            color: isSelected ? '#2563eb' : 'var(--text-subtle)',
                            border: `1px solid ${isSelected ? '#bfdbfe' : 'var(--border)'}`,
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
            <button type="submit" className="btn btn-primary w-full" disabled={submitting} style={{ justifyContent: 'center' }}>
              {submitting ? '⏳ Registering…' : '➕ Add Worker'}
            </button>
          </form>
        </div>
      </div>

      {detailUser && <WorkerDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
    </div>
  );
}
