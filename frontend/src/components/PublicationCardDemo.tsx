import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, ExternalLink, MoreVertical, Sparkles, Users } from "lucide-react";
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
  const [lineClamp, setLineClamp] = useState(7); 
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (titleRef.current) {
      const titleHeight = titleRef.current.clientHeight;

      if (titleHeight < 60) { 
        setLineClamp(10);
      } else {
        setLineClamp(7); 
      }
    }
  }, [publication.title]);
  const navigate = useNavigate();
  
  return (
    <Card className="transition-all hover:shadow-lg relative overflow-hidden flex flex-col h-full">
      <CardHeader className="relative">
        <div className="flex items-start justify-between w-full gap-2">
          {/* Title */}
          <CardTitle ref={titleRef} className="text-xl text-left mb-0">
            {publication.title}
          </CardTitle>

          {/* Dropdown button aligned right */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 mt-1"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/synthesize", { state: { publication } })}>
                <Sparkles className="mr-2 h-4 w-4" />
                Summarize with GARD
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation(); 
                  const pmcidUrl = publication.link.startsWith("http")
                    ? publication.link
                    : `https://www.ncbi.nlm.nih.gov/pmc/articles/${publication.id}`;
                  window.open(pmcidUrl, "_blank");
                }}
              >
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
              {truncateText(publication.abstract, 500)}
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
