import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock, Mail, User, Phone, Droplet } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    blood_group: 'O+',
  });
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="mb-6 text-center">
        <div className="inline-flex w-12 h-12 rounded-xl bg-[#DC2626] items-center justify-center text-white mb-2 shadow-subtle">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">Create SafeHer Account</h1>
        <p className="text-xs text-[#6B7280]">Set up your emergency guard profile</p>
      </div>

      <div className="w-full max-w-sm bg-[#FAFAFA] border border-[#E5E7EB] rounded-card p-6 shadow-card">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-[#DC2626]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Full name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Aanya Sharma"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="aanya@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Mobile Phone (for SMS dispatches)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Blood Group</label>
              <div className="relative">
                <Droplet className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full pl-9 pr-2 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Registering...' : 'Create SafeHer Profile'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-[#6B7280]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#DC2626] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
