import React, { useState } from 'react';
import { 
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiRefreshCw,
  FiFileText,
  FiUser,
  FiTruck,
  FiMapPin,
  FiCalendar
} from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const AdvancedSearch = () => {
  const [searchType, setSearchType] = useState('enquiries');
  const [searchCriteria, setSearchCriteria] = useState({
    keyword: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    priority: '',
    district: '',
    hospital: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const searchTypes = [
    {
      id: 'enquiries',
      name: 'Enquiries',
      icon: <FiFileText className="text-blue-600" size={20} />,
      description: 'Search through all enquiries by patient name, medical condition, or enquiry code'
    },
    {
      id: 'users',
      name: 'Users',
      icon: <FiUser className="text-green-600" size={20} />,
      description: 'Search system users by name, email, role, or district'
    },
    {
      id: 'ambulances',
      name: 'Ambulances',
      icon: <FiTruck className="text-purple-600" size={20} />,
      description: 'Search ambulance fleet by ID, registration, type, or location'
    },
    {
      id: 'hospitals',
      name: 'Hospitals',
      icon: <FiMapPin className="text-orange-600" size={20} />,
      description: 'Search hospitals by name, type, district, or services'
    }
  ];

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(searchCriteria).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`${baseUrl}/api/search/${searchType}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(Array.isArray(data) ? data : data.data || []);
        setTotalResults(data.total || (Array.isArray(data) ? data.length : data.data?.length || 0));
      } else {
        console.error('Search failed');
        setResults([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (results.length === 0) {
      alert('No results to export');
      return;
    }

    // Convert results to CSV
    const headers = Object.keys(results[0]).join(',');
    const csvContent = [
      headers,
      ...results.map(row => 
        Object.values(row).map(value => 
          typeof value === 'object' ? JSON.stringify(value) : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${searchType}_search_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getColumnsForType = (type) => {
    switch (type) {
      case 'enquiries':
        return [
          { key: 'enquiry_code', label: 'Enquiry Code', render: (value) => <span className="font-mono">{value}</span> },
          { key: 'patient_name', label: 'Patient Name' },
          { key: 'medical_condition', label: 'Medical Condition' },
          { key: 'status', label: 'Status' },
          { key: 'created_at', label: 'Created', render: (value) => new Date(value).toLocaleDateString() },
          { key: 'actions', label: 'Actions', render: () => <FiEye className="text-blue-600 cursor-pointer" size={16} /> }
        ];
      case 'users':
        return [
          { key: 'username', label: 'Username', render: (value) => <span className="font-mono">{value}</span> },
          { key: 'full_name', label: 'Full Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'created_at', label: 'Created', render: (value) => new Date(value).toLocaleDateString() },
          { key: 'actions', label: 'Actions', render: () => <FiEye className="text-blue-600 cursor-pointer" size={16} /> }
        ];
      case 'ambulances':
        return [
          { key: 'ambulance_id', label: 'Ambulance ID', render: (value) => <span className="font-mono">{value}</span> },
          { key: 'aircraft_type', label: 'Aircraft Type' },
          { key: 'registration_number', label: 'Registration', render: (value) => <span className="font-mono">{value}</span> },
          { key: 'status', label: 'Status' },
          { key: 'base_location', label: 'Base Location' },
          { key: 'actions', label: 'Actions', render: () => <FiEye className="text-blue-600 cursor-pointer" size={16} /> }
        ];
      case 'hospitals':
        return [
          { key: 'name', label: 'Hospital Name' },
          { key: 'hospital_type', label: 'Type' },
          { key: 'address', label: 'Address' },
          { key: 'contact_number', label: 'Contact' },
          { key: 'emergency_services', label: 'Emergency', render: (value) => value ? '✅' : '❌' },
          { key: 'actions', label: 'Actions', render: () => <FiEye className="text-blue-600 cursor-pointer" size={16} /> }
        ];
      default:
        return [];
    }
  };

  const resetSearch = () => {
    setSearchCriteria({
      keyword: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      priority: '',
      district: '',
      hospital: ''
    });
    setResults([]);
    setTotalResults(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
          <p className="text-gray-600">Search across all system data with advanced filters</p>
        </div>
        <div className="flex items-center space-x-3">
          {results.length > 0 && (
            <button
              onClick={exportResults}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiDownload className="mr-2" />
              Export Results
            </button>
          )}
        </div>
      </div>

      {/* Search Type Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Search Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {searchTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => setSearchType(type.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                searchType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                {type.icon}
                <h4 className="font-medium text-gray-900">{type.name}</h4>
              </div>
              <p className="text-sm text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search Criteria */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FiFilter className="mr-2" />
          Search Criteria
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {/* Keyword Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keyword
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchCriteria.keyword}
                onChange={(e) => setSearchCriteria({...searchCriteria, keyword: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter search keyword..."
              />
            </div>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={searchCriteria.dateFrom}
                onChange={(e) => setSearchCriteria({...searchCriteria, dateFrom: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={searchCriteria.dateTo}
                onChange={(e) => setSearchCriteria({...searchCriteria, dateTo: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={searchCriteria.status}
              onChange={(e) => setSearchCriteria({...searchCriteria, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {searchType === 'enquiries' && (
                <>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ESCALATED">Escalated</option>
                  <option value="COMPLETED">Completed</option>
                </>
              )}
              {searchType === 'ambulances' && (
                <>
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_USE">In Use</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Search Actions */}
        <div className="flex items-center space-x-4">
          <ThemeButton
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <FiRefreshCw className="animate-spin" size={16} />
            ) : (
              <FiSearch size={16} />
            )}
            <span>Search</span>
          </ThemeButton>
          
          <button
            onClick={resetSearch}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Search Results */}
      {(results.length > 0 || loading) && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results ({totalResults} found)
              </h3>
              <div className="text-sm text-gray-600">
                Searching in: <span className="font-medium">{searchTypes.find(t => t.id === searchType)?.name}</span>
              </div>
            </div>
          </div>
          
          <ThemeTable
            data={results}
            columns={getColumnsForType(searchType)}
            loading={loading}
            emptyMessage={`No ${searchType} found matching your criteria`}
          />
        </div>
      )}

      {/* Search Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Search Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use keywords to search across multiple fields simultaneously</li>
          <li>• Combine date ranges with other filters for more precise results</li>
          <li>• Leave fields empty to search all records of the selected type</li>
          <li>• Export results to CSV for further analysis</li>
          <li>• Use the reset button to clear all search criteria</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedSearch;