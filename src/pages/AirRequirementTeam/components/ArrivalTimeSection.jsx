import React from 'react';
import { FiClock } from 'react-icons/fi';

const ArrivalTimeSection = ({ 
  updateForm, 
  setUpdateForm, 
  routeStops, 
  setRouteStops 
}) => {
  if (updateForm.status !== 'COMPLETED') return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-4">
      {/* Arrival time */}
      <div>
        <label className="block text-[9px] font-black text-green-700 uppercase tracking-widest mb-2">
          <FiClock className="inline mr-1" size={10} /> Final Arrival Time <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input type="datetime-local" value={updateForm.arrival_time} required
            onChange={e => {
              setUpdateForm(f => ({ ...f, arrival_time: e.target.value }));
              // Auto-sync dropoff arrival time
              setRouteStops(s => s.map(stop => 
                stop.stop_type === 'DROPOFF' 
                  ? { ...stop, arrival_time: e.target.value }
                  : stop
              ));
            }}
            className="flex-1 px-4 py-3 border-2 border-green-200 rounded-xl text-sm font-medium focus:border-green-500 focus:outline-none transition-all bg-white" />
          <button type="button"
            onClick={() => {
              const now = new Date();
              now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
              const nowString = now.toISOString().slice(0, 16);
              setUpdateForm(f => ({ ...f, arrival_time: nowString }));
              // Auto-sync dropoff arrival time
              setRouteStops(s => s.map(stop => 
                stop.stop_type === 'DROPOFF' 
                  ? { ...stop, arrival_time: nowString }
                  : stop
              ));
            }}
            className="px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-xs font-bold">
            Now
          </button>
        </div>
        <p className="text-[9px] text-green-600 mt-1 font-medium">
          ✅ Mission completion time - ambulance will be released and marked as returning to base
        </p>
      </div>
    </div>
  );
};

export default ArrivalTimeSection;