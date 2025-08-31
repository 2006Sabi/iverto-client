import { format } from 'date-fns';

interface ComparisonData {
  workingTime: number;
  awayTime: number;
  idealTime: number;
  productivityScore: number;
}

interface ComparisonPeriod {
  type: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate?: Date;
}

export const generateComparisonDescription = (
  period: ComparisonPeriod,
  data1: ComparisonData,
  data2: ComparisonData,
  periodName: string = 'Comparison'
): string => {
  const total1 = data1.workingTime + data1.awayTime + data1.idealTime;
  const total2 = data2.workingTime + data2.awayTime + data2.idealTime;
  
  const productivity1 = (data1.workingTime / total1) * 100;
  const productivity2 = (data2.workingTime / total2) * 100;
  
  const productivityChange = productivity2 - productivity1;
  const workingTimeChange = data2.workingTime - data1.workingTime;
  const awayTimeChange = data2.awayTime - data1.awayTime;
  const idealTimeChange = data2.idealTime - data1.idealTime;

  let periodDescription = '';
  switch (period.type) {
    case 'day':
      periodDescription = `on ${format(period.startDate, 'MMMM d, yyyy')}`;
      break;
    case 'week':
      periodDescription = `from ${format(period.startDate, 'MMM d')} to ${format(period.endDate!, 'MMM d, yyyy')}`;
      break;
    case 'month':
      periodDescription = `in ${format(period.startDate, 'MMMM yyyy')}`;
      break;
    case 'year':
      periodDescription = `in ${format(period.startDate, 'yyyy')}`;
      break;
  }

  let description = `Comparison ${periodDescription}:\n\n`;

  // Productivity analysis
  if (productivityChange > 0) {
    description += `📈 Productivity improved by ${productivityChange.toFixed(1)}% (${productivity1.toFixed(1)}% → ${productivity2.toFixed(1)}%)\n`;
  } else if (productivityChange < 0) {
    description += `📉 Productivity decreased by ${Math.abs(productivityChange).toFixed(1)}% (${productivity1.toFixed(1)}% → ${productivity2.toFixed(1)}%)\n`;
  } else {
    description += `📊 Productivity remained stable at ${productivity1.toFixed(1)}%\n`;
  }

  // Working time analysis
  if (workingTimeChange > 0) {
    description += `⏰ Working time increased by ${Math.abs(workingTimeChange).toFixed(0)} minutes\n`;
  } else if (workingTimeChange < 0) {
    description += `⏰ Working time decreased by ${Math.abs(workingTimeChange).toFixed(0)} minutes\n`;
  }

  // Away time analysis
  if (awayTimeChange > 0) {
    description += `🚶 Away time increased by ${Math.abs(awayTimeChange).toFixed(0)} minutes\n`;
  } else if (awayTimeChange < 0) {
    description += `🚶 Away time decreased by ${Math.abs(awayTimeChange).toFixed(0)} minutes\n`;
  }

  // Ideal time analysis
  if (idealTimeChange > 0) {
    description += `✨ Ideal time increased by ${Math.abs(idealTimeChange).toFixed(0)} minutes\n`;
  } else if (idealTimeChange < 0) {
    description += `✨ Ideal time decreased by ${Math.abs(idealTimeChange).toFixed(0)} minutes\n`;
  }

  // Performance insights
  if (productivity2 > 80) {
    description += `\n🎯 Excellent performance with ${productivity2.toFixed(1)}% productivity!`;
  } else if (productivity2 > 60) {
    description += `\n✅ Good performance with ${productivity2.toFixed(1)}% productivity.`;
  } else {
    description += `\n⚠️  Performance needs improvement at ${productivity2.toFixed(1)}% productivity.`;
  }

  return description;
};

export const generateSummaryDescription = (
  period: ComparisonPeriod,
  data1: ComparisonData,
  data2: ComparisonData
): string => {
  const total1 = data1.workingTime + data1.awayTime + data1.idealTime;
  const total2 = data2.workingTime + data2.awayTime + data2.idealTime;
  
  const productivity1 = (data1.workingTime / total1) * 100;
  const productivity2 = (data2.workingTime / total2) * 100;

  let summary = '';
  switch (period.type) {
    case 'day':
      summary = `Daily comparison for ${format(period.startDate, 'MMMM d, yyyy')}`;
      break;
    case 'week':
      summary = `Weekly comparison from ${format(period.startDate, 'MMM d')} to ${format(period.endDate!, 'MMM d, yyyy')}`;
      break;
    case 'month':
      summary = `Monthly comparison for ${format(period.startDate, 'MMMM yyyy')}`;
      break;
    case 'year':
      summary = `Yearly comparison for ${format(period.startDate, 'yyyy')}`;
      break;
  }

  summary += ` shows ${productivity2 > productivity1 ? 'improvement' : 'decline'} in productivity from ${productivity1.toFixed(1)}% to ${productivity2.toFixed(1)}%.`;

  return summary;
};
