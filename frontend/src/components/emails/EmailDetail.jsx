import React, { useState } from "react";
import { Mail, Calendar, User, Tag, Eye, Reply, Clock } from "lucide-react";
import Button from "../ui/Button";

const EmailDetail = ({ email, onReply }) => {
  const [viewMode, setViewMode] = useState("html"); // 'plain', 'html', 'raw'
  const [userContext, setUserContext] = useState("");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSenderName = (sender) => {
    const match = sender?.match(/(.*?)</);
    return match ? match[1].trim() : sender || "Unknown Sender";
  };

  const getSenderEmail = (sender) => {
    const match = sender?.match(/<(.+?)>/);
    return match ? match[1] : sender || "";
  };

  const renderEmailBody = () => {
    if (!email) return null;

    const plainBody = email.plain_body || email.body;
    const htmlBody = email.html_body;

    if (viewMode === "html" && htmlBody) {
      return (
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />
      );
    }

    if (viewMode === "raw") {
      return (
        <pre className="text-xs bg-gray-700 p-4 rounded-lg overflow-x-auto text-gray-300">
          {JSON.stringify(email, null, 2)}
        </pre>
      );
    }

    const content = plainBody || email.snippet || "No content available";
    return (
      <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
        {content}
      </pre>
    );
  };

  if (!email) {
    return (
      <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
        <div>
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">Select an email to view details</p>
        </div>
      </div>
    );
  }

  const hasHtml = email.html_body && email.html_body.trim();
  const hasPlain = email.plain_body && email.plain_body.trim();

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">
          {email.subject || "(No Subject)"}
        </h1>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">From: </span>
            <span className="ml-1 truncate">{getSenderName(email.sender)}</span>
            {getSenderEmail(email.sender) && (
              <span className="text-gray-500 ml-1 truncate">
                &lt;{getSenderEmail(email.sender)}&gt;
              </span>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-400">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">To: </span>
            <span className="ml-1 truncate">
              {Array.isArray(email.recipients)
                ? email.recipients.join(", ")
                : email.recipients || "Not specified"}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-400">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">Date: </span>
            <span className="ml-1">{formatDate(email.date)}</span>
          </div>
        </div>

        {email.classification && (
          <div className="flex items-center mb-4">
            <Tag className="w-4 h-4 text-gray-400 mr-2" />
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                email.classification === "important"
                  ? "bg-red-500/20 text-red-400"
                  : email.classification === "urgent"
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {email.classification}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 pt-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Content</h2>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("plain")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === "plain"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Plain Text
            </button>

            {hasHtml && (
              <button
                onClick={() => setViewMode("html")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  viewMode === "html"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                HTML
              </button>
            )}

            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                viewMode === "raw"
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Raw Data
            </button>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-1 overflow-y-auto">
          {renderEmailBody()}
        </div>

        <div className="mt-6 border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Add your own instructions for the reply (optional):
          </label>
          <textarea
            rows={3}
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder="e.g., Keep it concise and polite..."
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          <Button
            onClick={() => onReply(email, userContext)}
            className="mt-3 bg-indigo-600 hover:bg-indigo-700"
          >
            <Reply className="w-4 h-4 mr-2" />
            Reply with AI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;