import React, { useState } from 'react';

import { useEnquiryStore } from './../../stores/enquiryStore'; // adjust path as needed

export default function StatusCheck() {
  const [enquiryId, setEnquiryId] = useState('');
  const [status, setStatus] = useState(null);
  const enquiries = useEnquiryStore((state) => state.enquiries);

  const handleCheck = (e) => {
    e.preventDefault();
    const enquiry = enquiries.find((item) => item.enquiryId === enquiryId);
    if (enquiry) {
      setStatus(enquiry);
    } else {
      setStatus({ error: 'Enquiry ID not found' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Check Enquiry Status</h2>
      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Enquiry ID</label>
          <input
            type="text"
            value={enquiryId}
            onChange={(e) => setEnquiryId(e.target.value)}
            placeholder="Enter Enquiry ID"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Check Status
        </button>
      </form>
      {status && (
        <div className="mt-4 p-4 border rounded">
          {status.error ? (
            <p className="text-red-600">{status.error}</p>
          ) : (
            <>
              <p><strong>Patient Name:</strong> {status.patientName}</p>
              <p><strong>Status:</strong> {status.status}</p>
              <p><strong>Hospital:</strong> {status.hospitalName}, {status.hospitalLocation}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
