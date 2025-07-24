import React, { useState, useEffect } from 'react';
import { 
  FiTruck, 
  FiFileText, 
  FiDollarSign, 
  FiCheckCircle, 
  FiClock, 
  FiActivity,
  FiTrendingUp,
  FiUsers,
  FiMapPin,
  FiAlertCircle
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    assignments: { total: 0, assigned: 0, inProgress: 0, completed: 0 },
    reports: { total: 0, successful: 0, failed: 0, successRate: 0 },
    invoices: { total: 0, pending: 0, paid: 0, totalRevenue: 0 },
    cases: { total: 0, active: 0, closed: 0, pendingClosure: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeFlights, setActiveFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API calls - replace with actual API endpoints
      
      // Mock data for demonstration
      const mockStats = {
        assignments: { total: 45, assigned: 8, inProgress: 12, completed: 25 },
        reports: { total: 25, successful: 23, failed: 2, successRate: 92 },
        invoices: { total: 30, pending: 5, paid: 25, totalRevenue: 3250000 },
        cases: { total: 50, active: 15, closed: 30, pendingClosure: 5 }
      };

      const mockActivities = [
        {
          id: 1,
          type: 'assignment',
          message: 'New flight assignment created for Case #12345',
          timestamp: new Date(Date.now() - 5 * 60000),
          icon: FiTruck,
          color: 'text-blue-600'
        },
        {
          id: 2,
          type: 'report',
          message: 'Post-operation report submitted for Case #12344',
          timestamp: new Date(Date.now() - 15 * 60000),
          icon: FiFileText,
          color: 'text-green-600'
        },
        {
          id: 3,
          type: 'invoice',
          message: 'Invoice INV-2024-025 generated for ₹1,25,000',
          timestamp: new Date(Date.now() - 30 * 60000),
          icon: FiDollarSign,
          color: 'text-purple-600'
        },
        {
          id: 4,
          type: 'case',
          message: 'Case #12343 closed successfully',
          timestamp: new Date(Date.now() - 45 * 60000),
          icon: FiCheckCircle,
          color: 'text-green-600'
        }
      ];

      const mockActiveFlights = [
        {
          assignment_id: 1,
          ambulance_id: 'AA-001',
          patient_name: 'John Doe',
          route: 'Delhi → Mumbai',
          progress: 65,
          eta: '45 mins',
          status: 'IN_PROGRESS'
        },
        {
          assignment_id: 2,
          ambulance_id: 'AA-002',
          patient_name: 'Sarah Wilson',
          route: 'Bangalore → Chennai',
          progress: 30,
          eta: '1h 20m',
          status: 'IN_PROGRESS'
        }
      ];

      setStats(mockStats);
      setRecentActivities(mockActivities);
      setActiveFlights(mockActiveFlights);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Air Requirement Team Dashboard</h1>
            <p className="text-blue-100 mt-1">
              Welcome back! Here's what's happening with your air ambulance operations.
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Today</p>
            <p className="text-xl font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Flight Assignments */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/air-team/ambulance-assignment-page')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Flight Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assignments.total}</p>
              <div className="flex space-x-4 mt-2 text-xs">
                <span className="text-blue-600">Active: {stats.assignments.inProgress}</span>
                <span className="text-green-600">Completed: {stats.assignments.completed}</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiTruck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Post-Operation Reports */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/air-team/post-operation-page')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Operation Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reports.total}</p>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-green-600">Success Rate: {stats.reports.successRate}%</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiFileText className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/air-team/invoice-generation-page')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.invoices.totalRevenue)}
              </p>
              <div className="flex space-x-4 mt-2 text-xs">
                <span className="text-yellow-600">Pending: {stats.invoices.pending}</span>
                <span className="text-green-600">Paid: {stats.invoices.paid}</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiDollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Case Management */}
        <div 
          className="bg-white p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/air-team/case-detail-page')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cases.total}</p>
              <div className="flex space-x-4 mt-2 text-xs">
                <span className="text-blue-600">Active: {stats.cases.active}</span>
                <span className="text-green-600">Closed: {stats.cases.closed}</span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FiUsers className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Flights */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active Flights</h3>
              <button 
                onClick={() => navigate('/air-team/tracker-page')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {activeFlights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiMapPin size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No active flights at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeFlights.map((flight) => (
                  <div key={flight.assignment_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FiTruck className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{flight.ambulance_id}</h4>
                          <p className="text-sm text-gray-600">Patient: {flight.patient_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">ETA: {flight.eta}</p>
                        <p className="text-xs text-gray-600">{flight.route}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{flight.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${flight.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <IconComponent className={activity.color} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <FiTrendingUp className="text-green-600" size={24} />
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.reports.successRate}%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <FiActivity className="text-blue-600" size={24} />
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.assignments.inProgress}</p>
                <p className="text-sm text-gray-600">Active Flights</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <FiClock className="text-yellow-600" size={24} />
                </div>
                <p className="text-2xl font-bold text-yellow-600">{stats.cases.pendingClosure}</p>
                <p className="text-sm text-gray-600">Pending Closure</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <FiDollarSign className="text-purple-600" size={24} />
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.invoices.pending}</p>
                <p className="text-sm text-gray-600">Pending Invoices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => navigate('/air-team/ambulance-assignment-page')}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FiTruck className="text-blue-600" size={20} />
                  <span className="font-medium">Create New Assignment</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <button
                onClick={() => navigate('/air-team/post-operation-page')}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FiFileText className="text-green-600" size={20} />
                  <span className="font-medium">Submit Operation Report</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <button
                onClick={() => navigate('/air-team/invoice-generation-page')}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FiDollarSign className="text-purple-600" size={20} />
                  <span className="font-medium">Generate Invoice</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <button
                onClick={() => navigate('/air-team/case-close-file')}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="text-orange-600" size={20} />
                  <span className="font-medium">Close Case</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      {(stats.invoices.pending > 0 || stats.cases.pendingClosure > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="text-yellow-600" size={20} />
            <div>
              <h4 className="font-medium text-yellow-800">Attention Required</h4>
              <div className="text-sm text-yellow-700 mt-1">
                {stats.invoices.pending > 0 && (
                  <p>• {stats.invoices.pending} invoices are pending payment</p>
                )}
                {stats.cases.pendingClosure > 0 && (
                  <p>• {stats.cases.pendingClosure} cases are pending closure</p>
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