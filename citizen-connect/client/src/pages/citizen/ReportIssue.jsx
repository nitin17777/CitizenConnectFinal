import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'pothole', label: '🕳️ Pothole', desc: 'Road pits and craters' },
  { value: 'garbage', label: '🗑️ Garbage', desc: 'Waste & litter issues' },
  { value: 'sewage', label: '🚧 Sewage', desc: 'Drain & waterlogging' },
  { value: 'road', label: '🛣️ Road Damage', desc: 'Cracks and pavement' },
  { value: 'streetlight', label: '💡 Street Light', desc: 'Lighting problems' },
  { value: 'other', label: '📌 Other', desc: 'General civic issues' },
];

function AIResultPanel({ result }) {
  const { complaint, aiReport } = result;
  const isVerified = complaint.status === 'verified';
  const confidence = Math.round((aiReport.confidence || 0) * 100);
  const confClass = confidence >= 65 ? 'high' : confidence >= 40 ? 'medium' : 'low';

  return (
    <div className={`ai-result ${isVerified ? 'verified' : 'rejected'}`} style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>{isVerified ? '✅' : '❌'}</div>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: 20, color: isVerified ? '#10b981' : '#ef4444' }}>
            {isVerified ? 'Complaint Verified!' : 'Complaint Rejected by AI'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {isVerified ? 'Your complaint has been accepted and will be assigned to a field worker.' : complaint.rejectionReason}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'AI Verdict', value: <span className={`badge badge-${aiReport.verdict?.toLowerCase()}`}>{aiReport.verdict}</span> },
          { label: 'Issue Type', value: aiReport.issueType },
          { label: 'Severity', value: <span className={`badge badge-${aiReport.severity}`}>{aiReport.severity}</span> },
          ...(isVerified ? [{ label: 'Est. Repair Cost', value: `₹${(aiReport.estimatedCost || 0).toLocaleString()}`, highlight: true }] : []),
        ].map(({ label, value, highlight }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: highlight ? 18 : 14, color: highlight ? '#10b981' : 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Confidence Meter */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI Confidence</span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{confidence}%</span>
        </div>
        <div className="confidence-bar">
          <div className={`confidence-fill ${confClass}`} style={{ width: `${confidence}%` }} />
        </div>
      </div>

      {aiReport.flags?.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
          ⚠️ Flags: {aiReport.flags.join(', ')}
        </div>
      )}
    </div>
  );
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ description: '', category: 'pothole', location: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const data = new FormData();
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('location', form.location);
      if (image) data.append('image', image);

      const res = await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
      toast.success(res.data.complaint.status === 'verified' ? '✅ Complaint verified!' : '❌ Complaint rejected by AI');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setForm({ description: '', category: 'pothole', location: '' });
    setImage(null);
    setPreview('');
    setResult(null);
  };

  return (
    <div style={{ padding: '32px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800 }}>📝 Report an Issue</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Submit a civic complaint — AI validates it automatically</p>
      </div>

      {/* Analyzing Screen */}
      {analyzing && (
        <div className="ai-result analyzing" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
          <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>AI Analyzing Your Complaint…</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Checking authenticity, detecting issue type & estimating repair cost</p>
          <div className="analyzing-dots"><span /><span /><span /></div>
        </div>
      )}

      {/* Result Panel */}
      {result && !analyzing && (
        <>
          <AIResultPanel result={result} />
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={handleReset}>Submit Another</button>
            <button className="btn btn-primary" onClick={() => navigate('/citizen/my-complaints')}>View My Complaints →</button>
          </div>
        </>
      )}

      {/* Submission Form */}
      {!result && !analyzing && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Category Selection */}
          <div className="form-group">
            <label className="form-label">Issue Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CATEGORIES.map(({ value, label, desc }) => (
                <button type="button" key={value} onClick={() => setForm((f) => ({ ...f, category: value }))}
                  style={{ padding: '12px', borderRadius: 10, border: `2px solid ${form.category === value ? 'var(--primary)' : 'var(--glass-border)'}`, background: form.category === value ? 'rgba(79,70,229,0.1)' : 'transparent', color: 'var(--text)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Photo Evidence {!preview && <span style={{ color: 'var(--text-subtle)' }}>(recommended)</span>}</label>
            <div className="upload-zone" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              {preview ? (
                <img src={preview} alt="Preview" className="upload-preview" style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10 }} />
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>Click or drag photo here</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG, WebP up to 10MB</p>
                </>
              )}
            </div>
            {preview && (
              <button type="button" style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--danger)', fontSize: 12, cursor: 'pointer', marginTop: 4 }} onClick={() => { setImage(null); setPreview(''); }}>
                ✕ Remove photo
              </button>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea className="form-input" name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the issue in detail — location, severity, how long it's been there…"
              rows={4} required style={{ resize: 'vertical', minHeight: 100 }} />
            <span style={{ fontSize: 11, color: `${form.description.length < 10 ? 'var(--danger)' : 'var(--text-subtle)'}` }}>{form.description.length} / min 10 characters</span>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location / Landmark</label>
            <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Near Central Park, MG Road, Bangalore" />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={form.description.trim().length < 10}>
            🚀 Submit Complaint
          </button>
        </form>
      )}
    </div>
  );
}
