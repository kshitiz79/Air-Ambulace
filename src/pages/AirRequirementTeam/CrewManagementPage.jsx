
import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiEye, 
  FiTrash2, 
  FiCheckCircle, 
  FiXCircle, 
  FiUser,
  FiPhone,
  FiMail,
  FiFileText,
  FiBriefcase,
  FiRefreshCw
} from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const CrewManagementPage = () => {
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    role: 'PILOT',
    phone: '',
    email: '',
    license_number: '',
    status: 'AVAILABLE'
  });

  useEffect(() => {
    fetchCrew();
  }, []);

  const fetchCrew = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/crew-members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCrew(data || []);
      } else {
        console.error('Failed to fetch crew');
        setCrew([]);
      }
    } catch (error) {
      console.error('Error fetching crew:', error);
      setCrew([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = selectedCrew 
        ? `${baseUrl}/api/crew-members/${selectedCrew.crew_id}`
        : `${baseUrl}/api/crew-members`;
      
      const method = selectedCrew ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        fetchCrew();
        resetForm();
        alert(selectedCrew ? 'Crew member updated successfully!' : 'Crew member added successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to save crew member'));
      }
    } catch (error) {
      console.error('Error saving crew:', error);
      alert('Failed to save crew member. Please try again.');
    }
  };

  const handleEdit = (member) => {
    setSelectedCrew(member);
    setFormData({
      full_name: member.full_name,
      role: member.role,
      phone: member.phone || '',
      email: member.email || '',
      license_number: member.license_number || '',
      status: member.status
    });
    setShowModal(true);
  };

  const handleDelete = async (crewId) => {
    if (!window.confirm('Are you sure you want to remove this crew member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/crew-members/${crewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchCrew();
        alert('Crew member removed successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to delete crew member'));
      }
    } catch (error) {
      console.error('Error deleting crew:', error);
      alert('Failed to delete crew member. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      role: 'PILOT',
      phone: '',
      email: '',
      license_number: '',
      status: 'AVAILABLE'
    });
    setSelectedCrew(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'AVAILABLE': 'bg-green-100 text-green-800',
      'ON_FLIGHT': 'bg-blue-100 text-blue-800',
      'OFF_DUTY': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const columns = [
    { 
      key: 'full_name', 
      label: 'Name',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <FiUser className="text-blue-600" size={14} />
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Role',
      render: (value) => (
        <span className="flex items-center space-x-1">
          <FiBriefcase size={12} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{value}</span>
        </span>
      )
    },
    { 
      key: 'phone', 
      label: 'Contact',
      render: (value, row) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center text-gray-600">
            <FiPhone size={10} className="mr-1" /> {value || 'N/A'}
          </div>
          <div className="flex items-center text-gray-500 italic">
            <FiMail size={10} className="mr-1" /> {row.email || 'N/A'}
          </div>
        </div>
      )
    },
    { 
      key: 'license_number', 
      label: 'License/ID',
      render: (value) => <span className="font-mono text-xs">{value || 'N/A'}</span>
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
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.crew_id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crew Member Management</h1>
          <p className="text-gray-600">Manage Pilots, Doctors, and other flight crew</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCrew}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <ThemeButton
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center space-x-2"
          >
            <FiPlus size={16} />
            <span>Add Member</span>
          </ThemeButton>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <ThemeTable
          data={crew}
          columns={columns}
          loading={loading}
          emptyMessage="No crew members found"
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-sm w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <FiUser className="mr-2" />
                {selectedCrew ? 'Edit Crew Member' : 'Add New Crew Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FiXCircle size={24} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="PILOT">Pilot</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="NURSE">Nurse</option>
                      <option value="PARAMEDIC">Paramedic</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="ON_FLIGHT">On Flight</option>
                      <option value="OFF_DUTY">Off Duty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number / ID</label>
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. CPL-12345"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    Cancel
                  </button>
                  <ThemeButton type="submit">
                    {selectedCrew ? 'Update Member' : 'Add Member'}
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

export default CrewManagementPage;
