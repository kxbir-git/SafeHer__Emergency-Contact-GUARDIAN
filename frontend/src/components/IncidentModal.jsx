import React, { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { incidentsApi } from '../api';

export const IncidentModal = ({ isOpen, onClose, currentCoords, onIncidentReported }) => {
  const [category, setCategory] = useState('Harassment');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(currentCoords?.lat || 28.6328);
  const [lng, setLng] = useState(currentCoords?.lng || 77.2197);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a short description of the incident or hazard.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await incidentsApi.report({
        category,
        severity,
        description: description.trim(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      });
      if (onIncidentReported) onIncidentReported(res);
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-md p-6 shadow-modal">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
            <h3 className="text-base font-semibold text-[#111827]">Report Safety Hazard</h3>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#111827]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 text-xs text-[#DC2626] border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Hazard Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
            >
              <option value="Harassment">Harassment / Catcalling</option>
              <option value="Poor Lighting">Poor / Broken Street Lighting</option>
              <option value="Suspicious Activity">Suspicious Activity / Loitering</option>
              <option value="Stalking">Stalking / Following</option>
              <option value="Isolated Area">Isolated / Unpatrolled Stretch</option>
              <option value="Other">Other Safety Hazard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Severity Level</label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setSeverity(level)}
                  className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                    severity === level
                      ? 'border-[#DC2626] bg-red-50 text-[#DC2626]'
                      : 'border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Broken lights under the flyover; lone pedestrians being followed..."
              className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-[#6B7280]">
            <div>
              <label className="block mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg p-2 bg-[#F9FAFB] text-[#111827]"
              />
            </div>
            <div>
              <label className="block mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg p-2 bg-[#F9FAFB] text-[#111827]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#111827]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
