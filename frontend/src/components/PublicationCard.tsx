import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Publication {
  id: string;
  title: string;
  author: string;
  abstract: string;
  topic: string;
  summary: {
    intro: string;
    methods: string;
    results: string;
    conclusion: string;
  };
  link: string;
}

interface PublicationCardProps {
  publication: Publication;
}

const PublicationCard = ({ publication }: PublicationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/publications/${publication.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{publication.title}</CardTitle>
            <CardDescription className="text-sm mb-2">
              By {publication.author}
            </CardDescription>
            <Badge variant="secondary" className="text-xs">
              {publication.topic}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {isHovered ? publication.abstract : truncateText(publication.abstract, 150)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/publications/${publication.id}`);
            }}
          >
            View Full Summary
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

export default PublicationCard;