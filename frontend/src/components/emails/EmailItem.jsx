import React from 'react';
import { Mail, Clock, Tag, User, Eye } from 'lucide-react';

const EmailItem = ({ email, onSelect, isSelected }) => {
  const formatDate = (dateString) => {
    const now = new Date();
    const emailDate = new Date(dateString);
    const diffTime = Math.abs(now - emailDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return emailDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return emailDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return emailDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getSnippet = (snippet, maxLength = 80) => {
    if (!snippet) return 'No content';
    return snippet.length > maxLength 
      ? `${snippet.substring(0, maxLength)}...` 
      : snippet;
  };

  const getSenderName = (sender) => {
    if (!sender) return 'Unknown Sender';
    const match = sender.match(/(.*?)</);
    return match ? match[1].trim() : sender;
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const classificationColors = {
    important: 'bg-red-500/20 text-red-400 border-red-500/30',
    urgent: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    newsletter: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    promotional: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    normal: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    unread: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  };

  const getClassificationColor = (classification) => {
    return classificationColors[classification] || classificationColors.normal;
  };

  return (
    <div
      className={`p-4 cursor-pointer border-b border-gray-700 transition-all duration-200 group ${
        isSelected 
          ? 'bg-indigo-500/10 border-l-4 border-l-indigo-400' 
          : 'hover:bg-gray-800/50'
      } ${!email.read ? 'bg-gray-800/30' : ''}`}
      onClick={() => onSelect(email)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {getInitials(getSenderName(email.sender))}
            </div>
            {!email.read && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full border-2 border-gray-900"></div>
            )}
          </div>
          
          <div className="min-w-0">
            <h4 className="font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
              {getSenderName(email.sender)}
            </h4>
            <p className="text-xs text-gray-400 truncate">
              {email.recipients && typeof email.recipients === 'string' 
                ? `to ${email.recipients.split(',')[0]}${email.recipients.split(',').length > 1 ? '...' : ''}`
                : 'No recipient'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
          <Clock className="w-3 h-3 mr-1" />
          <span>{formatDate(email.date)}</span>
        </div>
      </div>
      
      <div className="mb-2">
        <h3 className={`font-semibold truncate ${
          !email.read ? 'text-white' : 'text-gray-300'
        } group-hover:text-white transition-colors`}>
          {email.subject || '(No Subject)'}
        </h3>
        
        <p className="text-sm text-gray-400 mt-1 line-clamp-2 group-hover:text-gray-300 transition-colors">
          {getSnippet(email.snippet || email.plain_body)}
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {email.classification && (
            <span className={`text-xs px-2 py-1 rounded-full border ${getClassificationColor(email.classification)}`}>
              {email.classification}
            </span>
          )}
          {email.attachments && email.attachments.length > 0 && (
            <span className="text-xs px-2 py-1 bg-gray-700/50 text-gray-400 rounded-full border border-gray-600">
              📎 {email.attachments.length}
            </span>
          )}
        </div>
        
        {isSelected && (
          <Eye className="w-4 h-4 text-indigo-400" />
        )}
      </div>
    </div>
  );
};

export default EmailItem;