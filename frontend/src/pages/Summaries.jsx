import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmail } from '../context/EmailContext';
import { FileText, Sparkles, Copy, Clock, Mail, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

const Summaries = () => {
  const { user } = useAuth();
  const { emails, summarizeEmail, summarizeThread, generateDraft } = useEmail();
  const [ loading, setLoading ] = useState();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [summaryMode, setSummaryMode] = useState('short');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [draftData, setDraftData] = useState({
    recipient: '',
    subject: '',
    context: ''
  });
  const [generatedDraft, setGeneratedDraft] = useState('');

  useEffect(() => {
    if (user) {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  }, [user, setLoading]);

  const handleEmailSummary = async (email) => {
    setSelectedEmail(email);
    setSelectedThread(null);
    setIsGenerating(true);
    try {
      const summary = await summarizeEmail(email.id, user.id, summaryMode);
      setGeneratedSummary(summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleThreadSummary = async (threadId) => {
    const threadEmails = emails.filter(e => e.thread_id === threadId);
    setSelectedEmail(null);
    setSelectedThread(threadEmails);
    setIsGenerating(true);
    try {
      const summary = await summarizeThread(threadId, user.id, summaryMode);
      setGeneratedSummary(summary);
    } catch (error) {
      console.error('Failed to generate thread summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      const draft = await generateDraft(user.id, draftData);
      setGeneratedDraft(draft);
    } catch (error) {
      console.error('Failed to generate draft:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getUniqueThreads = () => {
    const threadMap = new Map();
    emails.forEach(email => {
      if (!threadMap.has(email.thread_id)) {
        threadMap.set(email.thread_id, email);
      }
    });
    return Array.from(threadMap.values());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Email Summaries</h1>
        <Button
          onClick={() => setIsDraftModalOpen(true)}
          variant="primary"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Draft
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Emails and Threads */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Summary Options</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Mode
                  </label>
                  <select
                    value={summaryMode}
                    onChange={(e) => setSummaryMode(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="short">Short Summary</option>
                    <option value="detailed">Detailed Summary</option>
                    <option value="bullet">Bullet Points</option>
                  </select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Recent Emails ({emails.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {emails.slice(0, 10).map((email) => (
                      <div
                        key={email.id}
                        onClick={() => handleEmailSummary(email)}
                        className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedEmail?.id === email.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {email.subject || '(No Subject)'}
                          </span>
                          {email.summaries && (
                            <FileText className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {email.sender}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Threads ({getUniqueThreads().length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getUniqueThreads().slice(0, 10).map((thread) => (
                      <div
                        key={thread.thread_id}
                        onClick={() => handleThreadSummary(thread.thread_id)}
                        className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedThread?.[0]?.thread_id === thread.thread_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {thread.subject || 'Thread'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {emails.filter(e => e.thread_id === thread.thread_id).length} messages
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Summary Output */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedEmail ? 'Email Summary' : selectedThread ? 'Thread Summary' : 'Summary'}
                </h2>
                {generatedSummary && (
                  <Button
                    onClick={() => copyToClipboard(generatedSummary)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-gray-600">Generating summary...</span>
                </div>
              ) : generatedSummary ? (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {generatedSummary}
                    </pre>
                  </div>
                  
                  {(selectedEmail || selectedThread) && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Summary Details</h4>
                      <div className="text-sm text-blue-800">
                        <p>Mode: {summaryMode}</p>
                        <p>Generated: {new Date().toLocaleString()}</p>
                        {selectedEmail && (
                          <p>Email: {selectedEmail.subject}</p>
                        )}
                        {selectedThread && (
                          <p>Thread: {selectedThread.length} messages</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Summary Generated</h3>
                  <p className="text-gray-600">
                    Select an email or thread from the left panel to generate a summary.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Draft Generation Modal */}
      <Modal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        title="Generate Email Draft"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={draftData.recipient}
              onChange={(e) => setDraftData({...draftData, recipient: e.target.value})}
              placeholder="recipient@example.com"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={draftData.subject}
              onChange={(e) => setDraftData({...draftData, subject: e.target.value})}
              placeholder="Email subject"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Context
            </label>
            <textarea
              value={draftData.context}
              onChange={(e) => setDraftData({...draftData, context: e.target.value})}
              placeholder="What should this email be about?"
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleGenerateDraft}
              variant="primary"
              disabled={isGenerating || !draftData.recipient}
              className="flex-1"
            >
              {isGenerating ? 'Generating...' : 'Generate Draft'}
            </Button>
            <Button
              onClick={() => setIsDraftModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>

          {generatedDraft && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Generated Draft</h4>
                <Button
                  onClick={() => copyToClipboard(generatedDraft)}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {generatedDraft}
              </pre>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Summaries;