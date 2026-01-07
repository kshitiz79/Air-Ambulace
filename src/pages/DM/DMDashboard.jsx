import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaDollarSign,
  FaSyncAlt,
  FaEye,
  FaUserTie,
  FaPaperPlane,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

import baseUrl from '../../baseUrl/baseUrl';
import StatsCard from '../../components/Dashboard/StatsCard';
import ChartCard from '../../components/Dashboard/ChartCard';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import QuickActions from '../../components/Dashboard/QuickActions';


const DMDashboard = () => {
  const [filter, setFilter] = useState({ status: 'ALL', date: '' });
  const [dashboardData, setDashboardData] = useState({
    totalCases: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    financialSanctions: 0,
    ordersReleased: 0,
    recentEnquiries: [],
    monthlyStats: [],
    financialStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Quick actions for DM
  const quickActions = [
    {
      title: 'Approval/Rejection',
      description: 'Review and approve cases',
      icon: <FaUserTie className="text-blue-600" />,
      to: '/dm-dashboard/approval-reject',
      color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
    },
    {
      title: 'Case Files',
      description: 'View case files',
      icon: <FaFileAlt className="text-green-600" />,
      to: '/dm-dashboard/case-files',
      color: 'border-green-200 hover:border-green-400 hover:bg-green-50'
    },
    {
      title: 'Financial Sanctions',
      description: 'Manage financial approvals',
      icon: <FaDollarSign className="text-yellow-600" />,
      to: '/dm-dashboard/financial-page',
      color: 'border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50'
    },
    {
      title: 'Order Release',
      description: 'Release approved orders',
      icon: <FaPaperPlane className="text-purple-600" />,
      to: '/dm-dashboard/order-release-page',
      color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
    }
  ];

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      console.log('Fetching DM dashboard data...');

      const [enquiriesRes, ordersRes, financialRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ ok: false })),
        fetch(`${baseUrl}/api/financial-sanctions`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ ok: false }))
      ]);

      if (!enquiriesRes.ok) throw new Error('Failed to fetch enquiries');

      const [enquiriesData, ordersData, financialData] = await Promise.all([
        enquiriesRes.json(),
        ordersRes.ok ? ordersRes.json() : { data: [] },
        financialRes.ok ? financialRes.json() : { data: [] }
      ]);

      const enquiries = enquiriesData.data || [];
      const orders = ordersData.data || [];
      const financialSanctions = financialData.data || [];

      console.log(`DM Dashboard: Loaded ${enquiries.length} enquiries`);

      // Calculate statistics
      const stats = {
        totalCases: enquiries.length,
        pendingApproval: enquiries.filter(e => e.status === 'FORWARDED' || e.status === 'PENDING').length,
        approved: enquiries.filter(e => e.status === 'APPROVED').length,
        rejected: enquiries.filter(e => e.status === 'REJECTED').length,
        financialSanctions: financialSanctions.length,
        ordersReleased: orders.filter(o => o.status === 'RELEASED').length,
        recentEnquiries: enquiries
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10),
      };

      // Calculate monthly statistics (last 6 months)
      const monthlyStats = calculateMonthlyStats(enquiries);

      // Calculate financial statistics (last 6 months)
      const financialStats = calculateFinancialStats(financialSanctions);

      setDashboardData({
        ...stats,
        monthlyStats,
        financialStats,
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
        pending: monthEnquiries.filter(e => e.status === 'PENDING' || e.status === 'FORWARDED').length,
      });
    }

    return months;
  };

  // Calculate financial statistics
  const calculateFinancialStats = (sanctions) => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthSanctions = sanctions.filter(s => {
        const sanctionDate = new Date(s.created_at);
        return sanctionDate.getMonth() === date.getMonth() &&
          sanctionDate.getFullYear() === date.getFullYear();
      });

      // Calculate total approved amount in lakhs
      const totalAmount = monthSanctions.reduce((sum, s) => sum + (s.amount || 0), 0) / 100000;

      months.push({
        month: monthName,
        amount: Math.round(totalAmount),
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
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          dashboardData.pendingApproval,
          dashboardData.approved,
          dashboardData.rejected,
        ],
        backgroundColor: ['#fbbf24', '#10b981', '#ef4444'],
        borderWidth: 2,
      },
    ],
  };

  const monthlyChartData = {
    labels: dashboardData.monthlyStats.map(m => m.month),
    datasets: [
      {
        label: 'Total Cases',
        data: dashboardData.monthlyStats.map(m => m.total),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Approved',
        data: dashboardData.monthlyStats.map(m => m.approved),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const financialChartData = {
    labels: dashboardData.financialStats.map(f => f.month),
    datasets: [
      {
        label: 'Approved Amount (₹ Lakhs)',
        data: dashboardData.financialStats.map(f => f.amount),
        backgroundColor: 'rgba(34,197,94,0.8)',
        borderColor: '#22c55e',
        borderWidth: 1,
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      FORWARDED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
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
              <FaUserTie className="mr-3 text-green-600" />
              DM Dashboard
            </h1>
            <p className="mt-1 text-gray-600">District Magistrate Case Management Overview</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
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
              <p className="text-blue-100 text-sm font-medium">Total Cases</p>
              <p className="text-3xl font-bold">{dashboardData.totalCases}</p>
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
              <p className="text-yellow-100 text-sm font-medium">Pending Approval</p>
              <p className="text-3xl font-bold">{dashboardData.pendingApproval}</p>
              <div className="mt-2 flex items-center">
                <FaClock className="text-yellow-100 mr-1" />
                <span className="text-yellow-100 text-sm">Awaiting decision</span>
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
                <span className="text-green-100 text-sm">Successfully approved</span>
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
              <p className="text-gray-600 text-sm font-medium">Financial Sanctions</p>
              <p className="text-3xl font-bold text-gray-800">{dashboardData.financialSanctions}</p>
              <div className="mt-2 flex items-center">
                <span className="text-gray-500 text-sm">Total sanctions approved</span>
              </div>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FaDollarSign className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Orders Released</p>
              <p className="text-3xl font-bold text-gray-800">{dashboardData.ordersReleased}</p>
              <div className="mt-2 flex items-center">
                <span className="text-gray-500 text-sm">Orders issued</span>
              </div>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <FaPaperPlane className="text-2xl text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Case Status Distribution">
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

        <ChartCard title="Monthly Case Trends">
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

        <ChartCard title="Financial Approvals">
          <Bar
            data={financialChartData}
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
              <FaFileAlt className="mr-2 text-green-600" />
              Recent Cases ({filteredCases.length})
            </h2>
            <div className="flex items-center space-x-4">
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="FORWARDED">Forwarded</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Link
                to="/dm-dashboard/case-files"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
                        to={`/dm-dashboard/case-file/${enquiry.enquiry_id}`}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <FaEye className="inline mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/dm-dashboard/approval-reject`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Review
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

export default DMDashboard;