// ── Admin Complaints — Premium Redesign ──────────────────────────────────────
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_LIST = ['pending_ai', 'verified', 'rejected_by_ai', 'assigned', 'in_progress', 'completed_pending_verification', 'completed'];
const STATUS_CONFIG = {
  pending_ai:                     { label: 'Pending AI',       cls: 'badge-pending' },
  verified:                       { label: 'Verified',         cls: 'badge-verified' },
  rejected_by_ai:                 { label: 'Rejected by AI',   cls: 'badge-rejected' },
  assigned:                       { label: 'Assigned',         cls: 'badge-assigned' },
  in_progress:                    { label: 'In Progress',      cls: 'badge-progress' },
  completed_pending_verification: { label: '⏳ Pending Verify', cls: 'badge-verifying' },
  completed:                      { label: 'Completed',        cls: 'badge-completed' },
};
const JOB_TYPE_LABELS = {
  road_worker:       '🛣️ Road',
  sanitation_worker: '🗑️ Sanitation',
  electrical_worker: '💡 Electrical',
  general_worker:    '🔧 General',
};

function mapLink(location) {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [workers,    setWorkers]    = useState([]);
  const [filter,     setFilter]     = useState('all');
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState(null);
  const [verifying,  setVerifying]  = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [cRes, wRes] = await Promise.all([api.get('/admin/complaints'), api.get('/admin/workers')]);
      setComplaints(cRes.data.complaints || []);
      setWorkers(wRes.data.workers || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }

  const filtered    = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);
  const filterCount = (s) => s === 'all' ? complaints.length : complaints.filter(c => c.status === s).length;

  async function handleAssign(complaintId, workerId) {
    try {
      const res = await api.patch(`/admin/complaints/${complaintId}/assign`, { workerId });
      setComplaints(prev => prev.map(c => c._id === complaintId ? res.data.complaint : c));
      toast.success('Worker assigned!');
    } catch (e) { toast.error(e.response?.data?.error || 'Assign failed'); }
  }

  async function handleStatus(complaintId, status) {
    try {
      const res = await api.patch(`/admin/complaints/${complaintId}/status`, { status });
      setComplaints(prev => prev.map(c => c._id === complaintId ? res.data.complaint : c));
      toast.success('Status updated!');
    } catch (e) { toast.error(e.response?.data?.error || 'Update failed'); }
  }

  async function handleVerify(complaintId) {
    setVerifying(complaintId);
    try {
      const res = await api.patch(`/admin/complaints/${complaintId}/verify-completion`);
      setComplaints(prev => prev.map(c => c._id === complaintId ? res.data.complaint : c));
      toast.success('✅ Completion verified! Worker earnings credited.');
    } catch (e) { toast.error(e.response?.data?.error || 'Verification failed'); }
    finally { setVerifying(null); }
  }

  if (loading) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <div className="shimmer-box" style={{ height: 44, width: '35%', borderRadius: 10, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 7, marginBottom: 20 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="shimmer-box" style={{ height: 30, width: 90, borderRadius: 999 }} />)}
        </div>
        <div className="card" style={{ padding: 0 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14 }}>
              <div className="shimmer-box" style={{ height: 16, flex: 2 }} />
              <div className="shimmer-box" style={{ height: 16, width: 70 }} />
              <div className="shimmer-box" style={{ height: 16, width: 80 }} />
              <div className="shimmer-box" style={{ height: 16, width: 90 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* ── Header ── */}
      <div className="fade-in" style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>📋 All Complaints</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{complaints.length} total</p>
          <span className="ai-tag">🤖 AI-Filtered</span>
          <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 600, letterSpacing: 0.4 }}>No spam. No guesswork.</span>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="fade-in-2" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {['all', ...STATUS_LIST].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '5px 12px', borderRadius: 999, border: '1.5px solid',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            background: filter === s ? '#2563eb' : 'var(--bg-card)',
            color: filter === s ? '#fff' : 'var(--text-muted)',
            borderColor: filter === s ? '#2563eb' : 'var(--border)',
          }}>
            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s} ({filterCount(s)})
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="card fade-in-3" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category / Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>AI Report</th>
                <th>Est. Cost</th>
                <th>Citizen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sc      = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending_ai;
                const isExp   = expanded === c._id;
                const mLink   = mapLink(c.location);
                const confPct = Math.round((c.aiConfidence || 0) * 100);
                const confCls = confPct > 70 ? 'high' : confPct > 40 ? 'medium' : 'low';
                return (
                  <>
                    <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : c._id)}>
                      <td style={{ maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>
                        {c.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {c.location}</span>
                            {mLink && <a href={mLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: '#2563eb', background: '#dbeafe', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>Map</a>}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: 'var(--text)', textTransform: 'capitalize', fontWeight: 500 }}>{c.category}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{JOB_TYPE_LABELS[c.jobType] || '—'}</div>
                      </td>
                      <td>{c.severity ? <span className={`badge badge-${c.severity}`}>{c.severity}</span> : <span style={{ color: 'var(--text-subtle)' }}>—</span>}</td>
                      <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                      <td style={{ minWidth: 130 }}>
                        {/* AI Verdict + bar */}
                        {c.aiVerdict && (
                          <span className={`badge badge-${c.aiVerdict.toLowerCase()}`} style={{ marginBottom: 5, display: 'inline-block' }}>{c.aiVerdict}</span>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="confidence-bar" style={{ flex: 1 }}>
                            <div className={`confidence-fill ${confCls}`} style={{ width: `${confPct}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', minWidth: 30 }}>{confPct}%</span>
                        </div>
                      </td>
                      <td>
                        {c.estimatedCost
                          ? <span className="cost-chip">₹{c.estimatedCost.toLocaleString()}</span>
                          : <span style={{ color: 'var(--text-subtle)' }}>—</span>
                        }
                      </td>
                      <td style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.citizenId?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.citizenId?.email}</div>
                      </td>
                      <td onClick={e => e.stopPropagation()} style={{ minWidth: 150 }}>
                        {c.status === 'completed_pending_verification' && (
                          <button className="btn btn-success btn-sm" style={{ marginBottom: 6, width: '100%', justifyContent: 'center' }}
                            onClick={() => handleVerify(c._id)} disabled={verifying === c._id}>
                            {verifying === c._id ? '⏳' : '✅ Verify'}
                          </button>
                        )}
                        {c.status === 'verified' && (
                          <select style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer', width: '100%', marginBottom: 5, background: 'var(--bg-card)', color: 'var(--text)' }}
                            defaultValue="" onChange={e => e.target.value && handleAssign(c._id, e.target.value)}>
                            <option value="" disabled>Assign worker…</option>
                            {workers.map(w => <option key={w._id} value={w._id}>{w.name} ({w.specialization?.replace('_', ' ')})</option>)}
                          </select>
                        )}
                        <select value={c.status}
                          style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer', width: '100%', background: 'var(--bg-card)', color: 'var(--text)' }}
                          onChange={e => handleStatus(c._id, e.target.value)}>
                          {STATUS_LIST.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>)}
                        </select>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {isExp && (
                      <tr key={`${c._id}-exp`}>
                        <td colSpan={8} style={{ padding: 0 }}>
                          <div style={{ background: 'var(--bg)', padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 13 }}>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Full Description</div>
                              <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{c.description}</div>
                              {c.imageUrl && <img src={c.imageUrl} alt="complaint" style={{ marginTop: 10, maxHeight: 140, borderRadius: 8, border: '1px solid var(--border)' }} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>AI Report</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div>Verdict: <span className={`badge badge-${(c.aiVerdict || '').toLowerCase()}`}>{c.aiVerdict || '—'}</span></div>
                                <div>Issue Type: <strong style={{ textTransform: 'capitalize', color: 'var(--text)' }}>{c.issueType}</strong></div>
                                <div>Priority: <strong style={{ textTransform: 'capitalize', color: 'var(--text)' }}>{c.priority}</strong></div>
                                <div>Community Support: 👍 {c.acknowledgementCount || 0}</div>
                                {c.assignedWorkerId && <div>Worker: <strong style={{ color: 'var(--text)' }}>{c.assignedWorkerId.name}</strong></div>}
                              </div>
                              {c.rejectionReason && (
                                <div style={{ marginTop: 10, background: '#fee2e2', borderRadius: 8, padding: '8px 12px', color: '#991b1b', fontSize: 12 }}>❌ {c.rejectionReason}</div>
                              )}
                            </div>
                            <div>
                              {(c.completionNote || c.completionProofImage) ? (
                                <>
                                  <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Completion Details</div>
                                  {c.completionNote && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', color: '#166534', marginBottom: 8 }}>📝 {c.completionNote}</div>}
                                  {c.completionProofImage && <img src={c.completionProofImage} alt="proof" style={{ maxHeight: 140, borderRadius: 8, border: '1px solid var(--border)' }} />}
                                  {c.completedAt && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Submitted: {new Date(c.completedAt).toLocaleString()}</div>}
                                  {c.status === 'completed_pending_verification' && (
                                    <button className="btn btn-success btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
                                      onClick={() => handleVerify(c._id)} disabled={verifying === c._id}>
                                      {verifying === c._id ? '⏳ Verifying…' : '✅ Approve & Credit Worker'}
                                    </button>
                                  )}
                                </>
                              ) : <div style={{ color: 'var(--text-subtle)', fontSize: 13 }}>No completion details yet.</div>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state"><div className="empty-icon">🔍</div><h3>No complaints match this filter</h3></div>
          )}
        </div>
      </div>
    </div>
  );
}
