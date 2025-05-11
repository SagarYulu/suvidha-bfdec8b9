
import { differenceInMinutes, parseISO, isSunday, format } from 'date-fns';

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
 * Determine ticket priority based on working hours elapsed and ticket properties
 */
export const determinePriority = (
  createdAt: string,
  updatedAt: string,
  status: string,
  typeId: string,
  assignedTo?: string | null
): 'low' | 'medium' | 'high' | 'critical' => {
  const now = new Date().toISOString();
  const workingHoursElapsed = calculateWorkingHours(createdAt, now);
  const hoursSinceLastUpdate = calculateWorkingHours(updatedAt, now);
  
  // Critical: Not resolved/closed within 72 working hours (3 working days)
  if (workingHoursElapsed > 72 && status !== 'closed') {
    return 'critical';
  }
  
  // High priority cases
  // 1. Ticket is "In Progress" but not closed within 12 working hours
  if (status === 'in_progress' && hoursSinceLastUpdate > 12) {
    return 'high';
  }
  
  // 2. Ticket is assigned but agent has not acted within 8 hours
  if (assignedTo && hoursSinceLastUpdate > 8) {
    return 'high';
  }
  
  // 3. Specific categories that are always high priority
  // Health, Insurance, or Advance categories
  const highPriorityTypes = ['health', 'insurance', 'advance', 'medical'];
  if (typeId && highPriorityTypes.some(type => typeId.toLowerCase().includes(type))) {
    return 'high';
  }
  
  // Medium: No status change after 4 working hours
  if (hoursSinceLastUpdate > 4) {
    return 'medium';
  }
  
  // Low: Default for new or recently updated tickets
  return 'low';
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
