import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Activity, 
  Mic, 
  Smartphone, 
  Volume2, 
  Radio, 
  ArrowRight,
  ExternalLink,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { SOSButton } from '../components/SOSButton';
import { MapView } from '../components/MapView';
import { AlertCard } from '../components/AlertCard';
import { AlertModal } from '../components/AlertModal';
import { useAuthStore } from '../store/useAuthStore';
import { useAlertStore } from '../store/useAlertStore';
import { useGeolocation } from '../hooks/useGeolocation';
import { useShake } from '../hooks/useShake';
import { useVoiceTrigger } from '../hooks/useVoiceTrigger';
import { contactsApi, incidentsApi } from '../api';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { 
    alerts, 
    activeAlert, 
    fetchAlerts, 
    triggerEmergency, 
    acknowledgeAlert, 
    resolveAlert,
    micActive, 
    setMicActive, 
    motionActive, 
    setMotionActive,
    voiceActive,
    setVoiceActive,
    guardianMode
  } = useAlertStore();

  const { coords } = useGeolocation(true);
  const [contacts, setContacts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [lastDispatchedAlert, setLastDispatchedAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
    contactsApi.getContacts().then(setContacts).catch(() => {});
    incidentsApi.getNearby(coords.lat, coords.lng, 15).then(setIncidents).catch(() => {});
  }, [fetchAlerts, coords.lat, coords.lng]);

  // Hook 1: Shake to Alert
  const { triggerSimulatedShake } = useShake({
    enabled: motionActive,
    onShakeDetected: () => {
      handleTriggerAlert('shake', { method: 'rapid_device_shake' });
    },
  });

  // Hook 2 & 3: Voice Keyword Trigger & AI Scream Detection
  const { screamScore, lastDetectedKeyword } = useVoiceTrigger({
    voiceEnabled: voiceActive,
    screamCheckEnabled: micActive,
    onVoiceTriggered: (phrase) => {
      handleTriggerAlert('voice', { keyword: phrase });
    },
    onScreamDetected: (aiRes) => {
      handleTriggerAlert('scream', { confidence: aiRes.confidence });
    },
  });

  const handleTriggerAlert = async (type = 'sos', meta = {}) => {
    const res = await triggerEmergency(type, coords.lat, coords.lng, meta);
    if (res.success) {
      setLastDispatchedAlert(res.alert);
      setShowAlertModal(true);
    }
  };

  return (
    <div className="p-6 max-w-[1240px] mx-auto space-y-6">
      {/* Active Alert Banner if triggered */}
      {activeAlert && (
        <div className="p-4 rounded-card bg-red-50 border border-red-300 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-[#DC2626] animate-ping" />
            <div>
              <p className="text-xs font-bold text-[#DC2626] uppercase tracking-wide">
                Active Emergency Distress: {activeAlert.type} Alert #{activeAlert.id}
              </p>
              <p className="text-xs text-[#111827]">
                Live location transmitted: {activeAlert.lat?.toFixed(4)}, {activeAlert.lng?.toFixed(4)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => resolveAlert(activeAlert.id)}
              className="py-1.5 px-3 bg-[#DC2626] text-white text-xs font-semibold rounded-lg hover:bg-[#B91C1C] transition-colors"
            >
              Resolve / I'm Safe
            </button>
          </div>
        </div>
      )}

      {/* 12-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Big SOS Card (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-base p-6 flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                  <h2 className="text-sm font-semibold text-[#111827]">Emergency Dispatch</h2>
                </div>
                <span className="text-[11px] font-medium text-[#6B7280]">Hold 3s to Trigger</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-3 leading-relaxed">
                Triggering immediately alerts your {contacts.length || 3} emergency contacts via SMS & WebSockets with your live GPS location.
              </p>
            </div>

            {/* The Big SOS Button */}
            <div className="my-auto">
              <SOSButton onTrigger={() => handleTriggerAlert('sos')} />
            </div>

            {/* Simulated Desktop Triggers */}
            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
              <span>Testing shortcuts:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => triggerSimulatedShake()}
                  className="px-2.5 py-1 text-[11px] font-medium border border-[#E5E7EB] bg-white rounded-lg hover:bg-[#F3F4F6] text-[#111827]"
                >
                  Test Shake
                </button>
                <button
                  onClick={() => handleTriggerAlert('voice', { keyword: 'demo_test' })}
                  className="px-2.5 py-1 text-[11px] font-medium border border-[#E5E7EB] bg-white rounded-lg hover:bg-[#F3F4F6] text-[#111827]"
                >
                  Test Voice
                </button>
              </div>
            </div>
          </div>

          {/* AI Guardian Status Card */}
          <div className="card-base p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#DC2626]" />
                <h3 className="text-xs font-semibold text-[#111827]">AI Distress Detection Sensors</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active
              </span>
            </div>

            {/* Sensor 1: AI Scream Detection */}
            <div className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${micActive ? 'bg-red-50 text-[#DC2626]' : 'bg-gray-100 text-gray-500'}`}>
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111827]">AI Scream / Distress Classifier</p>
                  <p className="text-[11px] text-[#6B7280]">
                    {micActive ? `Listening (Distress score: ${(screamScore * 100).toFixed(0)}%)` : 'Disabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMicActive(!micActive)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  micActive ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                {micActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Sensor 2: Shake-to-Alert */}
            <div className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${motionActive ? 'bg-red-50 text-[#DC2626]' : 'bg-gray-100 text-gray-500'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111827]">Shake-to-Alert (Accelerometer)</p>
                  <p className="text-[11px] text-[#6B7280]">
                    {motionActive ? 'Z-score anomaly threshold: 3.0' : 'Disabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMotionActive(!motionActive)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  motionActive ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                {motionActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Sensor 3: Voice Trigger */}
            <div className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${voiceActive ? 'bg-red-50 text-[#DC2626]' : 'bg-gray-100 text-gray-500'}`}>
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111827]">Voice Trigger Keyword</p>
                  <p className="text-[11px] text-[#6B7280]">
                    {voiceActive ? 'Listens for "Help Me" / "Bachao"' : 'Disabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVoiceActive(!voiceActive)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  voiceActive ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white border-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                {voiceActive ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Map Card (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-base p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#DC2626]" />
                <h2 className="text-sm font-semibold text-[#111827]">Live Geographic Tracking</h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-[#6B7280]">
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </span>
                <Link
                  to="/map"
                  className="text-xs font-medium text-[#111827] hover:text-[#DC2626] flex items-center space-x-1"
                >
                  <span>Full Map</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <MapView
              center={[coords.lat, coords.lng]}
              zoom={14}
              height="380px"
              alerts={alerts.filter((a) => a.status !== 'resolved')}
              incidents={incidents}
              userName={user?.full_name?.split(' ')[0] || 'You'}
            />

            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="p-2.5 bg-white border border-[#E5E7EB] rounded-lg">
                <p className="text-[10px] uppercase font-semibold text-[#6B7280]">Incidents Nearby</p>
                <p className="text-base font-bold text-[#111827] mt-0.5">{incidents.length}</p>
              </div>
              <div className="p-2.5 bg-white border border-[#E5E7EB] rounded-lg">
                <p className="text-[10px] uppercase font-semibold text-[#6B7280]">Area Safety Score</p>
                <p className="text-base font-bold text-emerald-600 mt-0.5">88/100</p>
              </div>
              <div className="p-2.5 bg-white border border-[#E5E7EB] rounded-lg">
                <p className="text-[10px] uppercase font-semibold text-[#6B7280]">Guardians Online</p>
                <p className="text-base font-bold text-[#111827] mt-0.5">2</p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Brief Card */}
          <div className="card-base p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#DC2626]" />
                <h3 className="text-xs font-semibold text-[#111827]">Emergency Guardians ({contacts.length}/5)</h3>
              </div>
              <Link to="/contacts" className="text-xs font-medium text-[#DC2626] hover:underline flex items-center space-x-1">
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {contacts.length === 0 ? (
                <p className="text-xs text-[#6B7280] col-span-3 py-2">No emergency contacts added yet.</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="p-3 bg-white border border-[#E5E7EB] rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#111827] truncate">{contact.name}</span>
                      {contact.is_guardian && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-[#DC2626] border border-red-200 font-bold">
                          GUARD
                        </span>
                      )}
                    </div>
                    <p className="text-[#6B7280] text-[11px] truncate">{contact.relation}</p>
                    <p className="font-mono text-[11px] text-[#111827] truncate">{contact.phone}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Alerts Feed Card */}
          <div className="card-base p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                <h3 className="text-xs font-semibold text-[#111827]">Recent Alert Activity</h3>
              </div>
              <Link to="/history" className="text-xs font-medium text-[#6B7280] hover:text-[#111827]">
                View All
              </Link>
            </div>

            {alerts.length === 0 ? (
              <p className="text-xs text-[#6B7280] py-4 text-center">No recent alerts recorded. Status calm.</p>
            ) : (
              <div className="space-y-2.5">
                {alerts.slice(0, 3).map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={acknowledgeAlert}
                    onResolve={resolveAlert}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Confirmation Modal when Alert is Dispatched */}
      <AlertModal
        alert={lastDispatchedAlert}
        contactsCount={contacts.length || 3}
        onClose={() => setShowAlertModal(false)}
        onResolve={resolveAlert}
      />
    </div>
  );
};
