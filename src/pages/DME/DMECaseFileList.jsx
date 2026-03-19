import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiClipboard, FiHome, FiArrowRightCircle } from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800', APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800', FORWARDED: 'bg-purple-100 text-purple-800',
  ESCALATED: 'bg-blue-100 text-blue-800', COMPLETED: 'bg-teal-100 text-teal-800',
};

const DMECaseFileList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t, localize } = useLanguage();

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/api/enquiries`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setEnquiries(data.data || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{t.caseFiles || 'Case Files'}</h1>
        {loading && <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>}
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">⚠️ {error}</div>}
        {!loading && enquiries.length === 0 && <div className="text-gray-500 text-center p-6 bg-white rounded-lg shadow"><p>{t.noCaseFilesFound || 'No case files found.'}</p></div>}
        <div className="grid gap-6">
          {enquiries.map(enquiry => {
            const e = localize(enquiry);
            return enquiry.enquiry_id ? (
              <div key={enquiry.enquiry_id} className="border rounded-2xl shadow-sm hover:shadow-md transition p-6 bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-6 h-6 text-teal-600" />
                    <h2 className="text-xl font-semibold text-gray-800">{e.patient_name || t.unknown}</h2>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[enquiry.status] || 'bg-gray-100 text-gray-800'}`}>
                    {enquiry.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p className="flex items-center"><FiClipboard className="mr-2" /> {t.condition || 'Condition'}: {e.medical_condition || 'N/A'}</p>
                  <p className="flex items-center"><FiHome className="mr-2" /> {t.hospital || 'Hospital'}: {enquiry.hospital?.name || 'N/A'}</p>
                </div>
                <Link to={`/dme-dashboard/case-file/${enquiry.enquiry_id}`} className="mt-4 inline-flex items-center text-teal-600 hover:underline">
                  {t.viewDetails || 'View Details'} <FiArrowRightCircle className="ml-1 w-5 h-5" />
                </Link>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default DMECaseFileList;
