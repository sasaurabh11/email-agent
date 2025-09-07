import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEmail } from "../context/EmailContext";
import EmailList from "../components/emails/EmailList";
import EmailDetail from "../components/emails/EmailDetail";
import FilterPanel from "../components/filtering/FilterPanel";
import SummaryPanel from "../components/summarization/SummaryPanel";
import EmailFilters from "../components/emails/EmailFilters";
import {
  RefreshCw,
  Filter,
  Zap,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import SearchBox from "./SearchBox";
import AgentModal from "./AgentModal";
import { agentAPI } from "../services/api";

const Emails = () => {
  const { user } = useAuth();
  const {
    emails,
    filteredEmails,
    fetchEmails,
    selectedEmail,
    fetchEmail,
    filterAllEmails,
    generateReplyDraft,
    setSelectedEmail,
  } = useEmail();

  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [layout, setLayout] = useState("split"); // 'split' or 'list'

  const runAgent = async (email) => {
    setAgentOpen(true);
    setAgentData(null);
    try {
      const data = await agentAPI.callAgent(email.id, user);
      setAgentData(data.result);
    } catch (err) {
      console.error("Agent run failed", err);
      setAgentData(["❌ Failed to run agent"]);
    }
  };

  const relevantEmails = useMemo(() => {
    if (!searchResults?.raw_matches?.length) return null;
    const ids = searchResults.raw_matches.map((m) => m.email_id);
    const threads = searchResults.raw_matches.map((m) => m.thread_id);

    return emails.filter(
      (e) => ids.includes(e.id) || ids.includes(e._id) || threads.includes(e.thread_id)
    );
  }, [searchResults, emails]);

  useEffect(() => {
    if (user) fetchEmails(user.id);
  }, [user, fetchEmails]);

  useEffect(() => {
    if (selectedEmailId) fetchEmail(selectedEmailId, user.id);
  }, [selectedEmailId, user, fetchEmail]);

  const handleRefresh = async () => {
    if (!user) return;
    try {
      setLoading(true);
      sessionStorage.removeItem("emails_synced");
      await fetchEmails(user.id, true);
    } catch (err) {
      console.error("Failed to refresh emails:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterAll = async () => {
    if (!user) return;
    try {
      await filterAllEmails(user.id);
    } catch (err) {
      console.error("Failed to filter all emails:", err);
    }
  };

  const handleReply = async (email) => {
    if (!user || !email) return;
    const draftReq = {
      recipient: email.sender,
      subject: `Re: ${email.subject || ""}`,
      context: "Respond politely and clearly",
      reply_to: email.plain_body || email.html_body || email.snippet,
    };
    const draft = await generateReplyDraft(user.id, draftReq);
    setReplyDraft(draft);
  };

  const handleSelectEmail = (email) => {
    setSelectedEmailId(email.id);
    setSelectedEmail(email);
    runAgent(email);
  };

  const toggleLayout = () =>
    setLayout(layout === "split" ? "list" : "split");

  if (loading && !emails.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-subtle glass">
        <div>
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          <p className="text-gray-400 text-sm">
            Manage and organize your emails with AI
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowFilters(!showFilters)} size="sm" variant="outline">
            <Filter className="w-4 h-4 mr-1" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button onClick={toggleLayout} size="sm" variant="outline">
            {layout === "split" ? (
              <LayoutList className="w-4 h-4 mr-1" />
            ) : (
              <LayoutGrid className="w-4 h-4 mr-1" />
            )}
            {layout === "split" ? "List View" : "Split View"}
          </Button>
          <Button onClick={handleFilterAll} size="sm" variant="outline">
            <Zap className="w-4 h-4 mr-1" /> Filter All
          </Button>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-subtle glass">
          <EmailFilters />
        </div>
      )}

      {/* Search */}
      <div className="p-4 border-b border-subtle glass">
        <SearchBox userId={user} onResults={setSearchResults} />
      </div>

      {/* Main Layout */}
      <div className={`grid gap-6 overflow-hidden ${layout === "split" ? "xl:grid-cols-3" : "grid-cols-1"}`}>
        {/* Email List */}
        <div className={`glass border border-subtle rounded-xl ${layout === "split" ? "xl:col-span-1" : ""}`}>
          <div className="p-3 border-b border-subtle flex justify-between items-center">
            <h2 className="text-white font-semibold">
              Emails ({relevantEmails ? relevantEmails.length : filteredEmails.length})
            </h2>
            {searchResults && (
              <Button
                onClick={() => setSearchResults(null)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto max-h-[calc(300vh-22rem)] scrollbar-hide">
            {searchResults ? (
              <>
                <div className="p-3 border-b border-subtle">
                  <h2 className="font-bold text-white mb-1">AI Answer</h2>
                  <p className="text-gray-300 text-sm">{searchResults.answer}</p>
                </div>
                <EmailList
                  emails={relevantEmails || []}
                  onSelectEmail={handleSelectEmail}
                  selectedEmailId={selectedEmailId}
                />
              </>
            ) : (
              <EmailList
                emails={filteredEmails}
                onSelectEmail={handleSelectEmail}
                selectedEmailId={selectedEmailId}
              />
            )}
          </div>
        </div>

        {/* Email Detail */}
        {(layout === "split" || selectedEmail) && (
          <div className={`glass border border-subtle rounded-xl ${layout === "split" ? "xl:col-span-2" : ""}`}>
            {selectedEmail ? (
              <div className="flex flex-col">
                {/* AI Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-subtle">
                  <FilterPanel email={selectedEmail} />
                  <SummaryPanel email={selectedEmail} />
                </div>
                {/* Email Detail grows with content */}
                <div className="p-4">
                  <EmailDetail email={selectedEmail} onReply={handleReply} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-gray-400">
                <p>Select an email to view details</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Agent Modal */}
      <AgentModal
        isOpen={agentOpen}
        onClose={() => setAgentOpen(false)}
        agentData={agentData}
      />

      {/* Reply Draft */}
      {replyDraft && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">AI Draft Reply</h2>
            <textarea
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-4 h-60 focus:ring-2 focus:ring-indigo-500"
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <Button
                onClick={() => setReplyDraft("")}
                variant="outline"
                className="border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Send Reply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emails;
