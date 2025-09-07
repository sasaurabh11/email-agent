import React, { useEffect, useState } from "react";
import { useEmail } from "../context/EmailContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { Filter, Mail, User, Clock, FileText, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

const FilteredEmailsPage = () => {
  const { emails, filterAllEmails, loading } = useEmail();
  const { user } = useAuth();
  const [grouped, setGrouped] = useState({});
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    if (emails.length > 0) {
      const groupedData = emails.reduce((acc, email) => {
        const cls = email.classification || "unclassified";
        if (!acc[cls]) acc[cls] = [];
        acc[cls].push(email);
        return acc;
      }, {});
      setGrouped(groupedData);
    }
  }, [emails]);

  const handleFilterAll = async () => {
    setIsFiltering(true);
    try {
      await filterAllEmails(user.id);
    } catch (err) {
      console.error("Failed to filter all emails:", err);
    } finally {
      setIsFiltering(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSenderName = (sender) => {
    if (!sender) return 'Unknown Sender';
    const match = sender.match(/(.*?)</);
    return match ? match[1].trim() : sender;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Classified Emails</h1>
          <p className="text-gray-400 mt-1">Emails organized by AI classification</p>
        </div>
        <Button 
          onClick={handleFilterAll} 
          disabled={loading || isFiltering}
          className="bg-primary-gradient"
        >
          {isFiltering ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Classifying...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Classify All Emails
            </>
          )}
        </Button>
      </div>

            {/* Statistics Card */}
      {Object.keys(grouped).length > 0 && (
        <div className="glass border-subtle rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Classification Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(grouped).map(([cls, mails]) => (
              <div key={cls} className="bg-gray-800/50 rounded-lg p-3 border border-subtle">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getClassificationColor(cls)}`}>
                    {cls}
                  </span>
                  <span className="text-lg font-bold text-white">{mails.length}</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      cls === 'important' ? 'bg-red-500' :
                      cls === 'urgent' ? 'bg-orange-500' :
                      cls === 'newsletter' ? 'bg-blue-500' :
                      cls === 'promotional' ? 'bg-purple-500' :
                      cls === 'normal' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${(mails.length / emails.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round((mails.length / emails.length) * 100)}% of total
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="glass border-subtle rounded-xl p-8 text-center">
          <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No Classified Emails Yet</h2>
          <p className="text-gray-500 mb-6">Use the AI classifier to organize your emails automatically</p>
          <Button 
            onClick={handleFilterAll} 
            disabled={loading || isFiltering}
            className="bg-primary"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Classification
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cls, mails]) => (
            <div key={cls} className="glass border-subtle rounded-xl overflow-hidden">
              <div className="p-4 border-b border-subtle bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getClassificationColor(cls)}`}>
                      {cls.toUpperCase()}
                    </span>
                    <span className="ml-3 text-sm text-gray-400">
                      {mails.length} email{mails.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    AI Classified
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-700">
                {mails.map((email) => (
                  <div key={email.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate flex items-center">
                          <Mail className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                          {email.subject || "(No Subject)"}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {email.snippet || email.plain_body?.substring(0, 150) || 'No content available'}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="text-xs text-gray-500 bg-primary-soft px-2 py-1 rounded">
                          {formatDate(email.date)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        <span className="truncate">{getSenderName(email.sender)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {email.summaries && (
                          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            Summarized
                          </span>
                        )}
                        {!email.read && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default FilteredEmailsPage;