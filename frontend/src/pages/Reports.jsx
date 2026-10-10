import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Filter, Calendar, MapPin, Shield } from 'lucide-react';
import { incidentsApi } from '../api';
import { IncidentModal } from '../components/IncidentModal';
import { useGeolocation } from '../hooks/useGeolocation';

export const Reports = () => {
  const { coords } = useGeolocation(false);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentsApi.getNearby(coords.lat || 28.6328, coords.lng || 77.2197, 50);
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [coords.lat, coords.lng]);

  const filteredIncidents = incidents.filter((inc) => {
    if (selectedSeverity === 'All') return true;
    return inc.severity === selectedSeverity;
  });

  const severityStyles = {
    Low: 'bg-gray-100 text-gray-700 border-gray-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Critical: 'bg-red-50 text-[#DC2626] border-red-200 font-bold',
  };

  return (
    <div className="p-6 max-w-[1240px] mx-auto space-y-6">
      {/* Header & Report Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Community Incident Reports</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Crowd-sourced safety hazards and unsafe area logs contributing to SafeHer route safety index
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Report Safety Hazard</span>
        </button>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center space-x-1.5 p-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg w-fit text-xs">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedSeverity === sev
                ? 'bg-white text-[#111827] shadow-subtle border border-[#E5E7EB]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">Loading incident reports...</div>
        ) : filteredIncidents.length === 0 ? (
          <div className="card-base p-10 text-center text-xs text-[#6B7280]">
            No reports matching this severity category.
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-gray-300 transition-colors shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] border ${
                      severityStyles[inc.severity] || severityStyles.Medium
                    }`}
                  >
                    {inc.severity} Severity
                  </span>
                  <span className="text-xs font-bold text-[#111827]">{inc.category}</span>
                  {inc.distance_km !== undefined && (
                    <span className="text-[11px] text-[#9CA3AF]">
                      • {inc.distance_km} km away
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {inc.description}
                </p>

                <div className="flex items-center space-x-4 text-[11px] text-[#6B7280] pt-1">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#9CA3AF]" />
                    <span className="font-mono">{inc.lat?.toFixed(4)}, {inc.lng?.toFixed(4)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#9CA3AF]" />
                    <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center justify-end gap-2">
                <a
                  href={`https://maps.google.com/?q=${inc.lat},${inc.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] font-medium border border-[#E5E7EB] rounded-lg bg-[#FAFAFA] text-[#111827] hover:bg-[#F3F4F6]"
                >
                  View on Map
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <IncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentCoords={coords}
        onIncidentReported={(newInc) => setIncidents([newInc, ...incidents])}
      />
    </div>
  );
};
