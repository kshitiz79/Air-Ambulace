import React from 'react'

import { useParams } from 'react-router-dom';

const TrackerPage = () => {
  const { enquiryId } = useParams();

  // Mock tracking data
  const trackingData = {
    status: 'IN_TRANSIT',
    location: 'En route to AIIMS Bhopal',
    eta: '2025-06-01 14:30',
    lastUpdated: '2025-06-01 12:00',
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Track Case - {enquiryId}</h2>
      <div className="space-y-2">
        <p><strong>Status:</strong> {trackingData.status}</p>
        <p><strong>Current Location:</strong> {trackingData.location}</p>
        <p><strong>ETA:</strong> {trackingData.eta}</p>
        <p><strong>Last Updated:</strong> {trackingData.lastUpdated}</p>
      </div>
      <div className="mt-6">
        <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
          <p className="text-gray-600">Map Placeholder (Simulated)</p>
        </div>
      </div>
    </div>
  );
};

export default TrackerPage;