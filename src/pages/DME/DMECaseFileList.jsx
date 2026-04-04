import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiClipboard, FiHome, FiArrowRightCircle ,FiArrowRight } from 'react-icons/fi';
import { FaGlobe } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800', 
  APPROVED: 'bg-green-100 text-green-800',
  COLLECTOR_APPROVED: 'bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200',
  REJECTED: 'bg-red-100 text-red-800', 
  FORWARDED: 'bg-indigo-100 text-indigo-800',
  ESCALATED: 'bg-blue-100 text-blue-800', 
  COMPLETED: 'bg-teal-100 text-teal-800',
};

const DMECaseFileList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t, localize, language } = useLanguage();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/api/enquiries`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setEnquiries(data.data || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetch_();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t.caseFiles || 'Case Files'}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1 italic uppercase tracking-widest">Statewide Monitoring Dashboard</p>
          </div>
          <div className="flex items-center text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm tracking-widest">
            <FaGlobe className="mr-2" />
            Monitoring All Categories: Within Div. + Out of Div. + Out of State
          </div>
        </div>
        {loading && <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>}
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">⚠️ {error}</div>}
        {!loading && enquiries.length === 0 && <div className="text-gray-500 text-center p-6 bg-white rounded-lg shadow"><p>{t.noCaseFilesFound || 'No case files found.'}</p></div>}
        <div className="grid grid-cols-1 gap-4">
          {enquiries.map(enquiry => {
            const e = localize(enquiry);
            const initials = e.patient_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

            return enquiry.enquiry_id ? (
              <div key={enquiry.enquiry_id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="p-4 sm:p-5">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-4">
                        
                        <div>
                           <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight leading-tight">{e.patient_name || t.unknown}</h3>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] font-black tracking-widest text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                {enquiry.enquiry_code}
                              </span>
                              {enquiry.district?.district_name && (
                                <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                                  {enquiry.district.district_name}
                                </span>
                              )}
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-inset shadow-sm flex-shrink-0 ${statusStyles[enquiry.status] || 'bg-slate-100 text-slate-800'}`}>
                          {enquiry.status === 'COLLECTOR_APPROVED' ? (t.collectorApproved || 'Collector Approved') : 
                           enquiry.status === 'DME_APPROVED' ? (t.dmeApproved || 'DME Approved') :
                           (t[enquiry.status?.toLowerCase()] || enquiry.status?.replace(/_/g, ' '))}
                        </span>
                        <Link 
                            to={`/dme-dashboard/case-file/${enquiry.enquiry_id}`}
                            className="p-2 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all border border-slate-100"
                            title={t.viewDetails}
                        >
                            <FiArrowRight size={20} />
                        </Link>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                         <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">{t.condition || 'Medical Condition'}</p>
                         <p className="text-xs font-bold text-slate-800 italic leading-relaxed line-clamp-1">"{e.medical_condition || 'N/A'}"</p>
                      </div>
                      <div className="hidden md:block w-px h-8 bg-slate-200 self-center"></div>
                      <div>
                         <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">{t.hospital || 'Facility Info'}</p>
                         <p className="text-xs font-bold text-slate-800 truncate">{enquiry.hospital?.name || 'N/A'}</p>
                      </div>
                   </div>

                   <div className="mt-4 flex flex-wrap items-start justify-between gap-6 px-1">
                      <div className="flex gap-8">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Demographics</span>
                          <span className="text-sm font-black text-slate-800">{enquiry.age || 'N/A'}Y / {t[enquiry.gender?.toLowerCase()] || enquiry.gender}</span>
                        </div>
                        {enquiry.transportation_category && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transport</span>
                            <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded border border-teal-100 uppercase tracking-tighter">{enquiry.transportation_category}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 border-l border-slate-100 pl-4 sm:pl-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Registration</span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase italic whitespace-nowrap">{formatDate(enquiry.created_at)}</span>
                        </div>
                        {(enquiry.collector_approved_at || enquiry.status !== 'PENDING') && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Div. Sanction</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase italic whitespace-nowrap">{formatDate(enquiry.collector_approved_at || enquiry.updated_at)}</span>
                          </div>
                        )}
                        {(enquiry.dme_approved_at || enquiry.status === 'DME_APPROVED') && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest">State Sanction</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase italic whitespace-nowrap">{formatDate(enquiry.dme_approved_at || enquiry.updated_at)}</span>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default DMECaseFileList;
