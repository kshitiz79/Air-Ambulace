import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import baseUrl from '../../baseUrl/baseUrl';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EnquiryStatusPage = () => {
  const [enquiryId, setEnquiryId] = useState('');
  const [status, setStatus] = useState(null);
  const [allEnquiries, setAllEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch all enquiries on component mount
  useEffect(() => {
    const fetchAllEnquiries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/enquiries`, {
          method: 'GET',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch enquiries');
        }
        setAllEnquiries(data.data || []);
        setFilteredEnquiries(data.data || []);
        setError('');
      } catch (err) {
        setError('Failed to load enquiries: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEnquiries();
  }, []);

  // Handle status filter change
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredEnquiries(allEnquiries);
    } else {
      setFilteredEnquiries(
        allEnquiries.filter((enquiry) => enquiry.status === statusFilter)
      );
    }
  }, [statusFilter, allEnquiries]);

  // Download document
  const handleDownload = (filePath, fileName) => {
    const link = document.createElement('a');
    link.href = `${baseUrl}${filePath}`; // Adjust based on your API's file serving
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Approve or reject enquiry
  const handleApproveOrReject = async (id, action) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/enquiries/${id}/approve-reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update enquiry');
      }
      setAllEnquiries((prev) =>
        prev.map((enquiry) =>
          enquiry.enquiry_id === id ? { ...enquiry, status: data.data.status } : enquiry
        )
      );
      setError('');
    } catch (err) {
      setError(`Failed to ${action.toLowerCase()} enquiry: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forward enquiry to DM
  const handleForward = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/enquiries/${id}/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to forward enquiry');
      }
      setAllEnquiries((prev) =>
        prev.map((enquiry) =>
          enquiry.enquiry_id === id ? { ...enquiry, status: data.data.status } : enquiry
        )
      );
      setError('');
    } catch (err) {
      setError('Failed to forward enquiry: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chart data for status distribution
  const statusCounts = allEnquiries.reduce((acc, enquiry) => {
    acc[enquiry.status] = (acc[enquiry.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Enquiry Status Distribution',
        data: Object.values(statusCounts),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Enquiry Status Distribution' },
    },
  };

  // Status options for filter
  const statusOptions = [
    'ALL',
    'PENDING',
    'FORWARDED',
    'APPROVED',
    'REJECTED',
    'ESCALATED',
    'IN_PROGRESS',
    'COMPLETED',
  ];

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      {/* Error and Loading States */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
          Loading enquiries...
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6">
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
          Filter by Status
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="mt-1 block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Status Chart */}
 
      {/* All Enquiries List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Enquiries</h3>
        {!loading && filteredEnquiries.length === 0 && (
          <p className="text-gray-600">No enquiries found.</p>
        )}
        {!loading && filteredEnquiries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-sm font-medium">Enquiry ID</th>
                  <th className="p-3 text-left text-sm font-medium">Patient Name</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                  <th className="p-3 text-left text-sm font-medium">Hospital</th>
                  <th className="p-3 text-left text-sm font-medium">Location</th>
                  <th className="p-3 text-left text-sm font-medium">Documents</th>
         
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry.enquiry_id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{enquiry.enquiry_id}</td>
                    <td className="p-3">{enquiry.patient_name}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          enquiry.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : enquiry.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : enquiry.status === 'FORWARDED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {enquiry.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3">
                      {enquiry.hospital && enquiry.hospital.name
                        ? enquiry.hospital.name
                        : enquiry.hospital_id
                        ? `Hospital ID: ${enquiry.hospital_id}`
                        : 'N/A'}
                    </td>
                    <td className="p-3">{enquiry.district?.district_name || 'N/A'}</td>
                    <td className="p-3">
                      {enquiry.documents && enquiry.documents.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {enquiry.documents.map((doc) => (
                            <button
                              key={doc.document_id}
                              onClick={() =>
                                handleDownload(doc.file_path, doc.document_type)
                              }
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {doc.document_type}
                            </button>
                          ))}
                        </div>
                      ) : (
                        'No documents'
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

export default EnquiryStatusPage;