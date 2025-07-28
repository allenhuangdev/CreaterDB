import { Metric } from "./types";

const DAY = 86_400_000; // 24 h in ms

export function fillMissingMetrics(input: Metric[], days = 7, nowMs = Date.now()): Metric[] {
  if (!input.length) throw new Error("Input must contain at least one metric");

  const todayMidnightUtc = nowMs !== undefined ? nowMs : new Date(Date.now()).setUTCHours(0, 0, 0, 0);

  const metricByDate = new Map<number, Metric>(input.map((m) => [m.date, m]));
  const sortedMetricDates = input.map((m) => m.date); // already ASC

  // binary search to find the index of the first element greater than the target timestamp
  const upperBound = (targetTimestamp: number): number => {
    let left = 0;
    let right = sortedMetricDates.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (sortedMetricDates[mid] > targetTimestamp) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    return left;
  };

  const results: Metric[] = [];
  const earliestDate = todayMidnightUtc - (days - 1) * DAY;

  for (let offset = 0; offset < days; offset++) {
    const currentDate = earliestDate + offset * DAY;

    // Already have data for that day
    const existingMetric = metricByDate.get(currentDate);
    if (existingMetric) {
      results.push(existingMetric);
      continue;
    }

    // Otherwise find nearest neighbours in O(log n)
    const nextDateIndex = upperBound(currentDate);
    const previousDate = nextDateIndex > 0 ? sortedMetricDates[nextDateIndex - 1] : undefined;
    const nextDate = nextDateIndex < sortedMetricDates.length ? sortedMetricDates[nextDateIndex] : undefined;

    let nearestMetric: Metric;
    if (previousDate === undefined) nearestMetric = metricByDate.get(nextDate!)!;
    else if (nextDate === undefined) nearestMetric = metricByDate.get(previousDate)!;
    else {
      const distanceToPrevious = currentDate - previousDate;
      const distanceToNext = nextDate - currentDate;
      nearestMetric =
        distanceToPrevious <= distanceToNext ? metricByDate.get(previousDate)! : metricByDate.get(nextDate)!;
    }

    results.push({ ...nearestMetric, date: currentDate });
  }

  return results;
}
