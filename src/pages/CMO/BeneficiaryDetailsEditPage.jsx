
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import baseUrl from '../../baseUrl/baseUrl';

// Labels for English and Hindi
const labels = {
  en: {
    title: 'Edit Beneficiary Details',
    enquiryId: 'Enquiry ID',
    patientName: 'Patient Name',
    ayushmanCard: 'Ayushman Card Number (Optional)',
    aadharCard: 'Aadhar Card Number (Optional)',
    panCard: 'PAN Card Number (Optional)',
    medicalCondition: 'Medical Condition',
    hospitalId: 'Destination Hospital',
    sourceHospitalId: 'Source Hospital',
    district: 'District',
    contactName: 'Contact Name',
    contactPhone: 'Contact Phone',
    contactEmail: 'Contact Email',
    documents: 'Documents (Optional)',
    submit: 'Update Enquiry',
    noData: 'No data available',
    loading: 'Loading enquiry details...',
    error: 'Failed to load enquiry: ',
    updateSuccess: 'Enquiry updated successfully!',
    updateError: 'Failed to update enquiry: ',
    removeDocument: 'Remove',
  },
  hi: {
    title: 'लाभार्थी विवरण संपादित करें',
    enquiryId: 'पूछताछ आईडी',
    patientName: 'रोगी का नाम',
    ayushmanCard: 'आयुष्मान कार्ड नंबर (वैकल्पिक)',
    aadharCard: 'आधार कार्ड नंबर (वैकल्पिक)',
    panCard: 'पैन कार्ड नंबर (वैकल्पिक)',
    medicalCondition: 'चिकित्सा स्थिति',
    hospitalId: 'गंतव्य अस्पताल',
    sourceHospitalId: 'स्रोत अस्पताल',
    district: 'जिला',
    contactName: 'संपर्क व्यक्ति का नाम',
    contactPhone: 'संपर्क फोन नंबर',
    contactEmail: 'संपर्क ईमेल',
    documents: 'दस्तावेज (वैकल्पिक)',
    submit: 'पूछताछ अपडेट करें',
    noData: 'कोई डेटा उपलब्ध नहीं',
    loading: 'पूछताछ विवरण लोड हो रहा है...',
    error: 'पूछताछ लोड करने में विफल: ',
    updateSuccess: 'पूछताछ सफलतापूर्वक अपडेट की गई!',
    updateError: 'पूछताछ अपडेट करने में विफल: ',
    removeDocument: 'हटाएं',
  },
};

// Document type options
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
    enquiryId: id || '',
    patientName: '',
    ayushmanCard: '',
    aadharCard: '',
    panCard: '',
    medicalCondition: '',
    hospitalId: '',
    sourceHospitalId: '',
    districtId: localStorage.getItem('district_id') || '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [enquiryRes, hRes, dRes] = await Promise.all([
          fetch(`${baseUrl}/api/enquiries/${id}`),
          fetch(`${baseUrl}/api/hospitals`),
          fetch(`${baseUrl}/api/districts`),
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
        setFormData({
          enquiryId: enquiry.enquiry_id.toString(),
          patientName: enquiry.patient_name || '',
          ayushmanCard: enquiry.ayushman_card_number || '',
          aadharCard: enquiry.aadhar_card_number || '',
          panCard: enquiry.pan_card_number || '',
          medicalCondition: enquiry.medical_condition || '',
          hospitalId: enquiry.hospital_id?.toString() || '',
          sourceHospitalId: enquiry.source_hospital_id?.toString() || '',
          districtId: enquiry.district_id?.toString() || localStorage.getItem('district_id') || '',
          contactName: enquiry.contact_name || '',
          contactPhone: enquiry.contact_phone || '',
          contactEmail: enquiry.contact_email || '',
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

  const validateForm = () => {
    const errs = {};
    if (!formData.patientName.trim()) errs.patientName = `${labels[language].patientName} is required`;
    if (formData.ayushmanCard && !/^\d{14}$/.test(formData.ayushmanCard)) {
      errs.ayushmanCard = 'Ayushman Card Number must be 14 digits';
    }
    if (formData.aadharCard && !/^\d{12}$/.test(formData.aadharCard)) {
      errs.aadharCard = 'Aadhar Card Number must be 12 digits';
    }
    if (formData.panCard && !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.panCard)) {
      errs.panCard = 'PAN Card Number format must be ABCDE1234F';
    }
    if (!formData.medicalCondition.trim()) errs.medicalCondition = `${labels[language].medicalCondition} is required`;
    if (!formData.hospitalId) errs.hospitalId = `${labels[language].hospitalId} is required`;
    if (!formData.sourceHospitalId) errs.sourceHospitalId = `${labels[language].sourceHospitalId} is required`;
    if (!formData.districtId) errs.districtId = `${labels[language].district} is required`;
    if (!formData.contactName.trim()) errs.contactName = `${labels[language].contactName} is required`;
    if (!/^\d{10}$/.test(formData.contactPhone)) errs.contactPhone = 'Contact Phone must be 10 digits';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) errs.contactEmail = 'Valid email required';
    formData.documents.forEach((doc, idx) => {
      if (doc.file.size > 5 * 1024 * 1024) errs.documents = `File ${doc.file.name} exceeds 5MB`;
      if (!['application/pdf', 'image/png', 'image/jpeg'].includes(doc.file.type)) {
        errs.documents = `File ${doc.file.name} type not allowed`;
      }
      if (!doc.type) errs.documentTypes = `Select type for ${doc.file.name}`;
    });
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'documents') {
      const fileArr = Array.from(files).map(file => ({ file, type: '' }));
      setFormData({ ...formData, documents: fileArr });
    } else if (name.startsWith('documentType_')) {
      const idx = Number(name.split('_')[1]);
      const updatedDocs = [...formData.documents];
      updatedDocs[idx].type = value;
      setFormData({ ...formData, documents: updatedDocs });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({});
  };

  const handleRemoveDocument = (index) => {
    const updatedDocs = formData.existingDocuments.filter((_, i) => i !== index);
    setFormData({ ...formData, existingDocuments: updatedDocs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('patient_name', formData.patientName);
    payload.append('ayushman_card_number', formData.ayushmanCard);
    payload.append('aadhar_card_number', formData.aadharCard);
    payload.append('pan_card_number', formData.panCard);
    payload.append('medical_condition', formData.medicalCondition);
    payload.append('hospital_id', formData.hospitalId);
    payload.append('source_hospital_id', formData.sourceHospitalId);
    payload.append('district_id', formData.districtId);
    payload.append('contact_name', formData.contactName);
    payload.append('contact_phone', formData.contactPhone);
    payload.append('contact_email', formData.contactEmail);

    formData.documents.forEach(doc => {
      payload.append(doc.type, doc.file);
    });

    try {
      const res = await fetch(`${baseUrl}/api/enquiries/${formData.enquiryId}`, {
        method: 'PATCH',
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update enquiry');
      alert(labels[language].updateSuccess);
      navigate('/cmo');
    } catch (err) {
      setError(labels[language].updateError + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{labels[language].title}</h2>
        <button
          onClick={() => setLanguage(lang => (lang === 'en' ? 'hi' : 'en'))}
          className="text-blue-600 hover:underline"
        >
          {language === 'en' ? 'हिन्दी' : 'English'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      {isLoading && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg">{labels[language].loading}</div>
      )}

      {!isLoading && (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{labels[language].enquiryId}</label>
            <input
              type="text"
              name="enquiryId"
              value={formData.enquiryId}
              readOnly
              className="w-full p-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].patientName}</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.patientName && <p className="text-red-600 text-sm">{errors.patientName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].ayushmanCard}</label>
            <input
              type="text"
              name="ayushmanCard"
              value={formData.ayushmanCard}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.ayushmanCard && <p className="text-red-600 text-sm">{errors.ayushmanCard}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].aadharCard}</label>
            <input
              type="text"
              name="aadharCard"
              value={formData.aadharCard}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.aadharCard && <p className="text-red-600 text-sm">{errors.aadharCard}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].panCard}</label>
            <input
              type="text"
              name="panCard"
              value={formData.panCard}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.panCard && <p className="text-red-600 text-sm">{errors.panCard}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].medicalCondition}</label>
            <textarea
              name="medicalCondition"
              value={formData.medicalCondition}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            ></textarea>
            {errors.medicalCondition && <p className="text-red-600 text-sm">{errors.medicalCondition}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].hospitalId}</label>
            <select
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">{labels[language].noData}</option>
              {hospitals.map(h => (
                <option key={h.hospital_id} value={h.hospital_id}>
                  {h.name}
                </option>
              ))}
            </select>
            {errors.hospitalId && <p className="text-red-600 text-sm">{errors.hospitalId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].sourceHospitalId}</label>
            <select
              name="sourceHospitalId"
              value={formData.sourceHospitalId}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">{labels[language].noData}</option>
              {hospitals.map(h => (
                <option key={h.hospital_id} value={h.hospital_id}>
                  {h.name}
                </option>
              ))}
            </select>
            {errors.sourceHospitalId && <p className="text-red-600 text-sm">{errors.sourceHospitalId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].district}</label>
            <select
              name="districtId"
              value={formData.districtId}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">{labels[language].noData}</option>
              {districts.map(d => (
                <option key={d.district_id} value={d.district_id}>
                  {d.district_name}
                </option>
              ))}
            </select>
            {errors.districtId && <p className="text-red-600 text-sm">{errors.districtId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].contactName}</label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.contactName && <p className="text-red-600 text-sm">{errors.contactName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].contactPhone}</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.contactPhone && <p className="text-red-600 text-sm">{errors.contactPhone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">{labels[language].contactEmail}</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.contactEmail && <p className="text-red-600 text-sm">{errors.contactEmail}</p>}
          </div>
          {formData.existingDocuments.length > 0 && (
            <div>
              <label className="block text-sm font-medium">Existing Documents</label>
              {formData.existingDocuments.map((doc, idx) => (
                <div key={doc.document_id} className="flex items-center space-x-2">
                  <span>{doc.document_type} ({doc.file_path.split('/').pop()})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(idx)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    {labels[language].removeDocument}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium">{labels[language].documents}</label>
            <input
              type="file"
              name="documents"
              multiple
              onChange={handleChange}
              className="mt-1"
            />
            {errors.documents && <p className="text-red-600 text-sm">{errors.documents}</p>}
          </div>
          {formData.documents.map((doc, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <span>{doc.file.name}</span>
              <select
                name={`documentType_${idx}`}
                value={doc.type}
                onChange={handleChange}
                className="p-1 border rounded-lg"
              >
                <option value="">{labels[language].noData}</option>
                {documentTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.documentTypes && <p className="text-red-600 text-sm">{errors.documentTypes}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Updating...' : labels[language].submit}
          </button>
        </form>
      )}
    </div>
  );
};

export default BeneficiaryDetailsEditPage;
