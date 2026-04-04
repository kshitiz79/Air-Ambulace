import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaMapMarkerAlt, FaPlus, FaList, FaEdit, FaTrash,
  FaGlobe, FaFilter, FaSyncAlt, FaExclamationTriangle,
  FaChartBar, FaHospital, FaUsers, FaUpload, FaMailBulk, FaBuilding,
} from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DIVISIONS = [
  'Bhopal','Indore','Gwalior','Jabalpur','Rewa',
  'Sagar','Ujjain','Chambal','Narmadapuram','Shahdol',
];

const DistrictManagement = () => {
  const styles = useThemeStyles();

  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editingDistrict, setEditingDistrict] = useState(null);

  const [formData, setFormData] = useState({
    district_name: '', post_office_name: '', pincode: '',
    state: 'Madhya Pradesh', division: '',
  });

  const [filter, setFilter] = useState({ state: 'ALL', search: '' });

  const [dashboardStats, setDashboardStats] = useState({
    totalDistricts: 0, totalHospitals: 0, totalEnquiries: 0,
    districtStats: [], stateStats: [],
  });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { filterDistricts(); }, [districts, filter]);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [dRes, hRes, eRes] = await Promise.all([
        axios.get(`${baseUrl}/api/districts`, { headers: headers() }),
        axios.get(`${baseUrl}/api/hospitals`, { headers: headers() }),
        axios.get(`${baseUrl}/api/enquiries`, { headers: headers() }),
      ]);
      const d = dRes.data.data || dRes.data || [];
      const h = hRes.data.data || [];
      const e = eRes.data.data || [];
      setDistricts(d); setHospitals(h); setEnquiries(e);
      calculateStats(d, h, e);
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  const calculateStats = (d, h, e) => {
    const districtMap = {};
    d.forEach(district => {
      districtMap[district.district_name] = {
        hospitals: h.filter(x => x.district_id === district.district_id).length,
        enquiries: e.filter(x => x.district_id === district.district_id).length,
      };
    });
    const districtStats = Object.entries(districtMap)
      .map(([name, v]) => ({ name, ...v, total: v.hospitals + v.enquiries }))
      .sort((a, b) => b.total - a.total).slice(0, 10);

    const stateMap = {};
    d.forEach(x => { const s = x.state || 'Unknown'; stateMap[s] = (stateMap[s] || 0) + 1; });
    const stateStats = Object.entries(stateMap).map(([state, count]) => ({ state, count }));

    setDashboardStats({ totalDistricts: d.length, totalHospitals: h.length, totalEnquiries: e.length, districtStats, stateStats });
  };

  const filterDistricts = () => {
    let f = districts;
    if (filter.state !== 'ALL') f = f.filter(d => d.state === filter.state);
    if (filter.search) f = f.filter(d =>
      d.district_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      d.post_office_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      d.pincode?.includes(filter.search)
    );
    setFilteredDistricts(f);
  };

  const resetForm = () => {
    setFormData({ district_name: '', post_office_name: '', pincode: '', state: 'Madhya Pradesh', division: '' });
    setEditingDistrict(null); setError(''); setSuccess('');
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

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      if (editingDistrict) {
        await axios.put(`${baseUrl}/api/districts/${editingDistrict.district_id}`, formData, { headers: headers() });
        setSuccess('District updated successfully!');
      } else {
        await axios.post(`${baseUrl}/api/districts`, formData, { headers: headers() });
        setSuccess('District created successfully!');
      }
      resetForm(); fetchData(); setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save district');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this district?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`${baseUrl}/api/districts/${id}`, { headers: headers() });
      setSuccess('District deleted successfully!'); fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete district');
    } finally {
      setDeletingId(null);
    }
  };

  const districtChartData = {
    labels: dashboardStats.districtStats.slice(0, 5).map(d => d.name.length > 15 ? d.name.slice(0, 15) + '…' : d.name),
    datasets: [
      { label: 'Hospitals', data: dashboardStats.districtStats.slice(0, 5).map(d => d.hospitals), backgroundColor: 'rgba(59,130,246,0.8)', borderColor: '#3B82F6', borderWidth: 1 },
      { label: 'Enquiries', data: dashboardStats.districtStats.slice(0, 5).map(d => d.enquiries), backgroundColor: 'rgba(16,185,129,0.8)', borderColor: '#10B981', borderWidth: 1 },
    ],
  };

  const stateChartData = {
    labels: dashboardStats.stateStats.map(s => s.state),
    datasets: [{
      data: dashboardStats.stateStats.map(s => s.count),
      backgroundColor: ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899'],
      borderColor: ['#2563EB','#059669','#D97706','#DC2626','#7C3AED','#DB2777'],
      borderWidth: 2,
    }],
  };

  if (loading && districts.length === 0) {
    return (
      <div className={`w-full p-6 ${styles.pageBackground}`}>
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-8`}>
          <div className="animate-pulse space-y-4">
            <div className={`h-8 ${styles.loadingShimmer} rounded`}></div>
            <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className={`h-24 ${styles.loadingShimmer} rounded`}></div>)}</div>
            <div className={`h-64 ${styles.loadingShimmer} rounded`}></div>
          </div>
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading districts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
                <FaMapMarkerAlt className="mr-3 text-blue-600" /> District Management
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>Manage districts and administrative areas</p>
            </div>
            <button onClick={() => { setRefreshing(true); fetchData(); }} disabled={refreshing}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-1">
            {[
              { key: 'list', icon: <FaList className="inline mr-2" />, label: `District List (${filteredDistricts.length})` },
              { key: 'create', icon: <FaPlus className="inline mr-2" />, label: editingDistrict ? 'Edit District' : 'Add District' },
              { key: 'analytics', icon: <FaChartBar className="inline mr-2" />, label: 'Analytics' },
            ].map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); if (tab.key !== 'create') resetForm(); }}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === tab.key ? 'bg-blue-600 text-white' : `${styles.secondaryText} hover:bg-gray-100`}`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center"><FaExclamationTriangle className="mr-2" />{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">{success}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Total Districts', value: dashboardStats.totalDistricts, color: 'from-blue-500 to-blue-600', icon: <FaMapMarkerAlt className="text-2xl" />, bg: 'bg-blue-400' },
          { label: 'Total Hospitals', value: dashboardStats.totalHospitals, color: 'from-green-500 to-green-600', icon: <FaHospital className="text-2xl" />, bg: 'bg-green-400' },
          { label: 'Total Enquiries', value: dashboardStats.totalEnquiries, color: 'from-purple-500 to-purple-600', icon: <FaUsers className="text-2xl" />, bg: 'bg-purple-400' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-lg shadow-sm p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div><p className="text-white/80 text-sm font-medium">{s.label}</p><p className="text-3xl font-bold">{s.value}</p></div>
              <div className={`${s.bg} bg-opacity-30 rounded-full p-3`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center mb-4`}>
              <FaChartBar className="mr-2 text-blue-600" /> Top Districts by Activity
            </h2>
            <div className="h-64">
              <Bar data={districtChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center mb-4`}>
              <FaGlobe className="mr-2 text-green-600" /> Districts by State
            </h2>
            <div className="h-64">
              <Doughnut data={stateChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <>
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-4 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>State</label>
                <select value={filter.state} onChange={e => setFilter({ ...filter, state: e.target.value })}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}>
                  <option value="ALL">All States</option>
                  {dashboardStats.stateStats.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Search</label>
                <input type="text" value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })}
                  placeholder="Search districts..." className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`} />
              </div>
            </div>
          </div>

          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
            <div className={`px-6 py-4 border-b ${styles.borderColor} flex items-center justify-between`}>
              <h2 className={`text-xl font-semibold ${styles.primaryText}`}>District List ({filteredDistricts.length})</h2>
              <button onClick={() => { resetForm(); setActiveTab('create'); }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                <FaPlus className="mr-2" /> Add District
              </button>
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
                      {['District Name','Division','State','Post Office','Pincode','Statistics','Actions'].map(h => (
                        <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                    {filteredDistricts.map(district => {
                      const dHospitals = hospitals.filter(h => h.district_id === district.district_id).length;
                      const dEnquiries = enquiries.filter(e => e.district_id === district.district_id).length;
                      return (
                        <tr key={district.district_id} className={styles.tableRow}>
                          <td className={`px-6 py-4 whitespace-nowrap ${styles.primaryText}`}>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="text-blue-500 mr-3" />
                              <span className="text-sm font-medium">{district.district_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {district.division
                              ? <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{district.division}</span>
                              : <span className="text-gray-400 text-xs italic">—</span>}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                            <div className="flex items-center"><FaGlobe className="text-gray-400 mr-2" />{district.state}</div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                            <div className="flex items-center"><FaMailBulk className="text-gray-400 mr-2" />{district.post_office_name || 'N/A'}</div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                            <div className="flex items-center"><FaBuilding className="text-gray-400 mr-2" />{district.pincode || 'N/A'}</div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                            <div className="space-y-1">
                              <div className="flex items-center"><FaHospital className="text-green-500 mr-2" />{dHospitals} Hospitals</div>
                              <div className="flex items-center"><FaUsers className="text-blue-500 mr-2" />{dEnquiries} Enquiries</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button onClick={() => handleEdit(district)} className="text-blue-600 hover:text-blue-900 flex items-center">
                                <FaEdit className="mr-1" /> Edit
                              </button>
                              <button onClick={() => handleDelete(district.district_id)} disabled={deletingId === district.district_id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center">
                                <FaTrash className="mr-1" />{deletingId === district.district_id ? 'Deleting…' : 'Delete'}
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

      {/* Create/Edit Tab */}
      {activeTab === 'create' && (
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
          <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText}`}>
              {editingDistrict ? 'Edit District' : 'Add New District'}
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>District Name *</label>
                  <input type="text" name="district_name" value={formData.district_name} required
                    onChange={e => setFormData({ ...formData, district_name: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter district name" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>State *</label>
                  <input type="text" name="state" value={formData.state} required
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter state name" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Division</label>
                  <select name="division" value={formData.division}
                    onChange={e => setFormData({ ...formData, division: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}>
                    <option value="">-- Select Division --</option>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <p className={`text-xs mt-1 ${styles.secondaryText}`}>Each division contains 5–6 districts</p>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Post Office Name</label>
                  <input type="text" name="post_office_name" value={formData.post_office_name}
                    onChange={e => setFormData({ ...formData, post_office_name: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter post office name" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Pincode</label>
                  <input type="text" name="pincode" value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter pincode" />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => { resetForm(); setActiveTab('list'); }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center">
                  {loading ? <><span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>Saving…</> : (editingDistrict ? 'Update District' : 'Add District')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistrictManagement;
