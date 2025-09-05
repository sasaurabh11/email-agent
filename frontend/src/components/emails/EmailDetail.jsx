import React, { useState } from "react";
import { Mail, Calendar, User, Tag, Eye } from "lucide-react";

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
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlBody }}
        />
      );
    }

    if (viewMode === "raw") {
      return (
        <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
          {JSON.stringify(email, null, 2)}
        </pre>
      );
    }

    const content = plainBody || email.snippet || "No content available";
    return (
      <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
        {content}
      </pre>
    );
  };

  if (!email) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Select an email to view details</p>
      </div>
    );
  }

  const hasHtml = email.html_body && email.html_body.trim();
  const hasPlain = email.plain_body && email.plain_body.trim();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {email.subject || "(No Subject)"}
        </h1>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">From: </span>
            <span className="ml-1 truncate">{getSenderName(email.sender)}</span>
            {getSenderEmail(email.sender) && (
              <span className="text-gray-400 ml-1 truncate">
                &lt;{getSenderEmail(email.sender)}&gt;
              </span>
            )}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="font-medium">To: </span>
            <span className="ml-1 truncate">
              {Array.isArray(email.recipients)
                ? email.recipients.join(", ")
                : email.recipients || "Not specified"}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
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
                  ? "bg-red-100 text-red-800"
                  : email.classification === "urgent"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {email.classification}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Content</h2>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("plain")}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === "plain"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Plain Text
            </button>

            {hasHtml && (
              <button
                onClick={() => setViewMode("html")}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === "html"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                HTML
              </button>
            )}

            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === "raw"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Raw Data
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
          {renderEmailBody()}
        </div>

        <div className="mt-6 border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add your own instructions for the reply (optional):
          </label>
          <textarea
            rows={3}
            value={userContext}
            onChange={(e) => setUserContext(e.target.value)}
            placeholder="e.g., Keep it concise and polite..."
            className="w-full border rounded-md p-2 mb-3 text-sm"
          />

          <button
            onClick={() => onReply(email, userContext)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reply with AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
