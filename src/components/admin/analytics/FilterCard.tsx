
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CITY_OPTIONS, CLUSTER_OPTIONS, ROLE_OPTIONS } from "@/data/formOptions";
import { ISSUE_TYPES } from "@/config/issueTypes";
import { DateRangePicker, DateRange } from "./DateRangePicker";
import { ComparisonMode } from "./types";
import { Filter } from "lucide-react";

interface FilterCardProps {
  filters: any;
  handleCityChange: (city: string) => void;
  handleClusterChange: (cluster: string) => void;
  handleManagerChange: (manager: string) => void;
  handleRoleChange: (role: string) => void;
  handleIssueTypeChange: (issueType: string) => void;
  handleDateRangeChange: (dateRange: DateRange) => void;
  handleComparisonModeToggle: (enabled: boolean) => void;
  handleComparisonModeChange: (mode: string) => void;
  applyFilters: () => void;
  availableClusters: string[];
  managers: string[];
  comparisonModes: Array<{ value: string, label: string }>;
}

export const FilterCard: React.FC<FilterCardProps> = ({
  filters,
  handleCityChange,
  handleClusterChange,
  handleManagerChange,
  handleRoleChange,
  handleIssueTypeChange,
  handleDateRangeChange,
  handleComparisonModeToggle,
  handleComparisonModeChange,
  applyFilters,
  availableClusters,
  managers,
  comparisonModes
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </CardTitle>
        <CardDescription>
          Filter the data to analyze specific trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* City filter */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select value={filters.city || ""} onValueChange={handleCityChange}>
              <SelectTrigger id="city">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-cities">All Cities</SelectItem>
                {CITY_OPTIONS.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cluster filter */}
          <div className="space-y-2">
            <Label htmlFor="cluster">Cluster</Label>
            <Select 
              value={filters.cluster || ""} 
              onValueChange={handleClusterChange}
              disabled={!filters.city}
            >
              <SelectTrigger id="cluster">
                <SelectValue placeholder="All Clusters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-clusters">All Clusters</SelectItem>
                {availableClusters.map(cluster => (
                  <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manager filter */}
          <div className="space-y-2">
            <Label htmlFor="manager">Manager</Label>
            <Select value={filters.manager || ""} onValueChange={handleManagerChange}>
              <SelectTrigger id="manager">
                <SelectValue placeholder="All Managers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-managers">All Managers</SelectItem>
                {managers.map(manager => (
                  <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role filter */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={filters.role || ""} onValueChange={handleRoleChange}>
              <SelectTrigger id="role">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-roles">All Roles</SelectItem>
                {ROLE_OPTIONS.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Issue Type filter */}
          <div className="space-y-2">
            <Label htmlFor="issueType">Issue Type</Label>
            <Select value={filters.issueType || ""} onValueChange={handleIssueTypeChange}>
              <SelectTrigger id="issueType">
                <SelectValue placeholder="All Issue Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-issues">All Issue Types</SelectItem>
                {ISSUE_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker 
              date={filters.dateRange} 
              onChange={handleDateRangeChange} 
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="comparison-mode-toggle" className="font-medium">
              Comparison Mode
              {filters.isComparisonModeEnabled && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Enabled
                </span>
              )}
            </Label>
            <Switch 
              id="comparison-mode-toggle"
              checked={filters.isComparisonModeEnabled}
              onCheckedChange={handleComparisonModeToggle}
              className={filters.isComparisonModeEnabled ? "bg-blue-600" : ""}
            />
          </div>
          
          {filters.isComparisonModeEnabled && (
            <div>
              <Select 
                value={filters.comparisonMode} 
                onValueChange={handleComparisonModeChange}
                disabled={!filters.isComparisonModeEnabled}
              >
                <SelectTrigger id="comparisonMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {comparisonModes.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* Apply Filters button - prominently displayed */}
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
