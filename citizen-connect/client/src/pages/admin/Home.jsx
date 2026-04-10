// ── Admin Home Dashboard — Premium Redesign ──────────────────────────────────
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function AdminHome() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.stats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <div className="shimmer-box" style={{ height: 170, borderRadius: 18, marginBottom: 28 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))', gap: 14, marginBottom: 28 }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="stat-card">
              <div className="shimmer-box" style={{ height: 38, width: 38, borderRadius: 9, marginBottom: 8 }} />
              <div className="shimmer-box" style={{ height: 28, width: '55%', marginBottom: 6 }} />
              <div className="shimmer-box" style={{ height: 11, width: '70%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Total Complaints',   value: stats?.total || 0,                                icon: '📋', color: '#2563eb', bg: '#dbeafe' },
    { label: 'Verified by AI',     value: stats?.verified || 0,                             icon: '✅', color: '#16a34a', bg: '#dcfce7' },
    { label: 'Rejected by AI',     value: stats?.rejected || 0,                             icon: '❌', color: '#dc2626', bg: '#fee2e2' },
    { label: 'In Progress',        value: stats?.inProgress || 0,                           icon: '🔧', color: '#0891b2', bg: '#cffafe' },
    { label: 'Awaiting Verify',    value: stats?.completedPendingVerification || 0,         icon: '⏳', color: '#d97706', bg: '#fef3c7' },
    { label: 'Completed',          value: stats?.completed || 0,                            icon: '🎉', color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Total Est. Cost',    value: `₹${((stats?.totalEstimatedCost || 0) / 100000).toFixed(1)}L`, icon: '💰', color: '#d97706', bg: '#fef3c7' },
    { label: 'Earnings Paid Out',  value: `₹${(stats?.totalEarningsPaid || 0).toLocaleString()}`,        icon: '💸', color: '#16a34a', bg: '#dcfce7' },
  ];

  const maxCat  = Math.max(...(stats?.byCategory || []).map(c => c.count), 1);

  return (
    <div style={{ padding: 32 }}>

      {/* ── Hero Banner ── */}
      <div className="hero-banner indigo fade-in">
        <div className="hero-eyebrow">✦ Admin Control Center</div>
        <h1 className="hero-title">From chaos to clarity.</h1>
        <p className="hero-sub">
          AI filters the noise. You drive the action.<br />
          Only real issues make it here — verified, prioritized, and ready.
        </p>
        <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          <Link to="/admin/complaints" style={{ textDecoration: 'none' }}>
            <button className="hero-cta">📋 View All Complaints</button>
          </Link>
          <Link to="/admin/workers" style={{ textDecoration: 'none' }}>
            <button className="hero-cta" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              👷 Manage Workers
            </button>
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="fade-in-2">
        <div className="section-head">
          <h2>Platform Overview</h2>
          <span className="section-tagline">No spam. No guesswork. Just verified reality.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))', gap: 14, marginBottom: 32 }}>
          {STAT_CARDS.map((s, i) => (
            <div key={s.label} className="stat-card card-lift" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="fade-in-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* By Category */}
        <div className="card">
          <div className="section-head" style={{ marginBottom: 18 }}>
            <h2>By Issue Type</h2>
          </div>
          {(stats?.byCategory || []).length === 0 ? (
            <div style={{ color: 'var(--text-subtle)', fontSize: 13, textAlign: 'center', padding: 20 }}>No data yet</div>
          ) : (stats?.byCategory || []).map(({ _id, count }) => (
            <div key={_id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 13, textTransform: 'capitalize', color: 'var(--text)', fontWeight: 500 }}>{_id || 'Other'}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', fontFamily: 'Outfit,sans-serif' }}>{count}</span>
              </div>
              <div style={{ height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #2563eb, #0891b2)',
                  width: `${Math.min(100, (count / maxCat) * 100)}%`,
                  borderRadius: 4,
                  transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* By Severity */}
        <div className="card">
          <div className="section-head" style={{ marginBottom: 18 }}>
            <h2>By Severity</h2>
            <span className="section-tagline">Verified only</span>
          </div>
          {['critical', 'severe', 'moderate', 'minor'].map((sev) => {
            const found  = (stats?.bySeverity || []).find(s => s._id === sev);
            const count  = found?.count || 0;
            const COLORS = { critical: '#dc2626', severe: '#d97706', moderate: '#0891b2', minor: '#16a34a' };
            const BGS    = { critical: '#fee2e2', severe: '#fef3c7', moderate: '#cffafe',  minor: '#dcfce7' };
            return (
              <div key={sev} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[sev] }} />
                  <span className={`badge badge-${sev}`} style={{ textTransform: 'capitalize' }}>{sev}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: COLORS[sev], width: `${Math.min(100, (count / (stats?.total || 1)) * 100)}%`, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: COLORS[sev], fontFamily: 'Outfit,sans-serif', minWidth: 24, textAlign: 'right' }}>{count}</span>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <Link to="/admin/complaints" className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'center' }}>
              View All Complaints →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
