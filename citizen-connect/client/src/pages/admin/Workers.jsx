import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const SPEC_CONFIG = {
  road_worker:       { label: '🛣️ Road Worker',        cls: 'badge-road_worker' },
  sanitation_worker: { label: '🗑️ Sanitation Worker',  cls: 'badge-sanitation_worker' },
  electrical_worker: { label: '💡 Electrical Worker',  cls: 'badge-electrical_worker' },
  general_worker:    { label: '🔧 General Worker',      cls: 'badge-general_worker' },
};

function WorkerDetailModal({ user, onClose }) {
  if (!user) return null;
  const s = user.liveStats || {};
  const spec = SPEC_CONFIG[user.specialization] || SPEC_CONFIG.general_worker;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 20, color: '#0f172a' }}>👤 Worker Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#f8fafc', borderRadius: 10, marginBottom: 18, border: '1px solid #e2e8f0' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{user.name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{user.email}</div>
            {user.phone && <div style={{ fontSize: 12, color: '#64748b' }}>📞 {user.phone}</div>}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className={`badge ${spec.cls}`}>{spec.label}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'Active Jobs',     value: s.activeJobs || 0,     icon: '🔧', color: '#2563eb', bg: '#dbeafe' },
            { label: 'Pending Verify',  value: s.pendingVerification || 0, icon: '⏳', color: '#d97706', bg: '#fef3c7' },
            { label: 'Completed Jobs',  value: s.completedJobs || 0,  icon: '✅', color: '#16a34a', bg: '#dcfce7' },
            { label: 'Total Handled',   value: s.totalHandled || 0,   icon: '📋', color: '#7c3aed', bg: '#ede9fe' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'Outfit,sans-serif' }}>{value}</div>
              <div style={{ fontSize: 12, color, opacity: 0.8 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Earnings */}
        <div style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', borderRadius: 10, padding: '16px 18px', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8, marginBottom: 4 }}>Total Earnings</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit,sans-serif' }}>₹{(user.workerEarnings || 0).toLocaleString()}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>From {user.completedJobsCount || 0} verified completions</div>
        </div>

        {user.city && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>📍 {user.city}</div>
        )}
      </div>
    </div>
  );
}

export default function AdminWorkers() {
  const [workers,     setWorkers]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [form,        setForm]        = useState({ name: '', email: '', password: '', specialization: 'general_worker' });
  const [submitting,  setSubmitting]  = useState(false);
  const [detailUser,  setDetailUser]  = useState(null);
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

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading workers…</div>;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>👷 Workers</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{workers.length} registered field workers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Workers list */}
        <div>
          {workers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👷</div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#64748b' }}>No workers registered yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {workers.map((w) => {
                const spec = SPEC_CONFIG[w.specialization] || SPEC_CONFIG.general_worker;
                return (
                  <div key={w._id} className="card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                        {w.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{w.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{w.email}</div>
                        {w.city && <div style={{ fontSize: 11, color: '#94a3b8' }}>📍 {w.city}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span className={`badge ${spec.cls}`}>{spec.label}</span>
                        <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>₹{(w.workerEarnings || 0).toLocaleString()}</span>
                          <span style={{ color: '#94a3b8' }}>•</span>
                          <span style={{ color: '#64748b' }}>{w.completedJobsCount || 0} done</span>
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

        {/* Register form */}
        <div className="card" style={{ position: 'sticky', top: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 18 }}>➕ Register Worker</h2>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="john@city.gov" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <select className="form-input" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}>
                {Object.entries(SPEC_CONFIG).map(([v, { label }]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? '⏳ Registering…' : '➕ Add Worker'}
            </button>
          </form>
        </div>
      </div>

      {detailUser && <WorkerDetailModal user={detailUser} onClose={() => setDetailUser(null)} />}
    </div>
  );
}
