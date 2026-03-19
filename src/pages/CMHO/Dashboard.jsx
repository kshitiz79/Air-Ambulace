import React, { useState, useEffect } from 'react';
import {
  FaUsers, FaHospital, FaChartLine, FaCalendarAlt,
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaClock,
  FaArrowUp, FaEye, FaSearch, FaEdit,
} from 'react-icons/fa';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, PointElement, LineElement,
} from 'chart.js';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  DashboardHeader, GradientStatCard, CasesTable,
  ChartCard, QuickActions, RecentActivity,
} from '../../components/Dashboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Dashboard = () => {
  const { language, t, localize } = useLanguage();
  const [filter, setFilter] = useState({ status: 'ALL', date: '' });
  const [data, setData] = useState({
    total: 0, pending: 0, approved: 0, rejected: 0,
    escalated: 0, forwarded: 0, completed: 0,
    recent: [], monthly: [], hospitalStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const quickActions = [
    { title: t.createEnquiry || 'Create Enquiry', description: t.createNewEnquiry || 'Create a new enquiry', icon: <FaEdit className="text-blue-600" />, to: '/cmho-dashboard/enquiry-creation-page', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
    { title: t.viewEnquiries || 'View Enquiries', description: t.viewAllEnquiries || 'View all enquiries', icon: <FaEye className="text-green-600" />, to: '/cmho-dashboard/beneficiary-edit-page-list', color: 'border-green-200 hover:border-green-400 hover:bg-green-50' },
    { title: t.searchCases || 'Search Cases', description: t.searchAndFilter || 'Search and filter cases', icon: <FaSearch className="text-yellow-600" />, to: '/cmho-dashboard/search-page', color: 'border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50' },
    { title: t.hospitals || 'Hospitals', description: t.viewHospitals || 'View hospital data', icon: <FaHospital className="text-purple-600" />, to: '/cmho-dashboard/hospital-page', color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}` };
      const [enqRes, hospRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, { headers: h }),
        fetch(`${baseUrl}/api/hospitals`, { headers: h }).catch(() => ({ ok: false })),
      ]);
      if (!enqRes.ok) throw new Error('Failed to fetch enquiries');
      const [enqData, hospData] = await Promise.all([
        enqRes.json(),
        hospRes.ok ? hospRes.json() : { data: [] },
      ]);
      const enquiries = enqData.data || [];
      const hospitals = hospData.data || [];

      const hospitalMap = {};
      hospitals.forEach(h => { hospitalMap[h.hospital_id] = h.name || h.hospital_name || `Hospital ${h.hospital_id}`; });
      const hospStats = {};
      enquiries.forEach(e => {
        const name = hospitalMap[e.hospital_id] || 'Unknown';
        if (!hospStats[name]) hospStats[name] = { total: 0, approved: 0, rejected: 0 };
        hospStats[name].total++;
        if (e.status === 'APPROVED') hospStats[name].approved++;
        if (e.status === 'REJECTED') hospStats[name].rejected++;
      });

      const now = new Date();
      const monthly = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const month = date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', year: 'numeric' });
        const m = enquiries.filter(e => { const d = new Date(e.created_at); return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(); });
        return { month, total: m.length, approved: m.filter(e => e.status === 'APPROVED').length, rejected: m.filter(e => e.status === 'REJECTED').length };
      });

      setData({
        total: enquiries.length,
        pending: enquiries.filter(e => e.status === 'PENDING').length,
        approved: enquiries.filter(e => e.status === 'APPROVED').length,
        rejected: enquiries.filter(e => e.status === 'REJECTED').length,
        escalated: enquiries.filter(e => e.status === 'ESCALATED').length,
        forwarded: enquiries.filter(e => e.status === 'FORWARDED').length,
        completed: enquiries.filter(e => e.status === 'COMPLETED').length,
        recent: enquiries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10),
        monthly,
        hospitalStats: Object.entries(hospStats).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.total - a.total).slice(0, 5),
      });
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

  const filteredCases = data.recent.filter(e => {
    const matchStatus = filter.status === 'ALL' || e.status === filter.status;
    const matchDate = !filter.date || new Date(e.created_at).toISOString().split('T')[0].includes(filter.date);
    return matchStatus && matchDate;
  });

  const recentActivity = data.recent.slice(0, 5).map(e => ({
    type: e.status === 'APPROVED' ? 'approval' : e.status === 'REJECTED' ? 'rejection' : 'enquiry',
    description: `${e.enquiry_code || `ENQ${e.enquiry_id}`} - ${e.patient_name}`,
    timestamp: new Date(e.created_at),
  }));

  const formatDate = (d) => new Date(d).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const statusChartData = {
    labels: [t.pending || 'Pending', t.approved || 'Approved', t.rejected || 'Rejected', t.escalated || 'Escalated', t.forwarded || 'Forwarded'],
    datasets: [{ data: [data.pending, data.approved, data.rejected, data.escalated, data.forwarded], backgroundColor: ['#fbbf24', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6'], borderWidth: 2 }],
  };
  const monthlyChartData = {
    labels: data.monthly.map(m => m.month),
    datasets: [
      { label: t.totalEnquiries || 'Total', data: data.monthly.map(m => m.total), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true },
      { label: t.approved || 'Approved', data: data.monthly.map(m => m.approved), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true },
    ],
  };
  const hospitalChartData = {
    labels: data.hospitalStats.map(h => h.name.length > 15 ? h.name.slice(0, 15) + '...' : h.name),
    datasets: [{ label: t.totalEnquiries || 'Total', data: data.hospitalStats.map(h => h.total), backgroundColor: 'rgba(59,130,246,0.8)', borderColor: '#3b82f6', borderWidth: 1 }],
  };

  if (loading) return <div className="max-w-7xl mx-auto p-6 text-center text-gray-600">{t.loadingDashboard || 'Loading dashboard...'}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />{error}
        </div>
      )}

 

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientStatCard label={t.totalEnquiries || 'Total Enquiries'} value={data.total} subLabel={t.allTimeTotal || 'All time total'} icon={<FaUsers />} from="from-blue-500" to="to-blue-600" />
        <GradientStatCard label={t.pendingCases || 'Pending Cases'} value={data.pending} subLabel={t.requiresAttention || 'Requires attention'} icon={<FaClock />} from="from-yellow-500" to="to-yellow-600" />
        <GradientStatCard label={t.approved || 'Approved'} value={data.approved} subLabel={t.successfullyProcessed || 'Successfully processed'} icon={<FaCheckCircle />} from="from-green-500" to="to-green-600" />
        <GradientStatCard label={t.rejected || 'Rejected'} value={data.rejected} subLabel={t.notApproved || 'Not approved'} icon={<FaTimesCircle />} from="from-red-500" to="to-red-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GradientStatCard label={t.escalatedCases || 'Escalated'} value={data.escalated} subLabel={t.escalatedToHigher || 'Escalated to higher authority'} icon={<FaExclamationTriangle />} from="from-purple-500" to="to-purple-600" />
        <GradientStatCard label={t.forwardedCases || 'Forwarded'} value={data.forwarded} subLabel={t.forwardedForReview || 'Forwarded for review'} icon={<FaArrowUp />} from="from-indigo-500" to="to-indigo-600" />
        <GradientStatCard label={t.completedCases || 'Completed'} value={data.completed} subLabel={t.casesCompleted || 'Cases completed'} icon={<FaCheckCircle />} from="from-gray-500" to="to-gray-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title={t.statusDistribution || 'Status Distribution'}>
          <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </ChartCard>
        <ChartCard title={t.monthlyTrends || 'Monthly Trends'}>
          <Line data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
        <ChartCard title={t.topHospitals || 'Top Hospitals'}>
          <Bar data={hospitalChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions actions={quickActions} />
        <RecentActivity activities={recentActivity} />
      </div>

      <CasesTable
        cases={filteredCases}
        baseRoute="/cmho-dashboard"
        accentColor="blue"
        filter={filter}
        onFilterChange={handleFilterChange}
        formatDate={formatDate}
        localize={localize}
      />
    </div>
  );
};

export default Dashboard;
