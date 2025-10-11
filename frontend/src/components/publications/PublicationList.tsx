import type { Publication } from "@/types";
import PublicationCard from "@/components/publications/PublicationCard";

interface Props {
  publications: Publication[];
  loading: boolean;
}

export const PublicationList = ({ publications, loading }: Props) => {
  if (loading) return <p className="text-center text-muted-foreground">Loading...</p>;
  if (!publications.length) return <p className="text-center text-muted-foreground">No publications found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {publications.map((publication) => (
        <div key={publication.id} className="h-[400px]">
          <PublicationCard publication={publication} />
        </div>
      ))}
    </div>
  );
};
