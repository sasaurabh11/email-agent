import React from 'react';
import { Mail, Clock, Tag } from 'lucide-react';

const EmailItem = ({ email, onSelect, isSelected }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSnippet = (snippet, maxLength = 100) => {
    if (!snippet) return '';
    return snippet.length > maxLength 
      ? `${snippet.substring(0, maxLength)}...` 
      : snippet;
  };

  const getSenderName = (sender) => {
    const match = sender.match(/(.*?)</);
    return match ? match[1].trim() : sender;
  };

  return (
    <div
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
      }`}
      onClick={() => onSelect(email.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <Mail className="w-4 h-4 text-gray-400 mr-2" />
          <h4 className="font-medium text-gray-900 truncate">
            {getSenderName(email.sender)}
          </h4>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>{formatDate(email.date)}</span>
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-900 mb-1 truncate">
        {email.subject || '(No Subject)'}
      </h3>
      
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
        {getSnippet(email.snippet)}
      </p>
      
      {email.classification && (
        <div className="flex items-center">
          <Tag className="w-4 h-4 text-gray-400 mr-1" />
          <span className={`text-xs px-2 py-1 rounded-full ${
            email.classification === 'important' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {email.classification}
          </span>
        </div>
      )}
    </div>
  );
};

export default EmailItem;