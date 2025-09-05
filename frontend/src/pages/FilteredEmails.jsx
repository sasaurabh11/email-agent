import React, { useEffect, useState } from "react";
import { useEmail } from "../context/EmailContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const FilteredEmailsPage = () => {
  const { emails, filterAllEmails, loading } = useEmail();
  const { user } = useAuth();
  const [grouped, setGrouped] = useState({});

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
    try {
      await filterAllEmails(user.id);
    } catch (err) {
      console.error("Failed to filter all emails:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Filtered Emails</h1>
        <Button onClick={handleFilterAll} disabled={loading}>
          {loading ? "Classifying..." : "Classify All Emails"}
        </Button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-600">No emails classified yet.</p>
      ) : (
        Object.entries(grouped).map(([cls, mails]) => (
          <div key={cls} className="mb-8">
            <h2 className="text-xl font-semibold capitalize mb-4">
              {cls}
            </h2>
            <ul className="space-y-3">
              {mails.map((m) => (
                <li
                  key={m.id}
                  className="p-4 border rounded-lg bg-white shadow"
                >
                  <p className="font-medium text-gray-900">{m.subject}</p>
                  <p className="text-sm text-gray-600">{m.snippet}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    From: {m.sender}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default FilteredEmailsPage;
