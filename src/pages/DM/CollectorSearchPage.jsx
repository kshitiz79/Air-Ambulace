import React from 'react';
import { useSearch } from '../../hooks/useSearch';
import { SearchForm, SearchResults, SearchHeader } from '../../components/Search';

const CollectorSearchPage = () => {
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
  } = useSearch('COLLECTOR');

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <SearchHeader userRole="COLLECTOR" />

        {/* Search Form */}
        <SearchForm
          searchCriteria={searchCriteria}
          onInputChange={handleInputChange}
          onSubmit={handleSearch}
          onClear={clearSearch}
          loading={loading}
          userRole="COLLECTOR"
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
          userRole="COLLECTOR"
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default CollectorSearchPage;