import React, { useState, useEffect } from 'react';
import { FaAmbulance, FaFilter, FaSearch, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatusBadge } from '../../components/Dashboard';
import baseUrl from '../../baseUrl/baseUrl';

const TABS = [
  { key: 'byAmbulance', label: 'By Ambulance' },
  { key: 'byEnquiry',   label: 'By Enquiry'   },
];

const AmbulanceAssignmentTracking = () => {
  const styles = useThemeStyles();
  const { language } = useLanguage();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('byAmbulance');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedAmb, setExpandedAmb] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch enquiries');
        const data = await res.json();
        // Only keep enquiries that have an ambulance assigned
        setEnquiries((data.data || []).filter(e => e.ambulance_registration_number));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  // ── Filtered base list ────────────────────────────────────────────────────
  const filtered = enquiries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.ambulance_registration_number?.toLowerCase().includes(q) ||
      e.patient_name?.toLowerCase().includes(q) ||
      e.enquiry_code?.toLowerCase().includes(q) ||
      e.ambulance_contact?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Group by ambulance reg number ─────────────────────────────────────────
  const grouped = filtered.reduce((acc, e) => {
    const key = e.ambulance_registration_number;
    if (!acc[key]) acc[key] = { reg: key, contact: e.ambulance_contact || '—', cases: [] };
    acc[key].cases.push(e);
    return acc;
  }, {});
  const groupedList = Object.values(grouped).sort((a, b) => b.cases.length - a.cases.length);

  if (loading) {
    return (
      <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-8 ${styles.loadingShimmer} rounded w-1/3`}></div>
          <div className={`h-64 ${styles.loadingShimmer} rounded`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${styles.pageBackground}`}>
      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">{error}</div>}

      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <FaAmbulance className="text-orange-600 text-lg" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${styles.primaryText}`}>Ambulance Assignment Tracking</h1>
            <p className={`text-sm ${styles.secondaryText}`}>View which ambulance was assigned to which enquiry / patient</p>
          </div>
          <div className="ml-auto flex gap-3">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              {filtered.length} assignments
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
              {groupedList.length} ambulances
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-5`}>
        <div className="flex items-center mb-3">
          <FaFilter className={`mr-2 ${styles.secondaryText}`} />
          <h2 className={`text-base font-semibold ${styles.primaryText}`}>Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ambulance no., patient, enquiry code..."
              className={`w-full pl-9 pr-3 py-2 border rounded-md ${styles.inputBackground}`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={`w-full p-2 border rounded-md ${styles.inputBackground}`}
          >
            <option value="ALL">All Status</option>
            {['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'COMPLETED', 'FORWARDED', 'IN_PROGRESS'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        {/* Tab bar */}
        <div className={`border-b ${styles.borderColor} px-6 pt-4 flex gap-1`}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-orange-500 text-orange-600'
                  : `border-transparent ${styles.secondaryText} hover:text-gray-700`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BY AMBULANCE tab ─────────────────────────────────────────────── */}
        {activeTab === 'byAmbulance' && (
          <div className="p-4 space-y-3">
            {groupedList.length === 0 ? (
              <EmptyState />
            ) : (
              groupedList.map(group => (
                <div key={group.reg} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  {/* Ambulance header row */}
                  <button
                    onClick={() => setExpandedAmb(expandedAmb === group.reg ? null : group.reg)}
                    className="w-full flex items-center gap-4 px-5 py-4 bg-orange-50 hover:bg-orange-100 transition text-left"
                  >
                    <div className="w-9 h-9 bg-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaAmbulance className="text-orange-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-orange-800 font-mono text-base">{group.reg}</p>
                      <p className="text-xs text-orange-600">Contact: {group.contact}</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-bold">
                      {group.cases.length} {group.cases.length === 1 ? 'case' : 'cases'}
                    </span>
                    {expandedAmb === group.reg
                      ? <FaChevronDown className="text-orange-500 flex-shrink-0" />
                      : <FaChevronRight className="text-orange-400 flex-shrink-0" />}
                  </button>

                  {/* Cases table */}
                  {expandedAmb === group.reg && (
                    <div className="overflow-x-auto">
                      <table className="min-w-[700px] w-full">
                        <thead>
                          <tr className="bg-gray-50 border-t border-gray-100">
                            {['Enquiry Code', 'Patient Name', 'Status', 'Hospital', 'District', 'Medical Condition', 'Date'].map(h => (
                              <th key={h} className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider ${styles.secondaryText} whitespace-nowrap`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${styles.borderColor}`}>
                          {group.cases.map(e => (
                            <tr key={e.enquiry_id} className={`${styles.tableRow}`}>
                              <td className={`px-4 py-3 text-sm font-mono font-bold ${styles.primaryText} whitespace-nowrap`}>{e.enquiry_code || `ENQ${e.enquiry_id}`}</td>
                              <td className={`px-4 py-3 text-sm font-medium ${styles.primaryText} whitespace-nowrap`}>{e.patient_name}</td>
                              <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={e.status} label={e.status} /></td>
                              <td className={`px-4 py-3 text-sm ${styles.secondaryText} whitespace-nowrap`}>{e.hospital?.name || 'N/A'}</td>
                              <td className={`px-4 py-3 text-sm ${styles.secondaryText} whitespace-nowrap`}>{e.district?.district_name || 'N/A'}</td>
                              <td className={`px-4 py-3 text-sm ${styles.secondaryText}`}>{e.medical_condition || 'N/A'}</td>
                              <td className={`px-4 py-3 text-sm ${styles.secondaryText} whitespace-nowrap`}>{fmt(e.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── BY ENQUIRY tab ───────────────────────────────────────────────── */}
        {activeTab === 'byEnquiry' && (
          <div className="overflow-x-auto">
            {filtered.length === 0 ? <EmptyState /> : (
              <table className="min-w-[900px] w-full">
                <thead className={styles.tableHeader}>
                  <tr>
                    {['Enquiry Code', 'Patient Name', 'Status', 'Ambulance No.', 'Contact', 'Hospital', 'District', 'Medical Condition', 'Date'].map(h => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText} whitespace-nowrap`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                  {filtered.map(e => (
                    <tr key={e.enquiry_id} className={styles.tableRow}>
                      <td className={`px-4 py-4 text-sm font-mono font-bold ${styles.primaryText} whitespace-nowrap`}>{e.enquiry_code || `ENQ${e.enquiry_id}`}</td>
                      <td className={`px-4 py-4 text-sm font-medium ${styles.primaryText} whitespace-nowrap`}>{e.patient_name}</td>
                      <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={e.status} label={e.status} /></td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaAmbulance className="text-orange-500 flex-shrink-0" />
                          <span className="font-mono font-bold text-orange-700 text-sm">{e.ambulance_registration_number}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-4 text-sm ${styles.secondaryText} whitespace-nowrap`}>{e.ambulance_contact || '—'}</td>
                      <td className={`px-4 py-4 text-sm ${styles.secondaryText} whitespace-nowrap`}>{e.hospital?.name || 'N/A'}</td>
                      <td className={`px-4 py-4 text-sm ${styles.secondaryText} whitespace-nowrap`}>{e.district?.district_name || 'N/A'}</td>
                      <td className={`px-4 py-4 text-sm ${styles.secondaryText}`}>{e.medical_condition || 'N/A'}</td>
                      <td className={`px-4 py-4 text-sm ${styles.secondaryText} whitespace-nowrap`}>{fmt(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="p-12 text-center text-gray-400">
    <FaAmbulance className="mx-auto text-5xl mb-4 text-gray-200" />
    <p className="text-lg font-medium">No ambulance assignments found</p>
    <p className="text-sm mt-1">Try adjusting your filters</p>
  </div>
);

export default AmbulanceAssignmentTracking;
