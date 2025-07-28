# Database Schema Design - API Quota Management System

## 需求分析

### 核心功能需求

1. **Credit Management**: 追蹤預購點數並根據 API 端點使用扣除
2. **Usage Tracking**: 記錄詳細的 API 呼叫資訊用於審計和故障排除
3. **Historical Record Keeping**: 儲存月度使用資料用於分析和報告
4. **Monthly Analysis**: 讓用戶能夠查看按月聚合的 API 使用情況
5. **Endpoint-Specific Quotas**: 不同的 API 端點有不同的點數成本

### 技術約束

- 需要維持向後兼容性
- 高效能和可擴展性
- 最小化處理時間和營運成本
- 易於向非技術利害關係人解釋

## 資料庫選擇：SQL (PostgreSQL/MySQL)

### 選擇 SQL 的原因：

1. **ACID 特性**：確保點數扣除的一致性和完整性
2. **複雜查詢支援**：月度分析需要複雜的聚合查詢
3. **事務支援**：點數扣除和使用記錄需要原子性操作
4. **關聯性資料**：用戶、使用記錄、統計間有明確關聯
5. **成熟生態系**：豐富的工具和最佳實務

## 表格設計

### 資料表說明

| Table           | 說明                                                         |
| --------------- | ------------------------------------------------------------ |
| `users`         | 使用者主檔：儲存預付信用額度與基本資訊                       |
| `api_endpoints` | Endpoint 列表：對應每個 API 路徑的信用成本                   |
| `api_usage`     | 詳細使用紀錄：每次呼叫都插入一筆，用於稽核與除錯             |
| `monthly_usage` | 月度彙總表：按年、月彙總呼叫次數與信用消耗，快速生成分析報表 |

### 1. Users Table (用戶表)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prepurchased_credit BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. API endpoint cost (各 API 單次扣減成本)

```sql
CREATE TABLE api_endpoints (
  endpoint TEXT PRIMARY KEY,
  credit_cost INT NOT NULL
);
```

### 3. API Usage History Table (用戶呼叫 API 的詳細記錄)

```sql
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  endpoint TEXT NOT NULL REFERENCES api_endpoints(endpoint),
  credit_cost INT NOT NULL,
  request_payload JSONB,      -- optional: 儲存 request 的 metadata
  response_status INT,        -- optional: HTTP status code
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Monthly Usage Statistics Table (月度使用統計表)

```sql
CREATE TABLE monthly_usage (
  user_id UUID NOT NULL REFERENCES users(id),
  year INT NOT NULL,
  month INT NOT NULL,
  total_calls BIGINT NOT NULL DEFAULT 0,
  total_credits_used BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, year, month)
);
```

## 使用流程設計

### 查詢 credit cost

```ts
const { creditCost } = await db.api_endpoints.findUnique({ where: { endpoint: APIEndpoint.GetTopicItems } });
```

### 建立詳細記錄

```ts
await db.api_usage.create({
  data: {
    userId: currentUser.id,
    endpoint: APIEndpoint.GetTopicItems,
    creditCost,
    requestPayload: {
      /* … */
    },
    responseStatus: 200,
  },
});
```

### 扣減使用者額度

```ts
await db.users.update({
  where: { id: currentUser.id },
  data: { prepurchased_credit: { decrement: creditCost } },
});
```

### 更新月度彙總（Upsert）

```ts
const now = new Date();
await db.monthly_usage.upsert({
  where: {
    userId_year_month: {
      userId: currentUser.id,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
  },
  create: {
    userId: currentUser.id,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    totalCalls: 1,
    totalCreditsUsed: creditCost,
  },
  update: {
    totalCalls: { increment: 1 },
    totalCreditsUsed: { increment: creditCost },
  },
});
```
