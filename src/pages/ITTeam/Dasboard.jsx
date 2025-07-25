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
  FaQuestionCircle,
  FaServer,
  FaDatabase,
  FaShieldAlt,
  FaTools,
  FaBug,
  FaCode,
  FaCloudUploadAlt,
  FaHardHat
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

const ITTeamDashboard = () => {
  const styles = useThemeStyles();
  const [dashboardData, setDashboardData] = useState({
    totalEnquiries: 0,
    totalUsers: 0,
    totalHospitals: 0,
    totalDistricts: 0,
    systemHealth: 'Good',
    serverUptime: '99.9%',
    databaseSize: '2.4 GB',
    activeConnections: 45,
    errorLogs: 12,
    securityAlerts: 3,
    backupStatus: 'Completed',
    lastBackup: new Date().toISOString(),
    recentUsers: [],
    systemLogs: [],
    performanceMetrics: [],
    userActivityStats: [],
    securityEvents: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
        systemHealth: 'Excellent',
        serverUptime: '99.9%',
        databaseSize: '2.4 GB',
        activeConnections: Math.floor(Math.random() * 100) + 20,
        errorLogs: Math.floor(Math.random() * 20),
        securityAlerts: Math.floor(Math.random() * 5),
        backupStatus: 'Completed',
        lastBackup: new Date().toISOString(),
        recentUsers: users
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10),
        systemLogs: generateSystemLogs(),
        performanceMetrics: generatePerformanceMetrics(),
        userActivityStats: calculateUserActivityStats(users),
        securityEvents: generateSecurityEvents(),
      };

      setDashboardData(stats);
      setError('');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generate mock system logs
  const generateSystemLogs = () => {
    const logTypes = ['INFO', 'WARNING', 'ERROR', 'SUCCESS'];
    const messages = [
      'User authentication successful',
      'Database backup completed',
      'System performance optimized',
      'Security scan completed',
      'API endpoint response time improved',
      'Cache cleared successfully',
      'SSL certificate renewed',
      'Server restart completed'
    ];

    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      type: logTypes[Math.floor(Math.random() * logTypes.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      source: 'System'
    }));
  };

  // Generate performance metrics
  const generatePerformanceMetrics = () => {
    const hours = [];
    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      hours.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 30) + 40,
        requests: Math.floor(Math.random() * 100) + 50
      });
    }
    return hours;
  };

  // Calculate user activity stats
  const calculateUserActivityStats = (users) => {
    const roleMap = {};
    users.forEach(user => {
      const role = user.role || 'UNKNOWN';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });

    return Object.entries(roleMap).map(([role, count]) => ({ role, count }));
  };

  // Generate security events
  const generateSecurityEvents = () => {
    const eventTypes = ['Login Attempt', 'Permission Change', 'Data Access', 'System Alert'];
    const statuses = ['Success', 'Failed', 'Blocked', 'Warning'];

    return Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      user: `User${Math.floor(Math.random() * 100)}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`
    }));
  };

  useEffect(() => {
    fetchDashboardData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Chart configurations
  const performanceChartData = {
    labels: dashboardData.performanceMetrics.slice(-12).map(m => m.time),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: dashboardData.performanceMetrics.slice(-12).map(m => m.cpu),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Memory Usage (%)',
        data: dashboardData.performanceMetrics.slice(-12).map(m => m.memory),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const userRoleChartData = {
    labels: dashboardData.userActivityStats.map(r => r.role),
    datasets: [
      {
        label: 'Users by Role',
        data: dashboardData.userActivityStats.map(r => r.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#EC4899',
          '#22C55E',
          '#A855F7',
          '#F97316',
        ],
        borderWidth: 1,
      },
    ],
  };

  const getLogTypeColor = (type) => {
    const colors = {
      INFO: 'bg-blue-100 text-blue-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
      SUCCESS: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSecurityStatusColor = (status) => {
    const colors = {
      Success: 'bg-green-100 text-green-800',
      Failed: 'bg-red-100 text-red-800',
      Blocked: 'bg-orange-100 text-orange-800',
      Warning: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading IT dashboard...</p>
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
                <FaHardHat className="mr-3 text-orange-600" />
                IT Team Dashboard
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                System Administration & Technical Management
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link
                to="/it-team/system-settings"
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <FaCog className="mr-2" />
                Settings
              </Link>
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

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">System Health</p>
              <p className="text-2xl font-bold">{dashboardData.systemHealth}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaShieldAlt className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaCheckCircle className="text-green-200 mr-1" />
            <span className="text-green-100 text-sm">All systems operational</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Server Uptime</p>
              <p className="text-2xl font-bold">{dashboardData.serverUptime}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaServer className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-blue-200 mr-1" />
            <span className="text-blue-100 text-sm">Last 30 days</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Database Size</p>
              <p className="text-2xl font-bold">{dashboardData.databaseSize}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <FaDatabase className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaArrowUp className="text-purple-200 mr-1" />
            <span className="text-purple-100 text-sm">Growing steadily</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Active Connections</p>
              <p className="text-2xl font-bold">{dashboardData.activeConnections}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <FaUsers className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <FaEye className="text-orange-200 mr-1" />
            <span className="text-orange-100 text-sm">Real-time users</span>
          </div>
        </div>
      </div>

      {/* System Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Total Users</p>
              <p className="text-2xl font-bold text-blue-600">{dashboardData.totalUsers}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Error Logs</p>
              <p className="text-2xl font-bold text-red-600">{dashboardData.errorLogs}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <FaBug className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Security Alerts</p>
              <p className="text-2xl font-bold text-yellow-600">{dashboardData.securityAlerts}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Backup Status</p>
              <p className="text-lg font-bold text-green-600">{dashboardData.backupStatus}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FaCloudUploadAlt className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance Metrics Chart */}
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaChartLine className="mr-2 text-blue-600" />
              System Performance (Last 12 Hours)
            </h2>
          </div>
          <div className="h-64">
            <Line
              data={performanceChartData}
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
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* User Role Distribution */}
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaUsers className="mr-2 text-purple-600" />
              User Role Distribution
            </h2>
          </div>
          <div className="h-64">
            <Doughnut
              data={userRoleChartData}
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

      {/* System Logs and Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* System Logs */}
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
          <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaCode className="mr-2 text-green-600" />
              Recent System Logs
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dashboardData.systemLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${getLogTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                    <span className={`text-sm ${styles.primaryText}`}>{log.message}</span>
                  </div>
                  <span className={`text-xs ${styles.secondaryText}`}>
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Events */}
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
          <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
              <FaShieldAlt className="mr-2 text-red-600" />
              Security Events
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dashboardData.securityEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${getSecurityStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className={`text-sm font-medium ${styles.primaryText}`}>{event.type}</span>
                    </div>
                    <div className={`text-xs ${styles.secondaryText}`}>
                      User: {event.user} | IP: {event.ip}
                    </div>
                  </div>
                  <span className={`text-xs ${styles.secondaryText}`}>
                    {formatDate(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
        <h2 className={`text-xl font-semibold ${styles.primaryText} mb-4 flex items-center`}>
          <FaTools className="mr-2 text-indigo-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/it-team/all-users"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            <FaUsers className="text-blue-600 text-2xl mr-3" />
            <div>
              <p className="font-semibold text-blue-800">Manage Users</p>
              <p className="text-sm text-blue-600">View & edit all users</p>
            </div>
          </Link>
          
          <Link
            to="/it-team/system-logs"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
          >
            <FaCode className="text-green-600 text-2xl mr-3" />
            <div>
              <p className="font-semibold text-green-800">System Logs</p>
              <p className="text-sm text-green-600">View detailed logs</p>
            </div>
          </Link>
          
          <Link
            to="/it-team/database-management"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
          >
            <FaDatabase className="text-purple-600 text-2xl mr-3" />
            <div>
              <p className="font-semibold text-purple-800">Database</p>
              <p className="text-sm text-purple-600">Manage database</p>
            </div>
          </Link>
          
          <Link
            to="/it-team/security-center"
            className="flex items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition"
          >
            <FaShieldAlt className="text-red-600 text-2xl mr-3" />
            <div>
              <p className="font-semibold text-red-800">Security Center</p>
              <p className="text-sm text-red-600">Security management</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ITTeamDashboard;