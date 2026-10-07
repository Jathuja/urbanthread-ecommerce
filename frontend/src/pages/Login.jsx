import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Package,
  Truck,
  CheckCircle2,
  Star,
  Zap,
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/orders';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.email.trim()) { setError('Please enter your email address.'); return; }
    if (!formData.password) { setError('Please enter your password.'); return; }
    setLoading(true);
    const result = await login(formData.email.trim(), formData.password);
    setLoading(false);
    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <style>{`
        /* ── Page shell ── */
        .utl-shell {
          min-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #eef2ff 0%, #f8faff 45%, #faf5ff 100%);
          padding: 2.5rem 1.25rem;
        }

        .utl-wrapper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Big split card ── */
        .utl-card {
          display: grid;
          grid-template-columns: 1fr;
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 32px 80px rgba(79, 70, 229, 0.14),
            0 12px 32px rgba(0, 0, 0, 0.07);
          border: 1px solid rgba(99, 102, 241, 0.15);
        }

        @media (min-width: 880px) {
          .utl-card {
            grid-template-columns: 46% 54%;
          }
        }

        /* ── LEFT brand panel ── */
        .utl-left {
          position: relative;
          background: linear-gradient(148deg, #4338ca 0%, #5b21b6 52%, #6d28d9 100%);
          padding: 3.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          color: #fff;
          min-height: 600px;
        }

        /* decorative blobs */
        .utl-blob-1 {
          position: absolute; border-radius: 50%;
          width: 340px; height: 340px;
          background: rgba(167,139,250,0.18); filter: blur(65px);
          top: -110px; right: -90px; pointer-events: none;
        }
        .utl-blob-2 {
          position: absolute; border-radius: 50%;
          width: 280px; height: 280px;
          background: rgba(99,102,241,0.22); filter: blur(55px);
          bottom: -90px; left: -60px; pointer-events: none;
        }
        .utl-blob-3 {
          position: absolute; border-radius: 50%;
          width: 200px; height: 200px;
          background: rgba(196,181,253,0.12); filter: blur(45px);
          bottom: 110px; right: 10px; pointer-events: none;
        }
        .utl-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 42px 42px;
        }
        .utl-arc {
          position: absolute;
          width: 520px; height: 520px;
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 50%;
          bottom: -210px; right: -160px; pointer-events: none;
        }

        /* logo */
        .utl-logo-link {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 10px;
          color: #fff; text-decoration: none;
          font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em;
        }
        .utl-logo-link:hover { opacity: 0.9; }
        .utl-logo-icon {
          width: 46px; height: 46px; border-radius: 14px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.24);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.2s;
        }
        .utl-logo-link:hover .utl-logo-icon { background: rgba(255,255,255,0.24); }
        .utl-logo-accent { color: #c4b5fd; }

        /* badge */
        .utl-badge {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 13px; border-radius: 100px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          color: #ddd6fe; font-size: 0.69rem;
          font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; width: fit-content;
          margin-top: 1.75rem;
        }

        /* headline */
        .utl-headline {
          position: relative; z-index: 1;
          margin-top: 1.1rem;
          font-size: clamp(1.65rem, 3vw, 2.3rem);
          font-weight: 900; line-height: 1.14;
          letter-spacing: -0.03em; color: #fff;
        }
        .utl-subtext {
          position: relative; z-index: 1;
          margin-top: 0.9rem; font-size: 0.875rem;
          color: rgba(196,181,253,0.82); line-height: 1.65;
          max-width: 310px;
        }

        /* feature cards */
        .utl-features {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 12px;
          margin: 2rem 0;
        }
        .utl-feat-card {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 16px; border-radius: 16px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .utl-feat-card:hover { background: rgba(255,255,255,0.12); }
        .utl-feat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .utl-fi-indigo { background: rgba(99,102,241,0.28); color: #c4b5fd; }
        .utl-fi-emerald { background: rgba(52,211,153,0.22); color: #6ee7b7; }
        .utl-fi-amber   { background: rgba(251,191,36,0.22); color: #fcd34d; }
        .utl-feat-title { font-size: 0.8rem; font-weight: 700; color: #fff; line-height: 1; }
        .utl-feat-desc  { font-size: 0.71rem; color: rgba(196,181,253,0.72); margin-top: 3px; line-height: 1.45; }

        /* trust row */
        .utl-trust {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.10);
          font-size: 0.71rem; color: rgba(196,181,253,0.72);
          gap: 8px; flex-wrap: wrap;
        }
        .utl-trust-item { display: flex; align-items: center; gap: 5px; }

        /* ── RIGHT form panel ── */
        .utl-right {
          background: #ffffff;
          padding: 3.5rem 3.5rem;
          display: flex; flex-direction: column; justify-content: center;
          min-height: 600px;
        }

        @media (max-width: 879px) {
          .utl-left  { padding: 2.5rem 2rem; min-height: auto; }
          .utl-right { padding: 2.5rem 2rem; }
        }
        @media (max-width: 560px) {
          .utl-left  { padding: 2rem 1.25rem; }
          .utl-right { padding: 2rem 1.25rem; }
          .utl-shell { padding: 1.25rem 0.75rem; }
          .utl-card  { border-radius: 20px; }
        }

        /* hide left on mobile */
        @media (max-width: 879px) {
          .utl-left { display: none; }
        }

        /* mobile-only brand in right panel */
        .utl-mobile-brand {
          display: none;
          align-items: center; gap: 10px;
          color: #0f172a; text-decoration: none;
          font-weight: 800; font-size: 1.1rem;
          letter-spacing: -0.02em; margin-bottom: 1.5rem;
        }
        @media (max-width: 879px) {
          .utl-mobile-brand { display: flex; }
        }
        .utl-mob-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: #eef2ff; border: 1px solid #c7d2fe;
          display: flex; align-items: center; justify-content: center;
          color: #4f46e5; flex-shrink: 0;
        }

        /* portal label */
        .utl-portal-label {
          display: inline-block; font-size: 0.68rem;
          font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #4f46e5;
          background: #eef2ff; border: 1px solid #c7d2fe;
          padding: 5px 13px; border-radius: 100px;
          margin-bottom: 1.25rem; width: fit-content;
        }

        /* heading */
        .utl-heading {
          font-size: clamp(1.9rem, 3.5vw, 2.5rem);
          font-weight: 900; color: #0f172a;
          letter-spacing: -0.04em; line-height: 1.08;
          margin: 0 0 0.5rem;
        }
        .utl-sub {
          font-size: 0.9rem; color: #64748b;
          line-height: 1.6; margin: 0 0 2rem;
        }

        /* error */
        .utl-error {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 14px 16px; border-radius: 14px;
          background: #fff1f2; border: 1px solid #fecdd3;
          color: #be123c; font-size: 0.85rem;
          font-weight: 500; margin-bottom: 1.5rem;
        }

        /* fields */
        .utl-field { margin-bottom: 1.25rem; }
        .utl-label {
          display: block; font-size: 0.71rem;
          font-weight: 800; letter-spacing: 0.07em;
          text-transform: uppercase; color: #374151;
          margin-bottom: 7px;
        }
        .utl-input-wrap { position: relative; }
        .utl-input-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #9ca3af;
          display: flex; align-items: center; pointer-events: none;
        }
        .utl-input {
          width: 100%; box-sizing: border-box;
          height: 52px; padding: 0 14px 0 46px;
          border-radius: 14px; border: 1.5px solid #e2e8f0;
          background: #f8fafc; font-size: 0.95rem;
          color: #0f172a; outline: none; font-family: inherit;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .utl-input::placeholder { color: #94a3b8; }
        .utl-input:hover { border-color: #c7d2fe; background: #f0f4ff; }
        .utl-input:focus {
          border-color: #4f46e5; background: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.10);
        }
        .utl-input-pr { padding-right: 50px; }
        .utl-pw-toggle {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); background: none;
          border: none; cursor: pointer; color: #9ca3af;
          display: flex; align-items: center; padding: 4px;
          border-radius: 8px; transition: color 0.15s, background 0.15s;
        }
        .utl-pw-toggle:hover { color: #4f46e5; background: #eef2ff; }
        .utl-pw-toggle:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }

        /* row */
        .utl-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .utl-remember-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.82rem; color: #64748b;
          cursor: pointer; user-select: none;
        }
        .utl-secure-note {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.78rem; color: #94a3b8;
        }

        /* submit button */
        .utl-submit {
          width: 100%; height: 54px; border-radius: 14px;
          border: none; cursor: pointer;
          font-size: 1rem; font-weight: 700;
          letter-spacing: -0.01em; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #4f46e5 0%, #5b21b6 100%);
          color: #fff;
          box-shadow: 0 4px 18px rgba(79,70,229,0.32);
          transition: transform 0.12s, box-shadow 0.12s, opacity 0.12s;
          margin-top: 0.25rem;
        }
        .utl-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(79,70,229,0.40);
        }
        .utl-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 14px rgba(79,70,229,0.28);
        }
        .utl-submit:focus-visible { outline: 2px solid #4f46e5; outline-offset: 3px; }
        .utl-submit:disabled { opacity: 0.62; cursor: not-allowed; }

        /* divider */
        .utl-divider {
          border: none; border-top: 1px solid #f1f5f9;
          margin: 1.75rem 0;
        }

        /* register box */
        .utl-reg-box {
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem; flex-wrap: wrap;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 18px; padding: 1.25rem 1.5rem;
        }
        .utl-reg-title { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0 0 3px; }
        .utl-reg-desc  { font-size: 0.78rem; color: #64748b; margin: 0; }
        .utl-reg-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 0 20px; height: 44px; border-radius: 12px;
          border: 1.5px solid #4f46e5; color: #4f46e5;
          font-size: 0.85rem; font-weight: 700; font-family: inherit;
          background: #fff; text-decoration: none; white-space: nowrap;
          flex-shrink: 0; transition: background 0.15s, color 0.15s, transform 0.12s;
        }
        .utl-reg-btn:hover { background: #4f46e5; color: #fff; transform: translateY(-1px); }
        .utl-reg-btn:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }

        @keyframes utl-spin { to { transform: rotate(360deg); } }
        .utl-spin { animation: utl-spin 0.75s linear infinite; }
      `}</style>

      <section className="utl-shell" aria-label="Customer login">
        <div className="utl-wrapper">
          <div className="utl-card">

            {/* ═══════════════════════════════════════════
                LEFT — Brand / Visual Panel
            ═══════════════════════════════════════════ */}
            <div className="utl-left" aria-hidden="true">
              <div className="utl-blob-1" />
              <div className="utl-blob-2" />
              <div className="utl-blob-3" />
              <div className="utl-grid" />
              <div className="utl-arc" />

              {/* top */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Link to="/" className="utl-logo-link">
                  <div className="utl-logo-icon">
                    <ShoppingBag size={20} />
                  </div>
                  <span>Urban<span className="utl-logo-accent">Thread</span></span>
                </Link>

                <div className="utl-badge">
                  <Sparkles size={11} />
                  Modern Apparel &amp; Lifestyle
                </div>

                <h2 className="utl-headline">
                  Curated Fashion<br />
                  for Everyday<br />
                  Confidence.
                </h2>
                <p className="utl-subtext">
                  Sign in to access your personal order history, enjoy
                  expedited checkout, and receive dedicated support — all in one place.
                </p>
              </div>

              {/* feature cards */}
              <div className="utl-features">
                <div className="utl-feat-card">
                  <div className="utl-feat-icon utl-fi-indigo"><Package size={17} /></div>
                  <div>
                    <p className="utl-feat-title">Live Order Tracking</p>
                    <p className="utl-feat-desc">Real-time status updates and complete order history overview.</p>
                  </div>
                </div>
                <div className="utl-feat-card">
                  <div className="utl-feat-icon utl-fi-emerald"><Truck size={17} /></div>
                  <div>
                    <p className="utl-feat-title">Fast Islandwide Delivery</p>
                    <p className="utl-feat-desc">Secure doorstep delivery with Cash on Delivery &amp; PayHere.</p>
                  </div>
                </div>
                <div className="utl-feat-card">
                  <div className="utl-feat-icon utl-fi-amber"><Star size={17} /></div>
                  <div>
                    <p className="utl-feat-title">Exclusive Member Perks</p>
                    <p className="utl-feat-desc">Priority support, saved addresses &amp; early access to new drops.</p>
                  </div>
                </div>
              </div>

              {/* trust row */}
              <div className="utl-trust">
                <span className="utl-trust-item">
                  <CheckCircle2 size={13} style={{ color: '#6ee7b7' }} />
                  Verified Secure Platform
                </span>
                <span className="utl-trust-item">
                  <ShieldCheck size={13} />
                  256-bit Encrypted
                </span>
                <span>Colombo, LK</span>
              </div>
            </div>

            {/* ═══════════════════════════════════════════
                RIGHT — Login Form Panel
            ═══════════════════════════════════════════ */}
            <div className="utl-right">

              {/* Mobile brand mark */}
              <Link to="/" className="utl-mobile-brand">
                <div className="utl-mob-icon"><ShoppingBag size={18} /></div>
                <span>Urban<span style={{ color: '#4f46e5' }}>Thread</span></span>
              </Link>

              <span className="utl-portal-label">Customer Portal</span>

              <h1 className="utl-heading">Welcome back</h1>
              <p className="utl-sub">Sign in to continue shopping and manage your orders.</p>

              {/* Error */}
              {error && (
                <div role="alert" className="utl-error">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>

                {/* Email */}
                <div className="utl-field">
                  <label htmlFor="login-email" className="utl-label">Email Address</label>
                  <div className="utl-input-wrap">
                    <span className="utl-input-icon"><Mail size={17} /></span>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="utl-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="utl-field">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <label htmlFor="login-password" className="utl-label" style={{ margin: 0 }}>Password</label>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Case-sensitive</span>
                  </div>
                  <div className="utl-input-wrap">
                    <span className="utl-input-icon"><Lock size={17} /></span>
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="utl-input utl-input-pr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="utl-pw-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember & secure note */}
                <div className="utl-row">
                  <label className="utl-remember-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#4f46e5', cursor: 'pointer' }}
                    />
                    Remember this device
                  </label>
                  <span className="utl-secure-note">
                    <ShieldCheck size={14} style={{ color: '#4f46e5' }} />
                    Secure login
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  id="login-submit-btn"
                  className="utl-submit"
                >
                  {loading ? (
                    <><Loader2 size={18} className="utl-spin" />Signing In…</>
                  ) : (
                    <>Sign In <ArrowRight size={17} /></>
                  )}
                </button>
              </form>

              <hr className="utl-divider" />

              {/* Create account */}
              <div className="utl-reg-box">
                <div>
                  <p className="utl-reg-title">New to UrbanThread?</p>
                  <p className="utl-reg-desc">Create an account to save your details and track your orders.</p>
                </div>
                <Link
                  to="/register"
                  state={{ from: location.state?.from }}
                  className="utl-reg-btn"
                  id="create-account-btn"
                >
                  Create Account <Zap size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
