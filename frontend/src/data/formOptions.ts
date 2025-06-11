
export const CITY_OPTIONS = [
  "Delhi",
  "Mumbai", 
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow"
];

export const CLUSTER_OPTIONS: Record<string, string[]> = {
  "Delhi": ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Mumbai": ["Central Mumbai", "South Mumbai", "North Mumbai", "East Mumbai", "West Mumbai"],
  "Bangalore": ["Central Bangalore", "North Bangalore", "South Bangalore", "East Bangalore", "West Bangalore"],
  "Chennai": ["Central Chennai", "North Chennai", "South Chennai", "East Chennai", "West Chennai"],
  "Hyderabad": ["Central Hyderabad", "North Hyderabad", "South Hyderabad", "East Hyderabad", "West Hyderabad"],
  "Pune": ["Central Pune", "North Pune", "South Pune", "East Pune", "West Pune"],
  "Kolkata": ["Central Kolkata", "North Kolkata", "South Kolkata", "East Kolkata", "West Kolkata"],
  "Ahmedabad": ["Central Ahmedabad", "North Ahmedabad", "South Ahmedabad", "East Ahmedabad", "West Ahmedabad"],
  "Jaipur": ["Central Jaipur", "North Jaipur", "South Jaipur", "East Jaipur", "West Jaipur"],
  "Lucknow": ["Central Lucknow", "North Lucknow", "South Lucknow", "East Lucknow", "West Lucknow"]
};

export const ROLE_OPTIONS = [
  "employee",
  "cluster_admin", 
  "zone_admin",
  "hr_admin",
  "super_admin"
];

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

export const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" }
];
