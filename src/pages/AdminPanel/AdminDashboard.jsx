import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  FaUsers, 
  FaHospital, 
  FaMapMarkerAlt, 
  FaFileAlt, 
  FaChartLine, 
  FaCalendarAlt,
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaArrowUp, 
  FaArrowDown, 
  FaEye, 
  FaDownload, 
  FaFilter, 
  FaSyncAlt,
  FaUserShield,
  FaCog,
  FaQuestionCircle
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const styles = useThemeStyles();
  const [dashboardData, setDashboardData] = useState({
    totalEnquiries: 0,
    totalUsers: 0,
    totalHospitals: 0,
    totalDistricts: 0,
    pendingEnquiries: 0,
    approvedEnquiries: 0,
    rejectedEnquiries: 0,
    escalatedEnquiries: 0,
    completedEnquiries: 0,
    forwardedEnquiries: 0,
    inProgressEnquiries: 0,
    recentEnquiries: [],
    recentUsers: [],
    monthlyStats: [],
    userRoleStats: [],
    hospitalStats: [],
    districtStats: [],
  });

  const [filter, setFilter] = useState({
    status: 'ALL',
    dateFrom: '',
    dateTo: '',
    district: 'ALL',
    hospital: 'ALL'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [enquiriesRes, usersRes, hospitalsRes, districtsRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/api/hospitals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/api/districts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!enquiriesRes.ok) throw new Error('Failed to fetch enquiries');
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      if (!hospitalsRes.ok) throw new Error('Failed to fetch hospitals');
      if (!districtsRes.ok) throw new Error('Failed to fetch districts');

      const [enquiriesData, usersData, hospitalsData, districtsData] = await Promise.all([
        enquiriesRes.json(),
        usersRes.json(),
        hospitalsRes.json(),
        districtsRes.json()
      ]);

      const enquiries = enquiriesData.data || [];
      const users = usersData.data || [];
      const hospitalsList = hospitalsData.data || [];
      const districtsList = districtsData.data || [];

      // Calculate statistics
      const stats = {
        totalEnquiries: enquiries.length,
        totalUsers: users.length,
        totalHospitals: hospitalsList.length,
        totalDistricts: districtsList.length,
        pendingEnquiries: enquiries.filter(e => e.status === 'PENDING').length,
        approvedEnquiries: enquiries.filter(e => e.status === 'APPROVED').length,
        rejectedEnquiries: enquiries.filter(e => e.status === 'REJECTED').length,
        escalatedEnquiries: enquiries.filter(e => e.status === 'ESCALATED').length,
        completedEnquiries: enquiries.filter(e => e.status === 'COMPLETED').length,
        forwardedEnquiries: enquiries.filter(e => e.status === 'FORWARDED').length,
        inProgressEnquiries: enquiries.filter(e => e.status === 'IN_PROGRESS').length,
        recentEnquiries: enquiries
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10),
        recentUsers: users
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5),
      };

      // Calculate monthly statistics (last 6 months)
      const monthlyStats = calculateMonthlyStats(enquiries);

      // Calculate user role statistics
      const userRoleStats = calculateUserRoleStats(users);

      // Calculate hospital statistics
      const hospitalStats = calculateHospitalStats(enquiries, hospitalsList);

      // Calculate district statistics
      const districtStats = calculateDistrictStats(enquiries, districtsList);

      setDashboardData({
        ...stats,
        monthlyStats,
        userRoleStats,
        hospitalStats,
        districtStats,
      });

      setHospitals(hospitalsList);
      setDistricts(districtsList);
      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate monthly statistics
  const calculateMonthlyStats = (enquiries) => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthEnquiries = enquiries.filter(e => {
        const enquiryDate = new Date(e.created_at);
        return enquiryDate.getMonth() === date.getMonth() &&
          enquiryDate.getFullYear() === date.getFullYear();
      });

      months.push({
        month: monthName,
        total: monthEnquiries.length,
        approved: monthEnquiries.filter(e => e.status === 'APPROVED').length,
        rejected: monthEnquiries.filter(e => e.status === 'REJECTED').length,
        pending: monthEnquiries.filter(e => e.status === 'PENDING').length,
      });
    }

    return months;
  };

  // Calculate user role statistics
  const calculateUserRoleStats = (users) => {
    const roleMap = {};
    users.forEach(user => {
      const role = user.role || 'UNKNOWN';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });

    return Object.entries(roleMap).map(([role, count]) => ({ role, count }));
  };

  // Calculate hospital statistics
  const calculateHospitalStats = (enquiries, hospitalsList) => {
    const hospitalMap = {};
    hospitalsList.forEach(h => {
      hospitalMap[h.hospital_id] = h.name || h.hospital_name || `Hospital ${h.hospital_id}`;
    });

    const stats = {};
    enquiries.forEach(e => {
      const hospitalName = hospitalMap[e.hospital_id] || 'Unknown Hospital';
      if (!stats[hospitalName]) {
        stats[hospitalName] = { total: 0, approved: 0, rejected: 0, pending: 0 };
      }
      stats[hospitalName].total++;
      if (e.status === 'APPROVED') stats[hospitalName].approved++;
      if (e.status === 'REJECTED') stats[hospitalName].rejected++;
      if (e.status === 'PENDING') stats[hospitalName].pending++;
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  };

  // Calculate district statistics
  const calculateDistrictStats = (enquiries, districtsList) => {
    const districtMap = {};
    districtsList.forEach(d => {
      districtMap[d.district_id] = d.district_name || `District ${d.district_id}`;
    });

    const stats = {};
    enquiries.forEach(e => {
      const districtName = districtMap[e.district_id] || 'Unknown District';
      if (!stats[districtName]) {
        stats[districtName] = { total: 0, approved: 0, rejected: 0, pending: 0 };
      }
      stats[districtName].total++;
      if (e.status === 'APPROVED') stats[districtName].approved++;
      if (e.status === 'REJECTED') stats[districtName].rejected++;
      if (e.status === 'PENDING') stats[districtName].pending++;
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Filter recent enquiries based on current filters
  const filteredRecentEnquiries = dashboardData.recentEnquiries.filter((enquiry) => {
    const matchesStatus = filter.status === 'ALL' || enquiry.status === filter.status;
    const matchesDistrict = filter.district === 'ALL' || enquiry.district_id?.toString() === filter.district;
    const matchesHospital = filter.hospital === 'ALL' || enquiry.hospital_id?.toString() === filter.hospital;

    let matchesDateRange = true;
    if (filter.dateFrom || filter.dateTo) {
      const enquiryDate = new Date(enquiry.created_at);
      if (filter.dateFrom) {
        matchesDateRange = matchesDateRange && enquiryDate >= new Date(filter.dateFrom);
      }
      if (filter.dateTo) {
        matchesDateRange = matchesDateRange && enquiryDate <= new Date(filter.dateTo);
      }
    }

    return matchesStatus && matchesDistrict && matchesHospital && matchesDateRange;
  });

  // Chart configurations
  const statusChartData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Escalated', 'Completed', 'Forwarded', 'In Progress'],
    datasets: [
      {
        data: [
          dashboardData.pendingEnquiries,
          dashboardData.approvedEnquiries,
          dashboardData.rejectedEnquiries,
          dashboardData.escalatedEnquiries,
          dashboardData.completedEnquiries,
          dashboardData.forwardedEnquiries,
          dashboardData.inProgressEnquiries,
        ],
        backgroundColor: [
          '#FEF3C7', // Pending - Yellow
          '#D1FAE5', // Approved - Green
          '#FEE2E2', // Rejected - Red
          '#E0E7FF', // Escalated - Purple
          '#F3F4F6', // Completed - Gray
          '#DBEAFE', // Forwarded - Blue
          '#FDF2F8', // In Progress - Pink
        ],
        borderColor: [
          '#F59E0B',
          '#10B981',
          '#EF4444',
          '#8B5CF6',
          '#6B7280',
          '#3B82F6',
          '#EC4899',
        ],
        borderWidth: 2,
      },
    ],
  };

  const monthlyChartData = {
    labels: dashboardData.monthlyStats.map(m => m.month),
    datasets: [
      {
        label: 'Total Enquiries',
        data: dashboardData.monthlyStats.map(m => m.total),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Approved',
        data: dashboardData.monthlyStats.map(m => m.approved),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Rejected',
        data: dashboardData.monthlyStats.map(m => m.rejected),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const userRoleChartData = {
    labels: dashboardData.userRoleStats.map(r => r.role),
    datasets: [
      {
        label: 'Users by Role',
        data: dashboardData.userRoleStats.map(r => r.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
        ],
        borderWidth: 1,
      },
    ],
  };

  const hospitalChartData = {
    labels: dashboardData.hospitalStats.slice(0, 5).map(h => h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name),
    datasets: [
      {
        label: 'Total Enquiries',
        data: dashboardData.hospitalStats.slice(0, 5).map(h => h.total),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3B82F6',
        borderWidth: 1,
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      ESCALATED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      FORWARDED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-pink-100 text-pink-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-8`}>
          <div className="animate-pulse">
            <div className={`h-8 ${styles.loadingShimmer} rounded mb-6`}></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-24 ${styles.loadingShimmer} rounded`}></div>
              ))}
            </div>
            <div className={`h-64 ${styles.loadingShimmer} rounded`}></div>
          </div>
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading dashboard...</p>
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
                <FaUserShield className="mr-3 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                System Administration & Management Overview
              </p>
            </div>
           
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Enquiries</p>
              <p className="text-3xl font-bold">{dashboardData.totalEnquiries}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaFileAlt className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-blue-200 mr-1" />
            <span className="text-blue-100 text-sm">All time total</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">{dashboardData.totalUsers}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaUsers className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-green-200 mr-1" />
            <span className="text-green-100 text-sm">Registered users</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Hospitals</p>
              <p className="text-3xl font-bold">{dashboardData.totalHospitals}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <FaHospital className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-purple-200 mr-1" />
            <span className="text-purple-100 text-sm">Network hospitals</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Districts</p>
              <p className="text-3xl font-bold">{dashboardData.totalDistricts}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <FaMapMarkerAlt className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-orange-200 mr-1" />
            <span className="text-orange-100 text-sm">Coverage areas</span>
          </div>
        </div>
      </div>

      {/* Additional Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Pending Cases</p>
              <p className="text-2xl font-bold text-yellow-600">{dashboardData.pendingEnquiries}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <FaClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Approved Cases</p>
              <p className="text-2xl font-bold text-green-600">{dashboardData.approvedEnquiries}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Rejected Cases</p>
              <p className="text-2xl font-bold text-red-600">{dashboardData.rejectedEnquiries}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <FaTimesCircle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution Chart */}
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaChartLine className="mr-2 text-blue-600" />
              Status Distribution
            </h2>
          </div>
          <div className="h-64">
            <Doughnut
              data={statusChartData}
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

        {/* Monthly Trends Chart */}
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaCalendarAlt className="mr-2 text-green-600" />
              Monthly Trends
            </h2>
          </div>
          <div className="h-64">
            <Line
              data={monthlyChartData}
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
      </div>

      {/* User Roles and Hospital Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Role Distribution */}
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaUsers className="mr-2 text-purple-600" />
              User Role Distribution
            </h2>
          </div>
          <div className="h-64">
            <Bar
              data={userRoleChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
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

        {/* Top Hospitals Chart */}
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaHospital className="mr-2 text-red-600" />
              Top Hospitals by Enquiries
            </h2>
          </div>
          <div className="h-64">
            <Bar
              data={hospitalChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
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
      </div>

      {/* Filters */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
        <div className="flex items-center mb-4">
          <FaFilter className={`mr-2 ${styles.secondaryText}`} />
          <h2 className={`text-xl font-semibold ${styles.primaryText}`}>Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Status</label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ESCALATED">Escalated</option>
              <option value="COMPLETED">Completed</option>
              <option value="FORWARDED">Forwarded</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filter.dateFrom}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filter.dateTo}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            />
          </div>
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
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Hospital</label>
            <select
              name="hospital"
              value={filter.hospital}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            >
              <option value="ALL">All Hospitals</option>
              {hospitals.map(hospital => (
                <option key={hospital.hospital_id} value={hospital.hospital_id}>
                  {hospital.name || hospital.hospital_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recent Enquiries Table */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaEye className="mr-2 text-indigo-600" />
              Recent Enquiries ({filteredRecentEnquiries.length})
            </h2>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <FaDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {filteredRecentEnquiries.length === 0 ? (
            <div className={`p-8 text-center ${styles.secondaryText}`}>
              <FaFileAlt className="mx-auto text-4xl mb-4 text-gray-300" />
              <p>No enquiries found matching the current filters.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Enquiry Code
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Patient Name
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Hospital
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    District
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Created Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                {filteredRecentEnquiries.map((enquiry) => (
                  <tr key={enquiry.enquiry_id} className={styles.tableRow}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${styles.primaryText}`}>
                      {enquiry.enquiry_code || `ENQ${enquiry.enquiry_id}`}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                      {enquiry.patient_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status || 'PENDING'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                      {enquiry.hospital?.name || enquiry.hospital?.hospital_name || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                      {enquiry.district?.district_name || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                      {formatDate(enquiry.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <FaEye className="inline mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
            <FaCog className="mr-2 text-gray-600" />
            Quick Actions
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              to="/admin/user-management"
              className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <FaUsers className="mr-2" />
              Manage Users
            </Link>
            <Link
              to="/admin/hospital-management"
              className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
            >
              <FaHospital className="mr-2" />
              Manage Hospitals
            </Link>
            <Link
              to="/admin/district-data-page"
              className="flex items-center justify-center px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
            >
              <FaMapMarkerAlt className="mr-2" />
              Manage Districts
            </Link>
            <Link
              to="/admin/all-queries"
              className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              <FaQuestionCircle className="mr-2" />
              All Queries
            </Link>
            <Link
              to="/admin/export-page"
              className="flex items-center justify-center px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition duration-200"
            >
              <FaDownload className="mr-2" />
              Export Data
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;