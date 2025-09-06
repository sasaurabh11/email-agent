import React from "react";

const AgentModal = ({ isOpen, onClose, agentData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Agent Analysis</h2>

        {!agentData ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {agentData.map((step, idx) => (
              <div
                key={idx}
                className="p-3 border rounded-lg bg-gray-50 text-sm whitespace-pre-wrap"
              >
                <strong>Step {idx + 1}:</strong> {step}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentModal;
