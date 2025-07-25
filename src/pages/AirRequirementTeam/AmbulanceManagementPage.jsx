import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiEye, 
  FiTrash2, 
  FiCheckCircle, 
  FiXCircle, 
  FiTool, 
  FiAlertTriangle,
  FiRefreshCw,
  FiMapPin,
  FiSettings,
  FiActivity
} from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const AmbulanceManagementPage = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [stats, setStats] = useState({});
  const [formData, setFormData] = useState({
    ambulance_id: '',
    aircraft_type: '',
    registration_number: '',
    status: 'AVAILABLE',
    base_location: ''
  });

  useEffect(() => {
    fetchAmbulances();
    fetchStats();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/ambulances`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAmbulances(data.data || []);
      } else {
        console.error('Failed to fetch ambulances');
        setAmbulances([]);
      }
    } catch (error) {
      console.error('Error fetching ambulances:', error);
      setAmbulances([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/ambulances/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = selectedAmbulance 
        ? `${baseUrl}/api/ambulances/${selectedAmbulance.ambulance_id}`
        : `${baseUrl}/api/ambulances`;
      
      const method = selectedAmbulance ? 'PUT' : 'POST';
      
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
        fetchAmbulances();
        fetchStats();
        resetForm();
        alert(selectedAmbulance ? 'Ambulance updated successfully!' : 'Ambulance created successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to save ambulance'));
      }
    } catch (error) {
      console.error('Error saving ambulance:', error);
      alert('Failed to save ambulance. Please try again.');
    }
  };

  const handleEdit = (ambulance) => {
    setSelectedAmbulance(ambulance);
    setFormData({
      ambulance_id: ambulance.ambulance_id,
      aircraft_type: ambulance.aircraft_type,
      registration_number: ambulance.registration_number,
      status: ambulance.status,
      base_location: ambulance.base_location
    });
    setShowModal(true);
  };

  const handleDelete = async (ambulanceId) => {
    if (!window.confirm('Are you sure you want to delete this ambulance? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/ambulances/${ambulanceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchAmbulances();
        fetchStats();
        alert('Ambulance deleted successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to delete ambulance'));
      }
    } catch (error) {
      console.error('Error deleting ambulance:', error);
      alert('Failed to delete ambulance. Please try again.');
    }
  };

  const updateStatus = async (ambulanceId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/ambulances/${ambulanceId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchAmbulances();
        fetchStats();
        alert(`Ambulance status updated to ${newStatus}!`);
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to update status'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      ambulance_id: '',
      aircraft_type: '',
      registration_number: '',
      status: 'AVAILABLE',
      base_location: ''
    });
    setSelectedAmbulance(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'AVAILABLE': {
        color: 'bg-green-100 text-green-800',
        icon: <FiCheckCircle size={14} />
      },
      'IN_USE': {
        color: 'bg-blue-100 text-blue-800',
        icon: <FiActivity size={14} />
      },
      'MAINTENANCE': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FiTool size={14} />
      },
      'OUT_OF_SERVICE': {
        color: 'bg-red-100 text-red-800',
        icon: <FiXCircle size={14} />
      }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.color}`}>
        {config.icon}
        <span>{status.replace('_', ' ')}</span>
      </span>
    );
  };

  const columns = [
    { 
      key: 'ambulance_id', 
      label: 'Ambulance ID',
      render: (value) => <span className="font-mono font-medium">{value}</span>
    },
    { 
      key: 'aircraft_type', 
      label: 'Aircraft Type',
      render: (value) => <span className="text-sm">{value}</span>
    },
    { 
      key: 'registration_number', 
      label: 'Registration',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    },
    { 
      key: 'base_location', 
      label: 'Base Location',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <FiMapPin size={12} className="text-gray-500" />
          <span className="text-sm">{value}</span>
        </div>
      )
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
            className="text-green-600 hover:text-green-800"
            title="View Details"
          >
            <FiEye size={16} />
          </button>
          {row.status === 'AVAILABLE' && (
            <button
              onClick={() => updateStatus(row.ambulance_id, 'MAINTENANCE')}
              className="text-yellow-600 hover:text-yellow-800"
              title="Set to Maintenance"
            >
              <FiTool size={16} />
            </button>
          )}
          {row.status === 'MAINTENANCE' && (
            <button
              onClick={() => updateStatus(row.ambulance_id, 'AVAILABLE')}
              className="text-green-600 hover:text-green-800"
              title="Set to Available"
            >
              <FiCheckCircle size={16} />
            </button>
          )}
          <button
            onClick={() => handleDelete(row.ambulance_id)}
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
      {/* Header - Fixed */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ambulance Fleet Management</h1>
          <p className="text-gray-600">Manage air ambulance fleet</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { fetchAmbulances(); fetchStats(); }}
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
            <span>Add Ambulance</span>
          </ThemeButton>
        </div>
      </div>

      {/* Stats Cards - Fixed */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.statusBreakdown?.AVAILABLE || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiActivity className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">In Use</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.statusBreakdown?.IN_USE || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiTool className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.statusBreakdown?.MAINTENANCE || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiAlertTriangle className="text-red-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Out of Service</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.statusBreakdown?.OUT_OF_SERVICE || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ambulances Table - Scrollable */}
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-full overflow-auto">
          <ThemeTable
            data={ambulances}
            columns={columns}
            loading={loading}
            emptyMessage="No ambulances found"
          />
        </div>
      </div>

      {/* Ambulance Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiSettings className="text-white" size={24} />
                  <h3 className="text-xl font-semibold text-white">
                    {selectedAmbulance ? 'Edit Ambulance' : 'Add New Ambulance'}
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
                {/* Basic Information Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiSettings className="mr-2 text-blue-600" />
                    Ambulance Information
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ambulance ID *
                        </label>
                        <input
                          type="text"
                          value={formData.ambulance_id}
                          onChange={(e) => setFormData({...formData, ambulance_id: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="AA-001"
                          pattern="^AA-\d{3}$"
                          title="Format: AA-001, AA-002, etc."
                          required
                          disabled={selectedAmbulance} // Don't allow editing ID
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: AA-001, AA-002, etc.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aircraft Type *
                        </label>
                        <select
                          value={formData.aircraft_type}
                          onChange={(e) => setFormData({...formData, aircraft_type: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select aircraft type</option>
                          <option value="Helicopter - Bell 429">Helicopter - Bell 429</option>
                          <option value="Helicopter - Bell 407">Helicopter - Bell 407</option>
                          <option value="Helicopter - Airbus H145">Helicopter - Airbus H145</option>
                          <option value="Fixed Wing - Beechcraft King Air">Fixed Wing - Beechcraft King Air</option>
                          <option value="Fixed Wing - Cessna Citation">Fixed Wing - Cessna Citation</option>
                          <option value="Fixed Wing - Piper Cheyenne">Fixed Wing - Piper Cheyenne</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Registration Number *
                        </label>
                        <input
                          type="text"
                          value={formData.registration_number}
                          onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="VT-ABC001"
                          required
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base Location *
                        </label>
                        <select
                          value={formData.base_location}
                          onChange={(e) => setFormData({...formData, base_location: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select base location</option>
                          <option value="Bhopal Airport">Bhopal Airport</option>
                          <option value="Indore Airport">Indore Airport</option>
                          <option value="Jabalpur Airport">Jabalpur Airport</option>
                          <option value="Gwalior Airport">Gwalior Airport</option>
                          <option value="Ujjain Helipad">Ujjain Helipad</option>
                          <option value="Rewa Airport">Rewa Airport</option>
                          <option value="Satna Airport">Satna Airport</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="AVAILABLE">✅ Available</option>
                          <option value="IN_USE">🚁 In Use</option>
                          <option value="MAINTENANCE">🔧 Maintenance</option>
                          <option value="OUT_OF_SERVICE">❌ Out of Service</option>
                        </select>
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
                    <span>{selectedAmbulance ? 'Update Ambulance' : 'Add Ambulance'}</span>
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

export default AmbulanceManagementPage;