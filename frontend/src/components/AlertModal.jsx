import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  X,
  Phone,
  MapPin,
  CheckCircle,
  ChevronRight,
  Users,
  ExternalLink,
  Navigation
} from 'lucide-react';

/**
 * AlertModal — shown after SOS / any emergency trigger
 * 
 * Flow:
 *  Step 1: Shows alert info + guardian list with WhatsApp call buttons
 *  Step 2: After calling, shows "Share Live Location" button to send tracking link via WhatsApp
 */

const WHATSAPP_GREEN = '#25D366';

const buildLiveTrackUrl = ({ name, phone, lat, lng, userId, alertId }) => {
  const base = window.location.origin;
  const params = new URLSearchParams({
    name: name || 'User',
    phone: phone || '',
    lat: lat?.toFixed(6) || '',
    lng: lng?.toFixed(6) || '',
    uid: userId || '',
    alert: alertId || '',
  });
  return `${base}/track?${params.toString()}`;
};

const buildWhatsAppCallUrl = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return `https://wa.me/${cleaned}`;
};

const buildWhatsAppMessageUrl = (phone, message) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
};

export const AlertModal = ({ alert, contacts = [], user, onClose, onResolve }) => {
  const [step, setStep] = useState('guardians'); // 'guardians' | 'called'
  const [calledGuardian, setCalledGuardian] = useState(null);
  const [locationShared, setLocationShared] = useState({});

  // Reset internal state when a new alert is shown or when modal is reopened
  useEffect(() => {
    setStep('guardians');
    setCalledGuardian(null);
    setLocationShared({});
  }, [alert]);

  if (!alert) return null;

  const guardians = contacts.filter(c => c.is_guardian);
  const allContacts = guardians.length > 0 ? guardians : contacts;

  const trackUrl = buildLiveTrackUrl({
    name: user?.full_name || alert.user_name || 'User',
    phone: user?.phone || alert.user_phone || '',
    lat: alert.lat,
    lng: alert.lng,
    userId: user?.id || alert.user_id,
    alertId: alert.id,
  });

  const googleMapsUrl = `https://maps.google.com/maps?q=${alert.lat},${alert.lng}`;
  const userName = user?.full_name || alert.user_name || 'User';
  const alertTime = new Date().toLocaleString('en-IN', { 
    dateStyle: 'medium', 
    timeStyle: 'short', 
    hour12: true 
  });

  const emergencyMsg = (contactName) =>
    `🚨 *EMERGENCY ALERT — SafeHer Safety App*

Dear ${contactName},

This is an automated emergency alert. *${userName}* has triggered a distress signal and requires immediate assistance.

━━━━━━━━━━━━━━━━━━━━━
📋 *Alert Details:*
• *Alert Type:* ${alert.type?.toUpperCase() || 'SOS'}
• *Time:* ${alertTime}
• *Coordinates:* ${alert.lat?.toFixed(6)}, ${alert.lng?.toFixed(6)}
━━━━━━━━━━━━━━━━━━━━━

📍 *Current Location (Google Maps):*
${googleMapsUrl}

🔴 *Live Real-Time Tracking:*
${trackUrl}
_(Updates automatically every 5 seconds)_

━━━━━━━━━━━━━━━━━━━━━
⚠️ *Immediate Actions Required:*
1. Open the Google Maps link above to see the exact location
2. Open the Live Tracking link to track real-time movement
3. If unreachable, call Police Emergency: *112*
━━━━━━━━━━━━━━━━━━━━━

_This is an automated alert sent via SafeHer Women Safety App. Please respond immediately._`;

  const handleWhatsAppCall = (contact) => {
    setCalledGuardian(contact);
    setStep('called');
    window.open(buildWhatsAppCallUrl(contact.phone), '_blank');
  };

  const handleShareLocation = (contact) => {
    setLocationShared(prev => ({ ...prev, [contact.id]: true }));
    window.open(buildWhatsAppMessageUrl(contact.phone, emergencyMsg(contact.name)), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* RED EMERGENCY HEADER */}
        <div className="bg-[#DC2626] px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-100 uppercase tracking-wider">Distress Alert Dispatched</p>
              <p className="text-sm font-semibold text-white capitalize">{alert.type} Alert Triggered</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* DISPATCH INFO STRIP */}
        <div className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-[#DC2626]">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-mono font-medium">{alert.lat?.toFixed(4)}, {alert.lng?.toFixed(4)}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[#6B7280]">
            <span>{allContacts.length} guardians notified</span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto">

          {/* STEP 1: GUARDIAN WHATSAPP CALL LIST */}
          {step === 'guardians' && (
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#111827] mb-0.5">Call a Guardian via WhatsApp</p>
                <p className="text-xs text-[#6B7280]">
                  Tap to call directly — your live location link will be ready to share after the call.
                </p>
              </div>

              {allContacts.length > 0 ? (
                <div className="space-y-2.5">
                  {allContacts.map(contact => (
                    <div
                      key={contact.id}
                      className="border border-[#E5E7EB] rounded-xl overflow-hidden"
                    >
                      {/* Contact Info Row */}
                      <div className="flex items-center justify-between px-4 py-3 bg-[#F9FAFB]">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">{contact.name}</p>
                          <p className="text-xs text-[#6B7280]">{contact.relation} • {contact.phone}</p>
                        </div>
                        {contact.is_guardian && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            GUARDIAN
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex border-t border-[#E5E7EB]">
                        {/* WhatsApp Call */}
                        <button
                          onClick={() => handleWhatsAppCall(contact)}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-semibold transition-colors hover:bg-green-50"
                          style={{ color: WHATSAPP_GREEN }}
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span>WhatsApp Call</span>
                        </button>

                        <div className="w-px bg-[#E5E7EB]" />

                        {/* Share Location */}
                        <button
                          onClick={() => handleShareLocation(contact)}
                          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-semibold transition-colors ${
                            locationShared[contact.id]
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                          }`}
                        >
                          {locationShared[contact.id] ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Location Sent!</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              <span>Share Location</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-[#6B7280]">
                  <Users className="w-8 h-8 mx-auto mb-2 text-[#D1D5DB]" />
                  No guardians added yet. Go to Contacts to add emergency contacts.
                </div>
              )}

              {/* Google Maps quick link */}
              <a
                href={`https://maps.google.com/?q=${alert.lat},${alert.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 w-full py-2 px-3 text-xs font-medium text-[#6B7280] border border-[#E5E7EB] bg-white rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View My Location in Google Maps</span>
              </a>
            </div>
          )}

          {/* STEP 2: AFTER CALL — SEND LIVE TRACKING LINK */}
          {step === 'called' && calledGuardian && (
            <div className="p-5 space-y-4">
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" style={{ color: WHATSAPP_GREEN }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#111827]">Called {calledGuardian.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Now send them your live tracking link so they can navigate to you in real-time.
                </p>
              </div>

              {/* Live Track Link Preview */}
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-xs font-semibold text-emerald-800">Live Location Link</p>
                </div>
                <p className="text-[11px] font-mono text-emerald-700 break-all leading-relaxed">
                  {trackUrl}
                </p>
                <p className="text-[10px] text-emerald-600">
                  This link shows your real-time GPS position — updates every 5 seconds. No login needed.
                </p>
              </div>

              {/* Send via WhatsApp */}
              <button
                onClick={() => handleShareLocation(calledGuardian)}
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: locationShared[calledGuardian.id] ? '#16a34a' : WHATSAPP_GREEN }}
              >
                {locationShared[calledGuardian.id] ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Live Location Sent to {calledGuardian.name}!</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>Send Live Location to {calledGuardian.name} via WhatsApp</span>
                  </>
                )}
              </button>

              {/* Call other guardians */}
              <button
                onClick={() => setStep('guardians')}
                className="w-full py-2.5 text-xs font-medium text-[#6B7280] border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors"
              >
                ← Call another guardian
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="border-t border-[#E5E7EB] p-4 space-y-2.5 flex-shrink-0 bg-white">
          <a
            href="tel:112"
            className="flex items-center justify-center space-x-2 w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-xl transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call Police 112 (Emergency)</span>
          </a>
          <button
            onClick={() => {
              if (onResolve) onResolve(alert.id);
              onClose();
            }}
            className="w-full py-2.5 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#6B7280] rounded-xl transition-colors"
          >
            ✓ I'm Safe — Resolve Alert
          </button>
        </div>
      </div>
    </div>
  );
};
