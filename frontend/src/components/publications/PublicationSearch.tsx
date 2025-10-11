import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search } from "lucide-react";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  loading: boolean;
  searching: boolean;
}

export const PublicationSearch = ({ query, onQueryChange, onSearch, onClear, loading, searching }: Props) => (
  <div className="bg-card rounded-lg p-6 shadow-soft mb-8">
    <div className="flex flex-col md:flex-row md:items-center gap-4 m-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search publications, authors, or keywords..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <Button onClick={onSearch} disabled={!query.trim() || loading}>
          Search
        </Button>
        <Button variant="outline" onClick={onClear} disabled={!query && !searching}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    </div>
  </div>
);
