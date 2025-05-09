
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import MobileHeader from "../layouts/headers/MobileHeader";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardUserHeaderProps {
  title: string;
  subtitle?: string; 
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastRefresh?: Date | null;
}

const DashboardUserHeader: React.FC<DashboardUserHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
  lastRefresh
}) => {
  const { authState } = useAuth();
  const isMobile = useIsMobile();
  
  return isMobile ? (
    <MobileHeader
      title={title}
      userName={authState.user?.name}
      bgColor="bg-yulu-blue"
      className="mb-4"
    >
      {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
      {onRefresh && (
        <div className="mt-2">
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <RefreshCw className={`mr-2 h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      )}
    </MobileHeader>
  ) : (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        )}
      </div>
      {lastRefresh && (
        <p className="text-xs text-gray-400 mt-1">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default DashboardUserHeader;
