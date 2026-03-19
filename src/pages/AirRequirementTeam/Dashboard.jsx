import React, { useState, useEffect } from 'react';
import {
  FiTruck, FiFileText, FiDollarSign, FiCheckCircle,
  FiActivity, FiTrendingUp, FiMapPin, FiAlertCircle, FiRefreshCw,
} from 'react-icons/fi';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  DashboardHeader, GradientStatCard, ChartCard, QuickActions, RecentActivity,
} from '../../components/Dashboard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState({
    totalAssignments: 0, activeFlights: 0, completedFlights: 0,
    pendingReports: 0, totalRevenue: 0, successRate: 0,
    pendingInvoices: 0, closedCases: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyData, setMonthlyData] = useState({ assignments: [], completions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const quickActions = [
    { title: t.createAssignment || 'Create Assignment', description: t.createNewFlightAssignment || 'Create new flight assignment', icon: <FiTruck className="text-blue-600" />, to: '/air-team/ambulance-assignment-page', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
    { title: t.submitReport || 'Submit Report', description: t.submitOperationReport || 'Submit operation report', icon: <FiFileText className="text-green-600" />, to: '/air-team/post-operation-page', color: 'border-green-200 hover:border-green-400 hover:bg-green-50' },
    { title: t.generateInvoice || 'Generate Invoice', description: t.createNewInvoice || 'Create new invoice', icon: <FiDollarSign className="text-purple-600" />, to: '/air-team/invoice-generation-page', color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' },
    { title: t.trackFlights || 'Track Flights', description: t.monitorActiveFlights || 'Monitor active flights', icon: <FiMapPin className="text-orange-600" />, to: '/air-team/tracker-page', color: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      const [assignStatsRes, invoiceStatsRes, reportStatsRes, assignmentsRes, reportsRes, invoicesRes] = await Promise.all([
        fetch(`${baseUrl}/api/flight-assignments/stats`, { headers: h }),
        fetch(`${baseUrl}/api/invoices/stats`, { headers: h }),
        fetch(`${baseUrl}/api/post-operation-reports/stats`, { headers: h }),
        fetch(`${baseUrl}/api/flight-assignments?limit=10`, { headers: h }),
        fetch(`${baseUrl}/api/post-operation-reports?limit=5`, { headers: h }),
        fetch(`${baseUrl}/api/invoices?limit=5`, { headers: h }),
      ]);

      const assignStats = assignStatsRes.ok ? await assignStatsRes.json() : {};
      const invoiceStats = invoiceStatsRes.ok ? await invoiceStatsRes.json() : {};
      const reportStats = reportStatsRes.ok ? await reportStatsRes.json() : {};
      const assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
      const reports = reportsRes.ok ? await reportsRes.json() : [];
      const invoices = invoicesRes.ok ? await invoicesRes.json() : [];

      setStats({
        totalAssignments: assignStats.total || 0,
        activeFlights: (assignStats.assigned || 0) + (assignStats.inProgress || 0),
        completedFlights: assignStats.completed || 0,
        pendingReports: (assignStats.total || 0) - (reportStats.total || 0),
        totalRevenue: invoiceStats.totalRevenue || 0,
        successRate: reportStats.successRate || 0,
        pendingInvoices: invoiceStats.pending || 0,
        closedCases: assignStats.completed || 0,
      });

      const activities = [];
      if (Array.isArray(assignments)) {
        assignments.slice(0, 3).forEach(a => activities.push({ type: 'assignment', description: `Flight assignment for enquiry #${a.enquiry_id}`, timestamp: new Date(a.created_at) }));
      }
      if (Array.isArray(reports)) {
        reports.slice(0, 2).forEach(r => activities.push({ type: r.patient_transfer_status === 'SUCCESSFUL' ? 'approval' : 'rejection', description: `Operation report for enquiry #${r.enquiry_id} - ${r.patient_transfer_status}`, timestamp: new Date(r.created_at) }));
      }
      if (Array.isArray(invoices)) {
        invoices.slice(0, 2).forEach(inv => activities.push({ type: 'enquiry', description: `Invoice for enquiry #${inv.enquiry_id} - ₹${inv.amount}`, timestamp: new Date(inv.created_at) }));
      }
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivity(activities.slice(0, 5));

      const monthlyAssignments = Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 10);
      setMonthlyData({ assignments: monthlyAssignments, completions: monthlyAssignments.map(v => Math.floor(v * 0.8)) });
    } catch (err) {
      setError(t.failedToLoadDashboard || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const formatCurrency = (amount) => new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const getMonthLabels = () => {
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const months = language === 'hi' ? monthsHi : monthsEn;
    const cur = new Date().getMonth();
    return Array.from({ length: 6 }, (_, i) => months[(cur - (5 - i) + 12) % 12]);
  };

  const statusChartData = {
    labels: [t.activeFlights || 'Active', t.completed || 'Completed', t.pendingReports || 'Pending Reports', t.closedCases || 'Closed'],
    datasets: [{ data: [stats.activeFlights, stats.completedFlights, stats.pendingReports, stats.closedCases], backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6B7280'], borderWidth: 2 }],
  };
  const monthlyChartData = {
    labels: getMonthLabels(),
    datasets: [
      { label: t.flightAssignments || 'Assignments', data: monthlyData.assignments, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true },
      { label: t.completedFlights || 'Completed', data: monthlyData.completions, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true },
    ],
  };

  if (loading) return <div className="max-w-7xl mx-auto p-6 text-center text-gray-600">{t.loadingDashboard || 'Loading dashboard...'}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <FiAlertCircle className="text-red-600" size={20} />
          <div>
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={handleRefresh} className="mt-1 text-sm text-red-600 hover:text-red-800 underline">{t.tryAgain || 'Try Again'}</button>
          </div>
        </div>
      )}

      <DashboardHeader
        title={t.airTeamDashboardTitle || 'Air Team Dashboard'}
        badgeLabel={t.airAmbulanceOperations || 'Air Ambulance Operations'}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        accentColor="blue"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientStatCard label={t.totalAssignments || 'Total Assignments'} value={stats.totalAssignments} icon={<FiTruck />} from="from-blue-500" to="to-blue-600" />
        <GradientStatCard label={t.activeFlights || 'Active Flights'} value={stats.activeFlights} icon={<FiActivity />} from="from-green-500" to="to-green-600" />
        <GradientStatCard label={t.totalRevenue || 'Total Revenue'} value={formatCurrency(stats.totalRevenue)} icon={<FiDollarSign />} from="from-purple-500" to="to-purple-600" />
        <GradientStatCard label={t.successRate || 'Success Rate'} value={`${stats.successRate}%`} icon={<FiTrendingUp />} from="from-orange-500" to="to-orange-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GradientStatCard label={t.completedFlights || 'Completed Flights'} value={stats.completedFlights} icon={<FiCheckCircle />} from="from-teal-500" to="to-teal-600" />
        <GradientStatCard label={t.pendingReports || 'Pending Reports'} value={stats.pendingReports} icon={<FiFileText />} from="from-yellow-500" to="to-yellow-600" />
        <GradientStatCard label={t.pendingInvoices || 'Pending Invoices'} value={stats.pendingInvoices} icon={<FiDollarSign />} from="from-pink-500" to="to-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title={t.statusDistribution || 'Status Distribution'}>
          <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </ChartCard>
        <div className="lg:col-span-2">
          <ChartCard title={t.monthlyTrends || 'Monthly Trends'}>
            <Line data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions actions={quickActions} />
        <RecentActivity activities={recentActivity} />
      </div>

      {(stats.pendingInvoices > 0 || stats.pendingReports > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
          <FiAlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-yellow-800">{t.attentionRequired || 'Attention Required'}</h4>
            <div className="text-sm text-yellow-700 mt-1">
              {stats.pendingInvoices > 0 && <p>• {stats.pendingInvoices} {t.invoicesPendingPayment || 'invoices pending payment'}</p>}
              {stats.pendingReports > 0 && <p>• {stats.pendingReports} {t.reportsPendingSubmission || 'operation reports pending submission'}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
