import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function AdminHome() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data.stats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: '#64748b' }}>Loading dashboard…</div>;

  const STAT_CARDS = [
    { label: 'Total Complaints',  value: stats?.total || 0,  icon: '📋', color: '#2563eb', bg: '#dbeafe' },
    { label: 'Verified by AI',    value: stats?.verified || 0, icon: '✅', color: '#16a34a', bg: '#dcfce7' },
    { label: 'Rejected by AI',    value: stats?.rejected || 0, icon: '❌', color: '#dc2626', bg: '#fee2e2' },
    { label: 'In Progress',       value: stats?.inProgress || 0, icon: '🔧', color: '#0891b2', bg: '#cffafe' },
    { label: '⏳ Pending Verify', value: stats?.completedPendingVerification || 0, icon: '🔍', color: '#d97706', bg: '#fef3c7' },
    { label: 'Completed',         value: stats?.completed || 0, icon: '🎉', color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Total Est. Cost',   value: `₹${((stats?.totalEstimatedCost || 0) / 100000).toFixed(1)}L`, icon: '💰', color: '#d97706', bg: '#fef3c7' },
    { label: 'Earnings Paid Out', value: `₹${(stats?.totalEarningsPaid || 0).toLocaleString()}`, icon: '💸', color: '#16a34a', bg: '#dcfce7' },
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>📊 Admin Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Real-time overview of all civic complaints</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ padding: 0, marginBottom: 32 }}>
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* By Category */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16, color: '#0f172a' }}>By Issue Type</h3>
          {(stats?.byCategory || []).map(({ _id, count }) => (
            <div key={_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, textTransform: 'capitalize', color: '#374151' }}>{_id || 'Other'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 100, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#2563eb,#0891b2)', width: `${Math.min(100, (count / (stats.total || 1)) * 100)}%` }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', minWidth: 20 }}>{count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* By Severity */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16, color: '#0f172a' }}>By Severity (Verified)</h3>
          {['critical', 'severe', 'moderate', 'minor'].map((sev) => {
            const found = (stats?.bySeverity || []).find((s) => s._id === sev);
            const count = found?.count || 0;
            const colors = { critical: '#dc2626', severe: '#d97706', moderate: '#0891b2', minor: '#16a34a' };
            return (
              <div key={sev} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className={`badge badge-${sev}`}>{sev}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: colors[sev] }}>{count}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 16 }}>
            <Link to="/admin/complaints" className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'center' }}>
              View All Complaints →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
