import React from 'react';
import { Shield, Radio, Wifi, PhoneCall } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAlertStore } from '../store/useAlertStore';

export const Topbar = ({ onOpenFakeCall, socketConnected = true }) => {
  const { user } = useAuthStore();
  const { guardianMode, setGuardianMode, activeAlert } = useAlertStore();

  return (
    <header className="h-16 border-b border-[#E5E7EB] bg-[#FFFFFF] px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <h2 className="text-base font-semibold text-[#111827]">
          Welcome, {user?.full_name?.split(' ')[0] || 'User'}
        </h2>
        <span className="text-xs text-[#9CA3AF]">|</span>
        <div className="flex items-center space-x-2 text-xs text-[#6B7280]">
          <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span>{socketConnected ? 'Real-time Sync Active' : 'Connecting...'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Guardian Mode Toggle */}
        <button
          onClick={() => setGuardianMode(!guardianMode)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            guardianMode
              ? 'bg-[#111827] text-white border-[#111827]'
              : 'bg-[#FAFAFA] text-[#6B7280] border-[#E5E7EB] hover:text-[#111827]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{guardianMode ? 'Guardian Mode ON' : 'Enable Guardian Mode'}</span>
        </button>

        {/* Quick Fake Call Escape */}
        <button
          onClick={onOpenFakeCall}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E5E7EB] bg-[#FAFAFA] text-[#111827] hover:bg-[#F3F4F6] transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Fake Call</span>
        </button>
      </div>
    </header>
  );
};
