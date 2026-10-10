import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Mic, 
  Smartphone, 
  Shield, 
  Save, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useAlertStore } from '../store/useAlertStore';

export const Settings = () => {
  const { user, updateProfile } = useAuthStore();
  const { 
    voiceActive, 
    setVoiceActive, 
    micActive, 
    setMicActive, 
    motionActive, 
    setMotionActive, 
    guardianMode, 
    setGuardianMode 
  } = useAlertStore();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    blood_group: user?.blood_group || 'O+',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    const res = await updateProfile(formData);
    if (res.success) {
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(res.error || 'Failed to update profile.');
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#111827]">Application Settings</h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Configure profile details, AI safety triggers, and emergency dispatch preferences
        </p>
      </div>

      {/* 1. Profile Information */}
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#E5E7EB]">
          <User className="w-4 h-4 text-[#DC2626]" />
          <h2 className="text-sm font-semibold text-[#111827]">Personal Profile & Emergency Identity</h2>
        </div>

        {successMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-[#DC2626]">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Mobile Phone (Emergency SMS)</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Blood Group</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1">Registered Email (Read-Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-[#F9FAFB] text-[#9CA3AF]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. AI Distress Triggers & Sensors */}
      <div className="card-base p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#E5E7EB]">
          <Mic className="w-4 h-4 text-[#DC2626]" />
          <h2 className="text-sm font-semibold text-[#111827]">AI Triggers & Background Monitoring</h2>
        </div>

        <div className="space-y-3">
          {/* Voice Keyword */}
          <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#111827]">Keyword Speech Trigger ("Help Me" / "Bachao")</p>
              <p className="text-[11px] text-[#6B7280]">
                Listens via browser speech recognition and auto-dispatches alert on distress phrase.
              </p>
            </div>
            <button
              onClick={() => setVoiceActive(!voiceActive)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                voiceActive ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {voiceActive ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* AI Scream Classifier */}
          <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#111827]">AI Acoustic Scream & Panic Classifier</p>
              <p className="text-[11px] text-[#6B7280]">
                Samples audio features (MFCCs, spectral centroid, ZCR) using Python ML backend.
              </p>
            </div>
            <button
              onClick={() => setMicActive(!micActive)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                micActive ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {micActive ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Shake-to-Alert */}
          <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#111827]">Physical Shake-to-Alert (DeviceMotion)</p>
              <p className="text-[11px] text-[#6B7280]">
                Detects rapid multi-axis shake or struggle using rolling Z-score anomaly calculations.
              </p>
            </div>
            <button
              onClick={() => setMotionActive(!motionActive)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                motionActive ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {motionActive ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Guardian Mode */}
          <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#111827]">Guardian Oversight Mode</p>
              <p className="text-[11px] text-[#6B7280]">
                Grants trusted guardians real-time live map telemetry and alert resolution access.
              </p>
            </div>
            <button
              onClick={() => setGuardianMode(!guardianMode)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                guardianMode ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {guardianMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
