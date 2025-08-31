// Utility functions for chart month grouping logic

export function getMonthName(dateStr: string): string {
  try {
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month}-${day}`).toLocaleString("default", {
      month: "long",
    });
  } catch (error) {
    return "Unknown";
  }
}

export function groupDatesByMonth(
  dates: string[]
): { month: string; start: number; end: number }[] {
  const groups: { month: string; start: number; end: number }[] = [];
  let lastMonth: string | null = null;
  let groupStart = 0;

  for (let i = 0; i < dates.length; i++) {
    const month = getMonthName(dates[i]);
    if (month !== lastMonth) {
      if (lastMonth !== null) {
        groups.push({ month: lastMonth, start: groupStart, end: i - 1 });
      }
      lastMonth = month;
      groupStart = i;
    }
  }

  if (lastMonth !== null) {
    groups.push({ month: lastMonth, start: groupStart, end: dates.length - 1 });
  }

  return groups;
}

// Test function to validate month grouping
export function testMonthGrouping() {
  const testDates = [
    "13-06-2024",
    "14-06-2024",
    "15-06-2024",
    "16-06-2024",
    "17-06-2024",
    "18-06-2024",
    "19-06-2024",
    "20-06-2024",
    "21-06-2024",
    "22-06-2024",
    "23-06-2024",
    "24-06-2024",
    "25-06-2024",
    "26-06-2024",
    "27-06-2024",
    "28-06-2024",
    "29-06-2024",
    "30-06-2024",
    "01-07-2024",
    "02-07-2024",
    "03-07-2024",
    "04-07-2024",
    "05-07-2024",
    "06-07-2024",
    "07-07-2024",
    "08-07-2024",
    "09-07-2024",
    "10-07-2024",
    "11-07-2024",
    "12-07-2024",
  ];

  const groups = groupDatesByMonth(testDates);
  console.log("Month grouping test results:", groups);

  return groups;
}
