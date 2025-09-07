import React, { useState } from "react";
import { Search, Sparkles, X, Loader, MessageSquare } from "lucide-react";
import { mailAPI } from "../services/api";
import Button from "../components/ui/Button";

const SearchBox = ({ userId, onResults }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await mailAPI.ragSearch(userId.id, searchQuery);
      onResults(res);
      
      // Add to search history (limit to 5 items)
      setSearchHistory(prev => {
        const newHistory = [searchQuery, ...prev.filter(item => item !== searchQuery)];
        return newHistory.slice(0, 5);
      });
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    onResults(null);
  };

  const quickSearch = (quickQuery) => {
    setQuery(quickQuery);
    handleSearch(quickQuery);
  };

  const exampleQueries = [
    "Find emails about project deadlines",
    "Show me receipts from last month",
    "Search for meeting invitations",
    "Find travel booking confirmations"
  ];

  return (
    <div className="glass border-gray-700 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-500/20 rounded-lg mr-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Email Search</h3>
            <p className="text-sm text-gray-400">Find anything using natural language</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask something like 'Find emails from Sarah about the project'..."
          className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
          disabled={loading}
        />
        {query && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search Actions */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-gray-400">
          Powered by AI RAG technology
        </div>
        <Button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              AI Search
            </>
          )}
        </Button>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Searches</h4>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => quickSearch(item)}
                    className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Example Queries */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Try searching for:</h4>
            <div className="space-y-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => quickSearch(example)}
                  className="w-full text-left p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-300 group-hover:text-white">
                      "{example}"
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <h4 className="text-sm font-medium text-indigo-300 mb-1">💡 Search Tips</h4>
            <ul className="text-xs text-indigo-200 space-y-1">
              <li>• Use natural language like you're asking a question</li>
              <li>• Mention people, topics, or time periods</li>
              <li>• Search for specific types of emails (receipts, invites, etc.)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBox;