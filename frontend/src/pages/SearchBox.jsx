import React, { useState } from "react";
import { Search } from "lucide-react";
import { mailAPI } from "../services/api";

const SearchBox = ({ userId, onResults }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await mailAPI.ragSearch(userId.id, query);
      onResults(res); 
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search emails..."
        className="flex-1 border rounded px-3 py-2"
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Searching..." : <Search className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default SearchBox;
