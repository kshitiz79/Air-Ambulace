import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPhoneAlt, FaEnvelope, FaHospital, FaUser, FaGlobe, FaSyncAlt } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const labels = {
  en: {
    title: 'Enquiry List',
    patientName: 'Patient Name',
    status: 'Status',
    hospital: 'Destination Hospital',
    sourceHospital: 'Source Hospital',
    district: 'District',
    contactPhone: 'Contact Phone',
    contactEmail: 'Contact Email',
    documents: 'Documents',
    edit: 'Edit',
    delete: 'Delete',
    noEnquiries: 'No enquiries found',
    loading: 'Loading enquiries...',
    error: 'Failed to load enquiries: ',
    deleteSuccess: 'Enquiry deleted successfully!',
    deleteError: 'Failed to delete enquiry: ',
    toggleLang: 'हिन्दी',
  },
  hi: {
    title: 'पूछताछ सूची',
    patientName: 'रोगी का नाम',
    status: 'स्थिति',
    hospital: 'गंतव्य अस्पताल',
    sourceHospital: 'स्रोत अस्पताल',
    district: 'जिला',
    contactPhone: 'संपर्क फोन',
    contactEmail: 'संपर्क ईमेल',
    documents: 'दस्तावेज',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    noEnquiries: 'कोई पूछताछ नहीं मिली',
    loading: 'पूछताछ लोड हो रही है...',
    error: 'पूछताछ लोड करने में विफल: ',
    deleteSuccess: 'पूछताछ सफलतापूर्वक हटाई गई!',
    deleteError: 'पूछताछ हटाने में विफल: ',
    toggleLang: 'English',
  },
};

const BeneficiaryEditPageList = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    const fetchEnquiries = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error');
        setEnquiries(json.data || []);
        
        // Show info if data is filtered for CMO users
        if (json.filtered && localStorage.getItem('role') === 'CMO') {
          console.log(`Beneficiary Details: Showing ${json.data?.length || 0} enquiries created by current CMO user`);
        }
      } catch (e) {
        setError(labels[language].error + e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnquiries();
  }, [language]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    setIsDeleting(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/enquiries/${id}`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error');
      setEnquiries(prev => prev.filter(e => e.enquiry_id !== id));
      alert(labels[language].deleteSuccess);
    } catch (e) {
      setError(labels[language].deleteError + e.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (id) => navigate(`/cmo-dashboard/beneficiary-detail-page/${id}`);

  return (
    <section className="max-w-7xl mx-auto p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{labels[language].title}</h1>
          {localStorage.getItem('role') === 'CMO' && (
            <p className="text-sm text-blue-600 mt-1">
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Showing only your enquiries
              </span>
            </p>
          )}
        </div>
        <div className="flex space-x-4 items-center">
          <button
            onClick={() => setLanguage(lang => (lang === 'en' ? 'hi' : 'en'))}
            className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
          >
            {labels[language].toggleLang}
          </button>

        </div>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
          <FaHospital className="mr-2" /> <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
        ))}</div>
      ) : enquiries.length === 0 ? (
        <p className="text-gray-600 text-center py-8">{labels[language].noEnquiries}</p>
      ) : (
        <div className="space-y-6">
          {enquiries.map(enq => (
            <div
              key={enq.enquiry_id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 mt-4 mr-4 text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                {enq.status || 'PENDING'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FaUser className="text-indigo-500" />
                  <span><span className="font-medium">{labels[language].patientName}:</span> {enq.patient_name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaGlobe className="text-green-500" />
                  <span><span className="font-medium">{labels[language].district}:</span> {enq.district?.district_name || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaHospital className="text-red-500" />
                  <span><span className="font-medium">{labels[language].hospital}:</span> {enq.hospital?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaHospital className="text-yellow-500" />
                  <span><span className="font-medium">{labels[language].sourceHospital}:</span> {enq.sourceHospital?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhoneAlt className="text-indigo-500" />
                  <span><span className="font-medium">{labels[language].contactPhone}:</span> {enq.contact_phone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-indigo-500" />
                  <span><span className="font-medium">{labels[language].contactEmail}:</span> {enq.contact_email || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3 md:col-span-2">
                  <FaGlobe className="text-gray-500" />
                  <span><span className="font-medium">{labels[language].documents}:</span> {enq.documents && enq.documents.length > 0 ? enq.documents.map(d => d.document_type).join(', ') : 'None'}</span>
                </div>
              </div>

              <footer className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleEdit(enq.enquiry_id)}
                  className="flex-1 flex items-center justify-center py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <FaEdit className="mr-2" /> {labels[language].edit}
                </button>
                <button
                  onClick={() => handleDelete(enq.enquiry_id)}
                  className="flex-1 flex items-center justify-center py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  disabled={isDeleting === enq.enquiry_id}
                >
                  <FaTrash className="mr-2" /> {isDeleting === enq.enquiry_id ? 'Deleting...' : labels[language].delete}
                </button>
              </footer>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default BeneficiaryEditPageList;
