import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FiUser,
  FiFileText,
  FiHome,
  FiPhone,
  FiMail,
  FiClipboard,
  FiCheckCircle,
  FiArrowRightCircle,
} from 'react-icons/fi';

// Define badge styles for different statuses
const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  FORWARDED: 'bg-purple-100 text-purple-800',
  ESCALATED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-teal-100 text-teal-800',
};

export const EnquiryListPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:4000/api/enquiries');
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Error fetching');
        setEnquiries(payload.data || []);
      } catch (err) {
        setError('Could not load enquiries: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Enquiry Cases</h1>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded">⚠️ {error}</div>}
      {loading && <div className="text-gray-500">Loading enquiries...</div>}
      {!loading && enquiries.length === 0 && <div className="text-gray-500">No enquiries found.</div>}

      <div className="grid gap-6 sm:grid-cols-1">
        {enquiries.map((e) => (
          <div
            key={e.enquiry_id}
            className="border rounded-lg shadow-sm hover:shadow-lg transition p-5 bg-white"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <FiUser className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">{e.patient_name}</h2>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[e.status] || ''}`}
              >
                {e.status}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-gray-700">
              <p className="flex items-center">
                <FiClipboard className="mr-2" /> Condition: {e.medical_condition}
              </p>
              <p className="flex items-center">
                <FiHome className="mr-2" /> Hospital: {e.hospital?.name || 'N/A'}
              </p>
            </div>

            <Link
              to={`/sdm-dashboard/enquiry-detail-page/${e.enquiry_id}`}
              className="mt-4 inline-flex items-center text-blue-600 hover:underline"
            >
              View Details <FiArrowRightCircle className="ml-1 w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnquiryListPage;