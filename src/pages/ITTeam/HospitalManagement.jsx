import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiRefreshCw,
  FiMapPin,
  FiUpload,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiPhone,
  FiMail
} from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    district_id: '',
    contact_number: '',
    email: '',
    hospital_type: 'GOVERNMENT',
    specialties: '',
    bed_capacity: '',
    emergency_services: true
  });

  useEffect(() => {
    fetchHospitals();
    fetchDistricts();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/hospitals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHospitals(Array.isArray(data) ? data : data.data || []);
      } else {
        console.error('Failed to fetch hospitals');
        setHospitals([]);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/districts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDistricts(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = selectedHospital 
        ? `${baseUrl}/api/hospitals/${selectedHospital.hospital_id}`
        : `${baseUrl}/api/hospitals`;
      
      const method = selectedHospital ? 'PUT' : 'POST';
      
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
        fetchHospitals();
        resetForm();
        alert(selectedHospital ? 'Hospital updated successfully!' : 'Hospital created successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to save hospital'));
      }
    } catch (error) {
      console.error('Error saving hospital:', error);
      alert('Failed to save hospital. Please try again.');
    }
  };

  const handleEdit = (hospital) => {
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name,
      address: hospital.address,
      district_id: hospital.district_id?.toString() || '',
      contact_number: hospital.contact_number || '',
      email: hospital.email || '',
      hospital_type: hospital.hospital_type || 'GOVERNMENT',
      specialties: hospital.specialties || '',
      bed_capacity: hospital.bed_capacity?.toString() || '',
      emergency_services: hospital.emergency_services !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (hospitalId) => {
    if (!window.confirm('Are you sure you want to delete this hospital? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/hospitals/${hospitalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchHospitals();
        alert('Hospital deleted successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to delete hospital'));
      }
    } catch (error) {
      console.error('Error deleting hospital:', error);
      alert('Failed to delete hospital. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      district_id: '',
      contact_number: '',
      email: '',
      hospital_type: 'GOVERNMENT',
      specialties: '',
      bed_capacity: '',
      emergency_services: true
    });
    setSelectedHospital(null);
  };

  const getHospitalTypeBadge = (type) => {
    const typeConfig = {
      'GOVERNMENT': { color: 'bg-blue-100 text-blue-800', label: 'Government' },
      'PRIVATE': { color: 'bg-green-100 text-green-800', label: 'Private' },
      'TRUST': { color: 'bg-purple-100 text-purple-800', label: 'Trust' },
      'CORPORATE': { color: 'bg-orange-100 text-orange-800', label: 'Corporate' }
    };
    
    const config = typeConfig[type] || typeConfig['GOVERNMENT'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    { 
      key: 'hospital_id', 
      label: 'ID',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    },
    { 
      key: 'name', 
      label: 'Hospital Name',
      render: (value) => <span className="font-medium">{value}</span>
    },
    { 
      key: 'hospital_type', 
      label: 'Type',
      render: (value) => getHospitalTypeBadge(value)
    },
    { 
      key: 'district', 
      label: 'District',
      render: (value, row) => {
        const district = districts.find(d => d.district_id === row.district_id);
        return district ? district.district_name : 'Unknown';
      }
    },
    { 
      key: 'contact_number', 
      label: 'Contact',
      render: (value) => value ? (
        <div className="flex items-center space-x-1">
          <FiPhone size={12} className="text-gray-500" />
          <span className="text-sm">{value}</span>
        </div>
      ) : '-'
    },
    { 
      key: 'bed_capacity', 
      label: 'Beds',
      render: (value) => value ? <span className="text-sm">{value}</span> : '-'
    },
    { 
      key: 'emergency_services', 
      label: 'Emergency',
      render: (value) => value ? (
        <FiCheckCircle className="text-green-600" size={16} />
      ) : (
        <FiXCircle className="text-red-600" size={16} />
      )
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
            onClick={() => handleDelete(row.hospital_id)}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Management</h1>
          <p className="text-gray-600">Manage hospitals and healthcare facilities</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            <FiUpload className="mr-2" />
            Import Excel
          </label>
          <button
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiDownload className="mr-2" />
            Export Excel
          </button>
          <button
            onClick={fetchHospitals}
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
            <span>Add Hospital</span>
          </ThemeButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiMapPin className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Hospitals</p>
              <p className="text-2xl font-bold text-gray-900">{hospitals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Government</p>
              <p className="text-2xl font-bold text-gray-900">
                {hospitals.filter(h => h.hospital_type === 'GOVERNMENT').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiMapPin className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Private</p>
              <p className="text-2xl font-bold text-gray-900">
                {hospitals.filter(h => h.hospital_type === 'PRIVATE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCheckCircle className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Emergency Services</p>
              <p className="text-2xl font-bold text-gray-900">
                {hospitals.filter(h => h.emergency_services).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hospitals Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ThemeTable
          data={hospitals}
          columns={columns}
          loading={loading}
          emptyMessage="No hospitals found"
        />
      </div>

      {/* Hospital Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiMapPin className="text-white" size={24} />
                  <h3 className="text-xl font-semibold text-white">
                    {selectedHospital ? 'Edit Hospital' : 'Add New Hospital'}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter hospital name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        rows="3"
                        placeholder="Enter hospital address"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District *
                      </label>
                      <select
                        value={formData.district_id}
                        onChange={(e) => setFormData({...formData, district_id: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select district</option>
                        {districts.map((district) => (
                          <option key={district.district_id} value={district.district_id}>
                            {district.district_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital Type *
                      </label>
                      <select
                        value={formData.hospital_type}
                        onChange={(e) => setFormData({...formData, hospital_type: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="GOVERNMENT">Government</option>
                        <option value="PRIVATE">Private</option>
                        <option value="TRUST">Trust</option>
                        <option value="CORPORATE">Corporate</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_number}
                        onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter contact number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bed Capacity
                      </label>
                      <input
                        type="number"
                        value={formData.bed_capacity}
                        onChange={(e) => setFormData({...formData, bed_capacity: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter bed capacity"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialties
                      </label>
                      <textarea
                        value={formData.specialties}
                        onChange={(e) => setFormData({...formData, specialties: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        rows="2"
                        placeholder="Enter medical specialties"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emergency_services"
                        checked={formData.emergency_services}
                        onChange={(e) => setFormData({...formData, emergency_services: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="emergency_services" className="ml-2 block text-sm text-gray-900">
                        Emergency Services Available
                      </label>
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
                    <span>{selectedHospital ? 'Update Hospital' : 'Add Hospital'}</span>
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

export default HospitalManagement;