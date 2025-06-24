
import React, { useState, useEffect } from 'react';

const EnquiryStatusPage = () => {
  const [enquiryId, setEnquiryId] = useState('');
  const [status, setStatus] = useState(null);
  const [allEnquiries, setAllEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all enquiries on component mount
  useEffect(() => {
    const fetchAllEnquiries = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.ambulance.jetserveaviation.com/api/enquiries', {
          method: 'GET',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch enquiries');
        }
        console.log('Fetched enquiries:', data.data); // Debug: Log the response
        setAllEnquiries(data.data || []);
        setError('');
      } catch (err) {
        setError('Failed to load enquiries: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEnquiries();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      {/* All Enquiries List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">All Enquiries</h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-gray-600">Loading enquiries...</p>}
        {!loading && allEnquiries.length === 0 && (
          <p className="text-gray-600">No enquiries found.</p>
        )}
        {!loading && allEnquiries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-sm font-medium">Enquiry ID</th>
                  <th className="p-3 text-left text-sm font-medium">Patient Name</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                  <th className="p-3 text-left text-sm font-medium">Hospital</th>
                  <th className="p-3 text-left text-sm font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {allEnquiries.map((enquiry) => (
                  <tr key={enquiry.enquiry_id} className="border-t">
                    <td className="p-3">{enquiry.enquiry_id}</td>
                    <td className="p-3">{enquiry.patient_name}</td>
                    <td className="p-3">{enquiry.status || 'PENDING'}</td>
                    <td className="p-3">
                      {enquiry.hospital && enquiry.hospital.name
                        ? enquiry.hospital.name
                        : enquiry.hospital_id
                        ? `Hospital ID: ${enquiry.hospital_id}`
                        : 'N/A'}
                    </td>
                    <td className="p-3">{enquiry.district?.district_name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryStatusPage;