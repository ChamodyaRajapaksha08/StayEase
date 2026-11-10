import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, Building, Check } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('TENANT');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName,
        username,
        email,
        phone,
        password,
        role,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.username || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
      <Link to="/" className="flex items-center gap-2.5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
          S
        </div>
        <span className="font-extrabold text-2xl tracking-tight text-secondary">StayEase</span>
      </Link>

      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-slate-200/80 p-8">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-main">Create Your StayEase Account</h2>
          <p className="text-xs text-muted mt-1">Select your role and start using the platform today</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-danger rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('TENANT')}
            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
              role === 'TENANT'
                ? 'border-primary bg-primary-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className={`p-2 rounded-lg ${role === 'TENANT' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-main">Resident Tenant</p>
              <p className="text-[10px] text-muted">Book rooms & track rent</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('OWNER')}
            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
              role === 'OWNER'
                ? 'border-primary bg-primary-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <div className={`p-2 rounded-lg ${role === 'OWNER' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Building className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-main">Property Owner</p>
              <p className="text-[10px] text-muted">Manage hostels & units</p>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. eleanor_v"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0100"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'OWNER' ? 'Property Owner' : 'Tenant'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
