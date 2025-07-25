import React, { useState, useEffect } from 'react';
import { FiFileText, FiCheckCircle, FiClock, FiUser, FiDownload, FiEye, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const CaseCloseFile = () => {
  const [cases, setCases] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeFormData, setCloseFormData] = useState({
    closure_reason: '',
    final_remarks: '',
    documents_submitted: false,
    payment_cleared: false,
    patient_feedback: '',
    closure_notes: ''
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch enquiries, case closures, and invoices in parallel
      const [enquiriesRes, closuresRes, invoicesRes] = await Promise.all([
        fetch(`${baseUrl}/api/enquiries`, { headers }),
        fetch(`${baseUrl}/api/case-closures`, { headers }).catch(() => ({ ok: false })),
        fetch(`${baseUrl}/api/invoices`, { headers }).catch(() => ({ ok: false }))
      ]);

      if (!enquiriesRes.ok) {
        throw new Error('Failed to fetch enquiries');
      }

      const enquiriesData = await enquiriesRes.json();
      const closuresData = closuresRes.ok ? await closuresRes.json() : { data: [] };
      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : { data: [] };

      // Process data
      const enquiriesList = Array.isArray(enquiriesData) ? enquiriesData : enquiriesData.data || [];
      const closuresList = Array.isArray(closuresData) ? closuresData : closuresData.data || [];
      const invoicesList = Array.isArray(invoicesData) ? invoicesData : invoicesData.data || [];

      // Create lookup maps
      const closureMap = {};
      closuresList.forEach(closure => {
        closureMap[closure.enquiry_id] = closure;
      });

      const invoiceMap = {};
      invoicesList.forEach(invoice => {
        invoiceMap[invoice.enquiry_id] = invoice;
      });

      // Transform enquiries to case format for closure management
      const transformedCases = enquiriesList
        .filter(enquiry => enquiry.status === 'COMPLETED' || enquiry.status === 'IN_PROGRESS')
        .map(enquiry => {
          const closure = closureMap[enquiry.enquiry_id];
          const invoice = invoiceMap[enquiry.enquiry_id];
          
          return {
            enquiry_id: enquiry.enquiry_id,
            enquiry_code: enquiry.enquiry_code || `ENQ${enquiry.enquiry_id}`,
            patient_name: enquiry.patient_name,
            service_type: 'Air Ambulance',
            pickup_location: enquiry.sourceHospital?.name || enquiry.sourceHospital?.hospital_name || 'Source Hospital',
            drop_location: enquiry.hospital?.name || enquiry.hospital?.hospital_name || 'Destination Hospital',
            service_date: enquiry.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: enquiry.status,
            closure_status: closure?.closure_status || 'PENDING',
            total_amount: invoice?.amount || 150000, // Default amount if no invoice
            payment_status: invoice?.status === 'PAID' ? 'PAID' : 'PENDING',
            assigned_crew: 'Air Ambulance Crew', // Could be enhanced with actual crew data
            completion_date: enquiry.updated_at || enquiry.created_at,
            closure_date: closure?.closure_date || null,
            documents_required: ['Medical Report', 'Flight Log', 'Invoice', 'Patient Feedback'],
            documents_submitted: enquiry.documents?.map(doc => doc.document_type) || [],
            // Additional enquiry data
            medical_condition: enquiry.medical_condition,
            contact_phone: enquiry.contact_phone,
            contact_name: enquiry.contact_name,
            district: enquiry.district,
            air_transport_type: enquiry.air_transport_type,
            closure_details: closure
          };
        });

      setCases(transformedCases);
      setEnquiries(enquiriesList);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError('Failed to load cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchCases();
  };

  const handleCloseCase = async (e) => {
    e.preventDefault();
    try {
      const closureData = {
        enquiry_id: selectedCase.enquiry_id,
        ...closeFormData,
        closure_date: new Date().toISOString(),
        closed_by: localStorage.getItem('user_id')
      };
      
      console.log('Closing case:', closureData);
      setShowCloseModal(false);
      fetchCases();
    } catch (error) {
      console.error('Error closing case:', error);
    }
  };

  const getClosureStatusBadge = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CLOSED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      'PAID': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'OVERDUE': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const calculateDocumentProgress = (required, submitted) => {
    return Math.round((submitted.length / required.length) * 100);
  };

  const columns = [
    { 
      key: 'enquiry_code', 
      label: 'Enquiry Code',
      render: (value, row) => (
        <div>
          <p className="font-mono text-sm">{value}</p>
          <p className="text-xs text-gray-500">{row.patient_name}</p>
        </div>
      )
    },
    { key: 'service_type', label: 'Service Type' },
    { 
      key: 'total_amount', 
      label: 'Amount',
      render: (value) => `₹${value.toLocaleString()}`
    },
    { 
      key: 'payment_status', 
      label: 'Payment',
      render: (value) => getPaymentStatusBadge(value)
    },
    { 
      key: 'closure_status', 
      label: 'Closure Status',
      render: (value) => getClosureStatusBadge(value)
    },
    { 
      key: 'completion_date', 
      label: 'Completed',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedCase(row);
              setCloseFormData({
                closure_reason: '',
                final_remarks: '',
                documents_submitted: row.documents_submitted.length === row.documents_required.length,
                payment_cleared: row.payment_status === 'PAID',
                patient_feedback: '',
                closure_notes: ''
              });
              setShowCloseModal(true);
            }}
            className="text-blue-600 hover:text-blue-800"
            disabled={row.closure_status === 'CLOSED'}
          >
            <FiFileText size={16} />
          </button>
          <button className="text-green-600 hover:text-green-800">
            <FiEye size={16} />
          </button>
          <button className="text-purple-600 hover:text-purple-800">
            <FiDownload size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Close File</h1>
          <p className="text-gray-600">Manage case closures and final documentation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="text-red-600" size={20} />
            <div>
              <h4 className="font-medium text-red-800">Error Loading Cases</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={refreshData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiFileText className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiClock className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Pending Closure</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.closure_status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Closed Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.closure_status === 'CLOSED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiUser className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Avg Closure Time</p>
              <p className="text-2xl font-bold text-gray-900">2.5 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ThemeTable
          data={cases}
          columns={columns}
          loading={loading}
          emptyMessage="No cases found"
        />
      </div>

      {/* Case Closure Modal */}
      {showCloseModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Close Case - #{selectedCase.enquiry_id}</h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Case Summary */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Case Summary</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">{selectedCase.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{selectedCase.service_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-medium text-right">
                      {selectedCase.pickup_location} → {selectedCase.drop_location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{selectedCase.total_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span>{getPaymentStatusBadge(selectedCase.payment_status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">
                      {new Date(selectedCase.completion_date).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Status */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Document Status</h4>
                
                <div className="space-y-3">
                  {selectedCase.documents_required.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{doc}</span>
                      {selectedCase.documents_submitted.includes(doc) ? (
                        <FiCheckCircle className="text-green-600" size={16} />
                      ) : (
                        <FiClock className="text-yellow-600" size={16} />
                      )}
                    </div>
                  ))}
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Document Progress</span>
                      <span>{calculateDocumentProgress(selectedCase.documents_required, selectedCase.documents_submitted)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${calculateDocumentProgress(selectedCase.documents_required, selectedCase.documents_submitted)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Closure Form */}
            <form onSubmit={handleCloseCase} className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Closure Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Closure Reason
                  </label>
                  <select
                    value={closeFormData.closure_reason}
                    onChange={(e) => setCloseFormData({...closeFormData, closure_reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select reason</option>
                    <option value="SERVICE_COMPLETED">Service Completed Successfully</option>
                    <option value="PATIENT_TRANSFERRED">Patient Successfully Transferred</option>
                    <option value="DOCUMENTATION_COMPLETE">All Documentation Complete</option>
                    <option value="PAYMENT_CLEARED">Payment Cleared</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="documents_submitted"
                      checked={closeFormData.documents_submitted}
                      onChange={(e) => setCloseFormData({...closeFormData, documents_submitted: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="documents_submitted" className="text-sm text-gray-700">
                      All required documents submitted
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="payment_cleared"
                      checked={closeFormData.payment_cleared}
                      onChange={(e) => setCloseFormData({...closeFormData, payment_cleared: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="payment_cleared" className="text-sm text-gray-700">
                      Payment cleared and verified
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Feedback
                </label>
                <textarea
                  value={closeFormData.patient_feedback}
                  onChange={(e) => setCloseFormData({...closeFormData, patient_feedback: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Patient or family feedback about the service..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Remarks
                </label>
                <textarea
                  value={closeFormData.final_remarks}
                  onChange={(e) => setCloseFormData({...closeFormData, final_remarks: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Final remarks about the case completion..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closure Notes
                </label>
                <textarea
                  value={closeFormData.closure_notes}
                  onChange={(e) => setCloseFormData({...closeFormData, closure_notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Additional notes for case closure..."
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t">
                <ThemeButton 
                  type="submit" 
                  className="flex-1"
                  disabled={!closeFormData.documents_submitted || !closeFormData.payment_cleared}
                >
                  Close Case
                </ThemeButton>
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseCloseFile;