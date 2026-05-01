import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaHospital,
  FaPlus,
  FaList,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaEye,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaBuilding,
  FaFilter,
  FaSyncAlt,
  FaExclamationTriangle,
  FaUpload,
  FaFileExcel,
  FaDownload
} from 'react-icons/fa';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const CreateHospital = () => {
  const styles = useThemeStyles();
  const [formData, setFormData] = useState({
    hospital_name: '',
    district_id: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    hospital_type: 'PRIVATE',
    contact_person_name: '',
    contact_person_phone: '',
    contact_person_email: '',
    registration_number: '',
  });

  const [districts, setDistricts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [editingHospital, setEditingHospital] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] = useState({
    district: 'ALL',
    type: 'ALL',
    search: ''
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalHospitals: 0,
    privateHospitals: 0,
    governmentHospitals: 0,
    hospitalsByDistrict: []
  });

  // Fetch districts and hospitals on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter hospitals when filter changes
  useEffect(() => {
    filterHospitals();
  }, [hospitals, filter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');

      // Fetch districts for the dropdown
      const districtResponse = await axios.get(`${baseUrl}/api/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDistricts(districtResponse.data.data || districtResponse.data);

      // Fetch hospitals for the list
      const hospitalResponse = await axios.get(`${baseUrl}/api/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hospitalData = hospitalResponse.data.data || [];
      setHospitals(hospitalData);

      // Calculate dashboard statistics
      calculateStats(hospitalData);

    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (hospitalData) => {
    const stats = {
      totalHospitals: hospitalData.length,
      privateHospitals: hospitalData.filter(h => h.hospital_type === 'PRIVATE').length,
      governmentHospitals: hospitalData.filter(h => h.hospital_type === 'GOVERNMENT').length,
      hospitalsByDistrict: []
    };

    // Calculate hospitals by district
    const districtMap = {};
    hospitalData.forEach(hospital => {
      const districtName = hospital.district?.district_name || 'Unknown';
      districtMap[districtName] = (districtMap[districtName] || 0) + 1;
    });

    stats.hospitalsByDistrict = Object.entries(districtMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setDashboardStats(stats);
  };

  const filterHospitals = () => {
    let filtered = hospitals;

    if (filter.district !== 'ALL') {
      filtered = filtered.filter(h => h.district_id?.toString() === filter.district);
    }

    if (filter.type !== 'ALL') {
      filtered = filtered.filter(h => h.hospital_type === filter.type);
    }

    if (filter.search) {
      filtered = filtered.filter(h =>
        h.name?.toLowerCase().includes(filter.search.toLowerCase()) ||
        h.hospital_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
        h.contact_person_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
        h.registration_number?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }

    setFilteredHospitals(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseUrl}/api/hospitals`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Hospital created successfully!');
      setFormData({
        hospital_name: '',
        district_id: '',
        address: '',
        contact_phone: '',
        contact_email: '',
        hospital_type: 'PRIVATE',
        contact_person_name: '',
        contact_person_phone: '',
        contact_person_email: '',
        registration_number: '',
      });

      // Refresh hospital list
      fetchData();
      setActiveTab('list');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create hospital');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setFormData({
      hospital_name: hospital.name || hospital.hospital_name || '',
      district_id: hospital.district_id || '',
      address: hospital.address || '',
      contact_phone: hospital.contact_phone || '',
      contact_email: hospital.contact_email || '',
      hospital_type: hospital.hospital_type || 'PRIVATE',
      contact_person_name: hospital.contact_person_name || '',
      contact_person_phone: hospital.contact_person_phone || '',
      contact_person_email: hospital.contact_person_email || '',
      registration_number: hospital.registration_number || '',
    });
    setActiveTab('create');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${baseUrl}/api/hospitals/${editingHospital.hospital_id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Hospital updated successfully!');
      setEditingHospital(null);
      setFormData({
        hospital_name: '',
        district_id: '',
        address: '',
        contact_phone: '',
        contact_email: '',
        hospital_type: 'PRIVATE',
        contact_person_name: '',
        contact_person_phone: '',
        contact_person_email: '',
        registration_number: '',
      });

      fetchData();
      setActiveTab('list');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update hospital');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hospitalId) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return;

    setDeletingId(hospitalId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseUrl}/api/hospitals/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Hospital deleted successfully!');
      fetchData();

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete hospital');
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingHospital(null);
    setFormData({
      hospital_name: '',
      district_id: '',
      address: '',
      contact_phone: '',
      contact_email: '',
      hospital_type: 'PRIVATE',
      contact_person_name: '',
      contact_person_phone: '',
      contact_person_email: '',
      registration_number: '',
    });
    setError('');
    setSuccess('');
  };

  const downloadSampleTemplate = async (format) => {
    setLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Hospitals Template');
      
      // Define headers
      worksheet.columns = [
        { header: 'Hospital Name*', key: 'hospital_name', width: 20 },
        { header: 'District Name/ID*', key: 'district', width: 25 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Type (PRIVATE/GOVERNMENT)', key: 'type', width: 25 },
        { header: 'Reg. Number', key: 'reg_num', width: 20 },
        { header: 'Contact Person', key: 'cp_name', width: 20 },
        { header: 'CP Phone', key: 'cp_phone', width: 15 },
        { header: 'CP Email', key: 'cp_email', width: 25 },
      ];
      
      // Add some sample data
      worksheet.addRow({
        hospital_name: 'City Hospital',
        district: districts[0]?.district_name || 'Bhopal',
        address: '123 Main St',
        phone: '0755-123456',
        email: 'info@cityhosp.com',
        type: 'PRIVATE',
        reg_num: 'REG123',
        cp_name: 'John Doe',
        cp_phone: '9876543210',
        cp_email: 'john@cityhosp.com'
      });
  
      // Add instructions
      worksheet.addRow({});
      worksheet.addRow(['* Required fields']);
  
      if (format === 'xlsx') {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Hospital_Upload_Template_${new Date().getTime()}.xlsx`);
      } else {
        try {
          const buffer = await workbook.csv.writeBuffer();
          const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, `Hospital_Upload_Template_${new Date().getTime()}.csv`);
        } catch (csvErr) {
          console.warn('CSV buffer failed, manual fallback', csvErr);
          const headers = ['Hospital Name*', 'District Name/ID*', 'Address', 'Phone', 'Email', 'Type', 'Reg. Number', 'Contact Person', 'CP Phone', 'CP Email'];
          const sample = ['City Hospital', 'Bhopal', '123 Main St', '0755-123456', 'info@cityhosp.com', 'PRIVATE', 'REG123', 'John Doe', '9876543210', 'john@cityhosp.com'];
          const csvLines = [headers.join(','), sample.join(',')];
          const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, `Hospital_Upload_Template_${new Date().getTime()}.csv`);
        }
      }
      setSuccess(`Sample ${format.toUpperCase()} template downloaded successfully!`);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download template: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && hospitals.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-8`}>
          <div className="animate-pulse">
            <div className={`h-8 ${styles.loadingShimmer} rounded mb-6`}></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-24 ${styles.loadingShimmer} rounded`}></div>
              ))}
            </div>
            <div className={`h-64 ${styles.loadingShimmer} rounded`}></div>
          </div>
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
                <FaHospital className="mr-3 text-blue-600" />
                Hospital Management
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                Manage hospital network and registrations
              </p>
            </div>

          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : `${styles.secondaryText} hover:${styles.primaryText} hover:bg-gray-100`
                }`}
            >
              <FaList className="inline mr-2" />
              Hospital List ({filteredHospitals.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                if (editingHospital) cancelEdit();
              }}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : `${styles.secondaryText} hover:${styles.primaryText} hover:bg-gray-100`
                }`}
            >
              <FaPlus className="inline mr-2" />
              {editingHospital ? 'Edit Hospital' : 'Add Hospital'}
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'bulk'
                ? 'bg-blue-600 text-white'
                : `${styles.secondaryText} hover:${styles.primaryText} hover:bg-gray-100`
                }`}
            >
              <FaUpload className="inline mr-2" />
              Bulk Upload
            </button>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Hospitals</p>
              <p className="text-3xl font-bold">{dashboardStats.totalHospitals}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaHospital className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Private Hospitals</p>
              <p className="text-3xl font-bold">{dashboardStats.privateHospitals}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaBuilding className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Government Hospitals</p>
              <p className="text-3xl font-bold">{dashboardStats.governmentHospitals}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <FaBuilding className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
            <div className="flex items-center mb-4">
              <FaFilter className={`mr-2 ${styles.secondaryText}`} />
              <h2 className={`text-xl font-semibold ${styles.primaryText}`}>Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>District</label>
                <select
                  name="district"
                  value={filter.district}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                >
                  <option value="ALL">All Districts</option>
                  {districts.map(district => (
                    <option key={district.district_id} value={district.district_id}>
                      {district.district_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Type</label>
                <select
                  name="type"
                  value={filter.type}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                >
                  <option value="ALL">All Types</option>
                  <option value="PRIVATE">Private</option>
                  <option value="GOVERNMENT">Government</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Search</label>
                <input
                  type="text"
                  name="search"
                  value={filter.search}
                  onChange={handleFilterChange}
                  placeholder="Search hospitals..."
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                />
              </div>
            </div>
          </div>

          {/* Hospital List */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
            <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
              <h2 className={`text-xl font-semibold ${styles.primaryText}`}>
                Hospital List ({filteredHospitals.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              {filteredHospitals.length === 0 ? (
                <div className={`p-8 text-center ${styles.secondaryText}`}>
                  <FaHospital className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No hospitals found matching the current filters.</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Hospital Name
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        District
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Type
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Contact
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Contact Person
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                    {filteredHospitals.map((hospital) => (
                      <tr key={hospital.hospital_id} className={styles.tableRow}>
                        <td className={`px-6 py-4 whitespace-nowrap ${styles.primaryText}`}>
                          <div className="flex items-center">
                            <FaHospital className="text-blue-500 mr-3" />
                            <div>
                              <div className="text-sm font-medium">
                                {hospital.name || hospital.hospital_name}
                              </div>
                              <div className={`text-sm ${styles.secondaryText}`}>
                                {hospital.registration_number || 'No reg. number'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-gray-400 mr-2" />
                            {hospital.district?.district_name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${hospital.hospital_type === 'PRIVATE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                            }`}>
                            {hospital.hospital_type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                          <div className="space-y-1">
                            {hospital.contact_phone && (
                              <div className="flex items-center">
                                <FaPhone className="text-gray-400 mr-2" />
                                {hospital.contact_phone}
                              </div>
                            )}
                            {hospital.contact_email && (
                              <div className="flex items-center">
                                <FaEnvelope className="text-gray-400 mr-2" />
                                {hospital.contact_email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                          {hospital.contact_person_name && (
                            <div className="flex items-center">
                              <FaUser className="text-gray-400 mr-2" />
                              <div>
                                <div>{hospital.contact_person_name}</div>
                                {hospital.contact_person_phone && (
                                  <div className={`text-xs ${styles.secondaryText}`}>
                                    {hospital.contact_person_phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(hospital)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit className="inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(hospital.hospital_id)}
                              disabled={deletingId === hospital.hospital_id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <FaTrash className="inline mr-1" />
                              {deletingId === hospital.hospital_id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'create' && (
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
          <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText}`}>
              {editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
            </h2>
            <p className={`text-sm ${styles.secondaryText} mt-1`}>
              Only Hospital Name is required. Expand "More Details" to add district and other info.
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={editingHospital ? handleUpdate : handleSubmit} className="space-y-6">
              {/* Required Field — only name */}
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                  Hospital Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hospital_name"
                  value={formData.hospital_name}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                  placeholder="Enter hospital name"
                />
              </div>

              {/* Optional Fields — collapsible */}
              <details className="group border border-gray-200 rounded-lg overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition select-none">
                  <span className={`text-sm font-semibold ${styles.secondaryText} uppercase tracking-wider`}>
                    More Details (Optional)
                  </span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                        District
                      </label>
                      <select
                        name="district_id"
                        value={formData.district_id}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                      >
                        <option value="">Select District</option>
                        {districts.map((district) => (
                          <option key={district.district_id} value={district.district_id}>
                            {district.district_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                        Hospital Type
                      </label>
                      <select
                        name="hospital_type"
                        value={formData.hospital_type}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                      >
                        <option value="PRIVATE">Private</option>
                        <option value="GOVERNMENT">Government</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                        Registration Number
                      </label>
                      <input
                        type="text"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                        placeholder="Enter registration number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                        placeholder="Enter hospital address"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                        Hospital Phone
                      </label>
                      <input
                        type="text"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                        Hospital Email
                      </label>
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  {/* Contact Person sub-section */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className={`text-xs font-bold uppercase tracking-wider ${styles.secondaryText} mb-3`}>Contact Person</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                          Name
                        </label>
                        <input
                          type="text"
                          name="contact_person_name"
                          value={formData.contact_person_name}
                          onChange={handleChange}
                          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                          placeholder="Contact person name"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                          Phone
                        </label>
                        <input
                          type="text"
                          name="contact_person_phone"
                          value={formData.contact_person_phone}
                          onChange={handleChange}
                          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                          placeholder="Contact person phone"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                          Email
                        </label>
                        <input
                          type="email"
                          name="contact_person_email"
                          value={formData.contact_person_email}
                          onChange={handleChange}
                          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                          placeholder="Contact person email"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </details>

              <div className="flex justify-end space-x-4">
                {editingHospital && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                  >
                    <FaTimes className="inline mr-2" />
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <FaSave className="inline mr-2" />
                  {loading ? 'Saving...' : editingHospital ? 'Update Hospital' : 'Create Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeTab === 'bulk' && (
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
          <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaUpload className="mr-2 text-blue-600" />
              Bulk Upload Hospitals
            </h2>
          </div>
          <div className="p-8">
            <div className={`border-2 border-dashed ${styles.borderColor} rounded-xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer relative`}>
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  setLoading(true);
                  setError('');
                  setSuccess('');
                  
                  try {
                    const workbook = new ExcelJS.Workbook();
                    const reader = new FileReader();
                    
                    reader.onload = async (event) => {
                      try {
                        if (extension === 'csv') {
                          await workbook.csv.read(new Response(event.target.result).body);
                        } else {
                          await workbook.xlsx.load(event.target.result);
                        }

                        const worksheet = workbook.worksheets[0];
                        const hospitalsToUpload = [];
                        
                        // Assuming Row 1 is header
                        worksheet.eachRow((row, rowNumber) => {
                          if (rowNumber > 1) {
                            const districtName = row.getCell(2).value?.toString() || row.getCell(2).value?.result?.toString();
                            const district = districts.find(d => 
                              d.district_name.toLowerCase() === districtName?.toLowerCase() ||
                              d.district_id.toString() === districtName
                            );

                            if (district) {
                              hospitalsToUpload.push({
                                hospital_name: row.getCell(1).value?.toString() || row.getCell(1).value?.result?.toString(),
                                district_id: district.district_id,
                                address: row.getCell(3).value?.toString() || row.getCell(3).value?.result?.toString() || '',
                                contact_phone: row.getCell(4).value?.toString() || row.getCell(4).value?.result?.toString() || '',
                                contact_email: row.getCell(5).value?.toString() || row.getCell(5).value?.result?.toString() || '',
                                hospital_type: (row.getCell(6).value?.toString()?.toUpperCase() === 'GOVERNMENT' || row.getCell(6).value?.result?.toString()?.toUpperCase() === 'GOVERNMENT') ? 'GOVERNMENT' : 'PRIVATE',
                                registration_number: row.getCell(7).value?.toString() || row.getCell(7).value?.result?.toString() || '',
                                contact_person_name: row.getCell(8).value?.toString() || row.getCell(8).value?.result?.toString() || '',
                                contact_person_phone: row.getCell(9).value?.toString() || row.getCell(9).value?.result?.toString() || '',
                                contact_person_email: row.getCell(10).value?.toString() || row.getCell(10).value?.result?.toString() || '',
                              });
                            }
                          }
                        });
                        
                        if (hospitalsToUpload.length === 0) throw new Error('No valid data found in file or districts mismatch');
                        
                        const token = localStorage.getItem('token');
                        const response = await axios.post(`${baseUrl}/api/hospitals/bulk`, hospitalsToUpload, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        
                        setSuccess(`${response.data.message || 'Data uploaded successfully!'}`);
                        fetchData();
                        setActiveTab('list');
                      } catch (err) {
                        console.error('Processing error:', err);
                        setError('Processing error: ' + err.message);
                      } finally {
                        setLoading(false);
                        e.target.value = ''; // Reset input
                      }
                    };
                    
                    reader.readAsArrayBuffer(file);
                  } catch (err) {
                    setError('File error: ' + err.message);
                    setLoading(false);
                  }
                }}
              />
              <FaFileExcel className="mx-auto text-5xl text-green-600 mb-4" />
              <h3 className={`text-lg font-bold ${styles.primaryText}`}>Click to upload or drag and drop</h3>
              <p className={`${styles.secondaryText} text-sm mt-2`}>Supports .xlsx, .xls and .csv formats</p>
              
              <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 relative z-50">
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    downloadSampleTemplate('xlsx'); 
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition shadow-sm hover:shadow-md"
                >
                  <FaDownload className="mr-2" />
                  Download Sample Excel
                </button>
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    downloadSampleTemplate('csv'); 
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                >
                  <FaDownload className="mr-2" />
                  Download Sample CSV
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left text-[10px] bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 italic">
                  <p className="font-black text-blue-800 dark:text-blue-300 mb-1 uppercase tracking-wider">Format (1-5):</p>
                  <ul className="list-disc list-inside text-blue-700 dark:text-blue-400">
                    <li>Col 1: Hospital Name*</li>
                    <li>Col 2: District Name/ID*</li>
                    <li>Col 3: Address</li>
                    <li>Col 4: Phone</li>
                    <li>Col 5: Email</li>
                  </ul>
                </div>
                <div className="text-left text-[10px] bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 italic">
                  <p className="font-black text-blue-800 dark:text-blue-300 mb-1 uppercase tracking-wider">Format (6-10):</p>
                  <ul className="list-disc list-inside text-blue-700 dark:text-blue-400">
                    <li>Col 6: Type (PRIVATE/GOVERNMENT)</li>
                    <li>Col 7: Reg. Number</li>
                    <li>Col 8: Contact Person</li>
                    <li>Col 9: CP Phone</li>
                    <li>Col 10: CP Email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateHospital;