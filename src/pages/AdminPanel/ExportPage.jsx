
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { 
  FaDownload, 
  FaFileExcel, 
  FaFileCsv, 
  FaFileAlt, 
  FaCalendarAlt,
  FaFilter,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChartBar,
  FaEye
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const ExportPage = () => {
  const styles = useThemeStyles();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState({});
  
  const [filter, setFilter] = useState({
    status: 'ALL',
    dateFrom: '',
    dateTo: ''
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalEnquiries: 0,
    pendingEnquiries: 0,
    approvedEnquiries: 0,
    rejectedEnquiries: 0
  });

  // Fetch enquiries data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      const enquiryRes = await axios.get(`${baseUrl}/api/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enquiryData = enquiryRes.data.data || [];
      
      setEnquiries(enquiryData);
      
      // Calculate statistics
      calculateStats(enquiryData);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate dashboard statistics
  const calculateStats = (enquiryData) => {
    const stats = {
      totalEnquiries: enquiryData.length,
      pendingEnquiries: enquiryData.filter(e => e.status === 'PENDING').length,
      approvedEnquiries: enquiryData.filter(e => e.status === 'APPROVED').length,
      rejectedEnquiries: enquiryData.filter(e => e.status === 'REJECTED').length
    };
    setDashboardStats(stats);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Filter enquiries based on current filters
  const getFilteredEnquiries = () => {
    let filtered = enquiries;

    if (filter.status !== 'ALL') {
      filtered = filtered.filter(e => e.status === filter.status);
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(e => new Date(e.created_at) >= new Date(filter.dateFrom));
    }

    if (filter.dateTo) {
      filtered = filtered.filter(e => new Date(e.created_at) <= new Date(filter.dateTo));
    }

    return filtered;
  };

  // Export Enquiries to Excel
  const exportEnquiriesToExcel = async (format = 'excel') => {
    setExportLoading({ ...exportLoading, enquiries: true });
    try {
      const filteredData = getFilteredEnquiries();
      const data = filteredData.map((enquiry) => ({
        'Enquiry ID': enquiry.enquiry_id,
        'Enquiry Code': enquiry.enquiry_code || '-',
        'Patient Name': enquiry.patient_name,
        'Status': enquiry.status,
        'Hospital': enquiry.hospital?.name || enquiry.hospital?.hospital_name || '-',
        'Source Hospital': enquiry.sourceHospital?.name || enquiry.sourceHospital?.hospital_name || '-',
        'District': enquiry.district?.district_name || '-',
        'Medical Condition': enquiry.medical_condition || '-',
        'Ayushman Card Number': enquiry.ayushman_card_number || '-',
        'Aadhar Card Number': enquiry.aadhar_card_number || '-',
        'PAN Card Number': enquiry.pan_card_number || '-',
        'Contact Name': enquiry.contact_name || '-',
        'Contact Phone': enquiry.contact_phone || '-',
        'Contact Email': enquiry.contact_email || '-',
        'Father/Spouse Name': enquiry.father_spouse_name || '-',
        'Age': enquiry.age || '-',
        'Gender': enquiry.gender || '-',
        'Address': enquiry.address || '-',
        'Chief Complaint': enquiry.chief_complaint || '-',
        'General Condition': enquiry.general_condition || '-',
        'Vitals': enquiry.vitals || '-',
        'Transportation Category': enquiry.transportation_category || '-',
        'Air Transport Type': enquiry.air_transport_type || '-',
        'Submitted By User ID': enquiry.submitted_by_user_id || '-',
        'Created At': new Date(enquiry.created_at).toLocaleString(),
        'Updated At': new Date(enquiry.updated_at).toLocaleString(),
        'Documents Count': enquiry.documents?.length || 0,
      }));

      if (format === 'csv') {
        const csvContent = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Enquiries_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Enquiries');
        
        if (data.length > 0) {
          worksheet.columns = Object.keys(data[0]).map((key) => ({ 
            header: key, 
            key,
            width: key.length > 15 ? 20 : 15
          }));
          worksheet.addRows(data);
          
          // Style the header row
          worksheet.getRow(1).font = { bold: true };
          worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6F3FF' }
          };
        }
        
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
      
      setSuccess(`Enquiries exported successfully! (${data.length} records)`);
    } catch (error) {
      setError('Failed to export enquiries: ' + error.message);
    } finally {
      setExportLoading({ ...exportLoading, enquiries: false });
    }
  };

  if (loading && enquiries.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-8`}>
          <div className="animate-pulse">
            <div className={`h-8 ${styles.loadingShimmer} rounded mb-6`}></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-24 ${styles.loadingShimmer} rounded`}></div>
              ))}
            </div>
            <div className={`h-64 ${styles.loadingShimmer} rounded`}></div>
          </div>
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading export data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
                <FaDownload className="mr-3 text-blue-600" />
                Enquiries Export Center
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                Export enquiry data in various formats
              </p>
            </div>
           
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Enquiries</p>
              <p className="text-3xl font-bold">{dashboardStats.totalEnquiries}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaFileAlt className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending Enquiries</p>
              <p className="text-3xl font-bold">{dashboardStats.pendingEnquiries}</p>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 rounded-full p-3">
              <FaChartBar className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Approved Enquiries</p>
              <p className="text-3xl font-bold">{dashboardStats.approvedEnquiries}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaFileAlt className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Rejected Enquiries</p>
              <p className="text-3xl font-bold">{dashboardStats.rejectedEnquiries}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <FaChartBar className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Enquiries Export */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
            <FaFileAlt className="mr-2 text-blue-600" />
            Enquiries Export
          </h2>
          <p className={`text-sm ${styles.secondaryText} mt-1`}>
            Export enquiry data with filtering options
          </p>
        </div>
        
        <div className="p-6">
          {/* Filters */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium ${styles.primaryText} mb-3`}>Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Status</label>
                <select
                  name="status"
                  value={filter.status}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ESCALATED">Escalated</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FORWARDED">Forwarded</option>
                  <option value="IN_PROGRESS">In Progress</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>From Date</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filter.dateFrom}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>To Date</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filter.dateTo}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                />
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaFileExcel className="text-green-600 text-2xl mr-3" />
                <div>
                  <h4 className="font-medium text-gray-800">Excel Format</h4>
                  <p className="text-sm text-gray-600">Export as .xlsx file with formatting</p>
                </div>
              </div>
              <button
                onClick={() => exportEnquiriesToExcel('excel')}
                disabled={exportLoading.enquiries}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
              >
                <FaDownload className="mr-2" />
                {exportLoading.enquiries ? 'Exporting...' : 'Export Excel'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaFileCsv className="text-blue-600 text-2xl mr-3" />
                <div>
                  <h4 className="font-medium text-gray-800">CSV Format</h4>
                  <p className="text-sm text-gray-600">Export as .csv file for data analysis</p>
                </div>
              </div>
              <button
                onClick={() => exportEnquiriesToExcel('csv')}
                disabled={exportLoading.enquiries}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                <FaDownload className="mr-2" />
                {exportLoading.enquiries ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className={`text-sm ${styles.secondaryText}`}>
              <FaEye className="inline mr-1" />
              Records to export: {getFilteredEnquiries().length} of {enquiries.length}
            </p>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Enquiries</h2>
          <button
            onClick={exportEnquiriesToExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            disabled={loading || enquiries.length === 0}
          >
            Export Enquiries to Excel
          </button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading ? (
          <p className="text-center text-gray-500">Loading enquiries...</p>
        ) : enquiries.length === 0 ? (
          <p className="text-center text-gray-500">No enquiries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 text-sm">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Patient Name</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Hospital</th>
                  <th className="p-3 text-left">Source Hospital</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Medical Condition</th>
                  <th className="p-3 text-left">Contact Name</th>
                  <th className="p-3 text-left">Contact Phone</th>
                  <th className="p-3 text-left">Contact Email</th>
                  <th className="p-3 text-left">Documents</th>
                  <th className="p-3 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.enquiry_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{enquiry.enquiry_id}</td>
                    <td className="p-3">{enquiry.patient_name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          enquiry.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : enquiry.status === 'FORWARDED'
                            ? 'bg-blue-100 text-blue-800'
                            : enquiry.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : enquiry.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : enquiry.status === 'ESCALATED'
                            ? 'bg-orange-100 text-orange-800'
                            : enquiry.status === 'IN_PROGRESS'
                            ? 'bg-purple-100 text-purple-800'
                            : enquiry.status === 'COMPLETED'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="p-3">{enquiry.hospital?.name || '-'}</td>
                    <td className="p-3">{enquiry.sourceHospital?.name || '-'}</td>
                    <td className="p-3">{enquiry.district?.district_name || '-'}</td>
                    <td className="p-3">{enquiry.medical_condition || '-'}</td>
                    <td className="p-3">{enquiry.contact_name || '-'}</td>
                    <td className="p-3">{enquiry.contact_phone || '-'}</td>
                    <td className="p-3">{enquiry.contact_email || '-'}</td>
                    <td className="p-3">
                      {enquiry.documents?.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {enquiry.documents.map((doc) => (
                            <li key={doc.document_id}>
                              {doc.document_type}: <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3">{new Date(enquiry.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportPage;