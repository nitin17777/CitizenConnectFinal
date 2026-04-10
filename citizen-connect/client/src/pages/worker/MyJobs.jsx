import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const JOB_TYPE_LABELS = {
  road_worker:        { label: '🛣️ Road Worker',       cls: 'badge-road_worker' },
  sanitation_worker:  { label: '🗑️ Sanitation',        cls: 'badge-sanitation_worker' },
  electrical_worker:  { label: '💡 Electrical',        cls: 'badge-electrical_worker' },
  general_worker:     { label: '🔧 General',           cls: 'badge-general_worker' },
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

// ── Complete Job Modal ───────────────────────────────────────────────────────
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
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 20, color: '#0f172a' }}>✅ Submit for Verification</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 18, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a' }}>
          <strong>Job:</strong> {job.description}
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Completion Note (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="form-input"
            rows={3} placeholder="Describe what was done, materials used, etc." style={{ resize: 'vertical' }} />
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Proof Image (recommended)</label>
          <div className="upload-zone">
            <input type="file" accept="image/*" onChange={handleFile} />
            {preview ? (
              <img src={preview} alt="proof" className="upload-preview" />
            ) : (
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Click to upload proof photo</div>
              </div>
            )}
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

// ── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onStartWork, onComplete, onRefresh }) {
  const sc  = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending_ai;
  const jt  = JOB_TYPE_LABELS[job.jobType] || JOB_TYPE_LABELS.general_worker;
  const mLink = job.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}` : null;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <span className={`badge ${sc.cls}`}>{sc.label}</span>
              <span className={`badge ${jt.cls}`}>{jt.label}</span>
              {job.severity && <span className={`badge badge-${job.severity}`}>{job.severity}</span>}
              {job.acknowledgementCount > 0 && (
                <span style={{ fontSize: 11, background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                  👍 {job.acknowledgementCount}
                </span>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>{job.description}</div>
            <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {job.location && <span>📍 {job.location}</span>}
              {mLink && (
                <a href={mLink} target="_blank" rel="noreferrer"
                  style={{ color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>
                  🗺️ Maps
                </a>
              )}
              <span>By {job.citizenId?.name || 'Citizen'}</span>
            </div>
          </div>
          {job.estimatedCost > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Est. Cost</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#16a34a' }}>₹{job.estimatedCost.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#16a34a' }}>≈ ₹{Math.round(job.estimatedCost * 0.1).toLocaleString()} earn</div>
            </div>
          )}
        </div>
      </div>

      {/* Completion proof section (if submitted) */}
      {job.status === 'completed_pending_verification' && (
        <div style={{ borderTop: '1px solid #fef9c3', background: '#fffbeb', padding: '12px 20px' }}>
          <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600, marginBottom: 6 }}>⏳ Awaiting Admin Verification</div>
          {job.completionNote && <div style={{ fontSize: 13, color: '#713f12' }}>📝 {job.completionNote}</div>}
          {job.completionProofImage && (
            <img src={job.completionProofImage} alt="proof" style={{ marginTop: 8, maxHeight: 120, borderRadius: 8, border: '1px solid #fde68a' }} />
          )}
        </div>
      )}

      {job.status === 'completed' && job.completionProofImage && (
        <div style={{ borderTop: '1px solid #dcfce7', background: '#f0fdf4', padding: '12px 20px' }}>
          <div style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 6 }}>🎉 Completed & Verified</div>
          <img src={job.completionProofImage} alt="proof" style={{ maxHeight: 120, borderRadius: 8 }} />
        </div>
      )}

      {/* Actions */}
      {(job.status === 'assigned' || job.status === 'in_progress') && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px 20px', display: 'flex', gap: 8 }}>
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MyJobs() {
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [completeTarget, setCompleteTarget] = useState(null);

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      const res = await api.get('/worker/my-jobs');
      setJobs(res.data.jobs || []);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartWork(id) {
    try {
      await api.patch(`/worker/jobs/${id}/status`, { status: 'in_progress' });
      toast.success('Job started!');
      fetchJobs();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading jobs…</div>;

  const active    = jobs.filter((j) => ['assigned', 'in_progress'].includes(j.status));
  const pending   = jobs.filter((j) => j.status === 'completed_pending_verification');
  const done      = jobs.filter((j) => j.status === 'completed');

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>🗂️ My Jobs</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{jobs.length} total assigned jobs</p>
      </div>

      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 600, fontSize: 16, color: '#64748b' }}>No jobs yet</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Accept a job from Available Jobs to get started.</div>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: 999, fontSize: 12 }}>Active</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {active.map((j) => <JobCard key={j._id} job={j} onStartWork={handleStartWork} onComplete={setCompleteTarget} onRefresh={fetchJobs} />)}
              </div>
            </section>
          )}

          {pending.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#fef9c3', color: '#713f12', padding: '3px 10px', borderRadius: 999, fontSize: 12 }}>⏳ Pending Verification</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pending.map((j) => <JobCard key={j._id} job={j} onStartWork={handleStartWork} onComplete={setCompleteTarget} onRefresh={fetchJobs} />)}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 999, fontSize: 12 }}>✅ Completed</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {done.map((j) => <JobCard key={j._id} job={j} onStartWork={handleStartWork} onComplete={setCompleteTarget} onRefresh={fetchJobs} />)}
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
