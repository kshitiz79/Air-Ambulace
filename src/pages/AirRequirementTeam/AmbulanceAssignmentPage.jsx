import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiEye, FiClock, FiMapPin, FiUser, FiCheckCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import ThemeInput from './../../components/Common/ThemeInput';
import baseUrl from '../../baseUrl/baseUrl';

const AmbulanceAssignmentPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [availableAmbulances, setAvailableAmbulances] = useState([]);
  const [availableEnquiries, setAvailableEnquiries] = useState([]);
  const [enquiryDetails, setEnquiryDetails] = useState(null);
  const [showMismatchWarning, setShowMismatchWarning] = useState(false);
  const [formData, setFormData] = useState({
    enquiry_code: '',
    ambulance_id: '',
    crew_details: '',
    departure_time: '',
    arrival_time: '',
    status: 'ASSIGNED'
  });

  useEffect(() => {
    fetchAssignments();
    fetchAvailableAmbulances();
    fetchAvailableEnquiries();
  }, []);

  const fetchAvailableEnquiries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/enquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const enquiriesList = Array.isArray(data) ? data : data.data || [];
        // Filter enquiries that are ready for assignment (more inclusive)
        const availableForAssignment = enquiriesList.filter(enquiry => 
          enquiry.status === 'APPROVED' || 
          enquiry.status === 'FORWARDED' || 
          enquiry.status === 'IN_PROGRESS' ||
          enquiry.status === 'ESCALATED' ||
          enquiry.status === 'PENDING'
        );
        setAvailableEnquiries(availableForAssignment);
      } else {
        console.error('Failed to fetch enquiries');
        setAvailableEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setAvailableEnquiries([]);
    }
  };

  const fetchAvailableAmbulances = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/ambulances/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setAvailableAmbulances(data.data);
      }
    } catch (error) {
      console.error('Error fetching available ambulances:', error);
    }
  };

  const fetchEnquiryDetails = async (enquiryCode) => {
    if (!enquiryCode) {
      setEnquiryDetails(null);
      setShowMismatchWarning(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Find the enquiry by code from the available enquiries
      const selectedEnquiry = availableEnquiries.find(enq => enq.enquiry_code === enquiryCode);
      if (selectedEnquiry) {
        const response = await fetch(`${baseUrl}/api/enquiries/${selectedEnquiry.enquiry_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setEnquiryDetails(data);
          
          // Check for mismatch when ambulance is already selected
          if (formData.ambulance_id) {
            checkAmbulanceMismatch(data, formData.ambulance_id);
          }
        } else {
          setEnquiryDetails(null);
          console.error('Failed to fetch enquiry details');
        }
      } else {
        setEnquiryDetails(null);
        console.error('Enquiry not found by code');
      }
    } catch (error) {
      console.error('Error fetching enquiry details:', error);
      setEnquiryDetails(null);
    }
  };

  const checkAmbulanceMismatch = (enquiry, selectedAmbulanceId) => {
    if (!enquiry || !enquiry.ambulance_registration_number || !selectedAmbulanceId) {
      setShowMismatchWarning(false);
      return;
    }

    const selectedAmbulance = availableAmbulances.find(a => a.ambulance_id === selectedAmbulanceId);
    if (selectedAmbulance) {
      const matches = selectedAmbulance.registration_number === enquiry.ambulance_registration_number;
      setShowMismatchWarning(!matches);
    }
  };

  const getAmbulanceGroups = () => {
    if (!enquiryDetails || !enquiryDetails.ambulance_registration_number) {
      return {
        matching: [],
        nonMatching: availableAmbulances
      };
    }

    const requestedRegNumber = enquiryDetails.ambulance_registration_number;
    const matching = availableAmbulances.filter(amb => 
      amb.registration_number === requestedRegNumber
    );
    const nonMatching = availableAmbulances.filter(amb => 
      amb.registration_number !== requestedRegNumber
    );

    return { matching, nonMatching };
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/flight-assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssignments(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch assignments');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = selectedAssignment 
        ? `${baseUrl}/api/flight-assignments/${selectedAssignment.assignment_id}`
        : `${baseUrl}/api/flight-assignments`;
      
      const method = selectedAssignment ? 'PUT' : 'POST';
      
      // Convert enquiry_code back to enquiry_id for API
      const selectedEnquiry = availableEnquiries.find(enq => enq.enquiry_code === formData.enquiry_code);
      const submitData = {
        ...formData,
        enquiry_id: selectedEnquiry?.enquiry_id
      };
      delete submitData.enquiry_code; // Remove enquiry_code as API expects enquiry_id
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        setShowModal(false);
        fetchAssignments();
        fetchAvailableAmbulances(); // Refresh available ambulances
        fetchAvailableEnquiries(); // Refresh available enquiries
        
        // Reset form
        setFormData({
          enquiry_code: '',
          ambulance_id: '',
          crew_details: '',
          departure_time: '',
          arrival_time: '',
          status: 'ASSIGNED'
        });
      } else {
        const errorData = await response.json();
        console.error('Error saving assignment:', errorData);
        alert('Failed to save assignment: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Failed to save assignment. Please try again.');
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    // Find the enquiry code from the assignment's enquiry_id
    const enquiry = availableEnquiries.find(enq => enq.enquiry_id === assignment.enquiry_id);
    setFormData({
      enquiry_code: enquiry?.enquiry_code || '',
      ambulance_id: assignment.ambulance_id,
      crew_details: assignment.crew_details,
      departure_time: assignment.departure_time?.slice(0, 16) || '',
      arrival_time: assignment.arrival_time?.slice(0, 16) || '',
      status: assignment.status
    });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'ASSIGNED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const columns = [
    { key: 'assignment_id', label: 'Assignment ID' },
    { 
      key: 'enquiry_code', 
      label: 'Enquiry Code',
      render: (value, row) => {
        // Find the enquiry code from the enquiry_id
        const enquiry = availableEnquiries.find(enq => enq.enquiry_id === row.enquiry_id);
        return (
          <div>
            <p className="font-mono text-sm">{enquiry?.enquiry_code || `ENQ${row.enquiry_id}`}</p>
            {enquiry && (
              <p className="text-xs text-gray-500">{enquiry.patient_name}</p>
            )}
          </div>
        );
      }
    },
    { key: 'ambulance_id', label: 'Ambulance ID' },
    { key: 'crew_details', label: 'Crew Details' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FiEdit size={16} />
          </button>
          <button className="text-green-600 hover:text-green-800">
            <FiEye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ambulance Assignments</h1>
          <p className="text-gray-600">Manage air ambulance flight assignments</p>
        </div>
        <ThemeButton
          onClick={() => {
            setSelectedAssignment(null);
            setFormData({
              enquiry_code: '',
              ambulance_id: '',
              crew_details: '',
              departure_time: '',
              arrival_time: '',
              status: 'ASSIGNED'
            });
            setShowModal(true);
          }}
          className="flex items-center space-x-2"
        >
          <FiPlus size={16} />
          <span>New Assignment</span>
        </ThemeButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiClock className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'ASSIGNED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiMapPin className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiUser className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ThemeTable
          data={assignments}
          columns={columns}
          loading={loading}
          emptyMessage="No assignments found"
        />
      </div>

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiFileText className="text-white" size={24} />
                  <h3 className="text-xl font-semibold text-white">
                    {selectedAssignment ? 'Edit Ambulance Assignment' : 'New Ambulance Assignment'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiXCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Enquiry Selection Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiCheckCircle className="mr-2 text-blue-600" />
                    Enquiry & Assignment Details
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Enquiry Selection */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Enquiry Code *
                        </label>
                        <select
                          value={formData.enquiry_code}
                          onChange={(e) => {
                            const newEnquiryCode = e.target.value;
                            setFormData({...formData, enquiry_code: newEnquiryCode});
                            fetchEnquiryDetails(newEnquiryCode);
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select an enquiry code</option>
                          {availableEnquiries.map((enquiry) => (
                            <option key={enquiry.enquiry_id} value={enquiry.enquiry_code}>
                              {enquiry.enquiry_code} - {enquiry.patient_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assignment Status *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="ASSIGNED">✅ Assigned</option>
                          <option value="IN_PROGRESS">🚁 In Progress</option>
                          <option value="COMPLETED">✅ Completed</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column - Enquiry Details */}
                    <div className="space-y-4">
                      {formData.enquiry_code && enquiryDetails && (
                        <div className="bg-white border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FiEye className="mr-2 text-blue-600" />
                            Enquiry Details
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Patient:</span>
                              <span className="text-gray-900">{enquiryDetails.patient_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Condition:</span>
                              <span className="text-gray-900">{enquiryDetails.medical_condition}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">From:</span>
                              <span className="text-gray-900">{enquiryDetails.sourceHospital?.name || 'Source Hospital'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">To:</span>
                              <span className="text-gray-900">{enquiryDetails.hospital?.name || 'Destination Hospital'}</span>
                            </div>
                            {enquiryDetails.ambulance_registration_number && (
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-600">Requested Reg:</span>
                                <span className="font-mono bg-yellow-100 px-2 py-1 rounded text-sm">
                                  {enquiryDetails.ambulance_registration_number}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                enquiryDetails.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                enquiryDetails.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                enquiryDetails.status === 'ESCALATED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {enquiryDetails.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mismatch Warning */}
                      {showMismatchWarning && enquiryDetails && formData.ambulance_id && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start space-x-2">
                            <span className="text-red-600 text-lg">⚠️</span>
                            <div>
                              <h4 className="font-semibold text-red-800">Registration Mismatch</h4>
                              <p className="text-red-700 text-sm mt-1">
                                Selected ambulance doesn't match requested registration
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ambulance & Schedule Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiMapPin className="mr-2 text-green-600" />
                    Ambulance & Schedule Details
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Ambulance Selection */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Ambulance *
                        </label>
                        <select
                          value={formData.ambulance_id}
                          onChange={(e) => {
                            const newAmbulanceId = e.target.value;
                            setFormData({...formData, ambulance_id: newAmbulanceId});
                            if (enquiryDetails) {
                              checkAmbulanceMismatch(enquiryDetails, newAmbulanceId);
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select an available ambulance</option>
                          
                          {(() => {
                            const { matching, nonMatching } = getAmbulanceGroups();
                            
                            return (
                              <>
                                {/* Requested/Matching Ambulances */}
                                {matching.length > 0 && (
                                  <optgroup label="✅ Requested Ambulance (Matches Enquiry)">
                                    {matching.map((ambulance) => (
                                      <option key={ambulance.ambulance_id} value={ambulance.ambulance_id}>
                                        🎯 {ambulance.ambulance_id} - {ambulance.aircraft_type} - {ambulance.registration_number}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                
                                {/* Other Available Ambulances */}
                                {nonMatching.length > 0 && (
                                  <optgroup label={matching.length > 0 ? "⚠️ Other Available Ambulances" : "Available Ambulances"}>
                                    {nonMatching.map((ambulance) => (
                                      <option key={ambulance.ambulance_id} value={ambulance.ambulance_id}>
                                        {ambulance.ambulance_id} - {ambulance.aircraft_type} - {ambulance.registration_number}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                              </>
                            );
                          })()}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departure Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.departure_time}
                          onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arrival Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.arrival_time}
                          onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Right Column - Ambulance Details & Crew */}
                    <div className="space-y-4">
                      {formData.ambulance_id && (
                        <div className="bg-white border border-green-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FiCheckCircle className="mr-2 text-green-600" />
                            Selected Ambulance Details
                          </h5>
                          {(() => {
                            const selected = availableAmbulances.find(a => a.ambulance_id === formData.ambulance_id);
                            return selected ? (
                              <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-600">ID:</span>
                                    <span className="text-gray-900">{selected.ambulance_id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-600">Registration:</span>
                                    <span className="font-mono text-gray-900">{selected.registration_number}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-600">Aircraft:</span>
                                    <span className="text-gray-900">{selected.aircraft_type}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-600">Base:</span>
                                    <span className="text-gray-900">{selected.base_location}</span>
                                  </div>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Crew Details
                        </label>
                        <textarea
                          value={formData.crew_details}
                          onChange={(e) => setFormData({...formData, crew_details: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          rows="4"
                          placeholder="Enter crew details such as:
• Pilot name and license number
• Medical officer details
• Additional crew members
• Special instructions or notes"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <ThemeButton 
                    type="submit" 
                    className="px-8 py-3 flex items-center space-x-2"
                  >
                    <FiCheckCircle size={18} />
                    <span>{selectedAssignment ? 'Update Assignment' : 'Create Assignment'}</span>
                  </ThemeButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceAssignmentPage;