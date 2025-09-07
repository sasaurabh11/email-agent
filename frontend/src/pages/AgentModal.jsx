import React, { useEffect, useState } from "react";
import {
  X,
  Bot,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createPortal } from "react-dom";

const AgentModal = ({ isOpen, onClose, agentData }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.keyCode === 27) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed bottom-4 right-4 z-[9999] w-full max-w-md">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl">
          <div
            className="fixed inset-0 z-40 pointer-events-none"
            onClick={onClose}
          />

          <div className="fixed bottom-4 right-4 z-50 w-full max-w-md pointer-events-auto">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl transform transition-all duration-300">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Bot className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      AI Agent
                    </h2>
                    <p className="text-xs text-gray-400">
                      Analyzing your email
                    </p>
                  </div>
                </div>
                <button
                  className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-80 overflow-y-auto">
                {!agentData ? (
                  <div className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                    <p className="text-gray-400">
                      AI is analyzing your email...
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <Sparkles className="w-4 h-4 mr-1 text-indigo-400" />
                      <span>AI Analysis Complete</span>
                    </div>

                    {agentData.map((step, idx) => {
                      const isSuccess =
                        step.includes("✅") || !step.includes("❌");
                      const isError = step.includes("❌");

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border text-sm transition-all duration-200 ${
                            isError
                              ? "bg-red-500/10 border-red-500/30"
                              : "bg-gray-750 border-gray-600"
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0 mt-0.5">
                              {isError ? (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center text-xs text-gray-400 mb-1">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>Step {idx + 1}</span>
                              </div>
                              <p
                                className={`whitespace-pre-wrap ${
                                  isError ? "text-red-300" : "text-gray-300"
                                }`}
                              >
                                {step
                                  .replace("✅", "")
                                  .replace("❌", "")
                                  .trim()}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-700 bg-gray-850 rounded-b-xl">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Powered by Focus Mail</span>
                  <button
                    onClick={onClose}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AgentModal;
