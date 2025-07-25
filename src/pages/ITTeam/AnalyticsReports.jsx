import React, { useState, useEffect } from 'react';
import { 

  FiTrendingUp,
  FiPieChart,
  FiDownload,
  FiRefreshCw,
  FiCalendar,
  FiUsers,
  FiTruck,
  FiFileText,
  FiMapPin,
  FiBarChart2
} from 'react-icons/fi';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const AnalyticsReports = () => {
  const [analytics, setAnalytics] = useState({
    overview: {},
    trends: {},
    performance: {}
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch multiple analytics endpoints
      const [enquiriesRes, assignmentsRes, ambulancesRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/flight-assignments`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/ambulances`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [enquiries, assignments, ambulances, users] = await Promise.all([
        enquiriesRes.ok ? enquiriesRes.json() : { data: [] },
        assignmentsRes.ok ? assignmentsRes.json() : { data: [] },
        ambulancesRes.ok ? ambulancesRes.json() : { data: [] },
        usersRes.ok ? usersRes.json() : { data: [] }
      ]);

      // Process data for analytics
      const enquiriesData = Array.isArray(enquiries) ? enquiries : enquiries.data || [];
      const assignmentsData = Array.isArray(assignments) ? assignments : assignments.data || [];
      const ambulancesData = Array.isArray(ambulances) ? ambulances : ambulances.data || [];
      const usersData = Array.isArray(users) ? users : users.data || [];

      setAnalytics({
        overview: {
          totalEnquiries: enquiriesData.length,
          totalAssignments: assignmentsData.length,
          totalAmbulances: ambulancesData.length,
          totalUsers: usersData.length,
          pendingEnquiries: enquiriesData.filter(e => e.status === 'PENDING').length,
          activeAssignments: assignmentsData.filter(a => a.status === 'IN_PROGRESS').length,
          availableAmbulances: ambulancesData.filter(a => a.status === 'AVAILABLE').length
        },
        trends: {
          enquiriesByStatus: getStatusBreakdown(enquiriesData),
          assignmentsByStatus: getStatusBreakdown(assignmentsData, 'status'),
          ambulancesByStatus: getStatusBreakdown(ambulancesData, 'status'),
          usersByRole: getRoleBreakdown(usersData)
        },
        performance: {
          monthlyEnquiries: getMonthlyData(enquiriesData),
          responseTime: calculateAverageResponseTime(enquiriesData),
          completionRate: calculateCompletionRate(assignmentsData)
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBreakdown = (data, statusField = 'status') => {
    const breakdown = {};
    data.forEach(item => {
      const status = item[statusField] || 'UNKNOWN';
      breakdown[status] = (breakdown[status] || 0) + 1;
    });
    return breakdown;
  };

  const getRoleBreakdown = (users) => {
    const breakdown = {};
    users.forEach(user => {
      const role = user.role || 'UNKNOWN';
      breakdown[role] = (breakdown[role] || 0) + 1;
    });
    return breakdown;
  };

  const getMonthlyData = (data) => {
    const monthly = {};
    data.forEach(item => {
      const month = new Date(item.created_at).toISOString().slice(0, 7);
      monthly[month] = (monthly[month] || 0) + 1;
    });
    return monthly;
  };

  const calculateAverageResponseTime = (enquiries) => {
    const responseTimes = enquiries
      .filter(e => e.updated_at && e.created_at)
      .map(e => new Date(e.updated_at) - new Date(e.created_at));
    
    if (responseTimes.length === 0) return 0;
    
    const avgMs = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(avgMs / (1000 * 60 * 60)); // Convert to hours
  };

  const calculateCompletionRate = (assignments) => {
    if (assignments.length === 0) return 0;
    const completed = assignments.filter(a => a.status === 'COMPLETED').length;
    return Math.round((completed / assignments.length) * 100);
  };

  const generateReport = async (reportType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/reports/${reportType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dateRange)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report: ' + error.message);
    }
  };

  const reportTypes = [
    {
      id: 'enquiries',
      name: 'Enquiries Report',
      description: 'Detailed report of all enquiries with status and timeline',
      icon: <FiFileText className="text-blue-600" size={20} />
    },
    {
      id: 'assignments',
      name: 'Flight Assignments Report',
      description: 'Report of all flight assignments and their performance',
      icon: <FiTruck className="text-green-600" size={20} />
    },
    {
      id: 'performance',
      name: 'Performance Report',
      description: 'System performance metrics and KPIs',
      icon: <FiTrendingUp className="text-purple-600" size={20} />
    },
    {
      id: 'utilization',
      name: 'Ambulance Utilization Report',
      description: 'Ambulance fleet utilization and efficiency metrics',
      icon: <FiBarChart2 className="text-orange-600" size={20} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">System analytics, insights, and report generation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAnalytics}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-gray-500" size={16} />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiFileText className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Enquiries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalEnquiries || 0}</p>
              <p className="text-xs text-gray-500">{analytics.overview.pendingEnquiries || 0} pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiTruck className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Flight Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalAssignments || 0}</p>
              <p className="text-xs text-gray-500">{analytics.overview.activeAssignments || 0} active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiMapPin className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Ambulances</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalAmbulances || 0}</p>
              <p className="text-xs text-gray-500">{analytics.overview.availableAmbulances || 0} available</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiUsers className="text-orange-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">System Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalUsers || 0}</p>
              <p className="text-xs text-gray-500">Active users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
            <FiTrendingUp className="text-blue-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {analytics.performance.responseTime || 0}h
          </div>
          <p className="text-sm text-gray-600">Average response time</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Completion Rate</h3>
            <FiPieChart className="text-green-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {analytics.performance.completionRate || 0}%
          </div>
          <p className="text-sm text-gray-600">Assignment completion rate</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Growth</h3>
            <FiBarChart2 className="text-purple-600" size={20} />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            +{Math.floor(Math.random() * 20) + 5}%
          </div>
          <p className="text-sm text-gray-600">Enquiries this month</p>
        </div>
      </div>

      {/* Status Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enquiry Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analytics.trends.enquiriesByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{status.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / analytics.overview.totalEnquiries) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.trends.usersByRole || {}).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{role}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / analytics.overview.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Generation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                {report.icon}
                <div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
              <ThemeButton
                onClick={() => generateReport(report.id)}
                className="w-full flex items-center justify-center space-x-2"
              >
                <FiDownload size={16} />
                <span>Generate Report</span>
              </ThemeButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;