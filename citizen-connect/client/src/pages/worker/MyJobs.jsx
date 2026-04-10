// ── Worker MyJobs — Premium Redesign ─────────────────────────────────────────
import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const JOB_TYPE_LABELS = {
  road_worker:       { label: '🛣️ Road Worker',  cls: 'badge-road_worker' },
  sanitation_worker: { label: '🗑️ Sanitation',   cls: 'badge-sanitation_worker' },
  electrical_worker: { label: '💡 Electrical',   cls: 'badge-electrical_worker' },
  general_worker:    { label: '🔧 General',      cls: 'badge-general_worker' },
};

const STATUS_CONFIG = {
  pending_ai:                     { label: 'Pending AI',      cls: 'badge-pending' },
  verified:                       { label: 'Verified',        cls: 'badge-verified' },
  rejected_by_ai:                 { label: 'Rejected',        cls: 'badge-rejected' },
  assigned:                       { label: 'Assigned',        cls: 'badge-assigned' },
  in_progress:                    { label: 'In Progress',     cls: 'badge-progress' },
  completed_pending_verification: { label: '⏳ Pending Verify', cls: 'badge-verifying' },
  completed:                      { label: 'Completed',       cls: 'badge-completed' },
};

function mapLink(location) {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

// ── Complete Job Modal ────────────────────────────────────────────────────────
function CompleteModal({ job, onClose, onDone }) {
  const [note, setNote]       = useState('');
  const [proof, setProof]     = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setProof(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('completionNote', note);
      if (proof) fd.append('proofImage', proof);
      await api.patch(`/worker/jobs/${job._id}/complete`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Job submitted for verification!');
      onDone();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to submit'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>✅ Submit for Verification</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 18, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text)' }}>
          <strong>Job:</strong> {job.description}
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Completion Note (optional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} className="form-input"
            rows={3} placeholder="Describe what was done, materials used, etc." style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Proof Image (recommended)</label>
          <div className="upload-zone">
            <input type="file" accept="image/*" onChange={handleFile} />
            {preview
              ? <img src={preview} alt="proof" className="upload-preview" />
              : <div><div style={{ fontSize: 28, marginBottom: 8 }}>📷</div><div style={{ fontSize: 13, color: '#64748b' }}>Click to upload proof photo</div></div>
            }
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary w-full" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-success w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Submitting…' : '✅ Submit for Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onStartWork, onComplete, onRefresh }) {
  const sc    = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending_ai;
  const jt    = JOB_TYPE_LABELS[job.jobType] || JOB_TYPE_LABELS.general_worker;
  const mLink = job.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}` : null;
  const isActive = ['assigned', 'in_progress'].includes(job.status);

  return (
    <div className="card card-lift" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Status accent */}
      <div style={{ height: 3, background: isActive ? '#2563eb' : job.status === 'completed' ? '#16a34a' : job.status === 'completed_pending_verification' ? '#d97706' : '#94a3b8' }} />

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 7, alignItems: 'center' }}>
              <span className={`badge ${sc.cls}`}>{sc.label}</span>
              <span className={`badge ${jt.cls}`}>{jt.label}</span>
              {job.severity && <span className={`badge badge-${job.severity}`}>{job.severity}</span>}
              <span className="ai-tag">🤖 AI Verified Task</span>
              {job.acknowledgementCount > 0 && (
                <span style={{ fontSize: 11, background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                  👍 {job.acknowledgementCount}
                </span>
              )}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 5, lineHeight: 1.4 }}>{job.description}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {job.location && <span>📍 {job.location}</span>}
              {mLink && <a href={mLink} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>🗺️ Map</a>}
              <span>By {job.citizenId?.name || 'Citizen'}</span>
            </div>
          </div>
          {job.estimatedCost > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0, background: 'var(--bg)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Est. Cost</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#16a34a', fontFamily: 'Outfit,sans-serif' }}>₹{job.estimatedCost.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>≈ ₹{Math.round(job.estimatedCost * 0.1).toLocaleString()} earn</div>
            </div>
          )}
        </div>
      </div>

      {/* Pending verification notice */}
      {job.status === 'completed_pending_verification' && (
        <div style={{ borderTop: '1px solid #fde68a', background: '#fffbeb', padding: '12px 18px' }}>
          <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>⏳ Awaiting Admin Verification</div>
          {job.completionNote && <div style={{ fontSize: 13, color: '#713f12' }}>📝 {job.completionNote}</div>}
          {job.completionProofImage && <img src={job.completionProofImage} alt="proof" style={{ marginTop: 8, maxHeight: 120, borderRadius: 8, border: '1px solid #fde68a' }} />}
        </div>
      )}

      {/* Completed proof */}
      {job.status === 'completed' && job.completionProofImage && (
        <div style={{ borderTop: '1px solid #bbf7d0', background: '#f0fdf4', padding: '12px 18px' }}>
          <div style={{ fontSize: 13, color: '#166534', fontWeight: 700, marginBottom: 6 }}>🎉 Completed & Verified — Great work!</div>
          <img src={job.completionProofImage} alt="proof" style={{ maxHeight: 120, borderRadius: 8 }} />
        </div>
      )}

      {/* Actions */}
      {isActive && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 18px', display: 'flex', gap: 8 }}>
          {job.status === 'assigned' && (
            <button className="btn btn-primary btn-sm" onClick={() => onStartWork(job._id)}>▶ Start Work</button>
          )}
          {job.status === 'in_progress' && (
            <button className="btn btn-success btn-sm" onClick={() => onComplete(job)}>✅ Submit Completion</button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [completeTarget, setCompleteTarget] = useState(null);

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      const res = await api.get('/worker/my-jobs');
      setJobs(res.data.jobs || []);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }

  async function handleStartWork(id) {
    try {
      await api.patch(`/worker/jobs/${id}/status`, { status: 'in_progress' });
      toast.success('Job started!');
      fetchJobs();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  }

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
        <div className="shimmer-box" style={{ height: 80, borderRadius: 14, marginBottom: 24 }} />
        {[1,2,3].map(i => (
          <div key={i} className="card" style={{ marginBottom: 12, padding: 18 }}>
            <div className="shimmer-box" style={{ height: 16, width: '60%', marginBottom: 10 }} />
            <div className="shimmer-box" style={{ height: 12, width: '40%' }} />
          </div>
        ))}
      </div>
    );
  }

  const active  = jobs.filter(j => ['assigned', 'in_progress'].includes(j.status));
  const pending = jobs.filter(j => j.status === 'completed_pending_verification');
  const done    = jobs.filter(j => j.status === 'completed');
  const earnings = user?.workerEarnings || 0;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>

      {/* ── Mini Stats Bar ── */}
      <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Active Jobs',    value: active.length,  icon: '🔧', color: '#2563eb', bg: '#dbeafe' },
          { label: 'Jobs Completed', value: done.length,    icon: '✅', color: '#16a34a', bg: '#dcfce7' },
          { label: 'Total Earned',   value: `₹${earnings.toLocaleString()}`, icon: '💰', color: '#7c3aed', bg: '#ede9fe' },
        ].map(s => (
          <div key={s.label} className="stat-card card-lift">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state fade-in">
          <div className="empty-icon">📭</div>
          <h3>No jobs yet</h3>
          <p>Accept a verified job from Available Jobs to get started. Your work creates real impact.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="fade-in-2" style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>🔧 Active ({active.length})</span>
                <span className="section-tagline">You can handle one mission at a time.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {active.map(j => <JobCard key={j._id} job={j} onStartWork={handleStartWork} onComplete={setCompleteTarget} onRefresh={fetchJobs} />)}
              </div>
            </section>
          )}

          {pending.length > 0 && (
            <section className="fade-in-2" style={{ marginBottom: 28 }}>
              <div style={{ marginBottom: 14 }}>
                <span style={{ background: '#fef9c3', color: '#713f12', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>⏳ Pending Verification ({pending.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map(j => <JobCard key={j._id} job={j} onStartWork={handleStartWork} onComplete={setCompleteTarget} onRefresh={fetchJobs} />)}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section className="fade-in-3">
              <div style={{ marginBottom: 14 }}>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>✅ Completed ({done.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {done.map(j => <JobCard key={j._id} job={j} onStartWork={handleStartWork} onComplete={setCompleteTarget} onRefresh={fetchJobs} />)}
              </div>
            </section>
          )}
        </>
      )}

      {completeTarget && (
        <CompleteModal
          job={completeTarget}
          onClose={() => setCompleteTarget(null)}
          onDone={() => { setCompleteTarget(null); fetchJobs(); }}
        />
      )}
    </div>
  );
}
