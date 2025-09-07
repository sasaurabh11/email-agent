import React, { useState } from 'react';
import { useEmail } from '../../context/EmailContext';
import { useAuth } from '../../context/AuthContext';
import { Filter, Sparkles, Brain, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

const FilterPanel = ({ email }) => {
  const { filterEmail } = useEmail();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);

  const handleFilter = async () => {
    setIsLoading(true);
    setClassificationResult(null);
    
    try {
      const result = await filterEmail(email.id, user.id);
      setClassificationResult(result);
      
      setTimeout(() => {
        setClassificationResult(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to filter email:', error);
      setClassificationResult({ 
        success: false, 
        message: 'Failed to classify email' 
      });
      
      setTimeout(() => {
        setClassificationResult(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'important':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'urgent':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'newsletter':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'promotional':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'normal':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="glass border-gray-700 rounded-xl p-4">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg mr-3">
          <Filter className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">AI Classification</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-3">
          Let AI analyze and categorize this email for better organization
        </p>
        
        {email.classification ? (
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <span className="text-sm font-medium text-gray-300">Current classification:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getClassificationColor(email.classification)}`}>
              {email.classification}
            </span>
          </div>
        ) : (
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 text-center">This email hasn't been classified yet.</p>
          </div>
        )}
      </div>
      
      {/* Result Feedback */}
      {classificationResult && (
        <div className={`mb-4 p-3 rounded-lg border ${
          classificationResult.success 
            ? 'bg-green-500/10 border-green-500/30 text-green-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center">
            {classificationResult.success ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-2" />
            )}
            <span className="text-sm">{classificationResult.message || classificationResult.classification}</span>
          </div>
        </div>
      )}
      
      <Button
        onClick={handleFilter}
        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            Classify with AI
          </>
        )}
      </Button>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        AI-powered classification helps organize your inbox automatically
      </div>
    </div>
  );
};

export default FilterPanel;