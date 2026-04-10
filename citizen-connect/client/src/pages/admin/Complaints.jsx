import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_LIST = ['pending_ai', 'verified', 'rejected_by_ai', 'assigned', 'in_progress', 'completed_pending_verification', 'completed'];
const STATUS_CONFIG = {
  pending_ai:                     { label: 'Pending AI',      cls: 'badge-pending' },
  verified:                       { label: 'Verified',        cls: 'badge-verified' },
  rejected_by_ai:                 { label: 'Rejected by AI',  cls: 'badge-rejected' },
  assigned:                       { label: 'Assigned',        cls: 'badge-assigned' },
  in_progress:                    { label: 'In Progress',     cls: 'badge-progress' },
  completed_pending_verification: { label: '⏳ Pending Verify', cls: 'badge-verifying' },
  completed:                      { label: 'Completed',       cls: 'badge-completed' },
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

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  const filterCount = (s) => s === 'all' ? complaints.length : complaints.filter((c) => c.status === s).length;

  async function handleAssign(complaintId, workerId) {
    try {
      const res = await api.patch(`/admin/complaints/${complaintId}/assign`, { workerId });
      setComplaints((prev) => prev.map((c) => c._id === complaintId ? res.data.complaint : c));
      toast.success('Worker assigned!');
    } catch (e) { toast.error(e.response?.data?.error || 'Assign failed'); }
  }

  async function handleStatus(complaintId, status) {
    try {
      const res = await api.patch(`/admin/complaints/${complaintId}/status`, { status });
      setComplaints((prev) => prev.map((c) => c._id === complaintId ? res.data.complaint : c));
      toast.success('Status updated!');
    } catch (e) { toast.error(e.response?.data?.error || 'Update failed'); }
  }

  async function handleVerify(complaintId) {
    setVerifying(complaintId);
    try {
      const res = await api.patch(`/admin/complaints/${complaintId}/verify-completion`);
      setComplaints((prev) => prev.map((c) => c._id === complaintId ? res.data.complaint : c));
      toast.success('✅ Completion verified! Worker earnings credited.');
    } catch (e) { toast.error(e.response?.data?.error || 'Verification failed'); }
    finally { setVerifying(null); }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading complaints…</div>;

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>📋 All Complaints</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{complaints.length} total complaints</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {['all', ...STATUS_LIST].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: '5px 12px', borderRadius: 999, border: '1px solid',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: filter === s ? '#2563eb' : '#fff',
              color: filter === s ? '#fff' : '#64748b',
              borderColor: filter === s ? '#2563eb' : '#e2e8f0',
            }}>
            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s} ({filterCount(s)})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Job Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>AI Confidence</th>
                <th>Est. Cost</th>
                <th>Citizen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sc  = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending_ai;
                const isExp = expanded === c._id;
                const mLink = mapLink(c.location);
                const confPct = Math.round((c.aiConfidence || 0) * 100);
                const confCls = confPct > 70 ? 'high' : confPct > 40 ? 'medium' : 'low';

                return (
                  <>
                    <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : c._id)}>
                      <td style={{ maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>
                        {c.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <span style={{ fontSize: 11, color: '#64748b' }}>📍 {c.location}</span>
                            {mLink && (
                              <a href={mLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                                style={{ fontSize: 10, color: '#2563eb', background: '#dbeafe', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>Map</a>
                            )}
                          </div>
                        )}
                      </td>
                      <td><span style={{ fontSize: 12, color: '#374151', textTransform: 'capitalize' }}>{c.category}</span></td>
                      <td><span style={{ fontSize: 12, color: '#374151' }}>{JOB_TYPE_LABELS[c.jobType] || '—'}</span></td>
                      <td>{c.severity ? <span className={`badge badge-${c.severity}`}>{c.severity}</span> : '—'}</td>
                      <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="confidence-bar" style={{ flex: 1 }}>
                            <div className={`confidence-fill ${confCls}`} style={{ width: `${confPct}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', minWidth: 32 }}>{confPct}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#16a34a' }}>
                        {c.estimatedCost ? `₹${c.estimatedCost.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.citizenId?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{c.citizenId?.email}</div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {/* Verify Completion button — most important action */}
                        {c.status === 'completed_pending_verification' && (
                          <button className="btn btn-success btn-sm"
                            style={{ marginBottom: 6, width: '100%' }}
                            onClick={() => handleVerify(c._id)}
                            disabled={verifying === c._id}>
                            {verifying === c._id ? '⏳' : '✅ Verify'}
                          </button>
                        )}
                        {/* Assign worker */}
                        {c.status === 'verified' && (
                          <select
                            style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: 12, cursor: 'pointer', width: '100%', marginBottom: 4, background: '#fff', color: '#0f172a' }}
                            defaultValue=""
                            onChange={(e) => e.target.value && handleAssign(c._id, e.target.value)}>
                            <option value="" disabled>Assign worker…</option>
                            {workers.map((w) => (
                              <option key={w._id} value={w._id}>{w.name} ({w.specialization?.replace('_', ' ')})</option>
                            ))}
                          </select>
                        )}
                        {/* Status select */}
                        <select
                          value={c.status}
                          style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: 12, cursor: 'pointer', width: '100%', background: '#fff', color: '#0f172a' }}
                          onChange={(e) => handleStatus(c._id, e.target.value)}>
                          {STATUS_LIST.map((s) => (
                            <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {isExp && (
                      <tr key={`${c._id}-exp`}>
                        <td colSpan={9} style={{ padding: 0 }}>
                          <div style={{ background: '#f8fafc', padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 13 }}>
                            {/* Left column */}
                            <div>
                              <div style={{ fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Full Description</div>
                              <div style={{ color: '#0f172a', lineHeight: 1.6 }}>{c.description}</div>
                              {c.imageUrl && (
                                <img src={c.imageUrl} alt="complaint" style={{ marginTop: 10, maxHeight: 140, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                              )}
                            </div>
                            {/* Middle column */}
                            <div>
                              <div style={{ fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>AI Report</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div>Verdict: <span className={`badge badge-${(c.aiVerdict || '').toLowerCase()}`}>{c.aiVerdict || '—'}</span></div>
                                <div>Issue Type: <strong style={{ textTransform: 'capitalize' }}>{c.issueType}</strong></div>
                                <div>Priority: <strong style={{ textTransform: 'capitalize' }}>{c.priority}</strong></div>
                                <div>Community Support: 👍 {c.acknowledgementCount || 0}</div>
                                {c.assignedWorkerId && <div>Worker: <strong>{c.assignedWorkerId.name}</strong></div>}
                              </div>
                              {c.rejectionReason && (
                                <div style={{ marginTop: 10, background: '#fee2e2', borderRadius: 8, padding: '8px 12px', color: '#991b1b', fontSize: 12 }}>
                                  ❌ {c.rejectionReason}
                                </div>
                              )}
                            </div>
                            {/* Right column — completion details */}
                            <div>
                              {(c.completionNote || c.completionProofImage) ? (
                                <>
                                  <div style={{ fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Completion Details</div>
                                  {c.completionNote && (
                                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', color: '#166534', marginBottom: 8 }}>
                                      📝 {c.completionNote}
                                    </div>
                                  )}
                                  {c.completionProofImage && (
                                    <div>
                                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Proof Photo:</div>
                                      <img src={c.completionProofImage} alt="proof" style={{ maxHeight: 140, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                    </div>
                                  )}
                                  {c.completedAt && (
                                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                                      Submitted: {new Date(c.completedAt).toLocaleString()}
                                    </div>
                                  )}
                                  {c.status === 'completed_pending_verification' && (
                                    <button className="btn btn-success btn-sm" style={{ marginTop: 10, width: '100%' }}
                                      onClick={() => handleVerify(c._id)} disabled={verifying === c._id}>
                                      {verifying === c._id ? '⏳ Verifying…' : '✅ Approve & Credit Worker'}
                                    </button>
                                  )}
                                </>
                              ) : (
                                <div style={{ color: '#94a3b8', fontSize: 13 }}>No completion details yet.</div>
                              )}
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
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>No complaints match this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
