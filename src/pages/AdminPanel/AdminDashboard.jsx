import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import {
  FaUsers, FaHospital, FaMapMarkerAlt, FaFileAlt, FaChartLine, FaCalendarAlt,
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaClock,
  FaArrowUp, FaEye, FaDownload, FaFilter, FaUserShield, FaCog, FaQuestionCircle,
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  DashboardHeader, GradientStatCard, StatusBadge, ChartCard,
} from '../../components/Dashboard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const styles = useThemeStyles();
  const { language, t } = useLanguage();
  const [data, setData] = useState({
    totalEnquiries: 0, totalUsers: 0, totalHospitals: 0, totalDistricts: 0,
    pending: 0, approved: 0, rejected: 0, escalated: 0, completed: 0, forwarded: 0, inProgress: 0,
    recent: [], recentUsers: [], monthly: [], userRoles: [], hospitalStats: [],
  });
  const [filter, setFilter] = useState({ status: 'ALL', dateFrom: '', dateTo: '', district: 'ALL', hospital: 'ALL' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      const [enqRes, usersRes, hospRes, distRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, { headers: h }),
        fetch(`${baseUrl}/api/users`, { headers: h }),
        fetch(`${baseUrl}/api/hospitals`, { headers: h }),
        fetch(`${baseUrl}/api/districts`, { headers: h }),
      ]);
      if (!enqRes.ok) throw new Error('Failed to fetch enquiries');
      if (!usersRes.ok) throw new Error('Failed to fetch users');

      const [enqData, usersData, hospData, distData] = await Promise.all([
        enqRes.json(), usersRes.json(),
        hospRes.ok ? hospRes.json() : { data: [] },
        distRes.ok ? distRes.json() : { data: [] },
      ]);

      const enquiries = enqData.data || [];
      const users = usersData.data || [];
      const hospList = hospData.data || [];
      const distList = distData.data || [];

      const hospitalMap = {};
      hospList.forEach(h => { hospitalMap[h.hospital_id] = h.name || h.hospital_name || `Hospital ${h.hospital_id}`; });
      const hospStats = {};
      enquiries.forEach(e => {
        const name = hospitalMap[e.hospital_id] || 'Unknown';
        if (!hospStats[name]) hospStats[name] = { total: 0 };
        hospStats[name].total++;
      });

      const roleMap = {};
      users.forEach(u => { const r = u.role || 'UNKNOWN'; roleMap[r] = (roleMap[r] || 0) + 1; });

      const now = new Date();
      const monthly = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const month = date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', year: 'numeric' });
        const m = enquiries.filter(e => { const d = new Date(e.created_at); return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(); });
        return { month, total: m.length, approved: m.filter(e => e.status === 'APPROVED').length, rejected: m.filter(e => e.status === 'REJECTED').length };
      });

      setData({
        totalEnquiries: enquiries.length,
        totalUsers: users.length,
        totalHospitals: hospList.length,
        totalDistricts: distList.length,
        pending: enquiries.filter(e => e.status === 'PENDING').length,
        approved: enquiries.filter(e => e.status === 'APPROVED').length,
        rejected: enquiries.filter(e => e.status === 'REJECTED').length,
        escalated: enquiries.filter(e => e.status === 'ESCALATED').length,
        completed: enquiries.filter(e => e.status === 'COMPLETED').length,
        forwarded: enquiries.filter(e => e.status === 'FORWARDED').length,
        inProgress: enquiries.filter(e => e.status === 'IN_PROGRESS').length,
        recent: enquiries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10),
        recentUsers: users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
        monthly,
        userRoles: Object.entries(roleMap).map(([role, count]) => ({ role, count })),
        hospitalStats: Object.entries(hospStats).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.total - a.total).slice(0, 5),
      });
      setHospitals(hospList);
      setDistricts(distList);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };
  const handleFilterChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });

  const filteredRecent = data.recent.filter(e => {
    const matchStatus = filter.status === 'ALL' || e.status === filter.status;
    const matchDistrict = filter.district === 'ALL' || e.district_id?.toString() === filter.district;
    const matchHospital = filter.hospital === 'ALL' || e.hospital_id?.toString() === filter.hospital;
    let matchDate = true;
    if (filter.dateFrom) matchDate = matchDate && new Date(e.created_at) >= new Date(filter.dateFrom);
    if (filter.dateTo) matchDate = matchDate && new Date(e.created_at) <= new Date(filter.dateTo);
    return matchStatus && matchDistrict && matchHospital && matchDate;
  });

  const formatDate = (d) => new Date(d).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const statusChartData = {
    labels: [t.pending || 'Pending', t.approved || 'Approved', t.rejected || 'Rejected', t.escalated || 'Escalated', t.completed || 'Completed', t.forwarded || 'Forwarded'],
    datasets: [{ data: [data.pending, data.approved, data.rejected, data.escalated, data.completed, data.forwarded], backgroundColor: ['#FEF3C7', '#D1FAE5', '#FEE2E2', '#E0E7FF', '#F3F4F6', '#DBEAFE'], borderColor: ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#6B7280', '#3B82F6'], borderWidth: 2 }],
  };
  const monthlyChartData = {
    labels: data.monthly.map(m => m.month),
    datasets: [
      { label: t.totalEnquiries || 'Total', data: data.monthly.map(m => m.total), borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4 },
      { label: t.approved || 'Approved', data: data.monthly.map(m => m.approved), borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4 },
      { label: t.rejected || 'Rejected', data: data.monthly.map(m => m.rejected), borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4 },
    ],
  };
  const userRoleChartData = {
    labels: data.userRoles.map(r => r.role),
    datasets: [{ label: t.usersByRole || 'Users by Role', data: data.userRoles.map(r => r.count), backgroundColor: ['rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)', 'rgba(139,92,246,0.8)', 'rgba(236,72,153,0.8)'], borderWidth: 1 }],
  };
  const hospitalChartData = {
    labels: data.hospitalStats.map(h => h.name.length > 15 ? h.name.slice(0, 15) + '...' : h.name),
    datasets: [{ label: t.totalEnquiries || 'Total', data: data.hospitalStats.map(h => h.total), backgroundColor: 'rgba(59,130,246,0.8)', borderColor: '#3B82F6', borderWidth: 1 }],
  };

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-8`}>
          <div className="animate-pulse">
            <div className={`h-8 ${styles.loadingShimmer} rounded mb-6`}></div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => <div key={i} className={`h-24 ${styles.loadingShimmer} rounded`}></div>)}
            </div>
            <div className={`h-64 ${styles.loadingShimmer} rounded`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${styles.pageBackground}`}>
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />{error}
        </div>
      )}

      <DashboardHeader
        title={t.adminDashboardTitle || 'Admin Dashboard'}
        badgeLabel={t.systemAdministration || 'System Administration'}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        accentColor="blue"
      />

      {/* Top 4 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientStatCard label={t.totalEnquiries || 'Total Enquiries'} value={data.totalEnquiries} subLabel={t.allTimeTotal || 'All time total'} icon={<FaFileAlt />} from="from-blue-500" to="to-blue-600" />
        <GradientStatCard label={t.totalUsers || 'Total Users'} value={data.totalUsers} subLabel={t.registeredUsers || 'Registered users'} icon={<FaUsers />} from="from-green-500" to="to-green-600" />
        <GradientStatCard label={t.totalHospitals || 'Total Hospitals'} value={data.totalHospitals} subLabel={t.networkHospitals || 'Network hospitals'} icon={<FaHospital />} from="from-purple-500" to="to-purple-600" />
        <GradientStatCard label={t.totalDistricts || 'Total Districts'} value={data.totalDistricts} subLabel={t.coverageAreas || 'Coverage areas'} icon={<FaMapMarkerAlt />} from="from-orange-500" to="to-orange-600" />
      </div>

      {/* Enquiry status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GradientStatCard label={t.pendingCases || 'Pending Cases'} value={data.pending} icon={<FaClock />} from="from-yellow-500" to="to-yellow-600" />
        <GradientStatCard label={t.approvedCases || 'Approved Cases'} value={data.approved} icon={<FaCheckCircle />} from="from-emerald-500" to="to-emerald-600" />
        <GradientStatCard label={t.rejectedCases || 'Rejected Cases'} value={data.rejected} icon={<FaTimesCircle />} from="from-red-500" to="to-red-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t.statusDistribution || 'Status Distribution'}>
          <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </ChartCard>
        <ChartCard title={t.monthlyTrends || 'Monthly Trends'}>
          <Line data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t.userRoleDistribution || 'User Role Distribution'}>
          <Bar data={userRoleChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
        <ChartCard title={t.topHospitalsByEnquiries || 'Top Hospitals by Enquiries'}>
          <Bar data={hospitalChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
      </div>

      {/* Filters */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
        <div className="flex items-center mb-4">
          <FaFilter className={`mr-2 ${styles.secondaryText}`} />
          <h2 className={`text-xl font-semibold ${styles.primaryText}`}>{t.filters || 'Filters'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>{t.status || 'Status'}</label>
            <select name="status" value={filter.status} onChange={handleFilterChange} className={`w-full p-2 border rounded-md ${styles.inputBackground}`}>
              <option value="ALL">{t.allStatus || 'All Status'}</option>
              {['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'COMPLETED', 'FORWARDED', 'IN_PROGRESS'].map(s => (
                <option key={s} value={s}>{t[s.toLowerCase()] || s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>{t.fromDate || 'From Date'}</label>
            <input type="date" name="dateFrom" value={filter.dateFrom} onChange={handleFilterChange} className={`w-full p-2 border rounded-md ${styles.inputBackground}`} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>{t.toDate || 'To Date'}</label>
            <input type="date" name="dateTo" value={filter.dateTo} onChange={handleFilterChange} className={`w-full p-2 border rounded-md ${styles.inputBackground}`} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>{t.district || 'District'}</label>
            <select name="district" value={filter.district} onChange={handleFilterChange} className={`w-full p-2 border rounded-md ${styles.inputBackground}`}>
              <option value="ALL">{t.allDistricts || 'All Districts'}</option>
              {districts.map(d => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>{t.hospital || 'Hospital'}</label>
            <select name="hospital" value={filter.hospital} onChange={handleFilterChange} className={`w-full p-2 border rounded-md ${styles.inputBackground}`}>
              <option value="ALL">{t.allHospitals || 'All Hospitals'}</option>
              {hospitals.map(h => <option key={h.hospital_id} value={h.hospital_id}>{h.name || h.hospital_name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Recent Enquiries Table */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor} flex items-center justify-between`}>
          <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
            <FaEye className="mr-2 text-indigo-600" />
            {t.recentEnquiries || 'Recent Enquiries'} ({filteredRecent.length})
          </h2>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <FaDownload className="mr-2" />{t.export || 'Export'}
          </button>
        </div>
        <div className="overflow-x-auto">
          {filteredRecent.length === 0 ? (
            <div className={`p-8 text-center ${styles.secondaryText}`}>
              <FaFileAlt className="mx-auto text-4xl mb-4 text-gray-300" />
              <p>{t.noEnquiriesFound || 'No enquiries found.'}</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className={styles.tableHeader}>
                <tr>
                  {[t.enquiryCode || 'Enquiry Code', t.patientName || 'Patient Name', t.status || 'Status', t.hospital || 'Hospital', t.district || 'District', t.createdDate || 'Created Date', t.actions || 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                {filteredRecent.map(e => (
                  <tr key={e.enquiry_id} className={styles.tableRow}>
                    <td className={`px-6 py-4 text-sm font-medium ${styles.primaryText}`}>{e.enquiry_code || `ENQ${e.enquiry_id}`}</td>
                    <td className={`px-6 py-4 text-sm ${styles.primaryText}`}>{e.patient_name}</td>
                    <td className="px-6 py-4"><StatusBadge status={e.status} label={t[e.status?.toLowerCase()] || e.status} /></td>
                    <td className={`px-6 py-4 text-sm ${styles.primaryText}`}>{e.hospital?.name || e.hospital?.hospital_name || 'N/A'}</td>
                    <td className={`px-6 py-4 text-sm ${styles.primaryText}`}>{e.district?.district_name || 'N/A'}</td>
                    <td className={`px-6 py-4 text-sm ${styles.primaryText}`}>{formatDate(e.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-right">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FaEye className="inline mr-1" />{t.view || 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
            <FaCog className="mr-2 text-gray-600" />{t.quickActions || 'Quick Actions'}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { to: '/admin/user-management', color: 'bg-blue-600 hover:bg-blue-700', icon: <FaUsers className="mr-2" />, label: t.manageUsers || 'Manage Users' },
              { to: '/admin/hospital-management', color: 'bg-green-600 hover:bg-green-700', icon: <FaHospital className="mr-2" />, label: t.manageHospitals || 'Manage Hospitals' },
              { to: '/admin/district-data-page', color: 'bg-purple-600 hover:bg-purple-700', icon: <FaMapMarkerAlt className="mr-2" />, label: t.manageDistricts || 'Manage Districts' },
              { to: '/admin/all-queries', color: 'bg-indigo-600 hover:bg-indigo-700', icon: <FaQuestionCircle className="mr-2" />, label: t.allQueries || 'All Queries' },
              { to: '/admin/export-page', color: 'bg-orange-600 hover:bg-orange-700', icon: <FaDownload className="mr-2" />, label: t.exportData || 'Export Data' },
            ].map(({ to, color, icon, label }) => (
              <Link key={to} to={to} className={`flex items-center justify-center px-6 py-4 ${color} text-white rounded-lg transition`}>
                {icon}{label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
