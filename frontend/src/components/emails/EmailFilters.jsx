import React, { useState } from 'react';
import { useEmail } from '../../contexts/EmailContext';
import { Filter, X, Search } from 'lucide-react';
import Button from '../ui/Button';

const EmailFilters = () => {
  const { filters, applyFilters } = useEmail();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    applyFilters(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = { classification: 'all', search: '' };
    setLocalFilters(clearedFilters);
    applyFilters(clearedFilters);
  };

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <Button
          onClick={handleClear}
          variant="ghost"
          size="sm"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search emails..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Classification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Classification
          </label>
          <select
            value={localFilters.classification}
            onChange={(e) => handleChange('classification', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All emails</option>
            <option value="important">Important</option>
            <option value="normal">Normal</option>
            <option value="newsletter">Newsletter</option>
            <option value="promotional">Promotional</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleApply}
          variant="primary"
          size="sm"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default EmailFilters;