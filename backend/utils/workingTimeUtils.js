
const moment = require('moment');

class WorkingTimeUtils {
  static WORKING_HOURS_START = 9; // 9 AM
  static WORKING_HOURS_END = 17; // 5 PM
  static WORKING_DAYS_PER_WEEK = 6; // Monday to Saturday (Sunday is holiday)
  
  // Indian public holidays (you can extend this list)
  static PUBLIC_HOLIDAYS = [
    '2024-01-26', // Republic Day
    '2024-03-29', // Holi
    '2024-08-15', // Independence Day
    '2024-10-02', // Gandhi Jayanti
    '2024-11-01', // Diwali
    '2024-12-25', // Christmas
    // Add more holidays as needed
  ];

  /**
   * Check if a given date is a working day
   * @param {Date|string} date 
   * @returns {boolean}
   */
  static isWorkingDay(date) {
    const momentDate = moment(date);
    
    // Check if it's Sunday (0 = Sunday in moment.js)
    if (momentDate.day() === 0) {
      return false;
    }
    
    // Check if it's a public holiday
    const dateString = momentDate.format('YYYY-MM-DD');
    if (this.PUBLIC_HOLIDAYS.includes(dateString)) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if a given time is within working hours
   * @param {Date|string} datetime 
   * @returns {boolean}
   */
  static isWorkingHour(datetime) {
    const momentDate = moment(datetime);
    const hour = momentDate.hour();
    
    return hour >= this.WORKING_HOURS_START && hour < this.WORKING_HOURS_END;
  }

  /**
   * Calculate working hours between two dates
   * @param {Date|string} startDate 
   * @param {Date|string} endDate 
   * @returns {number} Working hours
   */
  static calculateWorkingHours(startDate, endDate) {
    const start = moment(startDate);
    const end = moment(endDate);
    
    if (end.isBefore(start)) {
      return 0;
    }
    
    let totalWorkingHours = 0;
    let current = start.clone();
    
    while (current.isBefore(end, 'day') || current.isSame(end, 'day')) {
      if (this.isWorkingDay(current)) {
        let dayStart = current.clone().hour(this.WORKING_HOURS_START).minute(0).second(0);
        let dayEnd = current.clone().hour(this.WORKING_HOURS_END).minute(0).second(0);
        
        // Adjust for the actual start and end times
        if (current.isSame(start, 'day')) {
          dayStart = moment.max(dayStart, start);
        }
        
        if (current.isSame(end, 'day')) {
          dayEnd = moment.min(dayEnd, end);
        }
        
        // Only count if the day period overlaps with working hours
        if (dayStart.isBefore(dayEnd)) {
          const hoursInDay = dayEnd.diff(dayStart, 'hours', true);
          totalWorkingHours += Math.max(0, hoursInDay);
        }
      }
      
      current.add(1, 'day').startOf('day');
    }
    
    return Math.round(totalWorkingHours * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Add working hours to a given date
   * @param {Date|string} startDate 
   * @param {number} hoursToAdd 
   * @returns {Date}
   */
  static addWorkingHours(startDate, hoursToAdd) {
    let current = moment(startDate);
    let remainingHours = hoursToAdd;
    
    while (remainingHours > 0) {
      if (this.isWorkingDay(current)) {
        const dayStart = current.clone().hour(this.WORKING_HOURS_START).minute(0).second(0);
        const dayEnd = current.clone().hour(this.WORKING_HOURS_END).minute(0).second(0);
        
        let workingStart = current.isBefore(dayStart) ? dayStart : current;
        
        if (workingStart.isBefore(dayEnd)) {
          const availableHoursInDay = dayEnd.diff(workingStart, 'hours', true);
          
          if (remainingHours <= availableHoursInDay) {
            return workingStart.add(remainingHours, 'hours').toDate();
          } else {
            remainingHours -= availableHoursInDay;
          }
        }
      }
      
      current.add(1, 'day').hour(this.WORKING_HOURS_START).minute(0).second(0);
    }
    
    return current.toDate();
  }

  /**
   * Get SLA deadline based on priority and creation time
   * @param {Date|string} createdAt 
   * @param {string} priority 
   * @returns {Date}
   */
  static getSLADeadline(createdAt, priority) {
    const slaHours = this.getSLAHours(priority);
    if (slaHours === null) return null; // Critical has no fixed deadline
    
    return this.addWorkingHours(createdAt, slaHours);
  }

  /**
   * Get SLA hours based on priority
   * @param {string} priority 
   * @returns {number|null}
   */
  static getSLAHours(priority) {
    const slaMap = {
      'low': 4,
      'medium': 24,
      'high': 72,
      'critical': null // More than 72 hours
    };
    
    return slaMap[priority.toLowerCase()] || slaMap.medium;
  }

  /**
   * Check if an issue is within SLA
   * @param {Date|string} createdAt 
   * @param {Date|string} resolvedAt 
   * @param {string} priority 
   * @returns {boolean}
   */
  static isWithinSLA(createdAt, resolvedAt, priority) {
    const slaHours = this.getSLAHours(priority);
    
    if (priority.toLowerCase() === 'critical') {
      // Critical issues: check if resolved within 72 working hours
      const workingHours = this.calculateWorkingHours(createdAt, resolvedAt);
      return workingHours <= 72;
    }
    
    if (slaHours === null) return true;
    
    const workingHours = this.calculateWorkingHours(createdAt, resolvedAt);
    return workingHours <= slaHours;
  }

  /**
   * Get SLA status for an issue
   * @param {Date|string} createdAt 
   * @param {Date|string} resolvedAt 
   * @param {string} priority 
   * @param {string} currentStatus 
   * @returns {string} 'onTime', 'breached', 'atRisk', 'pending'
   */
  static getSLAStatus(createdAt, resolvedAt, priority, currentStatus) {
    const now = new Date();
    const slaHours = this.getSLAHours(priority);
    
    if (currentStatus === 'closed' && resolvedAt) {
      // Closed issue - check if it was resolved within SLA
      return this.isWithinSLA(createdAt, resolvedAt, priority) ? 'onTime' : 'breached';
    } else {
      // Open issue - check current age against SLA
      const currentAge = this.calculateWorkingHours(createdAt, now);
      
      if (priority.toLowerCase() === 'critical') {
        if (currentAge > 72) return 'breached';
        if (currentAge > 72 * 0.8) return 'atRisk';
        return 'pending';
      } else {
        if (slaHours && currentAge > slaHours) return 'breached';
        if (slaHours && currentAge > slaHours * 0.8) return 'atRisk';
        return 'pending';
      }
    }
  }
}

module.exports = WorkingTimeUtils;
