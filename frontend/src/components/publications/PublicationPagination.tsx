import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Props {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const PublicationsPagination = ({ totalPages, currentPage, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

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
    <div className="flex justify-center mt-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); onPageChange(currentPage - 1); }} />
          </PaginationItem>

          {getPageNumbers().map((page, index) =>
            page === "start-ellipsis" || page === "end-ellipsis" ? (
              <PaginationItem key={page + index}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => { e.preventDefault(); onPageChange(page as number); }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); onPageChange(currentPage + 1); }} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
