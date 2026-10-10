import React from 'react';
import { ShieldAlert, CheckCircle, Clock, Check, AlertCircle } from 'lucide-react';

export const AlertCard = ({ alert, onAcknowledge, onResolve }) => {
  const isTriggered = alert.status === 'triggered';
  const isAcknowledged = alert.status === 'acknowledged';
  const isResolved = alert.status === 'resolved';

  const typeStyles = {
    sos: 'bg-red-50 text-[#DC2626] border-red-200',
    scream: 'bg-amber-50 text-amber-700 border-amber-200',
    shake: 'bg-purple-50 text-purple-700 border-purple-200',
    voice: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const statusStyles = {
    triggered: 'bg-red-100 text-[#DC2626]',
    acknowledged: 'bg-amber-100 text-amber-800',
    resolved: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-gray-300 transition-colors shadow-subtle">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border ${
              typeStyles[alert.type?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            {alert.type}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
              statusStyles[alert.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {alert.status}
          </span>
        </div>
        <span className="text-[11px] text-[#9CA3AF] flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </span>
      </div>

      <div className="space-y-1 mb-3">
        <p className="text-xs font-semibold text-[#111827]">
          {alert.user_name || 'Emergency Dispatch'}
        </p>
        <p className="text-[11px] text-[#6B7280]">
          Location: {alert.lat?.toFixed(4)}, {alert.lng?.toFixed(4)}
        </p>

        {alert.confidence !== undefined && (
          <div className="pt-1 flex items-center space-x-2 text-[11px] text-[#6B7280]">
            <span>AI Distress Confidence:</span>
            <div className="flex-1 max-w-[120px] bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${alert.confidence > 0.7 ? 'bg-[#DC2626]' : 'bg-amber-500'}`}
                style={{ width: `${Math.round((alert.confidence || 0) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[#111827]">{Math.round((alert.confidence || 0) * 100)}%</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isResolved && (
        <div className="flex items-center space-x-2 pt-2 border-t border-[#F3F4F6]">
          {isTriggered && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="flex-1 py-1.5 px-3 text-[11px] font-medium border border-[#E5E7EB] bg-[#FAFAFA] text-[#111827] rounded-lg hover:bg-[#F3F4F6] transition-colors flex items-center justify-center space-x-1"
            >
              <Check className="w-3 h-3 text-[#6B7280]" />
              <span>Acknowledge</span>
            </button>
          )}
          {onResolve && (
            <button
              onClick={() => onResolve(alert.id)}
              className="flex-1 py-1.5 px-3 text-[11px] font-medium border border-transparent bg-[#111827] text-white rounded-lg hover:bg-black transition-colors flex items-center justify-center space-x-1"
            >
              <CheckCircle className="w-3 h-3" />
              <span>Resolve</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
