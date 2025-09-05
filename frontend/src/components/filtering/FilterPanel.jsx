import React from 'react';
import { useEmail } from '../../contexts/EmailContext';
import { useAuth } from '../../contexts/AuthContext';
import { Filter, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const FilterPanel = ({ email }) => {
  const { filterEmail } = useEmail();
  const { user } = useAuth();

  const handleFilter = async () => {
    try {
      await filterEmail(email.id, user.id);
    } catch (error) {
      console.error('Failed to filter email:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Email Classification</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Classify this email to help organize your inbox
        </p>
        {email.classification ? (
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">Current classification:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              email.classification === 'important' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {email.classification}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">This email hasn't been classified yet.</p>
        )}
      </div>
      
      <Button
        onClick={handleFilter}
        variant="primary"
        size="sm"
        className="w-full"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Classify Email
      </Button>
    </div>
  );
};

export default FilterPanel;