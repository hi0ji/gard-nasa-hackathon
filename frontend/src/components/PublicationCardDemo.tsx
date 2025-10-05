import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, ExternalLink, Heart, MoreVertical, Sparkles, Users } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from "./ui/button";

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
  const [lineClamp, setLineClamp] = useState(7);  // Default to 7 lines for abstract
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  // Function to calculate and set the line clamp based on title length
  useEffect(() => {
    if (titleRef.current) {
      const titleHeight = titleRef.current.clientHeight;

      // Adjust line-clamp based on title height (2 or 3 lines vs. 4+ lines)
      if (titleHeight < 60) {  // Assuming 60px height is roughly 2-3 lines of text
        setLineClamp(10);  // More lines for shorter titles
      } else {
        setLineClamp(7);  // Fewer lines for longer titles
      }
    }
  }, [publication.title]); // Re-run when the title changes
  const navigate = useNavigate();
  
  return (
    <Card
      className="transition-all hover:shadow-lg relative overflow-hidden flex flex-col h-full"
    >
      <CardHeader>
        <div className="flex flex-col gap-1">
          {/* Title and dropdown side-by-side */}
          <div className="flex items-center justify-between">
            <CardTitle ref={titleRef} className="text-xl text-left mb-0">
              {publication.title}
            </CardTitle>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/ask-gards')}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Summarize with GARD
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/publication/${publication.id}`)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Date and author info below the title */}
          <CardDescription className="text-sm text-left">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
      </CardHeader>


      <CardContent className="flex-grow flex flex-col">
        <Tooltip>
          <TooltipTrigger asChild className="text-left">
            <p
              className="text-sm text-muted-foreground mb-4 overflow-hidden text-ellipsis"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: lineClamp,
              }}
            >
              {truncateText(publication.abstract, 500)} {/* Adjust text truncation */}
            </p>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-60 overflow-y-auto text-sm p-4"
          >
            <div className="whitespace-pre-line leading-relaxed">
              {publication.abstract}
            </div>
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
};

export default PublicationCardDemo;

