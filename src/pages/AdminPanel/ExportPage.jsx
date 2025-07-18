import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import baseUrl from '../../baseUrl/baseUrl';

const ExportPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [enquiryRes, hospitalRes, districtRes] = await Promise.all([
          axios.get(`${baseUrl}/api/enquiries`),
          axios.get(`${baseUrl}/api/hospitals`),
          axios.get(`${baseUrl}/api/districts`),
        ]);
        setEnquiries(enquiryRes.data.data);
        setHospitals(hospitalRes.data.data);
        setDistricts(districtRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Export Enquiries to Excel
  const exportEnquiriesToExcel = async () => {
    const data = enquiries.map((enquiry) => ({
      'Enquiry ID': enquiry.enquiry_id,
      'Patient Name': enquiry.patient_name,
      'Status': enquiry.status,
      'Hospital': enquiry.hospital?.name || '-',
      'Source Hospital': enquiry.sourceHospital?.name || '-',
      'District': enquiry.district?.district_name || '-',
      'Medical Condition': enquiry.medical_condition || '-',
      'Ayushman Card Number': enquiry.ayushman_card_number || '-',
      'Aadhar Card Number': enquiry.aadhar_card_number || '-',
      'PAN Card Number': enquiry.pan_card_number || '-',
      'Contact Name': enquiry.contact_name || '-',
      'Contact Phone': enquiry.contact_phone || '-',
      'Contact Email': enquiry.contact_email || '-',
      'Submitted By User ID': enquiry.submitted_by_user_id || '-',
      'Created At': new Date(enquiry.created_at).toLocaleString(),
      'Updated At': new Date(enquiry.updated_at).toLocaleString(),
      'Documents': enquiry.documents
        ?.map((doc) => `${doc.document_type}: ${doc.file_path}`)
        .join(', ') || '-',
    }));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Enquiries');
    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
      worksheet.addRows(data);
    }
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Enquiries.xlsx');
  };

  // Export Hospitals to Excel
  const exportHospitalsToExcel = async () => {
    const data = hospitals.map((hospital) => ({
      'Hospital ID': hospital.hospital_id,
      'Name': hospital.name,
      'District': hospital.district?.district_name || '-',
      'Address': hospital.address || '-',
      'Contact Phone': hospital.contact_phone || '-',
      'Contact Email': hospital.contact_email || '-',
      'Hospital Type': hospital.hospital_type || '-',
      'Contact Person Name': hospital.contact_person_name || '-',
      'Contact Person Phone': hospital.contact_person_phone || '-',
      'Contact Person Email': hospital.contact_person_email || '-',
      'Registration Number': hospital.registration_number || '-',
    }));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hospitals');
    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
      worksheet.addRows(data);
    }
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Hospitals.xlsx');
  };

  // Export Districts to Excel
  const exportDistrictsToExcel = async () => {
    const data = districts.map((district) => ({
      'District ID': district.district_id,
      'District Name': district.district_name,
      'Post Office Name': district.post_office_name || '-',
      'Pincode': district.pincode || '-',
      'State': district.state || '-',
    }));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Districts');
    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
      worksheet.addRows(data);
    }
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Districts.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      {/* Full-width div for Enquiries */}
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6 mb-8">
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

      {/* Two half-width divs for Districts and Hospitals */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8">
        {/* Districts (50%) */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Districts</h2>
            <button
              onClick={exportDistrictsToExcel}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
              disabled={loading || districts.length === 0}
            >
              Export Districts to Excel
            </button>
          </div>
          {loading ? (
            <p className="text-center text-gray-500">Loading districts...</p>
          ) : districts.length === 0 ? (
            <p className="text-center text-gray-500">No districts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 text-sm">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">District Name</th>
                    <th className="p-3 text-left">Post Office</th>
                    <th className="p-3 text-left">Pincode</th>
                    <th className="p-3 text-left">State</th>
                  </tr>
                </thead>
                <tbody>
                  {districts.map((district) => (
                    <tr key={district.district_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{district.district_id}</td>
                      <td className="p-3">{district.district_name}</td>
                      <td className="p-3">{district.post_office_name || '-'}</td>
                      <td className="p-3">{district.pincode || '-'}</td>
                      <td className="p-3">{district.state || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Hospitals (50%) */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Hospitals</h2>
            <button
              onClick={exportHospitalsToExcel}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
              disabled={loading || hospitals.length === 0}
            >
              Export Hospitals to Excel
            </button>
          </div>
          {loading ? (
            <p className="text-center text-gray-500">Loading hospitals...</p>
          ) : hospitals.length === 0 ? (
            <p className="text-center text-gray-500">No hospitals found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 text-sm">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">District</th>
                    <th className="p-3 text-left">Address</th>
                    <th className="p-3 text-left">Contact Phone</th>
                    <th className="p-3 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((hospital) => (
                    <tr key={hospital.hospital_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{hospital.hospital_id}</td>
                      <td className="p-3">{hospital.name}</td>
                      <td className="p-3">{hospital.district?.district_name || '-'}</td>
                      <td className="p-3">{hospital.address || '-'}</td>
                      <td className="p-3">{hospital.contact_phone || '-'}</td>
                      <td className="p-3">{hospital.hospital_type || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportPage;