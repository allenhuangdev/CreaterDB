// API Endpoint definitions from the problem
const enum APIEndpoint {
  // creator
  SubmitCreators = "/submit-creators",
  DiscoverCreators = "/discover-creators",
  GetCreatorInfo = "/get-creator-info",

  // keyword
  GetTopicItems = "/get-topic-items",
  GetNicheItems = "/get-niche-items",
  GetHashtagItems = "/get-hashtag-items",

  // Add other endpoints as needed
}

const apiQuotaMap: Record<APIEndpoint, number> = {
  // creator
  [APIEndpoint.SubmitCreators]: 1,
  [APIEndpoint.DiscoverCreators]: 2,
  [APIEndpoint.GetCreatorInfo]: 3,

  // keyword
  [APIEndpoint.GetTopicItems]: 1,
  [APIEndpoint.GetNicheItems]: 1,
  [APIEndpoint.GetHashtagItems]: 1,

  // Add other mappings as needed
} as const;

// Base types for database records
interface BaseRecord {
  createdAt: Date;
  updatedAt: Date;
}

// API Usage History - Individual API call record
type APIUsageRecord = {
  id: string;
  userId: string;
  endpoint: APIEndpoint;
  creditCost: number;
  requestPayload?: Record<string, any>;
  responseStatus?: number;
  calledAt: Date;
};

// monthly_usage table
type MonthlyUsageRecord = {
  userId: string;
  year: number;
  month: number;
  totalCalls: number;
  totalCreditsUsed: number;
};

// users table
type UserTableScheme = {
  userId: string;
  prepurchasedCredit: number;

  /** 關聯：完整的使用紀錄 (audit/troubleshoot) */
  apiUsageHistory?: APIUsageRecord[];

  /** 關聯：每月彙總，做快速報表 */
  monthlyUsage?: MonthlyUsageRecord[];
};
