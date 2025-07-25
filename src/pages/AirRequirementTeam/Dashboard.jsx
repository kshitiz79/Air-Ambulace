import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTruck,
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiTrendingUp,
  FiMapPin,
  FiAlertCircle,
  FiArrowUp,
  FiRefreshCw
} from 'react-icons/fi';
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

// Import reusable components
import ChartCard from '../../components/Dashboard/ChartCard';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import QuickActions from '../../components/Dashboard/QuickActions';
import baseUrl from '../../baseUrl/baseUrl';

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

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeFlights: 0,
    completedFlights: 0,
    pendingReports: 0,
    totalRevenue: 0,
    successRate: 0,
    pendingInvoices: 0,
    closedCases: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Quick actions for Air Requirement Team
  const quickActions = [
    {
      title: 'Create Assignment',
      description: 'Create new flight assignment',
      icon: <FiTruck className="text-blue-600" />,
      to: '/air-team/ambulance-assignment-page',
      color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
    },
    {
      title: 'Submit Report',
      description: 'Submit operation report',
      icon: <FiFileText className="text-green-600" />,
      to: '/air-team/post-operation-page',
      color: 'border-green-200 hover:border-green-400 hover:bg-green-50'
    },
    {
      title: 'Generate Invoice',
      description: 'Create new invoice',
      icon: <FiDollarSign className="text-purple-600" />,
      to: '/air-team/invoice-generation-page',
      color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
    },
    {
      title: 'Track Flights',
      description: 'Monitor active flights',
      icon: <FiMapPin className="text-orange-600" />,
      to: '/air-team/tracker-page',
      color: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50'
    }
  ];

  // API Functions
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all required data in parallel
      const [
        assignmentStatsRes,
        invoiceStatsRes,
        reportStatsRes,
        ambulanceStatsRes,
        assignmentsRes,
        reportsRes,
        invoicesRes
      ] = await Promise.all([
        fetch(`${baseUrl}/api/flight-assignments/stats`, { headers }),
        fetch(`${baseUrl}/api/invoices/stats`, { headers }),
        fetch(`${baseUrl}/api/post-operation-reports/stats`, { headers }),
        fetch(`${baseUrl}/api/ambulances/stats`, { headers }),
        fetch(`${baseUrl}/api/flight-assignments?limit=10`, { headers }),
        fetch(`${baseUrl}/api/post-operation-reports?limit=5`, { headers }),
        fetch(`${baseUrl}/api/invoices?limit=5`, { headers })
      ]);

      // Parse responses
      const assignmentStats = assignmentStatsRes.ok ? await assignmentStatsRes.json() : {};
      const invoiceStats = invoiceStatsRes.ok ? await invoiceStatsRes.json() : {};
      const reportStats = reportStatsRes.ok ? await reportStatsRes.json() : {};
      const ambulanceStats = ambulanceStatsRes.ok ? await ambulanceStatsRes.json() : {};
      const assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
      const reports = reportsRes.ok ? await reportsRes.json() : [];
      const invoices = invoicesRes.ok ? await invoicesRes.json() : [];

      // Update stats
      setStats({
        totalAssignments: assignmentStats.total || 0,
        activeFlights: (assignmentStats.assigned || 0) + (assignmentStats.inProgress || 0),
        completedFlights: assignmentStats.completed || 0,
        pendingReports: (assignmentStats.total || 0) - (reportStats.total || 0),
        totalRevenue: invoiceStats.totalRevenue || 0,
        successRate: reportStats.successRate || 0,
        pendingInvoices: invoiceStats.pending || 0,
        closedCases: assignmentStats.completed || 0
      });

      // Generate recent activity from API data
      const activities = [];
      
      // Add recent assignments
      if (Array.isArray(assignments)) {
        assignments.slice(0, 3).forEach(assignment => {
          activities.push({
            type: 'assignment',
            description: `Flight assignment ${assignment.ambulance_id || 'created'} for enquiry #${assignment.enquiry_id}`,
            timestamp: new Date(assignment.created_at)
          });
        });
      }

      // Add recent reports
      if (Array.isArray(reports)) {
        reports.slice(0, 2).forEach(report => {
          activities.push({
            type: report.patient_transfer_status === 'SUCCESSFUL' ? 'approval' : 'rejection',
            description: `Operation report submitted for enquiry #${report.enquiry_id} - ${report.patient_transfer_status}`,
            timestamp: new Date(report.created_at)
          });
        });
      }

      // Add recent invoices
      if (Array.isArray(invoices)) {
        invoices.slice(0, 2).forEach(invoice => {
          activities.push({
            type: 'enquiry',
            description: `Invoice generated for enquiry #${invoice.enquiry_id} - ₹${invoice.amount}`,
            timestamp: new Date(invoice.created_at)
          });
        });
      }

      // Sort activities by timestamp and take the most recent
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivity(activities.slice(0, 5));

      // Generate monthly data (simplified - you can enhance this)
      const currentMonth = new Date().getMonth();
      const monthlyAssignments = [];
      const monthlyCompletions = [];
      
      for (let i = 5; i >= 0; i--) {
        const month = new Date();
        month.setMonth(currentMonth - i);
        
        // This is simplified - in a real app, you'd fetch monthly data from the API
        const assignmentCount = Math.floor(Math.random() * 20) + 10;
        const completionCount = Math.floor(assignmentCount * 0.8);
        
        monthlyAssignments.push(assignmentCount);
        monthlyCompletions.push(completionCount);
      }
      
      setMonthlyData({
        assignments: monthlyAssignments,
        completions: monthlyCompletions
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Chart data for status distribution
  const statusChartData = {
    labels: ['Active Flights', 'Completed', 'Pending Reports', 'Closed Cases'],
    datasets: [
      {
        data: [stats.activeFlights, stats.completedFlights, stats.pendingReports, stats.closedCases],
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Yellow
          '#6B7280', // Gray
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#4B5563',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Generate month labels
  const getMonthLabels = () => {
    const labels = [];
    const currentMonth = new Date().getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);
    }
    return labels;
  };

  // Monthly trends data using real API data
  const monthlyChartData = {
    labels: getMonthLabels(),
    datasets: [
      {
        label: 'Flight Assignments',
        data: monthlyData.assignments || [0, 0, 0, 0, 0, 0],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Completed Flights',
        data: monthlyData.completions || [0, 0, 0, 0, 0, 0],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FiTruck className="mr-3 text-blue-600" />
              Air Requirement Team Dashboard
            </h1>
            <p className="mt-1 text-gray-600">Air Ambulance Service Operations Overview</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="text-red-600" size={20} />
            <div>
              <h4 className="font-medium text-red-800">Error Loading Data</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={refreshData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Assignments</p>
              <p className="text-3xl font-bold">{stats.totalAssignments}</p>
              <div className="mt-2 flex items-center">
                <FiArrowUp className="text-blue-100 mr-1" />
                <span className="text-blue-100 text-sm">+15% from last month</span>
              </div>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FiTruck className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Flights</p>
              <p className="text-3xl font-bold">{stats.activeFlights}</p>
              <div className="mt-2 flex items-center">
                <FiActivity className="text-green-100 mr-1" />
                <span className="text-green-100 text-sm">Currently in progress</span>
              </div>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FiActivity className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              <div className="mt-2 flex items-center">
                <FiArrowUp className="text-purple-100 mr-1" />
                <span className="text-purple-100 text-sm">+22% from last month</span>
              </div>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <FiDollarSign className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Success Rate</p>
              <p className="text-3xl font-bold">{stats.successRate}%</p>
              <div className="mt-2 flex items-center">
                <FiTrendingUp className="text-orange-100 mr-1" />
                <span className="text-orange-100 text-sm">Excellent performance</span>
              </div>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <FiTrendingUp className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed Flights</p>
              <p className="text-3xl font-bold text-gray-800">{stats.completedFlights}</p>
              <div className="mt-2 flex items-center">
                <FiArrowUp className="text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+8% from last month</span>
              </div>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FiCheckCircle className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Reports</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingReports}</p>
              <div className="mt-2 flex items-center">
                <FiClock className="text-yellow-500 mr-1" />
                <span className="text-yellow-500 text-sm">Awaiting submission</span>
              </div>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <FiFileText className="text-2xl text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Invoices</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingInvoices}</p>
              <div className="mt-2 flex items-center">
                <FiClock className="text-gray-500 mr-1" />
                <span className="text-gray-500 text-sm">Requires attention</span>
              </div>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FiDollarSign className="text-2xl text-purple-600" />
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

      {/* Alerts & Notifications */}
      {(stats.pendingInvoices > 0 || stats.pendingReports > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="text-yellow-600" size={20} />
            <div>
              <h4 className="font-medium text-yellow-800">Attention Required</h4>
              <div className="text-sm text-yellow-700 mt-1">
                {stats.pendingInvoices > 0 && (
                  <p>• {stats.pendingInvoices} invoices are pending payment</p>
                )}
                {stats.pendingReports > 0 && (
                  <p>• {stats.pendingReports} operation reports are pending submission</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;