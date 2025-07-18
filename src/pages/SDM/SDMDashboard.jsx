

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChartPie, FaCalendarAlt, FaClock, FaArrowUp, FaArrowDown, FaTimesCircle, FaFilter } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { isDark } = useTheme();
  // Mock case data
  const cases = [
    {
      id: 'ENQ001',
      patientName: 'Ramesh Patel',
      status: 'PENDING',
      priority: 'HIGH',
      date: '2025-06-01',
      hospital: 'AIIMS Bhopal',
    },
    {
      id: 'ENQ002',
      patientName: 'Sita Devi',
      status: 'FORWARDED',
      priority: 'MEDIUM',
      date: '2025-06-02',
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

  // Mock summary data
  const summary = {
    pending: cases.filter((c) => c.status === 'PENDING').length,
    forwarded: cases.filter((c) => c.status === 'FORWARDED').length,
    rejected: cases.filter((c) => c.status === 'REJECTED').length,
  };

  // Mock chart data
  const statusChartData = {
    labels: ['Pending', 'Forwarded', 'Rejected'],
    datasets: [
      {
        data: [summary.pending, summary.forwarded, summary.rejected],
        backgroundColor: ['#FBBF24', '#3B82F6', '#EF4444'],
        borderColor: ['#F59E0B', '#2563EB', '#B91C1C'],
        borderWidth: 2,
      },
    ],
  };

  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Pending',
        data: [2, 3, 1, 4, 2, summary.pending],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(251,191,36,0.1)',
        tension: 0.4,
      },
      {
        label: 'Forwarded',
        data: [1, 2, 2, 1, 3, summary.forwarded],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.4,
      },
      {
        label: 'Rejected',
        data: [0, 1, 0, 2, 1, summary.rejected],
        borderColor: '#B91C1C',
        backgroundColor: 'rgba(239,68,68,0.1)',
        tension: 0.4,
      },
    ],
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className={`rounded-lg shadow-lg mb-6 ${isDark ? 'bg-slate-800' : 'bg-white'
        }`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'
          }`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold flex items-center ${isDark ? 'text-slate-100' : 'text-gray-800'
                }`}>
                <FaChartPie className="mr-3 text-blue-600" />
                SDM Dashboard
              </h1>
              <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>District Magistrate Case Management Overview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending Cases</p>
              <p className="text-3xl font-bold">{summary.pending}</p>
            </div>
            <div className="bg-yellow-300 bg-opacity-30 rounded-full p-3">
              <FaClock className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-yellow-100 mr-1" />
            <span className="text-yellow-100 text-sm">Awaiting action</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Forwarded Cases</p>
              <p className="text-3xl font-bold">{summary.forwarded}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaArrowUp className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-blue-100 mr-1" />
            <span className="text-blue-100 text-sm">Sent to next level</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Rejected Cases</p>
              <p className="text-3xl font-bold">{summary.rejected}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <FaTimesCircle className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowDown className="text-red-100 mr-1" />
            <span className="text-red-100 text-sm">Not approved</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution Chart */}
        <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold flex items-center ${isDark ? 'text-slate-100' : 'text-gray-800'
              }`}>
              <FaChartPie className="mr-2 text-blue-600" />
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
        <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold flex items-center ${isDark ? 'text-slate-100' : 'text-gray-800'
              }`}>
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

      {/* Filters */}
      <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDark ? 'bg-slate-800' : 'bg-white'
        }`}>
        <div className="flex items-center mb-4">
          <FaFilter className={`mr-2 ${isDark ? 'text-slate-400' : 'text-gray-600'
            }`} />
          <h2 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-gray-800'
            }`}>Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>Status</label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark
                ? 'bg-slate-700 border-slate-600 text-slate-100'
                : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="FORWARDED">Forwarded</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>Priority</label>
            <select
              name="priority"
              value={filter.priority}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark
                ? 'bg-slate-700 border-slate-600 text-slate-100'
                : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="ALL">All</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>Date</label>
            <input
              type="date"
              name="date"
              value={filter.date}
              onChange={handleFilterChange}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark
                ? 'bg-slate-700 border-slate-600 text-slate-100'
                : 'bg-white border-gray-300 text-gray-900'
                }`}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className={`rounded-lg shadow-lg ${isDark ? 'bg-slate-800' : 'bg-white'
        }`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'
          }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold flex items-center ${isDark ? 'text-slate-100' : 'text-gray-800'
              }`}>
              Case List ({filteredCases.length})
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          {filteredCases.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-gray-500'
              }`}>
              <p>No cases found matching the current filters.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={isDark ? 'bg-slate-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-500'
                    }`}>Enquiry ID</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-500'
                    }`}>Patient</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-500'
                    }`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-500'
                    }`}>Priority</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-500'
                    }`}>Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-gray-500'
                    }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-200'
                }`}>
                {filteredCases.map((c) => (
                  <tr key={c.id} className={`${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                    }`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-slate-100' : 'text-gray-900'
                      }`}>{c.id}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-200' : 'text-gray-900'
                      }`}>{c.patientName}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-200' : 'text-gray-900'
                      }`}>{c.status}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-200' : 'text-gray-900'
                      }`}>{c.priority}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-200' : 'text-gray-900'
                      }`}>{c.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/sdm-dashboard/enquiry-detail-page/${c.id}`}
                        className="text-blue-600 hover:underline"
                      >
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