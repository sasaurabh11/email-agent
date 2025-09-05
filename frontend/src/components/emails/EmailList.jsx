import React from 'react';
import EmailItem from './EmailItem';

const EmailList = ({ emails, onSelectEmail, selectedEmailId }) => {
  if (emails.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No emails found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {emails.map((email) => (
        <EmailItem
          key={email.id}
          email={email}
          onSelect={onSelectEmail}
          isSelected={selectedEmailId === email.id}
        />
      ))}
    </div>
  );
};

export default EmailList;