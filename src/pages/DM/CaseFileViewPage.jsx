import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiUser,
  FiFileText,
  FiHome,
  FiPhone,
  FiCheckCircle,
  FiDownload,
  FiArrowUpCircle,
} from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-500/20',
  APPROVED: 'bg-green-100 text-green-800 ring-green-500/20',
  REJECTED: 'bg-red-100 text-red-800 ring-red-500/20',
  FORWARDED: 'bg-purple-100 text-purple-800 ring-purple-500/20',
  ESCALATED: 'bg-blue-100 text-blue-800 ring-blue-500/20',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 ring-indigo-500/20',
  COMPLETED: 'bg-teal-100 text-teal-800 ring-teal-500/20',
};

const CaseFileViewPage = () => {
  const { enquiryId } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    if (!enquiryId || enquiryId === 'undefined') {
      setError('Invalid case file ID');
      setLoading(false);
      return;
    }
    const fetchEnquiry = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/enquiries/${enquiryId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Case file not found');
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
      const response = await fetch(`${baseUrl}/api/enquiries/${enquiryId}/approve-reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action.toLowerCase()} case file`);
      }
      setEnquiry({ ...enquiry, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' });
      setActionStatus(`Case file ${action.toLowerCase()}d successfully!`);
    } catch (err) {
      setActionStatus('Failed to update: ' + err.message);
    }
  };

  const Card = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-lg mt-10 p-6 transition-all hover:shadow-xl">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-4">
        {Icon && <Icon className="text-blue-600 h-6 w-6" />}
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3 text-gray-600">{children}</div>
    </div>
  );

  const Field = ({ label, value }) => (
    <div className="flex items-center gap-2">
      <span className="font-medium text-gray-700 w-40">{label}:</span>
      <span className="text-gray-600">{value || 'N/A'}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="Loading case file"></div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md" role="alert">
          {error || 'Case file not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Case File #{enquiryId}</h1>
          <span
            className={`px-4 py-2 text-sm font-medium rounded-full ring-1 ring-inset ${
              statusStyles[enquiry.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {enquiry.status || 'UNKNOWN'}
          </span>
        </div>
        <div className=''>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">



        
          <Card title="Patient Information" icon={FiUser}>
            <Field label="Patient Name" value={enquiry.patient_name} />
            <Field label="Ayushman Card" value={enquiry.ayushman_card_number} />
            <Field label="Aadhar Card" value={enquiry.aadhar_card_number} />
            <Field label="PAN Card" value={enquiry.pan_card_number} />
            <Field label="Father/Spouse Name" value={enquiry.father_spouse_name} />
            <Field label="Medical Condition" value={enquiry.medical_condition} />
            <Field label="Chief Complaint" value={enquiry.chief_complaint} />
            <Field label="General Condition" value={enquiry.general_condition} />
            <Field label="Vitals" value={enquiry.vitals} />
            <Field label="Age" value={enquiry.age} />
            <Field label="Gender" value={enquiry.gender} />
            <Field label="Address" value={enquiry.address} />
          </Card>

          <Card title="Hospital & District Info" icon={FiHome}>
            <Field label="Destination Hospital" value={enquiry.hospital?.name} />
            <Field label="Source Hospital" value={enquiry.sourceHospital?.name} />
            <Field label="District" value={enquiry.district?.district_name} />
          </Card>

          <Card title="Contact Person" icon={FiPhone}>
            <Field label="Contact Name" value={enquiry.contact_name} />
            <Field label="Contact Phone" value={enquiry.contact_phone} />
            <Field label="Contact Email" value={enquiry.contact_email} />
          </Card>

          <Card title="Referral & Transport" icon={FiFileText}>
            <Field label="Referring Physician" value={enquiry.referring_physician_name} />
            <Field label="Designation" value={enquiry.referring_physician_designation} />
            <Field label="Referral Note" value={enquiry.referral_note} />
            <Field label="Transportation Category" value={enquiry.transportation_category} />
            <Field label="Air Transport Type" value={enquiry.air_transport_type} />
          </Card>

          <Card title="Authority Details" icon={FiUser}>
            <Field label="Recommending Authority" value={enquiry.recommending_authority_name} />
            <Field label="Designation" value={enquiry.recommending_authority_designation} />
            <Field label="Approval Authority" value={enquiry.approval_authority_name} />
            <Field label="Designation" value={enquiry.approval_authority_designation} />
          </Card>

          <Card title="Ambulance & Notes" icon={FiFileText}>
            <Field label="Bed Availability" value={enquiry.bed_availability_confirmed ? 'Yes' : 'No'} />
            <Field label="ALS Ambulance" value={enquiry.als_ambulance_arranged ? 'Yes' : 'No'} />
            <Field label="Ambulance Reg" value={enquiry.ambulance_registration_number} />
            <Field label="Ambulance Contact" value={enquiry.ambulance_contact} />
            <Field label="Medical Team Note" value={enquiry.medical_team_note} />
            <Field label="Remarks" value={enquiry.remarks} />
            <Field label="CMO Remarks" value={enquiry.cmo_remarks} />
            <Field label="SDM Remarks" value={enquiry.sdm_remarks} />
          </Card>
          </div>

 
          <Card title="Documents" icon={FiFileText} className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
              {enquiry.documents?.length > 0 ? (
                enquiry.documents.map((doc) => (
                  <div key={doc.document_id} className="bg-indigo-50 p-4 rounded-xl shadow-sm hover:shadow-md transition mt-20">
                    <p className="font-medium text-indigo-700 mb-3">{doc.document_type}</p>
                    <a
                      href={`${baseUrl}${doc.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                      aria-label={`Download ${doc.document_type} document`}
                    >
                      <FiDownload className="h-5 w-5" /> Download
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No documents uploaded.</p>
              )}
            </div>
          </Card>




  
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-4">
          <button
            onClick={() => handleApproveReject('APPROVE')}
            disabled={enquiry.status === 'APPROVED' || enquiry.status === 'REJECTED' || actionStatus.includes('Processing')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg transition shadow-md ${
              enquiry.status === 'APPROVED' || actionStatus.includes('Processing')
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            aria-label="Approve case file"
          >
            <FiCheckCircle className="h-5 w-5" />
            {actionStatus.includes('Processing approve') ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={() => handleApproveReject('REJECT')}
            disabled={enquiry.status === 'APPROVED' || enquiry.status === 'REJECTED' || actionStatus.includes('Processing')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg transition shadow-md ${
              enquiry.status === 'REJECTED' || actionStatus.includes('Processing')
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            aria-label="Reject case file"
          >
            <FiCheckCircle className="h-5 w-5" />
            {actionStatus.includes('Processing reject') ? 'Processing...' : 'Reject'}
          </button>
          <Link
            to={`/dm/order-release/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
            aria-label="Release order for case file"
          >
            <FiArrowUpCircle className="h-5 w-5" /> Release Order
          </Link>
          <Link
            to={`/dm/financial-sanction/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition shadow-md"
            aria-label="Financial sanction for case file"
          >
            <FiArrowUpCircle className="h-5 w-5" /> Financial Sanction
          </Link>
          <Link
            to={`/dm/escalation/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md"
            aria-label="Escalate case file"
          >
            <FiArrowUpCircle className="h-5 w-5" /> Escalate
          </Link>
        </div>

        {actionStatus && (
          <p
            className={`mt-4 text-sm font-medium ${
              actionStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'
            }`}
            role="status"
          >
            {actionStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default CaseFileViewPage;