-- 1. 使用者主檔
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prepurchased_credit BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 各 API endpoint 定義與單次扣減成本
CREATE TABLE api_endpoints (
  endpoint TEXT PRIMARY KEY,
  credit_cost INT NOT NULL
);

-- 3. 每次 API 呼叫詳細紀錄
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  endpoint TEXT NOT NULL REFERENCES api_endpoints(endpoint),
  credit_cost INT NOT NULL,
  request_payload JSONB,      -- optional: 儲存 request 的 metadata
  response_status INT,        -- optional: HTTP status code
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 月度使用彙總（報表／分析用）
CREATE TABLE monthly_usage (
  user_id UUID NOT NULL REFERENCES users(id),
  year INT NOT NULL,
  month INT NOT NULL,
  total_calls BIGINT NOT NULL DEFAULT 0,
  total_credits_used BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, year, month)
);
