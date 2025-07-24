import React, { useState } from 'react';
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

import { useDashboardData } from '../../hooks/useDashboardData';
import StatsCard from '../../components/Dashboard/StatsCard';
import ChartCard from '../../components/Dashboard/ChartCard';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import QuickActions from '../../components/Dashboard/QuickActions';


const DMDashboard = () => {
  const [filter, setFilter] = useState({ status: 'ALL', date: '' });
  const { stats, chartData, recentActivity, loading, error, refreshData } = useDashboardData('DM');

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
  // Mock case data for table
  const cases = [
    {
      id: 'ENQ001',
      patientName: 'Ramesh Patel',
      status: 'PENDING',
      date: '2025-01-20',
      hospital: 'AIIMS Bhopal',
      amount: '₹50,000'
    },
    {
      id: 'ENQ002',
      patientName: 'Sita Devi',
      status: 'APPROVED',
      date: '2025-01-19',
      hospital: 'CHL Indore',
      amount: '₹75,000'
    },
    {
      id: 'ENQ003',
      patientName: 'Vikram Singh',
      status: 'REJECTED',
      date: '2025-01-18',
      hospital: 'GMC Gwalior',
      amount: '₹60,000'
    },
  ];

  const filteredCases = cases.filter((c) => {
    return (
      (filter.status === 'ALL' || c.status === filter.status) &&
      (!filter.date || c.date.includes(filter.date))
    );
  });

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

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
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={refreshData}
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
    labels: chartData.status?.map(item => item.name) || [],
    datasets: [
      {
        data: chartData.status?.map(item => item.value) || [],
        backgroundColor: chartData.status?.map(item => item.color) || [],
        borderWidth: 2,
      },
    ],
  };

  const monthlyChartData = {
    labels: chartData.monthly?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Cases',
        data: chartData.monthly?.map(item => item.value) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const financialChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Approved Amount (₹ Lakhs)',
        data: [25, 30, 45, 35, 50, 40],
        backgroundColor: 'rgba(34,197,94,0.8)',
        borderColor: '#22c55e',
        borderWidth: 1,
      },
    ],
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
            onClick={refreshData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaSyncAlt className="mr-2" />
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
              <p className="text-3xl font-bold">{stats.totalCases || 0}</p>
              <div className="mt-2 flex items-center">
                <FaArrowUp className="text-blue-100 mr-1" />
                <span className="text-blue-100 text-sm">+8% from last month</span>
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
              <p className="text-3xl font-bold">{stats.pendingApproval || 0}</p>
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
              <p className="text-3xl font-bold">{stats.approved || 0}</p>
              <div className="mt-2 flex items-center">
                <FaArrowUp className="text-green-100 mr-1" />
                <span className="text-green-100 text-sm">+12% from last month</span>
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
              <p className="text-3xl font-bold">{stats.rejected || 0}</p>
              <div className="mt-2 flex items-center">
                <FaArrowDown className="text-red-100 mr-1" />
                <span className="text-red-100 text-sm">-5% from last month</span>
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
              <p className="text-3xl font-bold text-gray-800">{stats.financialSanctions || 0}</p>
              <div className="mt-2 flex items-center">
                <FaArrowUp className="text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+18% from last month</span>
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
              <p className="text-3xl font-bold text-gray-800">{stats.ordersReleased || 0}</p>
              <div className="mt-2 flex items-center">
                <FaArrowUp className="text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+10% from last month</span>
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
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                {filteredCases.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {c.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        c.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/dm-dashboard/case-file/${c.id}`}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
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