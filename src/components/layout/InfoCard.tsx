
import { useState } from "react";
import { InfoIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const InfoCard = ({ title, children, defaultOpen = false }: InfoCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="mb-6">
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <InfoIcon className="h-5 w-5 mr-2 text-primary" />
            {title}
          </span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="text-sm text-muted-foreground">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default InfoCard;
