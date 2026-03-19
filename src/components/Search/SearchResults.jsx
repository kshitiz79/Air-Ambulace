import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiPhone, FiMail, FiCalendar, FiEye, FiSearch
} from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';

const SearchResults = ({ 
  results, 
  hasSearched, 
  userRole = 'SDM',
  getStatusBadge,
  formatDate 
}) => {
  const { t } = useLanguage();
  const isCollector = userRole === 'COLLECTOR' || userRole === 'DM';

  const getViewLink = (item) => {
    if (isCollector) {
      return `/collector-dashboard/case-file/${item.enquiry_id}`;
    }
    return `/sdm-dashboard/enquiry-detail-page/${item.enquiry_id}`;
  };

  const getItemsLabel = () => {
    return isCollector ? (t.cases || 'cases') : (t.enquiries || 'enquiries');
  };

  if (!hasSearched) {
    return null;
  }

  return (
    <div className="border-t border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t.searchResults || 'Search Results'}</h2>
          <span className="text-sm text-gray-600">
            {results.length} {results.length !== 1 ? (t.resultsFound || 'results found') : (t.resultFound || 'result found')}
          </span>
        </div>

        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isCollector ? (t.caseDetails || 'Case Details') : (t.enquiryDetails || 'Enquiry Details')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.patientInfo || 'Patient Info'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.contact || 'Contact'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.status || 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.date || 'Date'}
                  </th>
                  {isCollector && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.amount || 'Amount'}
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((item) => (
                  <tr key={item.enquiry_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.enquiry_code || `#${item.enquiry_id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.district?.district_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.patient_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.father_spouse_name && `${t.fatherSpouseName || 'Father/Spouse'}: ${item.father_spouse_name}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t.age || 'Age'}: {item.age || 'N/A'}, {t.gender || 'Gender'}: {item.gender || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <FiPhone className="inline mr-1" />
                        {item.contact_phone}
                      </div>
                      <div className="text-sm text-gray-500">
                        <FiMail className="inline mr-1" />
                        {item.contact_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiCalendar className="mr-1" />
                        {formatDate(item.created_at)}
                      </div>
                    </td>
                    {isCollector && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.estimated_amount ? `₹${item.estimated_amount.toLocaleString()}` : 'N/A'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={getViewLink(item)}
                        className="flex items-center text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="mr-1" />
                        {t.viewDetails || 'View Details'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiSearch className="mx-auto text-6xl text-gray-400 mb-4" />
            <div className="text-gray-500 text-lg">
              {t.noResultsMatching || `No ${getItemsLabel()} found matching your search criteria`}
            </div>
            <p className="text-gray-400 mt-2">
              {t.tryAdjustingSearch || 'Try adjusting your search parameters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;