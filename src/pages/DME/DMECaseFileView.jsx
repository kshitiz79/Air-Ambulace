import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiUser, FiFileText, FiHome, FiPhone, FiCheckCircle, FiDownload, FiArrowUpCircle, FiClipboard } from 'react-icons/fi';
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

const DMECaseFileView = () => {
  const { enquiryId } = useParams();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const { t, localize } = useLanguage();

  useEffect(() => {
    if (!enquiryId || enquiryId === 'undefined') { setError(t.invalidCaseId); setLoading(false); return; }
    const fetchEnquiry = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/enquiries/${enquiryId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || t.caseFileNotFound);
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Failed to ${action.toLowerCase()}`);
      setEnquiry(data.data);
      setActionStatus(t.caseFileUpdated);
    } catch (err) {
      setActionStatus(t.failedToUpdate + ': ' + err.message);
    }
  };

  const Card = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-sm mt-10 p-6 transition-all hover:shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-4">
        {Icon && <Icon className="text-teal-600 h-6 w-6" />}
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  if (error || !enquiry) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md">{error || t.caseFileNotFound}</div>
    </div>
  );

  const e = localize(enquiry);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.caseFile} #{enquiryId}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                {enquiry.enquiry_code}
              </span>
              {enquiry.district?.district_name && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                  📍 {enquiry.district.district_name}
                </span>
              )}
            </div>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ring-1 ring-inset ${statusStyles[enquiry.status] || 'bg-gray-100 text-gray-800'}`}>
            {t[enquiry.status?.toLowerCase()] || enquiry.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title={t.patientInfo} icon={FiUser}>
            <Field label={t.patientName} value={e.patient_name} />
            <Field label={t.aadharCard} value={enquiry.aadhar_card_number} />
            <Field label={t.fatherSpouseName} value={e.father_spouse_name} />
            <Field label={t.medicalCondition} value={e.medical_condition} />
            <Field label={t.chiefComplaint} value={e.chief_complaint} />
            <Field label={t.generalCondition} value={e.general_condition} />
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
            <Field label={t.approvalAuthority} value={e.approval_authority_name} />
          </Card>

          <Card title={t.ambulanceNotes} icon={FiFileText}>
            <Field label={t.bedAvailability} value={enquiry.bed_availability_confirmed ? t.yes : t.no} />
            <Field label={t.alsAmbulance} value={enquiry.als_ambulance_arranged ? t.yes : t.no} />
            <Field label={t.ambulanceReg} value={enquiry.ambulance_registration_number} />
            <Field label={t.medicalTeamNote} value={e.medical_team_note} />
            <Field label={t.remarks} value={e.remarks} />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card title={t.verificationStatus || 'Verification Status'} icon={FiCheckCircle}>
            <div className="space-y-6 py-2">
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${['COLLECTOR_APPROVED', 'APPROVED'].includes(enquiry.status) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-200 text-slate-400'}`}>
                  <FiCheckCircle size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 tracking-tight">
                    {enquiry.transportation_category === 'Out of State' ? 'Not Required (Direct DME)' : (t.step1Collector || 'Step 1: Collector Approval')}
                  </p>
                  {['COLLECTOR_APPROVED', 'APPROVED'].includes(enquiry.status) ? (
                    <div className="flex flex-col mt-1">
                      <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest italic">{t.collectorApproved || 'Approved by Collector'}</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5">{enquiry.collector_name || 'Assigned Collector'}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">{enquiry.transportation_category === 'Out of State' ? 'DME Jurisdiction' : 'Pending Verification'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${enquiry.dme_name ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-400'}`}>
                  <FiCheckCircle size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 tracking-tight">{t.step2DME || 'Step 2: DME Approval'}</p>
                  {enquiry.dme_name ? (
                    <div className="flex flex-col mt-1">
                      <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest italic">{t.dmeApproved || 'Sanctioned by DME'}</span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5">{enquiry.dme_name}</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">Waiting for DME Final Sanction</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card title={t.documents} icon={FiFileText}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enquiry.documents?.length > 0 ? enquiry.documents.map((doc) => (
              <div key={doc.document_id} className="bg-teal-50 p-4 rounded-xl shadow-sm hover:shadow-md transition">
                <p className="font-medium text-teal-700 mb-3">{doc.document_type}</p>
                <a href={doc.file_path.startsWith('http') ? doc.file_path : `${baseUrl}${doc.file_path}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition">
                  <FiDownload className="h-5 w-5" /> {t.download}
                </a>
              </div>
            )) : <p className="text-gray-500">{t.noDocuments}.</p>}
          </div>
        </Card>
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-4">
          <button onClick={() => handleApproveReject('APPROVE')}
            disabled={
              (enquiry.status === 'APPROVED' && enquiry.dme_name) || 
              enquiry.status === 'REJECTED' || 
              (enquiry.transportation_category !== 'Out of State' && enquiry.status !== 'COLLECTOR_APPROVED' && enquiry.status !== 'APPROVED')
            }
            className={`flex items-center gap-2 px-5 py-3 rounded-lg transition shadow-md ${
              ((enquiry.status === 'APPROVED' && enquiry.dme_name) || 
               enquiry.status === 'REJECTED' || 
               (enquiry.transportation_category !== 'Out of State' && enquiry.status !== 'COLLECTOR_APPROVED' && enquiry.status !== 'APPROVED')) 
              ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}>
            <FiCheckCircle className="h-5 w-5" /> {t.approve}
          </button>
          
          <button onClick={() => handleApproveReject('REJECT')}
            disabled={
              (enquiry.status === 'APPROVED' && enquiry.dme_name) || 
              enquiry.status === 'REJECTED' || 
              (enquiry.transportation_category !== 'Out of State' && enquiry.status !== 'COLLECTOR_APPROVED' && enquiry.status !== 'APPROVED')
            }
            className={`flex items-center gap-2 px-5 py-3 rounded-lg transition shadow-md ${
              ((enquiry.status === 'APPROVED' && enquiry.dme_name) || 
               enquiry.status === 'REJECTED' || 
               (enquiry.transportation_category !== 'Out of State' && enquiry.status !== 'COLLECTOR_APPROVED' && enquiry.status !== 'APPROVED')) 
              ? 'bg-slate-300 cursor-not-allowed text-slate-500' 
              : 'bg-red-600 hover:bg-red-700 text-white'
            }`}>
            <FiCheckCircle className="h-5 w-5" /> {t.reject}
          </button>
          <Link to={`/dme-dashboard/query-to-cmho/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">
            <FiClipboard className="h-5 w-5" /> {t.queryCmho}
          </Link>
          <Link to={`/dme-dashboard/order-release-page/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md">
            <FiArrowUpCircle className="h-5 w-5" /> {t.orderRelease}
          </Link>
          <Link to={`/dme-dashboard/financial-page/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition shadow-md">
            <FiArrowUpCircle className="h-5 w-5" /> {t.financialSanction}
          </Link>
          <Link to={`/dme-dashboard/escalation-page/${enquiryId}`}
            className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md">
            <FiArrowUpCircle className="h-5 w-5" /> {t.escalate}
          </Link>
        </div>

        {actionStatus && (
          <p className={`mt-4 text-sm font-medium ${actionStatus === t.caseFileUpdated ? 'text-green-600' : actionStatus.includes(t.processing) ? 'text-blue-600' : 'text-red-600'}`}>
            {actionStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default DMECaseFileView;
