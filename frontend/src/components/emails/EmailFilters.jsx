import React, { useState } from 'react';
import { useEmail } from '../../context/EmailContext';
import { Filter, X, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const EmailFilters = () => {
  const { filters, applyFilters } = useEmail();
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = () => {
    applyFilters(localFilters);
    setIsExpanded(false);
  };

  const handleClear = () => {
    const clearedFilters = { classification: 'all', search: '', priority: 'all', unread: false };
    setLocalFilters(clearedFilters);
    applyFilters(clearedFilters);
  };

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key) => {
    setLocalFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="glass border-gray-700 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Email Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Filter className="w-4 h-4 mr-1" />
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Always visible search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Search Emails
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={localFilters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search by sender, subject, or content..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          />
        </div>
      </div>

      {/* Expandable advanced filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
          {/* Classification */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={localFilters.classification}
              onChange={(e) => handleChange('classification', e.target.value)}
              className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All categories</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
              <option value="newsletter">Newsletter</option>
              <option value="promotional">Promotional</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={localFilters.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Unread filter */}
          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="unread-only"
              checked={localFilters.unread}
              onChange={() => handleToggle('unread')}
              className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="unread-only" className="text-sm text-gray-300">
              Unread only
            </label>
          </div>

          {/* With attachments */}
          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="with-attachments"
              checked={localFilters.attachments}
              onChange={() => handleToggle('attachments')}
              className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="with-attachments" className="text-sm text-gray-300">
              With attachments
            </label>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end space-x-3">
        <Button
          onClick={handleClear}
          variant="outline"
          className="border-gray-600 hover:bg-gray-700 text-gray-300"
        >
          <X className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <Button
          onClick={handleApply}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default EmailFilters;