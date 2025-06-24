import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const EnquiryDetailsPage = () => {
  const { enquiryId } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forwardStatus, setForwardStatus] = useState('');

  useEffect(() => {
    const fetchEnquiry = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/enquiries/${enquiryId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Enquiry not found');
        }
        setEnquiry(data.data);
        setError('');
      } catch (err) {
        setError('Failed to load enquiry: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiry();
  }, [enquiryId]);

  const handleForwardToDM = async () => {
    try {
      setForwardStatus('Forwarding...');
      const response = await fetch(`http://localhost:4000/api/enquiries/${enquiryId}/forward`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to forward enquiry');
      }
      setEnquiry({ ...enquiry, status: 'FORWARDED' });
      setForwardStatus('Enquiry forwarded to DM successfully!');
    } catch (err) {
      setForwardStatus('Failed to forward: ' + err.message);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  if (error || !enquiry) {
    return <div className="max-w-4xl mx-auto p-6">{error || 'Enquiry not found'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Enquiry Details - {enquiryId}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Patient Name:</strong> {enquiry.patient_name}</p>
          <p><strong>Ayushman Card:</strong> {enquiry.ayushman_card_number || 'N/A'}</p>
          <p><strong>Medical Condition:</strong> {enquiry.medical_condition}</p>
          <p><strong>Hospital:</strong> {enquiry.hospital?.name || 'N/A'}</p>
        </div>
        <div>
          <p><strong>Contact Name:</strong> {enquiry.contact_name}</p>
          <p><strong>Contact Phone:</strong> {enquiry.contact_phone}</p>
          <p><strong>Status:</strong> {enquiry.status}</p>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Documents</h3>
        <ul className="list-disc pl-5">
          {enquiry.documents && enquiry.documents.length > 0 ? (
            enquiry.documents.map((doc) => (
              <li key={doc.document_id}>{doc.document_type}: {doc.file_path.split('/').pop()}</li>
            ))
          ) : (
            <li>No documents uploaded</li>
          )}
        </ul>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          to={`/sdm/validation/${enquiryId}`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Validate
        </Link>
        <Link
          to={`/sdm/approve-reject/${enquiryId}`}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Approve/Reject
        </Link>
        <Link
          to={`/sdm/query-to-cmo/${enquiryId}`}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Query CMO
        </Link>
        <button
          onClick={handleForwardToDM}
          disabled={enquiry.status === 'FORWARDED' || forwardStatus === 'Forwarding...'}
          className={`px-4 py-2 rounded text-white ${
            enquiry.status === 'FORWARDED' || forwardStatus === 'Forwarding...'
              ? 'bg-gray-400'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {forwardStatus === 'Forwarding...' ? 'Forwarding...' : 'Forward to DM'}
        </button>
      </div>
      {forwardStatus && (
        <p
          className={`mt-4 ${
            forwardStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {forwardStatus}
        </p>
      )}
    </div>
  );
};

export default EnquiryDetailsPage;