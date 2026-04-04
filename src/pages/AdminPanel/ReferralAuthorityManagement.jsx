import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { FaPlus, FaTrash, FaUpload, FaSearch, FaSyncAlt, FaFileExcel, FaDownload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const TYPES = ['PHYSICIAN', 'RECOMMENDING', 'APPROVAL'];
const TYPE_LABELS = { PHYSICIAN: 'Referring Physician', RECOMMENDING: 'Recommending Authority', APPROVAL: 'Approval Authority' };
const TYPE_COLORS = { PHYSICIAN: 'bg-blue-100 text-blue-700', RECOMMENDING: 'bg-purple-100 text-purple-700', APPROVAL: 'bg-green-100 text-green-700' };
const empty = { name: '', designation: '', type: 'PHYSICIAN' };

const ReferralAuthorityManagement = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('list');

  // Excel upload state
  const [excelRows, setExcelRows] = useState([]);   // parsed preview rows
  const [excelErrors, setExcelErrors] = useState([]); // per-row validation errors
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // { count, errors }
  const fileRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.set('type', typeFilter);
      if (search) params.set('search', search);
      const res = await fetch(`${baseUrl}/api/referral-authorities?${params}`, { headers });
      const data = await res.json();
      setRecords(data.data || []);
    } catch { setRecords([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, [typeFilter]);

  const handleSearch = (e) => { e.preventDefault(); fetchRecords(); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.designation.trim()) { setFormError('Name and designation are required.'); return; }
    setSaving(true); setFormError('');
    try {
      const res = await fetch(`${baseUrl}/api/referral-authorities`, { method: 'POST', headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setForm(empty); setTab('list'); fetchRecords();
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this record?')) return;
    await fetch(`${baseUrl}/api/referral-authorities/${id}`, { method: 'DELETE', headers });
    fetchRecords();
  };

  // ── Excel parsing ──────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadResult(null);
    setExcelErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      // Convert to array of objects using first row as headers
      const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const rows = [];
      const errs = [];

      raw.forEach((row, i) => {
        // Normalize keys — accept Name/name/NAME etc.
        const normalize = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.trim().toLowerCase(), String(v).trim()]));
        const r = normalize(row);

        const name = r['name'] || r['full name'] || r['fullname'] || '';
        const designation = r['designation'] || r['desig'] || r['post'] || '';
        const type = (r['type'] || 'PHYSICIAN').toUpperCase();

        const rowErrs = [];
        if (!name) rowErrs.push('Name missing');
        if (!designation) rowErrs.push('Designation missing');
        if (!TYPES.includes(type)) rowErrs.push(`Invalid type "${type}" — use PHYSICIAN, RECOMMENDING or APPROVAL`);

        if (rowErrs.length) errs.push({ row: i + 2, errors: rowErrs }); // +2 for header + 1-index
        rows.push({ name, designation, type, _valid: rowErrs.length === 0 });
      });

      setExcelRows(rows);
      setExcelErrors(errs);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelUpload = async () => {
    const validRows = excelRows.filter(r => r._valid).map(({ name, designation, type }) => ({ name, designation, type }));
    if (validRows.length === 0) return;
    setUploading(true); setUploadResult(null);
    try {
      const res = await fetch(`${baseUrl}/api/referral-authorities/bulk`, { method: 'POST', headers, body: JSON.stringify(validRows) });
      const data = await res.json();
      setUploadResult({ count: data.count, success: data.success, message: data.message });
      if (data.success) { setExcelRows([]); setExcelErrors([]); if (fileRef.current) fileRef.current.value = ''; fetchRecords(); }
    } catch (err) { setUploadResult({ success: false, message: err.message }); }
    finally { setUploading(false); }
  };

  // Download template
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Name', 'Designation', 'Type'],
      ['Dr. Ramesh Kumar', 'Senior Medical Officer', 'PHYSICIAN'],
      ['Dr. Priya Sharma', 'Chief Medical Officer', 'RECOMMENDING'],
      ['Dr. Anil Verma', 'District Health Officer', 'APPROVAL'],
    ]);
    ws['!cols'] = [{ wch: 30 }, { wch: 35 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Referral Authorities');
    XLSX.writeFile(wb, 'referral_authorities_template.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Referral Authority Master</h1>
          <p className="text-sm text-gray-500 mt-1">Manage physicians and authorities used in enquiry form dropdowns</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'list', label: 'Records' },
            { key: 'add', label: '+ Add One' },
            { key: 'excel', label: 'Excel Upload' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition ${tab === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LIST TAB ── */}
      {tab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b flex flex-wrap gap-3 items-center">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or designation..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg"><FaSearch /></button>
            </form>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="ALL">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
            <button onClick={fetchRecords} className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200">
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="overflow-x-auto">
            {records.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                {loading ? 'Loading...' : 'No records found. Add some using the buttons above.'}
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Designation', 'Type', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm font-semibold text-gray-800">{r.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{r.designation}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[r.type]}`}>{TYPE_LABELS[r.type]}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600 text-sm"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── ADD ONE TAB ── */}
      {tab === 'add' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-800 mb-4 uppercase">Add Single Record</h2>
          <form onSubmit={handleAdd} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2">
                {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Dr. Ramesh Kumar" className="w-full border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Designation</label>
              <input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}
                placeholder="Senior Medical Officer" className="w-full border border-gray-200 rounded-lg px-3 py-2" />
            </div>
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                <FaPlus />{saving ? 'Saving...' : 'Add Record'}
              </button>
              <button type="button" onClick={() => setForm(empty)}
                className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200">Clear</button>
            </div>
          </form>
        </div>
      )}

      {/* ── EXCEL UPLOAD TAB ── */}
      {tab === 'excel' && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-800 uppercase flex items-center gap-2">
                <FaFileExcel className="text-green-600" /> Excel Bulk Upload
              </h2>
              <p className="text-sm text-gray-500 mt-1">Upload an .xlsx file with columns: <code className="bg-gray-100 px-1 rounded">Name</code>, <code className="bg-gray-100 px-1 rounded">Designation</code>, <code className="bg-gray-100 px-1 rounded">Type</code></p>
            </div>
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">
              <FaDownload /> Download Template
            </button>
          </div>

          {/* Drop zone */}
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            <FaFileExcel className="text-4xl text-green-500 mb-2" />
            <span className="text-sm font-bold text-gray-600">Click to select Excel file (.xlsx / .xls)</span>
            <span className="text-xs text-gray-400 mt-1">or drag and drop here</span>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
          </label>

          {/* Preview table */}
          {excelRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-gray-700">
                  Preview — {excelRows.filter(r => r._valid).length} valid / {excelRows.length} total rows
                </p>
                {excelErrors.length > 0 && (
                  <span className="text-xs text-red-500 font-bold">{excelErrors.length} rows have errors (will be skipped)</span>
                )}
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-72">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Designation</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {excelRows.map((row, i) => {
                      const rowErr = excelErrors.find(e => e.row === i + 2);
                      return (
                        <tr key={i} className={row._valid ? 'hover:bg-gray-50' : 'bg-red-50'}>
                          <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                          <td className="px-4 py-2 font-medium text-gray-800">{row.name || <span className="text-red-400 italic">missing</span>}</td>
                          <td className="px-4 py-2 text-gray-600">{row.designation || <span className="text-red-400 italic">missing</span>}</td>
                          <td className="px-4 py-2">
                            {TYPES.includes(row.type)
                              ? <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TYPE_COLORS[row.type]}`}>{TYPE_LABELS[row.type]}</span>
                              : <span className="text-red-500 text-xs font-bold">{row.type || 'missing'}</span>}
                          </td>
                          <td className="px-4 py-2">
                            {row._valid
                              ? <FaCheckCircle className="text-green-500" />
                              : <span className="flex items-center gap-1 text-red-500 text-xs"><FaTimesCircle />{rowErr?.errors.join(', ')}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Upload button */}
              <div className="mt-4 flex items-center gap-4">
                <button onClick={handleExcelUpload} disabled={uploading || excelRows.filter(r => r._valid).length === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                  <FaUpload />{uploading ? 'Uploading...' : `Upload ${excelRows.filter(r => r._valid).length} Records`}
                </button>
                <button onClick={() => { setExcelRows([]); setExcelErrors([]); setUploadResult(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200">Clear</button>
              </div>
            </div>
          )}

          {/* Upload result */}
          {uploadResult && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {uploadResult.success
                ? <FaCheckCircle className="text-green-600 text-xl" />
                : <FaTimesCircle className="text-red-600 text-xl" />}
              <p className={`font-bold text-sm ${uploadResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {uploadResult.success ? `${uploadResult.count} records uploaded successfully.` : uploadResult.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralAuthorityManagement;
