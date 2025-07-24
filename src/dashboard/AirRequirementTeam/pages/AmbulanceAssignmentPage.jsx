import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiEye, FiClock, FiMapPin, FiUser } from 'react-icons/fi';
import ThemeTable from '../../../components/Common/ThemeTable';
import ThemeButton from '../../../components/Common/ThemeButton';
import ThemeInput from '../../../components/Common/ThemeInput';

const AmbulanceAssignmentPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    enquiry_id: '',
    ambulance_id: '',
    crew_details: '',
    departure_time: '',
    arrival_time: '',
    status: 'ASSIGNED'
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = [
        {
          assignment_id: 1,
          enquiry_id: 12345,
          ambulance_id: 'AA-001',
          crew_details: 'Pilot: John Doe, Medic: Jane Smith',
          departure_time: '2024-01-15 10:30:00',
          arrival_time: '2024-01-15 12:45:00',
          status: 'COMPLETED',
          created_at: '2024-01-15 09:00:00'
        },
        {
          assignment_id: 2,
          enquiry_id: 12346,
          ambulance_id: 'AA-002',
          crew_details: 'Pilot: Mike Johnson, Medic: Sarah Wilson',
          departure_time: '2024-01-15 14:00:00',
          arrival_time: null,
          status: 'IN_PROGRESS',
          created_at: '2024-01-15 13:30:00'
        }
      ];
      setAssignments(mockData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to create/update assignment
      console.log('Submitting assignment:', formData);
      setShowModal(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      enquiry_id: assignment.enquiry_id,
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
    { key: 'enquiry_id', label: 'Enquiry ID' },
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
              enquiry_id: '',
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedAssignment ? 'Edit Assignment' : 'New Assignment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ThemeInput
                label="Enquiry ID"
                type="number"
                value={formData.enquiry_id}
                onChange={(e) => setFormData({...formData, enquiry_id: e.target.value})}
                required
              />
              <ThemeInput
                label="Ambulance ID"
                value={formData.ambulance_id}
                onChange={(e) => setFormData({...formData, ambulance_id: e.target.value})}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crew Details
                </label>
                <textarea
                  value={formData.crew_details}
                  onChange={(e) => setFormData({...formData, crew_details: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <ThemeInput
                label="Departure Time"
                type="datetime-local"
                value={formData.departure_time}
                onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
              />
              <ThemeInput
                label="Arrival Time"
                type="datetime-local"
                value={formData.arrival_time}
                onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <ThemeButton type="submit" className="flex-1">
                  {selectedAssignment ? 'Update' : 'Create'}
                </ThemeButton>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceAssignmentPage;