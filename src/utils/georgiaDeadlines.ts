/**
 * Georgia Deadline Calculator
 * Implementation of O.C.G.A. § 1-3-1 (Computing Time)
 * 
 * FOR CIVIL DEFENSE LITIGATION IN GEORGIA
 * 
 * CRITICAL RULES:
 * 1. Never count the trigger day (Day 0)
 * 2. Short deadlines (<7 days): Exclude intermediate weekends/holidays
 * 3. Standard deadlines (≥7 days): Count all days, extend if ending on weekend/holiday
 * 4. Discovery close: 6 months from answer date (same day, 6 months later)
 */

// Georgia Legal Holidays (9 total)
export const GEORGIA_HOLIDAYS = [
  'new-years-day',          // January 1
  'martin-luther-king-day', // 3rd Monday in January  
  'memorial-day',           // Last Monday in May
  'juneteenth',             // June 19
  'independence-day',       // July 4
  'labor-day',              // 1st Monday in September
  'columbus-day',           // 2nd Monday in October
  'veterans-day',           // November 11
  'thanksgiving-day',       // 4th Thursday in November
  'christmas-day'           // December 25
];

/**
 * Calculate Georgia holidays for a given year
 */
export function getGeorgiaHolidays(year: number): string[] {
  const holidays: string[] = [];
  
  // Fixed date holidays
  holidays.push(`${year}-01-01`); // New Year's Day
  holidays.push(`${year}-06-19`); // Juneteenth
  holidays.push(`${year}-07-04`); // Independence Day
  holidays.push(`${year}-11-11`); // Veterans Day
  holidays.push(`${year}-12-25`); // Christmas Day
  
  // Calculated holidays
  holidays.push(getNthWeekdayOfMonth(year, 0, 3, 1)); // MLK Day (3rd Monday in Jan)
  holidays.push(getLastWeekdayOfMonth(year, 4, 1));    // Memorial Day (Last Monday in May)
  holidays.push(getNthWeekdayOfMonth(year, 8, 1, 1));  // Labor Day (1st Monday in Sept)
  holidays.push(getNthWeekdayOfMonth(year, 9, 1, 2));  // Columbus Day (2nd Monday in Oct)
  holidays.push(getNthWeekdayOfMonth(year, 10, 4, 4)); // Thanksgiving (4th Thursday in Nov)
  
  return holidays.sort();
}

/**
 * Get the nth occurrence of a weekday in a month
 * @param year - Year
 * @param month - Month (0-11, JavaScript convention)
 * @param weekday - Weekday (0=Sunday, 1=Monday, etc.)
 * @param n - Which occurrence (1st, 2nd, 3rd, 4th)
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): string {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  
  // Calculate days to add to get to the nth occurrence
  let daysToAdd = (weekday - firstWeekday + 7) % 7; // Days to first occurrence
  daysToAdd += (n - 1) * 7; // Add weeks for nth occurrence
  
  const targetDate = new Date(year, month, 1 + daysToAdd);
  return formatDate(targetDate);
}

/**
 * Get the last occurrence of a weekday in a month
 */
function getLastWeekdayOfMonth(year: number, month: number, weekday: number): string {
  const lastDay = new Date(year, month + 1, 0); // Last day of month
  const lastWeekday = lastDay.getDay();
  
  // Calculate days to subtract to get to the last occurrence
  let daysToSubtract = (lastWeekday - weekday + 7) % 7;
  
  const targetDate = new Date(year, month + 1, 0 - daysToSubtract);
  return formatDate(targetDate);
}

/**
 * Format date as YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string and return Date object
 */
function parseDate(dateString: string): Date {
  const date = new Date(dateString + 'T00:00:00');
  return date;
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(dateString: string): boolean {
  const date = parseDate(dateString);
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if a date is a Georgia legal holiday
 */
export function isHoliday(dateString: string, holidays?: string[]): boolean {
  const date = parseDate(dateString);
  const year = date.getFullYear();
  
  const yearHolidays = holidays || getGeorgiaHolidays(year);
  return yearHolidays.includes(dateString);
}

/**
 * Check if a date is a business day (not weekend and not holiday)
 */
export function isBusinessDay(dateString: string): boolean {
  return !isWeekend(dateString) && !isHoliday(dateString);
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Add calendar days to a date (used for standard deadlines ≥7 days)
 * O.C.G.A. § 1-3-1: Count all days, extend if ending on weekend/holiday
 * 
 * @param startDate - Starting date (YYYY-MM-DD)
 * @param days - Number of days to add
 * @returns End date (YYYY-MM-DD)
 */
export function addCalendarDays(startDate: string, days: number): string {
  const start = parseDate(startDate);
  
  // Add the specified number of days
  const result = new Date(start.getTime() + (days * 24 * 60 * 60 * 1000));
  let resultString = formatDate(result);
  
  // If result lands on weekend or holiday, extend to next business day
  while (isWeekend(resultString) || isHoliday(resultString)) {
    result.setDate(result.getDate() + 1);
    resultString = formatDate(result);
  }
  
  return resultString;
}

/**
 * Add business days to a date (used for short deadlines <7 days)
 * O.C.G.A. § 1-3-1: Exclude intermediate weekends and holidays
 * 
 * @param startDate - Starting date (YYYY-MM-DD)
 * @param days - Number of business days to add
 * @returns End date (YYYY-MM-DD)
 */
export function addBusinessDays(startDate: string, days: number): string {
  let current = parseDate(startDate);
  let daysAdded = 0;
  
  while (daysAdded < days) {
    // Move to next day
    current.setDate(current.getDate() + 1);
    const currentString = formatDate(current);
    
    // Only count business days
    if (isBusinessDay(currentString)) {
      daysAdded++;
    }
  }
  
  return formatDate(current);
}

/**
 * Add months to a date (used for discovery close calculation)
 * Rule: 6 months from answer = same day, 6 months later
 * If result is weekend/holiday, extend to next business day
 * 
 * @param startDate - Starting date (YYYY-MM-DD)
 * @param months - Number of months to add
 * @returns End date (YYYY-MM-DD)
 */
export function addMonths(startDate: string, months: number): string {
  const start = parseDate(startDate);
  
  // Add months using JavaScript Date logic
  const result = new Date(start.getFullYear(), start.getMonth() + months, start.getDate());
  let resultString = formatDate(result);
  
  // If result lands on weekend or holiday, extend to next business day
  while (isWeekend(resultString) || isHoliday(resultString)) {
    result.setDate(result.getDate() + 1);
    resultString = formatDate(result);
  }
  
  return resultString;
}

/**
 * Calculate answer deadline (30 days from service)
 * Standard deadline (≥7 days) = use calendar days
 */
export function calculateAnswerDeadline(serviceDate: string): string {
  return addCalendarDays(serviceDate, 30);
}

/**
 * Calculate discovery close date (6 months from answer filed)
 * Georgia rule: 6 months from answer date
 */
export function calculateDiscoveryClose(answerFiledDate: string): string {
  return addMonths(answerFiledDate, 6);
}

/**
 * Calculate days remaining until a deadline
 * Negative number = overdue
 */
export function daysUntilDeadline(deadlineDate: string): number {
  const today = formatDate(new Date());
  return daysBetween(today, deadlineDate);
}

/**
 * Calculate discovery close countdown with urgency level
 * Returns object with days remaining and urgency level
 */
export function getDiscoveryCloseStatus(discoveryCloseDate: string) {
  const daysRemaining = daysUntilDeadline(discoveryCloseDate);
  
  let urgency: 'normal' | 'warning' | 'urgent' | 'critical' | 'closed';
  let color: string;
  
  if (daysRemaining < 0) {
    urgency = 'closed';
    color = 'gray';
  } else if (daysRemaining <= 30) {
    urgency = 'critical';
    color = 'red';
  } else if (daysRemaining <= 60) {
    urgency = 'urgent';
    color = 'orange';
  } else if (daysRemaining <= 90) {
    urgency = 'warning';
    color = 'yellow';
  } else {
    urgency = 'normal';
    color = 'green';
  }
  
  return {
    daysRemaining,
    urgency,
    color,
    isClosed: daysRemaining < 0,
    isCritical: daysRemaining <= 30 && daysRemaining >= 0
  };
}

/**
 * Format deadline with +3 day electronic service note
 * (Display only - do not add to calculation per O.C.G.A. § 9-11-6(e))
 */
export function formatDeadlineWithElectronicService(deadline: string) {
  const electronicGraceEnd = addCalendarDays(deadline, 3);
  
  return {
    deadline,
    electronicGraceEnd,
    displayText: `Deadline: ${deadline} (+3 days electronic service grace period ends ${electronicGraceEnd})`
  };
}
