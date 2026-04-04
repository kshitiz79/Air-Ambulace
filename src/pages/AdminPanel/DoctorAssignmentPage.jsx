import React, { useState, useEffect } from 'react';
import { FaUserMd, FaFilter, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useLanguage } from '../../contexts/LanguageContext';
import { StatusBadge } from '../../components/Dashboard';
import baseUrl from '../../baseUrl/baseUrl';

const TABS = [
  { key: 'all',        label: 'All Assignments',       color: 'blue',   accent: 'border-blue-500 text-blue-600',   bg: 'bg-blue-50' },
  { key: 'physician',  label: 'Physician On-Duty',     color: 'blue',   accent: 'border-blue-500 text-blue-600',   bg: 'bg-blue-50' },
  { key: 'recommending', label: 'Recommending Authority', color: 'purple', accent: 'border-purple-500 text-purple-600', bg: 'bg-purple-50' },
  { key: 'approval',   label: 'Approval Authority',    color: 'green',  accent: 'border-green-500 text-green-600', bg: 'bg-green-50' },
];

const DoctorAssignmentPage = () => {
  const styles = useThemeStyles();
  const { language } = useLanguage();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState({ doctorName: '', status: 'ALL', dateFrom: '', dateTo: '' });
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch enquiries');
        const data = await res.json();
        setEnquiries(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  // Base filter (status + date + name search)
  const applyBaseFilter = (list, nameFields) => {
    const name = filter.doctorName.toLowerCase();
    return list.filter(e => {
      const matchDoctor = !name || nameFields.some(f => e[f]?.toLowerCase().includes(name));
      const matchStatus = filter.status === 'ALL' || e.status === filter.status;
      let matchDate = true;
      if (filter.dateFrom) matchDate = matchDate && new Date(e.created_at) >= new Date(filter.dateFrom);
      if (filter.dateTo) matchDate = matchDate && new Date(e.created_at) <= new Date(filter.dateTo);
      return matchDoctor && matchStatus && matchDate;
    });
  };

  // Per-tab datasets
  const allData = applyBaseFilter(
    enquiries.filter(e => e.referring_physician_name || e.recommending_authority_name || e.approval_authority_name),
    ['referring_physician_name', 'recommending_authority_name', 'approval_authority_name']
  );
  const physicianData = applyBaseFilter(
    enquiries.filter(e => e.referring_physician_name),
    ['referring_physician_name', 'referring_physician_designation']
  );
  const recommendingData = applyBaseFilter(
    enquiries.filter(e => e.recommending_authority_name),
    ['recommending_authority_name', 'recommending_authority_designation']
  );
  const approvalData = applyBaseFilter(
    enquiries.filter(e => e.approval_authority_name),
    ['approval_authority_name', 'approval_authority_designation']
  );

  const tabData = { all: allData, physician: physicianData, recommending: recommendingData, approval: approvalData };
  const currentData = tabData[activeTab];

  const tabCounts = {
    all: allData.length,
    physician: physicianData.length,
    recommending: recommendingData.length,
    approval: approvalData.length,
  };

  // ── Shared table wrapper ──────────────────────────────────────────────────
  const EmptyState = () => (
    <div className={`p-12 text-center ${styles.secondaryText}`}>
      <FaUserMd className="mx-auto text-5xl mb-4 text-gray-200" />
      <p className="text-lg font-medium">No records found</p>
      <p className="text-sm mt-1">Try adjusting your filters</p>
    </div>
  );

  // ── ALL tab table ─────────────────────────────────────────────────────────
  const AllTable = () => (
    <div className="overflow-x-auto">
      {currentData.length === 0 ? <EmptyState /> : (
        <table className="min-w-[900px] w-full">
          <thead className={styles.tableHeader}>
            <tr>
              {['Enquiry Code', 'Patient Name', 'Status', 'Physician On-Duty', 'Recommending Authority', 'Approval Authority', 'Date', ''].map(h => (
                <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText} whitespace-nowrap`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
            {currentData.map(e => (
              <React.Fragment key={e.enquiry_id}>
                <tr className={styles.tableRow}>
                  <td className={`px-4 py-4 text-sm font-mono font-bold ${styles.primaryText} whitespace-nowrap`}>{e.enquiry_code || `ENQ${e.enquiry_id}`}</td>
                  <td className={`px-4 py-4 text-sm font-medium ${styles.primaryText} whitespace-nowrap`}>{e.patient_name}</td>
                  <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={e.status} label={e.status} /></td>
                  <td className="px-4 py-4 min-w-[160px]">
                    {e.referring_physician_name
                      ? <><p className="text-sm font-semibold text-blue-700">{e.referring_physician_name}</p><p className="text-xs text-gray-400">{e.referring_physician_designation || '—'}</p></>
                      : <span className="text-gray-300 text-xs italic">—</span>}
                  </td>
                  <td className="px-4 py-4 min-w-[160px]">
                    {e.recommending_authority_name
                      ? <><p className="text-sm font-semibold text-purple-700">{e.recommending_authority_name}</p><p className="text-xs text-gray-400">{e.recommending_authority_designation || '—'}</p></>
                      : <span className="text-gray-300 text-xs italic">—</span>}
                  </td>
                  <td className="px-4 py-4 min-w-[160px]">
                    {e.approval_authority_name
                      ? <><p className="text-sm font-semibold text-green-700">{e.approval_authority_name}</p><p className="text-xs text-gray-400">{e.approval_authority_designation || '—'}</p></>
                      : <span className="text-gray-300 text-xs italic">—</span>}
                  </td>
                  <td className={`px-4 py-4 text-sm ${styles.secondaryText} whitespace-nowrap`}>{formatDate(e.created_at)}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button onClick={() => setExpandedRow(expandedRow === e.enquiry_id ? null : e.enquiry_id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
                      {expandedRow === e.enquiry_id ? <><FaEyeSlash /> Hide</> : <><FaEye /> View</>}
                    </button>
                  </td>
                </tr>
                {expandedRow === e.enquiry_id && (
                  <tr className="bg-blue-50/40">
                    <td colSpan={8} className="px-6 py-4">
                      <ExpandedDetail e={e} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ── Single-role tab table (physician / recommending / approval) ───────────
  const RoleTable = ({ nameField, designField, roleLabel, roleColor, badgeColor, noteBadge }) => (
    <div className="overflow-x-auto">
      {currentData.length === 0 ? <EmptyState /> : (
        <table className="min-w-[700px] w-full">
          <thead className={styles.tableHeader}>
            <tr>
              {['Enquiry Code', 'Patient Name', 'Status', roleLabel, 'Designation', 'Hospital', 'District', 'Date'].map(h => (
                <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText} whitespace-nowrap`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
            {currentData.map(e => (
              <tr key={e.enquiry_id} className={styles.tableRow}>
                <td className={`px-4 py-4 text-sm font-mono font-bold ${styles.primaryText} whitespace-nowrap`}>{e.enquiry_code || `ENQ${e.enquiry_id}`}</td>
                <td className={`px-4 py-4 text-sm font-medium ${styles.primaryText} whitespace-nowrap`}>{e.patient_name}</td>
                <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={e.status} label={e.status} /></td>
                <td className="px-4 py-4 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${badgeColor} flex-shrink-0`}></span>
                    <span className={`text-sm font-semibold ${roleColor}`}>{e[nameField] || '—'}</span>
                  </div>
                </td>
                <td className={`px-4 py-4 text-sm ${styles.secondaryText}`}>{e[designField] || '—'}</td>
                <td className={`px-4 py-4 text-sm ${styles.secondaryText} whitespace-nowrap`}>{e.hospital?.name || 'N/A'}</td>
                <td className={`px-4 py-4 text-sm ${styles.secondaryText} whitespace-nowrap`}>{e.district?.district_name || 'N/A'}</td>
                <td className={`px-4 py-4 text-sm ${styles.secondaryText} whitespace-nowrap`}>{formatDate(e.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ── Expanded detail row ───────────────────────────────────────────────────
  const ExpandedDetail = ({ e }) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center"><FaUserMd className="text-blue-600 text-xs" /></div>
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-700">Physician On-Duty</h4>
          </div>
          <p className="font-semibold text-gray-800">{e.referring_physician_name || '—'}</p>
          <p className="text-sm text-gray-500">{e.referring_physician_designation || '—'}</p>
          {e.referral_note && <p className="mt-2 text-xs text-gray-400 italic border-t pt-2">{e.referral_note}</p>}
        </div>
        <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-[10px]">RA</div>
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-700">Recommending Authority</h4>
          </div>
          <p className="font-semibold text-gray-800">{e.recommending_authority_name || '—'}</p>
          <p className="text-sm text-gray-500">{e.recommending_authority_designation || '—'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-[10px]">AA</div>
            <h4 className="text-xs font-black uppercase tracking-wider text-green-700">Approval Authority</h4>
          </div>
          <p className="font-semibold text-gray-800">{e.approval_authority_name || '—'}</p>
          <p className="text-sm text-gray-500">{e.approval_authority_designation || '—'}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
        <span>Hospital: <strong>{e.hospital?.name || 'N/A'}</strong></span>
        <span>District: <strong>{e.district?.district_name || 'N/A'}</strong></span>
        <span>Medical Condition: <strong>{e.medical_condition || 'N/A'}</strong></span>
        {e.ambulance_registration_number && <span>Ambulance: <strong>{e.ambulance_registration_number}</strong></span>}
      </div>
    </>
  );

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
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaUserMd className="text-blue-600 text-lg" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${styles.primaryText}`}>Doctor Assignment Panel</h1>
            <p className={`text-sm ${styles.secondaryText}`}>Track Physician On-Duty, Recommending Authority, and Approval Authority per case</p>
          </div>
          <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {currentData.length} records
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
        <div className="flex items-center mb-4">
          <FaFilter className={`mr-2 ${styles.secondaryText}`} />
          <h2 className={`text-lg font-semibold ${styles.primaryText}`}>Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Doctor Name</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={filter.doctorName}
                onChange={e => setFilter({ ...filter, doctorName: e.target.value })}
                placeholder="Search by doctor name..."
                className={`w-full pl-9 pr-3 py-2 border rounded-md ${styles.inputBackground}`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Status</label>
            <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
              className={`w-full p-2 border rounded-md ${styles.inputBackground}`}>
              <option value="ALL">All Status</option>
              {['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'COMPLETED', 'FORWARDED', 'IN_PROGRESS'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>From Date</label>
            <input type="date" value={filter.dateFrom} onChange={e => setFilter({ ...filter, dateFrom: e.target.value })}
              className={`w-full p-2 border rounded-md ${styles.inputBackground}`} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>To Date</label>
            <input type="date" value={filter.dateTo} onChange={e => setFilter({ ...filter, dateTo: e.target.value })}
              className={`w-full p-2 border rounded-md ${styles.inputBackground}`} />
          </div>
        </div>
      </div>

      {/* Tabs + Table */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        {/* Tab bar */}
        <div className={`border-b ${styles.borderColor} px-6 pt-4`}>
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setExpandedRow(null); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? tab.accent + ' bg-transparent'
                    : `border-transparent ${styles.secondaryText} hover:text-gray-700`
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.key ? tab.bg + ' ' + tab.accent.split(' ')[1] : 'bg-gray-100 text-gray-500'
                }`}>
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table content */}
        <div className="p-0">
          {activeTab === 'all' && <AllTable />}
          {activeTab === 'physician' && (
            <RoleTable
              nameField="referring_physician_name"
              designField="referring_physician_designation"
              roleLabel="Physician On-Duty"
              roleColor="text-blue-700"
              badgeColor="bg-blue-500"
            />
          )}
          {activeTab === 'recommending' && (
            <RoleTable
              nameField="recommending_authority_name"
              designField="recommending_authority_designation"
              roleLabel="Recommending Authority"
              roleColor="text-purple-700"
              badgeColor="bg-purple-500"
            />
          )}
          {activeTab === 'approval' && (
            <RoleTable
              nameField="approval_authority_name"
              designField="approval_authority_designation"
              roleLabel="Approval Authority"
              roleColor="text-green-700"
              badgeColor="bg-green-500"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAssignmentPage;
