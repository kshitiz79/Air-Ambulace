
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, 
  FaSearch, FaSyncAlt, FaEye, FaEdit, FaArrowRight ,FaArrowUp ,FaArrowDown
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

import { useDashboardData } from '../../hooks/useDashboardData';

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
  const { stats, chartData, recentActivity, loading, error, refreshData } = useDashboardData('SDM');
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

  // Mock case data for table
  const cases = [
    {
      id: 'ENQ001',
      patientName: 'Ramesh Patel',
      status: 'PENDING',
      priority: 'HIGH',
      date: '2025-01-20',
      hospital: 'AIIMS Bhopal',
    },
    {
      id: 'ENQ002',
      patientName: 'Sita Devi',
      status: 'FORWARDED',
      priority: 'MEDIUM',
      date: '2025-01-19',
      hospital: 'CHL Indore',
    },
    {
      id: 'ENQ003',
      patientName: 'Vikram Singh',
      status: 'REJECTED',
      priority: 'LOW',
      date: '2025-06-03',
      hospital: 'GMC Gwalior',
    },
  ];

  const filteredCases = cases.filter((c) => {
    return (
      (filter.status === 'ALL' || c.status === filter.status) &&
      (filter.priority === 'ALL' || c.priority === filter.priority) &&
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
        label: 'Enquiries',
        data: chartData.monthly?.map(item => item.value) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.4,
        fill: true,
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
              <FaFileAlt className="mr-3 text-blue-600" />
              SDM Dashboard
            </h1>
            <p className="mt-1 text-gray-600">Sub Divisional Magistrate Case Management Overview</p>
          </div>
         
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Enquiries</p>
              <p className="text-3xl font-bold">{stats.totalEnquiries || 0}</p>
              <div className="mt-2 flex items-center">
                <FaArrowUp className="text-blue-100 mr-1" />
                <span className="text-blue-100 text-sm">+12% from last month</span>
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
              <p className="text-3xl font-bold">{stats.pendingReview || 0}</p>
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
              <p className="text-3xl font-bold">{stats.approved || 0}</p>
              <div className="mt-2 flex items-center">
                <FaArrowUp className="text-green-100 mr-1" />
                <span className="text-green-100 text-sm">+8% from last month</span>
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
                <span className="text-red-100 text-sm">-3% from last month</span>
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
              <p className="text-3xl font-bold text-gray-800">{stats.forwardedToDM || 0}</p>
              <div className="mt-2 flex items-center">
                <FaArrowUp className="text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+15% from last month</span>
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
              <p className="text-3xl font-bold text-gray-800">{stats.queryToCMO || 0}</p>
              <div className="mt-2 flex items-center">
                <FaClock className="text-gray-500 mr-1" />
                <span className="text-gray-500 text-sm">No change</span>
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
                    Enquiry ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
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
                        c.status === 'FORWARDED' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${c.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        c.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/sdm-dashboard/enquiry-detail-page/${c.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </Link>
                      <Link
                        to={`/sdm-dashboard/enquiry-detail-page/${c.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
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