// ── Citizen MyComplaints — Premium Redesign ──────────────────────────────────
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  pending_ai:                     { label: 'Pending AI',          cls: 'badge-pending',   color: '#d97706' },
  verified:                       { label: 'Verified',            cls: 'badge-verified',  color: '#16a34a' },
  rejected_by_ai:                 { label: 'Rejected by AI',      cls: 'badge-rejected',  color: '#dc2626' },
  assigned:                       { label: 'Assigned',            cls: 'badge-assigned',  color: '#2563eb' },
  in_progress:                    { label: 'In Progress',         cls: 'badge-progress',  color: '#0891b2' },
  completed_pending_verification: { label: 'Awaiting Verification', cls: 'badge-verifying', color: '#d97706' },
  completed:                      { label: 'Completed',           cls: 'badge-completed', color: '#7c3aed' },
};

const FILTERS = ['all', 'pending_ai', 'verified', 'rejected_by_ai', 'assigned', 'in_progress', 'completed_pending_verification', 'completed'];

function mapLink(location) {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default function MyComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter]         = useState('all');
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null);

  useEffect(() => { fetchComplaints(); }, []);

  async function fetchComplaints() {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.complaints || []);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  }

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const filterLabel = (f) => {
    if (f === 'all') return `All (${complaints.length})`;
    const cnt = complaints.filter(c => c.status === f).length;
    return `${STATUS_CONFIG[f]?.label || f} (${cnt})`;
  };

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
        <div className="shimmer-box" style={{ height: 48, width: '40%', borderRadius: 10, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[1,2,3,4].map(i => <div key={i} className="shimmer-box" style={{ height: 32, width: 100, borderRadius: 999 }} />)}
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} className="card" style={{ marginBottom: 12, padding: 18 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div className="shimmer-box" style={{ height: 22, width: 80, borderRadius: 999 }} />
              <div className="shimmer-box" style={{ height: 22, width: 60, borderRadius: 999 }} />
            </div>
            <div className="shimmer-box" style={{ height: 16, width: '70%', marginBottom: 8 }} />
            <div className="shimmer-box" style={{ height: 12, width: '45%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div className="fade-in" style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>📋 My Complaints</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{complaints.length} total submitted</p>
          <span className="ai-tag">🤖 AI-Gated Pipeline</span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="fade-in-2" style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 13px', borderRadius: 999, border: '1.5px solid',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            background: filter === f ? '#2563eb' : 'var(--bg-card)',
            color: filter === f ? '#fff' : 'var(--text-muted)',
            borderColor: filter === f ? '#2563eb' : 'var(--border)',
          }}>
            {filterLabel(f)}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div className="empty-state fade-in-2">
          <div className="empty-icon">📭</div>
          <h3>No complaints found</h3>
          <p>Try a different filter or report a new issue.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((c, idx) => {
            const sc    = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending_ai;
            const isExp = expanded === c._id;
            const mLink = mapLink(c.location);
            const confPct = Math.round((c.aiConfidence || 0) * 100);
            const confCls = confPct > 70 ? 'high' : confPct > 40 ? 'medium' : 'low';
            return (
              <div key={c._id} className={`card card-lift fade-in`} style={{ padding: 0, overflow: 'hidden', animationDelay: `${idx * 40}ms` }}>
                {/* Status accent bar */}
                <div style={{ height: 3, background: sc.color, opacity: 0.6 }} />

                {/* Card header */}
                <div style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}
                  onClick={() => setExpanded(isExp ? null : c._id)}>
                  {c.imageUrl
                    ? <img src={c.imageUrl} alt="complaint" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
                    : null
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 5 }}>
                      <span className={`badge ${sc.cls}`}>{sc.label}</span>
                      <span className="badge badge-moderate" style={{ textTransform: 'capitalize' }}>{c.category}</span>
                      {c.severity && <span className={`badge badge-${c.severity}`}>{c.severity}</span>}
                      {c.aiVerdict && <span className={`badge badge-${c.aiVerdict.toLowerCase()}`}>{c.aiVerdict}</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      {c.location && <span>📍 {c.location}</span>}
                      {mLink && <a href={mLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>🗺️ Map</a>}
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    {c.estimatedCost > 0 && <span className="cost-chip">₹{c.estimatedCost.toLocaleString()}</span>}
                    {confPct > 0 && <span className="ai-tag">🤖 {confPct}%</span>}
                    <span style={{ color: 'var(--text-subtle)', fontSize: 16, marginTop: 2 }}>{isExp ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExp && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px', background: 'var(--bg)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
                      <div>
                        <div style={{ color: 'var(--text-subtle)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>AI Verdict</div>
                        <span className={`badge badge-${(c.aiVerdict || 'suspicious').toLowerCase()}`}>{c.aiVerdict || '—'}</span>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-subtle)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>AI Confidence</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="confidence-bar" style={{ flex: 1 }}>
                            <div className={`confidence-fill ${confCls}`} style={{ width: `${confPct}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{confPct}%</span>
                        </div>
                      </div>
                      {c.assignedWorkerId && (
                        <div>
                          <div style={{ color: 'var(--text-subtle)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Assigned Worker</div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.assignedWorkerId.name}</div>
                        </div>
                      )}
                      {c.status === 'completed_pending_verification' && (
                        <div style={{ gridColumn: '1/-1' }}>
                          <div className="info-banner amber" style={{ marginBottom: 0 }}>
                            ⏳ Worker has submitted this job for review. Awaiting admin verification.
                          </div>
                        </div>
                      )}
                      {c.rejectionReason && (
                        <div style={{ gridColumn: '1/-1' }}>
                          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#991b1b' }}>
                            ❌ {c.rejectionReason}
                          </div>
                        </div>
                      )}
                      <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                        👍 {c.acknowledgementCount || 0} community support
                        <span>•</span>
                        Priority: <strong style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{c.priority || 'low'}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
