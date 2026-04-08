// OlieCare Ads Agent - Types

export interface AdsCampaign {
  id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED';
  type: string;
  dailyBudget: string;
  metrics: AdsCampaignMetrics;
}

export interface AdsCampaignMetrics {
  clicks: number;
  impressions: number;
  ctr: string;
  avgCpc: string;
  cost: string;
}

export interface AdsAccountOverview {
  period: string;
  clicks: number;
  impressions: number;
  ctr: string;
  avgCpc: string;
  totalCost: string;
  conversions: number;
  costPerConversion: string;
}

export interface AdsKeyword {
  ad_group_criterion: {
    keyword: { text: string; match_type: string };
    status: string;
  };
  metrics: {
    clicks: number;
    impressions: number;
    ctr: number;
    average_cpc: number;
    conversions: number;
    cost_micros: number;
  };
  quality_info?: { quality_score: number };
}

export interface AdsAdPerformance {
  ad_group_ad: {
    ad: {
      id: string;
      responsive_search_ad: {
        headlines: Array<{ text: string }>;
        descriptions: Array<{ text: string }>;
      };
    };
    status: string;
  };
  metrics: {
    clicks: number;
    impressions: number;
    ctr: number;
    conversions: number;
    cost_micros: number;
  };
}

export type AgentActionType = 'pause_campaign' | 'update_budget' | 'pause_keyword' | 'add_keywords' | 'alert';

export interface AgentAction {
  type: AgentActionType;
  target_id: string;
  reason: string;
  params: Record<string, unknown>;
}

export interface AgentAnalysis {
  actions: AgentAction[];
  insights: string[];
  summary: string;
}

export interface AgentRunResult {
  success: boolean;
  result: AgentAnalysis;
}

export interface CreateCampaignPayload {
  name: string;
  budget: number;
  targetCpa?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateAdPayload {
  headlines: string[];
  descriptions: string[];
  finalUrl?: string;
}
