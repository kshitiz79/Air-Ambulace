import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft, FaUser, FaHospital, FaPhone, FaStethoscope,
  FaIdCard, FaFileAlt, FaDownload, FaEdit, FaCalendar,
  FaMapMarkerAlt, FaAmbulance, FaUserMd, FaEye
} from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const getDocumentTypeOptions = (t) => [
  { value: 'AYUSHMAN_CARD', label: t.ayushmanCardDoc || 'Ayushman Card' },
  { value: 'ID_PROOF', label: t.idProof || 'ID Proof' },
  { value: 'MEDICAL_REPORT', label: t.medicalReport || 'Medical Report' },
  { value: 'OTHER', label: t.other || 'Other' },
];

const BeneficiaryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, setLanguage, t: globalT } = useLanguage();
  const labels = globalT;
  const l = labels; // shorthand — l.xxx → l.xxx (globalT is already language-aware)
  const documentTypeOptions = getDocumentTypeOptions(labels);
  const userRole = localStorage.getItem('role');
  const [enquiry, setEnquiry] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState('');
  const [newDocs, setNewDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    fetchEnquiry();
  }, [id]);

  const generatePDFReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Professional Header with Logo Area
      pdf.setFillColor(41, 128, 185);
      pdf.rect(0, 0, pdfWidth, 35, 'F');
      
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('AIR AMBULANCE SERVICE', 14, 18);
      
      pdf.setFontSize(12);
      pdf.text('Medical Emergency Transport Report', 14, 26);
      
      // Report Info Box
      pdf.setFillColor(245, 245, 245);
      pdf.rect(14, 40, pdfWidth - 28, 25, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(14, 40, pdfWidth - 28, 25, 'S');
      
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Enquiry Code: ${enquiry?.enquiry_code || id}`, 18, 48);
      pdf.text(`Status: ${enquiry?.status ? enquiry.status.replace('_', ' ') : 'N/A'}`, 18, 54);
      pdf.text(`Generated On: ${new Date().toLocaleString('en-IN')}`, 18, 60);
      
      // Add timestamps
      const createdDate = enquiry?.created_at || enquiry?.createdAt;
      const updatedDate = enquiry?.updated_at || enquiry?.updatedAt;
      if (createdDate) {
        pdf.text(`Created: ${new Date(createdDate).toLocaleString('en-IN')}`, pdfWidth - 80, 48);
      }
      if (updatedDate) {
        pdf.text(`Last Updated: ${new Date(updatedDate).toLocaleString('en-IN')}`, pdfWidth - 80, 54);
      }

      let currentY = 75;

      // Enhanced table helper with better styling
      const renderTable = (title, bodyData, options = {}) => {
        if (bodyData.length === 0) return;
        
        autoTable(pdf, {
          startY: currentY,
          head: [[title, '']],
          body: bodyData,
          theme: 'grid',
          headStyles: { 
            fillColor: [41, 128, 185], 
            textColor: 255, 
            fontSize: 12,
            fontStyle: 'bold',
            halign: 'left'
          },
          bodyStyles: { 
            fontSize: 10, 
            textColor: 50,
            cellPadding: 3
          },
          columnStyles: { 
            0: { fontStyle: 'bold', cellWidth: options.labelWidth || 65, halign: 'left' },
            1: { cellWidth: options.valueWidth || 'auto', halign: 'left' }
          },
          margin: { left: 14, right: 14 },
          tableWidth: 'auto',
          styles: {
            lineColor: [200, 200, 200],
            lineWidth: 0.5
          }
        });
        currentY = pdf.lastAutoTable.finalY + 8;
        
        // Add page break if needed
        if (currentY > pdfHeight - 40) {
          pdf.addPage();
          currentY = 20;
        }
      };

      // 1. Patient Information
      const patientData = [
        ['Patient Name', enquiry?.patient_name || 'N/A'],
        ['Father/Spouse Name', enquiry?.father_spouse_name || 'N/A'],
        ['Age', `${enquiry?.age || 'N/A'} years`],
        ['Gender', enquiry?.gender || 'N/A'],
        ['Address', enquiry?.address || 'N/A']
      ];
      renderTable('PATIENT INFORMATION', patientData);

      // 2. Identity Information
      const identityData = [];
      if (enquiry?.identity_card_type && enquiry?.ayushman_card_number) {
        const cardType = enquiry.identity_card_type === 'ABHA' ? 'ABHA Number (14 digits)' : 'PM JAY ID (9 digits)';
        identityData.push([cardType, enquiry.ayushman_card_number]);
      } else if (enquiry?.ayushman_card_number) {
        identityData.push(['Ayushman Card', enquiry.ayushman_card_number]);
      }
      if (enquiry?.aadhar_card_number) {
        identityData.push(['Aadhar Card', enquiry.aadhar_card_number]);
      }
      if (enquiry?.pan_card_number) {
        identityData.push(['PAN Card', enquiry.pan_card_number]);
      }
      if (identityData.length > 0) {
        renderTable('IDENTITY INFORMATION', identityData);
      }

      // 3. Contact Details
      const contactData = [
        ['Contact Person', enquiry?.contact_name || 'N/A'],
        ['Phone Number', enquiry?.contact_phone || 'N/A'],
        ['Email Address', enquiry?.contact_email || 'N/A']
      ];
      renderTable('CONTACT DETAILS', contactData);

      // 4. Medical Information
      const medicalData = [
        ['Medical Condition', enquiry?.medical_condition || 'N/A'],
        ['Chief Complaint', enquiry?.chief_complaint || 'N/A'],
        ['General Condition', enquiry?.general_condition || 'N/A'],
        ['Vitals Status', enquiry?.vitals || 'N/A']
      ];
      renderTable('MEDICAL INFORMATION', medicalData);

      // 5. Hospital Details
      const hospitalData = [
        ['Source Hospital', enquiry?.sourceHospital?.name || enquiry?.sourceHospital?.hospital_name || 'N/A'],
        ['Destination Hospital', enquiry?.hospital?.name || enquiry?.hospital?.hospital_name || 'N/A'],
        ['District', enquiry?.district?.district_name || 'N/A']
      ];
      renderTable('HOSPITAL DETAILS', hospitalData);

      // 6. Referral & Transport Details
      const referralData = [];
      if (enquiry?.referring_physician_name) referralData.push(['Referring Physician', enquiry.referring_physician_name]);
      if (enquiry?.referring_physician_designation) referralData.push(['Physician Designation', enquiry.referring_physician_designation]);
      if (enquiry?.recommending_authority_name) referralData.push(['Recommending Authority', enquiry.recommending_authority_name]);
      if (enquiry?.recommending_authority_designation) referralData.push(['Recommending Designation', enquiry.recommending_authority_designation]);
      if (enquiry?.approval_authority_name) referralData.push(['Approval Authority', enquiry.approval_authority_name]);
      if (enquiry?.approval_authority_designation) referralData.push(['Approval Designation', enquiry.approval_authority_designation]);
      if (enquiry?.transportation_category) referralData.push(['Transportation Category', enquiry.transportation_category]);
      if (enquiry?.air_transport_type) referralData.push(['Air Transport Type', enquiry.air_transport_type]);
      if (enquiry?.ambulance_registration_number) referralData.push(['Requested Ambulance Reg.', enquiry.ambulance_registration_number]);
      if (enquiry?.ambulance_contact) referralData.push(['Ambulance Contact', enquiry.ambulance_contact]);
      if (enquiry?.referral_note) referralData.push(['Referral Note', enquiry.referral_note]);
      
      if (referralData.length > 0) {
        renderTable('REFERRAL & TRANSPORT DETAILS', referralData);
      }

      // 7. Ambulance Assignment Details
      if (assignment) {
        const assignmentData = [
          ['Assignment ID', `#${assignment.assignment_id}`],
          ['Assignment Status', assignment.status?.replace(/_/g, ' ') || 'N/A'],
          ['Departure Time', assignment.departure_time ? new Date(assignment.departure_time).toLocaleString('en-IN') : 'Not scheduled'],
          ['Arrival Time', assignment.arrival_time ? new Date(assignment.arrival_time).toLocaleString('en-IN') : 'Not scheduled']
        ];

        if (assignment.ambulance) {
          assignmentData.push(['Ambulance ID', assignment.ambulance.ambulance_id || 'N/A']);
          assignmentData.push(['Registration Number', assignment.ambulance.registration_number || 'N/A']);
          assignmentData.push(['Aircraft Type', assignment.ambulance.aircraft_type || 'N/A']);
          assignmentData.push(['Base Location', assignment.ambulance.base_location || 'N/A']);
          assignmentData.push(['Contact Number', assignment.ambulance.contact_number || 'N/A']);
          assignmentData.push(['Ambulance Status', assignment.ambulance.status || 'N/A']);
        }

        if (assignment.crewMembers?.length > 0) {
          const crewList = assignment.crewMembers.map(m => `${m.full_name} (${m.role})`).join(', ');
          assignmentData.push(['Flight Crew', crewList]);
        }

        if (assignment.crew_details) {
          assignmentData.push(['Assignment Notes', assignment.crew_details]);
        }

        renderTable('AMBULANCE ASSIGNMENT', assignmentData);
      }

      // 8. Documents Summary
      if (enquiry?.documents && enquiry.documents.length > 0) {
        const docData = enquiry.documents.map((doc, index) => [
          `Document ${index + 1}`,
          `${doc.document_type} - ${doc.file_path?.split('/').pop() || 'Unknown file'}`
        ]);
        renderTable('ATTACHED DOCUMENTS', docData);
      }

      // Add footer with page numbers
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 30, pdfHeight - 10);
        pdf.text('Air Ambulance Service - Confidential Medical Report', 14, pdfHeight - 10);
      }

      // Add document images on separate pages
      if (enquiry?.documents && enquiry.documents.length > 0) {
        for (const doc of enquiry.documents) {
          const url = doc.file_path?.startsWith('http') ? doc.file_path : `${baseUrl}${doc.file_path?.startsWith('/') ? '' : '/'}${doc.file_path}`;
          
          if (url.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
            try {
              const img = new Image();
              img.crossOrigin = "Anonymous";
              img.src = url;
              await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject();
              });
              
              pdf.addPage();
              
              // Document page header
              pdf.setFillColor(41, 128, 185);
              pdf.rect(0, 0, pdfWidth, 25, 'F');
              pdf.setFontSize(16);
              pdf.setTextColor(255, 255, 255);
              pdf.text(`ATTACHMENT: ${doc.document_type}`, 14, 16);
              
              // Image
              const imgRatio = img.height / img.width;
              const maxWidth = pdfWidth - 28;
              const maxHeight = pdfHeight - 60;
              
              let imgWidth = maxWidth;
              let imgHeight = imgWidth * imgRatio;
              
              if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = imgHeight / imgRatio;
              }
              
              const xPos = (pdfWidth - imgWidth) / 2;
              const yPos = 35;
              
              pdf.addImage(img, 'JPEG', xPos, yPos, imgWidth, imgHeight);
              
              // Image caption
              pdf.setFontSize(10);
              pdf.setTextColor(60, 60, 60);
              pdf.text(`File: ${doc.file_path?.split('/').pop() || 'Unknown'}`, 14, pdfHeight - 20);
              
            } catch (err) {
              console.warn("Could not load image for PDF:", url, err);
            }
          }
        }
      }

      // Add final page numbers after adding document pages
      const finalPageCount = pdf.internal.getNumberOfPages();
      for (let i = pageCount + 1; i <= finalPageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${finalPageCount}`, pdfWidth - 30, pdfHeight - 10);
        pdf.text('Air Ambulance Service - Document Attachment', 14, pdfHeight - 10);
      }

      pdf.save(`Air_Ambulance_Report_${enquiry?.enquiry_code || id}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF report. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const fetchEnquiry = async () => {
    try {
      setIsLoading(true);
      const [enquiryRes, assignmentRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${baseUrl}/api/flight-assignments/enquiry/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).catch(() => null),
      ]);

      if (!enquiryRes.ok) throw new Error('Failed to fetch details');

      const enquiryData = await enquiryRes.json();
      setEnquiry(enquiryData.data || enquiryData);

      if (assignmentRes && assignmentRes.ok) {
        const assignmentData = await assignmentRes.json();
        setAssignment(assignmentData.data || assignmentData[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addDocumentInput = () => {
    setNewDocs([...newDocs, { file: null, type: '' }]);
  };

  const removeDocumentInput = (index) => {
    setNewDocs(newDocs.filter((_, i) => i !== index));
  };

  const handleDocTypeChange = (index, type) => {
    const updated = [...newDocs];
    updated[index].type = type;
    setNewDocs(updated);
  };

  const handleFileChange = (index, file) => {
    const updated = [...newDocs];
    updated[index].file = file;
    setNewDocs(updated);
  };

  const handleUploadNewDocs = async () => {
    if (newDocs.length === 0) return;
    
    // Validation
    for (const doc of newDocs) {
      if (!doc.file || !doc.type) {
        alert('Please select both a file and a type for all documents');
        return;
      }
    }

    try {
      setIsUploading(true);
      setUploadSuccess('');
      const formData = new FormData();
      
      newDocs.forEach(doc => {
        formData.append(doc.type, doc.file);
      });

      const res = await fetch(`${baseUrl}/api/enquiries/${id}`, {
        method: 'PATCH',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to upload documents');

      setUploadSuccess('Documents uploaded successfully!');
      setNewDocs([]);
      fetchEnquiry(); // Refresh data
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = (filePath) => {
    const url = filePath.startsWith('http') ? filePath : `${baseUrl}${filePath}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async (filePath, fileName) => {
    try {
      const url = filePath.startsWith('http') ? filePath : `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      const getExtension = (path) => {
        const parts = path.split('.');
        return parts.length > 1 ? parts.pop().split(/#|\?/)[0] : '';
      };
      const ext = getExtension(filePath);
      link.download = fileName ? `${fileName}${ext ? '.' + ext : ''}` : 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback
      const url = filePath.startsWith('http') ? filePath : `${baseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'APPROVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'FORWARDED': 'bg-blue-100 text-blue-800 border-blue-200',
      'ESCALATED': 'bg-purple-100 text-purple-800 border-purple-200',
      'IN_PROGRESS': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'COMPLETED': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading beneficiary details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                if (userRole === 'ADMIN') {
                  navigate('/admin/enquiry-management');
                } else {
                  navigate('/cmho-dashboard');
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (userRole === 'ADMIN') {
                    navigate('/admin/enquiry-management');
                  } else {
                    navigate('/cmho-dashboard');
                  }
                }}
                className="flex items-center text-gray-600 hover:text-gray-800 transition"
              >
                <FaArrowLeft className="mr-2" />
                {l.backToDashboard}
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{l.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">
                    {l.enquiryCode}: <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{enquiry?.enquiry_code || 'N/A'}</span>
                  </p>
                  {enquiry?.district?.district_name && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                      <FaMapMarkerAlt size={10} /> {enquiry.district.district_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLanguage(lang => (lang === 'en' ? 'hi' : 'en'))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                {language === 'en' ? 'हिन्दी' : 'English'}
              </button>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(enquiry?.status)}`}>
                {enquiry?.status?.replace('_', ' ')}
              </span>
              <button
                onClick={() => navigate(`/beneficiary-edit/${id}`)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <FaEdit className="mr-2" />
                {l.editDetails}
              </button>
              <button
                onClick={generatePDFReport}
                disabled={isGeneratingPDF}
                className={`flex items-center ${isGeneratingPDF ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg transition`}
              >
                <FaDownload className="mr-2" />
                {isGeneratingPDF ? 'Generating Report...' : 'Download Complete Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="report-container" className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  {l.personalInfo}
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{l.patientName}</label>
                    <p className="text-lg font-medium text-gray-900">{enquiry?.patient_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{l.fatherSpouseName}</label>
                    <p className="text-lg text-gray-900">{enquiry?.father_spouse_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{l.age}</label>
                    <p className="text-lg text-gray-900">{enquiry?.age} {l.years}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{l.gender}</label>
                    <p className="text-lg text-gray-900">{enquiry?.gender}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">{l.address}</label>
                    <p className="text-lg text-gray-900">{enquiry?.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaIdCard className="mr-2 text-green-600" />
                  {l.identityInfo}
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Identity Card (ABHA/PM JAY) */}
                  {enquiry?.identity_card_type && enquiry?.ayushman_card_number && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        {enquiry.identity_card_type === 'ABHA' ? l.abhaNumber : l.pmJayId}
                      </label>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          enquiry.identity_card_type === 'ABHA' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {enquiry.identity_card_type === 'ABHA' ? 'ABHA (14 digits)' : 'PM JAY (9 digits)'}
                        </span>
                        <p className="text-lg text-gray-900 font-mono">{enquiry.ayushman_card_number}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Legacy Ayushman Card (for backward compatibility) */}
                  {!enquiry?.identity_card_type && enquiry?.ayushman_card_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Ayushman Card</label>
                      <p className="text-lg text-gray-900 font-mono">{enquiry.ayushman_card_number}</p>
                    </div>
                  )}
                  
                  {/* Alternative Identity Cards */}
                  {enquiry?.aadhar_card_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">{l.aadharCard}</label>
                      <p className="text-lg text-gray-900 font-mono">{enquiry.aadhar_card_number}</p>
                    </div>
                  )}
                  {enquiry?.pan_card_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">{l.panCard}</label>
                      <p className="text-lg text-gray-900 font-mono">{enquiry.pan_card_number}</p>
                    </div>
                  )}
                  
                  {/* No Identity Cards Message */}
                  {!enquiry?.ayushman_card_number && !enquiry?.aadhar_card_number && !enquiry?.pan_card_number && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500 italic">{l.noIdentity}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaStethoscope className="mr-2 text-red-600" />
                  {l.medicalInfo}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{l.medicalCondition}</label>
                  <p className="text-gray-900">{enquiry?.medical_condition}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{l.chiefComplaint}</label>
                  <p className="text-gray-900">{enquiry?.chief_complaint}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{l.generalCondition}</label>
                    <p className="text-gray-900">{enquiry?.general_condition}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">{l.vitals}</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                      enquiry?.vitals === 'Stable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {enquiry?.vitals}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Ambulance Assignment Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaAmbulance className="mr-2 text-blue-600" />
                  Ambulance Assignment
                </h2>
              </div>
              {assignment ? (
                <div className="p-6 space-y-5">
                  {/* Status + ID row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Assignment ID</p>
                      <p className="text-lg font-black font-mono text-gray-800 mt-0.5">#{assignment.assignment_id}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                      assignment.status === 'COMPLETED'   ? 'bg-green-100 text-green-800 border-green-200' :
                      assignment.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {assignment.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Ambulance details */}
                  {assignment.ambulance && (
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3">Assigned Ambulance</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['Ambulance ID',    assignment.ambulance.ambulance_id],
                          ['Registration',    assignment.ambulance.registration_number],
                          ['Aircraft Type',   assignment.ambulance.aircraft_type],
                          ['Base Location',   assignment.ambulance.base_location],
                          ['Contact',         assignment.ambulance.contact_number],
                          ['Current Status',  assignment.ambulance.status],
                        ].map(([l, v]) => v ? (
                          <div key={l}>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{l}</p>
                            <p className={`text-sm font-bold mt-0.5 ${l === 'Registration' ? 'font-mono text-blue-700' : 'text-gray-800'}`}>{v}</p>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  )}

                  {/* Schedule */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Departure</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {assignment.departure_time ? new Date(assignment.departure_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Arrival</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {assignment.arrival_time ? new Date(assignment.arrival_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Crew */}
                  {assignment.crewMembers?.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Flight Crew</p>
                      <div className="flex flex-wrap gap-2">
                        {assignment.crewMembers.map(m => (
                          <div key={m.crew_id} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl">
                            <FaUserMd className="text-purple-500 text-xs" />
                            <div>
                              <p className="text-xs font-bold text-purple-800">{m.full_name}</p>
                              <p className="text-[9px] text-purple-500 uppercase font-bold">{m.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {assignment.crew_details && (
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Notes</p>
                      <p className="text-sm text-gray-600 italic bg-gray-50 rounded-xl p-3">{assignment.crew_details}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <FaAmbulance className="mx-auto text-3xl text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No ambulance assigned yet</p>
                  <p className="text-xs text-gray-300 mt-1">Assignment will appear here once created by the Air Team</p>
                </div>
              )}
            </div>

            {/* Referral & Transport Details */}
            {(enquiry?.referring_physician_name || enquiry?.transportation_category || enquiry?.ambulance_registration_number) && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaUserMd className="mr-2 text-teal-600" />
                    Referral & Transport Details
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      ['Referring Physician',        enquiry?.referring_physician_name],
                      ['Physician Designation',      enquiry?.referring_physician_designation],
                      ['Recommending Authority',     enquiry?.recommending_authority_name],
                      ['Recommending Designation',   enquiry?.recommending_authority_designation],
                      ['Approval Authority',         enquiry?.approval_authority_name],
                      ['Approval Designation',       enquiry?.approval_authority_designation],
                      ['Transportation Category',    enquiry?.transportation_category],
                      ['Air Transport Type',         enquiry?.air_transport_type],
                      ['Requested Ambulance Reg.',   enquiry?.ambulance_registration_number],
                      ['Ambulance Contact',          enquiry?.ambulance_contact],
                    ].filter(([, v]) => v).map(([l, v]) => (
                      <div key={l}>
                        <p className="text-xs font-medium text-gray-500 mb-0.5">{l}</p>
                        <p className="text-sm font-semibold text-gray-800">{v}</p>
                      </div>
                    ))}
                  </div>
                  {enquiry?.referral_note && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 mb-1">Referral Note</p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 italic">{enquiry.referral_note}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaPhone className="mr-2 text-purple-600" />
                  {l.contactDetails}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contact Person</label>
                  <p className="text-gray-900">{enquiry?.contact_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900 font-mono">{enquiry?.contact_phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{enquiry?.contact_email}</p>
                </div>
              </div>
            </div>

            {/* Hospital Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaHospital className="mr-2 text-indigo-600" />
                  {l.hospitalDetails}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{l.destinationHospital}</label>
                  <p className="text-gray-900">{enquiry?.hospital?.name || enquiry?.hospital?.hospital_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{l.sourceHospital}</label>
                  <p className="text-gray-900">{enquiry?.sourceHospital?.name || enquiry?.sourceHospital?.hospital_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{l.district}</label>
                  <p className="text-gray-900">{enquiry?.district?.district_name}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaCalendar className="mr-2 text-orange-600" />
                  {l.timeline}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{l.created}</label>
                  <p className="text-gray-900">{(enquiry?.created_at || enquiry?.createdAt) ? new Date(enquiry.created_at || enquiry.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">{l.lastUpdated}</label>
                  <p className="text-gray-900">{(enquiry?.updated_at || enquiry?.updatedAt) ? new Date(enquiry.updated_at || enquiry.updatedAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {enquiry?.documents && enquiry.documents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaFileAlt className="mr-2 text-yellow-600" />
                    {l.documents}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {enquiry.documents.map((doc, index) => (
                      <div key={doc.document_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FaFileAlt className="text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.document_type}</p>
                            <p className="text-xs text-gray-500 truncate" title={doc.file_path?.split('/').pop()}>{doc.file_path?.split('/').pop()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <a
                            href={doc.file_path?.startsWith('http') ? doc.file_path : `${baseUrl}${doc.file_path?.startsWith('/') ? '' : '/'}${doc.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                          >
                            <FaEye className="mr-1" />
                            {language === 'en' ? 'View' : 'देखें'}
                          </a>
                          <button
                            onClick={() => handleDownload(doc.file_path, doc.document_type)}
                            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          >
                            <FaDownload className="mr-1" />
                            {l.download}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Upload New Documents Section */}
            <div className="bg-white rounded-lg shadow-sm border mt-6">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaPlus className="mr-2 text-blue-600" />
                  {labels.documents || 'Documents (Required)'}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  JPEG / PNG / PDF · Max 5MB each
                </p>
              </div>
              <div className="px-6 py-4 border-b border-gray-200">
                <button
                  onClick={addDocumentInput}
                  className="w-full text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition flex items-center justify-center border-2 border-dashed border-blue-200 font-black uppercase tracking-widest"
                >
                  <FaPlus size={12} className="mr-2" />
                  {labels.addDocument || 'Add Document'}
                </button>
              </div>
              <div className="p-6">
                {uploadSuccess && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                    {uploadSuccess}
                  </div>
                )}
                
                {newDocs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {language === 'en' ? 'No new documents selected.' : 'कोई नया दस्तावेज़ नहीं चुना गया।'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {newDocs.map((doc, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex-1">
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(index, e.target.files[0])}
                            className="w-full text-xs"
                          />
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={doc.type}
                            onChange={(e) => handleDocTypeChange(index, e.target.value)}
                            className="text-xs p-1 border rounded"
                          >
                            <option value="">{language === 'en' ? 'Select Type' : 'प्रकार चुनें'}</option>
                            {documentTypeOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeDocumentInput(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      disabled={isUploading}
                      onClick={handleUploadNewDocs}
                      className="w-full flex items-center justify-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <FaSave className="mr-2" />
                      {isUploading 
                        ? (language === 'en' ? 'Uploading...' : 'अपलोड हो रहा है...') 
                        : (language === 'en' ? 'Save New Documents' : 'नए दस्तावेज़ सहेजें')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDetailPage;