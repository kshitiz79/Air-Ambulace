import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPhoneAlt, FaEnvelope, FaHospital, FaUser, FaGlobe, FaSearch, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';

const BeneficiaryEditPageList = () => {
  const navigate = useNavigate();
  const { t, localize } = useLanguage();
  const [enquiries, setEnquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('FREE'); // 'FREE', 'PAID', 'ALL'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEnquiries = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Error');
        setEnquiries(json.data || []);
      } catch (e) {
        setError((t.errorLoadingEnquiries || 'Error: ') + e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete || 'Are you sure you want to delete this enquiry?')) return;
    setIsDeleting(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/enquiries/${id}`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error');
      setEnquiries(prev => prev.filter(e => e.enquiry_id !== id));
      alert(t.deleteSuccess || 'Deleted successfully');
    } catch (e) {
      setError((t.deleteError || 'Error deleting: ') + e.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (id) => navigate(`/cmho-dashboard/beneficiary-detail-page/${id}`);

  // Helpers to identify air transport type
  const isPaid = (e) => e.air_transport_type === 'Paid';
  const isFree = (e) => e.air_transport_type === 'Free';

  const filteredEnquiries = enquiries.filter((e) => {
    const loc = localize(e);
    const matchesSearch = (loc.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.contact_phone || '').includes(searchTerm);
    if (!matchesSearch) return false;

    if (activeTab === 'PAID') return isPaid(e);
    if (activeTab === 'FREE') return isFree(e);
    return true; // ALL
  });

  // Sort by newest first
  filteredEnquiries.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const countFree = enquiries.filter(e => isFree(e)).length;
  const countPaid = enquiries.filter(e => isPaid(e)).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.enquiryList || 'Beneficiary Enquiries'}</h1>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              {localStorage.getItem('role') === 'CMHO' 
                ? (t.showingYourEnquiries || 'Manage and review your enquiries carefully.') 
                : 'Manage all patient enquiries and their statuses.'}
            </p>
          </div>
          
          <div className="relative w-full md:w-80 shadow-sm rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border shadow-sm outline-none bg-white transition-shadow"
              placeholder={t.search || 'Search by patient name or phone...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex items-center">
              <FaExclamationCircle className="text-red-400 mr-2" />
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 rounded-t-xl overflow-hidden shadow-sm">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('FREE')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'FREE'
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Free <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{countFree}</span>
            </button>
            <button
              onClick={() => setActiveTab('PAID')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'PAID'
                  ? 'border-green-500 text-green-600 bg-green-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              Paid <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{countPaid}</span>
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-semibold text-sm transition-colors ${
                activeTab === 'ALL'
                  ? 'border-gray-500 text-gray-800 bg-gray-100/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Records <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">{enquiries.length}</span>
            </button>
          </nav>
        </div>

        {/* List */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
              <FaHospital className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t.noEnquiriesFound || 'No records found'}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search query.' : `There are no ${activeTab.toLowerCase()} records in the system right now.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredEnquiries.map(enq => {
                const e = localize(enq);
                const isItemPaid = isPaid(enq);
                
                return (
                  <div
                    key={enq.enquiry_id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col md:flex-row"
                  >

                    
                    <div className="p-6 md:p-8 flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-gray-900">{e.patient_name || 'Unknown Patient'}</h2>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isItemPaid ? 'border-green-200 bg-green-50 text-green-700' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
                              <FaCheckCircle className="mr-1.5" />
                              {isItemPaid ? 'Paid Transport' : 'Free Transport'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              Status: {enq.status || 'PENDING'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <FaPhoneAlt size={12} className="text-gray-400" /> {enq.contact_phone || 'N/A'} 
                            <span className="text-gray-300">|</span> 
                            <FaEnvelope size={12} className="text-gray-400" /> {enq.contact_email || 'N/A'}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 flex items-center gap-1 shrink-0 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                           Created: {enq.created_at ? new Date(enq.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                        <div className="flex items-start space-x-3 text-sm">
                          <FaGlobe className="text-indigo-400 mt-1 shrink-0" />
                          <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase">{t.district || 'District'}</span>
                            <span className="font-semibold text-gray-900">{enq.district?.district_name || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 text-sm">
                          <FaHospital className="text-rose-400 mt-1 shrink-0" />
                          <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase">{t.hospitalId || 'Current Hospital'}</span>
                            <span className="font-semibold text-gray-900">{enq.hospital?.name || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 text-sm">
                          <FaHospital className="text-amber-400 mt-1 shrink-0" />
                          <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase">{t.sourceHospitalId || 'Source Hospital'}</span>
                            <span className="font-semibold text-gray-900">{enq.sourceHospital?.name || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 text-sm">
                          <FaGlobe className="text-gray-400 mt-1 shrink-0" />
                          <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase">{t.documents || 'Documents Uploaded'}</span>
                            <span className="font-medium text-gray-900 w-full truncate">
                              {enq.documents && enq.documents.length > 0 ? enq.documents.map(d => d.document_type).join(', ') : 'No documents'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleEdit(enq.enquiry_id)}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <FaEdit className="mr-2" /> {t.edit || 'Edit or View Detail'}
                        </button>
                        <button
                          onClick={() => handleDelete(enq.enquiry_id)}
                          disabled={isDeleting === enq.enquiry_id}
                          className="inline-flex items-center justify-center px-4 py-2 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                        >
                          <FaTrash className="mr-2" /> {isDeleting === enq.enquiry_id ? (t.deleting || 'Deleting...') : (t.delete || 'Delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>





        
      </div>
    </div>
  );
};

export default BeneficiaryEditPageList;
