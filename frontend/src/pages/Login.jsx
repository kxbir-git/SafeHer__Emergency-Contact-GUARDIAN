import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@safeher.app');
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex w-12 h-12 rounded-xl bg-[#DC2626] items-center justify-center text-white mb-3 shadow-subtle">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">SafeHer</h1>
        <p className="text-xs text-[#6B7280] mt-1">AI-Powered Safety & Real-Time Emergency Guard</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-[#FAFAFA] border border-[#E5E7EB] rounded-card p-6 shadow-card">
        <h2 className="text-base font-semibold text-[#111827] mb-1">Sign in to your account</h2>
        <p className="text-xs text-[#6B7280] mb-5">Access your personal safety dashboard</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#DC2626]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#111827]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#111827]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Credential Button */}
        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full py-2 text-xs font-medium text-[#111827] border border-[#E5E7EB] bg-white rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            Fill Demo Account (demo@safeher.app)
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-[#6B7280]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#DC2626] font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
