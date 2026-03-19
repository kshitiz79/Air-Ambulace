import React, { useState, useEffect } from 'react';
import {
  FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle,
  FaDollarSign, FaUserTie, FaPaperPlane,
} from 'react-icons/fa';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import baseUrl from '../../baseUrl/baseUrl';
import {
  ChartCard, RecentActivity, QuickActions,
  DashboardHeader, GradientStatCard, CasesTable,
} from '../../components/Dashboard';
import { useLanguage } from '../../contexts/LanguageContext';

const CollectorDashboard = () => {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState({ status: 'ALL', date: '' });
  const [dashboardData, setDashboardData] = useState({
    totalCases: 0, pendingApproval: 0, approved: 0, rejected: 0,
    financialSanctions: 0, ordersReleased: 0,
    recentEnquiries: [], monthlyStats: [], financialStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const quickActions = [
    { title: t.approvalRejection || 'Approval/Rejection', description: t.reviewAndApproveCases || 'Review and approve cases', icon: <FaUserTie className="text-blue-600" />, to: '/collector-dashboard/approval-reject', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
    { title: t.caseFiles || 'Case Files', description: t.viewCaseFiles || 'View case files', icon: <FaFileAlt className="text-green-600" />, to: '/collector-dashboard/case-files', color: 'border-green-200 hover:border-green-400 hover:bg-green-50' },
    { title: t.financialSanctions || 'Financial Sanctions', description: t.manageFinancialApprovals || 'Manage financial approvals', icon: <FaDollarSign className="text-yellow-600" />, to: '/collector-dashboard/financial-page', color: 'border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50' },
    { title: t.orderRelease || 'Order Release', description: t.releaseApprovedOrders || 'Release approved orders', icon: <FaPaperPlane className="text-purple-600" />, to: '/collector-dashboard/order-release-page', color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [enquiriesRes, ordersRes, financialRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ ok: false })),
        fetch(`${baseUrl}/api/financial-sanctions`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ ok: false })),
      ]);
      if (!enquiriesRes.ok) throw new Error('Failed to fetch enquiries');
      const [enquiriesData, ordersData, financialData] = await Promise.all([
        enquiriesRes.json(),
        ordersRes.ok ? ordersRes.json() : { data: [] },
        financialRes.ok ? financialRes.json() : { data: [] },
      ]);
      const enquiries = enquiriesData.data || [];
      const orders = ordersData.data || [];
      const financialSanctions = financialData.data || [];
      setDashboardData({
        totalCases: enquiries.length,
        pendingApproval: enquiries.filter(e => ['FORWARDED', 'PENDING'].includes(e.status)).length,
        approved: enquiries.filter(e => e.status === 'APPROVED').length,
        rejected: enquiries.filter(e => e.status === 'REJECTED').length,
        financialSanctions: financialSanctions.length,
        ordersReleased: orders.filter(o => o.status === 'RELEASED').length,
        recentEnquiries: enquiries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10),
        monthlyStats: calcMonthly(enquiries),
        financialStats: calcFinancial(financialSanctions),
      });
      setError('');
    } catch (err) {
      setError(t.error + ': ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calcMonthly = (enquiries) => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', year: 'numeric' });
      const m = enquiries.filter(e => { const d = new Date(e.created_at); return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(); });
      return { month, total: m.length, approved: m.filter(e => e.status === 'APPROVED').length, rejected: m.filter(e => e.status === 'REJECTED').length };
    });
  };

  const calcFinancial = (sanctions) => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short' });
      const m = sanctions.filter(s => { const d = new Date(s.created_at); return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(); });
      return { month, amount: Math.round(m.reduce((sum, s) => sum + (s.amount || 0), 0) / 100000) };
    });
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchDashboardData(); };
  const handleFilterChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });

  const filteredCases = dashboardData.recentEnquiries.filter(e => {
    const matchStatus = filter.status === 'ALL' || e.status === filter.status;
    const matchDate = !filter.date || new Date(e.created_at).toISOString().split('T')[0].includes(filter.date);
    return matchStatus && matchDate;
  });

  const recentActivity = dashboardData.recentEnquiries.slice(0, 5).map(e => ({
    type: e.status === 'APPROVED' ? 'approval' : e.status === 'REJECTED' ? 'rejection' : 'enquiry',
    description: `${e.enquiry_code || `ENQ${e.enquiry_id}`} - ${e.patient_name}`,
    timestamp: new Date(e.created_at),
  }));

  const formatDate = (d) => new Date(d).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return <div className="max-w-7xl mx-auto p-6 text-center text-gray-600">{t.loadingDashboard || 'Loading dashboard...'}</div>;
  if (error) return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button onClick={handleRefresh} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">{t.retry || 'Retry'}</button>
      </div>
    </div>
  );

  const statusChartData = {
    labels: [t.pending || 'Pending', t.approved || 'Approved', t.rejected || 'Rejected'],
    datasets: [{ data: [dashboardData.pendingApproval, dashboardData.approved, dashboardData.rejected], backgroundColor: ['#fbbf24', '#10b981', '#ef4444'], borderWidth: 2 }],
  };
  const monthlyChartData = {
    labels: dashboardData.monthlyStats.map(m => m.month),
    datasets: [
      { label: t.totalCases || 'Total Cases', data: dashboardData.monthlyStats.map(m => m.total), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true },
      { label: t.approved || 'Approved', data: dashboardData.monthlyStats.map(m => m.approved), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', tension: 0.4, fill: true },
    ],
  };
  const financialChartData = {
    labels: dashboardData.financialStats.map(f => f.month),
    datasets: [{ label: t.approvedAmountLakhs || 'Approved Amount (₹ Lakhs)', data: dashboardData.financialStats.map(f => f.amount), backgroundColor: 'rgba(34,197,94,0.8)', borderColor: '#22c55e', borderWidth: 1 }],
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <DashboardHeader title="Collector Dashboard" badgeLabel="District Magistrate / Collector" onRefresh={handleRefresh} refreshing={refreshing} accentColor="green" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientStatCard label={t.totalCases || 'Total Cases'} value={dashboardData.totalCases} subLabel={t.allTimeTotal || 'All time total'} icon={<FaFileAlt />} from="from-blue-500" to="to-blue-600" />
        <GradientStatCard label={t.pendingApproval || 'Pending Approval'} value={dashboardData.pendingApproval} subLabel={t.awaitingDecision || 'Awaiting decision'} icon={<FaClock />} from="from-yellow-500" to="to-yellow-600" />
        <GradientStatCard label={t.approved || 'Approved'} value={dashboardData.approved} subLabel={t.successfullyApproved || 'Successfully approved'} icon={<FaCheckCircle />} from="from-green-500" to="to-green-600" />
        <GradientStatCard label={t.rejected || 'Rejected'} value={dashboardData.rejected} subLabel={t.notApproved || 'Not approved'} icon={<FaTimesCircle />} from="from-red-500" to="to-red-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GradientStatCard label={t.financialSanctions || 'Financial Sanctions'} value={dashboardData.financialSanctions} subLabel={t.totalSanctionsApproved || 'Total sanctions approved'} icon={<FaDollarSign />} from="from-purple-500" to="to-purple-600" />
        <GradientStatCard label={t.ordersReleased || 'Orders Released'} value={dashboardData.ordersReleased} subLabel={t.ordersIssued || 'Orders issued'} icon={<FaPaperPlane />} from="from-indigo-500" to="to-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title={t.caseStatusDistribution || 'Case Status Distribution'}>
          <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </ChartCard>
        <ChartCard title={t.monthlyCaseTrends || 'Monthly Case Trends'}>
          <Line data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
        <ChartCard title={t.financialApprovals || 'Financial Approvals'}>
          <Bar data={financialChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions actions={quickActions} />
        <RecentActivity activities={recentActivity} />
      </div>

      <CasesTable
        cases={filteredCases}
        baseRoute="/collector-dashboard"
        approvalRoute="/collector-dashboard/approval-reject"
        accentColor="green"
        filter={filter}
        onFilterChange={handleFilterChange}
        formatDate={formatDate}
      />
    </div>
  );
};

export default CollectorDashboard;
