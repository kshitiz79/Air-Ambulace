import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import {
  FaFileAlt, FaUsers, FaHospital, FaMapMarkerAlt,
  FaAmbulance, FaDownload, FaSync, FaFilter,
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatusBadge } from '../../components/Dashboard';
import baseUrl from '../../baseUrl/baseUrl';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const CO = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
const TABS = ['overview', 'enquiries', 'users', 'hospitals', 'ambulances'];
const TAB_LABELS = { overview: 'Overview', enquiries: 'Enquiries', users: 'Users & Roles', hospitals: 'Hospitals', ambulances: 'Ambulances' };
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'COMPLETED', 'FORWARDED', 'IN_PROGRESS'];

const SummaryCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-gray-800">{value}</p>
    </div>
  </div>
);

const AdminReportsPage = () => {
  const styles = useThemeStyles();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [enquiries, setEnquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [ambulances, setAmbulances] = useState([]);

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const fetchAll = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      const [r1, r2, r3, r4, r5] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, { headers: h }),
        fetch(`${baseUrl}/api/users`, { headers: h }),
        fetch(`${baseUrl}/api/hospitals`, { headers: h }),
        fetch(`${baseUrl}/api/districts`, { headers: h }),
        fetch(`${baseUrl}/api/ambulances`, { headers: h }),
      ]);
      const [d1, d2, d3, d4, d5] = await Promise.all([
        r1.ok ? r1.json() : { data: [] }, r2.ok ? r2.json() : { data: [] },
        r3.ok ? r3.json() : { data: [] }, r4.ok ? r4.json() : { data: [] },
        r5.ok ? r5.json() : { data: [] },
      ]);
      setEnquiries(d1.data || []);
      setUsers(d2.data || []);
      setHospitals(d3.data || []);
      setDistricts(d4.data || []);
      setAmbulances(d5.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // filtered by date range
  const filteredEnq = enquiries.filter(e => {
    let ok = true;
    if (dateRange.from) ok = ok && new Date(e.created_at) >= new Date(dateRange.from);
    if (dateRange.to)   ok = ok && new Date(e.created_at) <= new Date(dateRange.to);
    return ok;
  });

  const hospMap = hospitals.reduce((a, h) => { a[h.hospital_id] = h.name || h.hospital_name; return a; }, {});
  const distMap  = districts.reduce((a, d) => { a[d.district_id] = d.district_name; return a; }, {});

  // monthly trend last 6 months
  const now = new Date();
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const m = filteredEnq.filter(e => {
      const ed = new Date(e.created_at);
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
    });
    return { label, total: m.length, approved: m.filter(e => e.status === 'APPROVED').length, rejected: m.filter(e => e.status === 'REJECTED').length };
  });

  const statusCounts = STATUSES.map(s => filteredEnq.filter(e => e.status === s).length);
  const roleMap = users.reduce((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a; }, {});

  const hospEnqCount = filteredEnq.reduce((a, e) => {
    const n = hospMap[e.hospital_id] || 'Unknown'; a[n] = (a[n] || 0) + 1; return a;
  }, {});
  const topHospitals = Object.entries(hospEnqCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const ambUsage = filteredEnq.filter(e => e.ambulance_registration_number).reduce((a, e) => {
    a[e.ambulance_registration_number] = (a[e.ambulance_registration_number] || 0) + 1; return a;
  }, {});
  const topAmb = Object.entries(ambUsage).sort((a, b) => b[1] - a[1]);
  const enqWithAmb = filteredEnq.filter(e => e.ambulance_registration_number).length;

  // chart configs
  const monthlyChart = {
    labels: monthly.map(m => m.label),
    datasets: [
      { label: 'Total',    data: monthly.map(m => m.total),    borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true },
      { label: 'Approved', data: monthly.map(m => m.approved), borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4 },
      { label: 'Rejected', data: monthly.map(m => m.rejected), borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)',  tension: 0.4 },
    ],
  };
  const statusChart = {
    labels: STATUSES,
    datasets: [{ data: statusCounts, backgroundColor: ['#FEF3C7','#D1FAE5','#FEE2E2','#E0E7FF','#F3F4F6','#DBEAFE','#EDE9FE'], borderColor: ['#F59E0B','#10B981','#EF4444','#8B5CF6','#6B7280','#3B82F6','#7C3AED'], borderWidth: 2 }],
  };
  const roleChart = {
    labels: Object.keys(roleMap),
    datasets: [{ label: 'Users', data: Object.values(roleMap), backgroundColor: ['rgba(59,130,246,0.8)','rgba(16,185,129,0.8)','rgba(245,158,11,0.8)','rgba(239,68,68,0.8)','rgba(139,92,246,0.8)','rgba(236,72,153,0.8)','rgba(20,184,166,0.8)','rgba(249,115,22,0.8)'], borderWidth: 1 }],
  };
  const hospChart = {
    labels: topHospitals.map(([n]) => n.length > 18 ? n.slice(0, 18) + '…' : n),
    datasets: [{ label: 'Enquiries', data: topHospitals.map(([, c]) => c), backgroundColor: 'rgba(99,102,241,0.8)', borderColor: '#6366F1', borderWidth: 1 }],
  };

  const handleExport = () => {
    const rows = [
      ['Enquiry Code', 'Patient Name', 'Status', 'Hospital', 'District', 'Ambulance', 'Date'],
      ...filteredEnq.map(e => [
        e.enquiry_code || `ENQ${e.enquiry_id}`, e.patient_name, e.status,
        hospMap[e.hospital_id] || 'N/A', distMap[e.district_id] || 'N/A',
        e.ambulance_registration_number || '—', fmt(e.created_at),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `admin-report-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className={`h-24 ${styles.loadingShimmer} rounded-xl`} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${styles.pageBackground}`}>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaFileAlt className="text-blue-600 text-lg" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${styles.primaryText}`}>Admin Reports</h1>
            <p className={`text-sm ${styles.secondaryText}`}>Comprehensive analytics across all system data</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <FaFilter className="text-gray-400 text-xs" />
            <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} className="text-sm border-none outline-none bg-transparent" />
            <span className="text-gray-300 mx-1">—</span>
            <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} className="text-sm border-none outline-none bg-transparent" />
          </div>
          <button onClick={() => { setRefreshing(true); fetchAll(); }} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-semibold disabled:opacity-60">
            <FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-semibold">
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard icon={<FaFileAlt className="text-blue-600" />}        label="Total Enquiries" value={filteredEnq.length} color="bg-blue-100" />
        <SummaryCard icon={<FaUsers className="text-green-600" />}         label="Total Users"     value={users.length}       color="bg-green-100" />
        <SummaryCard icon={<FaHospital className="text-purple-600" />}     label="Hospitals"       value={hospitals.length}   color="bg-purple-100" />
        <SummaryCard icon={<FaMapMarkerAlt className="text-orange-600" />} label="Districts"       value={districts.length}   color="bg-orange-100" />
        <SummaryCard icon={<FaAmbulance className="text-red-600" />}       label="Ambulances"      value={ambulances.length}  color="bg-red-100" />
      </div>

      {/* Tabs */}
      <div className={`${styles.cardBackground} rounded-xl shadow-sm border border-gray-100`}>
        <div className={`border-b ${styles.borderColor} px-6 pt-4 flex gap-1 overflow-x-auto`}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab ? 'border-blue-500 text-blue-600' : `border-transparent ${styles.secondaryText} hover:text-gray-700`
              }`}>
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Monthly Enquiry Trend</p>
                  <div className="h-56"><Line data={monthlyChart} options={{ ...CO, scales: { y: { beginAtZero: true } } }} /></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Status Distribution</p>
                  <div className="h-56"><Doughnut data={statusChart} options={CO} /></div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Users by Role</p>
                  <div className="h-56"><Bar data={roleChart} options={{ ...CO, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Top Hospitals by Enquiries</p>
                  <div className="h-56"><Bar data={hospChart} options={{ ...CO, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } }, indexAxis: 'y' }} /></div>
                </div>
              </div>
            </div>
          )}

          {/* ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {STATUSES.map((s, i) => (
                  <div key={s} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <p className="text-xl font-black text-gray-800">{statusCounts[i]}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">{s.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full">
                  <thead className={styles.tableHeader}>
                    <tr>
                      {['Code', 'Patient', 'Status', 'Hospital', 'District', 'Ambulance', 'Date'].map(h => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${styles.secondaryText} whitespace-nowrap`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                    {filteredEnq.slice(0, 50).map(e => (
                      <tr key={e.enquiry_id} className={styles.tableRow}>
                        <td className={`px-4 py-3 text-xs font-mono font-bold ${styles.primaryText} whitespace-nowrap`}>{e.enquiry_code || `ENQ${e.enquiry_id}`}</td>
                        <td className={`px-4 py-3 text-sm ${styles.primaryText} whitespace-nowrap`}>{e.patient_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={e.status} label={e.status} /></td>
                        <td className={`px-4 py-3 text-sm ${styles.secondaryText} whitespace-nowrap`}>{hospMap[e.hospital_id] || 'N/A'}</td>
                        <td className={`px-4 py-3 text-sm ${styles.secondaryText} whitespace-nowrap`}>{distMap[e.district_id] || 'N/A'}</td>
                        <td className="px-4 py-3 text-xs font-mono text-orange-600 whitespace-nowrap">{e.ambulance_registration_number || '—'}</td>
                        <td className={`px-4 py-3 text-sm ${styles.secondaryText} whitespace-nowrap`}>{fmt(e.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEnq.length > 50 && (
                  <p className="text-center text-xs text-gray-400 py-3">Showing 50 of {filteredEnq.length} — use Export CSV for full data</p>
                )}
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="h-64"><Bar data={roleChart} options={{ ...CO, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full">
                  <thead className={styles.tableHeader}>
                    <tr>
                      {['Name', 'Email', 'Role', 'Status', 'Created'].map(h => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${styles.secondaryText} whitespace-nowrap`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                    {users.map(u => (
                      <tr key={u.user_id} className={styles.tableRow}>
                        <td className={`px-4 py-3 text-sm font-semibold ${styles.primaryText} whitespace-nowrap`}>{u.full_name}</td>
                        <td className={`px-4 py-3 text-sm ${styles.secondaryText}`}>{u.email || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{u.role}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.status}</span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${styles.secondaryText} whitespace-nowrap`}>{fmt(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HOSPITALS */}
          {activeTab === 'hospitals' && (
            <div className="space-y-4">
              <div className="h-64"><Bar data={hospChart} options={{ ...CO, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } }, indexAxis: 'y' }} /></div>
              <div className="overflow-x-auto">
                <table className="min-w-[500px] w-full">
                  <thead className={styles.tableHeader}>
                    <tr>
                      {['Hospital', 'Enquiries', 'Share %'].map(h => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${styles.secondaryText} whitespace-nowrap`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                    {topHospitals.map(([name, count]) => (
                      <tr key={name} className={styles.tableRow}>
                        <td className={`px-4 py-3 text-sm font-semibold ${styles.primaryText}`}>{name}</td>
                        <td className="px-4 py-3 text-sm font-bold text-indigo-600">{count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${filteredEnq.length ? Math.round((count / filteredEnq.length) * 100) : 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{filteredEnq.length ? Math.round((count / filteredEnq.length) * 100) : 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AMBULANCES */}
          {activeTab === 'ambulances' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-center">
                  <p className="text-2xl font-black text-orange-700">{ambulances.length}</p>
                  <p className="text-xs font-semibold text-orange-500 uppercase mt-1">Registered Ambulances</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                  <p className="text-2xl font-black text-blue-700">{topAmb.length}</p>
                  <p className="text-xs font-semibold text-blue-500 uppercase mt-1">Ambulances Used in Cases</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                  <p className="text-2xl font-black text-green-700">{enqWithAmb}</p>
                  <p className="text-xs font-semibold text-green-500 uppercase mt-1">Enquiries with Ambulance</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[500px] w-full">
                  <thead className={styles.tableHeader}>
                    <tr>
                      {['Rank', 'Registration No.', 'Cases Assigned', 'Usage %'].map(h => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${styles.secondaryText} whitespace-nowrap`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                    {topAmb.map(([reg, count], i) => (
                      <tr key={reg} className={styles.tableRow}>
                        <td className={`px-4 py-3 text-sm font-bold ${i < 3 ? 'text-orange-500' : styles.secondaryText}`}>#{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-mono font-bold text-orange-700">{reg}</td>
                        <td className="px-4 py-3 text-sm font-bold text-indigo-600">{count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${filteredEnq.length ? Math.round((count / filteredEnq.length) * 100) : 0}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{filteredEnq.length ? Math.round((count / filteredEnq.length) * 100) : 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
