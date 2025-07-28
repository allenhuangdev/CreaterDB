import { fillMissingMetrics } from "./metrics";
import { Metric } from "./types";

const DAY = 86_400_000;
const TODAY = 1_739_328_000_000; // 2024-12-31T00:00:00Z

const ex1: Metric[] = [
  {
    date: TODAY - 11 * DAY,
    averageLikesCount: 100,
    followersCount: 200,
    averageEngagementRate: 0.01,
  },
  {
    date: TODAY - 9 * DAY,
    averageLikesCount: 105,
    followersCount: 202,
    averageEngagementRate: 0.012,
  },
  {
    date: TODAY - 7 * DAY,
    averageLikesCount: 110,
    followersCount: 205,
    averageEngagementRate: 0.015,
  },
  {
    date: TODAY - 6 * DAY,
    averageLikesCount: 120,
    followersCount: 208,
    averageEngagementRate: 0.02,
  },
  {
    date: TODAY - 3 * DAY,
    averageLikesCount: 130,
    followersCount: 210,
    averageEngagementRate: 0.022,
  },
  {
    date: TODAY - 2 * DAY,
    averageLikesCount: 140,
    followersCount: 215,
    averageEngagementRate: 0.023,
  },
  {
    date: TODAY,
    averageLikesCount: 150,
    followersCount: 220,
    averageEngagementRate: 0.025,
  },
];

const ex2: Metric[] = [
  {
    date: TODAY - 5 * DAY,
    averageLikesCount: 120,
    followersCount: 208,
    averageEngagementRate: 0.02,
  },
  {
    date: TODAY,
    averageLikesCount: 150,
    followersCount: 220,
    averageEngagementRate: 0.025,
  },
];

describe("fillMissingMetrics", () => {
  it("fills example 1 correctly", () => {
    const out = fillMissingMetrics(ex1, 7, TODAY);
    expect(out).toHaveLength(7);
    expect(out.map((m) => m.date)).toEqual([
      TODAY - 6 * DAY,
      TODAY - 5 * DAY,
      TODAY - 4 * DAY,
      TODAY - 3 * DAY,
      TODAY - 2 * DAY,
      TODAY - 1 * DAY,
      TODAY,
    ]);
    // spot-check one fill (-5 d comes from -6 d)
    expect(out[1].averageLikesCount).toBe(120);
  });

  it("fills example 2 correctly", () => {
    const out = fillMissingMetrics(ex2, 7, TODAY);
    expect(out.map((m) => m.date)).toEqual([
      TODAY - 6 * DAY,
      TODAY - 5 * DAY,
      TODAY - 4 * DAY,
      TODAY - 3 * DAY,
      TODAY - 2 * DAY,
      TODAY - 1 * DAY,
      TODAY,
    ]);
    // All older fills (-6…-3) clone the -5d datum
    for (let i = 0; i < 4; i++) {
      expect(out[i].averageLikesCount).toBe(120);
    }
    // Last two come from 0 d
    expect(out[4].averageLikesCount).toBe(150);
    expect(out[5].averageLikesCount).toBe(150);
  });
});

describe("fillMissingMetrics - 14 days", () => {
  const DAYS14 = 14;
  const DAY = 86_400_000;
  const TODAY = 1_739_328_000_000;

  // 只保留 5 筆資料（每隔 ~3 天）
  const sparse14: Metric[] = [
    {
      date: TODAY - 13 * DAY,
      averageLikesCount: 100,
      followersCount: 0,
      averageEngagementRate: 0,
    },
    {
      date: TODAY - 10 * DAY,
      averageLikesCount: 200,
      followersCount: 0,
      averageEngagementRate: 0,
    },
    {
      date: TODAY - 7 * DAY,
      averageLikesCount: 300,
      followersCount: 0,
      averageEngagementRate: 0,
    },
    {
      date: TODAY - 4 * DAY,
      averageLikesCount: 400,
      followersCount: 0,
      averageEngagementRate: 0,
    },
    {
      date: TODAY,
      averageLikesCount: 500,
      followersCount: 0,
      averageEngagementRate: 0,
    },
  ];

  it("fills 14-day range correctly", () => {
    const out = fillMissingMetrics(sparse14, DAYS14, TODAY);

    // 確認補完後長度正確
    expect(out).toHaveLength(DAYS14);

    // 日期連續、升冪
    expect(out[0].date).toBe(TODAY - (DAYS14 - 1) * DAY);
    expect(out[DAYS14 - 1].date).toBe(TODAY);
    for (let i = 1; i < DAYS14; i++) {
      expect(out[i].date - out[i - 1].date).toBe(DAY);
    }

    // -6d 應該靠近 -7d（300）
    const idxMinus6 = DAYS14 - 1 - 6;
    expect(out[idxMinus6].averageLikesCount).toBe(300);

    // -3d 應該靠近 -4d（400）
    const idxMinus3 = DAYS14 - 1 - 3;
    expect(out[idxMinus3].averageLikesCount).toBe(400);
  });
});

describe("fillMissingMetrics - 30 days", () => {
  const DAYS30 = 30;
  const DAY = 86_400_000;
  const TODAY = 1_739_328_000_000;

  // 每 5 天才有一筆，共 6 筆
  const sparse30: Metric[] = [
    {
      date: TODAY - 29 * DAY,
      averageLikesCount: 10,
      followersCount: 0,
      averageEngagementRate: 0,
    },
    {
      date: TODAY - 24 * DAY,
      averageLikesCount: 20,
      followersCount: 0,
      averageEngagementRate: 0,
    },
    {
      date: TODAY - 19 * DAY,
      averageLikesCount: 30,
      followersCount: 0,
      averageEngagementRate: 0,
    },
    {
      date: TODAY - 14 * DAY,
      averageLikesCount: 40,
      followersCount: 0,
      averageEngagementRate: 0,
    },
    {
      date: TODAY - 9 * DAY,
      averageLikesCount: 50,
      followersCount: 0,
      averageEngagementRate: 0,
    },
    {
      date: TODAY,
      averageLikesCount: 60,
      followersCount: 0,
      averageEngagementRate: 0,
    },
  ];

  it("fills 30-day range correctly", () => {
    const out = fillMissingMetrics(sparse30, DAYS30, TODAY);

    // 確認補完後長度正確
    expect(out).toHaveLength(DAYS30);

    // 確認起訖日期正確
    expect(out[0].date).toBe(TODAY - (DAYS30 - 1) * DAY);
    expect(out[DAYS30 - 1].date).toBe(TODAY);

    // -28d 應複製 -29d（10）
    expect(out[1].averageLikesCount).toBe(10);

    // -8d 應複製 -9d（50）
    const idxMinus8 = DAYS30 - 1 - 8;
    expect(out[idxMinus8].averageLikesCount).toBe(50);

    // -4d 應複製 0d（60）──距離 4 與 9，比 9d 近
    const idxMinus4 = DAYS30 - 1 - 4;
    expect(out[idxMinus4].averageLikesCount).toBe(60);
  });
});
