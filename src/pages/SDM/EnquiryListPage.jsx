import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EnquiryListPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/enquiries');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch enquiries');
        }
        setEnquiries(data.data || []);
        setError('');
      } catch (err) {
        setError('Failed to load enquiries: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Enquiry Cases</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && enquiries.length === 0 && <p className="text-gray-600">No enquiries found.</p>}
      <div className="grid gap-4">
        {enquiries.map((enquiry) => (
          <div key={enquiry.enquiry_id} className="p-4 border rounded shadow bg-white">
            <h3 className="text-lg font-semibold">{enquiry.patient_name}</h3>
            <p><strong>Medical Condition:</strong> {enquiry.medical_condition}</p>
            <p><strong>Hospital:</strong> {enquiry.hospital?.name || 'N/A'}</p>
            <Link
              to={`/sdm-dashboard/enquiry-detail-page/${enquiry.enquiry_id}`}
              className="mt-2 inline-block text-blue-600 underline"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnquiryListPage;