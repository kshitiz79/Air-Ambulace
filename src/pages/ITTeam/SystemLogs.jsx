import React, { useState, useEffect } from 'react';
import { 
  FaCode, 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaSyncAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaClock,
  FaServer,
  FaDatabase,
  FaShieldAlt
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const SystemLogs = () => {
  const styles = useThemeStyles();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(50);
  const [refreshing, setRefreshing] = useState(false);

  const logLevels = ['INFO', 'WARNING', 'ERROR', 'SUCCESS', 'DEBUG'];
  const logSources = ['System', 'Database', 'API', 'Authentication', 'Security', 'Backup'];

  // Generate mock system logs
  const generateSystemLogs = () => {
    const messages = [
      'User authentication successful',
      'Database backup completed',
      'System performance optimized',
      'Security scan completed',
      'API endpoint response time improved',
      'Cache cleared successfully',
      'SSL certificate renewed',
      'Server restart completed',
      'Database connection established',
      'User session expired',
      'File upload completed',
      'Email notification sent',
      'Password reset requested',
      'Login attempt failed',
      'System maintenance started',
      'Backup verification completed',
      'Security alert triggered',
      'Database query optimized',
      'API rate limit exceeded',
      'User account locked'
    ];

    return Array.from({ length: 200 }, (_, i) => ({
      id: i + 1,
      level: logLevels[Math.floor(Math.random() * logLevels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      source: logSources[Math.floor(Math.random() * logSources.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 1 : null,
      ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
      details: `Additional details for log entry ${i + 1}`
    }));
  };

  // Fetch logs data
  const fetchLogs = async () => {
    try {
      setLoading(true);
      // In a real application, this would fetch from an API
      // For now, we'll generate mock data
      const mockLogs = generateSystemLogs();
      setLogs(mockLogs);
      setError('');
    } catch (err) {
      console.error('Logs fetch error:', err);
      setError('Failed to load logs: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter logs
  useEffect(() => {
    let filtered = logs.filter(log => {
      const matchesSearch = 
        log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
      const matchesSource = selectedSource === 'ALL' || log.source === selectedSource;

      let matchesDateRange = true;
      if (dateFrom || dateTo) {
        const logDate = new Date(log.timestamp);
        if (dateFrom) {
          matchesDateRange = matchesDateRange && logDate >= new Date(dateFrom);
        }
        if (dateTo) {
          matchesDateRange = matchesDateRange && logDate <= new Date(dateTo);
        }
      }

      return matchesSearch && matchesLevel && matchesSource && matchesDateRange;
    });

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, searchTerm, selectedLevel, selectedSource, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const getCurrentPageLogs = () => {
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    return filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  };

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getLevelColor = (level) => {
    const colors = {
      INFO: 'bg-blue-100 text-blue-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
      SUCCESS: 'bg-green-100 text-green-800',
      DEBUG: 'bg-purple-100 text-purple-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getLevelIcon = (level) => {
    const icons = {
      INFO: <FaInfoCircle />,
      WARNING: <FaExclamationTriangle />,
      ERROR: <FaTimesCircle />,
      SUCCESS: <FaCheckCircle />,
      DEBUG: <FaCode />,
    };
    return icons[level] || <FaInfoCircle />;
  };

  const getSourceIcon = (source) => {
    const icons = {
      System: <FaServer />,
      Database: <FaDatabase />,
      API: <FaCode />,
      Authentication: <FaShieldAlt />,
      Security: <FaShieldAlt />,
      Backup: <FaDatabase />,
    };
    return icons[source] || <FaServer />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Source', 'Message', 'IP Address', 'User ID', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.source,
        `"${log.message}"`,
        log.ip_address,
        log.user_id || '',
        `"${log.details}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-8`}>
          <div className="animate-pulse">
            <div className={`h-8 ${styles.loadingShimmer} rounded mb-6`}></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`h-12 ${styles.loadingShimmer} rounded`}></div>
              ))}
            </div>
          </div>
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading system logs...</p>
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
                <FaCode className="mr-3 text-green-600" />
                System Logs
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                Monitor and analyze system activity and events
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
                onClick={exportLogs}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <FaDownload className="mr-2" />
                Export CSV
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        {logLevels.map(level => (
          <div key={level} className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${styles.secondaryText} text-sm font-medium`}>{level}</p>
                <p className="text-2xl font-bold text-gray-700">
                  {logs.filter(log => log.level === level).length}
                </p>
              </div>
              <div className={`p-3 rounded-full ${getLevelColor(level)}`}>
                {getLevelIcon(level)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Search Logs</label>
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${styles.secondaryText}`} />
              <input
                type="text"
                placeholder="Search messages, sources, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            >
              <option value="ALL">All Levels</option>
              {logLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Source</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            >
              <option value="ALL">All Sources</option>
              {logSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>From Date</label>
            <input
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>To Date</label>
            <input
              type="datetime-local"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <h2 className={`text-xl font-semibold ${styles.primaryText}`}>
            System Logs ({filteredLogs.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {getCurrentPageLogs().length === 0 ? (
            <div className={`p-8 text-center ${styles.secondaryText}`}>
              <FaCode className="mx-auto text-4xl mb-4 text-gray-300" />
              <p>No logs found matching the current filters.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Timestamp
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Level
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Source
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    Message
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    IP Address
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                    User ID
                  </th>
                </tr>
              </thead>
              <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                {getCurrentPageLogs().map((log) => (
                  <tr key={log.id} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-gray-400" />
                        <span className={`text-sm ${styles.primaryText}`}>
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                        {getLevelIcon(log.level)}
                        <span className="ml-1">{log.level}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getSourceIcon(log.source)}
                        <span className={`ml-2 text-sm ${styles.primaryText}`}>
                          {log.source}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${styles.primaryText}`}>
                        {log.message}
                      </div>
                      {log.details && (
                        <div className={`text-xs ${styles.secondaryText} mt-1`}>
                          {log.details}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${styles.secondaryText}`}>
                        {log.ip_address}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${styles.secondaryText}`}>
                        {log.user_id || 'System'}
                      </span>
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
                Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
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
                      className={`px-3 py-1 border rounded-md transition ${
                        currentPage === page 
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

export default SystemLogs;