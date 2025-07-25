import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaPlus, FaTrash } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

// Labels for English and Hindi
const labels = {
  en: {
    title: 'Create Enquiry',
    patientName: 'Patient Name',
    identityCardType: 'Identity Card Type',
    abhaNumber: 'ABHA Number (14 digits)',
    pmJayId: 'PM JAY ID (9 digits)',
    ayushmanCard: 'Ayushman Card Number (Optional)',
    aadharCard: 'Aadhar Card Number',
    panCard: 'PAN Card Number',
    medicalCondition: 'Medical Condition',
    hospitalId: 'Destination Hospital',
    sourceHospitalId: 'Source Hospital',
    district: 'District',
    contactName: 'Contact Name',
    contactPhone: 'Contact Phone',
    contactEmail: 'Contact Email',
    documents: 'Documents (Required)',
    addDocument: 'Add Document',
    removeDocument: 'Remove',
    fatherSpouseName: 'Father/Spouse Name',
    age: 'Age',
    gender: 'Gender',
    address: 'Address',
    chiefComplaint: 'Chief Complaint',
    generalCondition: 'General Condition',
    vitals: 'Vitals',
    referringPhysicianName: 'Referring Physician Name',
    referringPhysicianDesignation: 'Referring Physician Designation',
    referralNote: 'Referral Note',
    transportationCategory: 'Transportation Category',
    airTransportType: 'Air Transport Type',
    recommendingAuthorityName: 'Recommending Authority Name',
    recommendingAuthorityDesignation: 'Recommending Authority Designation',
    approvalAuthorityName: 'Approval Authority Name',
    approvalAuthorityDesignation: 'Approval Authority Designation',
    bedAvailabilityConfirmed: 'Bed Availability Confirmed',
    alsAmbulanceArranged: 'ALS Ambulance Arranged',
    ambulanceRegistrationNumber: 'Ambulance Registration Number',
    ambulanceContact: 'Ambulance Contact Number',
    medicalTeamNote: 'Medical Team Note',
    remarks: 'Remarks',
    escalateCase: 'Escalate Case Immediately',
    escalationReason: 'Escalation Reason',
    escalatedTo: 'Escalate To',
    submit: 'Submit Enquiry',
    next: 'Next',
    back: 'Back',
    noData: 'No data available',
    error: 'Error',
  },
  hi: {
    title: 'पूछताछ बनाएं',
    patientName: 'रोगी का नाम',
    identityCardType: 'पहचान कार्ड प्रकार',
    abhaNumber: 'ABHA नंबर (14 अंक)',
    pmJayId: 'PM JAY ID (9 अंक)',
    ayushmanCard: 'आयुष्मान कार्ड नंबर (वैकल्पिक)',
    aadharCard: 'आधार कार्ड नंबर',
    panCard: 'PAN कार्ड नंबर',
    medicalCondition: 'चिकित्सा स्थिति',
    hospitalId: 'गंतव्य अस्पताल',
    sourceHospitalId: 'स्रोत अस्पताल',
    district: 'जिला',
    contactName: 'संपर्क व्यक्ति का नाम',
    contactPhone: 'संपर्क फोन नंबर',
    contactEmail: 'संपर्क ईमेल',
    documents: 'दस्तावेज़ (आवश्यक)',
    addDocument: 'दस्तावेज़ जोड़ें',
    removeDocument: 'हटाएं',
    fatherSpouseName: 'पिता/पति/पत्नी का नाम',
    age: 'आयु',
    gender: 'लिंग',
    address: 'पता',
    chiefComplaint: 'मुख्य शिकायत',
    generalCondition: 'सामान्य स्थिति',
    vitals: 'महत्वपूर्ण संकेत',
    referringPhysicianName: 'रेफर करने वाले चिकित्सक का नाम',
    referringPhysicianDesignation: 'रेफर करने वाले चिकित्सक का पद',
    referralNote: 'रेफरल नोट',
    transportationCategory: 'परिवहन श्रेणी',
    airTransportType: 'हवाई परिवहन प्रकार',
    recommendingAuthorityName: 'अनुशंसित प्राधिकारी का नाम',
    recommendingAuthorityDesignation: 'अनुशंसित प्राधिकारी का पद',
    approvalAuthorityName: 'अनुमोदन प्राधिकारी का नाम',
    approvalAuthorityDesignation: 'अनुमोदन प्राधिकारी का पद',
    bedAvailabilityConfirmed: 'बेड उपलब्धता की पुष्टि',
    alsAmbulanceArranged: 'ALS एम्बुलेंस की व्यवस्था',
    ambulanceRegistrationNumber: 'एम्बुलेंस पंजीकरण नंबर',
    ambulanceContact: 'एम्बुलेंस संपर्क नंबर',
    medicalTeamNote: 'चिकित्सा टीम नोट',
    remarks: 'टिप्पणियाँ',
    submit: 'सबमिट करें',
    next: 'आगे',
    back: 'वापस',
    noData: 'कोई डेटा उपलब्ध नहीं',
    error: 'त्रुटि',
  },
};

// Document type options
const documentTypeOptions = [
  { value: 'AYUSHMAN_CARD', label: 'Ayushman Card' },
  { value: 'ID_PROOF', label: 'ID Proof' },
  { value: 'MEDICAL_REPORT', label: 'Medical Report' },
  { value: 'OTHER', label: 'Other' },
];

// Step labels
const steps = [
  'Patient Details',
  'Contact Information',
  'Medical Details',
  'Referral Details',
  'Transportation Details',
  'Documentation',
  'Hospital & District',
];

export default function EnquiryCreationPage() {
  const [language, setLanguage] = useState('en');
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
        setFormError(labels[language].error + ': Failed to load hospitals and districts');
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
        if (!formData.patient_name.trim()) errs.patient_name = `${labels[language].patientName} is required`;
        if (!formData.father_spouse_name.trim()) errs.father_spouse_name = `${labels[language].fatherSpouseName} is required`;
        if (!formData.age || formData.age <= 0) errs.age = `${labels[language].age} is required and must be positive`;
        if (!formData.gender) errs.gender = `${labels[language].gender} is required`;
        if (!formData.address.trim()) errs.address = `${labels[language].address} is required`;
        // Identity card validation
        if (!formData.identity_card_type) {
          errs.identity_card_type = 'Please select identity card type';
        } else if (formData.identity_card_type === 'ABHA') {
          if (!formData.ayushman_card_number) {
            errs.ayushman_card_number = 'ABHA Number is required';
          } else if (!/^\d{14}$/.test(formData.ayushman_card_number)) {
            errs.ayushman_card_number = 'ABHA Number must be exactly 14 digits';
          }
        } else if (formData.identity_card_type === 'PM_JAY') {
          if (!formData.ayushman_card_number) {
            errs.ayushman_card_number = 'PM JAY ID is required';
          } else if (!/^\d{9}$/.test(formData.ayushman_card_number)) {
            errs.ayushman_card_number = 'PM JAY ID must be exactly 9 digits';
          }
        }

        // Alternative: Aadhar + PAN validation (if no ABHA/PM JAY)
        if (!formData.identity_card_type && !formData.ayushman_card_number) {
          if (!formData.aadhar_card_number && !formData.pan_card_number) {
            errs.identity_fallback = 'Either select ABHA/PM JAY or provide both Aadhar and PAN card numbers';
          } else {
            if (formData.aadhar_card_number && !/^\d{12}$/.test(formData.aadhar_card_number)) {
              errs.aadhar_card_number = 'Aadhar number must be exactly 12 digits';
            }
            if (formData.pan_card_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_card_number)) {
              errs.pan_card_number = 'Invalid PAN format (e.g., ABCDE1234F)';
            }
          }
        }
        if (formData.aadhar_card_number && !/^\d{12}$/.test(formData.aadhar_card_number)) {
          errs.aadhar_card_number = 'Aadhar card must be 12 digits';
        }
        if (formData.pan_card_number && !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.pan_card_number)) {
          errs.pan_card_number = 'PAN card must follow format ABCDE1234F';
        }
        break;

      case 1: // Contact Information
        if (!formData.contact_name.trim()) errs.contact_name = `${labels[language].contactName} is required`;
        if (!/^\d{10}$/.test(formData.contact_phone)) errs.contact_phone = `${labels[language].contactPhone} must be 10 digits`;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
          errs.contact_email = `${labels[language].contactEmail} must be a valid email`;
        }
        break;

      case 2: // Medical Details
        if (!formData.medical_condition.trim()) errs.medical_condition = `${labels[language].medicalCondition} is required`;
        if (!formData.chief_complaint.trim()) errs.chief_complaint = `${labels[language].chiefComplaint} is required`;
        if (!formData.general_condition.trim()) errs.general_condition = `${labels[language].generalCondition} is required`;
        if (!formData.vitals) errs.vitals = `${labels[language].vitals} is required`;
        break;

      case 3: // Referral Details
        if (!formData.referring_physician_name.trim()) {
          errs.referring_physician_name = `${labels[language].referringPhysicianName} is required`;
        }
        if (!formData.referring_physician_designation.trim()) {
          errs.referring_physician_designation = `${labels[language].referringPhysicianDesignation} is required`;
        }
        if (!formData.recommending_authority_name.trim()) {
          errs.recommending_authority_name = `${labels[language].recommendingAuthorityName} is required`;
        }
        if (!formData.recommending_authority_designation.trim()) {
          errs.recommending_authority_designation = `${labels[language].recommendingAuthorityDesignation} is required`;
        }
        if (!formData.approval_authority_name.trim()) {
          errs.approval_authority_name = `${labels[language].approvalAuthorityName} is required`;
        }
        if (!formData.approval_authority_designation.trim()) {
          errs.approval_authority_designation = `${labels[language].approvalAuthorityDesignation} is required`;
        }
        break;

      case 4: // Transportation Details
        if (!formData.transportation_category) {
          errs.transportation_category = `${labels[language].transportationCategory} is required`;
        }
        if (!formData.air_transport_type) {
          errs.air_transport_type = `${labels[language].airTransportType} is required`;
        }
        if (formData.ambulance_contact && !/^\d{10,15}$/.test(formData.ambulance_contact)) {
          errs.ambulance_contact = `${labels[language].ambulanceContact} must be 10-15 digits`;
        }
        break;

      case 5: // Documentation
        if (formData.documents.every(doc => !doc.file)) {
          errs.documents = `${labels[language].documents} is required`;
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
        break;

      case 6: // Hospital & District
        if (!formData.hospital_id) errs.hospital_id = `${labels[language].hospitalId} is required`;
        if (!formData.source_hospital_id) errs.source_hospital_id = `${labels[language].sourceHospitalId} is required`;
        if (!formData.district_id) errs.district_id = `${labels[language].district} is required`;

        // Escalation validation
        if (formData.escalate_case) {
          if (!formData.escalation_reason.trim()) {
            errs.escalation_reason = `${labels[language].escalationReason} is required when escalating`;
          }
          if (!formData.escalated_to) {
            errs.escalated_to = `${labels[language].escalatedTo} is required when escalating`;
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
    if (!formData.patient_name.trim()) errs.patient_name = `${labels[language].patientName} is required`;
    if (!formData.father_spouse_name.trim()) errs.father_spouse_name = `${labels[language].fatherSpouseName} is required`;
    if (!formData.age || formData.age <= 0) errs.age = `${labels[language].age} is required and must be positive`;
    if (!formData.gender) errs.gender = `${labels[language].gender} is required`;
    if (!formData.address.trim()) errs.address = `${labels[language].address} is required`;
    // Identity card validation for final submission
    if (!formData.identity_card_type) {
      if (!formData.aadhar_card_number || !formData.pan_card_number) {
        errs.identity_fallback = 'Either select ABHA/PM JAY or provide both Aadhar and PAN card numbers';
      }
    } else if (formData.identity_card_type === 'ABHA') {
      if (!formData.ayushman_card_number) {
        errs.ayushman_card_number = 'ABHA Number is required';
      } else if (!/^\d{14}$/.test(formData.ayushman_card_number)) {
        errs.ayushman_card_number = 'ABHA Number must be exactly 14 digits';
      }
    } else if (formData.identity_card_type === 'PM_JAY') {
      if (!formData.ayushman_card_number) {
        errs.ayushman_card_number = 'PM JAY ID is required';
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

    // Step 1: Contact Information
    if (!formData.contact_name.trim()) errs.contact_name = `${labels[language].contactName} is required`;
    if (!/^\d{10}$/.test(formData.contact_phone)) errs.contact_phone = `${labels[language].contactPhone} must be 10 digits`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errs.contact_email = `${labels[language].contactEmail} must be a valid email`;
    }

    // Step 2: Medical Details
    if (!formData.medical_condition.trim()) errs.medical_condition = `${labels[language].medicalCondition} is required`;
    if (!formData.chief_complaint.trim()) errs.chief_complaint = `${labels[language].chiefComplaint} is required`;
    if (!formData.general_condition.trim()) errs.general_condition = `${labels[language].generalCondition} is required`;
    if (!formData.vitals) errs.vitals = `${labels[language].vitals} is required`;

    // Step 3: Referral Details
    if (!formData.referring_physician_name.trim()) {
      errs.referring_physician_name = `${labels[language].referringPhysicianName} is required`;
    }
    if (!formData.referring_physician_designation.trim()) {
      errs.referring_physician_designation = `${labels[language].referringPhysicianDesignation} is required`;
    }
    if (!formData.recommending_authority_name.trim()) {
      errs.recommending_authority_name = `${labels[language].recommendingAuthorityName} is required`;
    }
    if (!formData.recommending_authority_designation.trim()) {
      errs.recommending_authority_designation = `${labels[language].recommendingAuthorityDesignation} is required`;
    }
    if (!formData.approval_authority_name.trim()) {
      errs.approval_authority_name = `${labels[language].approvalAuthorityName} is required`;
    }
    if (!formData.approval_authority_designation.trim()) {
      errs.approval_authority_designation = `${labels[language].approvalAuthorityDesignation} is required`;
    }

    // Step 4: Transportation Details
    if (!formData.transportation_category) {
      errs.transportation_category = `${labels[language].transportationCategory} is required`;
    }
    if (!formData.air_transport_type) {
      errs.air_transport_type = `${labels[language].airTransportType} is required`;
    }
    if (formData.ambulance_contact && !/^\d{10,15}$/.test(formData.ambulance_contact)) {
      errs.ambulance_contact = `${labels[language].ambulanceContact} must be 10-15 digits`;
    }

    // Step 5: Documentation
    if (formData.documents.every(doc => !doc.file)) {
      errs.documents = `${labels[language].documents} is required`;
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

    // Step 6: Hospital & District
    if (!formData.hospital_id) errs.hospital_id = `${labels[language].hospitalId} is required`;
    if (!formData.source_hospital_id) errs.source_hospital_id = `${labels[language].sourceHospitalId} is required`;
    if (!formData.district_id) errs.district_id = `${labels[language].district} is required`;

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
    Object.keys(formData).forEach((key) => {
      if (key === 'documents') {
        formData.documents.forEach((doc) => {
          if (doc.file && doc.type) payload.append(doc.type, doc.file);
        });
      } else {
        if (key === 'bed_availability_confirmed' || key === 'als_ambulance_arranged') {
          payload.append(key, formData[key] ? '1' : '0');
        } else {
          payload.append(key, formData[key]);
        }
      }
    });
    const userId = localStorage.getItem('user_id') || '10';
    payload.append('submitted_by_user_id', userId);

    try {
      const res = await fetch(`${baseUrl}/api/enquiries`, {
        method: 'POST',
        body: payload,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit enquiry');

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
      });
      setStep(0);
    } catch (err) {
      console.error('Submit error:', err);
      setFormError(`${labels[language].error}: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render fields for current step
  const renderStepFields = () => {
    switch (step) {
      case 0: // Patient Details
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].patientName}</label>
              <input
                type="text"
                name="patient_name"
                value={formData.patient_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.patient_name && <p className="text-red-600 text-sm">{errors.patient_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].fatherSpouseName}</label>
              <input
                type="text"
                name="father_spouse_name"
                value={formData.father_spouse_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.father_spouse_name && <p className="text-red-600 text-sm">{errors.father_spouse_name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{labels[language].age}</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {errors.age && <p className="text-red-600 text-sm">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{labels[language].gender}</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{labels[language].noData}</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-600 text-sm">{errors.gender}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].address}</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
            </div>

            {/* Identity Card Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Identity Card Information</h3>

              {/* Identity Card Type Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{labels[language].identityCardType}</label>
                <select
                  name="identity_card_type"
                  value={formData.identity_card_type}
                  onChange={(e) => {
                    handleChange(e);
                    // Clear the ayushman card number when changing type
                    setFormData(prev => ({ ...prev, ayushman_card_number: '' }));
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Identity Card Type</option>
                  <option value="ABHA">{labels[language].abhaNumber}</option>
                  <option value="PM_JAY">{labels[language].pmJayId}</option>
                </select>
                {errors.identity_card_type && <p className="text-red-600 text-sm">{errors.identity_card_type}</p>}
              </div>

              {/* Identity Card Number Input */}
              {formData.identity_card_type && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.identity_card_type === 'ABHA' ? labels[language].abhaNumber : labels[language].pmJayId}
                  </label>
                  <input
                    type="text"
                    name="ayushman_card_number"
                    value={formData.ayushman_card_number}
                    onChange={handleChange}
                    placeholder={formData.identity_card_type === 'ABHA' ? 'Enter 14-digit ABHA Number' : 'Enter 9-digit PM JAY ID'}
                    maxLength={formData.identity_card_type === 'ABHA' ? 14 : 9}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.ayushman_card_number && <p className="text-red-600 text-sm">{errors.ayushman_card_number}</p>}
                </div>
              )}

              {/* Alternative: Aadhar + PAN */}
              {!formData.identity_card_type && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Or provide both Aadhar and PAN Card:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{labels[language].aadharCard}</label>
                      <input
                        type="text"
                        name="aadhar_card_number"
                        value={formData.aadhar_card_number}
                        onChange={handleChange}
                        placeholder="Enter 12-digit Aadhar Number"
                        maxLength={12}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.aadhar_card_number && <p className="text-red-600 text-sm">{errors.aadhar_card_number}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{labels[language].panCard}</label>
                      <input
                        type="text"
                        name="pan_card_number"
                        value={formData.pan_card_number}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          handleChange({ ...e, target: { ...e.target, value } });
                        }}
                        placeholder="e.g., ABCDE1234F"
                        maxLength={10}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.pan_card_number && <p className="text-red-600 text-sm">{errors.pan_card_number}</p>}
                    </div>
                  </div>
                  {errors.identity_fallback && <p className="text-red-600 text-sm">{errors.identity_fallback}</p>}
                </div>
              )}
            </div>
          </div>
        );
      case 1: // Contact Information
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].contactName}</label>
              <input
                type="text"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.contact_name && <p className="text-red-600 text-sm">{errors.contact_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].contactPhone}</label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.contact_phone && <p className="text-red-600 text-sm">{errors.contact_phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].contactEmail}</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.contact_email && <p className="text-red-600 text-sm">{errors.contact_email}</p>}
            </div>
          </div>
        );
      case 2: // Medical Details
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].medicalCondition}</label>
              <textarea
                name="medical_condition"
                value={formData.medical_condition}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.medical_condition && <p className="text-red-600 text-sm">{errors.medical_condition}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].chiefComplaint}</label>
              <textarea
                name="chief_complaint"
                value={formData.chief_complaint}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.chief_complaint && <p className="text-red-600 text-sm">{errors.chief_complaint}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].generalCondition}</label>
              <input
                type="text"
                name="general_condition"
                value={formData.general_condition}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.general_condition && <p className="text-red-600 text-sm">{errors.general_condition}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].vitals}</label>
              <select
                name="vitals"
                value={formData.vitals}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{labels[language].noData}</option>
                <option value="Stable">Stable</option>
                <option value="Unstable">Unstable</option>
              </select>
              {errors.vitals && <p className="text-red-600 text-sm">{errors.vitals}</p>}
            </div>
          </div>
        );
      case 3: // Referral Details
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].referringPhysicianName}</label>
              <input
                type="text"
                name="referring_physician_name"
                value={formData.referring_physician_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.referring_physician_name && <p className="text-red-600 text-sm">{errors.referring_physician_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].referringPhysicianDesignation}</label>
              <input
                type="text"
                name="referring_physician_designation"
                value={formData.referring_physician_designation}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.referring_physician_designation && <p className="text-red-600 text-sm">{errors.referring_physician_designation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].referralNote}</label>
              <textarea
                name="referral_note"
                value={formData.referral_note}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].recommendingAuthorityName}</label>
              <input
                type="text"
                name="recommending_authority_name"
                value={formData.recommending_authority_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.recommending_authority_name && <p className="text-red-600 text-sm">{errors.recommending_authority_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].recommendingAuthorityDesignation}</label>
              <input
                type="text"
                name="recommending_authority_designation"
                value={formData.recommending_authority_designation}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.recommending_authority_designation && <p className="text-red-600 text-sm">{errors.recommending_authority_designation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].approvalAuthorityName}</label>
              <input
                type="text"
                name="approval_authority_name"
                value={formData.approval_authority_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.approval_authority_name && <p className="text-red-600 text-sm">{errors.approval_authority_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].approvalAuthorityDesignation}</label>
              <input
                type="text"
                name="approval_authority_designation"
                value={formData.approval_authority_designation}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.approval_authority_designation && <p className="text-red-600 text-sm">{errors.approval_authority_designation}</p>}
            </div>
          </div>
        );
      case 4: // Transportation Details
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].transportationCategory}</label>
              <select
                name="transportation_category"
                value={formData.transportation_category}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{labels[language].noData}</option>
                <option value="Within Division">Within Division</option>
                <option value="Out of Division">Out of Division</option>
                <option value="Out of State">Out of State</option>
              </select>
              {errors.transportation_category && <p className="text-red-600 text-sm">{errors.transportation_category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].airTransportType}</label>
              <select
                name="air_transport_type"
                value={formData.air_transport_type}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{labels[language].noData}</option>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
              {errors.air_transport_type && <p className="text-red-600 text-sm">{errors.air_transport_type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].bedAvailabilityConfirmed}</label>
              <input
                type="checkbox"
                name="bed_availability_confirmed"
                checked={formData.bed_availability_confirmed}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].alsAmbulanceArranged}</label>
              <input
                type="checkbox"
                name="als_ambulance_arranged"
                checked={formData.als_ambulance_arranged}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].ambulanceRegistrationNumber}</label>
              <input
                type="text"
                name="ambulance_registration_number"
                value={formData.ambulance_registration_number}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].ambulanceContact}</label>
              <input
                type="text"
                name="ambulance_contact"
                value={formData.ambulance_contact}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.ambulance_contact && <p className="text-red-600 text-sm">{errors.ambulance_contact}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].medicalTeamNote}</label>
              <textarea
                name="medical_team_note"
                value={formData.medical_team_note}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].remarks}</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
      case 5: // Documentation
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].documents}</label>
              {formData.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center space-x-4 mt-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      name={`documentFile_${idx}`}
                      onChange={handleChange}
                      accept="image/jpeg,image/png,application/pdf"
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    {doc.file && <span className="text-sm text-gray-600">{doc.file.name}</span>}
                  </div>
                  <select
                    name={`docType_${idx}`}
                    value={doc.type}
                    onChange={handleChange}
                    className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{labels[language].noData}</option>
                    {documentTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {formData.documents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDocumentInput(idx)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title={labels[language].removeDocument}
                    >
                      <FaTrash />
                    </button>
                  )}
                  {errors[`document_${idx}`] && <p className="text-red-600 text-sm">{errors[`document_${idx}`]}</p>}
                </div>
              ))}
              {errors.documents && <p className="text-red-600 text-sm">{errors.documents}</p>}
            </div>
            <button
              type="button"
              onClick={addDocumentInput}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <FaPlus className="mr-2" />
              {labels[language].addDocument}
            </button>
          </div>
        );
      case 6: // Hospital & District
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].hospitalId}</label>
              <select
                name="hospital_id"
                value={formData.hospital_id}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{labels[language].noData}</option>
                {hospitals.map(h => (
                  <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>
                ))}
              </select>
              {errors.hospital_id && <p className="text-red-600 text-sm">{errors.hospital_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].sourceHospitalId}</label>
              <select
                name="source_hospital_id"
                value={formData.source_hospital_id}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{labels[language].noData}</option>
                {hospitals.map(h => (
                  <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>
                ))}
              </select>
              {errors.source_hospital_id && <p className="text-red-600 text-sm">{errors.source_hospital_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{labels[language].district}</label>
              <select
                name="district_id"
                value={formData.district_id}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{labels[language].noData}</option>
                {districts.map(d => (
                  <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                ))}
              </select>
              {errors.district_id && <p className="text-red-600 text-sm">{errors.district_id}</p>}
            </div>

            {/* Escalation Section */}
            <div className="border-t pt-4 mt-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Escalation Options</h4>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="escalate_case"
                    checked={formData.escalate_case}
                    onChange={handleChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">{labels[language].escalateCase}</span>
                </label>
              </div>

              {formData.escalate_case && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{labels[language].escalationReason}</label>
                    <textarea
                      name="escalation_reason"
                      value={formData.escalation_reason}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500"
                      placeholder="Describe the reason for escalation..."
                    />
                    {errors.escalation_reason && <p className="text-red-600 text-sm">{errors.escalation_reason}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{labels[language].escalatedTo}</label>
                    <select
                      name="escalated_to"
                      value={formData.escalated_to}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select authority...</option>
                      <option value="District Magistrate">District Magistrate</option>
                      <option value="Chief Medical Officer">Chief Medical Officer</option>
                      <option value="State Health Department">State Health Department</option>
                      <option value="Emergency Response Team">Emergency Response Team</option>
                      <option value="Senior Medical Authority">Senior Medical Authority</option>
                    </select>
                    {errors.escalated_to && <p className="text-red-600 text-sm">{errors.escalated_to}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto p-6 bg-gray-50">
      {/* Stepper */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center space-y-4">
        {steps.map((lab, i) => (
          <React.Fragment key={i}>
            <button
              className={`w-full text-center py-2 rounded-full transition ${i === step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              onClick={() => setStep(i)}
            >
              {lab}
            </button>
            {i < steps.length - 1 && <FaChevronDown className="text-green-500" />}
          </React.Fragment>
        ))}
      </div>

      {/* Form Panel */}
      <div className="md:col-span-2 bg-white p-8 rounded-lg shadow">
        <div className="mb-6 border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800">{labels[language].title}</h2>
        </div>
        {formError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {formError}
          </div>
        )}
        <div className="mb-4">
          <label className="mr-4">Language:</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        <form encType="multipart/form-data" className="space-y-6">
          {renderStepFields()}
          <div className="flex justify-between pt-4">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                {labels[language].back}
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  const errs = validateCurrentStep(step);
                  if (Object.keys(errs).length === 0) {
                    setStep(step + 1);
                    setErrors({});
                  } else {
                    setErrors(errs);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {labels[language].next}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : labels[language].submit}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}