import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Profile() {
  const { user, refreshUser } = useAuth();

  // ── Profile form state ──
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // ── Password form state ──
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(null);
  const [pwError, setPwError] = useState(null);

  // Populate profile fields from auth context
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (profileError) setProfileError(null);
    if (profileSuccess) setProfileSuccess(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (profile.name.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }

    setProfileLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/auth/profile`, {
        name: profile.name.trim(),
        phone: profile.phone.trim() || null,
        address: profile.address.trim() || null,
        city: profile.city.trim() || null,
      });
      await refreshUser();
      setProfileSuccess('Your profile has been updated successfully.');
    } catch (err) {
      setProfileError(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (pwError) setPwError(null);
    if (pwSuccess) setPwSuccess(null);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!passwords.currentPassword) {
      setPwError('Please enter your current password.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/auth/password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwSuccess('Password changed successfully.');
    } catch (err) {
      setPwError(
        err.response?.data?.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .prf-page {
          min-height: calc(100vh - 4rem);
          background: linear-gradient(135deg, #eef2ff 0%, #f8faff 60%, #faf5ff 100%);
          padding: 2.5rem 1.25rem 4rem;
        }
        .prf-container {
          max-width: 860px;
          margin: 0 auto;
        }

        /* Header */
        .prf-header {
          margin-bottom: 2rem;
        }
        .prf-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.78rem; color: #94a3b8; margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .prf-breadcrumb a {
          color: #4f46e5; text-decoration: none; font-weight: 600;
        }
        .prf-breadcrumb a:hover { text-decoration: underline; }
        .prf-title-row {
          display: flex; align-items: center; gap: 16px;
        }
        .prf-avatar {
          width: 64px; height: 64px; border-radius: 18px;
          background: linear-gradient(135deg, #4f46e5, #5b21b6);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 1.5rem; font-weight: 800;
          flex-shrink: 0; box-shadow: 0 4px 16px rgba(79,70,229,0.28);
        }
        .prf-title { font-size: 1.75rem; font-weight: 900; color: #0f172a; letter-spacing: -0.03em; margin: 0; }
        .prf-email-tag {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 4px; font-size: 0.83rem; color: #64748b;
        }

        /* Cards */
        .prf-card {
          background: #fff;
          border-radius: 22px;
          border: 1px solid #e8edf4;
          box-shadow: 0 4px 24px rgba(79,70,229,0.06), 0 1px 4px rgba(0,0,0,0.04);
          padding: 2rem 2.25rem;
          margin-bottom: 1.5rem;
        }
        .prf-card-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 1.75rem; padding-bottom: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .prf-card-icon {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .prf-icon-indigo { background: #eef2ff; color: #4f46e5; }
        .prf-icon-purple { background: #f5f3ff; color: #5b21b6; }
        .prf-card-title { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0 0 2px; }
        .prf-card-desc { font-size: 0.78rem; color: #64748b; margin: 0; }

        /* Form fields */
        .prf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        @media (max-width: 600px) { .prf-grid2 { grid-template-columns: 1fr; } }
        .prf-field { margin-bottom: 0; }
        .prf-field-full { grid-column: 1 / -1; }
        .prf-label {
          display: block; font-size: 0.7rem; font-weight: 800;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: #374151; margin-bottom: 6px;
        }
        .prf-input-wrap { position: relative; }
        .prf-input-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%); color: #9ca3af;
          display: flex; align-items: center; pointer-events: none;
        }
        .prf-input {
          width: 100%; box-sizing: border-box;
          height: 48px; padding: 0 14px 0 44px;
          border-radius: 13px; border: 1.5px solid #e2e8f0;
          background: #f8fafc; font-size: 0.92rem;
          color: #0f172a; outline: none; font-family: inherit;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .prf-input::placeholder { color: #94a3b8; }
        .prf-input:hover { border-color: #c7d2fe; background: #f0f4ff; }
        .prf-input:focus {
          border-color: #4f46e5; background: #fff;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.10);
        }
        .prf-input:disabled {
          background: #f1f5f9; color: #94a3b8; cursor: not-allowed;
          border-color: #e2e8f0;
        }
        .prf-input-pr { padding-right: 50px; }

        .prf-pw-toggle {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%); background: none;
          border: none; cursor: pointer; color: #9ca3af;
          display: flex; align-items: center; padding: 4px;
          border-radius: 8px; transition: color 0.15s, background 0.15s;
        }
        .prf-pw-toggle:hover { color: #4f46e5; background: #eef2ff; }

        /* Alerts */
        .prf-success {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 16px; border-radius: 13px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #15803d; font-size: 0.85rem; font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .prf-error {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 13px 16px; border-radius: 13px;
          background: #fff1f2; border: 1px solid #fecdd3;
          color: #be123c; font-size: 0.85rem; font-weight: 500;
          margin-bottom: 1.5rem;
        }

        /* Buttons */
        .prf-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          height: 50px; padding: 0 28px;
          border-radius: 13px; border: none; cursor: pointer;
          font-size: 0.95rem; font-weight: 700; font-family: inherit;
          background: linear-gradient(135deg, #4f46e5 0%, #5b21b6 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(79,70,229,0.28);
          transition: transform 0.12s, box-shadow 0.12s, opacity 0.12s;
          margin-top: 1.5rem;
        }
        .prf-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(79,70,229,0.36);
        }
        .prf-btn:active:not(:disabled) { transform: translateY(0); }
        .prf-btn:disabled { opacity: 0.58; cursor: not-allowed; }
        .prf-btn:focus-visible { outline: 2px solid #4f46e5; outline-offset: 3px; }

        @keyframes prf-spin { to { transform: rotate(360deg); } }
        .prf-spin { animation: prf-spin 0.75s linear infinite; }

        @media (max-width: 600px) {
          .prf-card { padding: 1.5rem 1.25rem; }
          .prf-page { padding: 1.5rem 1rem 3rem; }
        }
      `}</style>

      <div className="prf-page">
        <div className="prf-container">

          {/* Header */}
          <div className="prf-header">
            <div className="prf-breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>My Account</span>
            </div>
            <div className="prf-title-row">
              <div className="prf-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={28} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 className="prf-title">{user?.name || 'My Account'}</h1>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: user?.role === 'admin' ? '#f3e8ff' : '#e0e7ff',
                      color: user?.role === 'admin' ? '#7e22ce' : '#4338ca',
                      border: user?.role === 'admin' ? '1px solid #d8b4fe' : '1px solid #c7d2fe',
                    }}
                  >
                    <Shield size={11} />
                    {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                  </span>
                </div>
                <div className="prf-email-tag">
                  <Mail size={13} />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Profile Info Card ── */}
          <div className="prf-card">
            <div className="prf-card-header">
              <div className="prf-card-icon prf-icon-indigo">
                <User size={20} />
              </div>
              <div>
                <p className="prf-card-title">Profile Information</p>
                <p className="prf-card-desc">Update your name, phone, and delivery address.</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="prf-success" role="status">
                <CheckCircle2 size={17} />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="prf-error" role="alert">
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} noValidate>
              <div className="prf-grid2">

                {/* Full Name */}
                <div className="prf-field">
                  <label htmlFor="prf-name" className="prf-label">Full Name</label>
                  <div className="prf-input-wrap">
                    <span className="prf-input-icon"><User size={16} /></span>
                    <input
                      id="prf-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      placeholder="Kasun Perera"
                      className="prf-input"
                    />
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="prf-field">
                  <label className="prf-label">Email Address</label>
                  <div className="prf-input-wrap">
                    <span className="prf-input-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="prf-input"
                      title="Email cannot be changed"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="prf-field">
                  <label htmlFor="prf-phone" className="prf-label">Phone Number</label>
                  <div className="prf-input-wrap">
                    <span className="prf-input-icon"><Phone size={16} /></span>
                    <input
                      id="prf-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="+94 77 123 4567"
                      className="prf-input"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="prf-field">
                  <label htmlFor="prf-city" className="prf-label">City</label>
                  <div className="prf-input-wrap">
                    <span className="prf-input-icon"><MapPin size={16} /></span>
                    <input
                      id="prf-city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      value={profile.city}
                      onChange={handleProfileChange}
                      placeholder="Colombo"
                      className="prf-input"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="prf-field prf-field-full">
                  <label htmlFor="prf-address" className="prf-label">Delivery Address</label>
                  <div className="prf-input-wrap">
                    <span className="prf-input-icon"><MapPin size={16} /></span>
                    <input
                      id="prf-address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      value={profile.address}
                      onChange={handleProfileChange}
                      placeholder="123 Galle Road, Colombo 03"
                      className="prf-input"
                    />
                  </div>
                </div>

              </div>

              <button
                type="submit"
                disabled={profileLoading}
                id="save-profile-btn"
                className="prf-btn"
              >
                {profileLoading ? (
                  <><Loader2 size={17} className="prf-spin" />Saving…</>
                ) : (
                  <>Save Changes <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>

          {/* ── Change Password Card ── */}
          <div className="prf-card">
            <div className="prf-card-header">
              <div className="prf-card-icon prf-icon-purple">
                <Shield size={20} />
              </div>
              <div>
                <p className="prf-card-title">Change Password</p>
                <p className="prf-card-desc">Verify your current password before setting a new one.</p>
              </div>
            </div>

            {pwSuccess && (
              <div className="prf-success" role="status">
                <CheckCircle2 size={17} />
                <span>{pwSuccess}</span>
              </div>
            )}
            {pwError && (
              <div className="prf-error" role="alert">
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} noValidate>
              <div className="prf-grid2">

                {/* Current password */}
                <div className="prf-field prf-field-full">
                  <label htmlFor="prf-current-pw" className="prf-label">Current Password</label>
                  <div className="prf-input-wrap">
                    <span className="prf-input-icon"><Lock size={16} /></span>
                    <input
                      id="prf-current-pw"
                      name="currentPassword"
                      type={showCurrent ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Your current password"
                      className="prf-input prf-input-pr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((p) => !p)}
                      className="prf-pw-toggle"
                      aria-label={showCurrent ? 'Hide' : 'Show'}
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="prf-field">
                  <label htmlFor="prf-new-pw" className="prf-label">New Password</label>
                  <div className="prf-input-wrap">
                    <span className="prf-input-icon"><Lock size={16} /></span>
                    <input
                      id="prf-new-pw"
                      name="newPassword"
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Min 6 characters"
                      className="prf-input prf-input-pr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((p) => !p)}
                      className="prf-pw-toggle"
                      aria-label={showNew ? 'Hide' : 'Show'}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm new password */}
                <div className="prf-field">
                  <label htmlFor="prf-confirm-pw" className="prf-label">Confirm New Password</label>
                  <div className="prf-input-wrap">
                    <span className="prf-input-icon"><Lock size={16} /></span>
                    <input
                      id="prf-confirm-pw"
                      name="confirmPassword"
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Repeat new password"
                      className="prf-input"
                    />
                  </div>
                </div>

              </div>

              <button
                type="submit"
                disabled={pwLoading}
                id="change-password-btn"
                className="prf-btn"
              >
                {pwLoading ? (
                  <><Loader2 size={17} className="prf-spin" />Updating…</>
                ) : (
                  <>Update Password <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
