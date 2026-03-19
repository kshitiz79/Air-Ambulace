import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiClipboard, FiHome, FiArrowRightCircle } from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';

// Define badge styles for different statuses
const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-500/20',
  APPROVED: 'bg-green-100 text-green-800 ring-green-500/20',
  REJECTED: 'bg-red-100 text-red-800 ring-red-500/20',
  FORWARDED: 'bg-purple-100 text-purple-800 ring-purple-500/20',
  ESCALATED: 'bg-blue-100 text-blue-800 ring-blue-500/20',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 ring-indigo-500/20',
  COMPLETED: 'bg-teal-100 text-teal-800 ring-teal-500/20',
};

const CaseFileListPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/enquiries`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || t.errorLoadingEnquiries);
        }
        setEnquiries(data.data || []);
        setError('');
      } catch (err) {
        setError(t.errorLoadingEnquiries + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, [t]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t.caseFiles}</h1>

        {loading && (
          <div className="flex items-center justify-center" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label={t.loadingEnquiries}></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md" role="alert">
            ⚠️ {error}
          </div>
        )}

        {!loading && enquiries.length === 0 && (
          <div className="text-gray-500 text-center p-6 bg-white rounded-lg shadow">
            <p>{t.noCaseFilesFound}.</p>
          </div>
        )}

        <div className="grid gap-6 ">
          {enquiries.map((enquiry) => (
            enquiry.enquiry_id ? (
              <div
                key={enquiry.enquiry_id}
                className="border rounded-2xl shadow-sm hover:shadow-sm transition p-6 bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">{enquiry.patient_name || t.unknown}</h2>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ring-1 ring-inset ${
                      statusStyles[enquiry.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {t[enquiry.status?.toLowerCase()] || enquiry.status || t.unknown}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-gray-700">
                  <p className="flex items-center">
                    <FiClipboard className="mr-2 w-5 h-5" /> {t.condition}: {enquiry.medical_condition || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <FiHome className="mr-2 w-5 h-5" /> {t.hospital}: {enquiry.hospital?.name || 'N/A'}
                  </p>
                </div>

                <Link
                  to={`/collector-dashboard/case-file/${enquiry.enquiry_id}`}
                  className="mt-4 inline-flex items-center text-blue-600 hover:underline"
                  aria-label={`${t.viewDetails} ${enquiry.enquiry_id}`}
                >
                  {t.viewDetails} <FiArrowRightCircle className="ml-1 w-5 h-5" />
                </Link>
              </div>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseFileListPage;