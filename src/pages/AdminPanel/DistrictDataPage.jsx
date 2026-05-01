import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaMapMarkerAlt, 
  FaPlus, 
  FaList, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaEye, 
  FaBuilding,
  FaMailBulk,
  FaGlobe,
  FaFilter,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChartBar,
  FaHospital,
  FaUsers,
  FaUpload,
  FaFileExcel,
  FaDownload
} from 'react-icons/fa';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const STATE_DIVISIONS = {
  'Andhra Pradesh': ['Coastal Andhra', 'Rayalaseema'],
  'Arunachal Pradesh': ['East', 'West', 'Central'],
  'Assam': ['North Assam', 'Lower Assam', 'Upper Assam', 'Central Assam', 'Hills & Barak Valley'],
  'Bihar': ['Patna', 'Tirhut', 'Saran', 'Darbhanga', 'Kosi', 'Purnia', 'Bhagalpur', 'Munger', 'Magadh'],
  'Chhattisgarh': ['Raipur', 'Bilaspur', 'Durg', 'Bastar', 'Surguja'],
  'Goa': ['North Goa', 'South Goa'],
  'Gujarat': ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot', 'Bhavnagar'],
  'Haryana': ['Ambala', 'Faridabad', 'Gurugram', 'Hisar', 'Karnal', 'Rohtak'],
  'Himachal Pradesh': ['Kangra', 'Mandi', 'Shimla'],
  'Jharkhand': ['Palamu', 'North Chotanagpur', 'South Chotanagpur', 'Kolhan', 'Santhal Pargana'],
  'Karnataka': ['Belgaum', 'Bangalore', 'Gulbarga', 'Mysore'],
  'Kerala': ['North Kerala', 'Central Kerala', 'South Kerala'],
  'Madhya Pradesh': ['Bhopal', 'Chambal', 'Gwalior', 'Indore', 'Jabalpur', 'Narmadapuram', 'Rewa', 'Sagar', 'Shahdol', 'Ujjain'],
  'Maharashtra': ['Amravati', 'Aurangabad', 'Konkan', 'Nagpur', 'Nashik', 'Pune'],
  'Manipur': ['Inner Manipur', 'Outer Manipur'],
  'Meghalaya': ['Jaintia Hills', 'Khasi Hills', 'Garo Hills'],
  'Mizoram': ['Northern', 'Southern'],
  'Nagaland': ['Kohima', 'Mokokchung', 'Tuensang'],
  'Odisha': ['Central', 'Northern', 'Southern'],
  'Punjab': ['Patiala', 'Jalandhar', 'Ferozepur', 'Faridkot', 'Ropar'],
  'Rajasthan': ['Ajmer', 'Bharatpur', 'Bikaner', 'Jaipur', 'Jodhpur', 'Kota', 'Udaipur'],
  'Sikkim': ['North Sikkim', 'South Sikkim', 'East Sikkim', 'West Sikkim'],
  'Tamil Nadu': ['North Tamil Nadu', 'West Tamil Nadu', 'South Tamil Nadu', 'Cauvery Delta'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam'],
  'Tripura': ['West Tripura', 'South Tripura', 'North Tripura', 'Dhalai'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Ayodhya', 'Azamgarh', 'Bareilly', 'Basti', 'Chitrakoot', 'Devipatan', 'Gorakhpur', 'Jhansi', 'Kanpur', 'Lucknow', 'Meerut', 'Mirzapur', 'Moradabad', 'Prayagraj', 'Saharanpur', 'Varanasi'],
  'Uttarakhand': ['Garhwal', 'Kumaon'],
  'West Bengal': ['Presidency', 'Burdwan', 'Jalpaiguri', 'Malda', 'Medinipur'],
  'Andaman and Nicobar Islands': ['Andaman', 'Nicobar'],
  'Chandigarh': ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
  'Lakshadweep': ['Lakshadweep'],
  'Delhi': ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'New Delhi'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  'Jammu and Kashmir': ['Jammu', 'Kashmir'],
  'Ladakh': ['Leh', 'Kargil']
};

const CreateDistrict = () => {
  const styles = useThemeStyles();
  const [formData, setFormData] = useState({
    district_name: '',
    post_office_name: '',
    pincode: '',
    state: 'Madhya Pradesh',
    division: '',
  });
  
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filter, setFilter] = useState({
    state: 'ALL',
    search: ''
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalDistricts: 0,
    totalHospitals: 0,
    totalEnquiries: 0,
    districtStats: [],
    stateStats: []
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter districts when filter changes
  useEffect(() => {
    filterDistricts();
  }, [districts, filter]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      const [districtsRes, hospitalsRes, enquiriesRes] = await Promise.all([
        axios.get(`${baseUrl}/api/districts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/api/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const districtData = districtsRes.data.data || districtsRes.data || [];
      const hospitalData = hospitalsRes.data.data || [];
      const enquiryData = enquiriesRes.data.data || [];

      setDistricts(districtData);
      setHospitals(hospitalData);
      setEnquiries(enquiryData);
      
      // Calculate dashboard statistics
      calculateStats(districtData, hospitalData, enquiryData);
      
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (districtData, hospitalData, enquiryData) => {
    const stats = {
      totalDistricts: districtData.length,
      totalHospitals: hospitalData.length,
      totalEnquiries: enquiryData.length,
      districtStats: [],
      stateStats: []
    };

    // Calculate hospitals and enquiries by district
    const districtMap = {};
    districtData.forEach(district => {
      const districtHospitals = hospitalData.filter(h => h.district_id === district.district_id);
      const districtEnquiries = enquiryData.filter(e => e.district_id === district.district_id);
      
      districtMap[district.district_name] = {
        hospitals: districtHospitals.length,
        enquiries: districtEnquiries.length,
        total: districtHospitals.length + districtEnquiries.length
      };
    });

    stats.districtStats = Object.entries(districtMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Calculate by state
    const stateMap = {};
    districtData.forEach(district => {
      const state = district.state || 'Unknown';
      stateMap[state] = (stateMap[state] || 0) + 1;
    });

    stats.stateStats = Object.entries(stateMap)
      .map(([state, count]) => ({ state, count }));

    setDashboardStats(stats);
  };

  const filterDistricts = () => {
    let filtered = districts;

    if (filter.state !== 'ALL') {
      filtered = filtered.filter(d => d.state === filter.state);
    }

    if (filter.search) {
      filtered = filtered.filter(d => 
        d.district_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
        d.post_office_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
        d.pincode?.includes(filter.search)
      );
    }

    setFilteredDistricts(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData({ 
        ...formData, 
        state: value,
        division: '' // Reset division when state changes
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${baseUrl}/api/districts`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('District created successfully!');
      setFormData({
        district_name: '',
        post_office_name: '',
        pincode: '',
        state: 'Madhya Pradesh',
        division: '',
      });
      
      fetchData();
      setActiveTab('list');
      
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create district');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (district) => {
    setEditingDistrict(district);
    setFormData({
      district_name: district.district_name || '',
      post_office_name: district.post_office_name || '',
      pincode: district.pincode || '',
      state: district.state || 'Madhya Pradesh',
      division: district.division || '',
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
      await axios.put(`${baseUrl}/api/districts/${editingDistrict.district_id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('District updated successfully!');
      setEditingDistrict(null);
      setFormData({
        district_name: '',
        post_office_name: '',
        pincode: '',
        state: 'Madhya Pradesh',
        division: '',
      });
      
      fetchData();
      setActiveTab('list');
      
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update district');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (districtId) => {
    if (!window.confirm('Are you sure you want to delete this district?')) return;
    
    setDeletingId(districtId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseUrl}/api/districts/${districtId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('District deleted successfully!');
      fetchData();
      
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete district');
    } finally {
      setDeletingId(null);
    }
  };

  const downloadSampleTemplate = async (format) => {
    setLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Districts Template');
      
      // Define headers
      worksheet.columns = [
        { header: 'District Name*', key: 'district_name', width: 20 },
        { header: 'Post Office Name', key: 'post_office_name', width: 25 },
        { header: 'Pincode', key: 'pincode', width: 15 },
        { header: 'State', key: 'state', width: 20 },
      ];
      
      // Add some sample data
      worksheet.addRow({
        district_name: 'Bhopal',
        post_office_name: 'Bhopal H.O',
        pincode: '462001',
        state: 'Madhya Pradesh'
      });
  
      // Add instructions
      worksheet.addRow({});
      worksheet.addRow(['* Required fields']);
  
      if (format === 'xlsx') {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `District_Upload_Template_${new Date().getTime()}.xlsx`);
      } else {
        try {
          const buffer = await workbook.csv.writeBuffer();
          const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, `District_Upload_Template_${new Date().getTime()}.csv`);
        } catch (csvErr) {
          console.warn('CSV buffer failed, manual fallback', csvErr);
          const headers = ['District Name*', 'Post Office Name', 'Pincode', 'State'];
          const sample = ['Bhopal', 'Bhopal H.O', '462001', 'Madhya Pradesh'];
          const csvLines = [headers.join(','), sample.join(',')];
          const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, `District_Upload_Template_${new Date().getTime()}.csv`);
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

  const cancelEdit = () => {
    setEditingDistrict(null);
    setFormData({
      district_name: '',
      post_office_name: '',
      pincode: '',
      state: 'Madhya Pradesh',
      division: '',
    });
    setError('');
    setSuccess('');
  };

  // Chart data
  const districtChartData = {
    labels: dashboardStats.districtStats.slice(0, 5).map(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name),
    datasets: [
      {
        label: 'Hospitals',
        data: dashboardStats.districtStats.slice(0, 5).map(d => d.hospitals),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6',
        borderWidth: 1,
      },
      {
        label: 'Enquiries',
        data: dashboardStats.districtStats.slice(0, 5).map(d => d.enquiries),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981',
        borderWidth: 1,
      },
    ],
  };

  const stateChartData = {
    labels: dashboardStats.stateStats.map(s => s.state),
    datasets: [
      {
        data: dashboardStats.stateStats.map(s => s.count),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED',
          '#DB2777',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading && districts.length === 0) {
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
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading districts...</p>
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
                <FaMapMarkerAlt className="mr-3 text-blue-600" />
                District Management
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                Manage districts and administrative areas
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
              District List ({filteredDistricts.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                if (editingDistrict) cancelEdit();
              }}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : `${styles.secondaryText} hover:${styles.primaryText} hover:bg-gray-100`
                }`}
            >
              <FaPlus className="inline mr-2" />
              {editingDistrict ? 'Edit District' : 'Add District'}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : `${styles.secondaryText} hover:${styles.primaryText} hover:bg-gray-100`
                }`}
            >
              <FaChartBar className="inline mr-2" />
              Analytics
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
              <p className="text-blue-100 text-sm font-medium">Total Districts</p>
              <p className="text-3xl font-bold">{dashboardStats.totalDistricts}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaMapMarkerAlt className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Hospitals</p>
              <p className="text-3xl font-bold">{dashboardStats.totalHospitals}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaHospital className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Enquiries</p>
              <p className="text-3xl font-bold">{dashboardStats.totalEnquiries}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <FaUsers className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* District Activity Chart */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
                <FaChartBar className="mr-2 text-blue-600" />
                Top Districts by Activity
              </h2>
            </div>
            <div className="h-64">
              <Bar
                data={districtChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* State Distribution Chart */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
                <FaGlobe className="mr-2 text-green-600" />
                Districts by State
              </h2>
            </div>
            <div className="h-64">
              <Doughnut
                data={stateChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
            <div className="flex items-center mb-4">
              <FaFilter className={`mr-2 ${styles.secondaryText}`} />
              <h2 className={`text-xl font-semibold ${styles.primaryText}`}>Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>State</label>
                <select
                  name="state"
                  value={filter.state}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                >
                  <option value="ALL">All States</option>
                  {dashboardStats.stateStats.map(state => (
                    <option key={state.state} value={state.state}>
                      {state.state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Search</label>
                <input
                  type="text"
                  name="search"
                  value={filter.search}
                  onChange={handleFilterChange}
                  placeholder="Search districts..."
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                />
              </div>
            </div>
          </div>

          {/* District List */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
            <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
              <h2 className={`text-xl font-semibold ${styles.primaryText}`}>
                District List ({filteredDistricts.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              {filteredDistricts.length === 0 ? (
                <div className={`p-8 text-center ${styles.secondaryText}`}>
                  <FaMapMarkerAlt className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No districts found matching the current filters.</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        District Name
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Division
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        State
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Post Office
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Pincode
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Statistics
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                    {filteredDistricts.map((district) => {
                      const districtHospitals = hospitals.filter(h => h.district_id === district.district_id).length;
                      const districtEnquiries = enquiries.filter(e => e.district_id === district.district_id).length;
                      
                      return (
                        <tr key={district.district_id} className={styles.tableRow}>
                          <td className={`px-6 py-4 whitespace-nowrap ${styles.primaryText}`}>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="text-blue-500 mr-3" />
                              <div>
                                <div className="text-sm font-medium">
                                  {district.district_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                            {district.division
                              ? <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{district.division}</span>
                              : <span className="text-gray-400 text-xs italic">—</span>}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                            <div className="flex items-center">
                              <FaGlobe className="text-gray-400 mr-2" />
                              {district.state}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                            <div className="flex items-center">
                              <FaMailBulk className="text-gray-400 mr-2" />
                              {district.post_office_name || 'N/A'}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                            <div className="flex items-center">
                              <FaBuilding className="text-gray-400 mr-2" />
                              {district.pincode || 'N/A'}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <FaHospital className="text-green-500 mr-2" />
                                <span>{districtHospitals} Hospitals</span>
                              </div>
                              <div className="flex items-center">
                                <FaUsers className="text-blue-500 mr-2" />
                                <span>{districtEnquiries} Enquiries</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(district)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <FaEdit className="inline mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(district.district_id)}
                                disabled={deletingId === district.district_id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                <FaTrash className="inline mr-1" />
                                {deletingId === district.district_id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
              {editingDistrict ? 'Edit District' : 'Add New District'}
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={editingDistrict ? handleUpdate : handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    District Name *
                  </label>
                  <input
                    type="text"
                    name="district_name"
                    value={formData.district_name}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter district name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                  >
                    <option value="">-- Select State --</option>
                    {Object.keys(STATE_DIVISIONS).sort().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    Division
                  </label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                  >
                    <option value="">-- Select Division --</option>
                    {formData.state && STATE_DIVISIONS[formData.state] ? (
                      STATE_DIVISIONS[formData.state].map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))
                    ) : (
                      <option disabled>Please select a state first</option>
                    )}
                  </select>
                  <p className={`text-xs mt-1 ${styles.secondaryText}`}>Each division contains 5–6 districts</p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    Post Office Name
                  </label>
                  <input
                    type="text"
                    name="post_office_name"
                    value={formData.post_office_name}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter post office name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                {editingDistrict && (
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
                  {loading ? 'Saving...' : editingDistrict ? 'Update District' : 'Create District'}
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
              Bulk Upload Districts
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
                    const extension = file.name.split('.').pop().toLowerCase();
                    
                    reader.onload = async (event) => {
                      try {
                        if (extension === 'csv') {
                          await workbook.csv.read(new Response(event.target.result).body);
                        } else {
                          await workbook.xlsx.load(event.target.result);
                        }

                        const worksheet = workbook.worksheets[0];
                        const districtsToUpload = [];
                        
                        // Expected Cols: District Name, Post Office Name, Pincode, State
                        worksheet.eachRow((row, rowNumber) => {
                          if (rowNumber > 1) {
                            const district_name = row.getCell(1).value?.toString() || row.getCell(1).value?.result?.toString();
                            if (district_name) {
                              districtsToUpload.push({
                                district_name: district_name,
                                post_office_name: row.getCell(2).value?.toString() || row.getCell(2).value?.result?.toString() || '',
                                pincode: row.getCell(3).value?.toString() || row.getCell(3).value?.result?.toString() || '',
                                state: row.getCell(4).value?.toString() || row.getCell(4).value?.result?.toString() || 'Madhya Pradesh',
                              });
                            }
                          }
                        });
                        
                        if (districtsToUpload.length === 0) throw new Error('No valid data found in file');
                        
                        const token = localStorage.getItem('token');
                        const response = await axios.post(`${baseUrl}/api/districts/bulk`, districtsToUpload, {
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

              <div className="mt-8 flex justify-center gap-4">
                <div className="text-left text-xs bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="font-bold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wider flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    Expected Format:
                  </p>
                  <ul className="list-disc list-inside text-blue-700 dark:text-blue-400 space-y-1">
                    <li>Column 1: District Name* (Required)</li>
                    <li>Column 2: Post Office Name</li>
                    <li>Column 3: Pincode</li>
                    <li>Column 4: State (Defaults to Madhya Pradesh)</li>
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

export default CreateDistrict;