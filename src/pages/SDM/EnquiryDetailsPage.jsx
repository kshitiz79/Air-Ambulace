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
  FiPlusCircle
} from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';


const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  FORWARDED: 'bg-purple-100 text-purple-800',
  ESCALATED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-teal-100 text-teal-800',
};

export const EnquiryDetailsPage = () => {
  const { enquiryId } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forwardStatus, setForwardStatus] = useState('');

  useEffect(() => {
    const fetchEnquiry = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/api/enquiries/${enquiryId}`);
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || 'Not found');
        setEnquiry(payload.data);
      } catch (err) {
        setError('Could not load enquiry: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiry();
  }, [enquiryId]);

  const handleForward = async () => {
    try {
      setForwardStatus('Forwarding...');
      const res = await fetch(`${baseUrl}/api/enquiries/${enquiryId}/forward`, {
        method: 'PATCH',
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Forward failed');
      setEnquiry({ ...enquiry, status: 'FORWARDED' });
      setForwardStatus('Forwarded to DM!');
    } catch (err) {
      setForwardStatus('Error: ' + err.message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !enquiry) return <div className="p-6 text-red-600">{error || 'Enquiry not found'}</div>;

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Enquiry #{enquiryId}</h1>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[enquiry.status] || ''}`}
        >
          {enquiry.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <div className="space-y-2">
          <p className="flex items-center"><FiUser className="mr-2" /> {enquiry.patient_name}</p>
          <p className="flex items-center"><FiFileText className="mr-2" /> Ayushman Card: {enquiry.ayushman_card_number || 'N/A'}</p>
          <p className="flex items-center"><FiClipboard className="mr-2" /> Condition: {enquiry.medical_condition}</p>
          <p className="flex items-center"><FiHome className="mr-2" /> Hospital: {enquiry.hospital?.name || 'N/A'}</p>
        </div>
        <div className="space-y-2">
          <p className="flex items-center"><FiMail className="mr-2" /> Contact: {enquiry.contact_name}</p>
          <p className="flex items-center"><FiPhone className="mr-2" /> Phone: {enquiry.contact_phone}</p>
          <p className="flex items-center"><FiMail className="mr-2" /> Email: {enquiry.contact_email}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
          <FiFileText className="mr-2" /> Documents
        </h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {enquiry.documents?.length > 0
            ? enquiry.documents.map((doc) => (
                <li key={doc.document_id} className="flex items-center">
                  <FiFileText className="mr-2" /> {doc.document_type}: {doc.file_path.split('/').pop()}
                </li>
              ))
            : <li>No documents uploaded.</li>
          }
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          to={`/sdm/validation/${enquiryId}`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <FiCheckCircle className="mr-2" /> Validate
        </Link>
        <Link
          to={`/sdm/approve-reject/${enquiryId}`}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          <FiCheckCircle className="mr-2" /> Approve/Reject
        </Link>
        <Link
          to={`/sdm/query-to-cmo/${enquiryId}`}
          className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
        >
          <FiClipboard className="mr-2" /> Query CMO
        </Link>
        <button
          onClick={handleForward}
          disabled={enquiry.status === 'FORWARDED'}
          className={
            `flex items-center px-4 py-2 rounded text-white transition ` +
            (enquiry.status === 'FORWARDED'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700')
          }
        >
          <FiPlusCircle className="mr-2" /> {forwardStatus || 'Forward to DM'}
        </button>
      </div>

      {forwardStatus && (
        <p className={`mt-4 ${forwardStatus.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}> {forwardStatus} </p>
      )}
    </div>
  );
};
export default EnquiryDetailsPage;