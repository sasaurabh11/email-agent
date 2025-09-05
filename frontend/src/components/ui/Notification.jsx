import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const Notification = () => {
  const { notification, setNotification } = useApp();

  if (!notification) return null;

  const { type, message } = notification;
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg p-4 shadow-lg ${bgColor} ${textColor} flex items-start`}>
        <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={() => setNotification(null)}
          className="ml-4 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;