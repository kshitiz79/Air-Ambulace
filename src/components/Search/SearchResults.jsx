import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiPhone, FiMail, FiCalendar, FiEye, FiSearch
} from 'react-icons/fi';

const SearchResults = ({ 
  results, 
  hasSearched, 
  userRole = 'SDM',
  getStatusBadge,
  formatDate 
}) => {
  const getViewLink = (item) => {
    if (userRole === 'DM') {
      return `/dm-dashboard/case-file/${item.enquiry_id}`;
    }
    return `/sdm-dashboard/enquiry-detail-page/${item.enquiry_id}`;
  };

  const getItemLabel = () => {
    return userRole === 'DM' ? 'case' : 'enquiry';
  };

  const getItemsLabel = () => {
    return userRole === 'DM' ? 'cases' : 'enquiries';
  };

  if (!hasSearched) {
    return null;
  }

  return (
    <div className="border-t border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
          <span className="text-sm text-gray-600">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {userRole === 'DM' ? 'Case Details' : 'Enquiry Details'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {userRole === 'DM' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                        {item.father_spouse_name && `Father/Spouse: ${item.father_spouse_name}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Age: {item.age || 'N/A'}, Gender: {item.gender || 'N/A'}
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
                    {userRole === 'DM' && (
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
                        View Details
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
              No {getItemsLabel()} found matching your search criteria
            </div>
            <p className="text-gray-400 mt-2">
              Try adjusting your search parameters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;