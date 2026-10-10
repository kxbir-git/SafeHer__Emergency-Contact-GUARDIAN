import React from 'react';
import { ShieldAlert, CheckCircle, ExternalLink, Phone, X } from 'lucide-react';

export const AlertModal = ({ alert, contactsCount = 3, onClose, onResolve }) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-none">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-md p-6 shadow-modal">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-[#DC2626]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#111827]">
                Distress Alert Dispatched
              </h3>
              <p className="text-xs text-[#6B7280]">
                Trigger type: <span className="font-medium text-[#DC2626] uppercase">{alert.type}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-3">
          <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs space-y-1.5">
            <div className="flex justify-between text-[#6B7280]">
              <span>Emergency Contacts Notified:</span>
              <span className="font-semibold text-[#111827]">{contactsCount} Contacts (SMS + In-App)</span>
            </div>
            <div className="flex justify-between text-[#6B7280]">
              <span>Coordinates:</span>
              <span className="font-mono text-[#111827]">
                {alert.lat?.toFixed(4)}, {alert.lng?.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between text-[#6B7280]">
              <span>Dispatched At:</span>
              <span className="text-[#111827]">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <p className="text-xs text-[#6B7280] leading-relaxed">
            Your emergency contacts have received an SMS dispatch with your live GPS location. Keep this browser window open.
          </p>

          <a
            href={`https://maps.google.com/?q=${alert.lat},${alert.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 w-full py-2 px-3 text-xs font-medium text-[#111827] border border-[#E5E7EB] bg-white rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Open Location in Google Maps</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center space-x-3">
          <a
            href="tel:112"
            className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 112 (Police)</span>
          </a>
          <button
            onClick={() => {
              if (onResolve) onResolve(alert.id);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#111827] rounded-lg transition-colors"
          >
            Mark I'm Safe
          </button>
        </div>
      </div>
    </div>
  );
};
