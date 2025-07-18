import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft, FaUser, FaHospital, FaPhone, FaStethoscope, 
  FaIdCard, FaFileAlt, FaDownload, FaEdit, FaEye, FaCalendar,
  FaMapMarkerAlt, FaUserMd, FaAmbulance, FaClipboardCheck
} from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const BeneficiaryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnquiry = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${baseUrl}/api/enquiries/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch enquiry details');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Enquiry not found');
        }

        setEnquiry(data.data);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnquiry();
  }, [id]);

  const handleDownload = (filePath, fileName) => {
    const link = document.createElement('a');
    link.href = `${baseUrl}${filePath}`;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="bg-white rounded-lg shadow-lg p-8">
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
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/cmo-dashboard')}
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
                onClick={() => navigate('/cmo-dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Beneficiary Details</h1>
                <p className="text-sm text-gray-600">
                  Enquiry Code: {enquiry?.enquiry_code || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(enquiry?.status)}`}>
                {enquiry?.status?.replace('_', ' ')}
              </span>
              <button
                onClick={() => navigate(`/beneficiary-edit/${id}`)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <FaEdit className="mr-2" />
                Edit Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Personal Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Patient Name</label>
                    <p className="text-lg font-medium text-gray-900">{enquiry?.patient_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Father/Spouse Name</label>
                    <p className="text-lg text-gray-900">{enquiry?.father_spouse_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Age</label>
                    <p className="text-lg text-gray-900">{enquiry?.age} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                    <p className="text-lg text-gray-900">{enquiry?.gender}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                    <p className="text-lg text-gray-900">{enquiry?.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Cards */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaIdCard className="mr-2 text-green-600" />
                  Identity Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enquiry?.ayushman_card_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Ayushman Card</label>
                      <p className="text-lg text-gray-900 font-mono">{enquiry.ayushman_card_number}</p>
                    </div>
                  )}
                  {enquiry?.aadhar_card_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Aadhar Card</label>
                      <p className="text-lg text-gray-900 font-mono">{enquiry.aadhar_card_number}</p>
                    </div>
                  )}
                  {enquiry?.pan_card_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">PAN Card</label>
                      <p className="text-lg text-gray-900 font-mono">{enquiry.pan_card_number}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaStethoscope className="mr-2 text-red-600" />
                  Medical Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Medical Condition</label>
                  <p className="text-gray-900">{enquiry?.medical_condition}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Chief Complaint</label>
                  <p className="text-gray-900">{enquiry?.chief_complaint}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">General Condition</label>
                    <p className="text-gray-900">{enquiry?.general_condition}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Vitals</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                      enquiry?.vitals === 'Stable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {enquiry?.vitals}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaPhone className="mr-2 text-purple-600" />
                  Contact Details
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
                  Hospital Details
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Destination Hospital</label>
                  <p className="text-gray-900">{enquiry?.hospital?.name || enquiry?.hospital?.hospital_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Source Hospital</label>
                  <p className="text-gray-900">{enquiry?.sourceHospital?.name || enquiry?.sourceHospital?.hospital_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">District</label>
                  <p className="text-gray-900">{enquiry?.district?.district_name}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaCalendar className="mr-2 text-orange-600" />
                  Timeline
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                  <p className="text-gray-900">{new Date(enquiry?.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                  <p className="text-gray-900">{new Date(enquiry?.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {enquiry?.documents && enquiry.documents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaFileAlt className="mr-2 text-yellow-600" />
                    Documents
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {enquiry.documents.map((doc, index) => (
                      <div key={doc.document_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FaFileAlt className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.document_type}</p>
                            <p className="text-xs text-gray-500">{doc.file_path?.split('/').pop()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(doc.file_path, doc.document_type)}
                          className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          <FaDownload className="mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiaryDetailPage;