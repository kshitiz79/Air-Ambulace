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
  FiClipboard,
} from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { language, setLanguage, t, localize } = useLanguage();

  useEffect(() => {
    if (!enquiryId || enquiryId === 'undefined') {
      setError(t.invalidCaseId);
      setLoading(false);
      return;
    }
    const fetchEnquiry = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/enquiries/${enquiryId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || t.caseFileNotFound);
        }
        setEnquiry(data.data);
        setError('');
      } catch (err) {
        setError(t.failedToLoadCase + ': ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiry();
  }, [enquiryId, t]);

  const handleApproveReject = async (action) => {
    try {
      setActionStatus(`${t.processing} ${action === 'APPROVE' ? t.approve : t.reject}...`);
      const response = await fetch(`${baseUrl}/api/enquiries/${enquiryId}/approve-reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `${t.failedToUpdate} ${action.toLowerCase()} ${t.caseFile.toLowerCase()}`);
      }
      setEnquiry({ ...enquiry, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' });
      setActionStatus(t.caseFileUpdated);
    } catch (err) {
      setActionStatus(t.failedToUpdate + ': ' + err.message);
    }
  };

  const Card = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-sm mt-10 p-6 transition-all hover:shadow-sm">
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
          {error || t.caseFileNotFound}
        </div>
      </div>
    );
  }

  // Apply language localization to all translatable fields
  const e = localize(enquiry);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">{t.caseFile} #{enquiryId}</h1>
         
          </div>
          <span
            className={`px-4 py-2 text-sm font-medium rounded-full ring-1 ring-inset ${
              statusStyles[enquiry.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {t[enquiry.status.toLowerCase()] || enquiry.status}
          </span>
        </div>
        <div className=''>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        
          <Card title={t.patientInfo} icon={FiUser}>
            <Field label={t.patientName} value={e.patient_name} />
            
            {/* Identity Card Information */}
            {enquiry.identity_card_type && enquiry.ayushman_card_number ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {enquiry.identity_card_type === 'ABHA' ? t.abhaNumber : t.pmJayId}
                </label>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    enquiry.identity_card_type === 'ABHA' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {enquiry.identity_card_type === 'ABHA' ? 'ABHA (14 digits)' : 'PM JAY (9 digits)'}
                  </span>
                  <span className="text-gray-900 font-mono">{enquiry.ayushman_card_number}</span>
                </div>
              </div>
            ) : enquiry.ayushman_card_number ? (
              <Field label={t.ayushmanCard} value={enquiry.ayushman_card_number} />
            ) : null}
            
            <Field label={t.aadharCard} value={enquiry.aadhar_card_number} />
            <Field label={t.panCard} value={enquiry.pan_card_number} />
            <Field label={t.fatherSpouseName} value={e.father_spouse_name} />
            <Field label={t.medicalCondition} value={e.medical_condition} />
            <Field label={t.chiefComplaint} value={e.chief_complaint} />
            <Field label={t.generalCondition} value={e.general_condition} />
            <Field label={t.vitals} value={enquiry.vitals} />
            <Field label={t.age} value={enquiry.age} />
            <Field label={t.gender} value={t[enquiry.gender?.toLowerCase()] || enquiry.gender} />
            <Field label={t.address} value={e.address} />
          </Card>

          <Card title={t.hospitalDistrictInfo} icon={FiHome}>
            <Field label={t.destinationHospital} value={enquiry.hospital?.name} />
            <Field label={t.sourceHospital} value={enquiry.sourceHospital?.name} />
            <Field label={t.district} value={enquiry.district?.district_name} />
          </Card>

          <Card title={t.contactPerson} icon={FiPhone}>
            <Field label={t.contactName} value={e.contact_name} />
            <Field label={t.contactPhone} value={enquiry.contact_phone} />
            <Field label={t.contactEmail} value={enquiry.contact_email} />
          </Card>

          <Card title={t.referralTransport} icon={FiFileText}>
            <Field label={t.referringPhysician} value={e.referring_physician_name} />
            <Field label={t.designation} value={e.referring_physician_designation} />
            <Field label={t.referralNote} value={e.referral_note} />
            <Field label={t.transportationCategory} value={enquiry.transportation_category} />
            <Field label={t.airTransportType} value={enquiry.air_transport_type} />
          </Card>

          <Card title={t.authorityDetails} icon={FiUser}>
            <Field label={t.recommendingAuthority} value={e.recommending_authority_name} />
            <Field label={t.designation} value={e.recommending_authority_designation} />
            <Field label={t.approvalAuthority} value={e.approval_authority_name} />
            <Field label={t.designation} value={e.approval_authority_designation} />
          </Card>

          <Card title={t.ambulanceNotes} icon={FiFileText}>
            <Field label={t.bedAvailability} value={enquiry.bed_availability_confirmed ? t.yes : t.no} />
            <Field label={t.alsAmbulance} value={enquiry.als_ambulance_arranged ? t.yes : t.no} />
            <Field label={t.ambulanceReg} value={enquiry.ambulance_registration_number} />
            <Field label={t.ambulanceContact} value={enquiry.ambulance_contact} />
            <Field label={t.medicalTeamNote} value={e.medical_team_note} />
            <Field label={t.remarks} value={e.remarks} />
            <Field label={t.cmhoRemarks} value={enquiry.cmho_remarks} />
            <Field label={t.sdmRemarks} value={enquiry.sdm_remarks} />
          </Card>
          </div>

 
          <Card title={t.documents} icon={FiFileText} className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
              {enquiry.documents?.length > 0 ? (
                enquiry.documents.map((doc) => (
                  <div key={doc.document_id} className="bg-indigo-50 p-4 rounded-xl shadow-sm hover:shadow-md transition mt-20">
                    <p className="font-medium text-indigo-700 mb-3">{t[doc.document_type?.toLowerCase()] || doc.document_type}</p>
                    <a
                      href={`${baseUrl}${doc.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                      aria-label={`Download ${doc.document_type} document`}
                    >
                      <FiDownload className="h-5 w-5" /> {t.download}
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">{t.noDocuments}.</p>
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
            {actionStatus.includes(t.processing) && actionStatus.includes(t.approve.toLowerCase()) ? t.processing + '...' : t.approve}
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
            {actionStatus.includes(t.processing) && actionStatus.includes(t.reject.toLowerCase()) ? t.processing + '...' : t.reject}
          </button>
          <Link
            to={`/collector-dashboard/query-to-cmho/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
            aria-label="Query CMHO for case file"
          >
            <FiClipboard className="h-5 w-5" /> {t.queryCmho}
          </Link>
          <Link
            to={`/collector-dashboard/order-release-page/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
            aria-label="Release order for case file"
          >
            <FiArrowUpCircle className="h-5 w-5" /> {t.orderRelease}
          </Link>
          <Link
            to={`/collector-dashboard/financial-page/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition shadow-md"
            aria-label="Financial sanction for case file"
          >
            <FiArrowUpCircle className="h-5 w-5" /> {t.financialSanction}
          </Link>
          <Link
            to={`/collector-dashboard/escalation-page/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md"
            aria-label="Escalate case file"
          >
            <FiArrowUpCircle className="h-5 w-5" /> {t.escalate}
          </Link>
        </div>

        {actionStatus && (
          <p
            className={`mt-4 text-sm font-medium ${
              actionStatus === t.caseFileUpdated ? 'text-green-600' : 
              actionStatus.includes(t.processing) ? 'text-blue-600' : 'text-red-600'
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