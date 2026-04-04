import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import {
  FaCode, FaSearch, FaDownload, FaSyncAlt, FaExclamationTriangle,
  FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaServer,
  FaDatabase, FaShieldAlt, FaUser, FaFilter,
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  VIEW: 'bg-gray-100 text-gray-700',
  LOGIN: 'bg-teal-100 text-teal-800',
  LOGIN_FAILED: 'bg-red-100 text-red-800',
  LOGOUT: 'bg-gray-100 text-gray-700',
  EXPORT: 'bg-purple-100 text-purple-800',
  UPLOAD: 'bg-yellow-100 text-yellow-800',
};

const STATUS_COLORS = {
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
};

const ACTIONS = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'EXPORT', 'UPLOAD'];
const STATUSES = ['ALL', 'SUCCESS', 'FAILED', 'WARNING'];
const ROLES = ['ALL', 'ADMIN', 'CMHO', 'SDM', 'COLLECTOR', 'DME', 'SERVICE_PROVIDER', 'HOSPITAL', 'SUPPORT'];

const SystemLogs = () => {
  const styles = useThemeStyles();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, logins: 0, loginFailed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [action, setAction] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [role, setRole] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 50;

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchLogs = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (search) params.set('search', search);
      if (action !== 'ALL') params.set('action', action);
      if (status !== 'ALL') params.set('status', status);
      if (role !== 'ALL') params.set('role', role);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`${baseUrl}/api/activity-logs?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, action, status, role, dateFrom, dateTo]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/api/activity-logs/stats`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      const { actionStats = [], statusStats = [] } = data.data || {};
      const get = (arr, key, field) => parseInt(arr.find(x => x[field] === key)?.count || 0);
      setStats({
        total: statusStats.reduce((s, x) => s + parseInt(x.count), 0),
        success: get(statusStats, 'SUCCESS', 'status'),
        failed: get(statusStats, 'FAILED', 'status'),
        logins: get(actionStats, 'LOGIN', 'action'),
        loginFailed: get(actionStats, 'LOGIN_FAILED', 'action'),
      });
    } catch {}
  }, []);

  useEffect(() => { fetchLogs(1); fetchStats(); }, []);

  const handleSearch = () => { setPage(1); fetchLogs(1); };
  const handleRefresh = () => { setRefreshing(true); fetchLogs(page); fetchStats(); };

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const exportCSV = () => {
    const csv = [
      ['Timestamp', 'Action', 'Resource', 'Resource ID', 'Username', 'Full Name', 'Role', 'Status', 'IP Address', 'Description'].join(','),
      ...logs.map(l => [l.created_at, l.action, l.resource, l.resource_id || '', l.username || '', l.full_name || '', l.role || '', l.status, l.ip_address || '', `"${(l.description || '').replace(/"/g, "'")}"`].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`max-w-6xl p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6 px-6 py-4`}>
        <div className={clsx('flex', 'justify-between', 'items-center')}>
          <div>
            <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
              <FaCode className={clsx('mr-3', 'text-green-600')} /> System Activity Logs
            </h1>
            <p className={`${styles.secondaryText} mt-1`}>Real-time tracking of all user actions across every dashboard</p>
          </div>
          <div className={clsx('flex', 'space-x-3')}>
            <button onClick={handleRefresh} disabled={refreshing} className={clsx('flex', 'items-center', 'px-4', 'py-2', 'bg-blue-600', 'text-white', 'rounded-lg', 'hover:bg-blue-700', 'transition', 'disabled:opacity-50')}>
              <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={exportCSV} className={clsx('flex', 'items-center', 'px-4', 'py-2', 'bg-green-600', 'text-white', 'rounded-lg', 'hover:bg-green-700', 'transition')}>
              <FaDownload className="mr-2" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {error && <div className={clsx('mb-4', 'p-4', 'bg-red-100', 'text-red-700', 'rounded-lg', 'flex', 'items-center')}><FaExclamationTriangle className="mr-2" />{error}</div>}

      {/* Stats */}
      <div className={clsx('grid', 'grid-cols-2', 'md:grid-cols-5', 'gap-4', 'mb-6')}>
        {[
          { label: 'Total Logs', value: stats.total, color: 'from-blue-500 to-blue-600', icon: <FaDatabase /> },
          { label: 'Successful', value: stats.success, color: 'from-green-500 to-green-600', icon: <FaCheckCircle /> },
          { label: 'Failed', value: stats.failed, color: 'from-red-500 to-red-600', icon: <FaTimesCircle /> },
          { label: 'Logins', value: stats.logins, color: 'from-teal-500 to-teal-600', icon: <FaUser /> },
          { label: 'Failed Logins', value: stats.loginFailed, color: 'from-orange-500 to-orange-600', icon: <FaShieldAlt /> },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-lg p-4 text-white`}>
            <div className={clsx('flex', 'items-center', 'justify-between')}>
              <div><p className={clsx('text-white/80', 'text-xs', 'font-medium')}>{s.label}</p><p className={clsx('text-2xl', 'font-bold')}>{s.value}</p></div>
              <div className={clsx('bg-white/20', 'rounded-full', 'p-2', 'text-lg')}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-4 mb-6`}>
        <div className={clsx('grid', 'grid-cols-1', 'md:grid-cols-7', 'gap-3')}>
          <div className={clsx('md:col-span-2', 'relative')}>
            <FaSearch className={clsx('absolute', 'left-3', 'top-1/2', '-translate-y-1/2', 'text-gray-400')} />
            <input type="text" placeholder="Search username, IP, description..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className={`w-full pl-9 pr-3 py-2 border rounded-md text-sm ${styles.inputBackground}`} />
          </div>
          <select value={action} onChange={e => setAction(e.target.value)} className={`p-2 border rounded-md text-sm ${styles.inputBackground}`}>
            {ACTIONS.map(a => <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className={`p-2 border rounded-md text-sm ${styles.inputBackground}`}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
          </select>
          <select value={role} onChange={e => setRole(e.target.value)} className={`p-2 border rounded-md text-sm ${styles.inputBackground}`}>
            {ROLES.map(r => <option key={r} value={r}>{r === 'ALL' ? 'All Roles' : r}</option>)}
          </select>
          <input type="datetime-local" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`p-2 border rounded-md text-sm ${styles.inputBackground}`} />
          <button onClick={handleSearch} className={clsx('flex', 'items-center', 'justify-center', 'px-4', 'py-2', 'bg-blue-600', 'text-white', 'rounded-md', 'text-sm', 'hover:bg-blue-700', 'transition')}>
            <FaFilter className="mr-1" /> Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor} flex items-center justify-between`}>
          <h2 className={`text-lg font-semibold ${styles.primaryText}`}>Activity Logs ({total.toLocaleString()})</h2>
          <span className={`text-sm ${styles.secondaryText}`}>Page {page} of {totalPages}</span>
        </div>

        <div className={clsx('overflow-x-auto', 'w-full')}>
          {loading ? (
            <div className={clsx('p-8', 'text-center')}>
              <div className={clsx('animate-spin', 'w-8', 'h-8', 'border-4', 'border-blue-600', 'border-t-transparent', 'rounded-full', 'mx-auto', 'mb-3')}></div>
              <p className={styles.secondaryText}>Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className={`p-8 text-center ${styles.secondaryText}`}>
              <FaCode className={clsx('mx-auto', 'text-4xl', 'mb-3', 'text-gray-300')} />
              <p>No logs found matching the current filters.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={styles.tableHeader}>
                <tr>
                  {['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Status', 'IP Address', 'Description'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                {logs.map(log => (
                  <tr key={log.log_id} className={styles.tableRow}>
                    <td className={clsx('px-4', 'py-3', 'whitespace-nowrap')}>
                      <div className={clsx('flex', 'items-center', 'text-xs')}>
                        <FaClock className={clsx('mr-1', 'text-gray-400')} />
                        <span className={styles.secondaryText}>{formatDate(log.created_at)}</span>
                      </div>
                    </td>
                    <td className={clsx('px-4', 'py-3', 'whitespace-nowrap')}>
                      <div className={clsx('flex', 'items-center')}>
                        <div className={clsx('w-7', 'h-7', 'rounded-full', 'bg-blue-100', 'flex', 'items-center', 'justify-center', 'mr-2')}>
                          <FaUser className={clsx('text-blue-600', 'text-xs')} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${styles.primaryText}`}>{log.username || 'System'}</p>
                          {log.full_name && <p className={`text-xs ${styles.secondaryText}`}>{log.full_name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className={clsx('px-4', 'py-3', 'whitespace-nowrap')}>
                      <span className={clsx('text-xs', 'font-medium', 'text-gray-600', 'bg-gray-100', 'px-2', 'py-1', 'rounded')}>{log.role || '—'}</span>
                    </td>
                    <td className={clsx('px-4', 'py-3', 'whitespace-nowrap')}>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action || log.event_type}
                      </span>
                    </td>
                    <td className={clsx('px-4', 'py-3', 'whitespace-nowrap')}>
                      <div>
                        <span className={`text-sm ${styles.primaryText}`}>{log.resource || '—'}</span>
                        {log.resource_id && <span className={`text-xs ${styles.secondaryText} ml-1`}>#{log.resource_id}</span>}
                      </div>
                    </td>
                    <td className={clsx('px-4', 'py-3', 'whitespace-nowrap')}>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[log.status] || 'bg-gray-100 text-gray-700'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className={clsx('px-4', 'py-3', 'whitespace-nowrap')}>
                      <span className={`text-xs font-mono ${styles.secondaryText}`}>{log.ip_address || '—'}</span>
                    </td>
                    <td className={clsx('px-4', 'py-3', 'max-w-xs')}>
                      <p className={`text-xs ${styles.secondaryText} truncate`} title={log.description}>{log.description || '—'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t ${styles.borderColor} flex items-center justify-between`}>
            <span className={`text-sm ${styles.secondaryText}`}>Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}</span>
            <div className={clsx('flex', 'space-x-2')}>
              <button onClick={() => { const p = Math.max(page - 1, 1); setPage(p); fetchLogs(p); }} disabled={page === 1} className={clsx('px-3', 'py-1', 'border', 'rounded-md', 'text-sm', 'disabled:opacity-50', 'hover:bg-gray-50', 'transition')}>Prev</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => { setPage(p); fetchLogs(p); }} className={`px-3 py-1 border rounded-md text-sm transition ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}>{p}</button>
                );
              })}
              <button onClick={() => { const p = Math.min(page + 1, totalPages); setPage(p); fetchLogs(p); }} disabled={page === totalPages} className={clsx('px-3', 'py-1', 'border', 'rounded-md', 'text-sm', 'disabled:opacity-50', 'hover:bg-gray-50', 'transition')}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
