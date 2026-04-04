import React, { useState, useEffect, useCallback } from 'react';
import {
  FaDatabase, FaTable, FaDownload, FaSyncAlt, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaServer, FaChartLine, FaTools, FaCog,
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const DatabaseManagement = () => {
  const styles = useThemeStyles();
  const [tables, setTables] = useState([]);
  const [summary, setSummary] = useState({ totalTables: 0, totalRecords: 0, connectionStatus: 'Checking...' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/activity-logs/db-stats`, { headers });
      if (!res.ok) throw new Error('Failed to fetch database stats');
      const data = await res.json();
      setTables(data.data?.tables || []);
      setSummary({
        totalTables: data.data?.totalTables || 0,
        totalRecords: data.data?.totalRecords || 0,
        connectionStatus: data.data?.connectionStatus || 'Unknown',
      });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleBackup = async () => {
    setBackupInProgress(true);
    await new Promise(r => setTimeout(r, 2500));
    setLastBackup(new Date().toISOString());
    setBackupInProgress(false);
    alert('Backup simulation complete. Integrate with mysqldump for real backups.');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6 px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
              <FaDatabase className="mr-3 text-purple-600" /> Database Management
            </h1>
            <p className={`${styles.secondaryText} mt-1`}>Live record counts and table stats from the air_ambulance database</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={handleBackup} disabled={backupInProgress} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50">
              <FaDownload className={`mr-2 ${backupInProgress ? 'animate-bounce' : ''}`} />
              {backupInProgress ? 'Creating...' : 'Create Backup'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2" />{error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tables', value: summary.totalTables, color: 'from-blue-500 to-blue-600', icon: <FaTable /> },
          { label: 'Total Records', value: summary.totalRecords.toLocaleString(), color: 'from-green-500 to-green-600', icon: <FaChartLine /> },
          { label: 'Connection', value: summary.connectionStatus, color: summary.connectionStatus === 'Active' ? 'from-teal-500 to-teal-600' : 'from-red-500 to-red-600', icon: <FaServer /> },
          { label: 'Last Backup', value: lastBackup ? formatDate(lastBackup) : 'Not yet', color: 'from-purple-500 to-purple-600', icon: <FaClock /> },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-lg p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs font-medium">{s.label}</p>
                <p className="text-xl font-bold truncate">{s.value}</p>
              </div>
              <div className="bg-white/20 rounded-full p-2 text-lg">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor} flex items-center`}>
          <FaTable className="mr-2 text-blue-600" />
          <h2 className={`text-lg font-semibold ${styles.primaryText}`}>Database Tables</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className={styles.secondaryText}>Loading database stats...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className={`p-8 text-center ${styles.secondaryText}`}>
              <FaDatabase className="mx-auto text-4xl mb-3 text-gray-300" />
              <p>No table data available.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={styles.tableHeader}>
                <tr>
                  {['Table Name', 'Records', 'Last Activity', 'Status'].map(h => (
                    <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                {tables.map(table => (
                  <tr key={table.name} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaTable className="mr-3 text-gray-400" />
                        <span className={`text-sm font-medium ${styles.primaryText}`}>{table.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${styles.primaryText}`}>{table.records.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-gray-400 text-xs" />
                        <span className={`text-sm ${styles.secondaryText}`}>{formatDate(table.lastActivity)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${table.records > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {table.records > 0 ? 'Active' : 'Empty'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mt-6`}>
        <h2 className={`text-lg font-semibold ${styles.primaryText} mb-4 flex items-center`}>
          <FaTools className="mr-2 text-indigo-600" /> Database Operations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Schedule Backup', sub: 'Automated backups', color: 'green', icon: <FaDownload /> },
            { label: 'Monitor Performance', sub: 'Query analytics', color: 'purple', icon: <FaChartLine /> },
            { label: 'Connection Pool', sub: 'Active connections', color: 'blue', icon: <FaServer /> },
            { label: 'DB Settings', sub: 'Configuration', color: 'orange', icon: <FaCog /> },
          ].map(a => (
            <button key={a.label} className={`flex items-center p-4 bg-${a.color}-50 hover:bg-${a.color}-100 rounded-lg transition`}>
              <span className={`text-${a.color}-600 text-2xl mr-3`}>{a.icon}</span>
              <div className="text-left">
                <p className={`font-semibold text-${a.color}-800 text-sm`}>{a.label}</p>
                <p className={`text-xs text-${a.color}-600`}>{a.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagement;
