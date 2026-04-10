import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const JOB_TYPE_LABELS = {
  road_worker:       { label: '🛣️ Road',        cls: 'badge-road_worker' },
  sanitation_worker: { label: '🗑️ Sanitation',  cls: 'badge-sanitation_worker' },
  electrical_worker: { label: '💡 Electrical',  cls: 'badge-electrical_worker' },
  general_worker:    { label: '🔧 General',      cls: 'badge-general_worker' },
};

function mapLink(location) {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default function AvailableJobs() {
  const { user } = useAuth();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => { fetchJobs(); }, []);

  async function fetchJobs() {
    try {
      const res = await api.get('/worker/jobs');
      setJobs(res.data.jobs || []);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id) {
    setAccepting(id);
    try {
      await api.patch(`/worker/jobs/${id}/accept`);
      toast.success('Job accepted! Go to My Jobs to get started.');
      fetchJobs();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not accept job');
    } finally {
      setAccepting(null);
    }
  }

  const spec = user?.specialization || 'general_worker';
  const specLabel = JOB_TYPE_LABELS[spec]?.label || '🔧 General Worker';
  const available = jobs.filter((j) => j.status === 'verified');

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading available jobs…</div>;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>🔍 Available Jobs</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <p style={{ color: '#64748b', fontSize: 14 }}>{available.length} jobs matching your specialization</p>
          <span className={`badge ${JOB_TYPE_LABELS[spec]?.cls || 'badge-general_worker'}`}>{specLabel}</span>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1e40af' }}>
        ℹ️ You can only have <strong>1 active job</strong> at a time. Jobs with higher community support (👍) are shown first.
      </div>

      {available.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 600, fontSize: 16, color: '#64748b' }}>No matching jobs available</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Check back later for new verified complaints.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {available.map((job) => {
            const jt = JOB_TYPE_LABELS[job.jobType] || JOB_TYPE_LABELS.general_worker;
            const mLink = mapLink(job.location);
            const earning = Math.round((job.estimatedCost || 0) * 0.10);
            return (
              <div key={job._id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span className={`badge ${jt.cls}`}>{jt.label}</span>
                        {job.severity && <span className={`badge badge-${job.severity}`}>{job.severity}</span>}
                        <span style={{ fontSize: 11, background: '#f1f5f9', color: '#374151', padding: '2px 8px', borderRadius: 999, fontWeight: 600, textTransform: 'capitalize' }}>
                          {job.category}
                        </span>
                        {job.acknowledgementCount > 0 && (
                          <span style={{ fontSize: 11, background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                            👍 {job.acknowledgementCount} support{job.acknowledgementCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {job.priority !== 'low' && (
                          <span style={{
                            fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                            background: job.priority === 'high' ? '#fee2e2' : '#fef3c7',
                            color: job.priority === 'high' ? '#991b1b' : '#92400e',
                          }}>
                            {job.priority === 'high' ? '🔴 HIGH PRIORITY' : '🟡 MEDIUM PRIORITY'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a', marginBottom: 6 }}>{job.description}</div>
                      <div style={{ fontSize: 12, color: '#64748b', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        {job.location && <span>📍 {job.location}</span>}
                        {mLink && (
                          <a href={mLink} target="_blank" rel="noreferrer"
                            style={{ color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>
                            🗺️ Open in Maps
                          </a>
                        )}
                        <span>By {job.citizenId?.name || 'Citizen'}</span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {job.estimatedCost > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Est. Cost</div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>₹{job.estimatedCost.toLocaleString()}</div>
                          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>You earn ≈ ₹{earning.toLocaleString()}</div>
                        </div>
                      )}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAccept(job._id)}
                        disabled={accepting === job._id}>
                        {accepting === job._id ? '⏳ Accepting…' : '✅ Accept Job'}
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
