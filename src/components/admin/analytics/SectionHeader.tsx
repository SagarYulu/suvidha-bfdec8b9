
import { FilterBadge } from "./FilterBadge";

interface SectionHeaderProps {
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  activeFiltersCount, 
  onClearFilters 
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">🟦 Advanced SLA & Ticket Trends</h2>
      <FilterBadge count={activeFiltersCount} onClick={onClearFilters} />
    </div>
  );
};
