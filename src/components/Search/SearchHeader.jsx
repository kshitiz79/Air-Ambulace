import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';

const SearchHeader = ({ userRole = 'SDM' }) => {
  const { t } = useLanguage();

  const getTitle = () => {
    return userRole === 'COLLECTOR' || userRole === 'DM' ? (t.advancedCaseSearch || 'Advanced Case Search') : (t.advancedSearch || 'Advanced Search');
  };

  const getDescription = () => {
    return userRole === 'COLLECTOR' || userRole === 'DM' 
      ? (t.searchCasesDesc || 'Search cases by multiple criteria for review and approval')
      : (t.searchEnquiriesDesc || 'Search enquiries by multiple criteria');
  };

  const getIconColor = () => {
    return userRole === 'COLLECTOR' || userRole === 'DM' ? 'text-green-600' : 'text-blue-600';
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <FiSearch className={`text-2xl ${getIconColor()}`} />
        <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
      </div>
      <p className="text-gray-600 mt-2">{getDescription()}</p>
    </div>
  );
};

export default SearchHeader;