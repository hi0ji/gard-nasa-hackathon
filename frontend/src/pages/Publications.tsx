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
import rawData from "../../.././backend/data/all_articles_combined.json";
import PublicationCardDemo from "@/components/PublicationCardDemo";

interface RawPublication {
  PMCID: string;
  Title: string;
  Authors: string[];
  Abstract: string;
  DOI: string;
  PublicationDate: string;
}

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

  useEffect(() => {
    const transformed = (rawData as RawPublication[]).map((item) => ({
      id: item.PMCID,
      title: item.Title,
      authors: item.Authors, // keep as array
      abstract: item.Abstract,
      link: item.DOI.startsWith("http")
        ? item.DOI
        : `https://doi.org/${item.DOI}`,
      year: new Date(item.PublicationDate).getFullYear().toString(),
    }));
    setPublications(transformed);
  }, []);

  // Filter publications based on search query
  const filteredPublications = publications.filter((pub) => {
    const query = searchQuery.toLowerCase();
    return (
      pub.title.toLowerCase().includes(query) ||
      pub.abstract.toLowerCase().includes(query) ||
      pub.authors.some((author) => author.toLowerCase().includes(query))
    );
  });

  // Reset page to 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredPublications.length / PAGE_SIZE);

  // Paginate the filtered publications
  const paginatedPublications = filteredPublications.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const clearFilters = () => setSearchQuery("");

  const onPageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll to top or desired position when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers with ellipsis for large sets
  const getPageNumbers = () => {
    const pages: (number | "start-ellipsis" | "end-ellipsis")[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("start-ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

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

        {/* Search and Filters */}
        <div className="bg-card rounded-lg p-6 shadow-soft mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-2">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search publications, authors, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!searchQuery}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Publication Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPublications.map((publication) => (
            <div key={publication.id} className="h-[400px]">
              {/* fixed height wrapper */}
              <PublicationCardDemo publication={publication} />
            </div>
          ))}
        </div>

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
