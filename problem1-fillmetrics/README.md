# Fill in Missing Daily Metrics

這是一個針對社群數據時間序列的後處理工具，用於「補齊缺欠的每日統計資料」。當某些日期缺少資料時，會使用「距離最近的現有資料」來補上，保證輸出結果為連續、完整的 N 天資料。

---

## 專案結構

```
problem1-fillmetrics/
├── src/
│   ├── metrics.ts         ← 核心函式：fillMissingMetrics()
│   ├── types.ts           ← 定義 Metric 型別
│   └── metrics.test.ts    ← 單元測試
├── package.json           ← 設定 Jest、TypeScript 等
├── jest.config.js         ← Jest 設定檔
```

## 程式邏輯簡介

```ts
fillMissingMetrics(input: Metric[], days = 7, nowMs = Date.now()): Metric[]
```

此函式將根據輸入的 Metric 資料（時間序列），從 **`nowMs`（預設為今天）往前回填 `days` 天的資料**。

### 🔧 回補邏輯：

1. **日期範圍**：從 `today - (days - 1)` 到 `today`，共 `days` 筆
2. **若資料齊全**：直接使用現成的資料
3. **若該日缺資料**：

   - 從現有資料中搜尋「距離最近的日期」
   - 若距離一樣近，「偏好選用較舊（左邊）的資料」
   - 將選到的資料 clone 並設為該日期

---

## 資料型別定義

```ts
type Metric = {
  date: number; // UTC midnight timestamp in ms
  averageLikesCount: number;
  followersCount: number;
  averageEngagementRate: number;
};
```

---

## 測試設計理念（`metrics.test.ts`）

使用 Jest 據程式內部預定的元素輸入、經一定缺排成設計的指标，確保 `fillMissingMetrics()` 能正確補滿資料，且行為合理：

### ✅ 測試 1：Example 1 – 多筆資料，不連續

- 檢查是否補出連續 7 天的資料
- 確認第 2 筆為 -5d，應該複製最近的 -6d

### ✅ 測試 2：Example 2 – 只有兩筆資料

- -6d \~ -3d 都應該複製 -5d 的資料
- -2d \~ -1d 應該複製 0d 的資料

### ✅ 測試 3：14 天與 30 天的缺排測試

- 驗證長时間範圍的補齊邏輯是否穩定
- 確保偏好「距離近」或「較舊」的資料進行補值

---

## 執行測試

```bash
npm install
npm test
```

---

## 說明

- 補資料時使用的是「clone」，並覆蓋 date，保證不影響原始資料
- 日期處理以 UTC midnight 為準，避免時區誤差
- 使用 binary search (`upperBound`) 來效率搜尋鄰近資料（O(log n)

---
