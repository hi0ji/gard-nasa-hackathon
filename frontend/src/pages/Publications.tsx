import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RotateCcw, Search } from "lucide-react";
import PublicationCardDemo from "@/components/PublicationCardDemo";
import { getPapers, searchPapers } from "@/services/apiService";

interface Publication {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  link: string;
  year: string;
}

const PAGE_SIZE = 9;

const Publications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Fetch data on page change (based on search mode)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (searching) {
          const data = await searchPapers(searchQuery, currentPage, PAGE_SIZE);
          setPublications(data.papers);
          setTotalPages(Math.ceil(data.total / PAGE_SIZE));
        } else {
          const data = await getPapers(currentPage, PAGE_SIZE);
          setPublications(data.papers);
          setTotalPages(Math.ceil(data.total / PAGE_SIZE));
        }
      } catch (err) {
        console.error("Failed to fetch publications:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage, searching]);

  // Handle search button click
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setCurrentPage(1);

    setLoading(true);
    try {
      const data = await searchPapers(searchQuery, 1, PAGE_SIZE);
      setPublications(data.papers);
      setTotalPages(Math.ceil(data.total / PAGE_SIZE));
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clear search and reset to default
  const clearFilters = async () => {
    try {
      setLoading(true);
      setSearchQuery("");
      setSearching(false);
      setCurrentPage(1);
      const data = await getPapers(1, PAGE_SIZE);
      setPublications(data.papers);
      setTotalPages(Math.ceil(data.total / PAGE_SIZE));
    } catch (err) {
      console.error("Failed to reset filters:", err);
    } finally {
      setLoading(false);
    }
  };

  // Page change
  const onPageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | "start-ellipsis" | "end-ellipsis")[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("start-ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("end-ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-background flex flex-row items-center justify-center">
      <div className="container py-8 m-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text">
            Search for Publications
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore NASA's published documents
          </p>
        </div>

        {/* Search */}
        <div className="bg-card rounded-lg p-6 shadow-soft mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-2">
            <div className="relative flex lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search publications, authors, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-24"
              />
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || loading}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                Search
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!searchQuery && !searching}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results Info */}
        {!loading && (
          <div className="text-center text-muted-foreground mb-4">
            {searching
              ? `Showing search results (Page ${currentPage} of ${totalPages})`
              : `Showing all publications (Page ${currentPage} of ${totalPages})`}
          </div>
        )}

        {/* Publication Cards */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : publications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publications.map((publication) => (
              <div key={publication.id} className="h-[400px]">
                <PublicationCardDemo publication={publication} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No publications found.
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(currentPage - 1);
                    }}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => {
                  if (page === "start-ellipsis" || page === "end-ellipsis") {
                    return (
                      <PaginationItem key={page + index}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(page as number);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Publications;
