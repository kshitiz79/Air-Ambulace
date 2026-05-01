import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiCheckCircle, FiRefreshCw, FiSearch, FiAlertTriangle, FiUser, FiClock, FiLock, FiEdit } from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';
import UpdateStatusModal from './components/UpdateStatusModal';
import DistrictSelector from './components/DistrictSelector';

const ASSIGN_STATUS = {
  ASSIGNED:    { color: 'bg-blue-100 text-blue-800 border-blue-200',      dot: 'bg-blue-500' },
  IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  COMPLETED:   { color: 'bg-green-100 text-green-800 border-green-200',    dot: 'bg-green-500' },
};

const StatusBadge = ({ status }) => {
  const m = ASSIGN_STATUS[status] || { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const EnquiryDropdown = ({ enquiries, value, onChange, disabled }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = enquiries.find(e => e.enquiry_code === value);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = enquiries.filter(e => {
    const q = query.toLowerCase();
    return e.enquiry_code?.toLowerCase().includes(q) ||
      e.patient_name?.toLowerCase().includes(q) ||
      e.father_spouse_name?.toLowerCase().includes(q) ||
      String(e.enquiry_id).includes(q);
  }).slice(0, 20);

  if (disabled && selected) {
    return (
      <div className="w-full flex items-center gap-2 px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 cursor-not-allowed">
        <FiLock size={12} className="text-gray-400 shrink-0" />
        <div>
          <p className="text-sm font-black font-mono text-gray-700">{selected.enquiry_code}</p>
          <p className="text-[10px] text-gray-500">{selected.patient_name}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-100 rounded-xl bg-white cursor-pointer hover:border-blue-400 transition-all">
        {selected ? (
          <div className="min-w-0">
            <p className="text-sm font-black font-mono text-gray-900">{selected.enquiry_code}</p>
            <p className="text-[10px] text-gray-500 truncate">{selected.patient_name}{selected.father_spouse_name ? ` · S/o ${selected.father_spouse_name}` : ''}</p>
          </div>
        ) : <span className="text-gray-400 text-sm">Search by code, patient or father name...</span>}
        <FiSearch className="text-gray-400 shrink-0 ml-2" size={14} />
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
              <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-8 pr-3 py-2 border-2 border-gray-100 rounded-xl text-sm focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-center text-gray-400 text-xs py-5">No enquiries found</p>
              : filtered.map(enq => (
                <div key={enq.enquiry_id}
                  onMouseDown={() => { onChange(enq.enquiry_code); setQuery(''); setOpen(false); }}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-0 ${value === enq.enquiry_code ? 'bg-blue-50' : ''}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black font-mono text-gray-900">{enq.enquiry_code}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${['APPROVED','DME_APPROVED','COLLECTOR_APPROVED'].includes(enq.status) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{enq.status}</span>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold mt-0.5 truncate">{enq.patient_name}</p>
                    {enq.father_spouse_name && <p className="text-[10px] text-gray-400">S/o {enq.father_spouse_name}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[10px] text-gray-400">{enq.district?.district_name || ''}</p>
                    {enq.ambulance_registration_number && (
                      <p className="text-[10px] font-mono font-bold text-blue-600">{enq.ambulance_registration_number}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Progress steps: ASSIGNED → IN_PROGRESS → COMPLETED
const STEPS = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
const STEP_LABELS = { ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };
const STEP_COLORS = { ASSIGNED: '#3b82f6', IN_PROGRESS: '#f59e0b', COMPLETED: '#22c55e' };

const ProgressDots = ({ status }) => {
  const cur = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => {
        const done    = i <= cur;
        const active  = i === cur;
        const color   = STEP_COLORS[s];
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? 'border-transparent text-white' : 'border-gray-200 bg-white'
              } ${active ? 'ring-4 ring-offset-1' : ''}`}
                style={done ? { background: color, ...(active ? { boxShadow: `0 0 0 4px ${color}22` } : {}) } : {}}>
                {done && !active
                  ? <FiCheckCircle size={14} className="text-white" />
                  : active
                    ? <span className="w-2.5 h-2.5 rounded-full bg-white block" />
                    : <span className="w-2 h-2 rounded-full bg-gray-300 block" />
                }
              </div>
              <span className={`text-[8px] font-black mt-1 uppercase tracking-widest ${done ? 'text-gray-700' : 'text-gray-300'}`}>
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-10 mb-4 mx-1 rounded-full transition-all ${i < cur ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const AssignmentCard = ({ assignment, enquiries, onUpdateStatus, onEditAssignment }) => {
  const enq = enquiries.find(e => e.enquiry_id === assignment.enquiry_id);
  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—';
  const accentColor = STEP_COLORS[assignment.status] || '#9ca3af';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Left accent bar */}
      <div className="flex">
        <div className="w-1.5 shrink-0 rounded-l-2xl" style={{ background: accentColor }} />

        <div className="flex-1 p-4">
          {/* Single horizontal row */}
          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">

            {/* 1. Enquiry + patient */}
            <div className="min-w-[140px]">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Enquiry</p>
              <p className="text-sm font-black font-mono text-blue-700 mt-0.5">{enq?.enquiry_code || `ENQ-${assignment.enquiry_id}`}</p>
              <p className="text-xs font-bold text-gray-800 truncate max-w-[140px]">{enq?.patient_name || '—'}</p>
              {enq?.father_spouse_name && <p className="text-[9px] text-gray-400 truncate max-w-[140px]">S/o {enq.father_spouse_name}</p>}
            </div>

            <div className="w-px h-10 bg-gray-100 shrink-0 hidden md:block" />

            {/* 2. Ambulance */}
            <div className="min-w-[90px]">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ambulance</p>
              <p className="text-sm font-black font-mono text-gray-800 mt-0.5">{assignment.ambulance_id}</p>
            </div>

            <div className="w-px h-10 bg-gray-100 shrink-0 hidden md:block" />

            {/* 3. Departure / Arrival */}
            <div className="min-w-[110px]">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Departure</p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">{fmt(assignment.departure_time)}</p>
              {assignment.arrival_time && (
                <>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Arrival</p>
                  <p className="text-xs font-semibold text-green-700">{fmt(assignment.arrival_time)}</p>
                </>
              )}
              {/* Route stops summary */}
              {Array.isArray(assignment.route_stops) && assignment.route_stops.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Via:</span>
                  {assignment.route_stops.map((s, i) => (
                    <span key={i} className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
                      {s.stop_label}: {s.district || '—'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-10 bg-gray-100 shrink-0 hidden md:block" />

            {/* 4. Condition */}
            <div className="min-w-[120px] flex-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Condition</p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5 truncate">{enq?.medical_condition || '—'}</p>
              {assignment.crewMembers?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {assignment.crewMembers.slice(0, 3).map(m => (
                    <span key={m.crew_id} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[9px] font-bold border border-purple-100">
                      {m.role}
                    </span>
                  ))}
                  {assignment.crewMembers.length > 3 && (
                    <span className="text-[9px] text-gray-400 font-bold">+{assignment.crewMembers.length - 3}</span>
                  )}
                </div>
              )}
            </div>

            <div className="w-px h-10 bg-gray-100 shrink-0 hidden md:block" />

            {/* 5. Progress dots */}
            <div className="shrink-0">
              <ProgressDots status={assignment.status} />
            </div>

            <div className="w-px h-10 bg-gray-100 shrink-0 hidden md:block" />

            {/* 6. Action */}
            <div className="shrink-0 flex items-center gap-2">
              <button onClick={() => onEditAssignment(assignment)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 border-2 border-gray-100 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all whitespace-nowrap">
                <FiEdit size={11} /> Edit
              </button>

              {assignment.status !== 'COMPLETED' ? (
                <button onClick={() => onUpdateStatus(assignment)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 whitespace-nowrap">
                  <FiRefreshCw size={11} /> Update
                </button>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 font-black text-[10px] uppercase tracking-widest rounded-xl border border-green-200 whitespace-nowrap">
                  <FiCheckCircle size={11} /> Done
                </span>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const AmbulanceAssignmentPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [availableCrew, setAvailableCrew] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [aircraftFilter, setAircraftFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New assignment modal
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ enquiry_code: '', ambulance_id: '', departure_time: '', crewMembers: [] });
  const [newEnqDetail, setNewEnqDetail] = useState(null);
  const [availableAmbulances, setAvailableAmbulances] = useState([]);

  // Update status modal
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [updateForm, setUpdateForm] = useState({ departure_time: '', arrival_time: '', status: 'IN_PROGRESS' });
  const [medicalSummaryFile, setMedicalSummaryFile] = useState(null);
  const [manifestFile, setManifestFile]             = useState(null);
  const [routeStops, setRouteStops] = useState([]); // [{stop_label, district, city, arrival_time, departure_time, stop_type, purpose}]

  // Edit Assignment Modal
  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ enquiry_code: '', ambulance_id: '', departure_time: '', arrival_time: '', crewMembers: [] });
  const [editEnqDetail, setEditEnqDetail] = useState(null);

  const token = localStorage.getItem('token');
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, eRes, cRes, ambRes] = await Promise.all([
        fetch(`${baseUrl}/api/flight-assignments`, { headers: h }),
        fetch(`${baseUrl}/api/enquiries`, { headers: h }),
        fetch(`${baseUrl}/api/crew-members`, { headers: h }),
        fetch(`${baseUrl}/api/ambulances/available`, { headers: h }),
      ]);
      const aData   = await aRes.json();
      const eData   = await eRes.json();
      const cData   = await cRes.json();
      const ambData = await ambRes.json();
      setAssignments(Array.isArray(aData) ? aData : aData.data || []);
      const eList = Array.isArray(eData) ? eData : eData.data || [];
      setEnquiries(eList);
      setAvailableCrew(Array.isArray(cData) ? cData : cData.data || []);
      setAvailableAmbulances(ambData.data || []);
    } catch { setAssignments([]); }
    finally { setLoading(false); }
  };

  // When enquiry selected in new form, auto-fill ambulance from enquiry
  const handleEnquirySelect = async (code) => {
    setNewForm(f => ({ ...f, enquiry_code: code, ambulance_id: '' }));
    const enq = enquiries.find(e => e.enquiry_code === code);
    if (!enq) { setNewEnqDetail(null); return; }
    try {
      const res = await fetch(`${baseUrl}/api/enquiries/${enq.enquiry_id}`, { headers: h });
      const data = await res.json();
      setNewEnqDetail(data.data || data);
    } catch { setNewEnqDetail(null); }
  };

  // Submit new assignment
  const handleNewSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const enq = enquiries.find(e => e.enquiry_code === newForm.enquiry_code);
      if (!enq) throw new Error('Please select a valid enquiry');

      const isPaid = newEnqDetail?.air_transport_type === 'Paid';
      let ambulanceId = null;

      if (isPaid) {
        // Paid case — user manually picks from available ambulances
        if (!newForm.ambulance_id) throw new Error('Please select an ambulance for this Paid case');
        ambulanceId = newForm.ambulance_id;
      } else {
        // Free case — auto-match by registration number from enquiry
        if (!newEnqDetail?.ambulance_registration_number) {
          throw new Error('No ambulance assigned to this enquiry. Please update the enquiry form first.');
        }
        const ambRes  = await fetch(`${baseUrl}/api/ambulances?limit=500`, { headers: h });
        const ambData = await ambRes.json();
        const matched = (ambData.data || []).find(a => a.registration_number === newEnqDetail.ambulance_registration_number);
        if (!matched) throw new Error(`Ambulance with reg. ${newEnqDetail.ambulance_registration_number} not found or not available.`);
        ambulanceId = matched.ambulance_id;
      }

      const payload = {
        enquiry_id:     enq.enquiry_id,
        ambulance_id:   ambulanceId,
        departure_time: newForm.departure_time || null,
        status:         'ASSIGNED',
        crewMembers:    newForm.crewMembers,
      };

      const res  = await fetch(`${baseUrl}/api/flight-assignments`, { method: 'POST', headers: h, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed');

      setSuccess('Assignment created successfully');
      setShowNew(false);
      setNewForm({ enquiry_code: '', ambulance_id: '', departure_time: '', crewMembers: [] });
      setNewEnqDetail(null);
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Open update status modal
  const openUpdateStatus = (assignment) => {
    setUpdateTarget(assignment);
    setUpdateForm({ departure_time: assignment.departure_time?.slice(0, 16) || '', arrival_time: '', status: assignment.status });
    setMedicalSummaryFile(null);
    setManifestFile(null);
    // Load existing stops or start with empty
    const existing = Array.isArray(assignment.route_stops) ? assignment.route_stops : [];
    setRouteStops(existing.length ? existing : []);
    setError('');
    setShowUpdate(true);
  };

  // Submit status update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (updateForm.status === 'COMPLETED' && !updateForm.arrival_time) {
      setError('Arrival time is required when marking as Completed');
      return;
    }
    setSaving(true); setError('');
    try {
      let res, data;

      if (updateForm.status === 'COMPLETED') {
        // Use multipart/form-data for completion (supports file uploads)
        const fd = new FormData();
        fd.append('arrival_time', updateForm.arrival_time);
        fd.append('route_stops', JSON.stringify(routeStops));
        if (medicalSummaryFile) fd.append('medical_summary', medicalSummaryFile);
        if (manifestFile)       fd.append('manifest', manifestFile);

        res  = await fetch(`${baseUrl}/api/flight-assignments/${updateTarget.assignment_id}/complete`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets multipart boundary
          body: fd,
        });
        data = await res.json();
      } else {
        const payload = {
          departure_time: updateForm.departure_time || null,
          status:         updateForm.status,
          ambulance_id:   updateTarget.ambulance_id,
          route_stops:    routeStops,
        };
        res  = await fetch(`${baseUrl}/api/flight-assignments/${updateTarget.assignment_id}`, {
          method: 'PUT', headers: h, body: JSON.stringify(payload),
        });
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.error || data.message || 'Failed');

      setSuccess(updateForm.status === 'COMPLETED'
        ? 'Flight completed. Documents saved. Ambulance now AVAILABLE.'
        : 'Status updated. Ambulance scheduled RETURNING — available next day at 12:00 IST.');
      setShowUpdate(false);
      setUpdateTarget(null);
      setMedicalSummaryFile(null);
      setManifestFile(null);
      setRouteStops([]);
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Open edit assignment modal
  const openEditAssignment = async (assignment) => {
    setEditTarget(assignment);
    const enq = enquiries.find(e => e.enquiry_id === assignment.enquiry_id);
    
    setEditForm({
      enquiry_code: enq?.enquiry_code || '',
      ambulance_id: assignment.ambulance_id,
      departure_time: assignment.departure_time?.slice(0, 16) || '',
      arrival_time: assignment.arrival_time?.slice(0, 16) || '',
      crewMembers: assignment.crewMembers?.map(c => c.crew_id) || []
    });

    if (assignment.enquiry_id) {
      try {
        const res = await fetch(`${baseUrl}/api/enquiries/${assignment.enquiry_id}`, { headers: h });
        const data = await res.json();
        setEditEnqDetail(data.data || data);
      } catch { setEditEnqDetail(null); }
    }
    
    setError('');
    setShowEdit(true);
  };

  const handleEditEnquirySelect = async (code) => {
    setEditForm(f => ({ ...f, enquiry_code: code, ambulance_id: '' }));
    const enq = enquiries.find(e => e.enquiry_code === code);
    if (!enq) { setEditEnqDetail(null); return; }
    try {
      const res = await fetch(`${baseUrl}/api/enquiries/${enq.enquiry_id}`, { headers: h });
      const data = await res.json();
      setEditEnqDetail(data.data || data);
    } catch { setEditEnqDetail(null); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const enq = enquiries.find(e => e.enquiry_code === editForm.enquiry_code);
      if (!enq) throw new Error('Please select a valid enquiry');

      const isPaid = editEnqDetail?.air_transport_type === 'Paid';
      let ambulanceId = null;

      if (isPaid) {
        if (!editForm.ambulance_id) throw new Error('Please select an ambulance');
        ambulanceId = editForm.ambulance_id;
      } else {
        if (!editEnqDetail?.ambulance_registration_number) {
          throw new Error('No ambulance assigned to this enquiry');
        }
        const ambRes  = await fetch(`${baseUrl}/api/ambulances?limit=500`, { headers: h });
        const ambData = await ambRes.json();
        const matched = (ambData.data || []).find(a => a.registration_number === editEnqDetail.ambulance_registration_number);
        if (!matched) throw new Error(`Ambulance with reg. ${editEnqDetail.ambulance_registration_number} not found.`);
        ambulanceId = matched.ambulance_id;
      }

      const payload = {
        enquiry_id:     enq.enquiry_id,
        ambulance_id:   ambulanceId,
        departure_time: editForm.departure_time || null,
        arrival_time:   editForm.arrival_time || null,
        crewMembers:    editForm.crewMembers,
      };

      const res  = await fetch(`${baseUrl}/api/flight-assignments/${editTarget.assignment_id}`, {
        method: 'PUT', headers: h, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to update assignment');

      setSuccess('Assignment updated successfully');
      setShowEdit(false);
      setEditTarget(null);
      fetchAll();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const stats = {
    total: assignments.length,
    assigned: assignments.filter(a => a.status === 'ASSIGNED').length,
    inProgress: assignments.filter(a => a.status === 'IN_PROGRESS').length,
    completed: assignments.filter(a => a.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-5 p-1">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Ambulance Assignments</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Manage air ambulance flight assignments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={13} /> Refresh
          </button>
          <button onClick={() => { setShowNew(true); setError(''); setNewForm({ enquiry_code: '', departure_time: '', crewMembers: [] }); setNewEnqDetail(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
            <FiPlus size={13} /> New Assignment
          </button>
        </div>
      </div>

      {/* Flight Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Total Flights</p>
              <p className="text-2xl font-black mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-400/30 rounded-xl flex items-center justify-center">
              🚁
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-xs font-bold uppercase tracking-widest">Assigned</p>
              <p className="text-2xl font-black mt-1">{stats.assigned}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-400/30 rounded-xl flex items-center justify-center">
              📋
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">In Progress</p>
              <p className="text-2xl font-black mt-1">{stats.inProgress}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-400/30 rounded-xl flex items-center justify-center">
              ✈️
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-bold uppercase tracking-widest">Completed</p>
              <p className="text-2xl font-black mt-1">{stats.completed}</p>
            </div>
            <div className="w-10 h-10 bg-green-400/30 rounded-xl flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>
      </div>



   

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Flight Filters</h2>
          <button 
            onClick={() => {
              setStatusFilter('ALL');
              setDistrictFilter('ALL');
              setAircraftFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest">
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none bg-white">
              <option value="ALL">All Status</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">District</label>
            <select 
              value={districtFilter} 
              onChange={e => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none bg-white">
              <option value="ALL">All Districts</option>
              {(() => {
                const districts = [...new Set(enquiries.map(e => e.district?.district_name).filter(Boolean))].sort();
                return districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ));
              })()}
            </select>
          </div>

          {/* Aircraft Type Filter */}
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Aircraft</label>
            <select 
              value={aircraftFilter} 
              onChange={e => setAircraftFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none bg-white">
              <option value="ALL">All Aircraft</option>
              {(() => {
                const aircraft = [...new Set(assignments.map(a => a.ambulance?.aircraft_type).filter(Boolean))].sort();
                return aircraft.map(type => (
                  <option key={type} value={type}>{type}</option>
                ));
              })()}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Patient, enquiry code..."
                className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm font-medium">Loading assignments...</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-bold uppercase text-sm tracking-widest">No assignments yet</div>
      ) : (
        <div className="space-y-3">
          {(() => {
            // Apply filters
            let filteredAssignments = assignments;

            // Status filter
            if (statusFilter !== 'ALL') {
              filteredAssignments = filteredAssignments.filter(a => a.status === statusFilter);
            }

            // District filter
            if (districtFilter !== 'ALL') {
              filteredAssignments = filteredAssignments.filter(a => {
                const enq = enquiries.find(e => e.enquiry_id === a.enquiry_id);
                return enq?.district?.district_name === districtFilter;
              });
            }

            // Aircraft filter
            if (aircraftFilter !== 'ALL') {
              filteredAssignments = filteredAssignments.filter(a => a.ambulance?.aircraft_type === aircraftFilter);
            }

            // Search filter
            if (searchQuery.trim()) {
              const query = searchQuery.toLowerCase();
              filteredAssignments = filteredAssignments.filter(a => {
                const enq = enquiries.find(e => e.enquiry_id === a.enquiry_id);
                return (
                  enq?.patient_name?.toLowerCase().includes(query) ||
                  enq?.enquiry_code?.toLowerCase().includes(query) ||
                  enq?.father_spouse_name?.toLowerCase().includes(query) ||
                  a.ambulance?.registration_number?.toLowerCase().includes(query) ||
                  a.ambulance?.aircraft_type?.toLowerCase().includes(query)
                );
              });
            }

            if (filteredAssignments.length === 0) {
              return (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="font-bold uppercase text-sm tracking-widest">No flights match your filters</p>
                  <p className="text-xs mt-2">Try adjusting your search criteria</p>
                </div>
              );
            }

            return filteredAssignments.map(a => (
              <AssignmentCard key={a.assignment_id} assignment={a} enquiries={enquiries} onUpdateStatus={openUpdateStatus} onEditAssignment={openEditAssignment} />
            ));
          })()}
        </div>
      )}

      {/* ── NEW ASSIGNMENT MODAL ─────────────────────────────────────────── */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">🚁</div>
                <div>
                  <h3 className="text-white font-black text-base uppercase tracking-tight">New Assignment</h3>
                  <p className="text-blue-200 text-xs mt-0.5">Select enquiry — ambulance auto-assigned from enquiry</p>
                </div>
              </div>
              <button onClick={() => setShowNew(false)} className="text-white/70 hover:text-white text-xl font-black">x</button>
            </div>

            <form onSubmit={handleNewSubmit} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  <FiAlertTriangle className="shrink-0" /> {error}
                </div>
              )}

              {/* Enquiry */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-3">Step 1 — Select Enquiry</p>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Enquiry <span className="text-red-500">*</span>
                </label>
                <EnquiryDropdown 
                  enquiries={enquiries.filter(e => ['APPROVED','FORWARDED','IN_PROGRESS','ESCALATED','PENDING','COLLECTOR_APPROVED','DME_APPROVED'].includes(e.status))} 
                  value={newForm.enquiry_code} 
                  onChange={handleEnquirySelect} 
                />

                {/* Auto-filled ambulance display */}
                {newEnqDetail && (
                  <div className="mt-3 space-y-3">
                    {/* Enquiry info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        ['Patient',       newEnqDetail.patient_name],
                        ['Father/Spouse', newEnqDetail.father_spouse_name],
                        ['Condition',     newEnqDetail.medical_condition],
                        ['From',          newEnqDetail.sourceHospital?.name],
                        ['To',            newEnqDetail.hospital?.name],
                        ['District',      newEnqDetail.district?.district_name],
                      ].filter(([,v]) => v).map(([l, v]) => (
                        <div key={l} className="bg-white rounded-xl p-2.5 border border-blue-100">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{l}</p>
                          <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate">{v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Transport type badge */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        newEnqDetail.air_transport_type === 'Paid'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {newEnqDetail.air_transport_type} Seva
                      </span>
                    </div>

                    {/* PAID case — manual ambulance picker */}
                    {newEnqDetail.air_transport_type === 'Paid' ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-orange-500 text-sm">🚑</span>
                          <p className="text-[9px] font-black text-orange-700 uppercase tracking-widest">
                            Paid Case — Select Ambulance Manually
                          </p>
                        </div>
                        <p className="text-[10px] text-orange-600 font-medium mb-3">
                          Paid enquiries don't have a pre-assigned ambulance. Select one from the available fleet below.
                        </p>
                        {availableAmbulances.length === 0 ? (
                          <div className="p-3 bg-white border border-orange-200 rounded-xl text-center">
                            <p className="text-xs text-gray-500 font-medium">No ambulances currently available</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {availableAmbulances.map(amb => (
                              <label key={amb.ambulance_id}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  newForm.ambulance_id === amb.ambulance_id
                                    ? 'bg-orange-100 border-orange-400 shadow-sm'
                                    : 'bg-white border-gray-100 hover:border-orange-300'
                                }`}>
                                <input type="radio" name="ambulance_id" className="sr-only"
                                  checked={newForm.ambulance_id === amb.ambulance_id}
                                  onChange={() => setNewForm(f => ({ ...f, ambulance_id: amb.ambulance_id }))} />
                                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                  newForm.ambulance_id === amb.ambulance_id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                                }`}>
                                  {newForm.ambulance_id === amb.ambulance_id && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-black font-mono text-gray-900">{amb.ambulance_id}</span>
                                    <span className="text-[9px] font-mono text-blue-600 font-bold">{amb.registration_number}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 truncate">{amb.aircraft_type} · {amb.base_location}</p>
                                </div>
                                <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 shrink-0">
                                  AVAILABLE
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : newEnqDetail.ambulance_registration_number ? (
                      /* FREE case — locked auto-assigned */
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <FiLock size={12} className="text-green-600 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-green-700 uppercase tracking-widest">Ambulance Auto-Assigned (Locked)</p>
                          <p className="text-sm font-black font-mono text-green-800">{newEnqDetail.ambulance_registration_number}</p>
                        </div>
                      </div>
                    ) : (
                      /* FREE case — no ambulance in enquiry */
                      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <FiAlertTriangle size={12} className="text-orange-600 shrink-0" />
                        <p className="text-xs text-orange-700 font-medium">No ambulance assigned in this enquiry. Please update the enquiry form first.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Departure time */}
              <div className="bg-green-50/40 border border-green-100 rounded-2xl p-4">
                <p className="text-[9px] font-black text-green-700 uppercase tracking-widest mb-3">Step 2 — Departure Time from Base Location</p>
                
                {/* Base Location Info */}
                {newEnqDetail?.air_transport_type === 'Paid' && newForm.ambulance_id && (
                  <div className="mb-3 p-3 bg-white rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">🏠</span>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Base Location</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      {(() => {
                        const selectedAmb = availableAmbulances.find(a => a.ambulance_id === newForm.ambulance_id);
                        return selectedAmb?.base_location || 'Air Ambulance Base';
                      })()}
                    </p>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      Aircraft: {(() => {
                        const selectedAmb = availableAmbulances.find(a => a.ambulance_id === newForm.ambulance_id);
                        return selectedAmb?.aircraft_type || 'Helicopter';
                      })()} • Reg: {(() => {
                        const selectedAmb = availableAmbulances.find(a => a.ambulance_id === newForm.ambulance_id);
                        return selectedAmb?.registration_number || 'N/A';
                      })()}
                    </p>
                  </div>
                )}
                
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  <FiClock className="inline mr-1" size={10} /> Departure Time from Base
                </label>
                <div className="flex gap-2">
                  <input type="datetime-local" value={newForm.departure_time}
                    onChange={e => setNewForm(f => ({ ...f, departure_time: e.target.value }))}
                    className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-green-500 focus:outline-none transition-all" />
                  <button type="button"
                    onClick={() => {
                      const now = new Date();
                      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                      setNewForm(f => ({ ...f, departure_time: now.toISOString().slice(0, 16) }));
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-xs font-bold">
                    Now
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-[9px] text-green-600 font-medium flex items-center gap-1">
                    <span>🚁</span> Setting departure time will schedule ambulance as RETURNING
                  </p>
                  <p className="text-[9px] text-green-600 font-medium flex items-center gap-1">
                    <span>⏰</span> Auto-available next day at 12:00 IST after mission completion
                  </p>
                  <p className="text-[9px] text-gray-500 font-medium flex items-center gap-1">
                    <span>📍</span> Helicopter departs from base → pickup location → dropoff location → return to base
                  </p>
                </div>
              </div>

              {/* Crew */}
              <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black text-purple-700 uppercase tracking-widest">Step 3 — Select Crew</p>
                  {newForm.crewMembers.length > 0 && (
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-[9px] font-black rounded-full">{newForm.crewMembers.length} selected</span>
                  )}
                </div>
                {availableCrew.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No crew members found</p>
                ) : (
                  <div className="space-y-3">
                    {['PILOT','DOCTOR','NURSE','PARAMEDIC','OTHER'].map(role => {
                      const crew = availableCrew.filter(c => c.role === role);
                      if (!crew.length) return null;
                      return (
                        <div key={role}>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{role}S</p>
                          <div className="grid grid-cols-2 gap-2">
                            {crew.map(m => {
                              const checked = newForm.crewMembers.includes(m.crew_id);
                              return (
                                <label key={m.crew_id} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${checked ? 'bg-purple-50 border-purple-400' : 'bg-white border-gray-100 hover:border-purple-200'}`}>
                                  <input type="checkbox" className="sr-only" checked={checked}
                                    onChange={ev => {
                                      const next = ev.target.checked ? [...newForm.crewMembers, m.crew_id] : newForm.crewMembers.filter(id => id !== m.crew_id);
                                      setNewForm(f => ({ ...f, crewMembers: next }));
                                    }} />
                                  <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-400'}`} />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-800 truncate">{m.full_name}</p>
                                    <p className="text-[9px] text-gray-400">{m.status}</p>
                                  </div>
                                  {checked && <FiCheckCircle className="text-purple-500 shrink-0 ml-auto" size={12} />}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowNew(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><FiCheckCircle size={13} /> Create Assignment</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPDATE STATUS MODAL ──────────────────────────────────────────── */}
      <UpdateStatusModal
        showUpdate={showUpdate}
        updateTarget={updateTarget}
        updateForm={updateForm}
        setUpdateForm={setUpdateForm}
        routeStops={routeStops}
        setRouteStops={setRouteStops}
        medicalSummaryFile={medicalSummaryFile}
        setMedicalSummaryFile={setMedicalSummaryFile}
        manifestFile={manifestFile}
        setManifestFile={setManifestFile}
        enquiries={enquiries}
        error={error}
        handleUpdateSubmit={handleUpdateSubmit}
        setShowUpdate={setShowUpdate}
        saving={saving}
      />

      {/* ── EDIT ASSIGNMENT MODAL ────────────────────────────────────────── */}

      {showEdit && editTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-5 rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">✏️</div>
                <div>
                  <h3 className="text-white font-black text-base uppercase tracking-tight">Edit Assignment</h3>
                  <p className="text-gray-200 text-xs mt-0.5">Assignment #{editTarget.assignment_id} • Enquiry #{editForm.enquiry_code}</p>
                </div>
              </div>
              <button onClick={() => setShowEdit(false)} className="text-white/70 hover:text-white text-xl font-black">x</button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  <FiAlertTriangle className="shrink-0" /> {error}
                </div>
              )}

              {/* Current Assignment Status */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Current Assignment Status</p>
                  <StatusBadge status={editTarget.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Assignment ID</p>
                    <p className="text-sm font-black font-mono text-gray-900">#{editTarget.assignment_id}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Current Aircraft</p>
                    <p className="text-sm font-bold text-gray-900">{editTarget.ambulance?.registration_number || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Departure</p>
                    <p className="text-xs font-medium text-gray-700">
                      {editTarget.departure_time ? new Date(editTarget.departure_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Not set'}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-blue-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Arrival</p>
                    <p className="text-xs font-medium text-gray-700">
                      {editTarget.arrival_time ? new Date(editTarget.arrival_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enquiry Selection */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-3">Step 1 — Enquiry Details</p>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Enquiry <span className="text-red-500">*</span>
                </label>
                <EnquiryDropdown 
                  enquiries={enquiries.filter(e => ['APPROVED','FORWARDED','IN_PROGRESS','ESCALATED','PENDING','COLLECTOR_APPROVED','DME_APPROVED'].includes(e.status) || e.enquiry_id === editTarget.enquiry_id)} 
                  value={editForm.enquiry_code} 
                  onChange={handleEditEnquirySelect} 
                />

                {/* Enquiry Details Display */}
                {editEnqDetail && (
                  <div className="mt-4 space-y-4">
                    {/* Patient & Medical Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        ['Patient Name', editEnqDetail.patient_name],
                        ['Father/Spouse', editEnqDetail.father_spouse_name],
                        ['Age', `${editEnqDetail.age || 'N/A'} years`],
                        ['Gender', editEnqDetail.gender],
                        ['Medical Condition', editEnqDetail.medical_condition],
                        ['District', editEnqDetail.district?.district_name],
                      ].filter(([,v]) => v).map(([l, v]) => (
                        <div key={l} className="bg-white rounded-xl p-3 border border-blue-100">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{l}</p>
                          <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate" title={v}>{v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Hospital Route */}
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Hospital Route</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-[9px] font-bold text-green-600 uppercase">From (Pickup)</p>
                          <p className="text-sm font-bold text-gray-800">{editEnqDetail.sourceHospital?.name || 'Source Hospital'}</p>
                        </div>
                        <div className="text-blue-500 text-lg">→</div>
                        <div className="flex-1">
                          <p className="text-[9px] font-bold text-blue-600 uppercase">To (Dropoff)</p>
                          <p className="text-sm font-bold text-gray-800">{editEnqDetail.hospital?.name || 'Destination Hospital'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Transport Type & Ambulance */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        editEnqDetail.air_transport_type === 'Paid'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {editEnqDetail.air_transport_type} Service
                      </span>
                      {editEnqDetail.ambulance_registration_number && (
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-black uppercase">
                          Reg: {editEnqDetail.ambulance_registration_number}
                        </span>
                      )}
                    </div>

                    {/* PAID case — manual ambulance picker */}
                    {editEnqDetail.air_transport_type === 'Paid' ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-orange-500 text-sm">🚑</span>
                          <p className="text-[9px] font-black text-orange-700 uppercase tracking-widest">
                            Paid Case — Select Ambulance Manually
                          </p>
                        </div>
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {[
                            ...availableAmbulances.filter(a => a.ambulance_id !== editForm.ambulance_id),
                            ...(availableAmbulances.find(a => a.ambulance_id === editForm.ambulance_id) ? [] : [{
                              ambulance_id: editTarget.ambulance_id,
                              registration_number: enquiries.find(e => e.enquiry_id === editTarget.enquiry_id)?.ambulance_registration_number || 'Current',
                              aircraft_type: 'Assigned',
                              status: 'CURRENT'
                            }])
                          ].map(amb => (
                            <label key={amb.ambulance_id}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                editForm.ambulance_id === amb.ambulance_id
                                  ? 'bg-orange-100 border-orange-400 shadow-sm'
                                  : 'bg-white border-gray-100 hover:border-orange-300'
                              }`}>
                              <input type="radio" name="edit_ambulance_id" className="sr-only"
                                checked={editForm.ambulance_id === amb.ambulance_id}
                                onChange={() => setEditForm(f => ({ ...f, ambulance_id: amb.ambulance_id }))} />
                              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                editForm.ambulance_id === amb.ambulance_id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                              }`}>
                                {editForm.ambulance_id === amb.ambulance_id && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black font-mono text-gray-900">{amb.ambulance_id}</span>
                                  <span className="text-[9px] font-mono text-blue-600 font-bold">{amb.registration_number}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 truncate">{amb.aircraft_type} {amb.base_location ? `· ${amb.base_location}` : ''}</p>
                              </div>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                                amb.status === 'CURRENT' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'
                              }`}>
                                {amb.status === 'CURRENT' ? 'SELECTED' : 'AVAILABLE'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : editEnqDetail.ambulance_registration_number ? (
                      /* FREE case — locked auto-assigned */
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <FiLock size={12} className="text-green-600 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-green-700 uppercase tracking-widest">Ambulance Auto-Assigned (Locked)</p>
                          <p className="text-sm font-black font-mono text-green-800">{editEnqDetail.ambulance_registration_number}</p>
                        </div>
                      </div>
                    ) : (
                      /* FREE case — no ambulance in enquiry */
                      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <FiAlertTriangle size={12} className="text-orange-600 shrink-0" />
                        <p className="text-xs text-orange-700 font-medium">No ambulance assigned in this enquiry.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Timing */}
              <div className="bg-green-50/40 border border-green-100 rounded-2xl p-4">
                <p className="text-[9px] font-black text-green-700 uppercase tracking-widest mb-3">Step 2 — Flight Timing</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Departure Time</label>
                    <input type="datetime-local" value={editForm.departure_time}
                      onChange={e => setEditForm(f => ({ ...f, departure_time: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-green-500 focus:outline-none transition-all bg-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Arrival Time</label>
                    <input type="datetime-local" value={editForm.arrival_time}
                      onChange={e => setEditForm(f => ({ ...f, arrival_time: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-green-500 focus:outline-none transition-all bg-white" />
                  </div>
                </div>
              </div>

              {/* Crew */}
              <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black text-purple-700 uppercase tracking-widest">Step 3 — Select Crew</p>
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-[9px] font-black rounded-full">{editForm.crewMembers.length} selected</span>
                </div>
                <div className="space-y-3">
                  {['PILOT','DOCTOR','NURSE','PARAMEDIC','OTHER'].map(role => {
                    // Show all crew in edit mode, but highlight selected ones
                    const crew = availableCrew.filter(c => c.role === role);
                    // Also include currently selected crew who might be marked as BUSY
                    const currentOfThisRole = editTarget.crewMembers?.filter(m => m.role === role && !crew.find(c => c.crew_id === m.crew_id)) || [];
                    const allToShow = [...crew, ...currentOfThisRole];
                    
                    if (!allToShow.length) return null;
                    return (
                      <div key={role}>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{role}S</p>
                        <div className="grid grid-cols-2 gap-2">
                          {allToShow.map(m => {
                            const checked = editForm.crewMembers.includes(m.crew_id);
                            const isCurrent = editTarget.crewMembers?.find(cm => cm.crew_id === m.crew_id);
                            return (
                              <label key={m.crew_id} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${checked ? 'bg-purple-50 border-purple-400' : 'bg-white border-gray-100 hover:border-purple-200'}`}>
                                <input type="checkbox" className="sr-only" checked={checked}
                                  onChange={ev => {
                                    const next = ev.target.checked ? [...editForm.crewMembers, m.crew_id] : editForm.crewMembers.filter(id => id !== m.crew_id);
                                    setEditForm(f => ({ ...f, crewMembers: next }));
                                  }} />
                                <div className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? 'bg-blue-500' : (m.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-400')}`} />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-800 truncate">{m.full_name}</p>
                                  <p className="text-[9px] text-gray-400">{isCurrent ? 'Current' : m.status}</p>
                                </div>
                                {checked && <FiCheckCircle className="text-purple-500 shrink-0 ml-auto" size={12} />}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-gray-800 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-md shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> saving...</> : <><FiCheckCircle size={13} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AmbulanceAssignmentPage;
