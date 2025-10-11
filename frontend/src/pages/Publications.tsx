import { PublicationList } from "@/components/publications/PublicationList";
import { PublicationSearch } from "@/components/publications/PublicationSearch";
import { PublicationsPagination } from "@/components/publications/PublicationPagination";
import { usePublications } from "@/hooks/usePublication";

const PublicationsPage = () => {
  const {
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
  } = usePublications();

  return (
    <div className="min-h-screen bg-background flex flex-row items-center justify-center">
      <div className="container py-8 m-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-hero bg-clip-text">
            Search for Publications
          </h1>
          <p className="text-xl text-muted-foreground">Explore NASA's published documents</p>
        </header>

        <PublicationSearch
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onClear={clearFilters}
          loading={loading}
          searching={searching}
        />

        {!loading && (
          <div className="text-center text-muted-foreground mb-4">
            {searching
              ? `Showing search results (Page ${currentPage} of ${totalPages})`
              : `Showing all publications (Page ${currentPage} of ${totalPages})`}
          </div>
        )}

        <PublicationList publications={publications} loading={loading} />

        <PublicationsPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
};

export default PublicationsPage;
