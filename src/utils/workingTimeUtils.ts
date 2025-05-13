import { differenceInMinutes, parseISO, isSunday, format, differenceInHours, addHours } from 'date-fns';

interface PublicHoliday {
  date: string; // Format: 'YYYY-MM-DD'
  name: string;
}

// List of public holidays to exclude from working time calculations
// This should be moved to a database or config in production
const PUBLIC_HOLIDAYS: PublicHoliday[] = [
  { date: '2025-01-01', name: 'New Year\'s Day' },
  { date: '2025-01-26', name: 'Republic Day' },
  { date: '2025-08-15', name: 'Independence Day' },
  { date: '2025-10-02', name: 'Gandhi Jayanti' },
  { date: '2025-12-25', name: 'Christmas' },
  // Add more holidays as needed
];

/**
 * Checks if a given date is a public holiday
 */
export const isPublicHoliday = (date: Date): boolean => {
  const dateString = format(date, 'yyyy-MM-dd');
  return PUBLIC_HOLIDAYS.some(holiday => holiday.date === dateString);
};

/**
 * Checks if a given date is a working day (not Sunday or public holiday)
 */
export const isWorkingDay = (date: Date): boolean => {
  return !isSunday(date) && !isPublicHoliday(date);
};

/**
 * Calculate working hours between two timestamps
 * Excludes Sundays and public holidays
 */
export const calculateWorkingHours = (startTimeStr: string, endTimeStr: string): number => {
  try {
    const startTime = parseISO(startTimeStr);
    const endTime = parseISO(endTimeStr);
    
    // If dates are invalid, return 0
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error('Invalid date format for working hours calculation');
      return 0;
    }
    
    // If end time is before start time, return 0
    if (endTime < startTime) {
      return 0;
    }
    
    // For a simple implementation, we'll count only working days
    // and multiply by 8 hours per working day
    let totalWorkingMinutes = 0;
    let currentDate = new Date(startTime);
    
    // Calculate minutes within the same day for the start date
    if (isWorkingDay(currentDate)) {
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(17, 0, 0, 0); // End of working day (5 PM)
      
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(9, 0, 0, 0); // Start of working day (9 AM)
      
      // If start time is before work hours, adjust to 9 AM
      const effectiveStartTime = currentDate < startOfDay ? startOfDay : currentDate;
      
      // If end time is on the same day and before end of day
      if (endTime <= endOfDay && endTime.getDate() === currentDate.getDate()) {
        totalWorkingMinutes += differenceInMinutes(endTime, effectiveStartTime);
        return totalWorkingMinutes / 60; // Convert to hours
      } else {
        // Add minutes until end of this working day
        totalWorkingMinutes += differenceInMinutes(endOfDay, effectiveStartTime);
      }
    }
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
    
    // Process full working days in between
    while (currentDate < endTime && 
           !(currentDate.getDate() === endTime.getDate() && 
             currentDate.getMonth() === endTime.getMonth() && 
             currentDate.getFullYear() === endTime.getFullYear())) {
      
      if (isWorkingDay(currentDate)) {
        // Add a full working day (8 hours = 480 minutes)
        totalWorkingMinutes += 480;
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add time for the last day if it's a working day
    if (isWorkingDay(endTime)) {
      const startOfLastDay = new Date(endTime);
      startOfLastDay.setHours(9, 0, 0, 0); // Start of working day (9 AM)
      
      const endOfLastDay = new Date(endTime);
      endOfLastDay.setHours(17, 0, 0, 0); // End of working day (5 PM)
      
      // If end time is after work hours, cap at 5 PM
      const effectiveEndTime = endTime > endOfLastDay ? endOfLastDay : endTime;
      
      // If end time is before work hours, no additional time
      if (effectiveEndTime > startOfLastDay) {
        const effectiveStartOfLastDay = 
          currentDate < startOfLastDay ? startOfLastDay : currentDate;
        totalWorkingMinutes += differenceInMinutes(effectiveEndTime, effectiveStartOfLastDay);
      }
    }
    
    // Convert minutes to hours and return
    return totalWorkingMinutes / 60;
  } catch (error) {
    console.error('Error calculating working hours:', error);
    return 0;
  }
};

/**
 * Calculate First Response Time in working hours
 * This is the time from ticket creation to first response/update
 */
export const calculateFirstResponseTime = (createdAt: string, firstResponseAt: string | null): number => {
  // If there's no response yet, return 0
  if (!firstResponseAt) return 0;
  
  // Calculate working hours between ticket creation and first response
  return calculateWorkingHours(createdAt, firstResponseAt);
};

/**
 * Determine ticket priority based on working hours elapsed and ticket properties
 * PRIMARY RULE: Any ticket not marked as closed/resolved within 72 working hours 
 * from creation MUST be critical, regardless of status changes
 */
export const determinePriority = (
  createdAt: string,
  updatedAt: string,
  status: string,
  typeId: string,
  assignedTo?: string | null
): 'low' | 'medium' | 'high' | 'critical' => {
  // For resolved or closed tickets, priority is not applicable
  if (status === 'resolved' || status === 'closed') {
    return 'low'; // Default value, but shouldn't be displayed in UI
  }

  try {
    // Get current time for comparisons
    const now = new Date().toISOString();
    
    // Calculate working hours elapsed since creation
    const workingHoursElapsed = calculateWorkingHours(createdAt, now);
    const hoursSinceLastUpdate = calculateWorkingHours(updatedAt || createdAt, now);
    
    console.log(`[Priority] Issue status: ${status}, Working hours elapsed: ${workingHoursElapsed.toFixed(2)}, Hours since last update: ${hoursSinceLastUpdate.toFixed(2)}, Created: ${createdAt}, Updated: ${updatedAt || 'same as created'}, Current date: ${now}`);

    // ABSOLUTE RULE: Any ticket not closed/resolved within 72 working hours must be critical
    // This is the primary rule that must be checked first, regardless of other conditions
    if (workingHoursElapsed >= 72) {
      console.log(`[Priority] CRITICAL PRIORITY ENFORCED: ${workingHoursElapsed.toFixed(2)} working hours elapsed since creation (exceeds 72hr SLA)`);
      return 'critical';
    }
    
    // Check for specific high priority categories
    // Health, Insurance, Advance, ESI categories are always high priority
    const highPriorityTypes = ['health', 'insurance', 'advance', 'esi', 'medical'];
    if (typeId && highPriorityTypes.some(type => typeId.toLowerCase().includes(type))) {
      return 'high';
    }
    
    // Facility issues that are still open after 24 hours should be critical
    if (typeId.toLowerCase().includes('facility') && workingHoursElapsed > 24) {
      return 'critical';
    }
    
    // High priority - Unattended for 48 or more working hours
    if (workingHoursElapsed >= 48) {
      console.log(`[Priority] High priority assigned: ${workingHoursElapsed} hours elapsed, status: ${status}`);
      return 'high';
    }
    
    // Medium priority - Unattended for 24 or more working hours
    if (workingHoursElapsed >= 24) {
      console.log(`[Priority] Medium priority assigned: ${workingHoursElapsed} hours elapsed, status: ${status}`);
      return 'medium';
    }
    
    // Ticket is "In Progress" but no update within 12 working hours
    if (status === 'in_progress' && hoursSinceLastUpdate > 12) {
      return 'medium';
    }
    
    // Ticket is assigned but agent has not acted within 8 hours
    if (assignedTo && hoursSinceLastUpdate > 8) {
      return 'medium';
    }
    
    // Low: Default for new or recently updated tickets
    return 'low';
  } catch (error) {
    console.error('Error in determinePriority:', error);
    // If any error occurs, return a safe default value
    return 'low';
  }
};

/**
 * Check if a notification should be sent based on priority change
 */
export const shouldSendNotification = (
  oldPriority: string, 
  newPriority: string
): boolean => {
  // Priority escalated
  return oldPriority !== newPriority && 
    (newPriority === 'medium' || 
     newPriority === 'high' || 
     newPriority === 'critical');
};

/**
 * Get recipients for notifications based on ticket priority
 */
export const getNotificationRecipients = (
  priority: string,
  assignedTo?: string | null
): string[] => {
  const recipients: string[] = [];
  
  // Always notify HR Admin for medium priority and above
  if (priority === 'medium' || priority === 'high' || priority === 'critical') {
    recipients.push('hr_admin');
  }
  
  // Add assigned agent for high and critical
  if ((priority === 'high' || priority === 'critical') && assignedTo) {
    recipients.push(assignedTo);
  }
  
  // Add Super Admin for high and critical
  if (priority === 'high' || priority === 'critical') {
    recipients.push('super_admin');
  }
  
  return recipients;
};

/**
 * Check if a ticket is reopenable based on when it was closed
 * Tickets can only be reopened within 72 hours of being closed/resolved
 */
export const isTicketReopenable = (closedAt?: string): boolean => {
  if (!closedAt) return false;
  
  const now = new Date();
  const closedDate = parseISO(closedAt);
  const hoursSinceClosed = differenceInHours(now, closedDate);
  
  return hoursSinceClosed <= 72; // Can be reopened within 72 hours
};

/**
 * Calculate when a ticket's reopening window expires
 */
export const calculateReopenableUntil = (closedAt: string): string => {
  const closedDate = parseISO(closedAt);
  const reopenableUntil = addHours(closedDate, 72);
  return reopenableUntil.toISOString();
};
