import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, 
  FaSearch, FaSyncAlt, FaEye, FaEdit, FaArrowRight, FaArrowUp, FaArrowDown
} from 'react-icons/fa';

import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import baseUrl from '../../baseUrl/baseUrl';
import ChartCard from '../../components/Dashboard/ChartCard';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import QuickActions from '../../components/Dashboard/QuickActions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SDMDashboard = () => {
  const [filter, setFilter] = useState({ status: 'ALL', priority: 'ALL', date: '' });
  const [dashboardData, setDashboardData] = useState({
    totalEnquiries: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    forwardedToDM: 0,
    queryToCMO: 0,
    recentEnquiries: [],
    monthlyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Quick actions for SDM
  const quickActions = [
    {
      title: 'Review Enquiries',
      description: 'Review pending enquiries',
      icon: <FaEye className="text-blue-600" />,
      to: '/sdm-dashboard/enquiry-detail-page',
      color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
    },
    {
      title: 'Search Cases',
      description: 'Search and filter cases',
      icon: <FaSearch className="text-green-600" />,
      to: '/sdm-dashboard/search-page',
      color: 'border-green-200 hover:border-green-400 hover:bg-green-50'
    },
    {
      title: 'Query to CMO',
      description: 'Send queries to CMO',
      icon: <FaEdit className="text-yellow-600" />,
      to: '/sdm-dashboard/enquiry-detail-page',
      color: 'border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50'
    },
    {
      title: 'Forward to DM',
      description: 'Forward cases to DM',
      icon: <FaArrowRight className="text-purple-600" />,
      to: '/sdm-dashboard/enquiry-detail-page',
      color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
    }
  ];

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      console.log('Fetching SDM dashboard data...');

      const [enquiriesRes, queriesRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/api/case-queries`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ ok: false })) // Handle if queries endpoint doesn't exist
      ]);

      if (!enquiriesRes.ok) throw new Error('Failed to fetch enquiries');

      const [enquiriesData, queriesData] = await Promise.all([
        enquiriesRes.json(),
        queriesRes.ok ? queriesRes.json() : { data: [] }
      ]);

      const enquiries = enquiriesData.data || [];
      const queries = queriesData.data || [];

      console.log(`SDM Dashboard: Loaded ${enquiries.length} enquiries`);

      // Calculate statistics
      const stats = {
        totalEnquiries: enquiries.length,
        pendingReview: enquiries.filter(e => e.status === 'PENDING').length,
        approved: enquiries.filter(e => e.status === 'APPROVED').length,
        rejected: enquiries.filter(e => e.status === 'REJECTED').length,
        forwardedToDM: enquiries.filter(e => e.status === 'FORWARDED').length,
        queryToCMO: queries.length,
        recentEnquiries: enquiries
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10),
      };

      // Calculate monthly statistics (last 6 months)
      const monthlyStats = calculateMonthlyStats(enquiries);

      setDashboardData({
        ...stats,
        monthlyStats,
      });

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
  const filteredCases = dashboardData.recentEnquiries.filter((enquiry) => {
    const matchesStatus = filter.status === 'ALL' || enquiry.status === filter.status;
    
    let matchesDateRange = true;
    if (filter.date) {
      const enquiryDate = new Date(enquiry.created_at).toISOString().split('T')[0];
      matchesDateRange = enquiryDate.includes(filter.date);
    }

    return matchesStatus && matchesDateRange;
  });

  // Generate recent activity from enquiries
  const recentActivity = dashboardData.recentEnquiries.slice(0, 5).map(enquiry => ({
    type: enquiry.status === 'APPROVED' ? 'approval' : 
          enquiry.status === 'REJECTED' ? 'rejection' : 'enquiry',
    description: `${enquiry.enquiry_code || `ENQ${enquiry.enquiry_id}`} - ${enquiry.patient_name}`,
    timestamp: new Date(enquiry.created_at)
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const statusChartData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Forwarded'],
    datasets: [
      {
        data: [
          dashboardData.pendingReview,
          dashboardData.approved,
          dashboardData.rejected,
          dashboardData.forwardedToDM,
        ],
        backgroundColor: ['#fbbf24', '#10b981', '#ef4444', '#3b82f6'],
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
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Approved',
        data: dashboardData.monthlyStats.map(m => m.approved),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Rejected',
        data: dashboardData.monthlyStats.map(m => m.rejected),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      FORWARDED: 'bg-blue-100 text-blue-800',
      ESCALATED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaFileAlt className="mr-3 text-blue-600" />
              SDM Dashboard
            </h1>
            <p className="mt-1 text-gray-600">Sub Divisional Magistrate Case Management Overview</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Enquiries</p>
              <p className="text-3xl font-bold">{dashboardData.totalEnquiries}</p>
              <div className="mt-2 flex items-center">
                <span className="text-blue-100 text-sm">All time total</span>
              </div>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaFileAlt className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending Review</p>
              <p className="text-3xl font-bold">{dashboardData.pendingReview}</p>
              <div className="mt-2 flex items-center">
                <FaClock className="text-yellow-100 mr-1" />
                <span className="text-yellow-100 text-sm">Awaiting action</span>
              </div>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
              <FaClock className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold">{dashboardData.approved}</p>
              <div className="mt-2 flex items-center">
                <span className="text-green-100 text-sm">Successfully processed</span>
              </div>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaCheckCircle className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold">{dashboardData.rejected}</p>
              <div className="mt-2 flex items-center">
                <span className="text-red-100 text-sm">Not approved</span>
              </div>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <FaTimesCircle className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Forwarded to DM</p>
              <p className="text-3xl font-bold text-gray-800">{dashboardData.forwardedToDM}</p>
              <div className="mt-2 flex items-center">
                <span className="text-gray-500 text-sm">Cases sent to District Magistrate</span>
              </div>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FaArrowRight className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Query to CMO</p>
              <p className="text-3xl font-bold text-gray-800">{dashboardData.queryToCMO}</p>
              <div className="mt-2 flex items-center">
                <span className="text-gray-500 text-sm">Queries sent to CMO</span>
              </div>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <FaEdit className="text-2xl text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Status Distribution" className="lg:col-span-1">
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
        </ChartCard>

        <ChartCard title="Monthly Trends" className="lg:col-span-2">
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
        </ChartCard>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions actions={quickActions} />
        <RecentActivity activities={recentActivity} />
      </div>

      {/* Recent Cases Table */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaFileAlt className="mr-2 text-blue-600" />
              Recent Cases ({filteredCases.length})
            </h2>
            <div className="flex items-center space-x-4">
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="FORWARDED">Forwarded</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Link
                to="/sdm-dashboard/enquiry-detail-page"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FaEye className="mr-2" />
                View All
              </Link>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {filteredCases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaFileAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No cases found matching the current filters.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enquiry Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.slice(0, 5).map((enquiry) => (
                  <tr key={enquiry.enquiry_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {enquiry.enquiry_code || `ENQ${enquiry.enquiry_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enquiry.patient_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enquiry.hospital?.name || enquiry.hospital?.hospital_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(enquiry.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/sdm-dashboard/enquiry-detail-page/${enquiry.enquiry_id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FaEye className="inline mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SDMDashboard;