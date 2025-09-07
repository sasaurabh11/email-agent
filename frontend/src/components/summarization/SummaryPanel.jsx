import React, { useState } from 'react';
import { useEmail } from '../../context/EmailContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, Sparkles, Copy, CheckCircle, Loader } from 'lucide-react';
import Button from '../ui/Button';

const SummaryPanel = ({ email }) => {
  const [selectedMode, setSelectedMode] = useState('short');
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { summarizeEmail, summaries } = useEmail();
  const { user } = useAuth();

  const handleSummarize = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setSummary(null);
    try {
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

  const copyToClipboard = async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const summaryModes = [
    { value: 'short', label: 'Short Summary', description: 'Brief overview' },
    { value: 'detailed', label: 'Detailed Summary', description: 'Comprehensive analysis' },
    { value: 'bullet', label: 'Bullet Points', description: 'Key points only' }
  ];

  return (
    <div className="glass border-gray-700 rounded-xl p-4 h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
          <FileText className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Summary</h3>
          <p className="text-xs text-gray-400">Generate intelligent summaries</p>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Summary Mode
        </label>
        <div className="space-y-2">
          {summaryModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setSelectedMode(mode.value)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedMode === mode.value
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <div className="font-medium">{mode.label}</div>
              {/* <div className="text-xs text-gray-400 mt-1">{mode.description}</div> */}
            </button>
          ))}
        </div>
      </div>
      
      <Button
        onClick={handleSummarize}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 mb-4"
        disabled={isLoading || !email}
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Summary
          </>
        )}
      </Button>
      
      {summary && (
        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-300">AI Summary:</h4>
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
              {summary}
            </p>
          </div>
          {copied && (
            <div className="mt-2 text-xs text-green-400 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Copied to clipboard!
            </div>
          )}
        </div>
      )}

      {!email && (
        <div className="text-center py-6 text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select an email to generate a summary</p>
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;