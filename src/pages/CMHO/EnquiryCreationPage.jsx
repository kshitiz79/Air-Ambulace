import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaPlus, FaTrash } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';
import translations from '../../languages/index';
import PatientDetails from './components/EnquirySteps/PatientDetails';
import ContactInformation from './components/EnquirySteps/ContactInformation';
import MedicalDetails from './components/EnquirySteps/MedicalDetails';
import ReferralDetails from './components/EnquirySteps/ReferralDetails';
import TransportationLogistics from './components/EnquirySteps/TransportationLogistics';
import Documentation from './components/EnquirySteps/Documentation';
import HospitalDistrict from './components/EnquirySteps/HospitalDistrict';

const getDocumentTypeOptions = (t) => [
  { value: 'AYUSHMAN_CARD', label: t.ayushmanCard || 'Ayushman Card' },
  { value: 'ID_PROOF', label: t.idProof || 'ID Proof' },
  { value: 'MEDICAL_REPORT', label: t.medicalReport || 'Medical Report' },
  { value: 'OTHER', label: t.other || 'Other' },
];

export default function EnquiryCreationPage() {
  const { language, t } = useLanguage();
  const labels = t;
  const documentTypeOptions = getDocumentTypeOptions(t);
  
  // Step labels
  const steps = [
    labels.clinicalAssessment || 'Patient Details',
    labels.emergencyContactProfile || 'Contact Information',
    labels.medicalCondition || 'Medical Details',
    labels.referralDetails || 'Referral Details',
    labels.transportationCategory || 'Transportation Details',
    labels.documents || 'Documentation',
    labels.hospitalId || 'Hospital & District',
  ];
  const [step, setStep] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    patient_name: '',
    identity_card_type: '',
    ayushman_card_number: '',
    aadhar_card_number: '',
    pan_card_number: '',
    medical_condition: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    documents: [{ file: null, type: '' }],
    hospital_id: '',
    source_hospital_id: '',
    district_id: localStorage.getItem('district_id') || '',
    father_spouse_name: '',
    age: '',
    gender: '',
    address: '',
    chief_complaint: '',
    general_condition: '',
    vitals: '',
    referring_physician_name: '',
    referring_physician_designation: '',
    referral_note: '',
    transportation_category: '',
    air_transport_type: '',
    recommending_authority_name: '',
    recommending_authority_designation: '',
    approval_authority_name: '',
    approval_authority_designation: '',
    bed_availability_confirmed: false,
    als_ambulance_arranged: false,
    ambulance_registration_number: '',
    ambulance_contact: '',
    medical_team_note: '',
    remarks: '',
    escalate_case: false,
    escalation_reason: '',
    escalated_to: '',
    emergency_proof: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch hospitals and districts on mount
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [hRes, dRes] = await Promise.all([
          fetch(`${baseUrl}/api/hospitals`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`${baseUrl}/api/districts`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        if (!hRes.ok || !dRes.ok) throw new Error('Failed to fetch lookup data');
        const hJson = await hRes.json();
        const dJson = await dRes.json();
        setHospitals(hJson.data || hJson);
        setDistricts(dJson.data || dJson);
      } catch (err) {
        console.error('Lookup load failed:', err);
        setFormError(labels.error + ': Failed to load hospitals and districts');
      }
    };
    fetchLookups();
  }, [language]);

  // Add a new document input
  const addDocumentInput = () => {
    setFormData({
      ...formData,
      documents: [...formData.documents, { file: null, type: '' }],
    });
  };

  // Remove a document input
  const removeDocumentInput = (index) => {
    setFormData({
      ...formData,
      documents: formData.documents.filter((_, i) => i !== index),
    });
  };

  // Validate current step fields only
  const validateCurrentStep = (currentStep) => {
    const errs = {};

    switch (currentStep) {
      case 0: // Patient Details
        if (!formData.patient_name.trim()) errs.patient_name = `${labels.patientName} ${labels.required}`;
        if (!formData.father_spouse_name.trim()) errs.father_spouse_name = `${labels.fatherSpouseName} ${labels.required}`;
        if (!formData.age || formData.age <= 0) errs.age = labels.ageError;
        if (!formData.gender) errs.gender = `${labels.gender} ${labels.required}`;
        if (!formData.address.trim()) errs.address = `${labels.address} ${labels.required}`;
        // Identity card validation
        if (formData.air_transport_type === 'Paid') {
          if (!formData.aadhar_card_number) {
            errs.aadhar_card_number = `${labels.aadharCard} ${labels.required}`;
          } else if (!/^\d{12}$/.test(formData.aadhar_card_number)) {
            errs.aadhar_card_number = labels.aadharMustBe12Digits || 'Aadhar number must be exactly 12 digits';
          }
        } else {
          // Free service validation
          if (!formData.identity_card_type) {
            errs.identity_card_type = labels.pleaseSelectIdentityType;
          } else if (formData.identity_card_type === 'ABHA') {
            if (!formData.ayushman_card_number) {
              errs.ayushman_card_number = `${labels.abhaNumber} ${labels.required}`;
            } else if (!/^\d{14}$/.test(formData.ayushman_card_number)) {
              errs.ayushman_card_number = labels.idMustBe14Digits || 'ABHA Number must be exactly 14 digits';
            }
          } else if (formData.identity_card_type === 'PM_JAY') {
            if (!formData.ayushman_card_number) {
              errs.ayushman_card_number = `${labels.pmJayId} ${labels.required}`;
            } else if (!/^\d{9}$/.test(formData.ayushman_card_number)) {
              errs.ayushman_card_number = labels.idMustBe9Digits || 'PM JAY ID must be exactly 9 digits';
            }
          }

          // Alternative: Aadhar + PAN validation (if no ABHA/PM JAY)
          if (!formData.identity_card_type && !formData.ayushman_card_number) {
            if (!formData.aadhar_card_number && !formData.pan_card_number) {
              errs.identity_fallback = labels.identityFallback;
            } else {
              if (formData.aadhar_card_number && !/^\d{12}$/.test(formData.aadhar_card_number)) {
                errs.aadhar_card_number = labels.aadharMustBe12Digits || 'Aadhar number must be exactly 12 digits';
              }
              if (formData.pan_card_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_card_number)) {
                errs.pan_card_number = labels.invalidPanFormat || 'Invalid PAN format';
              }
            }
          }
        }

        if (formData.pan_card_number && !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.pan_card_number)) {
          errs.pan_card_number = labels.panFormatHint || 'PAN card must follow format ABCDE1234F';
        }
        if (!formData.air_transport_type) {
          errs.air_transport_type = `${labels.airTransportType} is required`;
        }
        break;

      case 1: // Contact Information
        if (!formData.contact_name.trim()) errs.contact_name = `${labels.contactName} ${labels.requiredField}`;
        if (!/^[6-9]\d{9}$/.test(formData.contact_phone)) errs.contact_phone = labels.contactPhone10Digits || 'Invalid 10-digit phone number';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
          errs.contact_email = labels.validEmailRequired || 'Valid Email is required';
        }
        break;

      case 2: // Medical Details
        if (!formData.medical_condition.trim()) errs.medical_condition = `${labels.medicalCondition} ${labels.requiredField}`;
        if (formData.air_transport_type !== 'Paid') {
          if (!formData.chief_complaint.trim()) errs.chief_complaint = labels.chiefComplaintRequired || 'Chief Complaint is required';
          if (!formData.general_condition.trim()) errs.general_condition = labels.generalConditionRequired || 'General Condition is required';
        }
        if (!formData.vitals) errs.vitals = labels.vitalsRequired || 'Vitals is required';
        break;

      case 3: // Referral Details — skip entirely for Paid
        if (formData.air_transport_type === 'Paid') break;
        if (!formData.referring_physician_name.trim()) {
          errs.referring_physician_name = `${labels.referringPhysicianName} ${labels.requiredField}`;
        }
        if (!formData.referring_physician_designation.trim()) {
          errs.referring_physician_designation = `${labels.referringPhysicianDesignation} ${labels.requiredField}`;
        }
        if (!formData.recommending_authority_name.trim()) {
          errs.recommending_authority_name = `${labels.recommendingAuthorityName} ${labels.requiredField}`;
        }
        if (!formData.recommending_authority_designation.trim()) {
          errs.recommending_authority_designation = `${labels.recommendingAuthorityDesignation} ${labels.requiredField}`;
        }
        if (!formData.approval_authority_name.trim()) {
          errs.approval_authority_name = `${labels.approvalAuthorityName} ${labels.requiredField}`;
        }
        if (!formData.approval_authority_designation.trim()) {
          errs.approval_authority_designation = `${labels.approvalAuthorityDesignation} ${labels.requiredField}`;
        }
        break;

      case 4: // Transportation Details
        if (formData.ambulance_contact && !/^[6-9]\d{9,14}$/.test(formData.ambulance_contact)) {
          errs.ambulance_contact = labels.contactPhone10Digits || 'Invalid contact number';
        }
        break;

      case 5: // Documentation — skip for Paid
        if (formData.air_transport_type === 'Paid') break;
        if (formData.documents.every(doc => !doc.file)) {
          errs.documents = `${labels.documents} ${labels.requiredField}`;
        } else {
          formData.documents.forEach((doc, idx) => {
            if (doc.file && !doc.type) {
              errs[`document_${idx}_type`] = labels.documentTypeRequired || 'Document type is required for each uploaded file';
            }
            if (doc.file && !['image/jpeg', 'image/png', 'application/pdf'].includes(doc.file.type)) {
              errs[`document_${idx}`] = labels.allowedFileTypes || 'Only JPEG, PNG, or PDF files are allowed';
            }
          });
        }
        break;

      case 6: // Hospital & District
        if (!formData.hospital_id) errs.hospital_id = `${labels.hospitalId} is required`;
        if (!formData.source_hospital_id) errs.source_hospital_id = `${labels.sourceHospitalId} is required`;
        if (!formData.district_id) errs.district_id = `${labels.district} is required`;

        // Escalation validation
        if (formData.escalate_case) {
          if (!formData.escalation_reason.trim()) {
            errs.escalation_reason = `${labels.escalationReason} is required when escalating`;
          }
          if (!formData.escalated_to) {
            errs.escalated_to = `${labels.escalatedTo} is required when escalating`;
          }
        }
        break;

      default:
        break;
    }

    return errs;
  };

  // Validate all fields for final submission
  const validateForm = () => {
    const errs = {};
    // Step 0: Patient Details
    if (!formData.patient_name.trim()) errs.patient_name = `${labels.patientName} ${labels.required}`;
    if (!formData.father_spouse_name.trim()) errs.father_spouse_name = `${labels.fatherSpouseName} ${labels.required}`;
    if (!formData.age || formData.age <= 0) errs.age = labels.ageError;
    if (!formData.gender) errs.gender = `${labels.gender} ${labels.required}`;
    if (!formData.address.trim()) errs.address = `${labels.address} ${labels.required}`;
    // Identity card validation for final submission
    if (formData.air_transport_type === 'Paid') {
      if (!formData.aadhar_card_number) {
        errs.aadhar_card_number = 'Aadhar card is required';
      } else if (!/^\d{12}$/.test(formData.aadhar_card_number)) {
        errs.aadhar_card_number = 'Aadhar card must be 12 digits';
      }
    } else {
      if (!formData.identity_card_type) {
        if (!formData.aadhar_card_number || !formData.pan_card_number) {
          errs.identity_fallback = labels.identityFallback;
        }
      } else if (formData.identity_card_type === 'ABHA') {
        if (!formData.ayushman_card_number) {
          errs.ayushman_card_number = `${labels.abhaNumber} ${labels.required}`;
        } else if (!/^\d{14}$/.test(formData.ayushman_card_number)) {
          errs.ayushman_card_number = 'ABHA Number must be exactly 14 digits';
        }
      } else if (formData.identity_card_type === 'PM_JAY') {
        if (!formData.ayushman_card_number) {
          errs.ayushman_card_number = `${labels.pmJayId} ${labels.required}`;
        } else if (!/^\d{9}$/.test(formData.ayushman_card_number)) {
          errs.ayushman_card_number = 'PM JAY ID must be exactly 9 digits';
        }
      }

      // Validate Aadhar and PAN if provided as alternative
      if (formData.aadhar_card_number && !/^\d{12}$/.test(formData.aadhar_card_number)) {
        errs.aadhar_card_number = 'Aadhar card must be 12 digits';
      }
      if (formData.pan_card_number && !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.pan_card_number)) {
        errs.pan_card_number = 'PAN card must follow format ABCDE1234F';
      }
    }

    // Step 1: Contact Information
    if (!formData.contact_name.trim()) errs.contact_name = `${labels.contactName} is required`;
    if (!/^[6-9]\d{9}$/.test(formData.contact_phone)) errs.contact_phone = `${labels.contactPhone} must be a valid 10-digit number`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errs.contact_email = `${labels.contactEmail} must be a valid email`;
    }

    // Step 2: Medical Details
    if (!formData.medical_condition.trim()) errs.medical_condition = `${labels.medicalCondition} is required`;
    if (formData.air_transport_type !== 'Paid') {
      if (!formData.chief_complaint.trim()) errs.chief_complaint = `${labels.chiefComplaint} is required`;
      if (!formData.general_condition.trim()) errs.general_condition = `${labels.generalCondition} is required`;
    }
    if (!formData.vitals) errs.vitals = `${labels.vitals} is required`;

    // Step 3: Referral Details — skip for Paid
    if (formData.air_transport_type !== 'Paid') {
      if (!formData.referring_physician_name.trim()) {
        errs.referring_physician_name = `${labels.referringPhysicianName} is required`;
      }
      if (!formData.referring_physician_designation.trim()) {
        errs.referring_physician_designation = `${labels.referringPhysicianDesignation} is required`;
      }
      if (!formData.recommending_authority_name.trim()) {
        errs.recommending_authority_name = `${labels.recommendingAuthorityName} is required`;
      }
      if (!formData.recommending_authority_designation.trim()) {
        errs.recommending_authority_designation = `${labels.recommendingAuthorityDesignation} is required`;
      }
      if (!formData.approval_authority_name.trim()) {
        errs.approval_authority_name = `${labels.approvalAuthorityName} is required`;
      }
      if (!formData.approval_authority_designation.trim()) {
        errs.approval_authority_designation = `${labels.approvalAuthorityDesignation} is required`;
      }
    }

    // Step 4: Transportation Details — skip for Paid
    if (formData.air_transport_type !== 'Paid') {
      if (!formData.transportation_category) {
        errs.transportation_category = `${labels.transportationCategory} is required`;
      }
      if (formData.ambulance_contact && !/^[6-9]\d{9,14}$/.test(formData.ambulance_contact)) {
        errs.ambulance_contact = `${labels.ambulanceContact} must be a valid 10-15 digit number`;
      }
    }
    if (!formData.air_transport_type) {
      errs.air_transport_type = `${labels.airTransportType} is required`;
    }

    // Step 5: Documentation — skip for Paid
    if (formData.air_transport_type !== 'Paid') {
      if (formData.documents.every(doc => !doc.file)) {
        errs.documents = `${labels.documents} is required`;
      } else {
        formData.documents.forEach((doc, idx) => {
          if (doc.file && !doc.type) {
            errs[`document_${idx}_type`] = 'Document type is required for each uploaded file';
          }
          if (doc.file && !['image/jpeg', 'image/png', 'application/pdf'].includes(doc.file.type)) {
            errs[`document_${idx}`] = 'Only JPEG, PNG, or PDF files are allowed';
          }
        });
      }
    }

    // Step 6: Hospital & District
    if (!formData.hospital_id) errs.hospital_id = `${labels.hospitalId} is required`;
    if (!formData.source_hospital_id) errs.source_hospital_id = `${labels.sourceHospitalId} is required`;
    if (!formData.district_id) errs.district_id = `${labels.district} is required`;

    return errs;
  };
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name.startsWith('documentFile_')) {
      const idx = Number(name.split('_')[1]);
      const docs = [...formData.documents];
      docs[idx].file = files[0] || null;
      setFormData({ ...formData, documents: docs });
    } else if (name.startsWith('docType_')) {
      const idx = Number(name.split('_')[1]);
      const docs = [...formData.documents];
      docs[idx].type = value;
      setFormData({ ...formData, documents: docs });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'MULTI_UPDATE_REFERRAL') {
      setFormData({ ...formData, ...value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({});
    setFormError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    setFormError('');

    const payload = new FormData();
    // ENUM fields that must not be sent as empty string (DB will reject '')
    const enumFields = ['identity_card_type', 'transportation_category', 'gender', 'vitals', 'air_transport_type'];

    Object.keys(formData).forEach((key) => {
      // Skip file fields as they are handled separately or specially
      if (key === 'documents' || key === 'emergency_proof') {
        return;
      }
      
      if (key === 'bed_availability_confirmed' || key === 'als_ambulance_arranged') {
        payload.append(key, formData[key] ? '1' : '0');
      } else if (enumFields.includes(key) && !formData[key]) {
        // Don't append empty ENUM values — backend will treat missing as null
        return;
      } else {
        payload.append(key, formData[key]);
      }
    });

    // Handle documents nested array
    if (formData.documents) {
      formData.documents.forEach((doc) => {
        if (doc.file && doc.type) payload.append(doc.type, doc.file);
      });
    }
    // IMPORTANT: Use 'userId' (camelCase) to match what's stored in Login.jsx
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }
    
    payload.append('submitted_by_user_id', userId);

    if (formData.emergency_proof) {
      payload.append('EMERGENCY_PROOF', formData.emergency_proof);
    }

    try {
      const res = await fetch(`${baseUrl}/api/enquiries`, {
        method: 'POST',
        body: payload,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'x-language': language,  // tells backend which language the user typed in
        },
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server error: System returned an invalid response format.');
      }

      if (!res.ok) {
        const errMsg = data.error || data.message || 'Failed to submit enquiry';
        throw new Error(errMsg);
      }

      // If escalation is requested, create escalation
      if (formData.escalate_case) {
        try {
          const escalationRes = await fetch(`${baseUrl}/api/enquiries/${data.data.enquiry_id}/escalate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              escalation_reason: formData.escalation_reason,
              escalated_to: formData.escalated_to,
              escalated_by_user_id: userId,
            }),
          });

          const escalationData = await escalationRes.json();
          if (!escalationRes.ok) throw new Error(escalationData.message || 'Failed to escalate case');

          alert(`Enquiry #${data.data.enquiry_id} (${data.data.enquiry_code}) created and escalated! Escalation ID: ${escalationData.data.escalation_id}`);
        } catch (escalationErr) {
          console.error('Escalation error:', escalationErr);
          alert(`Enquiry #${data.data.enquiry_id} (${data.data.enquiry_code}) created but escalation failed: ${escalationErr.message}`);
        }
      } else {
        alert(`Enquiry #${data.data.enquiry_id} (${data.data.enquiry_code}) created! Documents: ${data.data.documents?.length || 0}`);
      }

      setFormData({
        patient_name: '',
        identity_card_type: '',
        ayushman_card_number: '',
        aadhar_card_number: '',
        pan_card_number: '',
        medical_condition: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        documents: [{ file: null, type: '' }],
        hospital_id: '',
        source_hospital_id: '',
        district_id: localStorage.getItem('district_id') || '',
        father_spouse_name: '',
        age: '',
        gender: '',
        address: '',
        chief_complaint: '',
        general_condition: '',
        vitals: '',
        referring_physician_name: '',
        referring_physician_designation: '',
        referral_note: '',
        transportation_category: '',
        air_transport_type: '',
        recommending_authority_name: '',
        recommending_authority_designation: '',
        approval_authority_name: '',
        approval_authority_designation: '',
        bed_availability_confirmed: false,
        als_ambulance_arranged: false,
        ambulance_registration_number: '',
        ambulance_contact: '',
        medical_team_note: '',
        remarks: '',
        escalate_case: false,
        escalation_reason: '',
        escalated_to: '',
        emergency_proof: null,
      });
      setStep(0);
    } catch (err) {
      console.error('Submit error:', err);
      setFormError(`${labels.error}: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render fields for current step
  const renderStepFields = () => {
    const commonProps = { formData, handleChange, language, labels: translations, errors };
    
    switch (step) {
      case 0: return <PatientDetails {...commonProps} />;
      case 1: return <ContactInformation {...commonProps} />;
      case 2: return <MedicalDetails {...commonProps} />;
      case 3: return <ReferralDetails {...commonProps} />;
      case 4: return <TransportationLogistics {...commonProps} />;
      case 5: return (
        <Documentation 
          {...commonProps} 
          documentTypeOptions={documentTypeOptions}
          addDocumentInput={addDocumentInput}
          removeDocumentInput={removeDocumentInput}
        />
      );
      case 6: return <HospitalDistrict {...commonProps} hospitals={hospitals} districts={districts} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="hidden md:flex w-8 h-8 bg-blue-600 rounded-2xl items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100">
              {localStorage.getItem('full_name')?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                {labels.enquiryPortal}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Horizontal Stepper */}
      <div className="mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex items-center justify-between min-w-[800px] px-2">
          {steps.map((lab, i) => {
            const isPaid = formData.air_transport_type === 'Paid';
            const skippedForPaid = isPaid && (i === 3 || i === 4 || i === 5);
            const isActive = i === step;
            const isDone = i < step && !skippedForPaid;
            return (
              <React.Fragment key={i}>
                <div
                  className={`flex flex-col items-center group transition-all duration-300 ${
                    skippedForPaid ? 'opacity-30 cursor-not-allowed' : isActive || isDone ? 'opacity-100 cursor-pointer' : 'opacity-60 cursor-default'
                  }`}
                  onClick={() => !skippedForPaid && i < step ? setStep(i) : null}
                  title={skippedForPaid ? 'Not required for Paid Seva' : ''}
                >
                  <div className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-500 relative z-10
                    ${skippedForPaid
                      ? 'bg-gray-200 text-gray-400 border border-dashed border-gray-300 line-through'
                      : isActive
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-50 scale-105'
                        : isDone
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'bg-white text-gray-500 border border-dashed border-gray-300'}
                  `}>
                    {skippedForPaid ? '—' : isDone ? '✓' : i + 1}
                  </div>
                  <span className={`
                    mt-1 text-[7px] font-black uppercase tracking-widest text-center max-w-[70px] transition-colors
                    ${skippedForPaid ? 'text-gray-300 line-through' : isActive ? 'text-blue-700' : isDone ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {lab}
                  </span>
                  {skippedForPaid && (
                    <span className="text-[6px] text-gray-300 uppercase font-bold mt-0.5">N/A</span>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-[1px] mx-1 rounded-full transition-all duration-700 ${
                    skippedForPaid || (isPaid && i >= 2 && i <= 4) ? 'bg-gray-100' : i < step ? 'bg-green-400' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg shadow-gray-200/40 border border-gray-100 overflow-hidden">
        {/* Form Error Banner */}
        {formError && (
          <div className="p-4 bg-red-600 border-b border-red-700 flex items-center justify-center text-white sticky top-0 z-[60] shadow-2xl animate-pulse">
            <span className="mr-3 text-xl">⚠️</span>
            <div className="text-center">
              <p className="text-[12px] font-black uppercase tracking-[0.2em]">{formError}</p>
              <p className="text-[9px] font-bold opacity-80 uppercase mt-0.5 tracking-widest">Please correct the highlighted fields below to proceed</p>
            </div>
          </div>
        )}

        <div className="p-3 md:p-6">
          <form encType="multipart/form-data">
            <div className="transition-all duration-500 ease-in-out transform">
              {renderStepFields()}
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    // Skip steps 3 (Referral), 4 (Transportation), 5 (Docs) for Paid seva
                    const prevStep = formData.air_transport_type === 'Paid' && step === 6 ? 2
                      : formData.air_transport_type === 'Paid' && step === 5 ? 2
                      : formData.air_transport_type === 'Paid' && step === 4 ? 2
                      : step - 1;
                    setStep(prevStep);
                  }}
                  className="flex items-center px-4 py-2 bg-gray-50 text-gray-500 font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-all border border-gray-100 group"
                >
                  <span className="mr-1 group-hover:-translate-x-1 transition-transform">←</span>
                  {labels.back}
                </button>
              ) : (
                <div />
              )}
              
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    const errs = validateCurrentStep(step);
                    if (Object.keys(errs).length === 0) {
                      // Skip steps 3 (Referral), 4 (Transportation), 5 (Docs) for Paid seva
                      const nextStep = formData.air_transport_type === 'Paid' && step === 2 ? 6
                        : formData.air_transport_type === 'Paid' && step === 3 ? 6
                        : formData.air_transport_type === 'Paid' && step === 4 ? 6
                        : step + 1;
                      setStep(nextStep);
                      setErrors({});
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setErrors(errs);
                      setFormError(labels.pleaseFillAll);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`flex items-center px-6 py-2 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all group shadow-md ${
                    Object.keys(errors).length > 0 
                      ? 'bg-red-500 text-white shadow-red-100' 
                      : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {labels.next}
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-green-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-green-700 shadow-md shadow-green-100 transition-all disabled:opacity-50 flex items-center leading-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {labels.processing || 'Processing'}
                    </>
                  ) : (
                    labels.submit
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Decorative footer */}
      
    </div>
  );
}