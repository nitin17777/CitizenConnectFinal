import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  pending_ai:                     { label: 'Pending AI',      cls: 'badge-pending',   color: '#d97706' },
  verified:                       { label: 'Verified',        cls: 'badge-verified',  color: '#16a34a' },
  rejected_by_ai:                 { label: 'Rejected by AI',  cls: 'badge-rejected',  color: '#dc2626' },
  assigned:                       { label: 'Assigned',        cls: 'badge-assigned',  color: '#2563eb' },
  in_progress:                    { label: 'In Progress',     cls: 'badge-progress',  color: '#0891b2' },
  completed_pending_verification: { label: 'Awaiting Verification', cls: 'badge-verifying', color: '#d97706' },
  completed:                      { label: 'Completed',       cls: 'badge-completed', color: '#7c3aed' },
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
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  const filterLabel = (f) => {
    if (f === 'all') return `All (${complaints.length})`;
    const cnt = complaints.filter((c) => c.status === f).length;
    const lbl = STATUS_CONFIG[f]?.label || f;
    return `${lbl} (${cnt})`;
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading complaints…</div>;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>📋 My Complaints</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{complaints.length} total complaints submitted</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 999, border: '1px solid',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: filter === f ? '#2563eb' : '#fff',
              color: filter === f ? '#fff' : '#64748b',
              borderColor: filter === f ? '#2563eb' : '#e2e8f0',
            }}>
            {filterLabel(f)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>No complaints found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((c) => {
            const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending_ai;
            const isExp = expanded === c._id;
            const mLink = mapLink(c.location);
            return (
              <div key={c._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Card header */}
                <div style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}
                  onClick={() => setExpanded(isExp ? null : c._id)}>
                  {c.imageUrl && (
                    <img src={c.imageUrl} alt="complaint" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span className={`badge ${sc.cls}`}>{sc.label}</span>
                      <span className="badge badge-moderate" style={{ textTransform: 'capitalize' }}>{c.category}</span>
                      {c.severity && <span className={`badge badge-${c.severity}`}>{c.severity}</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                      {c.location && <span>📍 {c.location}</span>}
                      {mLink && (
                        <a href={mLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                          style={{ color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>
                          🗺️ Open in Maps
                        </a>
                      )}
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {c.estimatedCost > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
                        ₹{c.estimatedCost.toLocaleString()}
                      </span>
                    )}
                    <span style={{ color: '#94a3b8', fontSize: 18 }}>{isExp ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded */}
                {isExp && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', background: '#f8fafc' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13 }}>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>AI Verdict</div>
                        <span className={`badge badge-${(c.aiVerdict || 'suspicious').toLowerCase()}`}>{c.aiVerdict || '—'}</span>
                      </div>
                      <div>
                        <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>AI Confidence</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="confidence-bar" style={{ flex: 1 }}>
                            <div className={`confidence-fill ${c.aiConfidence > 0.7 ? 'high' : c.aiConfidence > 0.4 ? 'medium' : 'low'}`}
                              style={{ width: `${(c.aiConfidence || 0) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{((c.aiConfidence || 0) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      {c.assignedWorkerId && (
                        <div>
                          <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Assigned Worker</div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.assignedWorkerId.name}</div>
                        </div>
                      )}
                      {c.status === 'completed_pending_verification' && (
                        <div style={{ gridColumn: '1/-1' }}>
                          <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#713f12' }}>
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
                      <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12 }}>
                        👍 {c.acknowledgementCount || 0} community acknowledgements
                        • Priority: <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{c.priority || 'low'}</strong>
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
