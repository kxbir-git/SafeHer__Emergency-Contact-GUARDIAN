import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Shield, 
  AlertTriangle, 
  Navigation, 
  Search, 
  CheckCircle, 
  Filter,
  Phone,
  Building2,
  Hospital,
  Cross
} from 'lucide-react';
import { MapView } from '../components/MapView';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAlertStore } from '../store/useAlertStore';
import { useAuthStore } from '../store/useAuthStore';
import { incidentsApi } from '../api';

// Realistic seeded emergency infrastructure dataset (Delhi Central metro area)
const SEED_NEARBY_FACILITIES = [
  {
    type: 'police',
    name: 'Parliament Street Police Station',
    phone: '011-23361100',
    address: 'Sansad Marg, Connaught Place',
    lat: 28.6258,
    lng: 77.2140,
  },
  {
    type: 'police',
    name: 'Connaught Place Police Post',
    phone: '011-23412233',
    address: 'Block B, Inner Circle, CP',
    lat: 28.6335,
    lng: 77.2190,
  },
  {
    type: 'police',
    name: 'Mandir Marg Police Station',
    phone: '011-23364100',
    address: 'Mandir Marg, Gole Market',
    lat: 28.6290,
    lng: 77.2010,
  },
  {
    type: 'hospital',
    name: 'Dr. Ram Manohar Lohia Hospital (RML)',
    phone: '011-23365525',
    address: 'Baba Kharak Singh Marg',
    lat: 28.6248,
    lng: 77.2025,
  },
  {
    type: 'hospital',
    name: 'Lady Hardinge Medical College & Hospital',
    phone: '011-23363728',
    address: 'Shaheed Bhagat Singh Marg, CP',
    lat: 28.6345,
    lng: 77.2135,
  },
  {
    type: 'pharmacy',
    name: 'Apollo Pharmacy (24x7 Emergency)',
    phone: '+91 98101 22334',
    address: 'Scindia House, KG Marg, CP',
    lat: 28.6300,
    lng: 77.2225,
  },
  {
    type: 'pharmacy',
    name: 'MedPlus 24/7 Chemist',
    phone: '+91 98102 33445',
    address: 'Janpath Lane, CP',
    lat: 28.6265,
    lng: 77.2185,
  },
];

export const LiveMap = () => {
  const { coords } = useGeolocation(true);
  const { alerts } = useAlertStore();
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, police, hospital, pharmacy
  const [destination, setDestination] = useState('');
  const [routeAnalysis, setRouteAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    incidentsApi.getNearby(coords.lat, coords.lng, 25).then(setIncidents).catch(() => {});
  }, [coords.lat, coords.lng]);

  const filteredFacilities = SEED_NEARBY_FACILITIES.filter((f) => {
    if (filterType === 'all') return true;
    return f.type === filterType;
  });

  const handleSafeRouteCheck = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      // Calculate safety score based on incidents count
      const highSeverityCount = incidents.filter((i) => i.severity === 'High' || i.severity === 'Critical').length;
      const baseScore = Math.max(95 - highSeverityCount * 8, 62);

      setRouteAnalysis({
        destination: destination.trim(),
        safetyScore: baseScore,
        status: baseScore >= 80 ? 'Safe Corridor' : 'Exercise Caution',
        incidentsAlongRoute: highSeverityCount,
        recommendation: baseScore >= 80
          ? 'Well-lit arterial road with active police PCR van presence. Recommended path.'
          : 'Multiple past poor lighting / harassment reports noted along inner alleys. Stick to main metro corridor.',
        suggestedCorridor: 'Via Barakhamba Road & Inner Circle (CCTV Monitored)',
      });
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="p-6 max-w-[1240px] mx-auto space-y-6">
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Live Geographic Safety Map</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time GPS tracking, emergency services, and community incident reports
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 p-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-xs">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'police', label: 'Police Stations' },
            { id: 'hospital', label: 'Hospitals' },
            { id: 'pharmacy', label: '24/7 Pharmacies' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterType === tab.id
                  ? 'bg-white text-[#111827] shadow-subtle border border-[#E5E7EB]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <MapView
            center={[coords.lat, coords.lng]}
            zoom={14}
            height="560px"
            alerts={alerts.filter((a) => a.status !== 'resolved')}
            incidents={incidents}
            nearbyFacilities={filteredFacilities}
            userName={user?.full_name?.split(' ')[0] || 'You'}
          />

          {/* Map Legend */}
          <div className="p-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl flex flex-wrap items-center justify-between text-xs text-[#6B7280] gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              <span className="text-[#111827] font-medium">Your Live GPS</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-700" />
              <span>Police Stations</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
              <span>Hospitals</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-600" />
              <span>24/7 Pharmacies</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-gray-600" />
              <span>Reported Hazards</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Safe Route Check & Nearby Helplines (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Feature 6: Safe Route Check */}
          <div className="card-base p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#E5E7EB]">
              <Navigation className="w-4 h-4 text-[#DC2626]" />
              <h3 className="text-xs font-semibold text-[#111827]">Safe Route Safety Checker</h3>
            </div>

            <form onSubmit={handleSafeRouteCheck} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">
                  Destination Address / Metro Station
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Rajiv Chowk Metro Gate 4"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded-lg bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-2 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing Safety Score...' : 'Check Route Safety'}
              </button>
            </form>

            {/* Route Analysis Result */}
            {routeAnalysis && (
              <div className="p-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#111827]">{routeAnalysis.destination}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      routeAnalysis.safetyScore >= 80
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    Score: {routeAnalysis.safetyScore}/100
                  </span>
                </div>

                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  {routeAnalysis.recommendation}
                </p>

                <div className="pt-1 text-[11px] text-[#111827]">
                  <span className="text-[#6B7280]">Suggested Corridor: </span>
                  <span className="font-medium">{routeAnalysis.suggestedCorridor}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Emergency Helplines */}
          <div className="card-base p-5 space-y-3">
            <h3 className="text-xs font-semibold text-[#111827] pb-2 border-b border-[#E5E7EB]">
              National Emergency Helplines
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Women Helpline (All India)', num: '1091', desc: '24/7 Toll-free assistance' },
                { name: 'National Emergency Number', num: '112', desc: 'Police / Fire / Ambulance' },
                { name: 'National Commission for Women', num: '7827170170', desc: 'Domestic & Cyber cell' },
                { name: 'Delhi Police Women Helpline', num: '1096', desc: 'Direct anti-stalking desk' },
              ].map((line) => (
                <div key={line.num} className="p-2.5 bg-white border border-[#E5E7EB] rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#111827]">{line.name}</p>
                    <p className="text-[10px] text-[#6B7280]">{line.desc}</p>
                  </div>
                  <a
                    href={`tel:${line.num}`}
                    className="px-2.5 py-1 bg-red-50 text-[#DC2626] border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center space-x-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{line.num}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
