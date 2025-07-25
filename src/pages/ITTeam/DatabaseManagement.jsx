import React, { useState, useEffect } from 'react';
import { 
  FaDatabase, 
  FaTable, 
  FaDownload, 
  FaUpload,
  FaSyncAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaServer,

  FaChartLine,
  FaTools,

  FaPlay,



  FaStop,
  FaCog,
  FaBacon,
  FaBook
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';
import { FiHardDrive } from 'react-icons/fi';

const DatabaseManagement = () => {
  const styles = useThemeStyles();
  const [dbStats, setDbStats] = useState({
    totalTables: 12,
    totalRecords: 45678,
    databaseSize: '2.4 GB',
    lastBackup: new Date().toISOString(),
    backupStatus: 'Completed',
    connectionStatus: 'Active',
    activeConnections: 15,
    queryPerformance: 'Good'
  });
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);

  // Mock table data
  const mockTables = [
    { name: 'users', records: 1250, size: '45.2 MB', lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { name: 'enquiries', records: 8934, size: '156.8 MB', lastModified: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { name: 'hospitals', records: 245, size: '12.3 MB', lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { name: 'districts', records: 75, size: '2.1 MB', lastModified: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
    { name: 'ambulances', records: 156, size: '8.7 MB', lastModified: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
    { name: 'service_providers', records: 89, size: '5.4 MB', lastModified: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
    { name: 'notifications', records: 15678, size: '89.2 MB', lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { name: 'audit_logs', records: 25467, size: '234.5 MB', lastModified: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { name: 'system_settings', records: 45, size: '1.2 MB', lastModified: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
    { name: 'file_uploads', records: 3456, size: '567.8 MB', lastModified: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { name: 'sessions', records: 234, size: '3.4 MB', lastModified: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { name: 'backups', records: 67, size: '12.9 MB', lastModified: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() }
  ];

  // Fetch database data
  const fetchDatabaseData = async () => {
    try {
      setLoading(true);
      // In a real application, this would fetch from an API
      setTables(mockTables);
      setError('');
    } catch (err) {
      console.error('Database fetch error:', err);
      setError('Failed to load database information: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDatabaseData();
  };

  const handleBackup = async () => {
    setBackupInProgress(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setDbStats(prev => ({
        ...prev,
        lastBackup: new Date().toISOString(),
        backupStatus: 'Completed'
      }));
      alert('Database backup completed successfully!');
    } catch (err) {
      console.error('Backup error:', err);
      setError('Failed to create backup: ' + err.message);
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleOptimizeTable = async (tableName) => {
    try {
      // Simulate table optimization
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Table "${tableName}" optimized successfully!`);
    } catch (err) {
      console.error('Optimization error:', err);
      setError('Failed to optimize table: ' + err.message);
    }
  };

  const handleExportTable = (tableName) => {
    // Simulate CSV export
    const csvContent = `Table: ${tableName}\nExported at: ${new Date().toISOString()}\n\nThis is a sample export for ${tableName}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'Active': 'bg-green-100 text-green-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800',
      'Good': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading database information...</p>
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
                <FaDatabase className="mr-3 text-purple-600" />
                Database Management
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                Monitor and manage database operations and performance
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
                onClick={handleBackup}
                disabled={backupInProgress}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <FaBacon className={`mr-2 ${backupInProgress ? 'animate-spin' : ''}`} />
                {backupInProgress ? 'Creating Backup...' : 'Create Backup'}
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

      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Tables</p>
              <p className="text-3xl font-bold">{dbStats.totalTables}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaTable className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Records</p>
              <p className="text-3xl font-bold">{dbStats.totalRecords.toLocaleString()}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaChartLine className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Database Size</p>
              <p className="text-3xl font-bold">{dbStats.databaseSize}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <FiHardDrive className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Active Connections</p>
              <p className="text-3xl font-bold">{dbStats.activeConnections}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <FaServer className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Connection Status</p>
              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(dbStats.connectionStatus)}`}>
                {dbStats.connectionStatus}
              </span>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Backup Status</p>
              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(dbStats.backupStatus)}`}>
                {dbStats.backupStatus}
              </span>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <FaDatabase className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${styles.secondaryText} text-sm font-medium`}>Query Performance</p>
              <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(dbStats.queryPerformance)}`}>
                {dbStats.queryPerformance}
              </span>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FaChartLine className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tables Management */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
            <FaTable className="mr-2 text-blue-600" />
            Database Tables
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={styles.tableHeader}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                  Table Name
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                  Records
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                  Size
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                  Last Modified
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
              {tables.map((table) => (
                <tr key={table.name} className={styles.tableRow}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaTable className="mr-3 text-gray-400" />
                      <span className={`text-sm font-medium ${styles.primaryText}`}>
                        {table.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${styles.primaryText}`}>
                      {table.records.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${styles.primaryText}`}>
                      {table.size}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-gray-400" />
                      <span className={`text-sm ${styles.secondaryText}`}>
                        {formatDate(table.lastModified)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExportTable(table.name)}
                        className="text-blue-600 hover:text-blue-900 transition"
                        title="Export Table"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => handleOptimizeTable(table.name)}
                        className="text-green-600 hover:text-green-900 transition"
                        title="Optimize Table"
                      >
                        <FaTools />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-900 transition"
                        title="Table Settings"
                      >
                        <FaCog />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mt-6`}>
        <h2 className={`text-xl font-semibold ${styles.primaryText} mb-4 flex items-center`}>
          <FaTools className="mr-2 text-indigo-600" />
          Database Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
            <FaPlay className="text-blue-600 text-2xl mr-3" />
            <div>
              <p className="font-semibold text-blue-800">Run Query</p>
              <p className="text-sm text-blue-600">Execute SQL queries</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition">
            <FaBook className="text-green-600 text-2xl mr-3" />
            <div>
              <p className="font-semibold text-green-800">Schedule Backup</p>
              <p className="text-sm text-green-600">Automated backups</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
            <FaChartLine className="text-purple-600 text-2xl mr-3" />
            <div>
              <p className="font-semibold text-purple-800">Performance</p>
              <p className="text-sm text-purple-600">Monitor performance</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition">
            <FaCog className="text-orange-600 text-2xl mr-3" />
            <div>
              <p className="font-semibold text-orange-800">Settings</p>
              <p className="text-sm text-orange-600">Database configuration</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagement;