// ── Landing Page — Complete Entry Experience ──────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';


// ── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Fade-in on scroll ────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Sticky Navbar ─────────────────────────────────────────────────────────────
function Navbar({ navigate }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.90)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(226,232,240,0.8)' : 'none',
      boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 40px',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏙️</div>
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 18, color: scrolled ? '#0f172a' : '#fff', transition: 'color 0.3s' }}>CitizenConnect</span>
        </div>
        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[['How it Works', '#how'], ['AI Power', '#ai'], ['Get Started', '#roles']].map(([label, anchor]) => (
            <a key={label} href={anchor} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: scrolled ? '#475569' : 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = scrolled ? '#f1f5f9' : 'rgba(255,255,255,0.12)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              {label}
            </a>
          ))}
          <button onClick={() => navigate('/login')} style={{
            padding: '8px 20px', borderRadius: 9, border: '1.5px solid',
            borderColor: scrolled ? '#e2e8f0' : 'rgba(255,255,255,0.4)',
            background: scrolled ? '#fff' : 'rgba(255,255,255,0.1)',
            color: scrolled ? '#0f172a' : '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            Login
          </button>
          <button onClick={() => navigate('/login?tab=register')} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none',
            background: scrolled ? '#2563eb' : '#fff',
            color: scrolled ? '#fff' : '#2563eb',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: scrolled ? '0 2px 8px rgba(37,99,235,0.3)' : '0 2px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.20s',
          }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = scrolled ? '0 6px 16px rgba(37,99,235,0.35)' : '0 6px 20px rgba(0,0,0,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = scrolled ? '0 2px 8px rgba(37,99,235,0.3)' : '0 2px 12px rgba(0,0,0,0.15)'; }}>
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function Hero({ navigate }) {
  const mousePos = useRef({ x: 0, y: 0 });
  const orb1 = useRef(null);
  const orb2 = useRef(null);

  useEffect(() => {
    const handleMouse = (e) => {
      const { innerWidth: W, innerHeight: H } = window;
      const x = (e.clientX / W - 0.5) * 30;
      const y = (e.clientY / H - 0.5) * 20;
      if (orb1.current) orb1.current.style.transform = `translate(${x * 0.6}px, ${y * 0.6}px)`;
      if (orb2.current) orb2.current.style.transform = `translate(${-x * 0.4}px, ${-y * 0.4}px)`;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <section style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 35%, #1e40af 65%, #0891b2 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '120px 40px 80px',
    }}>
      {/* Floating orbs for parallax */}
      <div ref={orb1} style={{ position: 'absolute', top: '15%', right: '10%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', transition: 'transform 0.3s ease-out', pointerEvents: 'none' }} />
      <div ref={orb2} style={{ position: 'absolute', bottom: '10%', left: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)', transition: 'transform 0.3s ease-out', pointerEvents: 'none' }} />
      {/* Grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 820, animation: 'fadeInUp 0.8s cubic-bezier(0.22,1,0.36,1) both' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '6px 16px', marginBottom: 32, fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
          AI-powered civic complaint platform
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(36px,6vw,72px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1px' }}>
          From noise to truth —{' '}
          <span style={{ background: 'linear-gradient(90deg,#60a5fa,#a78bfa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            powered by AI
          </span>
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: 'clamp(16px,2.2vw,22px)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, marginBottom: 44, maxWidth: 600, margin: '0 auto 44px' }}>
          Report real issues. Let AI verify them. See real impact — city-wide, in real time.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login?tab=register')}
            style={{ padding: '16px 36px', borderRadius: 14, background: 'linear-gradient(135deg,#2563eb,#0891b2)', color: '#fff', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 4px 24px rgba(37,99,235,0.5)', transition: 'all 0.22s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(37,99,235,0.6)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.5)'; }}>
            🚀 Get Started — It's Free
          </button>
          <button onClick={() => navigate('/login')}
            style={{ padding: '16px 32px', borderRadius: 14, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', color: '#fff', fontWeight: 700, fontSize: 16, border: '1.5px solid rgba(255,255,255,0.25)', cursor: 'pointer', transition: 'all 0.22s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Login →
          </button>
        </div>

        {/* Trust line */}
        <p style={{ marginTop: 32, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Trusted by municipalities · AI-verified · Real-time tracking
        </p>
      </div>

      {/* Scroll cue */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 12, animation: 'bounce 2s infinite' }}>
        <span>Scroll to explore</span>
        <span style={{ fontSize: 18 }}>↓</span>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
const FLOW_STEPS = [
  { icon: '📸', step: '01', title: 'Upload Issue',           sub: 'Snap it. Send it.',              color: '#2563eb', glow: 'rgba(37,99,235,0.15)' },
  { icon: '🤖', step: '02', title: 'AI Verification',        sub: 'No spam. No guesswork.',         color: '#7c3aed', glow: 'rgba(124,58,237,0.15)' },
  { icon: '⚡', step: '03', title: 'Admin + Worker Action',  sub: 'Real problems. Real action.',    color: '#0891b2', glow: 'rgba(8,145,178,0.15)' },
  { icon: '✅', step: '04', title: 'Resolution',             sub: 'Every issue earns its priority.', color: '#16a34a', glow: 'rgba(22,163,74,0.15)' },
];

function HowItWorks() {
  return (
    <section id="how" style={{ padding: '100px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>How It Works</div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: 16 }}>
              Four steps to real change
            </h2>
            <p style={{ fontSize: 17, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>A system built for trust — where every complaint is either verified or discarded by AI.</p>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}>
          {FLOW_STEPS.map((s, i) => (
            <FadeIn key={s.step} delay={i * 100}>
              <div style={{
                background: '#fff', borderRadius: 20, padding: '32px 28px',
                border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.25s ease', cursor: 'default',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${s.glow}, 0 4px 12px rgba(0,0,0,0.06)`; e.currentTarget.style.borderColor = s.color + '50'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                {/* Step number */}
                <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 11, fontWeight: 800, color: s.color + '60', letterSpacing: 1 }}>{s.step}</div>
                {/* Glow bg */}
                <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: s.glow, pointerEvents: 'none' }} />
                <div style={{ fontSize: 40, marginBottom: 20, position: 'relative', zIndex: 1 }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 20, color: '#0f172a', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic' }}>{s.sub}</p>
                {/* Connector dot */}
                {i < FLOW_STEPS.length - 1 && (
                  <div style={{ position: 'absolute', bottom: -12, right: -12, width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#94a3b8', border: '1px solid #e2e8f0' }}>→</div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AI Highlight Section ──────────────────────────────────────────────────────
function AIHighlight() {
  return (
    <section id="ai" style={{ padding: '100px 40px', background: 'linear-gradient(135deg,#0f172a,#1e1b4b,#1e3a8a)', overflow: 'hidden', position: 'relative' }}>
      {/* Glow orb */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>AI at the Core</div>
          {/* Glowing AI badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 999, padding: '10px 24px', marginBottom: 36, boxShadow: '0 0 40px rgba(99,102,241,0.25)' }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#a5b4fc' }}>Powered by AI Validation Engine</span>
          </div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 24 }}>
            This isn't reporting.<br />
            <span style={{ background: 'linear-gradient(90deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              This is intelligent validation.
            </span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Every complaint passes through our AI engine — verified for legitimacy, scored for urgency, categorized for action. No spam makes it through.
          </p>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {[
              { icon: '🛡️', label: 'Spam Filtered',     val: '100%',    color: '#34d399' },
              { icon: '🎯', label: 'AI Accuracy',        val: '95%+',    color: '#818cf8' },
              { icon: '⚡', label: 'Instant Analysis',   val: '<3 secs', color: '#60a5fa' },
              { icon: '🔍', label: 'Categories Detected',val: '12+',     color: '#f472b6' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: '24px 20px', backdropFilter: 'blur(10px)', transition: 'all 0.22s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = `${stat.color}60`; e.currentTarget.style.boxShadow = `0 0 24px ${stat.color}30`; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{stat.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, fontFamily: 'Outfit,sans-serif', marginBottom: 4 }}>{stat.val}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Role Selector ─────────────────────────────────────────────────────────────
const ROLES = [
  {
    icon: '👤', label: 'Citizen', tag: 'Report',
    desc: 'Report and track real civic issues in your city. Let AI verify them and watch real action unfold.',
    features: ['Report with photo', 'AI Verification', 'Real-time tracking', 'Community support'],
    cta: 'Report an Issue', color: '#2563eb', glow: 'rgba(37,99,235,0.12)', border: '#bfdbfe',
  },
  {
    icon: '👷', label: 'Worker', tag: 'Execute',
    desc: 'Only verified, real problems reach you. Take action on AI-filtered tasks and earn for every resolution.',
    features: ['AI-verified jobs only', 'Earn per task', 'GPS navigation', 'Submit proof'],
    cta: 'Take Action', color: '#0891b2', glow: 'rgba(8,145,178,0.12)', border: '#a5f3fc',
    featured: true,
  },
  {
    icon: '🧑‍💼', label: 'Admin', tag: 'Control',
    desc: 'Control the full pipeline. Assign workers, verify completions, and see live city-wide insights.',
    features: ['Live dashboard', 'Assign & manage', 'Verify completions', 'AI analytics'],
    cta: 'Manage Operations', color: '#7c3aed', glow: 'rgba(124,58,237,0.12)', border: '#ddd6fe',
  },
];

function RoleSelector({ navigate }) {
  return (
    <section id="roles" style={{ padding: '100px 40px', background: 'linear-gradient(180deg,#f8faff 0%,#fff 100%)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Who Are You?</div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: '#0f172a', marginBottom: 14 }}>Choose your role. Start your journey.</h2>
            <p style={{ fontSize: 16, color: '#64748b' }}>One platform. Three powerful roles. Unified civic impact.</p>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
          {ROLES.map((role, i) => (
            <FadeIn key={role.label} delay={i * 100}>
              <div style={{
                background: '#fff', borderRadius: 22, padding: '36px 30px',
                border: `2px solid ${role.featured ? role.border : '#e2e8f0'}`,
                boxShadow: role.featured ? `0 8px 32px ${role.glow}` : '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.25s ease', cursor: 'pointer',
              }}
                onClick={() => navigate('/login')}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 48px ${role.glow}`; e.currentTarget.style.borderColor = role.border; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = role.featured ? `0 8px 32px ${role.glow}` : '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = role.featured ? role.border : '#e2e8f0'; }}>

                {/* Featured badge */}
                {role.featured && (
                  <div style={{ position: 'absolute', top: 18, right: 18, background: role.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, letterSpacing: 0.5 }}>MOST ACTIVE</div>
                )}
                {/* Role Tag */}
                <div style={{ fontSize: 11, fontWeight: 700, color: role.color, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>{role.tag}</div>
                {/* Icon */}
                <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>{role.icon}</div>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 26, color: '#0f172a', marginBottom: 10 }}>{role.label}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 22 }}>{role.desc}</p>
                {/* Feature list */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {role.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', fontWeight: 500 }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: role.glow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: role.color }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button style={{
                  width: '100%', padding: '12px 0', borderRadius: 11, border: 'none',
                  background: `linear-gradient(135deg, ${role.color}, ${role.color}cc)`,
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  boxShadow: `0 4px 16px ${role.glow}`,
                  transition: 'all 0.18s',
                }}
                  onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.12)'}
                  onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}>
                  {role.cta} →
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Impact Stats ──────────────────────────────────────────────────────────────
function Impact() {
  return (
    <section style={{ padding: '80px 40px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Real Numbers</div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Less noise. More resolution.</h2>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 52 }}>Results don't lie. AI-powered civic action at scale.</p>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 32 }}>
          {[
            { target: 500, suffix: '+', label: 'Issues Resolved',   sub: 'And counting', color: '#2563eb' },
            { target: 95,  suffix: '%', label: 'AI Accuracy',        sub: 'Spam detection rate', color: '#7c3aed' },
            { target: 3,   suffix: 'x', label: 'Faster Resolution',  sub: 'vs manual processing', color: '#0891b2' },
            { target: 12,  suffix: 'k', label: 'Citizens Served',    sub: 'Across all cities', color: '#16a34a' },
          ].map(stat => (
            <FadeIn key={stat.label}>
              <div style={{ padding: '28px 20px', borderRadius: 18, background: `${stat.color}08`, border: `1px solid ${stat.color}18`, transition: 'all 0.22s' }}
                onMouseOver={e => { e.currentTarget.style.background = `${stat.color}12`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={e => { e.currentTarget.style.background = `${stat.color}08`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 52, fontWeight: 900, color: stat.color, lineHeight: 1, marginBottom: 8 }}>
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>{stat.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA Section ─────────────────────────────────────────────────────────
function FinalCTA({ navigate }) {
  return (
    <section style={{ padding: '100px 40px', background: 'linear-gradient(135deg,#0f172a,#1e3a8a)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <FadeIn>
          <div style={{ fontSize: 40, marginBottom: 24 }}>🚀</div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            Stop reporting blindly.<br />Start reporting <span style={{ background: 'linear-gradient(90deg,#60a5fa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>smart</span>.
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 44, lineHeight: 1.7 }}>
            Join the AI-powered civic platform that actually makes things happen.
          </p>
          <button onClick={() => navigate('/login?tab=register')} style={{
            padding: '18px 48px', borderRadius: 16, fontSize: 18, fontWeight: 800,
            background: 'linear-gradient(135deg,#2563eb,#0891b2)', color: '#fff', border: 'none',
            cursor: 'pointer', boxShadow: '0 6px 32px rgba(37,99,235,0.5)',
            transition: 'all 0.25s',
          }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 14px 44px rgba(37,99,235,0.6)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(37,99,235,0.5)'; }}>
            Enter Citizen Connect →
          </button>
          <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No credit card needed · AI-verified · Free to start</p>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: '#0f172a', padding: '36px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#2563eb,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🏙️</div>
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, color: '#fff' }}>CitizenConnect</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          From noise to truth — powered by AI · Built for real civic impact
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2025 CitizenConnect</p>
      </div>
    </footer>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", margin: 0, padding: 0 }}>
      <Navbar navigate={navigate} />
      <Hero navigate={navigate} />
      <HowItWorks />
      <AIHighlight />
      <RoleSelector navigate={navigate} />
      <Impact />
      <FinalCTA navigate={navigate} />
      <Footer />
    </div>
  );
}
