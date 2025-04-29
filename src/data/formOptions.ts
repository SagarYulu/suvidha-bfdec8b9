
// Role options
export const ROLE_OPTIONS = [
  "Mechanic",
  "Pilot",
  "Marshal",
  "Zone Screener",
  "Yulu Captain",
  "Bike Captain",
  "Operator",
  "Bike Fitter",
  "Cleaning Associate",
  "Warehouse Associate",
  "Warehouse Manager",
  "Inventory Associate",
  "Sales Associate",
  "Promoter",
  "Team Leader - rider enablement",
  "Cluster Executive",
  "Area Incharge",
  "Quality Check associate",
  "Mobile QC",
  "Welder",
  "Admin" // Keeping admin role for administrative access
];

// City options
export const CITY_OPTIONS = [
  "Bangalore",
  "Chennai",
  "Delhi",
  "Mumbai",
  "Pune"
];

// Cluster options mapped by city
export const CLUSTER_OPTIONS: {[key: string]: string[]} = {
  "Bangalore": [
    "Bangalore North",
    "Bangalore South",
    "Bangalore East",
    "Bangalore West",
    "Bangalore Central"
  ],
  "Chennai": [
    "Chennai North",
    "Chennai South",
    "Chennai East",
    "Chennai West",
    "Chennai Central"
  ],
  "Delhi": [
    "Delhi North",
    "Delhi South",
    "Delhi East",
    "Delhi West",
    "Delhi Central",
    "Noida",
    "Gurgaon"
  ],
  "Mumbai": [
    "Mumbai North",
    "Mumbai South",
    "Mumbai East",
    "Mumbai West",
    "Mumbai Central",
    "Navi Mumbai",
    "Thane"
  ],
  "Pune": [
    "Pune North",
    "Pune South",
    "Pune East",
    "Pune West",
    "Pune Central",
    "Pimpri-Chinchwad"
  ]
};
