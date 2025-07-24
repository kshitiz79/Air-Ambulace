import React from 'react';
import {
  FiUser, FiCreditCard, FiMail, FiPhone, FiFileText, FiActivity, FiSearch
} from 'react-icons/fi';

const SearchForm = ({ 
  searchCriteria, 
  onInputChange, 
  onSubmit, 
  onClear, 
  loading,
  userRole = 'SDM' // SDM or DM
}) => {
  const getStatusOptions = () => {
    const baseOptions = [
      { value: 'ALL', label: 'All Status' },
      { value: 'PENDING', label: 'Pending' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' },
      { value: 'FORWARDED', label: 'Forwarded' },
      { value: 'ESCALATED', label: 'Escalated' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'COMPLETED', label: 'Completed' }
    ];

    // Add role-specific status options
    if (userRole === 'DM') {
      baseOptions.push(
        { value: 'FINANCIAL_APPROVED', label: 'Financial Approved' },
        { value: 'ORDER_RELEASED', label: 'Order Released' }
      );
    }

    return baseOptions;
  };

  return (
    <form onSubmit={onSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Patient Name */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiUser className="mr-2" />
            Patient Name
          </label>
          <input
            type="text"
            name="patient_name"
            value={searchCriteria.patient_name}
            onChange={onInputChange}
            placeholder="Enter patient name"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Father/Spouse Name */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiUser className="mr-2" />
            Father/Spouse Name
          </label>
          <input
            type="text"
            name="father_spouse_name"
            value={searchCriteria.father_spouse_name}
            onChange={onInputChange}
            placeholder="Enter father/spouse name"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Ayushman Card Number */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiCreditCard className="mr-2" />
            Ayushman Card Number
          </label>
          <input
            type="text"
            name="ayushman_card_number"
            value={searchCriteria.ayushman_card_number}
            onChange={onInputChange}
            placeholder="Enter Ayushman card number"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Aadhar Card Number */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiCreditCard className="mr-2" />
            Aadhar Card Number
          </label>
          <input
            type="text"
            name="aadhar_card_number"
            value={searchCriteria.aadhar_card_number}
            onChange={onInputChange}
            placeholder="Enter Aadhar card number"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* PAN Card Number */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiCreditCard className="mr-2" />
            PAN Card Number
          </label>
          <input
            type="text"
            name="pan_card_number"
            value={searchCriteria.pan_card_number}
            onChange={onInputChange}
            placeholder="Enter PAN card number"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiMail className="mr-2" />
            Email Address
          </label>
          <input
            type="email"
            name="contact_email"
            value={searchCriteria.contact_email}
            onChange={onInputChange}
            placeholder="Enter email address"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiPhone className="mr-2" />
            Phone Number
          </label>
          <input
            type="text"
            name="contact_phone"
            value={searchCriteria.contact_phone}
            onChange={onInputChange}
            placeholder="Enter phone number"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Enquiry Code */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiFileText className="mr-2" />
            {userRole === 'DM' ? 'Case Code' : 'Enquiry Code'}
          </label>
          <input
            type="text"
            name="enquiry_code"
            value={searchCriteria.enquiry_code}
            onChange={onInputChange}
            placeholder={`Enter ${userRole === 'DM' ? 'case' : 'enquiry'} code`}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiActivity className="mr-2" />
            Status
          </label>
          <select
            name="status"
            value={searchCriteria.status}
            onChange={onInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {getStatusOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSearch className="mr-2" />
          {loading ? 'Searching...' : `Search ${userRole === 'DM' ? 'Cases' : 'Enquiries'}`}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear All
        </button>
      </div>
    </form>
  );
};

export default SearchForm;