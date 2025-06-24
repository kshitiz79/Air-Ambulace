import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import baseUrl from '../../baseUrl/baseUrl';

const CaseFileListPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/enquiries`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch case files');
        }
        setEnquiries(data.data || []);
        setError('');
      } catch (err) {
        setError('Failed to load case files: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Case Files</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-gray-600">Loading...</p>}
      {!loading && enquiries.length === 0 && <p className="text-gray-600">No case files found.</p>}
      <div className="grid gap-4">
        {enquiries.map((enquiry) => (
          <div key={enquiry.enquiry_id} className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">{enquiry.patient_name}</h3>
            <p><strong>Condition:</strong> {enquiry.medical_condition}</p>
            <p><strong>Hospital:</strong> {enquiry.hospital?.name || 'N/A'}</p>
            <Link
              to={`/dm-dashboard/case-file/${enquiry.enquiry_id}`}
              className="text-blue-600 underline mt-2 inline-block"
            >
              View Full Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseFileListPage;