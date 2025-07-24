import React from 'react';
import { useSearch } from '../../hooks/useSearch';
import { SearchForm, SearchResults, SearchHeader } from '../../components/Search';

const SearchPage = () => {
  const {
    searchCriteria,
    searchResults,
    loading,
    error,
    hasSearched,
    handleInputChange,
    handleSearch,
    clearSearch,
    formatDate,
    getStatusBadge
  } = useSearch('SDM');

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <SearchHeader userRole="SDM" />

        {/* Search Form */}
        <SearchForm
          searchCriteria={searchCriteria}
          onInputChange={handleInputChange}
          onSubmit={handleSearch}
          onClear={clearSearch}
          loading={loading}
          userRole="SDM"
        />

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Search Results */}
        <SearchResults
          results={searchResults}
          hasSearched={hasSearched}
          userRole="SDM"
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default SearchPage;