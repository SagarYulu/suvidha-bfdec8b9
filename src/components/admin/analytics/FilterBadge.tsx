
import { Badge } from "@/components/ui/badge";

interface FilterBadgeProps {
  count: number;
  onClick: () => void;
}

export const FilterBadge: React.FC<FilterBadgeProps> = ({ count, onClick }) => {
  if (count === 0) return null;
  
  return (
    <Badge 
      variant="outline" 
      className="cursor-pointer hover:bg-muted"
      onClick={onClick}
    >
      {count} filters active • Clear
    </Badge>
  );
};
