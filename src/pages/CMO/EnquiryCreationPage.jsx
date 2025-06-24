



import React, { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

// Labels for English and Hindi
const labels = {
  en: {
    title: 'Create Enquiry',
    patientName: 'Patient Name',
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
    submit: 'Submit Enquiry',
    next: 'Next',
    back: 'Back',
    noData: 'No data available',
  },
  hi: {
    title: 'पूछताछ बनाएं',
    patientName: 'रोगी का नाम',
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
    submit: 'सबमिट करें',
    next: 'आगे',
    back: 'वापस',
    noData: 'कोई डेटा उपलब्ध नहीं',
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
const steps = ['Patient Details', 'Contact Person', 'Documentation', 'Other Details'];

export default function EnquiryCreationPage() {
  const [language, setLanguage] = useState('en');
  const [step, setStep] = useState(0);
  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    patientName: '',
    ayushmanCard: '',
    aadharCard: '',
    panCard: '',
    medicalCondition: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    documents: [],
    hospitalId: '',
    sourceHospitalId: '',
    districtId: localStorage.getItem('district_id') || '',
    
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch hospitals and districts on mount
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [hRes, dRes] = await Promise.all([
          fetch(`${baseUrl}/api/hospitals`),
          fetch(`${baseUrl}/api/districts`),
        ]);
        const hJson = await hRes.json();
        const dJson = await dRes.json();
        setHospitals(hJson.data || hJson);
        setDistricts(dJson.data || dJson);
      } catch (err) {
        console.error('Lookup load failed', err);
      }
    };
    fetchLookups();
  }, []);

  // Validate all fields
  const validateForm = () => {
    const errs = {};
    if (!formData.patientName.trim()) errs.patientName = `${labels[language].patientName} is required`;
    if (!formData.ayushmanCard && (!formData.aadharCard || !formData.panCard)) errs.ayushmanCard = 'Either Ayushman or both Aadhar & PAN required';
    if (formData.ayushmanCard && !/^\d{14}$/.test(formData.ayushmanCard)) errs.ayushmanCard = 'Ayushman must be 14 digits';
    if (formData.aadharCard && !/^\d{12}$/.test(formData.aadharCard)) errs.aadharCard = 'Aadhar must be 12 digits';
    if (formData.panCard && !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.panCard)) errs.panCard = 'PAN format ABCDE1234F';
    if (!formData.medicalCondition.trim()) errs.medicalCondition = `${labels[language].medicalCondition} is required`;
    if (!formData.contactName.trim()) errs.contactName = `${labels[language].contactName} is required`;
    if (!/^\d{10}$/.test(formData.contactPhone)) errs.contactPhone = 'Phone must be 10 digits';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) errs.contactEmail = 'Valid email required';
    if (!formData.hospitalId) errs.hospitalId = `${labels[language].hospitalId} is required`;
    if (!formData.sourceHospitalId) errs.sourceHospitalId = `${labels[language].sourceHospitalId} is required`;
    if (!formData.districtId) errs.districtId = `${labels[language].district} is required`;
    if (formData.documents.length === 0) errs.documents = `${labels[language].documents} is required`;
    return errs;
  };

  // Handle input changes
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'documents') {
      setFormData({
        ...formData,
        documents: Array.from(files).map(file => ({ file, type: '' })),
      });
    } else if (name.startsWith('docType_')) {
      const idx = Number(name.split('_')[1]);
      const docs = [...formData.documents];
      docs[idx].type = value;
      setFormData({ ...formData, documents: docs });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({});
  };

  // Submit form
  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('patient_name', formData.patientName);
    payload.append('ayushman_card_number', formData.ayushmanCard);
    payload.append('aadhar_card_number', formData.aadharCard);
    payload.append('pan_card_number', formData.panCard);
    payload.append('medical_condition', formData.medicalCondition);
    payload.append('contact_name', formData.contactName);
    payload.append('contact_phone', formData.contactPhone);
    payload.append('contact_email', formData.contactEmail);
    payload.append('hospital_id', formData.hospitalId);
    payload.append('source_hospital_id', formData.sourceHospitalId);
    payload.append('district_id', formData.districtId);
    payload.append('submitted_by_user_id', '10');
    formData.documents.forEach(doc => payload.append(doc.type, doc.file));


    try {
      const res = await fetch(`${baseUrl}/api/enquiries`, { method: 'POST', body: payload });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submit failed');
      alert(`Enquiry #${data.data.enquiry_id} created!`);
      // reset or redirect
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render fields for current step
  const renderStepFields = () => {
    switch (step) {
      case 0:
        return (
          <>
            <div>
              <label className="block text-sm font-medium">{labels[language].patientName}</label>
              <input type="text" name="patientName" value={formData.patientName} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
              {errors.patientName && <p className="text-red-600 text-sm">{errors.patientName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">{labels[language].ayushmanCard}</label>
              <input type="text" name="ayushmanCard" value={formData.ayushmanCard} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
              {errors.ayushmanCard && <p className="text-red-600 text-sm">{errors.ayushmanCard}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">{labels[language].aadharCard}</label>
                <input type="text" name="aadharCard" value={formData.aadharCard} onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                {errors.aadharCard && <p className="text-red-600 text-sm">{errors.aadharCard}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">{labels[language].panCard}</label>
                <input type="text" name="panCard" value={formData.panCard} onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
                {errors.panCard && <p className="text-red-600 text-sm">{errors.panCard}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">{labels[language].medicalCondition}</label>
              <textarea name="medicalCondition" value={formData.medicalCondition} onChange={handleChange}
                rows={3} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
              {errors.medicalCondition && <p className="text-red-600 text-sm">{errors.medicalCondition}</p>}
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div>
              <label className="block text-sm font-medium">{labels[language].contactName}</label>
              <input type="text" name="contactName" value={formData.contactName} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
              {errors.contactName && <p className="text-red-600 text-sm">{errors.contactName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">{labels[language].contactPhone}</label>
              <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
              {errors.contactPhone && <p className="text-red-600 text-sm">{errors.contactPhone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">{labels[language].contactEmail}</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
              {errors.contactEmail && <p className="text-red-600 text-sm">{errors.contactEmail}</p>}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div>
              <label className="block text-sm font-medium">{labels[language].documents}</label>
              <input type="file" name="documents" multiple onChange={handleChange} className="w-full" />
              {errors.documents && <p className="text-red-600 text-sm">{errors.documents}</p>}
            </div>
            {formData.documents.map((doc, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span>{doc.file.name}</span>
                <select name={`docType_${idx}`} value={doc.type} onChange={handleChange}
                  className="p-1 border rounded">
                  <option value="">{labels[language].noData}</option>
                  {documentTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </>
        );
      case 3:
        return (
          <>
            <div>
              <label className="block text-sm font-medium">{labels[language].hospitalId}</label>
              <select name="hospitalId" value={formData.hospitalId} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="">{labels[language].noData}</option>
                {hospitals.map(h => (
                  <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>
                ))}
              </select>
              {errors.hospitalId && <p className="text-red-600 text-sm">{errors.hospitalId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">{labels[language].sourceHospitalId}</label>
              <select name="sourceHospitalId" value={formData.sourceHospitalId} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="">{labels[language].noData}</option>
                {hospitals.map(h => (
                  <option key={h.hospital_id} value={h.hospital_id}>{h.name}</option>
                ))}
              </select>
              {errors.sourceHospitalId && <p className="text-red-600 text-sm">{errors.sourceHospitalId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">{labels[language].district}</label>
              <select name="districtId" value={formData.districtId} onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="">{labels[language].noData}</option>
                {districts.map(d => (
                  <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                ))}
              </select>
              {errors.districtId && <p className="text-red-600 text-sm">{errors.districtId}</p>}
            </div>
          </>
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
              className={`w-full text-center py-2 rounded-full transition ${
                i === step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
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
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
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
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {labels[language].next}
              </button>
            ) : (
              <button
                type="submit"
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






















// import React, { useState, useEffect } from 'react';

// // Labels for English and Hindi
// const labels = {
//   en: {
//     title: 'Create Enquiry',
//     patientName: 'Patient Name',
//     ayushmanCard: 'Ayushman Card Number (Optional)',
//     aadharCard: 'Aadhar Card Number',
//     panCard: 'PAN Card Number',
//     medicalCondition: 'Medical Condition',
//     hospitalId: 'Destination Hospital',
//     sourceHospitalId: 'Source Hospital',
//     district: 'District',
//     contactName: 'Contact Name',
//     contactPhone: 'Contact Phone',
//     contactEmail: 'Contact Email',
//     documents: 'Documents (Required)',
//     submit: 'Submit Enquiry',
//     noData: 'No data available',
//   },
//   hi: {
//     title: 'पूछताछ बनाएं',
//     patientName: 'रोगी का नाम',
//     ayushmanCard: 'आयुष्मान कार्ड नंबर (वैकल्पिक)',
//     aadharCard: 'आधार कार्ड नंबर',
//     panCard: 'पैन कार्ड नंबर',
//     medicalCondition: 'चिकित्सा स्थिति',
//     hospitalId: 'गंतव्य अस्पताल',
//     sourceHospitalId: 'स्रोत अस्पताल',
//     district: 'जिला',
//     contactName: 'संपर्क व्यक्ति का नाम',
//     contactPhone: 'संपर्क फोन नंबर',
//     contactEmail: 'संपर्क ईमेल',
//     documents: 'दस्तावेज (आवश्यक)',
//     submit: 'पूछताछ सबमिट करें',
//     noData: 'कोई डेटा उपलब्ध नहीं',
//   },
// };

// // Document type options
// const documentTypeOptions = [
//   { value: 'AYUSHMAN_CARD', label: 'Ayushman Card' },
//   { value: 'ID_PROOF', label: 'ID Proof' },
//   { value: 'MEDICAL_REPORT', label: 'Medical Report' },
//   { value: 'OTHER', label: 'Other' },
// ];

// const EnquiryCreationPage = () => {
//   const [hospitals, setHospitals] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [formData, setFormData] = useState({
//     patientName: '',
//     ayushmanCard: '',
//     aadharCard: '',
//     panCard: '',
//     medicalCondition: '',
//     hospitalId: '',
//     sourceHospitalId: '',
//     districtId: localStorage.getItem('district_id') || '',
//     contactName: '',
//     contactPhone: '',
//     contactEmail: '',
//     documents: [], // Array of { file, type }
//   });
//   const [errors, setErrors] = useState({});
//   const [language, setLanguage] = useState('en');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Fetch hospitals and districts
//   useEffect(() => {
//     const loadLookups = async () => {
//       try {
//         const [hRes, dRes] = await Promise.all([
//           fetch('http://localhost:4000/api/hospitals'),
//           fetch('http://localhost:4000/api/districts'),
//         ]);
//         if (!hRes.ok || !dRes.ok) throw new Error('Failed to fetch lookups');
//         const hData = await hRes.json();
//         const dData = await dRes.json();
//         setHospitals(hData.data || hData);
//         setDistricts(dData.data || dData);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     loadLookups();
//   }, []);

//   // Validation
//   const validateForm = () => {
//     const errs = {};
//     if (!formData.patientName.trim()) errs.patientName = `${labels[language].patientName} is required`;
//     if (!formData.ayushmanCard && (!formData.aadharCard || !formData.panCard)) {
//       errs.ayushmanCard = 'Either Ayushman or both Aadhar and PAN required';
//     }
//     if (formData.ayushmanCard && !/^\d{14}$/.test(formData.ayushmanCard)) {
//       errs.ayushmanCard = 'Ayushman must be 14 digits';
//     }
//     if (formData.aadharCard && !/^\d{12}$/.test(formData.aadharCard)) {
//       errs.aadharCard = 'Aadhar must be 12 digits';
//     }
//     if (formData.panCard && !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.panCard)) {
//       errs.panCard = 'PAN format ABCDE1234F';
//     }
//     if (!formData.medicalCondition.trim()) errs.medicalCondition = `${labels[language].medicalCondition} is required`;
//     if (!formData.hospitalId) errs.hospitalId = `${labels[language].hospitalId} is required`;
//     if (!formData.sourceHospitalId) errs.sourceHospitalId = `${labels[language].sourceHospitalId} is required`;
//     if (!formData.districtId) errs.districtId = `${labels[language].district} is required`;
//     if (!formData.contactName.trim()) errs.contactName = `${labels[language].contactName} is required`;
//     if (!/^\d{10}$/.test(formData.contactPhone)) errs.contactPhone = 'Phone must be 10 digits';
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) errs.contactEmail = 'Valid email required';
//     if (formData.documents.length === 0) {
//       errs.documents = `${labels[language].documents} is required`;
//     } else {
//       formData.documents.forEach((doc, idx) => {
//         if (doc.file.size > 5 * 1024 * 1024) errs.documents = `File ${doc.file.name} >5MB`;
//         if (!['application/pdf', 'image/png', 'image/jpeg'].includes(doc.file.type)) {
//           errs.documents = `File ${doc.file.name} type not allowed`;
//         }
//         if (!doc.type) errs.documentTypes = `Select type for ${doc.file.name}`;
//       });
//     }
//     return errs;
//   };

//   // Handle form changes
//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'documents') {
//       const fileArr = Array.from(files).map(file => ({ file, type: '' }));
//       setFormData({ ...formData, documents: fileArr });
//     } else if (name.startsWith('documentType_')) {
//       const idx = Number(name.split('_')[1]);
//       const updatedDocs = [...formData.documents];
//       updatedDocs[idx].type = value;
//       setFormData({ ...formData, documents: updatedDocs });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//     setErrors({});
//   };

//   // Submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errs = validateForm();
//     if (Object.keys(errs).length) {
//       setErrors(errs);
//       return;
//     }
//     setIsSubmitting(true);

//     const payload = new FormData();
//     payload.append('patient_name', formData.patientName);
//     payload.append('ayushman_card_number', formData.ayushmanCard);
//     payload.append('aadhar_card_number', formData.aadharCard);
//     payload.append('pan_card_number', formData.panCard);
//     payload.append('medical_condition', formData.medicalCondition);
//     payload.append('hospital_id', formData.hospitalId);
//     payload.append('source_hospital_id', formData.sourceHospitalId);
//     payload.append('district_id', formData.districtId);
//     payload.append('contact_name', formData.contactName);
//     payload.append('contact_phone', formData.contactPhone);
//     payload.append('contact_email', formData.contactEmail);
//     payload.append('submitted_by_user_id', '10'); // Adjust as needed

//     // Append files under their respective document type field names
//     formData.documents.forEach(doc => {
//       payload.append(doc.type, doc.file);
//     });

//     try {
//       const res = await fetch('http://localhost:4000/api/enquiries', {
//         method: 'POST',
//         body: payload,
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Error');
//       alert(`Enquiry #${data.data.enquiry_id} created!`);
//       // Reset form
//       setFormData({
//         patientName: '',
//         ayushmanCard: '',
//         aadharCard: '',
//         panCard: '',
//         medicalCondition: '',
//         hospitalId: '',
//         sourceHospitalId: '',
//         districtId: localStorage.getItem('district_id') || '',
//         contactName: '',
//         contactPhone: '',
//         contactEmail: '',
//         documents: [],
//       });
//       setErrors({});
//     } catch (err) {
//       console.error(err);
//       alert('Submit failed: ' + err.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold">{labels[language].title}</h2>
//         <button onClick={() => setLanguage(lang => (lang === 'en' ? 'hi' : 'en'))} className="text-blue-600">
//           {language === 'en' ? 'हिन्दी' : 'English'}
//         </button>
//       </div>
//       <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
//         {/* Patient Name */}
//         <div>
//           <label className="block text-sm font-medium">{labels[language].patientName}</label>
//           <input
//             type="text"
//             name="patientName"
//             value={formData.patientName}
//             onChange={handleChange}
//             className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />
//           {errors.patientName && <p className="text-red-600 text-sm">{errors.patientName}</p>}
//         </div>
//         {/* Ayushman */}
//         <div>
//           <label className="block text-sm font-medium">{labels[language].ayushmanCard}</label>
//           <input
//             type="text"
//             name="ayushmanCard"
//             value={formData.ayushmanCard}
//             onChange={handleChange}
//             className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />
//           {errors.ayushmanCard && <p className="text-red-600 text-sm">{errors.ayushmanCard}</p>}
//         </div>
//         {/* Aadhar */}
//         <div>
//           <label className="block text-sm font-medium">{labels[language].aadharCard}</label>
//           <input
//             type="text"
//             name="aadharCard"
//             value={formData.aadharCard}
//             onChange={handleChange}
//             className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />
//           {errors.aadharCard && <p className="text-red-600 text-sm">{errors.aadharCard}</p>}
//         </div>
//         {/* PAN */}
//         <div>
//           <label className="block text-sm font-medium">{labels[language].panCard}</label>
//           <input
//             type="text"
//             name="panCard"
//             value={formData.panCard}
//             onChange={handleChange}
//             className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />
//           {errors.panCard && <p className="text-red-600 text-sm">{errors.panCard}</p>}
//         </div>
//         {/* Condition */}
//         <div>
//           <label className="block text-sm font-medium">{labels[language].medicalCondition}</label>
//           <textarea
//             name="medicalCondition"
//             value={formData.medicalCondition}
//             onChange={handleChange}
//             rows="4"
//             className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
//           ></textarea>
//           {errors.medicalCondition && <p className="text-red-600 text-sm">{errors.medicalCondition}</p>}
//         </div>
//         {/* Hospitals & District */}
//         <div>
//           <label className="block text-sm font-medium">{labels[language].hospitalId}</label>
//           <select name="hospitalId" value={formData.hospitalId} onChange={handleChange} className="w-full p-2 border rounded">
//             <option value="">{labels[language].noData}</option>
//             {hospitals.map(h => (
//               <option key={h.hospital_id} value={h.hospital_id}>
//                 {h.name}
//               </option>
//             ))}
//           </select>
//           {errors.hospitalId && <p className="text-red-600 text-sm">{errors.hospitalId}</p>}
//         </div>
//         <div>
//           <label className="block text-sm font-medium">{labels[language].sourceHospitalId}</label>
//           <select
//             name="sourceHospitalId"
//             value={formData.sourceHospitalId}
//             onChange={handleChange}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">{labels[language].noData}</option>
//             {hospitals.map(h => (
//               <option key={h.hospital_id} value={h.hospital_id}>
//                 {h.name}
//               </option>
//             ))}
//           </select>
//           {errors.sourceHospitalId && <p className="text-red-600 text-sm">{errors.sourceHospitalId}</p>}
//         </div>
//         <div>
//           <label className="block text-sm font-medium">{labels[language].district}</label>
//           <select name="districtId" value={formData.districtId} onChange={handleChange} className="w-full p-2 border rounded">
//             <option value="">{labels[language].noData}</option>
//             {districts.map(d => (
//               <option key={d.district_id} value={d.district_id}>
//                 {d.district_name}
//               </option>
//             ))}
//           </select>
//           {errors.districtId && <p className="text-red-600 text-sm">{errors.districtId}</p>}
//         </div>
//         {/* Documents */}
//         <div>
//           <label className="block text-sm font-medium">{labels[language].documents}</label>
//           <input type="file" name="documents" multiple onChange={handleChange} className="mt-1" />
//           {errors.documents && <p className="text-red-600 text-sm">{errors.documents}</p>}
//         </div>
//         {formData.documents.map((doc, idx) => (
//           <div key={idx} className="flex items-center space-x-2">
//             <span>{doc.file.name}</span>
//             <select
//               name={`documentType_${idx}`}
//               value={doc.type}
//               onChange={handleChange}
//               className="p-1 border rounded"
//             >
//               <option value="">{labels[language].noData}</option>
//               {documentTypeOptions.map(opt => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         ))}
//         {/* Contact Info */}
//         <div>
//           <label className="block text-sm font-medium">{labels[language].contactName}</label>
//           <input
//             type="text"
//             name="contactName"
//             value={formData.contactName}
//             onChange={handleChange}
//             className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />
//           {errors.contactName && <p className="text-red-600 text-sm">{errors.contactName}</p>}
//         </div>
//         <div>
//           <label className="block text-sm font-medium">{labels[language].contactPhone}</label>
//           <input
//             type="text"
//             name="contactPhone"
//             value={formData.contactPhone}
//             onChange={handleChange}
//             className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />
//           {errors.contactPhone && <p className="text-red-600 text-sm">{errors.contactPhone}</p>}
//         </div>
//         <div>
//           <label className="block text-sm font-medium">{labels[language].contactEmail}</label>
//           <input
//             type="email"
//             name="contactEmail"
//             value={formData.contactEmail}
//             onChange={handleChange}
//             className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />
//           {errors.contactEmail && <p className="text-red-600 text-sm">{errors.contactEmail}</p>}
//         </div>
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
//         >
//           {isSubmitting ? 'Submitting...' : labels[language].submit}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EnquiryCreationPage;