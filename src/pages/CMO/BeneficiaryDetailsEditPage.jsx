import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaSave, FaTimes, FaArrowLeft, FaUser, FaHospital, FaPhone,
  FaStethoscope, FaAmbulance, FaFileAlt, FaIdCard, FaDownload, FaTrash, FaPlus
} from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

// Comprehensive labels for all fields
const labels = {
  en: {
    title: 'Edit Beneficiary Details',
    backToList: 'Back to List',
    save: 'Save Changes',
    cancel: 'Cancel',
    loading: 'Loading beneficiary details...',
    saving: 'Saving changes...',
    error: 'Error: ',
    updateSuccess: 'Beneficiary updated successfully!',
    updateError: 'Failed to update beneficiary: ',
    toggleLang: 'हिन्दी',

    // Personal Information
    personalInfo: 'Personal Information',
    enquiryId: 'Enquiry ID',
    enquiryCode: 'Enquiry Code',
    patientName: 'Patient Name',
    fatherSpouseName: 'Father/Spouse Name',
    age: 'Age',
    gender: 'Gender',
    address: 'Address',
    identityCardType: 'Identity Card Type',
    abhaNumber: 'ABHA Number (14 digits)',
    pmJayId: 'PM JAY ID (9 digits)',
    ayushmanCard: 'Ayushman Card Number',
    aadharCard: 'Aadhar Card Number',
    panCard: 'PAN Card Number',

    // Contact Information
    contactInfo: 'Contact Information',
    contactName: 'Contact Person Name',
    contactPhone: 'Contact Phone',
    contactEmail: 'Contact Email',

    // Medical Information
    medicalInfo: 'Medical Information',
    medicalCondition: 'Medical Condition',
    chiefComplaint: 'Chief Complaint',
    generalCondition: 'General Condition',
    vitals: 'Vitals',

    // Hospital Information
    hospitalInfo: 'Hospital Information',
    destinationHospital: 'Destination Hospital',
    sourceHospital: 'Source Hospital',
    district: 'District',

    // Options
    noData: 'Select...',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    stable: 'Stable',
    unstable: 'Unstable',
  }
};//

const documentTypeOptions = [
  { value: 'AYUSHMAN_CARD', label: 'Ayushman Card' },
  { value: 'ID_PROOF', label: 'ID Proof' },
  { value: 'MEDICAL_REPORT', label: 'Medical Report' },
  { value: 'OTHER', label: 'Other' },
];

const BeneficiaryDetailsEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic Info
    enquiry_id: id || '',
    enquiry_code: '',
    patient_name: '',
    father_spouse_name: '',
    age: '',
    gender: '',
    address: '',

    // Identity Cards
    identity_card_type: '',
    ayushman_card_number: '',
    aadhar_card_number: '',
    pan_card_number: '',

    // Contact Info
    contact_name: '',
    contact_phone: '',
    contact_email: '',

    // Medical Info
    medical_condition: '',
    chief_complaint: '',
    general_condition: '',
    vitals: '',

    // Hospital Info
    hospital_id: '',
    source_hospital_id: '',
    district_id: localStorage.getItem('district_id') || '',

    // Referral Info
    referring_physician_name: '',
    referring_physician_designation: '',
    referral_note: '',

    // Transportation Info
    transportation_category: '',
    air_transport_type: '',
    bed_availability_confirmed: false,
    als_ambulance_arranged: false,
    ambulance_registration_number: '',
    ambulance_contact: '',

    // Authority Info
    recommending_authority_name: '',
    recommending_authority_designation: '',
    approval_authority_name: '',
    approval_authority_designation: '',

    // Additional Info
    medical_team_note: '',
    remarks: '',

    // Status & Timestamps
    status: '',
    created_at: '',
    updated_at: '',

    // Documents
    documents: [],
    existingDocuments: [],
  });

  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [errors, setErrors] = useState({});
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [enquiryRes, hRes, dRes] = await Promise.all([
          fetch(`${baseUrl}/api/enquiries/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`${baseUrl}/api/hospitals`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          fetch(`${baseUrl}/api/districts`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);

        if (!enquiryRes.ok || !hRes.ok || !dRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [enquiryData, hData, dData] = await Promise.all([
          enquiryRes.json(),
          hRes.json(),
          dRes.json(),
        ]);

        if (!enquiryData.success) {
          throw new Error(enquiryData.message || 'Enquiry not found');
        }

        const enquiry = enquiryData.data;

        // Map all fields from the enquiry data to form data
        setFormData({
          // Basic Info
          enquiry_id: enquiry.enquiry_id?.toString() || '',
          enquiry_code: enquiry.enquiry_code || '',
          patient_name: enquiry.patient_name || '',
          father_spouse_name: enquiry.father_spouse_name || '',
          age: enquiry.age?.toString() || '',
          gender: enquiry.gender || '',
          address: enquiry.address || '',

          // Identity Cards
          identity_card_type: enquiry.identity_card_type || '',
          ayushman_card_number: enquiry.ayushman_card_number || '',
          aadhar_card_number: enquiry.aadhar_card_number || '',
          pan_card_number: enquiry.pan_card_number || '',

          // Contact Info
          contact_name: enquiry.contact_name || '',
          contact_phone: enquiry.contact_phone || '',
          contact_email: enquiry.contact_email || '',

          // Medical Info
          medical_condition: enquiry.medical_condition || '',
          chief_complaint: enquiry.chief_complaint || '',
          general_condition: enquiry.general_condition || '',
          vitals: enquiry.vitals || '',

          // Hospital Info
          hospital_id: enquiry.hospital_id?.toString() || '',
          source_hospital_id: enquiry.source_hospital_id?.toString() || '',
          district_id: enquiry.district_id?.toString() || '',

          // Referral Info
          referring_physician_name: enquiry.referring_physician_name || '',
          referring_physician_designation: enquiry.referring_physician_designation || '',
          referral_note: enquiry.referral_note || '',

          // Transportation Info
          transportation_category: enquiry.transportation_category || '',
          air_transport_type: enquiry.air_transport_type || '',
          bed_availability_confirmed: enquiry.bed_availability_confirmed || false,
          als_ambulance_arranged: enquiry.als_ambulance_arranged || false,
          ambulance_registration_number: enquiry.ambulance_registration_number || '',
          ambulance_contact: enquiry.ambulance_contact || '',

          // Authority Info
          recommending_authority_name: enquiry.recommending_authority_name || '',
          recommending_authority_designation: enquiry.recommending_authority_designation || '',
          approval_authority_name: enquiry.approval_authority_name || '',
          approval_authority_designation: enquiry.approval_authority_designation || '',

          // Additional Info
          medical_team_note: enquiry.medical_team_note || '',
          remarks: enquiry.remarks || '',

          // Status & Timestamps
          status: enquiry.status || '',
          created_at: enquiry.created_at || '',
          updated_at: enquiry.updated_at || '',

          // Documents
          documents: [],
          existingDocuments: enquiry.documents || [],
        });

        setHospitals(hData.data || hData);
        setDistricts(dData.data || dData);
        setError('');
      } catch (err) {
        setError(labels[language].error + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, language]);
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (name === 'documents') {
      const fileArr = Array.from(files).map(file => ({ file, type: '' }));
      setFormData({ ...formData, documents: fileArr });
    } else if (name.startsWith('documentType_')) {
      const idx = Number(name.split('_')[1]);
      const updatedDocs = [...formData.documents];
      updatedDocs[idx].type = value;
      setFormData({ ...formData, documents: updatedDocs });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      // Debug logging for district changes
      if (name === 'district_id') {
        console.log('District changed from', formData.district_id, 'to', value);
        const selectedDistrict = districts.find(d => d.district_id.toString() === value);
        console.log('Selected district:', selectedDistrict);
      }
      setFormData({ ...formData, [name]: value });
    }
    setErrors({});
    setSuccess('');
  };

  // Remove existing document
  const handleRemoveDocument = (index) => {
    const updatedDocs = formData.existingDocuments.filter((_, i) => i !== index);
    setFormData({ ...formData, existingDocuments: updatedDocs });
  };

  // Download document
  const handleDownload = (filePath, fileName) => {
    const link = document.createElement('a');
    link.href = `${baseUrl}${filePath}`;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form validation
  const validateForm = () => {
    const errs = {};

    // Basic validation for required fields
    if (!formData.patient_name.trim()) errs.patient_name = `${labels[language].patientName} is required`;
    if (!formData.father_spouse_name.trim()) errs.father_spouse_name = `${labels[language].fatherSpouseName} is required`;
    if (!formData.age || formData.age <= 0) errs.age = `${labels[language].age} is required and must be positive`;
    if (!formData.gender) errs.gender = `${labels[language].gender} is required`;
    if (!formData.address.trim()) errs.address = `${labels[language].address} is required`;

    // Identity card validation
    if (!formData.identity_card_type) {
      if (!formData.aadhar_card_number || !formData.pan_card_number) {
        errs.identity = 'Either select ABHA/PM JAY or provide both Aadhar and PAN card numbers';
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
      errs.aadhar_card_number = 'Aadhar Card Number must be 12 digits';
    }
    if (formData.pan_card_number && !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.pan_card_number)) {
      errs.pan_card_number = 'PAN Card Number format must be ABCDE1234F';
    }

    // Contact validation
    if (!formData.contact_name.trim()) errs.contact_name = `${labels[language].contactName} is required`;
    if (!/^\d{10}$/.test(formData.contact_phone)) errs.contact_phone = 'Contact Phone must be 10 digits';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) errs.contact_email = 'Valid email required';

    // Medical validation
    if (!formData.medical_condition.trim()) errs.medical_condition = `${labels[language].medicalCondition} is required`;
    if (!formData.chief_complaint.trim()) errs.chief_complaint = `${labels[language].chiefComplaint} is required`;
    if (!formData.general_condition.trim()) errs.general_condition = `${labels[language].generalCondition} is required`;
    if (!formData.vitals) errs.vitals = `${labels[language].vitals} is required`;

    // Hospital validation
    if (!formData.hospital_id) errs.hospital_id = `${labels[language].destinationHospital} is required`;
    if (!formData.source_hospital_id) errs.source_hospital_id = `${labels[language].sourceHospital} is required`;
    if (!formData.district_id) errs.district_id = `${labels[language].district} is required`;

    return errs;
  };  // Handl

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const payload = new FormData();

    // Add all form fields to payload
    payload.append('patient_name', formData.patient_name);
    payload.append('father_spouse_name', formData.father_spouse_name);
    payload.append('age', formData.age);
    payload.append('gender', formData.gender);
    payload.append('address', formData.address);
    payload.append('identity_card_type', formData.identity_card_type);
    payload.append('ayushman_card_number', formData.ayushman_card_number);
    payload.append('aadhar_card_number', formData.aadhar_card_number);
    payload.append('pan_card_number', formData.pan_card_number);
    payload.append('contact_name', formData.contact_name);
    payload.append('contact_phone', formData.contact_phone);
    payload.append('contact_email', formData.contact_email);
    payload.append('medical_condition', formData.medical_condition);
    payload.append('chief_complaint', formData.chief_complaint);
    payload.append('general_condition', formData.general_condition);
    payload.append('vitals', formData.vitals);
    payload.append('hospital_id', formData.hospital_id);
    payload.append('source_hospital_id', formData.source_hospital_id);
    payload.append('district_id', formData.district_id);
    payload.append('referring_physician_name', formData.referring_physician_name);
    payload.append('referring_physician_designation', formData.referring_physician_designation);
    payload.append('referral_note', formData.referral_note);
    payload.append('transportation_category', formData.transportation_category);
    payload.append('air_transport_type', formData.air_transport_type);
    payload.append('bed_availability_confirmed', formData.bed_availability_confirmed ? '1' : '0');
    payload.append('als_ambulance_arranged', formData.als_ambulance_arranged ? '1' : '0');
    payload.append('ambulance_registration_number', formData.ambulance_registration_number);
    payload.append('ambulance_contact', formData.ambulance_contact);
    payload.append('recommending_authority_name', formData.recommending_authority_name);
    payload.append('recommending_authority_designation', formData.recommending_authority_designation);
    payload.append('approval_authority_name', formData.approval_authority_name);
    payload.append('approval_authority_designation', formData.approval_authority_designation);
    payload.append('medical_team_note', formData.medical_team_note);
    payload.append('remarks', formData.remarks);

    // Add new documents
    formData.documents.forEach(doc => {
      if (doc.file && doc.type) {
        payload.append(doc.type, doc.file);
      }
    });

    try {
      console.log('Submitting update with district_id:', formData.district_id);
      console.log('Full form data:', formData);

      const res = await fetch(`${baseUrl}/api/enquiries/${formData.enquiry_id}`, {
        method: 'PATCH',
        body: payload,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();

      console.log('Update response:', data);

      if (!res.ok) throw new Error(data.message || 'Failed to update enquiry');

      setSuccess(labels[language].updateSuccess);
      setTimeout(() => {
        navigate('/cmo-dashboard');
      }, 2000);
    } catch (err) {
      setError(labels[language].updateError + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }; if
    (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">{labels[language].loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">

              <div>
                <h1 className="text-2xl font-bold text-gray-800">{labels[language].title}</h1>
                <p className="text-sm text-gray-600">
                  {labels[language].enquiryCode}: {formData.enquiry_code || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLanguage(lang => (lang === 'en' ? 'hi' : 'en'))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                {labels[language].toggleLang}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                {labels[language].personalInfo}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].enquiryId}
                </label>
                <input
                  type="text"
                  value={formData.enquiry_id}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].patientName} *
                </label>
                <input
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.patient_name && <p className="text-red-600 text-sm mt-1">{errors.patient_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].fatherSpouseName} *
                </label>
                <input
                  type="text"
                  name="father_spouse_name"
                  value={formData.father_spouse_name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.father_spouse_name && <p className="text-red-600 text-sm mt-1">{errors.father_spouse_name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels[language].age} *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels[language].gender} *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{labels[language].noData}</option>
                    <option value="Male">{labels[language].male}</option>
                    <option value="Female">{labels[language].female}</option>
                    <option value="Other">{labels[language].other}</option>
                  </select>
                  {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].address} *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>
          {/* Identity Cards */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaIdCard className="mr-2 text-green-600" />
                Identity Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Identity Card Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].identityCardType}
                </label>
                <select
                  name="identity_card_type"
                  value={formData.identity_card_type}
                  onChange={(e) => {
                    handleChange(e);
                    // Clear the ayushman card number when changing type
                    setFormData(prev => ({ ...prev, ayushman_card_number: '' }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Identity Card Type</option>
                  <option value="ABHA">{labels[language].abhaNumber}</option>
                  <option value="PM_JAY">{labels[language].pmJayId}</option>
                </select>
                {errors.identity_card_type && <p className="text-red-600 text-sm mt-1">{errors.identity_card_type}</p>}
              </div>

              {/* Identity Card Number Input */}
              {formData.identity_card_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.identity_card_type === 'ABHA' ? labels[language].abhaNumber : labels[language].pmJayId}
                  </label>
                  <input
                    type="text"
                    name="ayushman_card_number"
                    value={formData.ayushman_card_number}
                    onChange={handleChange}
                    placeholder={formData.identity_card_type === 'ABHA' ? 'Enter 14-digit ABHA Number' : 'Enter 9-digit PM JAY ID'}
                    maxLength={formData.identity_card_type === 'ABHA' ? 14 : 9}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.ayushman_card_number && <p className="text-red-600 text-sm mt-1">{errors.ayushman_card_number}</p>}
                </div>
              )}

              {/* Alternative: Aadhar + PAN */}
              {!formData.identity_card_type && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Or provide both Aadhar and PAN Card:</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {labels[language].aadharCard}
                    </label>
                    <input
                      type="text"
                      name="aadhar_card_number"
                      value={formData.aadhar_card_number}
                      onChange={handleChange}
                      placeholder="Enter 12-digit Aadhar Number"
                      maxLength={12}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.aadhar_card_number && <p className="text-red-600 text-sm mt-1">{errors.aadhar_card_number}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {labels[language].panCard}
                    </label>
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.pan_card_number && <p className="text-red-600 text-sm mt-1">{errors.pan_card_number}</p>}
                  </div>
                </div>
              )}

              {errors.identity && <p className="text-red-600 text-sm">{errors.identity}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaPhone className="mr-2 text-purple-600" />
                {labels[language].contactInfo}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].contactName} *
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.contact_name && <p className="text-red-600 text-sm mt-1">{errors.contact_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].contactPhone} *
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.contact_phone && <p className="text-red-600 text-sm mt-1">{errors.contact_phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].contactEmail} *
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.contact_email && <p className="text-red-600 text-sm mt-1">{errors.contact_email}</p>}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaStethoscope className="mr-2 text-red-600" />
                {labels[language].medicalInfo}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].medicalCondition} *
                </label>
                <textarea
                  name="medical_condition"
                  value={formData.medical_condition}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.medical_condition && <p className="text-red-600 text-sm mt-1">{errors.medical_condition}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].chiefComplaint} *
                </label>
                <textarea
                  name="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.chief_complaint && <p className="text-red-600 text-sm mt-1">{errors.chief_complaint}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].generalCondition} *
                </label>
                <input
                  type="text"
                  name="general_condition"
                  value={formData.general_condition}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.general_condition && <p className="text-red-600 text-sm mt-1">{errors.general_condition}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].vitals} *
                </label>
                <select
                  name="vitals"
                  value={formData.vitals}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{labels[language].noData}</option>
                  <option value="Stable">{labels[language].stable}</option>
                  <option value="Unstable">{labels[language].unstable}</option>
                </select>
                {errors.vitals && <p className="text-red-600 text-sm mt-1">{errors.vitals}</p>}
              </div>
            </div>
          </div>
          {/* Hospital Information */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaHospital className="mr-2 text-indigo-600" />
                {labels[language].hospitalInfo}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].destinationHospital} *
                </label>
                <select
                  name="hospital_id"
                  value={formData.hospital_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{labels[language].noData}</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.hospital_id} value={hospital.hospital_id}>
                      {hospital.name || hospital.hospital_name}
                    </option>
                  ))}
                </select>
                {errors.hospital_id && <p className="text-red-600 text-sm mt-1">{errors.hospital_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].sourceHospital} *
                </label>
                <select
                  name="source_hospital_id"
                  value={formData.source_hospital_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{labels[language].noData}</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.hospital_id} value={hospital.hospital_id}>
                      {hospital.name || hospital.hospital_name}
                    </option>
                  ))}
                </select>
                {errors.source_hospital_id && <p className="text-red-600 text-sm mt-1">{errors.source_hospital_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels[language].district} *
                </label>
                <select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{labels[language].noData}</option>
                  {districts.map(district => (
                    <option key={district.district_id} value={district.district_id}>
                      {district.district_name}
                    </option>
                  ))}
                </select>
                {errors.district_id && <p className="text-red-600 text-sm mt-1">{errors.district_id}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Fields in Full Width */}
        <div className="mt-6 space-y-6">
          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaFileAlt className="mr-2 text-orange-600" />
                Documents
              </h2>
            </div>
            <div className="p-6">
              {/* Existing Documents */}
              {formData.existingDocuments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Existing Documents</h3>
                  <div className="space-y-3">
                    {formData.existingDocuments.map((doc, index) => (
                      <div key={doc.document_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FaFileAlt className="text-gray-500" />
                          <span className="text-sm font-medium">{doc.document_type}</span>
                          <span className="text-sm text-gray-600">({doc.file_path?.split('/').pop() || 'Document'})</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleDownload(doc.file_path, doc.document_type)}
                            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            <FaDownload className="mr-1" />
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(index)}
                            className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                          >
                            <FaTrash className="mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Documents */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Add New Documents</h3>
                <input
                  type="file"
                  name="documents"
                  multiple
                  onChange={handleChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.documents && <p className="text-red-600 text-sm mt-1">{errors.documents}</p>}

                {/* Document Type Selection */}
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-4 mt-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{doc.file.name}</span>
                    <select
                      name={`documentType_${index}`}
                      value={doc.type}
                      onChange={handleChange}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      {documentTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {errors.documentTypes && <p className="text-red-600 text-sm mt-1">{errors.documentTypes}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/cmo-dashboard')}
                className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <FaTimes className="mr-2" />
                {labels[language].cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <FaSave className="mr-2" />
                {isSubmitting ? labels[language].saving : labels[language].save}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BeneficiaryDetailsEditPage;