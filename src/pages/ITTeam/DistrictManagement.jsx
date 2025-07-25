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
  FiXCircle
} from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const DistrictManagement = () => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [formData, setFormData] = useState({
    district_name: '',
    state: '',
    district_code: '',
    population: '',
    area_sq_km: ''
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      setLoading(true);
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
      } else {
        console.error('Failed to fetch districts');
        setDistricts([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = selectedDistrict 
        ? `${baseUrl}/api/districts/${selectedDistrict.district_id}`
        : `${baseUrl}/api/districts`;
      
      const method = selectedDistrict ? 'PUT' : 'POST';
      
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
        fetchDistricts();
        resetForm();
        alert(selectedDistrict ? 'District updated successfully!' : 'District created successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to save district'));
      }
    } catch (error) {
      console.error('Error saving district:', error);
      alert('Failed to save district. Please try again.');
    }
  };

  const handleEdit = (district) => {
    setSelectedDistrict(district);
    setFormData({
      district_name: district.district_name,
      state: district.state,
      district_code: district.district_code,
      population: district.population?.toString() || '',
      area_sq_km: district.area_sq_km?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (districtId) => {
    if (!window.confirm('Are you sure you want to delete this district? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/districts/${districtId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchDistricts();
        alert('District deleted successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to delete district'));
      }
    } catch (error) {
      console.error('Error deleting district:', error);
      alert('Failed to delete district. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      district_name: '',
      state: '',
      district_code: '',
      population: '',
      area_sq_km: ''
    });
    setSelectedDistrict(null);
  };

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implement Excel upload functionality
      alert('Excel upload functionality will be implemented soon!');
    }
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export functionality
    alert('Excel export functionality will be implemented soon!');
  };

  const columns = [
    { 
      key: 'district_id', 
      label: 'ID',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    },
    { 
      key: 'district_name', 
      label: 'District Name',
      render: (value) => <span className="font-medium">{value}</span>
    },
    { 
      key: 'state', 
      label: 'State',
      render: (value) => <span className="text-sm">{value}</span>
    },
    { 
      key: 'district_code', 
      label: 'Code',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    },
    { 
      key: 'population', 
      label: 'Population',
      render: (value) => value ? <span className="text-sm">{value.toLocaleString()}</span> : '-'
    },
    { 
      key: 'area_sq_km', 
      label: 'Area (sq km)',
      render: (value) => value ? <span className="text-sm">{value}</span> : '-'
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
            onClick={() => handleDelete(row.district_id)}
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
          <h1 className="text-2xl font-bold text-gray-900">District Management</h1>
          <p className="text-gray-600">Manage districts and administrative divisions</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
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
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiDownload className="mr-2" />
            Export Excel
          </button>
          <button
            onClick={fetchDistricts}
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
            <span>Add District</span>
          </ThemeButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiMapPin className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Districts</p>
              <p className="text-2xl font-bold text-gray-900">{districts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Active Districts</p>
              <p className="text-2xl font-bold text-gray-900">{districts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiMapPin className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">States Covered</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(districts.map(d => d.state)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Districts Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ThemeTable
          data={districts}
          columns={columns}
          loading={loading}
          emptyMessage="No districts found"
        />
      </div>

      {/* District Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiMapPin className="text-white" size={24} />
                  <h3 className="text-xl font-semibold text-white">
                    {selectedDistrict ? 'Edit District' : 'Add New District'}
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
                        District Name *
                      </label>
                      <input
                        type="text"
                        value={formData.district_name}
                        onChange={(e) => setFormData({...formData, district_name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter district name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter state name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District Code
                      </label>
                      <input
                        type="text"
                        value={formData.district_code}
                        onChange={(e) => setFormData({...formData, district_code: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter district code"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Population
                      </label>
                      <input
                        type="number"
                        value={formData.population}
                        onChange={(e) => setFormData({...formData, population: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter population"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area (sq km)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.area_sq_km}
                        onChange={(e) => setFormData({...formData, area_sq_km: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter area in square kilometers"
                        min="0"
                      />
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
                    <span>{selectedDistrict ? 'Update District' : 'Add District'}</span>
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

export default DistrictManagement;