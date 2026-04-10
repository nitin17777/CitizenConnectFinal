import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATS_CONFIG = [
  { key: 'total',       label: 'Total Reported', icon: '📋', color: '#2563eb', bg: '#dbeafe' },
  { key: 'verified',    label: 'Verified',        icon: '✅', color: '#16a34a', bg: '#dcfce7' },
  { key: 'rejected',    label: 'Rejected by AI',  icon: '❌', color: '#dc2626', bg: '#fee2e2' },
  { key: 'inProgress',  label: 'In Progress',     icon: '🔧', color: '#0891b2', bg: '#cffafe' },
  { key: 'completed',   label: 'Completed',       icon: '🎉', color: '#7c3aed', bg: '#ede9fe' },
];

function mapLink(location) {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
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

export default function CitizenHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [recent, setRecent]           = useState([]);
  const [community, setCommunity]     = useState([]);
  const [ackLoading, setAckLoading]   = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

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
    } catch {
      // silently fail
    }
  }

  async function handleAck(id) {
    setAckLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await api.post(`/complaints/${id}/acknowledge`);
      setCommunity((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, acknowledgementCount: res.data.count, userHasAcknowledged: res.data.acknowledged }
            : c
        )
      );
      toast.success(res.data.acknowledged ? '👍 Acknowledged!' : 'Acknowledgement removed');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    } finally {
      setAckLoading((p) => ({ ...p, [id]: false }));
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Here's a summary of your reported issues.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14, marginBottom: 28 }}>
          {STATS_CONFIG.map(({ key, label, icon, color, bg }) => (
            <div key={key} className="stat-card">
              <div className="stat-icon" style={{ background: bg }}>{icon}</div>
              <div className="stat-value" style={{ color }}>{stats[key]}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg,#2563eb,#0891b2)', borderRadius: 14, padding: '22px 26px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>Report a new issue</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3 }}>AI validates your complaint in seconds</div>
        </div>
        <button className="btn" onClick={() => navigate('report')}
          style={{ background: '#fff', color: '#2563eb', fontWeight: 700, whiteSpace: 'nowrap' }}>
          📸 Report Now
        </button>
      </div>

      {/* Recent Complaints */}
      {recent.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>📋 Your Recent Complaints</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('my-complaints')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map((c) => {
              const s = STATUS_BADGE[c.status] || { cls: 'badge-pending', label: c.status };
              const mLink = mapLink(c.location);
              return (
                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      {c.location && <span style={{ fontSize: 12, color: '#64748b' }}>📍 {c.location}</span>}
                      {mLink && (
                        <a href={mLink} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 7px', borderRadius: 6, textDecoration: 'none' }}>
                          🗺️ Map
                        </a>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Community Issues */}
      {community.length > 0 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>📣 Community Issues</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Support your neighbours by acknowledging verified issues near you.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {community.map((c) => {
              const mLink = mapLink(c.location);
              return (
                <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>By {c.citizenId?.name || 'Citizen'}</span>
                      {c.location && <span style={{ fontSize: 12, color: '#64748b' }}>📍 {c.location}</span>}
                      {mLink && (
                        <a href={mLink} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, background: '#dbeafe', padding: '2px 7px', borderRadius: 6 }}>
                          🗺️ Map
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAck(c._id)}
                    disabled={ackLoading[c._id]}
                    style={{
                      background: c.userHasAcknowledged ? '#2563eb' : '#fff',
                      color: c.userHasAcknowledged ? '#fff' : '#2563eb',
                      border: '1px solid #bfdbfe', borderRadius: 8,
                      padding: '6px 12px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                    }}>
                    👍 {c.acknowledgementCount || 0}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!stats && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading your dashboard…</div>
      )}
    </div>
  );
}
