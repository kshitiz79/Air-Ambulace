import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiClipboard, FiHome, FiArrowRightCircle ,FiArrowRight } from 'react-icons/fi';
import { FaMapMarkerAlt } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';

// Define badge styles for different statuses
const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-500/20',
  APPROVED: 'bg-green-100 text-green-800 ring-green-500/20',
  REJECTED: 'bg-red-100 text-red-800 ring-red-500/20',
  FORWARDED: 'bg-purple-100 text-purple-800 ring-purple-500/20',
  ESCALATED: 'bg-blue-100 text-blue-800 ring-blue-500/20',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 ring-indigo-500/20',
  COMPLETED: 'bg-teal-100 text-teal-800 ring-teal-500/20',
};

const CaseFileListPage = () => {
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
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || t.errorLoadingEnquiries);
        }
        setEnquiries(data.data || []);
        setError('');
      } catch (err) {
        setError(t.errorLoadingEnquiries + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, [t]);

  // Get the Collector's assigned district name from local storage
  const districtName = localStorage.getItem('district_name') || '';

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t.caseFiles}</h1>
          <div className="flex items-center text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
            <FaMapMarkerAlt className="mr-2" />
            {districtName ? `${districtName} district` : 'Your district'} — Within & Out of Division cases
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label={t.loadingEnquiries}></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md" role="alert">
            ⚠️ {error}
          </div>
        )}

        {!loading && enquiries.length === 0 && (
          <div className="text-gray-500 text-center p-6 bg-white rounded-lg shadow">
            <p>{t.noCaseFilesFound}.</p>
          </div>
        )}

        {/* List Content */}
        <div className="grid grid-cols-1 gap-4">
          {enquiries.map((enquiry) => {
            const e = localize(enquiry);
            const initials = e.patient_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
            
            return enquiry.enquiry_id ? (
              <div key={enquiry.enquiry_id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="p-4 sm:p-5">
                   {/* Card Header Info */}
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-4">
                      
                        <div>
                           <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-tight">{e.patient_name || t.unknown}</h3>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] font-black tracking-widest text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                {enquiry.enquiry_code}
                              </span>
                              {enquiry.air_transport_type && (
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${enquiry.air_transport_type === 'Free' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {enquiry.air_transport_type}
                                </span>
                              )}
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-inset shadow-sm flex-shrink-0 ${statusStyles[enquiry.status] || 'bg-slate-100 text-slate-800 ring-slate-200'}`}>
                          {t[enquiry.status?.toLowerCase()] || enquiry.status?.replace(/_/g, ' ') || t.unknown}
                        </span>
                        <Link 
                            to={`/collector-dashboard/case-file/${enquiry.enquiry_id}`}
                            className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-100"
                            title={t.viewDetails}
                        >
                            <FiArrowRight size={20} />
                        </Link>
                      </div>
                   </div>

                   {/* Case Summary Box */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                         <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">{t.condition || 'Medical Condition'}</p>
                         <p className="text-xs font-bold text-slate-800 italic leading-relaxed line-clamp-1">"{e.medical_condition || 'N/A'}"</p>
                      </div>
                      <div className="hidden md:block w-px h-8 bg-slate-200 self-center"></div>
                      <div>
                         <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mb-1">{t.destinationHospital || 'Destination Hospital'}</p>
                         <p className="text-xs font-bold text-slate-800 truncate">{enquiry.hospital?.name || 'N/A'}</p>
                      </div>
                   </div>

                   {/* Demographics & Action */}
                   <div className="mt-4 flex flex-wrap items-start justify-between gap-6 px-1">
                      <div className="flex gap-8">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Demographics</span>
                          <span className="text-xs font-bold text-slate-700">{enquiry.age || 'N/A'} Yrs / {t[enquiry.gender?.toLowerCase()] || enquiry.gender}</span>
                        </div>
                        {enquiry.transportation_category && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 uppercase tracking-tighter">{enquiry.transportation_category}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-6 border-l border-slate-100 pl-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Submitted At</span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase italic whitespace-nowrap leading-tight">{formatDate(enquiry.created_at)}</span>
                        </div>
                        {(enquiry.collector_approved_at || ['APPROVED', 'COLLECTOR_APPROVED', 'DME_APPROVED'].includes(enquiry.status)) && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Divisional Approval</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase italic whitespace-nowrap leading-tight">{formatDate(enquiry.collector_approved_at || enquiry.updated_at)}</span>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            ) : null
          })}
        </div>
      </div>
    </div>
  );
};

export default CaseFileListPage;