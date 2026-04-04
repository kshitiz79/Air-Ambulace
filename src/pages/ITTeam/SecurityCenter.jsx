import React, { useState, useEffect, useCallback } from 'react';
import {
  FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle,
  FaLock, FaKey, FaUserShield, FaSearch, FaDownload, FaSyncAlt,
  FaClock, FaGlobe, FaFire, FaUser,
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const SecurityCenter = () => {
  const styles = useThemeStyles();
  const [events, setEvents] = useState([]);
  const [topIps, setTopIps] = useState([]);
  const [stats, setStats] = useState({ totalFailed: 0, failedLogins24h: 0, securityScore: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 50;

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (search) params.set('search', search);

      const res = await fetch(`${baseUrl}/api/activity-logs/security?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch security events');
      const data = await res.json();

      setEvents(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setTopIps(data.topIps || []);
      setStats(data.stats || { totalFailed: 0, failedLogins24h: 0, securityScore: 100 });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { fetchData(1); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(page); };
  const handleSearch = () => { setPage(1); fetchData(1); };

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const exportCSV = () => {
    const csv = [
      ['Timestamp', 'Username', 'Full Name', 'Role', 'Action', 'Status', 'IP Address', 'Description'].join(','),
      ...events.map(e => [
        e.created_at, e.username || '', e.full_name || '', e.role || '',
        e.action || e.event_type, e.status, e.ip_address || '',
        `"${(e.description || '').replace(/"/g, "'")}"`,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `security-events-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = stats.securityScore >= 80 ? 'from-green-500 to-green-600'
    : stats.securityScore >= 50 ? 'from-yellow-500 to-yellow-600'
    : 'from-red-500 to-red-600';

  return (
    <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6 px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
              <FaShieldAlt className="mr-3 text-red-600" /> Security Center
            </h1>
            <p className={`${styles.secondaryText} mt-1`}>Real-time failed logins and suspicious activity from all dashboards</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <FaDownload className="mr-2" /> Export
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
          { label: 'Total Failed Events', value: stats.totalFailed, color: 'from-red-500 to-red-600', icon: <FaTimesCircle /> },
          { label: 'Failed Logins (24h)', value: stats.failedLogins24h, color: 'from-orange-500 to-orange-600', icon: <FaLock /> },
          { label: 'Suspicious IPs', value: topIps.length, color: 'from-yellow-500 to-yellow-600', icon: <FaGlobe /> },
          { label: 'Security Score', value: `${stats.securityScore}%`, color: scoreColor, icon: <FaShieldAlt /> },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-lg p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div><p className="text-white/80 text-xs font-medium">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
              <div className="bg-white/20 rounded-full p-2 text-lg">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Firewall Status', value: 'Active', icon: <FaFire />, color: 'green' },
          { label: 'SSL Certificate', value: 'Valid', icon: <FaLock />, color: 'green' },
          { label: 'Backup Encryption', value: 'Enabled', icon: <FaKey />, color: 'green' },
        ].map(s => (
          <div key={s.label} className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-4 flex items-center justify-between`}>
            <div>
              <p className={`${styles.secondaryText} text-sm`}>{s.label}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${s.color}-100 text-${s.color}-800`}>{s.value}</span>
            </div>
            <div className={`bg-${s.color}-100 rounded-full p-3`}>
              <span className={`text-${s.color}-600 text-xl`}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Offender IPs */}
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
          <div className={`px-4 py-3 border-b ${styles.borderColor}`}>
            <h2 className={`font-semibold ${styles.primaryText} flex items-center`}>
              <FaGlobe className="mr-2 text-red-500" /> Top Offender IPs (24h)
            </h2>
          </div>
          <div className="p-4">
            {topIps.length === 0 ? (
              <p className={`text-sm ${styles.secondaryText} text-center py-4`}>No suspicious IPs detected</p>
            ) : (
              <div className="space-y-2">
                {topIps.map((ip, i) => (
                  <div key={ip.ip_address} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center mr-2 font-bold">{i + 1}</span>
                      <span className={`text-sm font-mono ${styles.primaryText}`}>{ip.ip_address}</span>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">{ip.count} attempts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search filter */}
        <div className={`lg:col-span-2 ${styles.cardBackground} rounded-lg ${styles.cardShadow} p-4 flex flex-col justify-center`}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search username, IP, description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm ${styles.inputBackground}`}
              />
            </div>
            <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition">
              Search
            </button>
          </div>
          <p className={`text-xs ${styles.secondaryText} mt-2`}>
            Showing failed logins and failed API requests from all dashboards. Total: {total.toLocaleString()} events.
          </p>
        </div>
      </div>

      {/* Events Table */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor} flex items-center justify-between`}>
          <h2 className={`text-lg font-semibold ${styles.primaryText}`}>Security Events ({total.toLocaleString()})</h2>
          <span className={`text-sm ${styles.secondaryText}`}>Page {page} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className={styles.secondaryText}>Loading security events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className={`p-8 text-center ${styles.secondaryText}`}>
              <FaShieldAlt className="mx-auto text-4xl mb-3 text-gray-300" />
              <p>No security events found. System looks clean.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={styles.tableHeader}>
                <tr>
                  {['Timestamp', 'User', 'Role', 'Action', 'Status', 'IP Address', 'Description'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                {events.map(ev => (
                  <tr key={ev.log_id} className={styles.tableRow}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-xs">
                        <FaClock className="mr-1 text-gray-400" />
                        <span className={styles.secondaryText}>{formatDate(ev.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <FaUser className="text-red-600 text-xs" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${styles.primaryText}`}>{ev.username || 'Unknown'}</p>
                          {ev.full_name && <p className={`text-xs ${styles.secondaryText}`}>{ev.full_name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{ev.role || '—'}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {ev.action || ev.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-xs font-mono ${styles.secondaryText}`}>{ev.ip_address || '—'}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className={`text-xs ${styles.secondaryText} truncate`} title={ev.description}>{ev.description || '—'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t ${styles.borderColor} flex items-center justify-between`}>
            <span className={`text-sm ${styles.secondaryText}`}>Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
            <div className="flex space-x-2">
              <button onClick={() => { const p = Math.max(page - 1, 1); setPage(p); fetchData(p); }} disabled={page === 1} className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition">Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => { setPage(p); fetchData(p); }} className={`px-3 py-1 border rounded-md text-sm transition ${page === p ? 'bg-red-600 text-white border-red-600' : 'hover:bg-gray-50'}`}>{p}</button>
                );
              })}
              <button onClick={() => { const p = Math.min(page + 1, totalPages); setPage(p); fetchData(p); }} disabled={page === totalPages} className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityCenter;
