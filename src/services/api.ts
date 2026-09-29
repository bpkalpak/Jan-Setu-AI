import {
  StatsKPI,
  VillageData,
  CitizenRequest,
  AIClassificationResult,
  ProjectRecommendation,
  AICommandResult
} from '../types';

export const api = {
  async getStats(): Promise<StatsKPI> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch platform KPI statistics');
    return res.json();
  },

  async getVillages(): Promise<VillageData[]> {
    const res = await fetch('/api/villages');
    if (!res.ok) throw new Error('Failed to fetch village records');
    return res.json();
  },

  async getVillage(code: number): Promise<VillageData> {
    const res = await fetch(`/api/villages/${code}`);
    if (!res.ok) throw new Error(`Failed to fetch village ${code}`);
    return res.json();
  },

  async getRequests(params?: {
    villageCode?: number;
    category?: string;
    severity?: string;
    language?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    requests: CitizenRequest[];
  }> {
    const query = new URLSearchParams();
    if (params?.villageCode) query.set('villageCode', params.villageCode.toString());
    if (params?.category) query.set('category', params.category);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.language) query.set('language', params.language);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());

    const res = await fetch(`/api/requests?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch requests');
    return res.json();
  },

  async submitRequest(data: {
    village_code: number;
    category: string;
    description: string;
    language: string;
    severity: 'High' | 'Medium' | 'Low';
    source?: string;
  }): Promise<CitizenRequest> {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit request');
    return res.json();
  },

  async classifyRequest(text: string): Promise<AIClassificationResult> {
    const res = await fetch('/api/gemini/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('AI analysis is temporarily unavailable.');
    return res.json();
  },

  async getVillageSummary(villageCode: number): Promise<{ summary: string }> {
    const res = await fetch('/api/gemini/summarize-village', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ villageCode }),
    });
    if (!res.ok) throw new Error('AI summary is temporarily unavailable.');
    return res.json();
  },

  async getProjectRecommendation(villageCode: number, category?: string): Promise<ProjectRecommendation> {
    const res = await fetch('/api/gemini/project-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ villageCode, category }),
    });
    if (!res.ok) throw new Error('AI recommendation is temporarily unavailable.');
    return res.json();
  },

  async runAICommand(query: string, villageCode: number): Promise<AICommandResult> {
    const res = await fetch('/api/gemini/command-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, villageCode }),
    });
    if (!res.ok) throw new Error('AI Command analysis is temporarily unavailable.');
    return res.json();
  },

  async sendChatMessage(params: {
    messages: Array<{ role: 'user' | 'model'; content: string }>;
    model?: string;
    rolePreset?: string;
    villageCode?: number;
  }): Promise<{ reply: string; modelUsed: string; rolePreset: string }> {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('AI chat response is temporarily unavailable.');
    return res.json();
  }
};
