import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { FaDownload, FaFileExcel, FaFileCsv, FaFileAlt, FaFilter, FaExclamationTriangle, FaChartBar, FaCheckCircle } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const STATUSES = ['PENDING','FORWARDED','APPROVED','REJECTED','ESCALATED','IN_PROGRESS','COMPLETED','COLLECTOR_APPROVED','DME_APPROVED'];

const StatCard = ({ label, value, color, icon }) => (
  <div className={`${color} rounded-2xl p-5 text-white shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <p className="text-4xl font-black mt-1">{value}</p>
      </div>
      <div className="text-white/30 text-3xl">{icon}</div>
    </div>
  </div>
);

const ExportPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [exporting, setExporting] = useState('');

  const [filter, setFilter] = useState({ status: 'ALL', dateFrom: '', dateTo: '', type: 'ALL' });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseUrl}/api/enquiries`, { headers: { Authorization: `Bearer ${token}` } });
      setEnquiries(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const getFiltered = () => {
    let f = enquiries;
    if (filter.status !== 'ALL') f = f.filter(e => e.status === filter.status);
    if (filter.type !== 'ALL')   f = f.filter(e => e.air_transport_type === filter.type);
    if (filter.dateFrom) f = f.filter(e => new Date(e.created_at) >= new Date(filter.dateFrom));
    if (filter.dateTo)   f = f.filter(e => new Date(e.created_at) <= new Date(filter.dateTo + 'T23:59:59'));
    return f;
  };

  const buildRows = (data) => data.map(e => ({
    'Enquiry ID':             e.enquiry_id,
    'Enquiry Code':           e.enquiry_code || '-',
    'Patient Name':           e.patient_name || '-',
    'Father/Spouse Name':     e.father_spouse_name || '-',
    'Age':                    e.age || '-',
    'Gender':                 e.gender || '-',
    'Address':                e.address || '-',
    'Status':                 e.status || '-',
    'Air Transport Type':     e.air_transport_type || '-',
    'Transportation Category':e.transportation_category || '-',
    'Hospital':               e.hospital?.name || '-',
    'Source Hospital':        e.sourceHospital?.name || '-',
    'District':               e.district?.district_name || '-',
    'Medical Condition':      e.medical_condition || '-',
    'Chief Complaint':        e.chief_complaint || '-',
    'General Condition':      e.general_condition || '-',
    'Vitals':                 e.vitals || '-',
    'ABHA/PM JAY Number':     e.ayushman_card_number || '-',
    'Aadhar Card':            e.aadhar_card_number || '-',
    'PAN Card':               e.pan_card_number || '-',
    'Contact Name':           e.contact_name || '-',
    'Contact Phone':          e.contact_phone || '-',
    'Contact Email':          e.contact_email || '-',
    'Referring Physician':    e.referring_physician_name || '-',
    'Physician Designation':  e.referring_physician_designation || '-',
    'Recommending Authority': e.recommending_authority_name || '-',
    'Approval Authority':     e.approval_authority_name || '-',
    'Ambulance Reg. No.':     e.ambulance_registration_number || '-',
    'Bed Confirmed':          e.bed_availability_confirmed ? 'Yes' : 'No',
    'ALS Arranged':           e.als_ambulance_arranged ? 'Yes' : 'No',
    'Documents Count':        e.documents?.length || 0,
    'Created At':             e.created_at ? new Date(e.created_at).toLocaleString('en-IN') : '-',
    'Updated At':             e.updated_at ? new Date(e.updated_at).toLocaleString('en-IN') : '-',
  }));

  const exportExcel = async () => {
    const data = buildRows(getFiltered());
    if (!data.length) { setError('No records match the current filters.'); return; }
    setExporting('excel');
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Enquiries');
      ws.columns = Object.keys(data[0]).map(k => ({ header: k, key: k, width: Math.max(k.length + 4, 16) }));
      // Header style
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      ws.getRow(1).height = 20;
      ws.addRows(data);
      // Alternate row shading
      for (let i = 2; i <= data.length + 1; i++) {
        if (i % 2 === 0) {
          ws.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F7FF' } };
        }
      }
      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `AirAmbulance_Enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccess(`✓ Exported ${data.length} records as Excel`);
    } catch (e) { setError('Export failed: ' + e.message); }
    finally { setExporting(''); }
  };

  const exportCsv = () => {
    const data = buildRows(getFiltered());
    if (!data.length) { setError('No records match the current filters.'); return; }
    setExporting('csv');
    try {
      const header = Object.keys(data[0]).join(',');
      const rows = data.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
      const csv = [header, ...rows].join('\n');
      saveAs(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), `AirAmbulance_Enquiries_${new Date().toISOString().split('T')[0]}.csv`);
      setSuccess(`✓ Exported ${data.length} records as CSV`);
    } catch (e) { setError('Export failed: ' + e.message); }
    finally { setExporting(''); }
  };

  const filtered = getFiltered();
  const stats = {
    total:     enquiries.length,
    pending:   enquiries.filter(e => e.status === 'PENDING').length,
    approved:  enquiries.filter(e => ['APPROVED','DME_APPROVED','COLLECTOR_APPROVED'].includes(e.status)).length,
    rejected:  enquiries.filter(e => e.status === 'REJECTED').length,
    escalated: enquiries.filter(e => e.status === 'ESCALATED').length,
    free:      enquiries.filter(e => e.air_transport_type === 'Free').length,
    paid:      enquiries.filter(e => e.air_transport_type === 'Paid').length,
    completed: enquiries.filter(e => e.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <FaDownload className="text-blue-600" /> Export Center
        </h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">
          Download enquiry data as Excel or CSV
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
          <FaExclamationTriangle className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-700 font-black">✕</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium">
          <FaCheckCircle className="shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-700 font-black">✕</button>
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Enquiries" value={stats.total}     color="bg-blue-600"   icon={<FaFileAlt />} />
            <StatCard label="Pending"          value={stats.pending}   color="bg-yellow-500" icon={<FaChartBar />} />
            <StatCard label="Approved"         value={stats.approved}  color="bg-green-500"  icon={<FaCheckCircle />} />
            <StatCard label="Rejected"         value={stats.rejected}  color="bg-red-500"    icon={<FaExclamationTriangle />} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Escalated"  value={stats.escalated} color="bg-orange-500"  icon={<FaChartBar />} />
            <StatCard label="Completed"  value={stats.completed} color="bg-gray-500"    icon={<FaCheckCircle />} />
            <StatCard label="Free Seva"  value={stats.free}      color="bg-teal-600"    icon={<FaFileAlt />} />
            <StatCard label="Paid Seva"  value={stats.paid}      color="bg-indigo-600"  icon={<FaFileAlt />} />
          </div>
        </>
      )}

      {/* Filters + Export */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <FaFilter className="text-blue-600 text-sm" />
          <h2 className="font-black text-gray-900 uppercase tracking-tight text-sm">Filter & Export</h2>
        </div>

        {/* Filter row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
            <select
              value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
              className="w-full p-2.5 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Transport Type</label>
            <select
              value={filter.type}
              onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
              className="w-full p-2.5 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="Free">Free Seva</option>
              <option value="Paid">Paid Seva</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">From Date</label>
            <input type="date" value={filter.dateFrom}
              onChange={e => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
              className="w-full p-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">To Date</label>
            <input type="date" value={filter.dateTo}
              onChange={e => setFilter(f => ({ ...f, dateTo: e.target.value }))}
              className="w-full p-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Record count */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-blue-600 text-sm">📊</span>
          <p className="text-sm font-black text-blue-800">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} will be exported
            <span className="text-blue-500 font-medium ml-1">({enquiries.length} total)</span>
          </p>
          <button onClick={fetchData} className="ml-auto text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1">
            ↻ Refresh
          </button>
        </div>

        {/* Export buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Excel */}
          <div className="flex items-center justify-between p-5 bg-green-50 border-2 border-green-100 rounded-2xl hover:border-green-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-100">
                <FaFileExcel className="text-white text-xl" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">Excel (.xlsx)</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Formatted with headers · Color coded rows</p>
              </div>
            </div>
            <button
              onClick={exportExcel}
              disabled={!!exporting || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-100 disabled:opacity-50"
            >
              {exporting === 'excel' ? (
                <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Exporting...</>
              ) : (
                <><FaDownload /> Export</>
              )}
            </button>
          </div>

          {/* CSV */}
          <div className="flex items-center justify-between p-5 bg-blue-50 border-2 border-blue-100 rounded-2xl hover:border-blue-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-100">
                <FaFileCsv className="text-white text-xl" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm">CSV (.csv)</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">UTF-8 encoded · Compatible with all tools</p>
              </div>
            </div>
            <button
              onClick={exportCsv}
              disabled={!!exporting || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
            >
              {exporting === 'csv' ? (
                <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Exporting...</>
              ) : (
                <><FaDownload /> Export</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Columns preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm mb-4">Columns Included in Export</h3>
        <div className="flex flex-wrap gap-2">
          {['Enquiry ID','Enquiry Code','Patient Name','Father/Spouse Name','Age','Gender','Address','Status','Air Transport Type','Transportation Category','Hospital','Source Hospital','District','Medical Condition','Chief Complaint','General Condition','Vitals','ABHA/PM JAY Number','Aadhar Card','PAN Card','Contact Name','Contact Phone','Contact Email','Referring Physician','Physician Designation','Recommending Authority','Approval Authority','Ambulance Reg. No.','Bed Confirmed','ALS Arranged','Documents Count','Created At','Updated At'].map(col => (
            <span key={col} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
