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
  FiPlusCircle,
  FiDownload
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
        const res = await fetch(`${baseUrl}/api/enquiries/${enquiryId}`);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !enquiry) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md">{error || 'Enquiry not found'}</div>
    </div>
  );

  const Card = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl">
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Enquiry #{enquiryId}</h1>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ring-1 ring-inset ${statusStyles[enquiry.status] || 'bg-gray-100 text-gray-800'}`}>
            {enquiry.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <Card title="Patient Information" icon={FiUser}>
            <Field label="Patient Name" value={enquiry.patient_name} />
            <Field label="Ayushman Card" value={enquiry.ayushman_card_number} />
            <Field label="Aadhar Card" value={enquiry.aadhar_card_number} />
            <Field label="PAN Card" value={enquiry.pan_card_number} />
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

          <Card title="Referral & Transport" icon={FiClipboard}>
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
          </Card>
        </div>

        <Card title="Documents" icon={FiFileText}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enquiry.documents?.length > 0 ? enquiry.documents.map((doc) => (
              <div key={doc.document_id} className="bg-indigo-50 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <p className="font-medium text-indigo-700 mb-3">{doc.document_type}</p>
                <a
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  <FiDownload className="h-5 w-5" /> Download
                </a>
              </div>
            )) : <p className="text-gray-500">No documents uploaded.</p>}
          </div>
        </Card>

        <div className="mt-8 flex flex-wrap justify-between gap-4">
          <Link to={`/sdm/validation/${enquiryId}`} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md">
            <FiCheckCircle className="h-5 w-5" /> Validate
          </Link>
          <Link to={`/sdm/approve-reject/${enquiryId}`} className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md">
            <FiCheckCircle className="h 5 w-5" /> Approve/Reject
          </Link>
          <Link to={`/sdm/query-to-cmo/${enquiryId}`} className="flex items-center gap-2 px-5 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition shadow-md">
            <FiClipboard className="h-5 w-5" /> Query CMO
          </Link>
          <button
            onClick={handleForward}
            disabled={enquiry.status === 'FORWARDED'}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg transition shadow-md ${
              enquiry.status === 'FORWARDED'
                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <FiPlusCircle className="h-5 w-5" /> {forwardStatus || 'Forward to DM'}
          </button>
        </div>

        {forwardStatus && (
          <p className={`mt-4 text-sm font-medium ${
            forwardStatus.startsWith('Error') ? 'text-red-600' : 'text-green-600'
          }`}>{forwardStatus}</p>
        )}
      </div>
    </div>
  );
};

export default EnquiryDetailsPage;