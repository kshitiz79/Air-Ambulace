import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';

const AlertsPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch enquiries on component mount
  useEffect(() => {
    const fetchEnquiries = async () => {
      setLoading(true);
      setError('');
      try {
     const response = await axios.get(`${baseUrl}/api/enquiries`);
        setEnquiries(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch enquiries');
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Enquiry Alerts</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-500">Loading enquiries...</p>
        ) : enquiries.length === 0 ? (
          <p className="text-center text-gray-500">No enquiries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 text-sm">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Patient Name</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Hospital</th>
                  <th className="p-3 text-left">Source Hospital</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Medical Condition</th>
                  <th className="p-3 text-left">Contact Name</th>
                  <th className="p-3 text-left">Contact Phone</th>
                  <th className="p-3 text-left">Contact Email</th>
                  <th className="p-3 text-left">Documents</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.enquiry_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{enquiry.enquiry_id}</td>
                    <td className="p-3">{enquiry.patient_name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          enquiry.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : enquiry.status === 'FORWARDED'
                            ? 'bg-blue-100 text-blue-800'
                            : enquiry.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : enquiry.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : enquiry.status === 'ESCALATED'
                            ? 'bg-orange-100 text-orange-800'
                            : enquiry.status === 'IN_PROGRESS'
                            ? 'bg-purple-100 text-purple-800'
                            : enquiry.status === 'COMPLETED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="p-3">{enquiry.hospital?.name || '-'}</td>
                    <td className="p-3">{enquiry.sourceHospital?.name || '-'}</td>
                    <td className="p-3">{enquiry.district?.district_name || '-'}</td>
                    <td className="p-3">{enquiry.medical_condition || '-'}</td>
                    <td className="p-3">{enquiry.contact_name || '-'}</td>
                    <td className="p-3">{enquiry.contact_phone || '-'}</td>
                    <td className="p-3">{enquiry.contact_email || '-'}</td>
                    <td className="p-3">
                      {enquiry.documents?.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {enquiry.documents.map((doc) => (
                            <li key={doc.document_id}>
                              {doc.document_type}: <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        '-'
                      )}
                    </td>
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

export default AlertsPage;