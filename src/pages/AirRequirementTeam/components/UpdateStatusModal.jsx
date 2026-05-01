import React from 'react';
import { FiAlertTriangle, FiClock } from 'react-icons/fi';
import FlightRouteSection from './FlightRouteSection';
import StatusSection from './StatusSection';
import ArrivalTimeSection from './ArrivalTimeSection';
import DocumentUploadSection from './DocumentUploadSection';

const UpdateStatusModal = ({
  showUpdate,
  updateTarget,
  updateForm,
  setUpdateForm,
  routeStops,
  setRouteStops,
  medicalSummaryFile,
  setMedicalSummaryFile,
  manifestFile,
  setManifestFile,
  enquiries,
  error,
  handleUpdateSubmit,
  setShowUpdate,
  saving
}) => {
  if (!showUpdate || !updateTarget) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 px-6 py-5 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">✈️</div>
            <div>
              <h3 className="text-white font-black text-base uppercase tracking-tight">Update Flight Status</h3>
              <p className="text-indigo-200 text-xs mt-0.5">Assignment #{updateTarget.assignment_id} · {updateTarget.ambulance_id}</p>
            </div>
          </div>
          <button onClick={() => setShowUpdate(false)} className="text-white/70 hover:text-white text-xl font-black">x</button>
        </div>

        <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              <FiAlertTriangle className="shrink-0" /> {error}
            </div>
          )}

          {/* Departure time */}
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
              <FiClock className="inline mr-1" size={10} /> Departure Time from Base Location <span className="text-red-500">*</span>
            </label>
            
            {/* Base Location Info */}
            {updateTarget?.ambulance && (
              <div className="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🏠</span>
                  <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Base Location</p>
                </div>
                <p className="text-sm font-bold text-gray-800">{updateTarget.ambulance.base_location || 'Air Ambulance Base'}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">
                  Aircraft: {updateTarget.ambulance.aircraft_type || 'Helicopter'} • Reg: {updateTarget.ambulance.registration_number || 'N/A'}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <input type="datetime-local" value={updateForm.departure_time} required
                onChange={e => setUpdateForm(f => ({ ...f, departure_time: e.target.value }))}
                className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-indigo-500 focus:outline-none transition-all" />
              <button type="button"
                onClick={() => {
                  const now = new Date();
                  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                  setUpdateForm(f => ({ ...f, departure_time: now.toISOString().slice(0, 16) }));
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-xs font-bold">
                Now
              </button>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-[9px] text-indigo-600 font-medium flex items-center gap-1">
                <span>🚁</span> Helicopter departs from base location to begin mission
              </p>
              <p className="text-[9px] text-indigo-600 font-medium flex items-center gap-1">
                <span>⏰</span> Setting time schedules ambulance as RETURNING after completion
              </p>
              <p className="text-[9px] text-gray-500 font-medium flex items-center gap-1">
                <span>📍</span> Route: Base → Pickup → Dropoff → Return to Base
              </p>
            </div>
          </div>

          {/* Flight Route Section */}
          <FlightRouteSection
            routeStops={routeStops}
            setRouteStops={setRouteStops}
            updateTarget={updateTarget}
            updateForm={updateForm}
            enquiries={enquiries}
          />

          {/* Status Section */}
          <StatusSection
            updateForm={updateForm}
            setUpdateForm={setUpdateForm}
            routeStops={routeStops}
            setRouteStops={setRouteStops}
            updateTarget={updateTarget}
            enquiries={enquiries}
          />

          {/* Arrival Time Section */}
          <ArrivalTimeSection
            updateForm={updateForm}
            setUpdateForm={setUpdateForm}
            routeStops={routeStops}
            setRouteStops={setRouteStops}
          />

          {/* Document Upload Section */}
          <DocumentUploadSection
            updateForm={updateForm}
            medicalSummaryFile={medicalSummaryFile}
            setMedicalSummaryFile={setMedicalSummaryFile}
            manifestFile={manifestFile}
            setManifestFile={setManifestFile}
          />

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowUpdate(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;