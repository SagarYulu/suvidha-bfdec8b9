
import { format } from "date-fns";

/**
 * Format date to a standard format
 * @param dateString Input date string
 * @param formatString Optional custom format string (defaults to "MMM dd, yyyy, h:mm a")
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | undefined | null,
  formatString: string = "MMM dd, yyyy, h:mm a"
): string => {
  if (!dateString) return "N/A";
  
  try {
    return format(new Date(dateString), formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * Format date to a short date format (no time)
 * @param dateString Input date string
 * @returns Formatted date string (MMM dd, yyyy)
 */
export const formatShortDate = (dateString: string | undefined | null): string => {
  return formatDate(dateString, "MMM dd, yyyy");
};

/**
 * Format date to show only time
 * @param dateString Input date string
 * @returns Formatted time string (h:mm a)
 */
export const formatTime = (dateString: string | undefined | null): string => {
  return formatDate(dateString, "h:mm a");
};

/**
 * Format date to a relative format (e.g. "2 days ago")
 * TODO: Implement this when needed using date-fns formatDistanceToNow
 */

/**
 * Get status badge color based on issue status
 * @param status Issue status
 * @returns Tailwind CSS class for the badge
 */
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case "open":
      return "bg-red-500";
    case "in_progress":
      return "bg-yellow-500";
    case "resolved":
      return "bg-green-500";
    case "closed":
      return "bg-green-700";
    default:
      return "bg-gray-500";
  }
};
