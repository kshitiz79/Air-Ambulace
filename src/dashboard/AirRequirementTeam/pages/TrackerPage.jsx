import React, { useState, useEffect } from 'react';
import { FiMapPin, FiClock, FiTruck, FiNavigation, FiRefreshCw } from 'react-icons/fi';

const TrackerPage = () => {
  const [activeFlights, setActiveFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveFlights();
    // Set up real-time updates
    const interval = setInterval(fetchActiveFlights, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveFlights = async () => {
    try {
      setLoading(true);
      // Simulate API call for active flights
      const mockData = [
        {
          assignment_id: 1,
          enquiry_id: 12345,
          ambulance_id: 'AA-001',
          patient_name: 'John Doe',
          pickup_location: 'Delhi AIIMS',
          drop_location: 'Mumbai Hospital',
          departure_time: '2024-01-15 10:30:00',
          estimated_arrival: '2024-01-15 12:45:00',
          current_location: { lat: 28.6139, lng: 77.2090 },
          status: 'IN_PROGRESS',
          crew_details: 'Pilot: John Smith, Medic: Jane Doe',
          progress: 65,
          distance_covered: '650 km',
          distance_remaining: '350 km',
          speed: '450 km/h',
          altitude: '35,000 ft'
        },
        {
          assignment_id: 2,
          enquiry_id: 12346,
          ambulance_id: 'AA-002',
          patient_name: 'Sarah Wilson',
          pickup_location: 'Bangalore General Hospital',
          drop_location: 'Chennai Apollo',
          departure_time: '2024-01-15 14:00:00',
          estimated_arrival: '2024-01-15 15:30:00',
          current_location: { lat: 12.9716, lng: 77.5946 },
          status: 'IN_PROGRESS',
          crew_details: 'Pilot: Mike Johnson, Medic: Lisa Brown',
          progress: 30,
          distance_covered: '120 km',
          distance_remaining: '280 km',
          speed: '420 km/h',
          altitude: '32,000 ft'
        }
      ];
      setActiveFlights(mockData);
      if (!selectedFlight && mockData.length > 0) {
        setSelectedFlight(mockData[0]);
      }
    } catch (error) {
      console.error('Error fetching active flights:', error);
    } finally {
      setLoading(false);
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
          onClick={fetchActiveFlights}
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
              <p className="text-2xl font-bold text-gray-900">435 km/h</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiNavigation className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Distance</p>
              <p className="text-2xl font-bold text-gray-900">1,250 km</p>
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
          <div className="divide-y">
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
                      <h4 className="font-medium text-gray-900">{flight.ambulance_id}</h4>
                      <p className="text-sm text-gray-600">Case #{flight.enquiry_id}</p>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(flight.status)}`}>
                      {flight.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Patient: {flight.patient_name}</p>
                    <p>From: {flight.pickup_location}</p>
                    <p>To: {flight.drop_location}</p>
                    <p>ETA: {calculateETA(flight.departure_time, flight.estimated_arrival)}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{flight.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Flight Map</h3>
                </div>
                <div className="p-6">
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <FiMapPin size={48} className="mx-auto mb-2" />
                      <p>Interactive Map</p>
                      <p className="text-sm">Showing route from {selectedFlight.pickup_location} to {selectedFlight.drop_location}</p>
                      <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-sm font-medium text-gray-900">Current Position</p>
                        <p className="text-xs text-gray-600">
                          Lat: {selectedFlight.current_location.lat}, Lng: {selectedFlight.current_location.lng}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Information */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Flight Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Flight Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ambulance ID:</span>
                            <span className="font-medium">{selectedFlight.ambulance_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Case ID:</span>
                            <span className="font-medium">#{selectedFlight.enquiry_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Patient:</span>
                            <span className="font-medium">{selectedFlight.patient_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Crew:</span>
                            <span className="font-medium text-right">{selectedFlight.crew_details}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Route Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">From:</span>
                            <span className="font-medium text-right">{selectedFlight.pickup_location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">To:</span>
                            <span className="font-medium text-right">{selectedFlight.drop_location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Departure:</span>
                            <span className="font-medium">{formatTime(selectedFlight.departure_time)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ETA:</span>
                            <span className="font-medium">{formatTime(selectedFlight.estimated_arrival)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Flight Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Speed:</span>
                            <span className="font-medium">{selectedFlight.speed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Altitude:</span>
                            <span className="font-medium">{selectedFlight.altitude}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Distance Covered:</span>
                            <span className="font-medium">{selectedFlight.distance_covered}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Distance Remaining:</span>
                            <span className="font-medium">{selectedFlight.distance_remaining}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completion</span>
                            <span className="font-medium">{selectedFlight.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${selectedFlight.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            ETA: {calculateETA(selectedFlight.departure_time, selectedFlight.estimated_arrival)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FiMapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Flight</h3>
              <p className="text-gray-600">Choose a flight from the list to view detailed tracking information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackerPage;