"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export function HeaderSearch() {
  const [searchValue, setSearchValue] = useState("");

  // Sync with ApplicationsList component
  useEffect(() => {
    const event = new CustomEvent("header-search-change", {
      detail: searchValue,
    });
    window.dispatchEvent(event);
  }, [searchValue]);

  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Cari perusahaan, posisi, lokasi..."
        className="w-full pl-9 pr-9 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
      />
      {searchValue && (
        <button
          onClick={() => setSearchValue("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
