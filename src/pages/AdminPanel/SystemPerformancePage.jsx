import React, { useState, useEffect, useCallback } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import {
  FaServer, FaDatabase, FaShieldAlt, FaUsers, FaSync,
  FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaClock,
  FaArrowUp, FaArrowDown,
} from 'react-icons/fa';
import { FiActivity, FiCpu, FiHardDrive, FiWifi } from 'react-icons/fi';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const CHART_OPTS = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

const MetricCard = ({ icon, label, value, sub, color, trend }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {trend !== undefined && (
      <span className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(trend)}%
      </span>
    )}
  </div>
);

const StatusDot = ({ ok }) => (
  <span className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}></span>
);

const SystemPerformancePage = () => {
  const styles = useThemeStyles();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Data buckets
  const [enquiries, setEnquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [logStats, setLogStats] = useState({ actionStats: [], statusStats: [] });
  const [dbStats, setDbStats] = useState({ tables: [], totalRecords: 0, connectionStatus: 'Unknown' });
  const [secStats, setSecStats] = useState({ totalFailed: 0, failedLogins24h: 0, securityScore: 100 });

  const fetchAll = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      const [enqRes, usersRes, logStatsRes, dbRes, secRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, { headers: h }),
        fetch(`${baseUrl}/api/users`, { headers: h }),
        fetch(`${baseUrl}/api/activity-logs/stats`, { headers: h }),
        fetch(`${baseUrl}/api/activity-logs/db-stats`, { headers: h }),
        fetch(`${baseUrl}/api/activity-logs/security`, { headers: h }),
      ]);
      const [enqData, usersData, logData, dbData, secData] = await Promise.all([
        enqRes.ok ? enqRes.json() : { data: [] },
        usersRes.ok ? usersRes.json() : { data: [] },
        logStatsRes.ok ? logStatsRes.json() : { data: { actionStats: [], statusStats: [] } },
        dbRes.ok ? dbRes.json() : { data: { tables: [], totalRecords: 0, connectionStatus: 'Unknown' } },
        secRes.ok ? secRes.json() : { stats: { totalFailed: 0, failedLogins24h: 0, securityScore: 100 } },
      ]);
      setEnquiries(enqData.data || []);
      setUsers(usersData.data || []);
      setLogStats(logData.data || { actionStats: [], statusStats: [] });
      setDbStats(dbData.data || { tables: [], totalRecords: 0, connectionStatus: 'Unknown' });
      setSecStats(secData.stats || { totalFailed: 0, failedLogins24h: 0, securityScore: 100 });
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRefresh = () => { setRefreshing(true); fetchAll(); };

  // ── Derived metrics ───────────────────────────────────────────────────────
  const totalEnq = enquiries.length;
  const pendingEnq = enquiries.filter(e => e.status === 'PENDING').length;
  const approvedEnq = enquiries.filter(e => e.status === 'APPROVED').length;
  const completedEnq = enquiries.filter(e => e.status === 'COMPLETED').length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  // Enquiries per day last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      count: enquiries.filter(e => {
        const ed = new Date(e.created_at);
        return ed.toDateString() === d.toDateString();
      }).length,
    };
  });

  // Action breakdown from logs
  const actionLabels = logStats.actionStats.map(a => a.action);
  const actionCounts = logStats.actionStats.map(a => parseInt(a.count));

  // Status breakdown from logs
  const statusLabels = logStats.statusStats.map(s => s.status);
  const statusCounts = logStats.statusStats.map(s => parseInt(s.count));

  // Top 8 DB tables by record count
  const topTables = [...(dbStats.tables || [])].sort((a, b) => b.records - a.records).slice(0, 8);

  const enqTrendData = {
    labels: last7.map(d => d.label),
    datasets: [{
      label: 'Enquiries',
      data: last7.map(d => d.count),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const actionChartData = {
    labels: actionLabels,
    datasets: [{
      label: 'Actions',
      data: actionCounts,
      backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)', 'rgba(139,92,246,0.8)', 'rgba(236,72,153,0.8)'],
      borderWidth: 1,
    }],
  };

  const statusChartData = {
    labels: statusLabels,
    datasets: [{
      data: statusCounts,
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)', 'rgba(245,158,11,0.8)'],
      borderWidth: 2,
    }],
  };

  const dbChartData = {
    labels: topTables.map(t => t.name),
    datasets: [{
      label: 'Records',
      data: topTables.map(t => t.records),
      backgroundColor: 'rgba(99,102,241,0.8)',
      borderColor: '#6366F1',
      borderWidth: 1,
    }],
  };

  const secScore = secStats.securityScore ?? 100;
  const secColor = secScore >= 80 ? 'text-green-600' : secScore >= 50 ? 'text-yellow-500' : 'text-red-600';
  const secBg = secScore >= 80 ? 'bg-green-100' : secScore >= 50 ? 'bg-yellow-100' : 'bg-red-100';

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className={`h-24 ${styles.loadingShimmer} rounded-xl`}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${styles.pageBackground}`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FiActivity className="text-indigo-600 text-lg" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${styles.primaryText}`}>System Performance</h1>
            <p className={`text-sm ${styles.secondaryText}`}>
              Live metrics across enquiries, users, logs, and database
              {lastRefresh && <span className="ml-2 text-gray-400">· Last updated {lastRefresh.toLocaleTimeString()}</span>}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 text-sm font-semibold"
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={<FaServer className="text-indigo-600" />} label="Total Enquiries" value={totalEnq} sub={`${pendingEnq} pending`} color="bg-indigo-100" />
        <MetricCard icon={<FaUsers className="text-green-600" />} label="Active Users" value={activeUsers} sub={`${users.length} total`} color="bg-green-100" />
        <MetricCard icon={<FaDatabase className="text-purple-600" />} label="DB Records" value={dbStats.totalRecords?.toLocaleString()} sub={`${dbStats.tables?.length || 0} tables`} color="bg-purple-100" />
        <MetricCard icon={<FaShieldAlt className={secColor} />} label="Security Score" value={`${secScore}/100`} sub={`${secStats.failedLogins24h} failed logins (24h)`} color={secBg} />
      </div>

      {/* System status row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Database', ok: dbStats.connectionStatus === 'Active', icon: <FiHardDrive /> },
          { label: 'API Server', ok: true, icon: <FiCpu /> },
          { label: 'Auth Service', ok: secStats.failedLogins24h < 20, icon: <FaShieldAlt /> },
          { label: 'Network', ok: true, icon: <FiWifi /> },
        ].map(({ label, ok, icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <span className="text-gray-400 text-lg">{icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">{label}</p>
              <p className={`text-xs font-bold ${ok ? 'text-green-600' : 'text-red-500'}`}>{ok ? 'Operational' : 'Degraded'}</p>
            </div>
            <StatusDot ok={ok} />
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Enquiries — Last 7 Days</h3>
          <div className="h-52">
            <Line data={enqTrendData} options={{ ...CHART_OPTS, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Log Action Breakdown</h3>
          <div className="h-52">
            {actionLabels.length > 0
              ? <Bar data={actionChartData} options={{ ...CHART_OPTS, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
              : <p className="text-center text-gray-400 pt-16 text-sm">No log data yet</p>}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Log Status Distribution</h3>
          <div className="h-52">
            {statusLabels.length > 0
              ? <Doughnut data={statusChartData} options={CHART_OPTS} />
              : <p className="text-center text-gray-400 pt-16 text-sm">No log data yet</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Database Table Sizes</h3>
          <div className="h-52">
            {topTables.length > 0
              ? <Bar data={dbChartData} options={{ ...CHART_OPTS, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } }, indexAxis: 'y' }} />
              : <p className="text-center text-gray-400 pt-16 text-sm">No DB data</p>}
          </div>
        </div>
      </div>

      {/* Enquiry status breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Enquiry Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Pending',    count: pendingEnq,                                              color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Approved',   count: approvedEnq,                                             color: 'bg-green-100 text-green-700' },
            { label: 'Rejected',   count: enquiries.filter(e => e.status === 'REJECTED').length,   color: 'bg-red-100 text-red-700' },
            { label: 'Escalated',  count: enquiries.filter(e => e.status === 'ESCALATED').length,  color: 'bg-purple-100 text-purple-700' },
            { label: 'Forwarded',  count: enquiries.filter(e => e.status === 'FORWARDED').length,  color: 'bg-blue-100 text-blue-700' },
            { label: 'In Progress',count: enquiries.filter(e => e.status === 'IN_PROGRESS').length,color: 'bg-indigo-100 text-indigo-700' },
            { label: 'Completed',  count: completedEnq,                                            color: 'bg-emerald-100 text-emerald-700' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
              <p className="text-2xl font-black">{count}</p>
              <p className="text-xs font-semibold mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DB table details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <FaDatabase className="text-purple-500" />
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Database Tables</h3>
          <span className="ml-auto text-xs text-gray-400">{dbStats.totalRecords?.toLocaleString()} total records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Table', 'Records', 'Last Activity', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(dbStats.tables || []).map(t => (
                <tr key={t.name} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 text-sm font-mono font-semibold text-gray-700">{t.name}</td>
                  <td className="px-5 py-3 text-sm font-bold text-indigo-600">{t.records.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {t.lastActivity ? new Date(t.lastActivity).toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <FaCheckCircle /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default SystemPerformancePage;
