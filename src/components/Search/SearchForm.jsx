import React from 'react';
import {
  FiUser, FiCreditCard, FiMail, FiPhone, FiFileText, FiActivity, FiSearch
} from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';

const SearchForm = ({ 
  searchCriteria, 
  onInputChange, 
  onSubmit, 
  onClear, 
  loading,
  userRole = 'SDM' // SDM or DM
}) => {
  const { t } = useLanguage();

  const getStatusOptions = () => {
    const baseOptions = [
      { value: 'ALL', label: t.allStatus || 'All Status' },
      { value: 'PENDING', label: t.pending || 'Pending' },
      { value: 'APPROVED', label: t.approved || 'Approved' },
      { value: 'REJECTED', label: t.rejected || 'Rejected' },
      { value: 'FORWARDED', label: t.forwarded || 'Forwarded' },
      { value: 'ESCALATED', label: t.escalated || 'Escalated' },
      { value: 'IN_PROGRESS', label: t.inProgress || 'In Progress' },
      { value: 'COMPLETED', label: t.completed || 'Completed' }
    ];

    // Add role-specific status options
    if (userRole === 'COLLECTOR' || userRole === 'DM') {
      baseOptions.push(
        { value: 'FINANCIAL_APPROVED', label: t.financialApproved || 'Financial Approved' },
        { value: 'ORDER_RELEASED', label: t.orderReleased || 'Order Released' }
      );
    }

    return baseOptions;
  };

  const isCollector = userRole === 'COLLECTOR' || userRole === 'DM';

  return (
    <form onSubmit={onSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Patient Name */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiUser className="mr-2" />
            {t.patientName || 'Patient Name'}
          </label>
          <input
            type="text"
            name="patient_name"
            value={searchCriteria.patient_name}
            onChange={onInputChange}
            placeholder={t.enterPatientName || "Enter patient name"}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Father/Spouse Name */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiUser className="mr-2" />
            {t.fatherSpouseName || 'Father/Spouse Name'}
          </label>
          <input
            type="text"
            name="father_spouse_name"
            value={searchCriteria.father_spouse_name}
            onChange={onInputChange}
            placeholder={t.enterFatherSpouseName || "Enter father/spouse name"}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Ayushman Card Number */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiCreditCard className="mr-2" />
            {t.ayushmanCardNumber || 'Ayushman Card Number'}
          </label>
          <input
            type="text"
            name="ayushman_card_number"
            value={searchCriteria.ayushman_card_number}
            onChange={onInputChange}
            placeholder={t.enterAyushmanCardNumber || "Enter Ayushman card number"}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Aadhar Card Number */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiCreditCard className="mr-2" />
            {t.aadharCardNumber || 'Aadhar Card Number'}
          </label>
          <input
            type="text"
            name="aadhar_card_number"
            value={searchCriteria.aadhar_card_number}
            onChange={onInputChange}
            placeholder={t.enterAadharCardNumber || "Enter Aadhar card number"}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* PAN Card Number */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiCreditCard className="mr-2" />
            {t.panCardNumber || 'PAN Card Number'}
          </label>
          <input
            type="text"
            name="pan_card_number"
            value={searchCriteria.pan_card_number}
            onChange={onInputChange}
            placeholder={t.enterPanCardNumber || "Enter PAN card number"}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiMail className="mr-2" />
            {t.emailAddress || 'Email Address'}
          </label>
          <input
            type="email"
            name="contact_email"
            value={searchCriteria.contact_email}
            onChange={onInputChange}
            placeholder={t.enterEmailAddress || "Enter email address"}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiPhone className="mr-2" />
            {t.phoneNumber || 'Phone Number'}
          </label>
          <input
            type="text"
            name="contact_phone"
            value={searchCriteria.contact_phone}
            onChange={onInputChange}
            placeholder={t.enterPhoneNumber || "Enter phone number"}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Enquiry Code */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiFileText className="mr-2" />
            {isCollector ? t.caseCode : t.enquiryCode}
          </label>
          <input
            type="text"
            name="enquiry_code"
            value={searchCriteria.enquiry_code}
            onChange={onInputChange}
            placeholder={isCollector ? (t.enterCaseCode || "Enter case code") : (t.enterEnquiryCode || "Enter enquiry code")}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FiActivity className="mr-2" />
            {t.status || 'Status'}
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
          {loading ? (t.searching || 'Searching...') : (isCollector ? (t.searchCases || 'Search Cases') : (t.searchEnquiries || 'Search Enquiries'))}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          {t.clearAll || 'Clear All'}
        </button>
      </div>
    </form>
  );
};

export default SearchForm;