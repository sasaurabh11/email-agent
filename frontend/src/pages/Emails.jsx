import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEmail } from "../context/EmailContext";
import EmailList from "../components/emails/EmailList";
import EmailDetail from "../components/emails/EmailDetail";
import FilterPanel from "../components/filtering/FilterPanel";
import SummaryPanel from "../components/summarization/SummaryPanel";
// import EmailFilters from '../components/emails/EmailFilters';
import { RefreshCw, Filter, Download } from "lucide-react";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { mailAPI } from "../services/api";

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
  } = useEmail();
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");

  useEffect(() => {
    if (user) {
      fetchEmails(user.id);
    }
  }, [user, fetchEmails]);

  useEffect(() => {
    if (selectedEmailId) {
      fetchEmail(selectedEmailId, user.id);
    }
  }, [selectedEmailId, user, fetchEmail]);

  const handleRefresh = async () => {
    if (!user) return;

    try {
      setLoading(true);
      sessionStorage.removeItem("emails_synced");
      await fetchEmails(user.id, true);
    } catch (error) {
      console.error("Failed to refresh emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterAll = async () => {
    if (!user) return;

    try {
      await filterAllEmails(user.id);
    } catch (error) {
      console.error("Failed to filter all emails:", error);
    }
  };

  if (loading && !emails.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Inbox</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={handleFilterAll} variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter All
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* {showFilters && <EmailFilters />} */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Emails ({filteredEmails.length})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <EmailList
                emails={filteredEmails}
                onSelectEmail={setSelectedEmailId}
                selectedEmailId={selectedEmailId}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {selectedEmail && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FilterPanel email={selectedEmail} />
              <SummaryPanel email={selectedEmail} />
            </div>
          )}

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <EmailDetail email={selectedEmail} onReply={handleReply} />
            </div>
          </div>
        </div>
      </div>

      {replyDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-2/3">
            <h2 className="text-xl font-semibold mb-4">AI Draft Reply</h2>
            <textarea
              className="w-full border rounded p-2 h-60"
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setReplyDraft("")}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emails;
