import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmail } from '../context/EmailContext';
import { FileText, Sparkles, Copy, Clock, Mail, User, MessageSquare, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner, { DotsLoader } from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

const Summaries = () => {
  const { user } = useAuth();
  const { emails, summarizeEmail, summarizeThread, generateDraft } = useEmail();
  const [loading, setLoading] = useState(true);
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
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
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

  const summaryModes = [
    { value: 'short', label: 'Short Summary', description: 'Brief overview' },
    { value: 'detailed', label: 'Detailed Summary', description: 'Comprehensive analysis' },
    { value: 'bullet', label: 'Bullet Points', description: 'Key points only' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <DotsLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Summaries</h1>
          <p className="text-gray-400 mt-1">Generate intelligent summaries for emails and threads</p>
        </div>
        <Button
          onClick={() => setIsDraftModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Draft
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Options and Lists */}
        <div className="xl:col-span-1 space-y-4">
          <Card className="glass border-gray-700">
            <CardHeader className="border-gray-700">
              <h2 className="text-lg font-semibold text-white">Summary Options</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Summary Mode
                  </label>
                  <div className="space-y-2">
                    {summaryModes.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setSummaryMode(mode.value)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          summaryMode === mode.value
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                            : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-xs text-gray-400 mt-1">{mode.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-gray-700">
            <CardHeader className="border-gray-700">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-indigo-400 mr-2" />
                <h2 className="text-lg font-semibold text-white">Recent Emails</h2>
              </div>
              <span className="text-sm text-gray-400">{emails.length} total</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {emails.slice(0, 10).map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailSummary(email)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEmail?.id === email.id 
                        ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {email.subject || '(No Subject)'}
                      </span>
                      {email.summaries && (
                        <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {email.sender}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-gray-700">
            <CardHeader className="border-gray-700">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-purple-400 mr-2" />
                <h2 className="text-lg font-semibold text-white">Threads</h2>
              </div>
              <span className="text-sm text-gray-400">{getUniqueThreads().length} total</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {getUniqueThreads().slice(0, 10).map((thread) => (
                  <div
                    key={thread.thread_id}
                    onClick={() => handleThreadSummary(thread.thread_id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedThread?.[0]?.thread_id === thread.thread_id 
                        ? 'bg-purple-500/20 border-purple-500 text-white' 
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {thread.subject || 'Thread'}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                        {emails.filter(e => e.thread_id === thread.thread_id).length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {thread.sender}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Summary Output */}
        <div className="xl:col-span-2">
          <Card className="glass border-gray-700 h-full">
            <CardHeader className="border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedEmail ? 'Email Summary' : selectedThread ? 'Thread Summary' : 'AI Summary'}
                  </h2>
                  {selectedEmail && (
                    <p className="text-sm text-gray-400 truncate">{selectedEmail.subject}</p>
                  )}
                  {selectedThread && (
                    <p className="text-sm text-gray-400">{selectedThread.length} messages in thread</p>
                  )}
                </div>
                {generatedSummary && (
                  <Button
                    onClick={() => copyToClipboard(generatedSummary)}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 hover:bg-gray-700"
                  >
                    {copied ? (
                      <span className="text-green-400">Copied!</span>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-gray-400">Generating summary...</span>
                </div>
              ) : generatedSummary ? (
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                      {generatedSummary}
                    </pre>
                  </div>
                  
                  {(selectedEmail || selectedThread) && (
                    <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <h4 className="text-sm font-medium text-indigo-300 mb-2">Summary Details</h4>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex items-center">
                          <Layers className="w-4 h-4 mr-2" />
                          <span>Mode: {summaryMode}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Generated: {new Date().toLocaleString()}</span>
                        </div>
                        {selectedEmail && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="truncate">Email: {selectedEmail.subject}</span>
                          </div>
                        )}
                        {selectedThread && (
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            <span>Thread: {selectedThread.length} messages</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No Summary Generated</h3>
                  <p className="text-gray-500">
                    Select an email or thread from the left panel to generate a summary.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        title="Generate Email Draft"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={draftData.recipient}
              onChange={(e) => setDraftData({...draftData, recipient: e.target.value})}
              placeholder="recipient@example.com"
              className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={draftData.subject}
              onChange={(e) => setDraftData({...draftData, subject: e.target.value})}
              placeholder="Email subject"
              className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Context
            </label>
            <textarea
              value={draftData.context}
              onChange={(e) => setDraftData({...draftData, context: e.target.value})}
              placeholder="What should this email be about?"
              rows={4}
              className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleGenerateDraft}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              disabled={isGenerating || !draftData.recipient}
            >
              {isGenerating ? 'Generating...' : 'Generate Draft'}
            </Button>
            <Button
              onClick={() => setIsDraftModalOpen(false)}
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>

          {generatedDraft && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300">Generated Draft</h4>
                <Button
                  onClick={() => copyToClipboard(generatedDraft)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-700/50 p-3 rounded border border-gray-600">
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