import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiFileText,
  FiHome,
  FiPhone,
  FiMail,
  FiClipboard,
  FiCheckCircle,
  FiPlusCircle,
  FiDownload,
  FiAlertTriangle,
  FiArrowLeft,
  FiClock,
  FiMapPin,
  FiActivity
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
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalatedTo, setEscalatedTo] = useState('Collector');
  const [language, setLanguage] = useState('en');

  const labels = {
    en: {
      patientInfo: "Patient Information",
      patientName: "Patient Name",
      fatherSpouseName: "Father/Spouse Name",
      age: "Age",
      gender: "Gender",
      address: "Address",
      medicalCondition: "Medical Condition",
      chiefComplaint: "Chief Complaint",
      generalCondition: "General Condition",
      vitals: "Vitals",
      identityInfo: "Identity Information",
      hospitalDistrictInfo: "Hospital & District Info",
      destinationHospital: "Destination Hospital",
      sourceHospital: "Source Hospital",
      district: "District",
      contactPerson: "Contact Person",
      contactName: "Contact Name",
      contactPhone: "Contact Phone",
      contactEmail: "Contact Email",
      referralTransport: "Referral & Transport",
      referringPhysician: "Referring Physician",
      designation: "Designation",
      referralNote: "Referral Note",
      transportationCategory: "Transportation Category",
      airTransportType: "Air Transport Type",
      authorityDetails: "Authority Details",
      recommendingAuthority: "Recommending Authority",
      approvalAuthority: "Approval Authority",
      ambulanceNotes: "Ambulance & Notes",
      bedAvailability: "Bed Availability",
      alsAmbulance: "ALS Ambulance",
      ambulanceReg: "Ambulance Reg",
      ambulanceContact: "Ambulance Contact",
      medicalTeamNote: "Medical Team Note",
      remarks: "Remarks",
      documents: "Documents",
      download: "Download",
      yes: "Yes",
      no: "No",
      abhaNumber: "ABHA Number",
      pmJayId: "PM JAY ID",
      backToList: "Back to List",
      queryCmho: "Query CMHO",
      approve: "Approve",
      reject: "Reject",
      forwardDm: "Forward to Collector"
    },
    hi: {
      patientInfo: "रोगी की जानकारी",
      patientName: "रोगी का नाम",
      fatherSpouseName: "पिता/पति/पत्नी का नाम",
      age: "आयु",
      gender: "लिंग",
      address: "पता",
      medicalCondition: "चिकित्सा स्थिति",
      chiefComplaint: "मुख्य शिकायत",
      generalCondition: "सामान्य स्थिति",
      vitals: "महत्वपूर्ण संकेत",
      identityInfo: "पहचान कार्ड की जानकारी",
      hospitalDistrictInfo: "अस्पताल और जिला जानकारी",
      destinationHospital: "गंतव्य अस्पताल",
      sourceHospital: "स्रोत अस्पताल",
      district: "जिला",
      contactPerson: "संपर्क व्यक्ति",
      contactName: "संपर्क नाम",
      contactPhone: "संपर्क फोन",
      contactEmail: "संपर्क ईमेल",
      referralTransport: "रेफरल और परिवहन",
      referringPhysician: "रेफर करने वाले चिकित्सक",
      designation: "पद",
      referralNote: "रेफरल नोट",
      transportationCategory: "परिवहन श्रेणी",
      airTransportType: "हवाई परिवहन प्रकार",
      authorityDetails: "प्राधिकरण विवरण",
      recommendingAuthority: "सिफारिश करने वाला प्राधिकरण",
      approvalAuthority: "अनुमोदन प्राधिकरण",
      ambulanceNotes: "एम्बुलेंस और नोट्स",
      bedAvailability: "बेड की उपलब्धता",
      alsAmbulance: "ALS एम्बुलेंस",
      ambulanceReg: "एम्बुलेंस पंजीकरण",
      ambulanceContact: "एम्बुलेंस संपर्क",
      medicalTeamNote: "मेडिकल टीम नोट",
      remarks: "टिप्पणियाँ",
      documents: "दस्तावेज़",
      download: "डाउनलोड",
      yes: "हाँ",
      no: "नहीं",
      abhaNumber: "ABHA नंबर",
      pmJayId: "PM JAY ID",
      backToList: "सूची पर वापस जाएं",
      queryCmho: "CMHO से पूछताछ करें",
      approve: "स्वीकार करें",
      reject: "अस्वीकार करें",
      forwardDm: "कलेक्टर को भेजें"
    }
  };

  useEffect(() => {
    const fetchEnquiry = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/api/enquiries/${enquiryId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
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
      setActionLoading('forwarding');
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/enquiries/${enquiryId}/forward`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Forward failed');
      setEnquiry({ ...enquiry, status: 'FORWARDED' });
      setTimeout(() => setActionLoading(''), 2000);
    } catch (err) {
      setError('Forward failed: ' + err.message);
      setActionLoading('');
    }
  };

  const handleEscalate = async () => {
    if (!escalationReason.trim()) {
      setError('Please provide an escalation reason');
      return;
    }

    try {
      setActionLoading('escalating');
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const res = await fetch(`${baseUrl}/api/enquiries/${enquiryId}/escalate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          escalation_reason: escalationReason,
          escalated_to: escalatedTo,
          escalated_by_user_id: parseInt(userId)
        })
      });
      
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Escalation failed');
      
      setEnquiry({ ...enquiry, status: 'ESCALATED' });
      setShowEscalationModal(false);
      setEscalationReason('');
      setTimeout(() => setActionLoading(''), 2000);
    } catch (err) {
      setError('Escalation failed: ' + err.message);
      setActionLoading('');
    }
  };

  const handleApproveReject = async (action) => {
    try {
      setActionLoading(action.toLowerCase());
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/enquiries/${enquiryId}/approve-reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: action.toUpperCase() })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || `${action} failed`);
      setEnquiry({ ...enquiry, status: action.toUpperCase() + 'D' });
      setTimeout(() => setActionLoading(''), 2000);
    } catch (err) {
      setError(`${action} failed: ` + err.message);
      setActionLoading('');
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
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all hover:shadow-sm">
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
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">Enquiry #{enquiryId}</h1>
            <button
              onClick={() => setLanguage(lang => (lang === 'en' ? 'hi' : 'en'))}
              className="mt-2 text-sm px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition w-fit"
            >
              {language === 'en' ? 'हिन्दी में देखें' : 'View in English'}
            </button>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ring-1 ring-inset ${statusStyles[enquiry.status] || 'bg-gray-100 text-gray-800'}`}>
            {enquiry.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <Card title={labels[language].patientInfo} icon={FiUser}>
            <Field label={labels[language].patientName} value={enquiry.patient_name} />
            
            {/* Identity Card Information */}
            {enquiry.identity_card_type && enquiry.ayushman_card_number ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {enquiry.identity_card_type === 'ABHA' ? labels[language].abhaNumber : labels[language].pmJayId}
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
              <Field label="Ayushman Card" value={enquiry.ayushman_card_number} />
            ) : null}
            
            <Field label="Aadhar Card" value={enquiry.aadhar_card_number} />
            <Field label="PAN Card" value={enquiry.pan_card_number} />
            <Field label={labels[language].medicalCondition} value={enquiry.medical_condition} />
            <Field label={labels[language].chiefComplaint} value={enquiry.chief_complaint} />
            <Field label={labels[language].generalCondition} value={enquiry.general_condition} />
            <Field label={labels[language].vitals} value={enquiry.vitals} />
            <Field label={labels[language].age} value={enquiry.age} />
            <Field label={labels[language].gender} value={enquiry.gender} />
            <Field label={labels[language].address} value={enquiry.address} />
          </Card>

          <Card title={labels[language].hospitalDistrictInfo} icon={FiHome}>
            <Field label={labels[language].destinationHospital} value={enquiry.hospital?.name} />
            <Field label={labels[language].sourceHospital} value={enquiry.sourceHospital?.name} />
            <Field label={labels[language].district} value={enquiry.district?.district_name} />
          </Card>

          <Card title={labels[language].contactPerson} icon={FiPhone}>
            <Field label={labels[language].contactName} value={enquiry.contact_name} />
            <Field label={labels[language].contactPhone} value={enquiry.contact_phone} />
            <Field label={labels[language].contactEmail} value={enquiry.contact_email} />
          </Card>

          <Card title={labels[language].referralTransport} icon={FiClipboard}>
            <Field label={labels[language].referringPhysician} value={enquiry.referring_physician_name} />
            <Field label={labels[language].designation} value={enquiry.referring_physician_designation} />
            <Field label={labels[language].referralNote} value={enquiry.referral_note} />
            <Field label={labels[language].transportationCategory} value={enquiry.transportation_category} />
            <Field label={labels[language].airTransportType} value={enquiry.air_transport_type} />
          </Card>

          <Card title={labels[language].authorityDetails} icon={FiUser}>
            <Field label={labels[language].recommendingAuthority} value={enquiry.recommending_authority_name} />
            <Field label={labels[language].designation} value={enquiry.recommending_authority_designation} />
            <Field label={labels[language].approvalAuthority} value={enquiry.approval_authority_name} />
            <Field label={labels[language].designation} value={enquiry.approval_authority_designation} />
          </Card>

          <Card title={labels[language].ambulanceNotes} icon={FiFileText}>
            <Field label={labels[language].bedAvailability} value={enquiry.bed_availability_confirmed ? labels[language].yes : labels[language].no} />
            <Field label={labels[language].alsAmbulance} value={enquiry.als_ambulance_arranged ? labels[language].yes : labels[language].no} />
            <Field label={labels[language].ambulanceReg} value={enquiry.ambulance_registration_number} />
            <Field label={labels[language].ambulanceContact} value={enquiry.ambulance_contact} />
            <Field label={labels[language].medicalTeamNote} value={enquiry.medical_team_note} />
            <Field label={labels[language].remarks} value={enquiry.remarks} />
          </Card>
        </div>

        <Card title={labels[language].documents} icon={FiFileText}>
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
                  <FiDownload className="h-5 w-5" /> {labels[language].download}
                </a>
              </div>
            )) : <p className="text-gray-500">No documents uploaded.</p>}
          </div>
        </Card>

        {/* Professional Action Panel */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiActivity className="h-6 w-6" />
              Available Actions
            </h3>
            <p className="text-blue-100 text-sm mt-1">Choose an action to proceed with this enquiry</p>
          </div>

          {/* Action Buttons */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Query CMHO - Primary Action */}
              <Link
                to={`/sdm-dashboard/enquiry-detail-page/query-to-cmho/${enquiryId}`}
                className="group relative overflow-hidden bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-4 hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-sm hover:shadow-sm transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FiClipboard className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{labels[language].queryCmho}</h4>
                    <p className="text-sm text-yellow-100">Send inquiry to CMHO</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              </Link>

              {/* Approve */}
              <button
                onClick={() => handleApproveReject('APPROVE')}
                disabled={['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'approve'}
                className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-200 shadow-sm transform ${
                  ['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'approve'
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-sm hover:-translate-y-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    ['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'approve'
                      ? 'bg-gray-400/20'
                      : 'bg-white/20'
                  }`}>
                    {actionLoading === 'approve' ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                    ) : (
                      <FiCheckCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{actionLoading === 'approve' ? 'Approving...' : 'Approve'}</h4>
                    <p className={`text-sm ${
                      ['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'approve'
                        ? 'text-gray-400'
                        : 'text-green-100'
                    }`}>
                      Accept this enquiry
                    </p>
                  </div>
                </div>
                {!(['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'approve') && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                )}
              </button>

              {/* Reject */}
              <button
                onClick={() => handleApproveReject('REJECT')}
                disabled={['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'reject'}
                className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-200 shadow-sm transform ${
                  ['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'reject'
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-sm hover:-translate-y-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    ['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'reject'
                      ? 'bg-gray-400/20'
                      : 'bg-white/20'
                  }`}>
                    {actionLoading === 'reject' ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                    ) : (
                      <FiAlertTriangle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}</h4>
                    <p className={`text-sm ${
                      ['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'reject'
                        ? 'text-gray-400'
                        : 'text-red-100'
                    }`}>
                      Decline this enquiry
                    </p>
                  </div>
                </div>
                {!(['APPROVED', 'REJECTED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'reject') && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                )}
              </button>

              {/* Forward to DM */}
              <button
                onClick={handleForward}
                disabled={['FORWARDED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'forwarding'}
                className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-200 shadow-sm transform ${
                  ['FORWARDED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'forwarding'
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 hover:shadow-sm hover:-translate-y-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    ['FORWARDED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'forwarding'
                      ? 'bg-gray-400/20'
                      : 'bg-white/20'
                  }`}>
                    {actionLoading === 'forwarding' ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                    ) : (
                      <FiPlusCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{actionLoading === 'forwarding' ? 'Forwarding...' : 'Forward to Collector'}</h4>
                    <p className={`text-sm ${
                      ['FORWARDED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'forwarding'
                        ? 'text-gray-400'
                        : 'text-purple-100'
                    }`}>
                      Send to Collector
                    </p>
                  </div>
                </div>
                {!(['FORWARDED', 'ESCALATED'].includes(enquiry.status) || actionLoading === 'forwarding') && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                )}
              </button>

              {/* Escalate Case */}
              <button
                onClick={() => setShowEscalationModal(true)}
                disabled={enquiry.status === 'ESCALATED' || actionLoading === 'escalating'}
                className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-200 shadow-sm transform ${
                  enquiry.status === 'ESCALATED' || actionLoading === 'escalating'
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-sm hover:-translate-y-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    enquiry.status === 'ESCALATED' || actionLoading === 'escalating'
                      ? 'bg-gray-400/20'
                      : 'bg-white/20'
                  }`}>
                    {actionLoading === 'escalating' ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                    ) : (
                      <FiAlertTriangle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{actionLoading === 'escalating' ? 'Escalating...' : 'Escalate Case'}</h4>
                    <p className={`text-sm ${
                      enquiry.status === 'ESCALATED' || actionLoading === 'escalating'
                        ? 'text-gray-400'
                        : 'text-orange-100'
                    }`}>
                      Escalate to higher authority
                    </p>
                  </div>
                </div>
                {!(enquiry.status === 'ESCALATED' || actionLoading === 'escalating') && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                )}
              </button>

              {/* Back to List */}
              <button
                onClick={() => navigate('/sdm-dashboard/enquiry-list-page')}
                className="group relative overflow-hidden bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl p-4 hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-sm transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FiArrowLeft className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Back to List</h4>
                    <p className="text-sm text-gray-100">Return to enquiries</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiAlertTriangle className="h-5 w-5 text-red-400" />
                  <div>
                    <h4 className="text-red-800 font-medium">Action Failed</h4>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {actionLoading && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiClock className="h-5 w-5 text-blue-400" />
                  <div>
                    <h4 className="text-blue-800 font-medium">Processing Request</h4>
                    <p className="text-blue-700 text-sm">Please wait while we process your action...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Escalation Modal */}
        {showEscalationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-sm max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiAlertTriangle className="text-orange-600 h-6 w-6" />
                <h3 className="text-xl font-semibold text-gray-800">Escalate Case</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escalate To
                  </label>
                  <select
                    value={escalatedTo}
                    onChange={(e) => setEscalatedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Collector">Collector</option>
                    <option value="Chief Medical Officer">Chief Medical Officer</option>
                    <option value="State Health Department">State Health Department</option>
                    <option value="Emergency Response Team">Emergency Response Team</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escalation Reason *
                  </label>
                  <textarea
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    placeholder="Please provide a detailed reason for escalation..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEscalationModal(false);
                    setEscalationReason('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEscalate}
                  disabled={!escalationReason.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg transition ${
                    !escalationReason.trim()
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  Escalate Case
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryDetailsPage;