// ── Worker AvailableJobs — Premium Redesign ──────────────────────────────────
import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const JOB_TYPE_LABELS = {
  road_worker:       { label: '🛣️ Road',       cls: 'badge-road_worker' },
  sanitation_worker: { label: '🗑️ Sanitation', cls: 'badge-sanitation_worker' },
  electrical_worker: { label: '💡 Electrical', cls: 'badge-electrical_worker' },
  general_worker:    { label: '🔧 General',    cls: 'badge-general_worker' },
};

const PRIORITY_CONFIG = {
  high:   { bg: '#fee2e2', color: '#991b1b', label: '🔴 HIGH PRIORITY' },
  medium: { bg: '#fef3c7', color: '#92400e', label: '🟡 MEDIUM' },
};

function mapLink(loc) {
  if (!loc) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
}

function JobSkeleton() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      <div className="shimmer-box" style={{ height: 170, borderRadius: 18, marginBottom: 20 }} />
      {[1,2,3].map(i => (
        <div key={i} className="card" style={{ marginBottom: 14, padding: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div className="shimmer-box" style={{ height: 22, width: 80, borderRadius: 999 }} />
            <div className="shimmer-box" style={{ height: 22, width: 60, borderRadius: 999 }} />
          </div>
          <div className="shimmer-box" style={{ height: 16, width: '70%', marginBottom: 8 }} />
          <div className="shimmer-box" style={{ height: 12, width: '40%' }} />
        </div>
      ))}
    </div>
  );
}

export default function AvailableJobs() {
  const { user } = useAuth();
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      const res = await api.get('/worker/jobs');
      setJobs(res.data.jobs || []);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }

  async function handleAccept(id) {
    setAccepting(id);
    try {
      await api.patch(`/worker/jobs/${id}/accept`);
      toast.success('Job accepted! Go to My Jobs to get started.');
      fetchJobs();
    } catch (e) { toast.error(e.response?.data?.error || 'Could not accept job'); }
    finally { setAccepting(null); }
  }

  const spec       = user?.specialization || 'general_worker';
  const specLabel  = JOB_TYPE_LABELS[spec]?.label || '🔧 General Worker';
  const available  = jobs.filter(j => j.status === 'verified');
  const hasActive  = jobs.some(j => ['assigned', 'in_progress'].includes(j.status));

  if (loading) return <JobSkeleton />;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>

      {/* ── Hero Banner ── */}
      <div className="hero-banner teal fade-in">
        <div className="hero-eyebrow">✦ AI-Verified Jobs Only</div>
        <h1 className="hero-title">Real problems. Real action.</h1>
        <p className="hero-sub">
          Only verified issues reach you — filtered by AI, prioritized by your community.
          <br />Your work creates real impact.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
            {specLabel}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            {available.length} matching job{available.length !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>

      {/* ── Active Job Limit Banner ── */}
      {hasActive ? (
        <div className="info-banner amber fade-in-2">
          <span style={{ fontSize: 18, flexShrink: 0 }}>🎯</span>
          <div>
            <strong>You can handle one mission at a time.</strong><br />
            Complete your active job before accepting a new one. Go to <strong>My Jobs</strong> to continue.
          </div>
        </div>
      ) : (
        <div className="info-banner blue fade-in-2">
          <span style={{ fontSize: 16 }}>ℹ️</span>
          <span>Jobs with higher community support <strong>(👍)</strong> are listed first. Only AI-verified complaints are shown.</span>
        </div>
      )}

      {/* ── Jobs List ── */}
      {available.length === 0 ? (
        <div className="empty-state fade-in-2">
          <div className="empty-icon">✅</div>
          <h3>No matching jobs right now</h3>
          <p>Check back later — new verified complaints are added as citizens report issues.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {available.map((job, idx) => {
            const jt      = JOB_TYPE_LABELS[job.jobType] || JOB_TYPE_LABELS.general_worker;
            const mLink   = mapLink(job.location);
            const earning = Math.round((job.estimatedCost || 0) * 0.10);
            const pCfg    = PRIORITY_CONFIG[job.priority];
            return (
              <div key={job._id} className="card card-lift fade-in" style={{ padding: 0, overflow: 'hidden', animationDelay: `${idx * 50}ms` }}>
                {/* Card top accent bar for priority */}
                {pCfg && <div style={{ height: 3, background: job.priority === 'high' ? '#ef4444' : '#f59e0b' }} />}

                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ flex: 1 }}>
                      {/* Badges row */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
                        <span className="ai-tag">🤖 AI Verified Task</span>
                        <span className={`badge ${jt.cls}`}>{jt.label}</span>
                        {job.severity && <span className={`badge badge-${job.severity}`}>{job.severity}</span>}
                        <span style={{ fontSize: 11, background: 'var(--bg)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 999, fontWeight: 600, textTransform: 'capitalize', border: '1px solid var(--border)' }}>
                          {job.category}
                        </span>
                        {job.acknowledgementCount > 0 && (
                          <span style={{ fontSize: 11, background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                            👍 {job.acknowledgementCount} support{job.acknowledgementCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {pCfg && (
                          <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, fontWeight: 700, background: pCfg.bg, color: pCfg.color }}>
                            {pCfg.label}
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6, lineHeight: 1.4 }}>{job.description}</div>

                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        {job.location && <span>📍 {job.location}</span>}
                        {mLink && <a href={mLink} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>🗺️ Map</a>}
                        <span>Reported by {job.citizenId?.name || 'Citizen'}</span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Right side — cost + accept */}
                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 120 }}>
                      {job.estimatedCost > 0 && (
                        <div style={{ marginBottom: 14, background: 'var(--bg)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Est. Cost</div>
                          <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text)', fontFamily: 'Outfit,sans-serif' }}>₹{job.estimatedCost.toLocaleString()}</div>
                          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, marginTop: 2 }}>You earn ≈ ₹{earning.toLocaleString()}</div>
                        </div>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAccept(job._id)}
                        disabled={accepting === job._id || hasActive}
                        style={{ width: '100%', justifyContent: 'center' }}>
                        {accepting === job._id ? '⏳ Accepting…' : hasActive ? '🔒 Busy' : '✅ Accept Job'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
