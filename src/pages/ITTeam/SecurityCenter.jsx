import React, { useState, useEffect } from 'react';
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaUnlock,
  FaKey,
  FaEye,
  FaUserShield,
  FaServer,
  FaNetworkWired,

  FaBug,
  FaSearch,
  FaDownload,
  FaSyncAlt,
  FaClock,
  FaGlobe,
  FaDatabase,
  FaFire
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const SecurityCenter = () => {
  const styles = useThemeStyles();
  const [securityEvents, setSecurityEvents] = useState([]);
  const [securityStats, setSecurityStats] = useState({
    totalThreats: 23,
    blockedAttempts: 156,
    activeAlerts: 3,
    securityScore: 85,
    lastScan: new Date().toISOString(),
    firewallStatus: 'Active',
    sslStatus: 'Valid',
    backupEncryption: 'Enabled'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(20);

  const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  // Generate mock security events
  const generateSecurityEvents = () => {
    const eventTypes = [
      'Failed Login Attempt',
      'Suspicious IP Access',
      'SQL Injection Attempt',
      'Brute Force Attack',
      'Unauthorized API Access',
      'File Upload Blocked',
      'XSS Attempt Blocked',
      'Rate Limit Exceeded',
      'Malware Detection',
      'Firewall Block',
      'SSL Certificate Warning',
      'Database Access Anomaly',
      'Admin Panel Access',
      'Password Reset Abuse',
      'Session Hijacking Attempt'
    ];

    const sources = ['Web Application', 'API', 'Database', 'File System', 'Network', 'Authentication'];
    const actions = ['Blocked', 'Monitored', 'Quarantined', 'Logged', 'Alerted'];

    return Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      ip_address: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      details: `Security event details for incident ${i + 1}`,
      resolved: Math.random() > 0.3
    }));
  };

  // Fetch security data
  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      // In a real application, this would fetch from an API
      const mockEvents = generateSecurityEvents();
      setSecurityEvents(mockEvents);
      setError('');
    } catch (err) {
      console.error('Security data fetch error:', err);
      setError('Failed to load security data: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter events
  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch =
      event.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.ip_address?.includes(searchTerm) ||
      event.details?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'ALL' || event.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  // Pagination
  const getCurrentPageEvents = () => {
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    return filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  };

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSeverity]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityData();
  };

  const handleResolveEvent = (eventId) => {
    setSecurityEvents(prev =>
      prev.map(event =>
        event.id === eventId ? { ...event, resolved: true } : event
      )
    );
  };

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      LOW: <FaCheckCircle />,
      MEDIUM: <FaExclamationTriangle />,
      HIGH: <FaExclamationTriangle />,
      CRITICAL: <FaTimesCircle />,
    };
    return icons[severity] || <FaCheckCircle />;
  };

  const getActionColor = (action) => {
    const colors = {
      Blocked: 'bg-red-100 text-red-800',
      Monitored: 'bg-blue-100 text-blue-800',
      Quarantined: 'bg-orange-100 text-orange-800',
      Logged: 'bg-gray-100 text-gray-800',
      Alerted: 'bg-yellow-100 text-yellow-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportSecurityReport = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Severity', 'Source', 'Action', 'IP Address', 'Resolved', 'Details'].join(','),
      ...filteredEvents.map(event => [
        event.timestamp,
        `"${event.type}"`,
        event.severity,
        event.source,
        event.action,
        event.ip_address,
        event.resolved ? 'Yes' : 'No',
        `"${event.details}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading security center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
                <FaShieldAlt className="mr-3 text-red-600" />
                Security Center
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                Monitor security threats and system protection status
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
              <button
                onClick={exportSecurityReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <FaDownload className="mr-2" />
                Export Report
              </button>
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

      {/* Security Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Threats</p>
              <p className="text-3xl font-bold">{securityStats.totalThreats}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <FaExclamationTriangle className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Blocked Attempts</p>
              <p className="text-3xl font-bold">{securityStats.blockedAttempts}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <FaLock className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Active Alerts</p>
              <p className="text-3xl font-bold">{securityStats.activeAlerts}</p>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
              <FaExclamationTriangle className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Security Score</p>
              <p className="text-3xl font-bold">{securityStats.securityScore}%</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaShieldAlt className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Firewall Status</p>
              <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                {securityStats.firewallStatus}
              </span>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FaFire className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>SSL Certificate</p>
              <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                {securityStats.sslStatus}
              </span>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FaLock className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Backup Encryption</p>
              <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                {securityStats.backupEncryption}
              </span>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FaKey className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Search Events</label>
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${styles.secondaryText}`} />
              <input
                type="text"
                placeholder="Search by type, source, IP, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            >
              <option value="ALL">All Severities</option>
              {severityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Security Events Table */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <h2 className={`text-xl font-semibold ${styles.primaryText}`}>
            Security Events ({filteredEvents.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {getCurrentPageEvents().length === 0 ? (
            <div className={`p-8 text-center ${styles.secondaryText}`}>
              <FaShieldAlt className="mx-auto text-4xl mb-4 text-gray-300" />
              <p>No security events found matching the current filters.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Timestamp
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Event Type
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Severity
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Source
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Action
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    IP Address
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                {getCurrentPageEvents().map((event) => (
                  <tr key={event.id} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-gray-400" />
                        <span className={`text-sm ${styles.primaryText}`}>
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${styles.primaryText}`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                        {getSeverityIcon(event.severity)}
                        <span className="ml-1">{event.severity}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${styles.primaryText}`}>
                        {event.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(event.action)}`}>
                        {event.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaGlobe className="mr-2 text-gray-400" />
                        <span className={`text-sm ${styles.secondaryText}`}>
                          {event.ip_address}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${event.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {event.resolved ? 'Resolved' : 'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {!event.resolved && (
                          <button
                            onClick={() => handleResolveEvent(event.id)}
                            className="text-green-600 hover:text-green-900 transition"
                            title="Mark as Resolved"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t ${styles.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${styles.secondaryText}`}>
                Showing {((currentPage - 1) * eventsPerPage) + 1} to {Math.min(currentPage * eventsPerPage, filteredEvents.length)} of {filteredEvents.length} events
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-md transition ${currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityCenter;