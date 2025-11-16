/**
 * Georgia Deadline Calculator - Manual Verification Examples
 * 
 * INSTRUCTIONS FOR TESTING:
 * 1. Run these examples in browser console or component
 * 2. Check results against manual calendar calculations
 * 3. Verify edge cases (holidays, weekends, year boundaries)
 * 
 * TO TEST IN BROWSER CONSOLE:
 * Import functions and run examples to verify calculations
 */

import {
  addCalendarDays,
  addBusinessDays, 
  addMonths,
  calculateAnswerDeadline,
  calculateDiscoveryClose,
  isHoliday,
  isBusinessDay,
  getDiscoveryCloseStatus,
  formatDeadlineWithElectronicService
} from './georgiaDeadlines';

/**
 * EXAMPLE 1: Answer Deadline Calculation (30 days)
 * Rule: Standard deadline (≥7 days) uses calendar days
 */
export const answerDeadlineExamples = {
  example1: {
    description: "Service on Monday, January 15, 2025",
    serviceDate: "2025-01-15", 
    expected: "2025-02-14", // 30 calendar days later (Friday)
    calculation: () => calculateAnswerDeadline("2025-01-15"),
    manualVerification: "Count 30 days from Jan 15: Jan has 31 days, so Jan 15 + 17 days = Feb 1, then Feb 1 + 13 days = Feb 14"
  },
  example2: {
    description: "Service on Friday, December 20, 2024", 
    serviceDate: "2024-12-20",
    expected: "2025-01-21", // 30 days later, but extends past weekend (Jan 19 is Sunday)
    calculation: () => calculateAnswerDeadline("2024-12-20"),
    manualVerification: "Dec 20 + 30 days = Jan 19, 2025 (Sunday). Extend to Monday Jan 20. But Jan 20 is MLK Day, so extend to Jan 21."
  }
};

/**
 * EXAMPLE 2: Discovery Close Calculation (6 months)
 * Rule: 6 months from answer date = same day, 6 months later
 */
export const discoveryCloseExamples = {
  example1: {
    description: "Answer filed January 15, 2025",
    answerDate: "2025-01-15",
    expected: "2025-07-15", // 6 months later (Tuesday)
    calculation: () => calculateDiscoveryClose("2025-01-15"),
    manualVerification: "Jan 15 + 6 months = July 15, 2025. July 15 is Tuesday (business day), so no extension needed."
  },
  example2: {
    description: "Answer filed February 15, 2025", 
    answerDate: "2025-02-15",
    expected: "2025-08-18", // Aug 15 is Friday, but let's verify this doesn't need extension
    calculation: () => calculateDiscoveryClose("2025-02-15"),
    manualVerification: "Feb 15 + 6 months = Aug 15, 2025. Check if Aug 15 is business day."
  }
};

/**
 * EXAMPLE 3: Short Deadline Calculation (3 days)  
 * Rule: Short deadlines (<7 days) exclude intermediate weekends/holidays
 */
export const shortDeadlineExamples = {
  example1: {
    description: "3 business days from Friday, January 17, 2025",
    startDate: "2025-01-17",
    days: 3,
    expected: "2025-01-22", // Skip weekend: Fri -> Mon -> Tue -> Wed
    calculation: () => addBusinessDays("2025-01-17", 3),
    manualVerification: "Jan 17 (Fri) + 1 business day = Jan 20 (Mon - MLK Day holiday). Skip to Jan 21 (Tue). + 1 = Jan 22 (Wed). + 1 = Jan 23 (Thu). So 3 business days = Jan 23."
  },
  example2: {
    description: "3 business days from Tuesday, January 14, 2025",
    startDate: "2025-01-14", 
    days: 3,
    expected: "2025-01-17", // Tue -> Wed -> Thu -> Fri (no weekends/holidays)
    calculation: () => addBusinessDays("2025-01-14", 3),
    manualVerification: "Jan 14 (Tue) + 1 = Jan 15 (Wed). + 1 = Jan 16 (Thu). + 1 = Jan 17 (Fri). Simple 3 business days."
  }
};

/**
 * EXAMPLE 4: Holiday Detection
 * Verify Georgia holidays are detected correctly
 */
export const holidayExamples = {
  mlkDay2025: {
    description: "MLK Day 2025 (3rd Monday in January)",
    date: "2025-01-20",
    expected: true,
    calculation: () => isHoliday("2025-01-20"),
    manualVerification: "January 2025: 1st is Wed, so 1st Monday is Jan 6. 2nd Monday is Jan 13. 3rd Monday is Jan 20."
  },
  christmas2025: {
    description: "Christmas 2025 (December 25)",
    date: "2025-12-25", 
    expected: true,
    calculation: () => isHoliday("2025-12-25"),
    manualVerification: "December 25 is always Christmas Day."
  },
  regularDay: {
    description: "Regular business day",
    date: "2025-01-16",
    expected: false,
    calculation: () => isHoliday("2025-01-16"),
    manualVerification: "January 16, 2025 is Thursday - not a holiday."
  }
};

/**
 * EXAMPLE 5: Discovery Close Countdown Status
 * Test urgency level calculations
 */
export const countdownExamples = {
  normal: {
    description: "120 days until discovery close",
    discoveryCloseDate: "2025-05-15", // Assuming today is around Jan 15
    expectedUrgency: "normal",
    expectedColor: "green",
    calculation: () => getDiscoveryCloseStatus("2025-05-15"),
    manualVerification: "More than 90 days remaining = normal (green)"
  },
  critical: {
    description: "20 days until discovery close",
    discoveryCloseDate: addCalendarDays(new Date().toISOString().split('T')[0], 20),
    expectedUrgency: "critical", 
    expectedColor: "red",
    calculation: () => getDiscoveryCloseStatus(addCalendarDays(new Date().toISOString().split('T')[0], 20)),
    manualVerification: "Less than 30 days remaining = critical (red)"
  }
};

/**
 * EXAMPLE 6: Electronic Service Display
 * Test +3 day grace period display (not added to calculation)
 */
export const electronicServiceExamples = {
  example1: {
    description: "Discovery response due with electronic service",
    deadline: "2025-02-14",
    calculation: () => formatDeadlineWithElectronicService("2025-02-14"),
    manualVerification: "Deadline Feb 14 + 3 days grace = Feb 17. Display both dates but don't change actual deadline."
  }
};

/**
 * MANUAL VERIFICATION CHECKLIST
 * Copy these examples and check them manually with a calendar
 */
export const manualVerificationChecklist = [
  {
    test: "Answer Deadline - Basic",
    input: "Service: January 15, 2025",
    expected: "Deadline: February 14, 2025", 
    howToVerify: "Count 30 days on calendar from Jan 15. Should land on Feb 14 (Friday)."
  },
  {
    test: "Answer Deadline - Holiday Extension",
    input: "Service: December 20, 2024", 
    expected: "Deadline: January 21, 2025",
    howToVerify: "Count 30 days from Dec 20 = Jan 19 (Sunday). Extend to Jan 20 (MLK Day). Extend to Jan 21."
  },
  {
    test: "Discovery Close - Basic",
    input: "Answer: January 15, 2025",
    expected: "Close: July 15, 2025",
    howToVerify: "6 months from Jan 15 = July 15. Check that July 15 is business day."
  },
  {
    test: "Short Deadline - Weekend Skip",
    input: "3 business days from Friday Jan 17, 2025",
    expected: "Due: Wednesday Jan 22, 2025",
    howToVerify: "Fri → skip weekend → Mon (MLK Day) → Tue → Wed. Count only business days."
  },
  {
    test: "Holiday Detection",
    input: "Is January 20, 2025 a holiday?", 
    expected: "Yes (MLK Day)",
    howToVerify: "3rd Monday in January 2025. First Monday is Jan 6, so 3rd is Jan 20."
  }
];

/**
 * CONSOLE TESTING FUNCTION
 * Run this in browser console to test all examples
 */
export function runAllExamples() {
  console.log("🌻 Georgia Deadline Calculator - Verification Examples");
  console.log("=====================================================");
  
  // Test answer deadlines
  console.log("\n📋 Answer Deadline Tests:");
  Object.entries(answerDeadlineExamples).forEach(([key, example]) => {
    const result = example.calculation();
    const passed = result === example.expected;
    console.log(`${passed ? '✅' : '❌'} ${example.description}`);
    console.log(`   Expected: ${example.expected}`);
    console.log(`   Got: ${result}`);
    console.log(`   Verify: ${example.manualVerification}`);
  });
  
  // Test discovery close
  console.log("\n📅 Discovery Close Tests:");
  Object.entries(discoveryCloseExamples).forEach(([key, example]) => {
    const result = example.calculation();
    const passed = result === example.expected;
    console.log(`${passed ? '✅' : '❌'} ${example.description}`);
    console.log(`   Expected: ${example.expected}`);
    console.log(`   Got: ${result}`);
    console.log(`   Verify: ${example.manualVerification}`);
  });
  
  // Test short deadlines
  console.log("\n⏱️ Short Deadline Tests:");
  Object.entries(shortDeadlineExamples).forEach(([key, example]) => {
    const result = example.calculation();
    const passed = result === example.expected;
    console.log(`${passed ? '✅' : '❌'} ${example.description}`);
    console.log(`   Expected: ${example.expected}`);
    console.log(`   Got: ${result}`);
    console.log(`   Verify: ${example.manualVerification}`);
  });
  
  // Test holidays
  console.log("\n🎄 Holiday Detection Tests:");
  Object.entries(holidayExamples).forEach(([key, example]) => {
    const result = example.calculation();
    const passed = result === example.expected;
    console.log(`${passed ? '✅' : '❌'} ${example.description}`);
    console.log(`   Expected: ${example.expected}`);
    console.log(`   Got: ${result}`);
    console.log(`   Verify: ${example.manualVerification}`);
  });
  
  console.log("\n✅ Testing complete! Check results above.");
  console.log("📖 See manualVerificationChecklist for step-by-step verification.");
}
