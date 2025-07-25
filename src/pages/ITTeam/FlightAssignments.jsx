import React, { useState, useEffect } from 'react';
import { 
  FiRefreshCw,
  FiEye,
  FiDownload,
  FiFilter,
  FiSearch,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck
} from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import baseUrl from '../../baseUrl/baseUrl';

const FlightAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/flight-assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssignments(Array.isArray(data) ? data : data.data || []);
      } else {
        console.error('Failed to fetch assignments');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ASSIGNED': {
        color: 'bg-blue-100 text-blue-800',
        icon: <FiClock size={14} />
      },
      'IN_PROGRESS': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FiActivity size={14} />
      },
      'COMPLETED': {
        color: 'bg-green-100 text-green-800',
        icon: <FiCheckCircle size={14} />
      },
      'CANCELLED': {
        color: 'bg-red-100 text-red-800',
        icon: <FiXCircle size={14} />
      }
    };
    
    const config = statusConfig[status] || statusConfig['ASSIGNED'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.color}`}>
        {config.icon}
        <span>{status.replace('_', ' ')}</span>
      </span>
    );
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = !searchTerm || 
      assignment.assignment_id?.toString().includes(searchTerm) ||
      assignment.enquiry?.enquiry_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.ambulance_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: 'assignment_id', 
      label: 'Assignment ID',
      render: (value) => <span className="font-mono font-medium">#{value}</span>
    },
    { 
      key: 'enquiry', 
      label: 'Enquiry Code',
      render: (value) => value?.enquiry_code ? (
        <span className="font-mono text-sm">{value.enquiry_code}</span>
      ) : 'N/A'
    },
    { 
      key: 'ambulance_id', 
      label: 'Ambulance ID',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    { 
      key: 'departure_time', 
      label: 'Departure',
      render: (value) => value ? new Date(value).toLocaleString() : 'Not set'
    },
    { 
      key: 'arrival_time', 
      label: 'Arrival',
      render: (value) => value ? new Date(value).toLocaleString() : 'Not set'
    },
    { 
      key: 'created_at', 
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <FiEye size={16} />
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
          <h1 className="text-2xl font-bold text-gray-900">Flight Assignments</h1>
          <p className="text-gray-600">Monitor all flight assignments and their status</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload className="mr-2" />
            Export
          </button>
          <button
            onClick={fetchAssignments}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search assignments..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiTruck className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiClock className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'ASSIGNED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiActivity className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {assignments.filter(a => a.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredAssignments.length} of {assignments.length} assignments
        </p>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ThemeTable
          data={filteredAssignments}
          columns={columns}
          loading={loading}
          emptyMessage="No flight assignments found"
        />
      </div>
    </div>
  );
};

export default FlightAssignments;