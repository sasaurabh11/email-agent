import React, { useState } from 'react';
import { useEmail } from '../../contexts/EmailContext';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Sparkles, Copy } from 'lucide-react';
import Button from '../ui/Button';

const SummaryPanel = ({ email }) => {
  const [selectedMode, setSelectedMode] = useState('short');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { summarizeEmail, summaries } = useEmail();
  const { user } = useAuth();

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      // Check if we already have a summary for this mode
      const cachedSummary = summaries[email.id]?.[selectedMode];
      if (cachedSummary) {
        setSummary(cachedSummary);
      } else {
        const result = await summarizeEmail(email.id, user.id, selectedMode);
        setSummary(result);
      }
    } catch (error) {
      console.error('Failed to summarize email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        <FileText className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Email Summary</h3>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Summary Mode
        </label>
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="short">Short Summary</option>
          <option value="detailed">Detailed Summary</option>
          <option value="bullet">Bullet Points</option>
        </select>
      </div>
      
      <Button
        onClick={handleSummarize}
        variant="primary"
        size="sm"
        className="w-full mb-4"
        disabled={isLoading}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {isLoading ? 'Generating...' : 'Generate Summary'}
      </Button>
      
      {summary && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Summary:</h4>
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              size="sm"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;