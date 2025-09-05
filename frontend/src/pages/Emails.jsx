import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEmail } from "../context/EmailContext";
import EmailList from "../components/emails/EmailList";
import EmailDetail from "../components/emails/EmailDetail";
import FilterPanel from '../components/filtering/FilterPanel';
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
  } = useEmail();
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

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
      await mailAPI.fetchEmails(user.id);
      await fetchEmails(user.id);
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
              <EmailDetail email={selectedEmail} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emails;
