import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiUser, FiMapPin, FiClock, FiPhone, FiMail } from 'react-icons/fi';
import ThemeTable from '../../../components/Common/ThemeTable';
import ThemeInput from '../../../components/Common/ThemeInput';
import ThemeButton from '../../../components/Common/ThemeButton';

const CaseDetailPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = [
        {
          enquiry_id: 12345,
          patient_name: 'John Doe',
          age: 45,
          gender: 'Male',
          medical_condition: 'Cardiac Emergency',
          pickup_location: 'Delhi AIIMS',
          drop_location: 'Mumbai Hospital',
          contact_number: '+91-9876543210',
          emergency_contact: '+91-9876543211',
          status: 'ASSIGNED',
          priority: 'HIGH',
          created_at: '2024-01-15 09:00:00',
          assignment: {
            ambulance_id: 'AA-001',
            crew_details: 'Pilot: John Smith, Medic: Jane Doe',
            status: 'IN_PROGRESS'
          }
        },
        {
          enquiry_id: 12346,
          patient_name: 'Sarah Wilson',
          age: 32,
          gender: 'Female',
          medical_condition: 'Accident Trauma',
          pickup_location: 'Bangalore General Hospital',
          drop_location: 'Chennai Apollo',
          contact_number: '+91-9876543212',
          emergency_contact: '+91-9876543213',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          created_at: '2024-01-14 14:30:00',
          assignment: {
            ambulance_id: 'AA-002',
            crew_details: 'Pilot: Mike Johnson, Medic: Lisa Brown',
            status: 'COMPLETED'
          }
        }
      ];
      setCases(mockData);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-600">View and manage patient case information</p>
        </div>
      </div>

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

      {/* Case Detail Modal */}
      {showDetailModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Case Details - #{selectedCase.enquiry_id}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Patient Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiUser className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Patient Name</p>
                      <p className="font-medium">{selectedCase.patient_name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium">{selectedCase.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium">{selectedCase.gender}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Medical Condition</p>
                    <p className="font-medium">{selectedCase.medical_condition}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiPhone className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-medium">{selectedCase.contact_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiPhone className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Emergency Contact</p>
                      <p className="font-medium">{selectedCase.emergency_contact}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Case Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiMapPin className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Pickup Location</p>
                      <p className="font-medium">{selectedCase.pickup_location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiMapPin className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Drop Location</p>
                      <p className="font-medium">{selectedCase.drop_location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Priority</p>
                      <div className="mt-1">{getPriorityBadge(selectedCase.priority)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedCase.status)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiClock className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-medium">{new Date(selectedCase.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment Information */}
            {selectedCase.assignment && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Assignment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ambulance ID</p>
                    <p className="font-medium">{selectedCase.assignment.ambulance_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Crew Details</p>
                    <p className="font-medium">{selectedCase.assignment.crew_details}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assignment Status</p>
                    <div className="mt-1">{getStatusBadge(selectedCase.assignment.status)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t">
              <ThemeButton onClick={() => setShowDetailModal(false)}>
                Close
              </ThemeButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetailPage;