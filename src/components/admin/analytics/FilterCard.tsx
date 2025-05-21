
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CITY_OPTIONS, CLUSTER_OPTIONS, ROLE_OPTIONS } from "@/data/formOptions";
import { ISSUE_TYPES } from "@/config/issueTypes";
import { DateRangePicker, DateRange } from "./DateRangePicker";
import { ComparisonMode } from "./types";

interface FilterCardProps {
  filters: any;
  handleCityChange: (city: string) => void;
  handleClusterChange: (cluster: string) => void;
  handleManagerChange: (manager: string) => void;
  handleRoleChange: (role: string) => void;
  handleIssueTypeChange: (issueType: string) => void;
  handleDateRangeChange: (dateRange: DateRange) => void;
  handleComparisonModeChange: (mode: string) => void;
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
  handleComparisonModeChange,
  availableClusters,
  managers,
  comparisonModes
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Filters</CardTitle>
        <CardDescription>
          Filter the data to analyze specific trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker 
              date={filters.dateRange} 
              onChange={handleDateRangeChange} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comparisonMode">Comparison Mode</Label>
            <Select 
              value={filters.comparisonMode} 
              onValueChange={handleComparisonModeChange}
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
        </div>
      </CardContent>
    </Card>
  );
};
