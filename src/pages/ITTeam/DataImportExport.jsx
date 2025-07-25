import React, { useState } from 'react';
import { 
  FiUpload, 
  FiDownload, 
  FiFileText, 
  FiDatabase,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiRefreshCw
} from 'react-icons/fi';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const DataImportExport = () => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const dataTypes = [
    {
      id: 'districts',
      name: 'Districts',
      description: 'Import/Export district data with state information',
      icon: <FiDatabase className="text-blue-600" size={24} />,
      sampleFields: ['district_name', 'state', 'district_code', 'population', 'area_sq_km'],
      endpoint: '/api/districts'
    },
    {
      id: 'hospitals',
      name: 'Hospitals',
      description: 'Import/Export hospital data with contact details',
      icon: <FiFileText className="text-green-600" size={24} />,
      sampleFields: ['name', 'address', 'district_id', 'contact_number', 'email', 'hospital_type'],
      endpoint: '/api/hospitals'
    },
    {
      id: 'ambulances',
      name: 'Ambulances',
      description: 'Import/Export ambulance fleet data',
      icon: <FiFileText className="text-purple-600" size={24} />,
      sampleFields: ['ambulance_id', 'aircraft_type', 'registration_number', 'status', 'base_location'],
      endpoint: '/api/ambulances'
    },
    {
      id: 'users',
      name: 'Users',
      description: 'Import/Export user accounts and roles',
      icon: <FiFileText className="text-orange-600" size={24} />,
      sampleFields: ['username', 'email', 'full_name', 'role', 'district_id'],
      endpoint: '/api/users'
    },
    {
      id: 'enquiries',
      name: 'Enquiries',
      description: 'Export enquiry data (Import not recommended)',
      icon: <FiFileText className="text-red-600" size={24} />,
      sampleFields: ['enquiry_code', 'patient_name', 'medical_condition', 'status', 'priority'],
      endpoint: '/api/enquiries',
      exportOnly: true
    }
  ];

  const handleFileUpload = async (dataType, file) => {
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress({ ...uploadProgress, [dataType.id]: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dataType', dataType.id);

      const token = localStorage.getItem('token');
      
      // Simulate progress for demo (replace with actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [dataType.id]: Math.min((prev[dataType.id] || 0) + 10, 90)
        }));
      }, 200);

      const response = await fetch(`${baseUrl}/api/data/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress({ ...uploadProgress, [dataType.id]: 100 });

      if (response.ok) {
        const result = await response.json();
        setUploadResults({
          ...uploadResults,
          [dataType.id]: {
            success: true,
            message: `Successfully imported ${result.imported || 0} records`,
            details: result
          }
        });
      } else {
        const error = await response.json();
        setUploadResults({
          ...uploadResults,
          [dataType.id]: {
            success: false,
            message: error.message || 'Import failed',
            details: error
          }
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResults({
        ...uploadResults,
        [dataType.id]: {
          success: false,
          message: 'Upload failed: ' + error.message,
          details: error
        }
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setUploadProgress({ ...uploadProgress, [dataType.id]: 0 });
      }, 3000);
    }
  };

  const handleExport = async (dataType) => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${baseUrl}/api/data/export/${dataType.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType.id}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`${dataType.name} data exported successfully!`);
      } else {
        const error = await response.json();
        alert('Export failed: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = (dataType) => {
    // Create a simple CSV template
    const headers = dataType.sampleFields.join(',');
    const sampleRow = dataType.sampleFields.map(() => 'sample_data').join(',');
    const csvContent = `${headers}\n${sampleRow}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataType.id}_template.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Import/Export</h1>
          <p className="text-gray-600">Import data from Excel/CSV files or export existing data</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiAlertTriangle className="text-blue-600 mt-1" size={20} />
          <div>
            <h4 className="font-medium text-blue-800">Important Instructions</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Download the template file before importing to ensure correct format</li>
              <li>• Supported file formats: .xlsx, .xls, .csv</li>
              <li>• Large files may take several minutes to process</li>
              <li>• Always backup your data before importing</li>
              <li>• Duplicate entries will be skipped or updated based on unique identifiers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataTypes.map((dataType) => (
          <div key={dataType.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Card Header */}
            <div className="flex items-center space-x-3 mb-4">
              {dataType.icon}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{dataType.name}</h3>
                <p className="text-sm text-gray-600">{dataType.description}</p>
              </div>
            </div>

            {/* Sample Fields */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Fields:</h4>
              <div className="flex flex-wrap gap-1">
                {dataType.sampleFields.slice(0, 3).map((field) => (
                  <span key={field} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {field}
                  </span>
                ))}
                {dataType.sampleFields.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{dataType.sampleFields.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {uploadProgress[dataType.id] > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress[dataType.id]}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[dataType.id]}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Upload Result */}
            {uploadResults[dataType.id] && (
              <div className={`mb-4 p-3 rounded-lg ${
                uploadResults[dataType.id].success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {uploadResults[dataType.id].success ? (
                    <FiCheckCircle className="text-green-600" size={16} />
                  ) : (
                    <FiXCircle className="text-red-600" size={16} />
                  )}
                  <span className={`text-sm font-medium ${
                    uploadResults[dataType.id].success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {uploadResults[dataType.id].message}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {/* Download Template */}
              <button
                onClick={() => downloadTemplate(dataType)}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiDownload className="mr-2" size={16} />
                Download Template
              </button>

              {/* Import Section */}
              {!dataType.exportOnly && (
                <div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileUpload(dataType, e.target.files[0])}
                    className="hidden"
                    id={`file-upload-${dataType.id}`}
                    disabled={isProcessing}
                  />
                  <label
                    htmlFor={`file-upload-${dataType.id}`}
                    className={`w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                      isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FiUpload className="mr-2" size={16} />
                    Import Data
                  </label>
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={() => handleExport(dataType)}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <FiRefreshCw className="mr-2 animate-spin" size={16} />
                ) : (
                  <FiDownload className="mr-2" size={16} />
                )}
                Export Data
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Operations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              dataTypes.filter(dt => !dt.exportOnly).forEach(dt => {
                downloadTemplate(dt);
              });
            }}
            className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiDownload className="mr-2" size={16} />
            Download All Templates
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('This will export all data types. Continue?')) {
                dataTypes.forEach(dt => {
                  setTimeout(() => handleExport(dt), Math.random() * 1000);
                });
              }
            }}
            disabled={isProcessing}
            className={`flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiDownload className="mr-2" size={16} />
            Export All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataImportExport;