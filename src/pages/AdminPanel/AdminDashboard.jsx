import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Dummy data
const dummyDistricts = [
  { district_id: '1', name: 'District 1' },
  { district_id: '2', name: 'District 2' },
  { district_id: '3', name: 'District 3' },
];

const dummyUsers = [
  { user_id: 1, username: 'admin1', full_name: 'Admin User', email: 'admin1@example.com', phone: '1234567890', role: 'ADMIN', district_id: '1', district: { district_id: '1', name: 'District 1' } },
  { user_id: 2, username: 'cmo1', full_name: 'CMO User', email: 'cmo1@example.com', phone: '0987654321', role: 'CMOUSER', district_id: '2', district: { district_id: '2', name: 'District 2' } },
  { user_id: 3, username: 'beneficiary1', full_name: 'Beneficiary User', email: 'beneficiary1@example.com', phone: '1122334455', role: 'BENEFICIARY', district_id: null, district: null },
  { user_id: 4, username: 'sdm1', full_name: 'SDM User', email: 'sdm1@example.com', phone: '5566778899', role: 'SDM', district_id: '3', district: { district_id: '3', name: 'District 3' } },
];

const dummyHospitals = [
  { hospital_id: 1, name: 'City Hospital', district_id: '1', district: { district_id: '1', name: 'District 1' }, hospital_type: 'PUBLIC', contact_phone: '1112223333' },
  { hospital_id: 2, name: 'General Hospital', district_id: '2', district: { district_id: '2', name: 'District 2' }, hospital_type: 'PRIVATE', contact_phone: '4445556666' },
  { hospital_id: 3, name: 'Community Clinic', district_id: '3', district: { district_id: '3', name: 'District 3' }, hospital_type: 'PUBLIC', contact_phone: '7778889999' },
];

const dummyEnquiries = [
  {
    enquiry_id: 1,
    patient_name: 'John Doe',
    status: 'PENDING',
    hospital_id: 1,
    hospital: { name: 'City Hospital' },
    district_id: '1',
    district: { name: 'District 1' },
    created_at: '2025-06-20T10:00:00Z',
    submitted_by_user_id: 2,
  },
  {
    enquiry_id: 2,
    patient_name: 'Jane Smith',
    status: 'APPROVED',
    hospital_id: 2,
    hospital: { name: 'General Hospital' },
    district_id: '2',
    district: { name: 'District 2' },
    created_at: '2025-06-21T12:00:00Z',
    submitted_by_user_id: 3,
  },
  {
    enquiry_id: 3,
    patient_name: 'Alice Brown',
    status: 'REJECTED',
    hospital_id: 3,
    hospital: { name: 'Community Clinic' },
    district_id: '3',
    district: { name: 'District 3' },
    created_at: '2025-06-22T14:00:00Z',
    submitted_by_user_id: 4,
  },
  {
    enquiry_id: 4,
    patient_name: 'Bob Wilson',
    status: 'FORWARDED',
    hospital_id: 1,
    hospital: { name: 'City Hospital' },
    district_id: '1',
    district: { name: 'District 1' },
    created_at: '2025-06-23T16:00:00Z',
    submitted_by_user_id: 2,
  },
];

const AdminDashboard = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [users, setUsers] = useState([]);

  // Initialize with dummy data
  useEffect(() => {
    setEnquiries(dummyEnquiries);
    setHospitals(dummyHospitals);
    setDistricts(dummyDistricts);
    setUsers(dummyUsers);
  }, []);

  // Enquiry status distribution
  const enquiryStatusData = {
    labels: ['PENDING', 'APPROVED', 'REJECTED', 'FORWARDED'],
    datasets: [
      {
        data: [
          enquiries.filter((e) => e.status === 'PENDING').length,
          enquiries.filter((e) => e.status === 'APPROVED').length,
          enquiries.filter((e) => e.status === 'REJECTED').length,
          enquiries.filter((e) => e.status === 'FORWARDED').length,
        ],
        backgroundColor: ['#FBBF24', '#10B981', '#EF4444', '#3B82F6'],
      },
    ],
  };

  // User role distribution
  const userRoleData = {
    labels: ['ADMIN', 'CMOUSER', 'SDM', 'BENEFICIARY'],
    datasets: [
      {
        label: 'Users by Role',
        data: [
          users.filter((u) => u.role === 'ADMIN').length,
          users.filter((u) => u.role === 'CMOUSER').length,
          users.filter((u) => u.role === 'SDM').length,
          users.filter((u) => u.role === 'BENEFICIARY').length,
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#FBBF24', '#EF4444'],
      },
    ],
  };

  // Hospital types
  const hospitalTypeData = {
    labels: ['PUBLIC', 'PRIVATE'],
    datasets: [
      {
        data: [
          hospitals.filter((h) => h.hospital_type === 'PUBLIC').length,
          hospitals.filter((h) => h.hospital_type === 'PRIVATE').length,
        ],
        backgroundColor: ['#10B981', '#FBBF24'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Admin Dashboard</h1>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
              <p className="text-2xl font-bold text-gray-800">{enquiries.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hospitals</p>
              <p className="text-2xl font-bold text-gray-800">{hospitals.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Districts</p>
              <p className="text-2xl font-bold text-gray-800">{districts.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Enquiry Status</h2>
            <div className="h-64">
              <Pie data={enquiryStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">User Roles</h2>
            <div className="h-64">
              <Bar data={userRoleData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Hospital Types</h2>
            <div className="h-64">
              <Pie data={hospitalTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Enquiries</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 text-sm">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Patient Name</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Hospital</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.slice(0, 3).map((enquiry) => (
                  <tr key={enquiry.enquiry_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{enquiry.enquiry_id}</td>
                    <td className="p-3">{enquiry.patient_name}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          enquiry.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : enquiry.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : enquiry.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : enquiry.status === 'FORWARDED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="p-3">{enquiry.hospital.name}</td>
                    <td className="p-3">{enquiry.district.name}</td>
                    <td className="p-3">{new Date(enquiry.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/export-page"
              className="bg-blue-600 text-white text-center p-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Export Data
            </Link>
            <Link
              to="/admin/user-management"
              className="bg-blue-600 text-white text-center p-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Manage Permissions
            </Link>
            <Link
              to="/admin/hospital-management"
              className="bg-blue-600 text-white text-center p-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Add Hospital
            </Link>
            <Link
              to="/admin/district-data-page"
              className="bg-blue-600 text-white text-center p-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Add District
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;