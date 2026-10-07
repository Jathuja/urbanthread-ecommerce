import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  Package,
  Truck,
  Star,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function Register() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.name.trim().length < 2) {
      setError('Please provide your full name (at least 2 characters).');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
    });
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <style>{`
        /* ── Page shell ── */
        .utr-shell {
          min-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #eef2ff 0%, #f8faff 45%, #faf5ff 100%);
          padding: 2.5rem 1.25rem;
        }

        .utr-wrapper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── Big split card ── */
        .utr-card {
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
          .utr-card {
            grid-template-columns: 46% 54%;
          }
        }

        /* ── LEFT brand panel ── */
        .utr-left {
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

        .utr-blob-1 {
          position: absolute; border-radius: 50%;
          width: 340px; height: 340px;
          background: rgba(167,139,250,0.18); filter: blur(65px);
          top: -110px; right: -90px; pointer-events: none;
        }
        .utr-blob-2 {
          position: absolute; border-radius: 50%;
          width: 280px; height: 280px;
          background: rgba(99,102,241,0.22); filter: blur(55px);
          bottom: -90px; left: -60px; pointer-events: none;
        }
        .utr-blob-3 {
          position: absolute; border-radius: 50%;
          width: 200px; height: 200px;
          background: rgba(196,181,253,0.12); filter: blur(45px);
          bottom: 110px; right: 10px; pointer-events: none;
        }
        .utr-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 42px 42px;
        }
        .utr-arc {
          position: absolute;
          width: 520px; height: 520px;
          border: 2px solid rgba(255,255,255,0.06);
          border-radius: 50%;
          bottom: -210px; right: -160px; pointer-events: none;
        }

        .utr-logo-link {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 10px;
          color: #fff; text-decoration: none;
          font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em;
        }
        .utr-logo-link:hover { opacity: 0.9; }
        .utr-logo-icon {
          width: 46px; height: 46px; border-radius: 14px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.24);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.2s;
        }
        .utr-logo-link:hover .utr-logo-icon { background: rgba(255,255,255,0.24); }
        .utr-logo-accent { color: #c4b5fd; }

        .utr-badge {
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

        .utr-headline {
          position: relative; z-index: 1;
          margin-top: 1.1rem;
          font-size: clamp(1.65rem, 3vw, 2.3rem);
          font-weight: 900; line-height: 1.14;
          letter-spacing: -0.03em; color: #fff;
        }
        .utr-subtext {
          position: relative; z-index: 1;
          margin-top: 0.9rem; font-size: 0.875rem;
          color: rgba(196,181,253,0.82); line-height: 1.65;
          max-width: 310px;
        }

        .utr-features {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 12px;
          margin: 2rem 0;
        }
        .utr-feat-card {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 16px; border-radius: 16px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .utr-feat-card:hover { background: rgba(255,255,255,0.12); }
        .utr-feat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }
        .utr-fi-indigo { background: rgba(99,102,241,0.28); color: #c4b5fd; }
        .utr-fi-emerald { background: rgba(52,211,153,0.22); color: #6ee7b7; }
        .utr-fi-amber   { background: rgba(251,191,36,0.22); color: #fcd34d; }
        .utr-feat-title { font-size: 0.8rem; font-weight: 700; color: #fff; line-height: 1; }
        .utr-feat-desc  { font-size: 0.71rem; color: rgba(196,181,253,0.72); margin-top: 3px; line-height: 1.45; }

        .utr-trust {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.10);
          font-size: 0.71rem; color: rgba(196,181,253,0.72);
          gap: 8px; flex-wrap: wrap;
        }
        .utr-trust-item { display: flex; align-items: center; gap: 5px; }

        /* ── RIGHT form panel ── */
        .utr-right {
          background: #ffffff;
          padding: 3rem 3.5rem;
          display: flex; flex-direction: column; justify-content: center;
          min-height: 600px;
        }

        @media (max-width: 879px) {
          .utr-left  { padding: 2.5rem 2rem; min-height: auto; }
          .utr-right { padding: 2.5rem 2rem; }
        }
        @media (max-width: 560px) {
          .utr-left  { padding: 2rem 1.25rem; }
          .utr-right { padding: 2rem 1.25rem; }
          .utr-shell { padding: 1.25rem 0.75rem; }
          .utr-card  { border-radius: 20px; }
        }
        @media (max-width: 879px) {
          .utr-left { display: none; }
        }

        .utr-mobile-brand {
          display: none;
          align-items: center; gap: 10px;
          color: #0f172a; text-decoration: none;
          font-weight: 800; font-size: 1.1rem;
          letter-spacing: -0.02em; margin-bottom: 1.5rem;
        }
        @media (max-width: 879px) {
          .utr-mobile-brand { display: flex; }
        }
        .utr-mob-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: #eef2ff; border: 1px solid #c7d2fe;
          display: flex; align-items: center; justify-content: center;
          color: #4f46e5; flex-shrink: 0;
        }

        .utr-portal-label {
          display: inline-block; font-size: 0.68rem;
          font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: #4f46e5;
          background: #eef2ff; border: 1px solid #c7d2fe;
          padding: 5px 13px; border-radius: 100px;
          margin-bottom: 1.1rem; width: fit-content;
        }

        .utr-heading {
          font-size: clamp(1.7rem, 3.5vw, 2.3rem);
          font-weight: 900; color: #0f172a;
          letter-spacing: -0.04em; line-height: 1.08;
          margin: 0 0 0.4rem;
        }
        .utr-sub {
          font-size: 0.875rem; color: #64748b;
          line-height: 1.6; margin: 0 0 1.6rem;
        }

        .utr-error {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 14px 16px; border-radius: 14px;
          background: #fff1f2; border: 1px solid #fecdd3;
          color: #be123c; font-size: 0.85rem;
          font-weight: 500; margin-bottom: 1.25rem;
        }

        .utr-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 560px) { .utr-row2 { grid-template-columns: 1fr; } }

        .utr-field { margin-bottom: 1.1rem; }
        .utr-label {
          display: block; font-size: 0.71rem;
          font-weight: 800; letter-spacing: 0.07em;
          text-transform: uppercase; color: #374151;
          margin-bottom: 6px;
        }
        .utr-label-opt { font-weight: 400; color: #9ca3af; text-transform: none; font-size: 0.7rem; }
        .utr-input-wrap { position: relative; }
        .utr-input-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #9ca3af;
          display: flex; align-items: center; pointer-events: none;
        }
        .utr-input {
          width: 100%; box-sizing: border-box;
          height: 50px; padding: 0 14px 0 46px;
          border-radius: 14px; border: 1.5px solid #e2e8f0;
          background: #f8fafc; font-size: 0.92rem;
          color: #0f172a; outline: none; font-family: inherit;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .utr-input::placeholder { color: #94a3b8; }
        .utr-input:hover { border-color: #c7d2fe; background: #f0f4ff; }
        .utr-input:focus {
          border-color: #4f46e5; background: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.10);
        }
        .utr-input-pr { padding-right: 50px; }
        .utr-pw-toggle {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); background: none;
          border: none; cursor: pointer; color: #9ca3af;
          display: flex; align-items: center; padding: 4px;
          border-radius: 8px; transition: color 0.15s, background 0.15s;
        }
        .utr-pw-toggle:hover { color: #4f46e5; background: #eef2ff; }
        .utr-pw-toggle:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }

        .utr-submit {
          width: 100%; height: 52px; border-radius: 14px;
          border: none; cursor: pointer;
          font-size: 1rem; font-weight: 700;
          letter-spacing: -0.01em; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #4f46e5 0%, #5b21b6 100%);
          color: #fff;
          box-shadow: 0 4px 18px rgba(79,70,229,0.32);
          transition: transform 0.12s, box-shadow 0.12s, opacity 0.12s;
          margin-top: 0.5rem;
        }
        .utr-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(79,70,229,0.40);
        }
        .utr-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 14px rgba(79,70,229,0.28);
        }
        .utr-submit:focus-visible { outline: 2px solid #4f46e5; outline-offset: 3px; }
        .utr-submit:disabled { opacity: 0.62; cursor: not-allowed; }

        .utr-divider {
          border: none; border-top: 1px solid #f1f5f9;
          margin: 1.5rem 0;
        }

        .utr-login-box {
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem; flex-wrap: wrap;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 18px; padding: 1.1rem 1.4rem;
        }
        .utr-login-title { font-size: 0.88rem; font-weight: 700; color: #1e293b; margin: 0 0 2px; }
        .utr-login-desc  { font-size: 0.77rem; color: #64748b; margin: 0; }
        .utr-login-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 0 20px; height: 42px; border-radius: 12px;
          border: 1.5px solid #4f46e5; color: #4f46e5;
          font-size: 0.85rem; font-weight: 700; font-family: inherit;
          background: #fff; text-decoration: none; white-space: nowrap;
          flex-shrink: 0; transition: background 0.15s, color 0.15s, transform 0.12s;
        }
        .utr-login-btn:hover { background: #4f46e5; color: #fff; transform: translateY(-1px); }
        .utr-login-btn:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }

        @keyframes utr-spin { to { transform: rotate(360deg); } }
        .utr-spin { animation: utr-spin 0.75s linear infinite; }
      `}</style>

      <section className="utr-shell" aria-label="Create account">
        <div className="utr-wrapper">
          <div className="utr-card">

            {/* LEFT — Brand Panel */}
            <div className="utr-left" aria-hidden="true">
              <div className="utr-blob-1" />
              <div className="utr-blob-2" />
              <div className="utr-blob-3" />
              <div className="utr-grid" />
              <div className="utr-arc" />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <Link to="/" className="utr-logo-link">
                  <div className="utr-logo-icon">
                    <ShoppingBag size={20} />
                  </div>
                  <span>Urban<span className="utr-logo-accent">Thread</span></span>
                </Link>

                <div className="utr-badge">
                  <Sparkles size={11} />
                  Modern Apparel &amp; Lifestyle
                </div>

                <h2 className="utr-headline">
                  Join the<br />
                  UrbanThread<br />
                  Community.
                </h2>
                <p className="utr-subtext">
                  Create your free account and unlock a seamless shopping experience
                  — from order tracking to express checkout, all in one place.
                </p>
              </div>

              <div className="utr-features">
                <div className="utr-feat-card">
                  <div className="utr-feat-icon utr-fi-indigo"><Package size={17} /></div>
                  <div>
                    <p className="utr-feat-title">Live Order Tracking</p>
                    <p className="utr-feat-desc">Real-time status updates and complete order history overview.</p>
                  </div>
                </div>
                <div className="utr-feat-card">
                  <div className="utr-feat-icon utr-fi-emerald"><Truck size={17} /></div>
                  <div>
                    <p className="utr-feat-title">Fast Islandwide Delivery</p>
                    <p className="utr-feat-desc">Secure doorstep delivery with Cash on Delivery &amp; PayHere.</p>
                  </div>
                </div>
                <div className="utr-feat-card">
                  <div className="utr-feat-icon utr-fi-amber"><Star size={17} /></div>
                  <div>
                    <p className="utr-feat-title">Exclusive Member Perks</p>
                    <p className="utr-feat-desc">Priority support, saved addresses &amp; early access to new drops.</p>
                  </div>
                </div>
              </div>

              <div className="utr-trust">
                <span className="utr-trust-item">
                  <CheckCircle2 size={13} style={{ color: '#6ee7b7' }} />
                  Verified Secure Platform
                </span>
                <span className="utr-trust-item">
                  <ShieldCheck size={13} />
                  256-bit Encrypted
                </span>
                <span>Colombo, LK</span>
              </div>
            </div>

            {/* RIGHT — Register Form Panel */}
            <div className="utr-right">

              {/* Mobile brand */}
              <Link to="/" className="utr-mobile-brand">
                <div className="utr-mob-icon"><ShoppingBag size={18} /></div>
                <span>Urban<span style={{ color: '#4f46e5' }}>Thread</span></span>
              </Link>

              <span className="utr-portal-label">New Account</span>

              <h1 className="utr-heading">Create account</h1>
              <p className="utr-sub">Fill in your details to get started — it only takes a minute.</p>

              {error && (
                <div role="alert" className="utr-error">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>

                {/* Name + Phone row */}
                <div className="utr-row2">
                  <div className="utr-field">
                    <label htmlFor="reg-name" className="utr-label">Full Name</label>
                    <div className="utr-input-wrap">
                      <span className="utr-input-icon"><User size={17} /></span>
                      <input
                        id="reg-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Kasun Perera"
                        className="utr-input"
                      />
                    </div>
                  </div>

                  <div className="utr-field">
                    <label htmlFor="reg-phone" className="utr-label">
                      Phone <span className="utr-label-opt">(optional)</span>
                    </label>
                    <div className="utr-input-wrap">
                      <span className="utr-input-icon"><Phone size={17} /></span>
                      <input
                        id="reg-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+94 77 123 4567"
                        className="utr-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="utr-field">
                  <label htmlFor="reg-email" className="utr-label">Email Address</label>
                  <div className="utr-input-wrap">
                    <span className="utr-input-icon"><Mail size={17} /></span>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="kasun@example.com"
                      className="utr-input"
                    />
                  </div>
                </div>

                {/* Password + Confirm row */}
                <div className="utr-row2">
                  <div className="utr-field">
                    <label htmlFor="reg-password" className="utr-label">
                      Password <span className="utr-label-opt">(min 6)</span>
                    </label>
                    <div className="utr-input-wrap">
                      <span className="utr-input-icon"><Lock size={17} /></span>
                      <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="utr-input utr-input-pr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="utr-pw-toggle"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div className="utr-field">
                    <label htmlFor="reg-confirm" className="utr-label">Confirm Password</label>
                    <div className="utr-input-wrap">
                      <span className="utr-input-icon"><Lock size={17} /></span>
                      <input
                        id="reg-confirm"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="utr-input"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  id="register-submit-btn"
                  className="utr-submit"
                >
                  {loading ? (
                    <><Loader2 size={18} className="utr-spin" />Creating Account…</>
                  ) : (
                    <>Create Account <ArrowRight size={17} /></>
                  )}
                </button>
              </form>

              <hr className="utr-divider" />

              <div className="utr-login-box">
                <div>
                  <p className="utr-login-title">Already have an account?</p>
                  <p className="utr-login-desc">Sign in to continue shopping and manage your orders.</p>
                </div>
                <Link
                  to="/login"
                  state={{ from: location.state?.from }}
                  className="utr-login-btn"
                  id="sign-in-btn"
                >
                  Sign In <Zap size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
