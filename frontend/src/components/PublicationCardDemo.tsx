import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Users } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Publication {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  link: string;
  year: string;
}

interface PublicationCardProps {
  publication: Publication;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

const PublicationCardDemo = ({ publication }: PublicationCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg relative overflow-hidden flex flex-col h-full"
      onClick={() => navigate(`/publications/${publication.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 text-left">{publication.title}</CardTitle>
            <CardDescription className="text-sm mb-2">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{publication.year}</span>
                </div>
                <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-default">
                        <Users className="h-3 w-3" />
                        <span>{publication.authors.length} authors</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs max-h-40 overflow-y-auto text-xs p-2 leading-snug">
                    {publication.authors.join(", ")}
                </TooltipContent>
                </Tooltip>
                </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col">
        <Tooltip>
            <TooltipTrigger asChild className="text-left">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                    {truncateText(publication.abstract, 150)}
                </p>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-60 overflow-y-auto text-sm p-4">
                <div className="whitespace-pre-line leading-relaxed">
                    {publication.abstract}
                </div>
            </TooltipContent>
        </Tooltip>

        {/* Wrap buttons in a div with mt-auto */}
        <div className="flex gap-2 mt-auto">
            <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                e.stopPropagation();
                navigate(`/publications/${publication.id}`);
                }}
            >
                View Details
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                e.stopPropagation();
                window.open(publication.link, "_blank");
                }}
            >
                <ExternalLink className="h-4 w-4 mr-1" />
                Paper Link
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicationCardDemo;
