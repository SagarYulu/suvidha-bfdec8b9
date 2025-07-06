
export interface WorkingHoursConfig {
  start: number; // Hour (0-23)
  end: number;   // Hour (0-23)
  workingDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}

const DEFAULT_WORKING_HOURS: WorkingHoursConfig = {
  start: 9,  // 9 AM
  end: 18,   // 6 PM
  workingDays: [1, 2, 3, 4, 5] // Monday to Friday
};

export class WorkingTimeCalculator {
  private config: WorkingHoursConfig;

  constructor(config: WorkingHoursConfig = DEFAULT_WORKING_HOURS) {
    this.config = config;
  }

  isWorkingDay(date: Date): boolean {
    return this.config.workingDays.includes(date.getDay());
  }

  isWorkingHour(date: Date): boolean {
    const hour = date.getHours();
    return hour >= this.config.start && hour < this.config.end;
  }

  isWorkingTime(date: Date): boolean {
    return this.isWorkingDay(date) && this.isWorkingHour(date);
  }

  getNextWorkingTime(from: Date): Date {
    const next = new Date(from);
    
    // If current time is within working hours, return as is
    if (this.isWorkingTime(next)) {
      return next;
    }

    // If outside working hours but on working day, move to start of working day
    if (this.isWorkingDay(next)) {
      if (next.getHours() < this.config.start) {
        next.setHours(this.config.start, 0, 0, 0);
        return next;
      }
    }

    // Move to next working day
    do {
      next.setDate(next.getDate() + 1);
      next.setHours(this.config.start, 0, 0, 0);
    } while (!this.isWorkingDay(next));

    return next;
  }

  calculateWorkingHours(start: Date, end: Date): number {
    if (start >= end) return 0;

    let current = new Date(start);
    let totalHours = 0;
    const endTime = new Date(end);

    while (current < endTime) {
      if (this.isWorkingTime(current)) {
        const dayEnd = new Date(current);
        dayEnd.setHours(this.config.end, 0, 0, 0);
        
        const periodEnd = endTime < dayEnd ? endTime : dayEnd;
        const hoursInPeriod = (periodEnd.getTime() - current.getTime()) / (1000 * 60 * 60);
        
        totalHours += hoursInPeriod;
        current = periodEnd;
      } else {
        current = this.getNextWorkingTime(current);
      }
    }

    return Math.round(totalHours * 100) / 100; // Round to 2 decimal places
  }

  addWorkingHours(from: Date, hours: number): Date {
    let current = this.getNextWorkingTime(from);
    let remainingHours = hours;

    while (remainingHours > 0) {
      const dayStart = new Date(current);
      const dayEnd = new Date(current);
      dayEnd.setHours(this.config.end, 0, 0, 0);

      const hoursInDay = this.config.end - this.config.start;
      const hoursLeftInDay = (dayEnd.getTime() - current.getTime()) / (1000 * 60 * 60);

      if (remainingHours <= hoursLeftInDay) {
        current.setTime(current.getTime() + remainingHours * 60 * 60 * 1000);
        remainingHours = 0;
      } else {
        remainingHours -= hoursLeftInDay;
        // Move to next working day
        do {
          current.setDate(current.getDate() + 1);
          current.setHours(this.config.start, 0, 0, 0);
        } while (!this.isWorkingDay(current));
      }
    }

    return current;
  }

  getWorkingDaysInRange(start: Date, end: Date): number {
    let current = new Date(start);
    let workingDays = 0;

    while (current <= end) {
      if (this.isWorkingDay(current)) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  }

  calculateSLADeadline(createdAt: Date, slaHours: number): Date {
    return this.addWorkingHours(createdAt, slaHours);
  }

  isSLABreached(createdAt: Date, slaHours: number, resolvedAt?: Date): boolean {
    const deadline = this.calculateSLADeadline(createdAt, slaHours);
    const checkTime = resolvedAt || new Date();
    return checkTime > deadline;
  }

  getSLAStatus(createdAt: Date, slaHours: number, resolvedAt?: Date): 'met' | 'warning' | 'breached' {
    const deadline = this.calculateSLADeadline(createdAt, slaHours);
    const checkTime = resolvedAt || new Date();
    
    if (checkTime <= deadline) {
      return 'met';
    }
    
    const warningThreshold = new Date(deadline.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before
    if (checkTime <= warningThreshold) {
      return 'warning';
    }
    
    return 'breached';
  }
}

export const workingTimeCalculator = new WorkingTimeCalculator();
