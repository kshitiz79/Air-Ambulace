
import React, { useState, useEffect } from 'react';
import { FiMapPin, FiClock, FiTruck, FiNavigation, FiRefreshCw } from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';

const TrackerPage = () => {
  const [activeFlights, setActiveFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveFlights();
    // Set up real-time updates
    const interval = setInterval(() => fetchActiveFlights(false), 30000); // Silent refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveFlights = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/flight-assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const assignments = await response.json();
        
        // Filter for active flights (IN_PROGRESS or ASSIGNED)
        const activeOnly = assignments.filter(f => f.status === 'IN_PROGRESS' || f.status === 'ASSIGNED');
        
        // Transform real data to match UI expectations
        const transformedData = activeOnly.map(f => {
          const departure = f.departure_time ? new Date(f.departure_time) : new Date();
          const arrival = f.arrival_time ? new Date(f.arrival_time) : new Date(departure.getTime() + 2 * 60 * 60 * 1000);
          const now = new Date();
          
          // Calculate simulated progress based on time
          let progress = 0;
          if (f.status === 'COMPLETED') progress = 100;
          else if (f.status === 'IN_PROGRESS') {
            const total = (arrival - departure) || 1;
            const elapsed = now - departure;
            progress = Math.min(Math.max(Math.floor((elapsed / total) * 100), 10), 95);
          } else {
            progress = 0;
          }

          return {
            assignment_id: f.assignment_id,
            enquiry_id: f.enquiry_id,
            ambulance_id: f.ambulance_id,
            patient_name: f.enquiry?.patient_name || 'Unknown',
            pickup_location: f.enquiry?.sourceHospital?.name || f.enquiry?.sourceHospital?.hospital_name || 'Base',
            drop_location: f.enquiry?.hospital?.name || f.enquiry?.hospital?.hospital_name || 'Destination',
            departure_time: f.departure_time || departure.toISOString(),
            estimated_arrival: f.arrival_time || arrival.toISOString(),
            current_location: { lat: 23.2599, lng: 77.4126 }, // Static for now
            status: f.status,
            crew_details: f.crewMembers?.map(c => `${c.role}: ${c.full_name}`).join(', ') || f.crew_details || 'Staff Pending',
            progress: progress,
            distance_covered: `${Math.floor(progress * 4.5)} km`,
            distance_remaining: `${Math.floor((100 - progress) * 4.5)} km`,
            speed: f.status === 'IN_PROGRESS' ? '450 km/h' : '0 km/h',
            altitude: f.status === 'IN_PROGRESS' ? '32,000 ft' : '0 ft'
          };
        });

        setActiveFlights(transformedData);
        if (transformedData.length > 0 && !selectedFlight) {
          setSelectedFlight(transformedData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching active flights:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'IN_PROGRESS': 'text-green-600',
      'ASSIGNED': 'text-blue-600',
      'COMPLETED': 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateETA = (departureTime, estimatedArrival) => {
    const now = new Date();
    const arrival = new Date(estimatedArrival);
    const diffMs = arrival - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins <= 0) return 'Arrived';
    if (diffMins < 60) return `${diffMins} mins`;
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flight Tracker</h1>
          <p className="text-gray-600">Real-time tracking of active air ambulance flights</p>
        </div>
        <button
          onClick={() => fetchActiveFlights(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiRefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiTruck className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Active Flights</p>
              <p className="text-2xl font-bold text-gray-900">{activeFlights.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiMapPin className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">En Route</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeFlights.filter(f => f.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiClock className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Avg Speed</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeFlights.length > 0 ? '435 km/h' : '0 km/h'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiNavigation className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Distance</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeFlights.reduce((acc, f) => acc + parseInt(f.distance_covered), 0)} km
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Active Flights</h3>
          </div>
          <div className="divide-y overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading flights...</div>
            ) : activeFlights.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No active flights</div>
            ) : (
              activeFlights.map((flight) => (
                <div
                  key={flight.assignment_id}
                  onClick={() => setSelectedFlight(flight)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedFlight?.assignment_id === flight.assignment_id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 font-mono text-sm">{flight.ambulance_id}</h4>
                      <p className="text-xs text-gray-600">Case #{flight.enquiry_id}</p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${getStatusColor(flight.status)}`}>
                      {flight.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <p className="font-medium text-gray-800">{flight.patient_name}</p>
                    <p className="truncate">From: {flight.pickup_location}</p>
                    <p className="truncate">To: {flight.drop_location}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{flight.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${flight.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Flight Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedFlight ? (
            <>
              {/* Map Placeholder */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Flight Path</h3>
                </div>
                <div className="p-0">
                  <div className="bg-blue-50 h-[350px] relative flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                      backgroundImage: 'radial-gradient(#4a90e2 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                    <div className="z-10 text-center">
                      <FiNavigation size={64} className="text-blue-500 mx-auto mb-4 animate-pulse rotate-45" />
                      <p className="text-blue-800 font-bold text-xl uppercase tracking-widest">En Route</p>
                      <div className="mt-6 flex items-center justify-center space-x-12">
                        <div className="text-center">
                          <p className="text-[10px] text-blue-400 uppercase">Origin</p>
                          <p className="text-sm font-bold text-blue-900">{selectedFlight.pickup_location}</p>
                        </div>
                        <div className="h-px w-24 bg-blue-300 relative">
                          <div className="absolute top-1/2 left-0 h-2 w-2 bg-blue-500 rounded-full -translate-y-1/2"></div>
                          <div className="absolute top-1/2 right-0 h-2 w-2 border-2 border-blue-500 rounded-full -translate-y-1/2"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-blue-400 uppercase">Destination</p>
                          <p className="text-sm font-bold text-blue-900">{selectedFlight.drop_location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Details 1 */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 border-b pb-2">Mission Parameters</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-500">Ambulance</span>
                           <span className="text-sm font-mono font-bold text-blue-600">{selectedFlight.ambulance_id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-500">Patient</span>
                           <span className="text-sm font-bold text-gray-800">{selectedFlight.patient_name}</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                           <span className="text-xs text-gray-500">Departure</span>
                           <span className="text-sm font-bold text-gray-700">{formatTime(selectedFlight.departure_time)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-500">ETA</span>
                           <span className="text-sm font-bold text-green-600">{formatTime(selectedFlight.estimated_arrival)}</span>
                        </div>
                    </div>
                 </div>

                 {/* Details 2 */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 border-b pb-2">Telemetry</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-500">Ground Speed</span>
                           <span className="text-sm font-bold text-gray-800">{selectedFlight.speed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-500">Altitude</span>
                           <span className="text-sm font-bold text-gray-800">{selectedFlight.altitude}</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                           <span className="text-xs text-gray-500">Covered</span>
                           <span className="text-sm font-bold text-gray-700">{selectedFlight.distance_covered}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-gray-500">Remaining</span>
                           <span className="text-sm font-bold text-orange-600">{selectedFlight.distance_remaining}</span>
                        </div>
                    </div>
                 </div>

                 {/* Full width Crew */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">On-Board Crew</h4>
                    <p className="text-sm text-gray-700 italic border-l-4 border-blue-500 pl-3 py-1">
                        {selectedFlight.crew_details}
                    </p>
                 </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center h-[500px] flex flex-col justify-center border-2 border-dashed border-gray-200">
              <FiNavigation size={64} className="mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-bold text-gray-400">COMMAND CENTER</h3>
              <p className="text-gray-400 mt-2">Select an active mission to initiate telemetry monitoring</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackerPage;