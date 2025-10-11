// src/hooks/usePublications.ts
import { useEffect, useState } from "react";
import { getPapers, searchPapers } from "@/services/apiService";
import type { Publication } from "@/types";

const PAGE_SIZE = 9;
const CACHE_PREFIX = "publications_cache";

const getCacheKey = (query: string, page: number) =>
  `${CACHE_PREFIX}_${query.trim().toLowerCase() || "all"}_page_${page}`;

const saveToCache = (query: string, page: number, data: { papers: Publication[]; total: number }) => {
  try {
    localStorage.setItem(getCacheKey(query, page), JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save cache", e);
  }
};

const loadFromCache = (query: string, page: number) => {
  try {
    const cached = localStorage.getItem(getCacheKey(query, page));
    return cached ? (JSON.parse(cached) as { papers: Publication[]; total: number }) : null;
  } catch {
    return null;
  }
};

const clearAllCache = () => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
};

export function usePublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchData = async (query = searchQuery, page = currentPage, resetCache = false) => {
    setLoading(true);

    if (resetCache) clearAllCache();

    const cachedData = loadFromCache(searching ? query : "", page);
    if (cachedData && !resetCache) {
      setPublications(cachedData.papers);
      setTotalPages(Math.ceil(cachedData.total / PAGE_SIZE));
      setLoading(false);
      return;
    }

    try {
      const data = searching
        ? await searchPapers(query, page, PAGE_SIZE)
        : await getPapers(page, PAGE_SIZE);
      setPublications(data.papers);
      setTotalPages(Math.ceil(data.total / PAGE_SIZE));
      saveToCache(searching ? query : "", page, data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searching]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setCurrentPage(1);
    await fetchData(searchQuery, 1, true);
  };

  const clearFilters = async () => {
    setSearching(false);
    setSearchQuery("");
    setCurrentPage(1);
    await fetchData("", 1, true);
  };

  return {
    publications,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    searching,
    handleSearch,
    clearFilters,
  };
}
