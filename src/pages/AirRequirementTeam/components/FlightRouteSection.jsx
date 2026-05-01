import React from 'react';
import { FiPlus } from 'react-icons/fi';
import DistrictSelector from './DistrictSelector';

const FlightRouteSection = ({ 
  routeStops, 
  setRouteStops, 
  updateTarget, 
  updateForm, 
  enquiries 
}) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">🚁 Flight Route Planning</p>
          <p className="text-[9px] text-indigo-600 font-medium mt-0.5">Base → Hospital (Pickup) → Hospital (Dropoff) - Standard workflow</p>
        </div>
        <div className="flex gap-2">
          <button type="button"
            onClick={() => setRouteStops(s => [...s, { 
              stop_label: String.fromCharCode(65 + s.length), 
              district: '', 
              city: '',
              arrival_time: '', 
              departure_time: '',
              stop_type: 'INTERMEDIATE',
              purpose: 'Fuel/Rest'
            }])}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-md">
            <FiPlus size={11} /> Add Stop
          </button>
          <button type="button"
            onClick={() => {
              // Auto-populate complete workflow with smart timing
              const enquiry = enquiries.find(e => e.enquiry_id === updateTarget.enquiry_id);
              if (enquiry) {
                const now = new Date();
                const departureTime = new Date(updateForm.departure_time || now);
                
                // Calculate estimated times (assuming 1 hour flight + 30 min ground time)
                const pickupArrival = new Date(departureTime.getTime() + 60 * 60 * 1000); // +1 hour
                const pickupDeparture = new Date(pickupArrival.getTime() + 30 * 60 * 1000); // +30 min
                const dropoffArrival = new Date(pickupDeparture.getTime() + 60 * 60 * 1000); // +1 hour
                
                setRouteStops([
                  {
                    stop_label: 'A',
                    district: enquiry.sourceHospital?.district || enquiry.district?.district_name || '',
                    city: enquiry.sourceHospital?.city || enquiry.sourceHospital?.name || '',
                    arrival_time: pickupArrival.toISOString().slice(0, 16),
                    departure_time: pickupDeparture.toISOString().slice(0, 16),
                    stop_type: 'PICKUP',
                    purpose: 'Patient Pickup'
                  },
                  {
                    stop_label: 'B',
                    district: enquiry.hospital?.district || enquiry.district?.district_name || '',
                    city: enquiry.hospital?.city || enquiry.hospital?.name || '',
                    arrival_time: dropoffArrival.toISOString().slice(0, 16),
                    departure_time: '',
                    stop_type: 'DROPOFF',
                    purpose: 'Patient Dropoff'
                  }
                ]);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all">
            🎯 Smart Route
          </button>
          <button type="button"
            onClick={() => {
              // Quick Complete - set status to completed with current time
              const now = new Date();
              now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
              
              // Add dropoff if not exists
              const hasDropoff = routeStops.some(s => s.stop_type === 'DROPOFF');
              if (!hasDropoff) {
                const enquiry = enquiries.find(e => e.enquiry_id === updateTarget.enquiry_id);
                if (enquiry) {
                  setRouteStops(s => [...s, {
                    stop_label: String.fromCharCode(65 + s.length),
                    district: enquiry.hospital?.district || enquiry.district?.district_name || '',
                    city: enquiry.hospital?.city || enquiry.hospital?.name || '',
                    arrival_time: now.toISOString().slice(0, 16),
                    departure_time: '',
                    stop_type: 'DROPOFF',
                    purpose: 'Patient Dropoff'
                  }]);
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-purple-700 transition-all">
            ⚡ Quick Complete
          </button>
        </div>
      </div>

      {routeStops.length === 0 ? (
        <div className="text-center py-6 text-indigo-400 text-xs font-medium bg-white/50 rounded-xl border border-indigo-100">
          <div className="text-2xl mb-2">🚁</div>
          <p>No flight route defined yet</p>
          <p className="text-[10px] mt-1">Click "Smart Route" for standard Base → Hospital → Destination</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Base Location (Origin) */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-md">🏠</div>
            <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Base Location (Helicopter Station)</p>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[8px] font-bold">ORIGIN</span>
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">
                {updateTarget?.ambulance?.base_location || 'Air Ambulance Base'}
              </p>
              <div className="grid grid-cols-2 gap-3 text-[10px] text-gray-600">
                <div>
                  <span className="font-bold">Departure:</span> {updateForm.departure_time ? new Date(updateForm.departure_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                </div>
                <div>
                  <span className="font-bold">Aircraft:</span> {updateTarget?.ambulance?.aircraft_type || 'Helicopter'}
                </div>
              </div>
            </div>
          </div>

          {/* Flight Steps */}
          {routeStops.map((stop, idx) => (
            <div key={idx} className="flex items-start gap-3">
              {/* Connector line */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-px h-4 bg-indigo-300" />
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-[11px] font-black shadow-md ${
                  stop.stop_type === 'PICKUP' ? 'bg-orange-500' : 
                  stop.stop_type === 'DROPOFF' ? 'bg-green-500' : 'bg-indigo-500'
                }`}>
                  {stop.stop_type === 'PICKUP' ? '🏥' : stop.stop_type === 'DROPOFF' ? '🎯' : stop.stop_label}
                </div>
              </div>
              <div className="flex-1 bg-white rounded-2xl p-4 border border-indigo-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Step {idx + 1}</p>
                    <select 
                      value={stop.stop_type} 
                      onChange={e => setRouteStops(s => s.map((st, i) => i === idx ? { ...st, stop_type: e.target.value } : st))}
                      className="text-[8px] font-bold px-2 py-1 border border-indigo-200 rounded-lg bg-indigo-50 text-indigo-700">
                      <option value="PICKUP">🏥 PICKUP</option>
                      <option value="DROPOFF">🎯 DROPOFF</option>
                      <option value="INTERMEDIATE">⛽ STOP</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => setRouteStops(s => s.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 text-sm font-black">✕</button>
                </div>
                
                {/* Location Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">District</p>
                    <DistrictSelector 
                      value={stop.district}
                      onChange={value => setRouteStops(s => s.map((st, i) => i === idx ? { ...st, district: value } : st))}
                    />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">City/Location</p>
                    <input type="text" placeholder="City or specific location"
                      value={stop.city}
                      onChange={e => setRouteStops(s => s.map((st, i) => i === idx ? { ...st, city: e.target.value } : st))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-xs font-medium focus:border-indigo-400 focus:outline-none" />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Purpose</p>
                  <select 
                    value={stop.purpose}
                    onChange={e => setRouteStops(s => s.map((st, i) => i === idx ? { ...st, purpose: e.target.value } : st))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-xs font-medium focus:border-indigo-400 focus:outline-none bg-white">
                    {stop.stop_type === 'PICKUP' ? (
                      <>
                        <option value="Patient Pickup">Patient Pickup</option>
                        <option value="Medical Team Pickup">Medical Team Pickup</option>
                        <option value="Equipment Pickup">Equipment Pickup</option>
                      </>
                    ) : stop.stop_type === 'DROPOFF' ? (
                      <>
                        <option value="Patient Dropoff">Patient Dropoff</option>
                        <option value="Medical Team Dropoff">Medical Team Dropoff</option>
                        <option value="Equipment Dropoff">Equipment Dropoff</option>
                      </>
                    ) : (
                      <>
                        <option value="Fuel Stop">Fuel Stop</option>
                        <option value="Rest Stop">Rest Stop</option>
                        <option value="Weather Hold">Weather Hold</option>
                        <option value="Medical Emergency">Medical Emergency</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Timing - Smart based on stop type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">🛬 Arrival Time</p>
                    <input type="datetime-local" value={stop.arrival_time}
                      onChange={e => setRouteStops(s => s.map((st, i) => i === idx ? { ...st, arrival_time: e.target.value } : st))}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-[10px] font-medium focus:border-indigo-400 focus:outline-none" />
                  </div>
                  {/* Only show departure time for PICKUP and INTERMEDIATE stops */}
                  {stop.stop_type !== 'DROPOFF' && (
                    <div>
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">🛫 Departure Time</p>
                      <input type="datetime-local" value={stop.departure_time}
                        onChange={e => setRouteStops(s => s.map((st, i) => i === idx ? { ...st, departure_time: e.target.value } : st))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-[10px] font-medium focus:border-indigo-400 focus:outline-none" />
                    </div>
                  )}
                  {/* For DROPOFF, show a note instead */}
                  {stop.stop_type === 'DROPOFF' && (
                    <div className="flex items-center justify-center bg-green-50 rounded-xl border border-green-200 px-3 py-2">
                      <div className="text-center">
                        <p className="text-[8px] font-black text-green-700 uppercase tracking-widest">Patient Dropoff</p>
                        <p className="text-[9px] text-green-600 font-medium">No departure time needed</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Duration Calculation - only for stops with both times */}
                {stop.arrival_time && stop.departure_time && stop.stop_type !== 'DROPOFF' && (
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Ground Time</p>
                    <p className="text-xs font-bold text-gray-700">
                      {Math.round((new Date(stop.departure_time) - new Date(stop.arrival_time)) / (1000 * 60))} minutes
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Final Destination */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-px h-4 bg-indigo-300" />
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-[11px] font-black shadow-md">🏁</div>
            </div>
            <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-black text-green-700 uppercase tracking-widest">Final Destination</p>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[8px] font-bold">DESTINATION</span>
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">
                {updateTarget && enquiries.find(e => e.enquiry_id === updateTarget.enquiry_id)?.hospital?.name || 'Destination Hospital'}
              </p>
              <p className="text-[10px] text-gray-600">
                District: {updateTarget && enquiries.find(e => e.enquiry_id === updateTarget.enquiry_id)?.district?.district_name || '—'}
              </p>
            </div>
          </div>

          {/* Flight Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-2">Flight Summary</p>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-lg font-black text-blue-600">{routeStops.length + 2}</p>
                <p className="text-[8px] font-bold text-gray-600 uppercase">Total Stops</p>
              </div>
              <div>
                <p className="text-lg font-black text-green-600">
                  {routeStops.filter(s => s.stop_type === 'PICKUP').length}
                </p>
                <p className="text-[8px] font-bold text-gray-600 uppercase">Pickups</p>
              </div>
              <div>
                <p className="text-lg font-black text-purple-600">
                  {routeStops.filter(s => s.stop_type === 'DROPOFF').length}
                </p>
                <p className="text-[8px] font-bold text-gray-600 uppercase">Dropoffs</p>
              </div>
              <div>
                <p className="text-lg font-black text-orange-600">
                  {routeStops.filter(s => s.stop_type === 'INTERMEDIATE').length}
                </p>
                <p className="text-[8px] font-bold text-gray-600 uppercase">Fuel Stops</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-[8px] text-blue-600 font-medium">
                  💡 Dropoff locations only need arrival time - helicopter leaves immediately
                </p>
                {/* Sync Status Indicator */}
                {(() => {
                  const hasDropoff = routeStops.some(s => s.stop_type === 'DROPOFF');
                  const isCompleted = updateForm?.status === 'COMPLETED';
                  const hasArrivalTime = updateForm?.arrival_time;
                  const isFullySynced = hasDropoff && isCompleted && hasArrivalTime;
                  
                  return (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-bold ${
                      isFullySynced 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {isFullySynced ? '✅ Synced' : '⚠️ Needs Sync'}
                    </div>
                  );
                })()}
              </div>
              
              {/* Sync Checklist */}
              <div className="mt-2 space-y-1">
                {[
                  { check: routeStops.some(s => s.stop_type === 'DROPOFF'), label: 'Dropoff stop added' },
                  { check: updateForm?.status === 'COMPLETED', label: 'Status set to completed' },
                  { check: updateForm?.arrival_time, label: 'Arrival time recorded' }
                ].map(({ check, label }, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className={`text-[10px] ${check ? 'text-green-600' : 'text-gray-400'}`}>
                      {check ? '✅' : '⭕'}
                    </span>
                    <span className={`text-[8px] font-medium ${check ? 'text-green-700' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightRouteSection;