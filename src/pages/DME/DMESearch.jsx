import React from 'react';
import { useSearch } from '../../hooks/useSearch';
import { SearchForm, SearchResults, SearchHeader } from '../../components/Search';

const DMESearch = () => {
  const {
    searchCriteria, searchResults, loading, error, hasSearched,
    handleInputChange, handleSearch, clearSearch, formatDate, getStatusBadge
  } = useSearch('DME');

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <SearchHeader userRole="DME" />
        <SearchForm
          searchCriteria={searchCriteria}
          onInputChange={handleInputChange}
          onSubmit={handleSearch}
          onClear={clearSearch}
          loading={loading}
          userRole="DME"
        />
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>
        )}
        <SearchResults
          results={searchResults}
          hasSearched={hasSearched}
          userRole="DME"
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default DMESearch;
