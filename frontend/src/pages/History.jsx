import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Clock, ShieldAlert, CheckCircle, ExternalLink, Filter } from 'lucide-react';
import { useAlertStore } from '../store/useAlertStore';
import { AlertCard } from '../components/AlertCard';

export const History = () => {
  const { alerts, fetchAlerts, acknowledgeAlert, resolveAlert, loading } = useAlertStore();
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus === 'All') return true;
    return a.status?.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="p-6 max-w-[1240px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Alert Dispatch Timeline</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Audit log of all emergency triggers, AI sensor dispatches, and responder resolutions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-xs">
          {['All', 'Triggered', 'Acknowledged', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-white text-[#111827] shadow-subtle border border-[#E5E7EB]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="space-y-3">
        {loading && alerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">Loading alert timeline...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="card-base p-12 text-center space-y-2">
            <HistoryIcon className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <p className="text-xs font-semibold text-[#111827]">No alerts recorded in this filter view</p>
            <p className="text-[11px] text-[#6B7280]">
              Past SOS triggers, scream detections, and shake anomalies will show here.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={acknowledgeAlert}
              onResolve={resolveAlert}
            />
          ))
        )}
      </div>
    </div>
  );
};
