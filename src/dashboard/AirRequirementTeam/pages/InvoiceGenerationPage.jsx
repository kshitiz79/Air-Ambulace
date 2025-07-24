import React, { useState, useEffect } from 'react';
import { FiPlus, FiDownload, FiEye, FiDollarSign, FiFileText, FiCalendar } from 'react-icons/fi';
import ThemeTable from '../../../components/Common/ThemeTable';
import ThemeButton from '../../../components/Common/ThemeButton';
import ThemeInput from '../../../components/Common/ThemeInput';

const InvoiceGenerationPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    enquiry_id: '',
    amount: '',
    invoice_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // Simulate API call
      const mockData = [
        {
          invoice_id: 1,
          enquiry_id: 12345,
          amount: 147500,
          invoice_date: '2024-01-15',
          status: 'PAID',
          created_at: '2024-01-15 10:00:00',
          enquiry: {
            patient_name: 'John Doe'
          }
        },
        {
          invoice_id: 2,
          enquiry_id: 12346,
          amount: 115640,
          invoice_date: '2024-01-15',
          status: 'PENDING',
          created_at: '2024-01-15 14:30:00',
          enquiry: {
            patient_name: 'Sarah Wilson'
          }
        }
      ];
      setInvoices(mockData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const amount = parseFloat(formData.amount) || 0;
    return {
      amount
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        status: 'PENDING'
      };
      
      console.log('Creating invoice:', invoiceData);
      setShowModal(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleDownload = (invoice) => {
    // Simulate PDF download
    console.log('Downloading invoice:', invoice.invoice_id);
    alert(`Downloading invoice ${invoice.invoice_id}`);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const columns = [
    { key: 'invoice_id', label: 'Invoice ID' },
    { key: 'enquiry_id', label: 'Case ID' },
    { 
      key: 'enquiry', 
      label: 'Patient Name',
      render: (value) => value?.patient_name || 'N/A'
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value) => `₹${value.toLocaleString()}`
    },
    { 
      key: 'invoice_date', 
      label: 'Invoice Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleDownload(row)}
            className="text-blue-600 hover:text-blue-800"
            title="Download PDF"
          >
            <FiDownload size={16} />
          </button>
          <button
            className="text-green-600 hover:text-green-800"
            title="View Details"
          >
            <FiEye size={16} />
          </button>
        </div>
      )
    }
  ];

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Generation</h1>
          <p className="text-gray-600">Create and manage invoices for air ambulance services</p>
        </div>
        <ThemeButton
          onClick={() => {
            setSelectedInvoice(null);
            setFormData({
              enquiry_id: '',
              amount: '',
              invoice_date: new Date().toISOString().split('T')[0]
            });
            setShowModal(true);
          }}
          className="flex items-center space-x-2"
        >
          <FiPlus size={16} />
          <span>Generate Invoice</span>
        </ThemeButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiFileText className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiDollarSign className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCalendar className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {invoices.filter(inv => inv.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiDollarSign className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                {invoices.filter(inv => inv.status === 'PAID').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ThemeTable
          data={invoices}
          columns={columns}
          loading={loading}
          emptyMessage="No invoices found"
        />
      </div>

      {/* Invoice Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6">Generate New Invoice</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Invoice Information</h4>
                  
                  <ThemeInput
                    label="Case/Enquiry ID"
                    type="number"
                    value={formData.enquiry_id}
                    onChange={(e) => setFormData({...formData, enquiry_id: e.target.value})}
                    required
                  />
                  
                  <ThemeInput
                    label="Invoice Amount (₹)"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                  
                  <ThemeInput
                    label="Invoice Date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                    required
                  />
                </div>

                {/* Invoice Summary */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Invoice Summary</h4>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span>₹{totals.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>• Amount as per Ayushman Bharat scheme</p>
                      <p>• Invoice will be generated with PENDING status</p>
                      <p>• Payment can be updated later</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Note:</h5>
                    <p className="text-sm text-blue-800">
                      This invoice is generated under the Ayushman Bharat scheme for air ambulance services. 
                      The amount should reflect the approved rates as per government guidelines.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t">
                <ThemeButton type="submit" className="flex-1">
                  Generate Invoice
                </ThemeButton>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

export default InvoiceGenerationPage;