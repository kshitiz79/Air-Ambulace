import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiEye, FiUser, FiMapPin, FiClock, FiPhone, FiMail, 
  FiRefreshCw, FiTruck, FiFileText, FiAlertCircle, FiFilter 
} from 'react-icons/fi';
import { 
  FaHospital, FaIdCard, FaStethoscope, FaUserMd, FaAmbulance,
  FaCalendar, FaDownload
} from 'react-icons/fa';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const CaseDetailPage = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch enquiries and flight assignments in parallel
      const [enquiriesRes, assignmentsRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, { headers }),
        fetch(`${baseUrl}/api/flight-assignments`, { headers })
      ]);

      if (!enquiriesRes.ok) {
        throw new Error('Failed to fetch enquiries');
      }

      const enquiriesData = await enquiriesRes.json();
      const assignmentsData = assignmentsRes.ok ? await assignmentsRes.json() : [];

      // Process enquiries data
      const enquiries = enquiriesData.data || enquiriesData || [];
      const assignmentsList = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || [];

      // Create a map of assignments by enquiry_id for quick lookup
      const assignmentMap = {};
      assignmentsList.forEach(assignment => {
        assignmentMap[assignment.enquiry_id] = assignment;
      });

      // Transform enquiries to match the expected case structure
      const transformedCases = enquiries.map(enquiry => ({
        enquiry_id: enquiry.enquiry_id,
        enquiry_code: enquiry.enquiry_code,
        patient_name: enquiry.patient_name,
        age: enquiry.age,
        gender: enquiry.gender,
        father_spouse_name: enquiry.father_spouse_name,
        address: enquiry.address,
        medical_condition: enquiry.medical_condition,
        chief_complaint: enquiry.chief_complaint,
        general_condition: enquiry.general_condition,
        vitals: enquiry.vitals,
        pickup_location: enquiry.sourceHospital?.name || enquiry.sourceHospital?.hospital_name || 'Source Hospital',
        drop_location: enquiry.hospital?.name || enquiry.hospital?.hospital_name || 'Destination Hospital',
        contact_number: enquiry.contact_phone,
        contact_name: enquiry.contact_name,
        contact_email: enquiry.contact_email,
        emergency_contact: enquiry.ambulance_contact || enquiry.contact_phone,
        status: enquiry.status || 'PENDING',
        priority: enquiry.air_transport_type === 'Free' ? 'HIGH' : 'MEDIUM', // Derive priority from transport type
        created_at: enquiry.created_at,
        updated_at: enquiry.updated_at,
        // Identity information
        ayushman_card_number: enquiry.ayushman_card_number,
        aadhar_card_number: enquiry.aadhar_card_number,
        pan_card_number: enquiry.pan_card_number,
        // Hospital and location info
        hospital: enquiry.hospital,
        sourceHospital: enquiry.sourceHospital,
        district: enquiry.district,
        // Transportation details
        transportation_category: enquiry.transportation_category,
        air_transport_type: enquiry.air_transport_type,
        ambulance_registration_number: enquiry.ambulance_registration_number,
        // Medical team and authority info
        referring_physician_name: enquiry.referring_physician_name,
        referring_physician_designation: enquiry.referring_physician_designation,
        recommending_authority_name: enquiry.recommending_authority_name,
        approval_authority_name: enquiry.approval_authority_name,
        bed_availability_confirmed: enquiry.bed_availability_confirmed,
        als_ambulance_arranged: enquiry.als_ambulance_arranged,
        medical_team_note: enquiry.medical_team_note,
        remarks: enquiry.remarks,
        // Documents
        documents: enquiry.documents || [],
        // Assignment information (if exists)
        assignment: assignmentMap[enquiry.enquiry_id] || null
      }));

      setCases(transformedCases);
      setAssignments(assignmentsList);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError('Failed to load case data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchCases();
  };

  const handleViewDetails = (caseData) => {
    setSelectedCase(caseData);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ASSIGNED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-purple-100 text-purple-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'HIGH': 'bg-red-100 text-red-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'LOW': 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
        {priority}
      </span>
    );
  };

  const filteredCases = cases.filter(caseData =>
    caseData.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseData.enquiry_id.toString().includes(searchTerm) ||
    caseData.medical_condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'enquiry_id', label: 'Case ID' },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'medical_condition', label: 'Condition' },
    { key: 'pickup_location', label: 'Pickup Location' },
    { key: 'drop_location', label: 'Drop Location' },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (value) => getPriorityBadge(value)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <FiEye size={16} />
          <span>View</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Details</h1>
          <p className="text-gray-600">View and manage patient case information from enquiry creation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="text-red-600" size={20} />
            <div>
              <h4 className="font-medium text-red-800">Error Loading Cases</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={refreshData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, case ID, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ThemeTable
          data={filteredCases}
          columns={columns}
          loading={loading}
          emptyMessage="No cases found"
        />
      </div>

      {/* Enhanced Case Detail Modal */}
      {showDetailModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Case Details</h3>
                  <p className="text-blue-100 mt-1">
                    Enquiry Code: {selectedCase.enquiry_code || `ENQ${selectedCase.enquiry_id}`}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    selectedCase.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    selectedCase.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                    selectedCase.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    selectedCase.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                    'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {selectedCase.status?.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white hover:text-gray-200 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Personal Information */}
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FiUser className="mr-2 text-blue-600" />
                        Personal Information
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Patient Name</label>
                          <p className="text-lg font-medium text-gray-900">{selectedCase.patient_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Father/Spouse Name</label>
                          <p className="text-lg text-gray-900">{selectedCase.father_spouse_name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Age</label>
                          <p className="text-lg text-gray-900">{selectedCase.age} years</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                          <p className="text-lg text-gray-900">{selectedCase.gender}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                          <p className="text-lg text-gray-900">{selectedCase.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Identity Cards */}
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaIdCard className="mr-2 text-green-600" />
                        Identity Information
                      </h4>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedCase.ayushman_card_number && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Ayushman Card</label>
                            <p className="text-lg text-gray-900 font-mono">{selectedCase.ayushman_card_number}</p>
                          </div>
                        )}
                        {selectedCase.aadhar_card_number && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Aadhar Card</label>
                            <p className="text-lg text-gray-900 font-mono">{selectedCase.aadhar_card_number}</p>
                          </div>
                        )}
                        {selectedCase.pan_card_number && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">PAN Card</label>
                            <p className="text-lg text-gray-900 font-mono">{selectedCase.pan_card_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaStethoscope className="mr-2 text-red-600" />
                        Medical Information
                      </h4>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Medical Condition</label>
                        <p className="text-gray-900">{selectedCase.medical_condition}</p>
                      </div>
                      {selectedCase.chief_complaint && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Chief Complaint</label>
                          <p className="text-gray-900">{selectedCase.chief_complaint}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCase.general_condition && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">General Condition</label>
                            <p className="text-gray-900">{selectedCase.general_condition}</p>
                          </div>
                        )}
                        {selectedCase.vitals && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Vitals</label>
                            <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                              selectedCase.vitals === 'Stable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {selectedCase.vitals}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transportation Details */}
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaAmbulance className="mr-2 text-purple-600" />
                        Transportation Details
                      </h4>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Transportation Category</label>
                          <p className="text-gray-900">{selectedCase.transportation_category || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Air Transport Type</label>
                          <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                            selectedCase.air_transport_type === 'Free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedCase.air_transport_type || 'N/A'}
                          </span>
                        </div>
                      </div>
                      {selectedCase.ambulance_registration_number && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Requested Ambulance Registration</label>
                          <p className="text-gray-900 font-mono bg-yellow-50 px-2 py-1 rounded">
                            {selectedCase.ambulance_registration_number}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Bed Availability Confirmed</label>
                          <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                            selectedCase.bed_availability_confirmed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedCase.bed_availability_confirmed ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">ALS Ambulance Arranged</label>
                          <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                            selectedCase.als_ambulance_arranged ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedCase.als_ambulance_arranged ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Right Side */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FiPhone className="mr-2 text-purple-600" />
                        Contact Details
                      </h4>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Contact Person</label>
                        <p className="text-gray-900">{selectedCase.contact_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <p className="text-gray-900 font-mono">{selectedCase.contact_number}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-gray-900">{selectedCase.contact_email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hospital Information */}
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaHospital className="mr-2 text-indigo-600" />
                        Hospital Details
                      </h4>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Source Hospital</label>
                        <p className="text-gray-900">{selectedCase.pickup_location}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Destination Hospital</label>
                        <p className="text-gray-900">{selectedCase.drop_location}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">District</label>
                        <p className="text-gray-900">{selectedCase.district?.district_name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white border rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FaCalendar className="mr-2 text-orange-600" />
                        Timeline
                      </h4>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                        <p className="text-gray-900">{new Date(selectedCase.created_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                        <p className="text-gray-900">{new Date(selectedCase.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Information */}
                  {selectedCase.assignment && (
                    <div className="bg-white border rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <FiTruck className="mr-2 text-blue-600" />
                          Flight Assignment
                        </h4>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Ambulance ID</label>
                          <p className="text-gray-900 font-mono">{selectedCase.assignment.ambulance_id}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Crew Details</label>
                          <p className="text-gray-900">{selectedCase.assignment.crew_details || 'Not assigned'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Assignment Status</label>
                          <div className="mt-1">{getStatusBadge(selectedCase.assignment.status)}</div>
                        </div>
                        {selectedCase.assignment.departure_time && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Departure Time</label>
                            <p className="text-gray-900">{new Date(selectedCase.assignment.departure_time).toLocaleString()}</p>
                          </div>
                        )}
                        {selectedCase.assignment.arrival_time && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Arrival Time</label>
                            <p className="text-gray-900">{new Date(selectedCase.assignment.arrival_time).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedCase.documents && selectedCase.documents.length > 0 && (
                    <div className="bg-white border rounded-lg">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                          <FiFileText className="mr-2 text-yellow-600" />
                          Documents ({selectedCase.documents.length})
                        </h4>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          {selectedCase.documents.map((doc, index) => (
                            <div key={doc.document_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FiFileText className="text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{doc.document_type}</p>
                                  <p className="text-xs text-gray-500">{doc.file_path?.split('/').pop()}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `${baseUrl}${doc.file_path}`;
                                  link.download = doc.document_type || 'document';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
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

              {/* Modal Footer */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="flex space-x-3">
                  <ThemeButton 
                    onClick={() => navigate(`/air-team/ambulance-assignment-page`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FiTruck className="mr-2" />
                    Assign Ambulance
                  </ThemeButton>
                  {selectedCase.assignment && (
                    <ThemeButton 
                      onClick={() => navigate(`/air-team/post-operation-page`)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <FiFileText className="mr-2" />
                      Submit Report
                    </ThemeButton>
                  )}
                </div>
                <ThemeButton onClick={() => setShowDetailModal(false)}>
                  Close
                </ThemeButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetailPage;