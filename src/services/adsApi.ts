// OlieCare Ads Agent - API Service
import axios from 'axios';
import type {
  AdsCampaign,
  AdsAccountOverview,
  AdsKeyword,
  AdsAdPerformance,
  AgentAnalysis,
  AgentRunResult,
  CreateCampaignPayload,
  CreateAdPayload,
} from '../types/ads';

const ADS_API_URL = import.meta.env.VITE_ADS_API_URL || (
  import.meta.env.PROD ? '/ads-api' : 'http://localhost:3002'
);

const adsApi = axios.create({
  baseURL: ADS_API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export const adsService = {
  // Campaigns
  listCampaigns: async (): Promise<AdsCampaign[]> => {
    const { data } = await adsApi.get('/api/campaigns');
    return data;
  },

  createCampaign: async (payload: CreateCampaignPayload) => {
    const { data } = await adsApi.post('/api/campaigns', payload);
    return data;
  },

  updateCampaignStatus: async (id: string, status: string) => {
    const { data } = await adsApi.patch(`/api/campaigns/${id}/status`, { status });
    return data;
  },

  updateCampaignBudget: async (id: string, budget: number) => {
    const { data } = await adsApi.patch(`/api/campaigns/${id}/budget`, { budget });
    return data;
  },

  // Keywords
  getKeywordPerformance: async (campaignId: string): Promise<AdsKeyword[]> => {
    const { data } = await adsApi.get(`/api/keywords/campaign/${campaignId}`);
    return data;
  },

  addNegativeKeywords: async (campaignId: string, keywords: string[]) => {
    const { data } = await adsApi.post(`/api/keywords/negative/${campaignId}`, { keywords });
    return data;
  },

  // Ads
  createAd: async (adGroupId: string, payload: CreateAdPayload) => {
    const { data } = await adsApi.post(`/api/ads/adgroup/${adGroupId}`, payload);
    return data;
  },

  getAdPerformance: async (campaignId: string): Promise<AdsAdPerformance[]> => {
    const { data } = await adsApi.get(`/api/ads/campaign/${campaignId}/performance`);
    return data;
  },

  // Reports
  getOverview: async (days = 7): Promise<AdsAccountOverview> => {
    const { data } = await adsApi.get('/api/reports/overview', { params: { days } });
    return data;
  },

  getCampaignReport: async (days = 30) => {
    const { data } = await adsApi.get('/api/reports/campaigns', { params: { days } });
    return data;
  },

  // Agent
  runAgent: async (): Promise<AgentRunResult> => {
    const { data } = await adsApi.post('/api/agent/run');
    return data;
  },

  analyzeOnly: async (): Promise<{ success: boolean; analysis: AgentAnalysis }> => {
    const { data } = await adsApi.post('/api/agent/analyze');
    return data;
  },
};
