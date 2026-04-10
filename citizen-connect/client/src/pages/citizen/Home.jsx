// ── Citizen Home — Premium Redesign ──────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATS_CONFIG = [
  { key: 'total',      label: 'Total Reported', icon: '📋', color: '#2563eb', bg: '#dbeafe' },
  { key: 'verified',   label: 'AI Verified',    icon: '✅', color: '#16a34a', bg: '#dcfce7' },
  { key: 'rejected',   label: 'Rejected by AI', icon: '❌', color: '#dc2626', bg: '#fee2e2' },
  { key: 'inProgress', label: 'In Progress',    icon: '🔧', color: '#0891b2', bg: '#cffafe' },
  { key: 'completed',  label: 'Completed',      icon: '🎉', color: '#7c3aed', bg: '#ede9fe' },
];

function mapLink(loc) {
  if (!loc) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
}

const STATUS_BADGE = {
  pending_ai:                     { cls: 'badge-pending',   label: 'Pending AI' },
  verified:                       { cls: 'badge-verified',  label: 'Verified' },
  rejected_by_ai:                 { cls: 'badge-rejected',  label: 'Rejected' },
  assigned:                       { cls: 'badge-assigned',  label: 'Assigned' },
  in_progress:                    { cls: 'badge-progress',  label: 'In Progress' },
  completed_pending_verification: { cls: 'badge-verifying', label: '⏳ Verify' },
  completed:                      { cls: 'badge-completed', label: 'Completed' },
};

function DashSkeleton() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="shimmer-box" style={{ height: 170, borderRadius: 18, marginBottom: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14, marginBottom: 28 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="stat-card">
            <div className="shimmer-box" style={{ height: 38, width: 38, borderRadius: 9, marginBottom: 8 }} />
            <div className="shimmer-box" style={{ height: 28, width: '55%', marginBottom: 6 }} />
            <div className="shimmer-box" style={{ height: 11, width: '70%' }} />
          </div>
        ))}
      </div>
      {[1,2,3].map(i => <div key={i} className="card shimmer-box" style={{ height: 64, marginBottom: 12 }} />)}
    </div>
  );
}

export default function CitizenHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]           = useState(null);
  const [recent, setRecent]         = useState([]);
  const [community, setCommunity]   = useState([]);
  const [ackLoading, setAckLoading] = useState({});
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [cRes, comRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/complaints/community'),
      ]);
      const complaints = cRes.data.complaints || [];
      setRecent(complaints.slice(0, 5));
      const s = complaints.reduce((acc, c) => {
        acc.total++;
        if (c.status === 'verified') acc.verified++;
        else if (c.status === 'rejected_by_ai') acc.rejected++;
        else if (c.status === 'in_progress') acc.inProgress++;
        else if (c.status === 'completed') acc.completed++;
        return acc;
      }, { total: 0, verified: 0, rejected: 0, inProgress: 0, completed: 0 });
      setStats(s);
      setCommunity(comRes.data.complaints || []);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }

  async function handleAck(id) {
    setAckLoading(p => ({ ...p, [id]: true }));
    try {
      const res = await api.post(`/complaints/${id}/acknowledge`);
      setCommunity(prev => prev.map(c =>
        c._id === id ? { ...c, acknowledgementCount: res.data.count, userHasAcknowledged: res.data.acknowledged } : c
      ));
      toast.success(res.data.acknowledged ? '👍 Acknowledged!' : 'Acknowledgement removed');
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setAckLoading(p => ({ ...p, [id]: false })); }
  }

  if (loading) return <DashSkeleton />;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Hero Banner ── */}
      <div className="hero-banner fade-in">
        <div className="hero-eyebrow">✦ AI-Powered Civic Platform</div>
        <h1 className="hero-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="hero-sub">
          Report smarter. See real impact.<br />
          Your complaints are verified, prioritized, and resolved with AI.
        </p>
        <button className="hero-cta" onClick={() => navigate('report')}>
          📸 Snap it. Send it. Let AI decide.
        </button>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div className="fade-in-2">
          <div className="section-head">
            <h2>Your Overview</h2>
            <span className="section-tagline">Every issue earns its priority.</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14, marginBottom: 28 }}>
            {STATS_CONFIG.map(({ key, label, icon, color, bg }, i) => (
              <div key={key} className="stat-card card-lift" style={{ animationDelay: `${i * 55}ms` }}>
                <div className="stat-icon" style={{ background: bg }}>{icon}</div>
                <div className="stat-value" style={{ color }}>{stats[key]}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Complaints ── */}
      {recent.length > 0 && (
        <div className="card fade-in-3" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>📋 Recent Complaints</div>
              <div className="section-tagline" style={{ marginTop: 2 }}>No spam. No guesswork. Just verified reality.</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('my-complaints')}>View All →</button>
          </div>
          <div>
            {recent.map((c, i) => {
              const s = STATUS_BADGE[c.status] || { cls: 'badge-pending', label: c.status };
              const mLink = mapLink(c.location);
              return (
                <div key={c._id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 20px',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                  cursor: 'default',
                }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  {c.imageUrl
                    ? <img src={c.imageUrl} alt="" style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                    : <div style={{ width: 46, height: 46, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📍</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{c.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      {c.location && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {c.location}</span>}
                      {mLink && <a href={mLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 7px', borderRadius: 6, textDecoration: 'none' }}>🗺️ Map</a>}
                      {c.estimatedCost > 0 && <span className="cost-chip">₹{c.estimatedCost.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                    {c.aiConfidence > 0 && <span className="ai-tag">🤖 {Math.round(c.aiConfidence * 100)}%</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Community Issues ── */}
      {community.length > 0 && (
        <div className="card fade-in-4">
          <div className="section-head" style={{ marginBottom: 16 }}>
            <h2>📣 Community Issues</h2>
            <span className="section-tagline">Real problems rise together.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {community.map((c) => {
              const mLink = mapLink(c.location);
              return (
                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', transition: 'border-color 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#bfdbfe'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>By {c.citizenId?.name || 'Citizen'}</span>
                      {c.location && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {c.location}</span>}
                      {mLink && <a href={mLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 7px', borderRadius: 6 }}>🗺️ Map</a>}
                    </div>
                  </div>
                  <button onClick={() => handleAck(c._id)} disabled={ackLoading[c._id]} style={{
                    background: c.userHasAcknowledged ? '#2563eb' : 'var(--bg-card)',
                    color: c.userHasAcknowledged ? '#fff' : '#2563eb',
                    border: '1.5px solid', borderColor: c.userHasAcknowledged ? '#2563eb' : '#bfdbfe',
                    borderRadius: 9, padding: '7px 14px', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}>
                    👍 Support {c.acknowledgementCount > 0 && `(${c.acknowledgementCount})`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!stats && !loading && (
        <div className="empty-state"><div className="empty-icon">📭</div><h3>No data yet</h3><p>Submit your first complaint to get started.</p></div>
      )}
    </div>
  );
}
