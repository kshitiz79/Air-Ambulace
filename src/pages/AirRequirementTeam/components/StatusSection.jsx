import React from 'react';

const StatusSection = ({ 
  updateForm, 
  setUpdateForm, 
  routeStops, 
  setRouteStops, 
  updateTarget, 
  enquiries 
}) => {
  return (
    <div>
      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Assignment Status</label>
      <select value={updateForm.status} onChange={e => {
        const newStatus = e.target.value;
        setUpdateForm(f => ({ ...f, status: newStatus }));
        
        // Auto-sync logic based on status
        if (newStatus === 'COMPLETED') {
          // Auto-set arrival time to now if not set
          if (!updateForm.arrival_time) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for timezone
            setUpdateForm(f => ({ ...f, arrival_time: now.toISOString().slice(0, 16) }));
          }
          
          // Auto-add final dropoff stop if not exists
          const hasDropoff = routeStops.some(s => s.stop_type === 'DROPOFF');
          if (!hasDropoff) {
            const enquiry = enquiries.find(e => e.enquiry_id === updateTarget.enquiry_id);
            if (enquiry) {
              setRouteStops(s => [...s, {
                stop_label: String.fromCharCode(65 + s.length),
                district: enquiry.hospital?.district || enquiry.district?.district_name || '',
                city: enquiry.hospital?.city || enquiry.hospital?.name || '',
                arrival_time: updateForm.arrival_time || new Date().toISOString().slice(0, 16),
                departure_time: '',
                stop_type: 'DROPOFF',
                purpose: 'Patient Dropoff'
              }]);
            }
          }
        }
      }}
        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-indigo-500 focus:outline-none bg-white transition-all">
        <option value="ASSIGNED">✋ Assigned</option>
        <option value="IN_PROGRESS">✈️ In Progress</option>
        <option value="COMPLETED">✅ Completed</option>
      </select>
      
      {/* Status Helper Text */}
      <div className="mt-2 text-[9px] font-medium">
        {updateForm.status === 'ASSIGNED' && (
          <p className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
            🚁 Flight scheduled - helicopter ready for departure
          </p>
        )}
        {updateForm.status === 'IN_PROGRESS' && (
          <p className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
            ✈️ Flight active - helicopter en route or at pickup location
          </p>
        )}
        {updateForm.status === 'COMPLETED' && (
          <p className="text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            ✅ Mission complete - patient delivered, helicopter returning to base
          </p>
        )}
      </div>
    </div>
  );
};

export default StatusSection;