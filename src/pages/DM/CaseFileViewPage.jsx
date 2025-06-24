import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CaseFileViewPage = () => {
  const { enquiryId } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');

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
        setError('Failed to load case file: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiry();
  }, [enquiryId]);

  const handleApproveReject = async (action) => {
    try {
      setActionStatus(`Processing ${action.toLowerCase()}...`);
      const response = await fetch(`http://localhost:4000/api/enquiries/${enquiryId}/approve-reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action.toLowerCase()} enquiry`);
      }
      setEnquiry({ ...enquiry, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' });
      setActionStatus(`Enquiry ${action.toLowerCase()} successfully!`);
    } catch (err) {
      setActionStatus('Failed to update: ' + err.message);
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
      <h2 className="text-xl font-semibold mb-4">Case File - {enquiryId}</h2>
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
          <p><strong>CMO Remarks:</strong> {enquiry.cmo_remarks || 'N/A'}</p>
          <p><strong>SDM Remarks:</strong> {enquiry.sdm_remarks || 'N/A'}</p>
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
        <button
          onClick={() => handleApproveReject('APPROVE')}
          disabled={enquiry.status === 'APPROVED' || enquiry.status === 'REJECTED' || actionStatus.includes('Processing')}
          className={`px-4 py-2 rounded text-white ${
            enquiry.status === 'APPROVED' || actionStatus.includes('Processing')
              ? 'bg-gray-400'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {actionStatus.includes('Processing approve') ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={() => handleApproveReject('REJECT')}
          disabled={enquiry.status === 'APPROVED' || enquiry.status === 'REJECTED' || actionStatus.includes('Processing')}
          className={`px-4 py-2 rounded text-white ${
            enquiry.status === 'REJECTED' || actionStatus.includes('Processing')
              ? 'bg-gray-400'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {actionStatus.includes('Processing reject') ? 'Processing...' : 'Reject'}
        </button>
        <Link
          to={`/dm/order-release/${enquiryId}`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Release Order
        </Link>
        <Link
          to={`/dm/financial-sanction/${enquiryId}`}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Financial Sanction
        </Link>
        <Link
          to={`/dm/escalation/${enquiryId}`}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Escalate
        </Link>
      </div>
      {actionStatus && (
        <p
          className={`mt-4 ${
            actionStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {actionStatus}
        </p>
      )}
    </div>
  );
};

export default CaseFileViewPage;