import React from 'react';
import { Mail, Calendar, User, Tag } from 'lucide-react';

const EmailDetail = ({ email }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSenderName = (sender) => {
    const match = sender.match(/(.*?)</);
    return match ? match[1].trim() : sender;
  };

  const getSenderEmail = (sender) => {
    const match = sender.match(/<(.+?)>/);
    return match ? match[1] : sender;
  };

  if (!email) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Select an email to view details</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {email.subject || '(No Subject)'}
        </h1>
        
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <User className="w-4 h-4 mr-2" />
          <span className="font-medium">From: </span>
          <span className="ml-1">{getSenderName(email.sender)}</span>
          <span className="text-gray-400 ml-1">&lt;{getSenderEmail(email.sender)}&gt;</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <Mail className="w-4 h-4 mr-2" />
          <span className="font-medium">To: </span>
          <span className="ml-1">{email.recipients.join(', ')}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="font-medium">Date: </span>
          <span className="ml-1">{formatDate(email.date)}</span>
        </div>
        
        {email.classification && (
          <div className="flex items-center">
            <Tag className="w-4 h-4 text-gray-400 mr-2" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              email.classification === 'important' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {email.classification}
            </span>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
        <div className="prose max-w-none">
          {email.body ? (
            <pre className="whitespace-pre-wrap font-sans text-gray-800">
              {email.body}
            </pre>
          ) : (
            <p className="text-gray-500 italic">No content available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;