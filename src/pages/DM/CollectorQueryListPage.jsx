import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';
import { FiMessageSquare, FiClock, FiUser, FiArrowRight, FiCheckCircle, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

const CollectorQueryListPage = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { t, language } = useLanguage();

  // Fetch all queries raised by this Collector
  const fetchQueries = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/api/case-queries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const queryData = response.data.data || response.data || [];
      setQueries(Array.isArray(queryData) ? queryData : []);
      
    } catch (err) {
      console.error('Failed to fetch queries:', err);
      setError((t.errorLoadingData || 'Error loading queries') + ': ' + (err.response?.data?.message || err.message));
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter queries based on search term
  const filteredQueries = queries.filter(q => 
    (q.query_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.enquiry?.enquiry_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.enquiry?.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.query_text || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status Badge Helper
  const getStatusBadge = (query) => {
    if (query.response_text) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <FiCheckCircle className="mr-1" />
          {t.responded || 'Responded'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">
        <FiClock className="mr-1" />
        {t.pendingResponse || 'Awaiting Response'}
      </span>
    );
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header - Compact */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <FiMessageSquare className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Sent Queries to CMHO</h1>
                <p className="text-xs text-slate-500 font-medium">Tracking all clarifications requested for case files</p>
              </div>
            </div>
            <button
              onClick={fetchQueries}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900 transition-all font-semibold"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              <span>{t.refresh || 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                    type="text"
                    placeholder="Search by ID, Patient name or Enquiry code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between px-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-lg font-bold text-slate-900">{queries.length}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between px-4">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending</span>
                <span className="text-lg font-bold text-slate-900">{queries.filter(q => !q.response_text).length}</span>
            </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 translate-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold text-sm tracking-widest uppercase">{t.loadingQueries || 'Loading Queries...'}</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-bold mb-2">{error}</p>
            <button onClick={fetchQueries} className="text-red-600 underline text-sm font-bold uppercase">{t.tryAgain || 'Try Again'}</button>
          </div>
        ) : filteredQueries.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredQueries.map((query) => (
              <div key={query.query_id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="p-4 sm:p-5">
                   {/* Card Header Info */}
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                           ID
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-slate-900">Query #{query.query_code || query.query_id}</h3>
                           <p className="text-[11px] text-slate-500 font-medium">Sent on {formatDate(query.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(query)}
                        <Link 
                            to={`/collector-dashboard/case-file/${query.enquiry_id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View Patient Details"
                        >
                            <FiArrowRight size={18} />
                        </Link>
                      </div>
                   </div>

                   {/* Case Mini Summary */}
                   <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div>
                            <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Enquiry Code</p>
                            <p className="text-xs font-bold text-slate-800">{query.enquiry?.enquiry_code || 'N/A'}</p>
                         </div>
                         <div className="w-px h-6 bg-slate-200"></div>
                         <div>
                            <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Patient Name</p>
                            <p className="text-xs font-bold text-slate-800">{query.enquiry?.patient_name || 'N/A'}</p>
                         </div>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        query.enquiry?.status === 'APPROVED' ? 'text-green-600 bg-green-50' :
                        query.enquiry?.status === 'REJECTED' ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-100'
                      }`}>
                         {query.enquiry?.status}
                      </span>
                   </div>

                   {/* Query Text */}
                   <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                         <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                            <FiUser size={12} />
                         </div>
                         <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1 italic">Your Query</p>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">{query.query_text}</p>
                         </div>
                      </div>

                      {/* Response Text */}
                      {query.response_text ? (
                        <div className="flex items-start space-x-3 pt-1">
                           <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                              <FiCheckCircle size={12} />
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest italic">CMHO Response</p>
                                <span className="text-[9px] font-medium text-slate-400 italic font-mono">{formatDate(query.responded_at)}</span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100">{query.response_text}</p>
                           </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 pt-2 px-1">
                           <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                           <p className="text-[10px] font-black italic text-amber-500 uppercase tracking-widest">Waiting for CMHO clarification...</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <FiMessageSquare className="mx-auto text-4xl text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-600">No Queries Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">You haven't sent any queries yet or no matches found for your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorQueryListPage;
