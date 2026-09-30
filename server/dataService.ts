import fs from 'fs';
import path from 'path';

export interface VillageData {
  village_code: number;
  village_name: string;
  sub_district_name: string;
  district_name: string;
  state_name: string;
  population: number;
  households: number;
  area_hectares: number;
  population_density_per_hectare: number;
  infrastructure_gap_count: number;
  infrastructure_features_observed: number;
  infrastructure_gap_ratio: number;
  gaps: {
    water: number | null;
    drainage: number | null;
    waste: number | null;
    road: number | null;
    healthcare: number | null;
    education: number | null;
    digital: number | null;
    transport: number | null;
    electricity: number | null;
    banking: number | null;
  };
  amenities?: {
    govt_primary_schools: number;
    govt_middle_schools: number;
    govt_secondary_schools: number;
    phc_count: number;
    sub_centre_count: number;
    tap_water_treated: number;
    closed_drainage: number;
    open_drainage: number;
    public_bus: number;
    power_hours_summer: number;
    power_hours_winter: number;
    atm: number;
    commercial_bank: number;
  };
  requestCount: number;
  highSeverityCount: number;
  categoryDistribution: Record<string, number>;
  topCategory: string;
  priorityScore: number;
  priorityComponents: {
    demandScore: number; // 0–35 pts
    infrastructureGapScore: number; // 0–30 pts
    populationExposureScore: number; // 0–20 pts
    severityScore: number; // 0–15 pts
    maxPossibleScore?: number; // 100
    demandFormula?: string;
    gapFormula?: string;
    populationFormula?: string;
    severityFormula?: string;
    calculationExplanation?: string;
  };
}

export interface CitizenRequest {
  request_id: string;
  village_code: number;
  village_name: string;
  district_name: string;
  state_name: string;
  category: string;
  description: string;
  language: string;
  severity: 'High' | 'Medium' | 'Low';
  timestamp: string;
  source: string;
  aiClassification?: string;
  status?: string;
}

class DataService {
  private villages: Map<number, VillageData> = new Map();
  private requests: CitizenRequest[] = [];
  private isLoaded = false;

  constructor() {
    this.loadData();
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  private parseNullableNum(val: string): number | null {
    if (val === '' || val === undefined || val === null) return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }

  public loadData() {
    try {
      const candidates = [
        path.join(process.cwd(), 'data'),
        path.resolve('data'),
        path.join('/var/task', 'data')
      ];
      const dataDir = candidates.find(dir => fs.existsSync(path.join(dir, 'infrastructure_features_bangalore.csv'))) || path.join(process.cwd(), 'data');
      const infraPath = path.join(dataDir, 'infrastructure_features_bangalore.csv');
      const amenitiesPath = path.join(dataDir, 'village_amenities_bangalore_clean.csv');
      const requestsPath = path.join(dataDir, 'citizen_requests_bangalore_synthetic.csv');

      if (!fs.existsSync(infraPath)) {
        console.warn('Data files not found at:', infraPath);
        return;
      }

      // 1. Load infrastructure features
      const infraLines = fs.readFileSync(infraPath, 'utf-8').split('\n').filter(l => l.trim().length > 0);
      const infraHeaders = this.parseCSVLine(infraLines[0]);
      
      this.villages.clear();

      for (let i = 1; i < infraLines.length; i++) {
        const row = this.parseCSVLine(infraLines[i]);
        if (row.length < 5) continue;
        const code = parseInt(row[0], 10);
        if (isNaN(code)) continue;

        const pop = parseInt(row[5], 10) || 0;
        const hh = parseFloat(row[6]) || 0;
        const area = parseFloat(row[7]) || 0;
        const density = parseFloat(row[18]) || (area > 0 ? pop / area : 0);
        const gapCount = parseFloat(row[19]) || 0;
        const observed = parseInt(row[20], 10) || 10;
        const gapRatio = parseFloat(row[21]) || (observed > 0 ? gapCount / observed : 0);

        const village: VillageData = {
          village_code: code,
          village_name: row[1],
          sub_district_name: row[2],
          district_name: row[3] || 'Bangalore',
          state_name: row[4] || 'KARNATAKA',
          population: pop,
          households: hh,
          area_hectares: area,
          population_density_per_hectare: density,
          infrastructure_gap_count: gapCount,
          infrastructure_features_observed: observed,
          infrastructure_gap_ratio: gapRatio,
          gaps: {
            water: this.parseNullableNum(row[8]),
            drainage: this.parseNullableNum(row[9]),
            waste: this.parseNullableNum(row[10]),
            road: this.parseNullableNum(row[11]),
            healthcare: this.parseNullableNum(row[12]),
            education: this.parseNullableNum(row[13]),
            digital: this.parseNullableNum(row[14]),
            transport: this.parseNullableNum(row[15]),
            electricity: this.parseNullableNum(row[16]),
            banking: this.parseNullableNum(row[17]),
          },
          requestCount: 0,
          highSeverityCount: 0,
          categoryDistribution: {},
          topCategory: 'None',
          priorityScore: 0,
          priorityComponents: {
            demandScore: 0,
            infrastructureGapScore: 0,
            populationExposureScore: 0,
            severityScore: 0,
          }
        };
        this.villages.set(code, village);
      }

      // 2. Load amenities baseline (Census 2009/2011)
      if (fs.existsSync(amenitiesPath)) {
        const amenLines = fs.readFileSync(amenitiesPath, 'utf-8').split('\n').filter(l => l.trim().length > 0);
        for (let i = 1; i < amenLines.length; i++) {
          const row = this.parseCSVLine(amenLines[i]);
          if (row.length < 8) continue;
          const code = parseInt(row[6], 10);
          const v = this.villages.get(code);
          if (v) {
            v.amenities = {
              govt_primary_schools: parseFloat(row[16]) || 0,
              govt_middle_schools: parseFloat(row[17]) || 0,
              govt_secondary_schools: parseFloat(row[18]) || 0,
              phc_count: parseFloat(row[21]) || 0,
              sub_centre_count: parseFloat(row[22]) || 0,
              tap_water_treated: parseFloat(row[23]) || 0,
              closed_drainage: parseFloat(row[25]) || 0,
              open_drainage: parseFloat(row[26]) || 0,
              public_bus: parseFloat(row[32]) || 0,
              power_hours_summer: parseFloat(row[43]) || 18,
              power_hours_winter: parseFloat(row[44]) || 20,
              atm: parseFloat(row[38]) || 0,
              commercial_bank: parseFloat(row[39]) || 0,
            };
          }
        }
      }

      // 3. Load requests
      if (fs.existsSync(requestsPath)) {
        const reqLines = fs.readFileSync(requestsPath, 'utf-8').split('\n').filter(l => l.trim().length > 0);
        this.requests = [];
        for (let i = 1; i < reqLines.length; i++) {
          const row = this.parseCSVLine(reqLines[i]);
          if (row.length < 9) continue;
          const code = parseInt(row[1], 10);
          const item: CitizenRequest = {
            request_id: row[0],
            village_code: code,
            village_name: row[2],
            district_name: row[3] || 'Bangalore',
            state_name: row[4] || 'KARNATAKA',
            category: row[5],
            description: row[6],
            language: row[7],
            severity: (row[8] as 'High' | 'Medium' | 'Low') || 'Medium',
            timestamp: row[9],
            source: row[10] || 'Synthetic Demo Data',
            aiClassification: row[5],
            status: 'Registered'
          };
          this.requests.push(item);
        }
      }

      this.recalculatePriority();
      this.isLoaded = true;
      console.log(`JanSetu DataService initialized: ${this.villages.size} villages, ${this.requests.length} requests.`);
    } catch (err) {
      console.error('Error loading datasets:', err);
    }
  }

  public recalculatePriority() {
    // Reset counters
    for (const v of this.villages.values()) {
      v.requestCount = 0;
      v.highSeverityCount = 0;
      v.categoryDistribution = {};
    }

    // Accumulate requests
    for (const r of this.requests) {
      const v = this.villages.get(r.village_code);
      if (v) {
        v.requestCount += 1;
        if (r.severity === 'High') v.highSeverityCount += 1;
        v.categoryDistribution[r.category] = (v.categoryDistribution[r.category] || 0) + 1;
      }
    }

    // Find maxima for normalization
    let maxRequests = 1;
    let maxPopulation = 1;

    for (const v of this.villages.values()) {
      if (v.requestCount > maxRequests) maxRequests = v.requestCount;
      if (v.population > maxPopulation) maxPopulation = v.population;
      
      // Determine top category
      let topCat = 'None';
      let maxCatCount = 0;
      for (const [cat, cnt] of Object.entries(v.categoryDistribution)) {
        if (cnt > maxCatCount) {
          maxCatCount = cnt;
          topCat = cat;
        }
      }
      v.topCategory = topCat;
    }

    // Calculate deterministic priority score:
    // Formula: Priority Score = Demand Score (0–35) + Infrastructure Gap Score (0–30) + Population Exposure Score (0–20) + Severity Score (0–15)
    // Absolute ceiling = 100.
    // NOTE: Gemini is strictly prohibited from directly assigning or overriding this score.
    for (const v of this.villages.values()) {
      // 1. Demand Score (0 - 35):
      // Ratio of village's logged requests to maximum requests recorded in any village across the district dataset.
      const demandRatio = maxRequests > 0 ? (v.requestCount / maxRequests) : 0;
      const demandScore = Math.round(demandRatio * 35);
      const demandFormula = `(${v.requestCount} requests / ${maxRequests} max) × 35 = ${demandScore}`;

      // 2. Infrastructure Gap Score (0 - 30):
      // Ratio of missing amenities out of 10 tracked Census 2011 infrastructure sectors.
      const gapScore = Math.round(v.infrastructure_gap_ratio * 30);
      const gapFormula = `(${v.infrastructure_gap_count} gaps / ${v.infrastructure_features_observed} tracked) × 30 = ${gapScore}`;

      // 3. Population Exposure Score (0 - 20):
      // Sub-linear square root scaling of Census 2011 population relative to the largest settlement in the dataset.
      // Square root scaling ensures large settlements receive appropriate exposure weighting without crowding out smaller vulnerable hamlets.
      const popRatio = v.population > 0 ? Math.sqrt(v.population) / Math.sqrt(maxPopulation) : 0;
      const populationExposureScore = Math.round(popRatio * 20);
      const populationFormula = `(√${v.population.toLocaleString()} / √${maxPopulation.toLocaleString()}) × 20 = ${populationExposureScore}`;

      // 4. Severity Score (0 - 15):
      // Weighted average of citizen request severity: High = 1.0, Medium = 0.6, Low = 0.3.
      // Defaults to 0.4 baseline if zero requests are logged.
      let weightedSeveritySum = 0;
      let reqCountForVillage = 0;
      for (const r of this.requests) {
        if (r.village_code === v.village_code) {
          reqCountForVillage += 1;
          if (r.severity === 'High') weightedSeveritySum += 1.0;
          else if (r.severity === 'Medium') weightedSeveritySum += 0.6;
          else weightedSeveritySum += 0.3;
        }
      }
      const avgSeverityWeight = reqCountForVillage > 0 ? (weightedSeveritySum / reqCountForVillage) : 0.4;
      const severityScore = Math.round(avgSeverityWeight * 15);
      const severityFormula = reqCountForVillage > 0
        ? `(${weightedSeveritySum.toFixed(1)} weighted sum / ${reqCountForVillage} requests) × 15 = ${severityScore}`
        : `(Baseline 0.4 / 1.0) × 15 = ${severityScore}`;

      // Final 0–100 score: Direct sum capped between 0 and 100
      const totalPriority = Math.min(100, Math.max(0, demandScore + gapScore + populationExposureScore + severityScore));

      v.priorityScore = totalPriority;
      v.priorityComponents = {
        demandScore,
        infrastructureGapScore: gapScore,
        populationExposureScore,
        severityScore,
        maxPossibleScore: 100,
        demandFormula,
        gapFormula,
        populationFormula,
        severityFormula,
        calculationExplanation: `${demandScore} (Demand) + ${gapScore} (Infra Gap) + ${populationExposureScore} (Population) + ${severityScore} (Severity) = ${totalPriority}/100`
      };
    }
  }

  public getStats() {
    if (this.villages.size === 0) {
      this.loadData();
    }
    const totalVillages = this.villages.size;
    const totalRequests = this.requests.length;
    const highSeverityRequests = this.requests.filter(r => r.severity === 'High').length;
    
    let totalInfrastructureGaps = 0;
    let priorityVillagesCount = 0; // priority score >= 70

    for (const v of this.villages.values()) {
      totalInfrastructureGaps += v.infrastructure_gap_count;
      if (v.priorityScore >= 70) {
        priorityVillagesCount += 1;
      }
    }

    return {
      totalVillages,
      totalRequests,
      highSeverityRequests,
      totalInfrastructureGaps,
      priorityVillagesCount
    };
  }

  public getAllVillages(): VillageData[] {
    if (this.villages.size === 0) {
      this.loadData();
    }
    return Array.from(this.villages.values());
  }

  public getVillage(code: number): VillageData | undefined {
    if (this.villages.size === 0) {
      this.loadData();
    }
    return this.villages.get(code);
  }

  public getRequests(filters?: {
    villageCode?: number;
    category?: string;
    severity?: string;
    language?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    if (this.requests.length === 0) {
      this.loadData();
    }
    let filtered = [...this.requests];

    if (filters?.villageCode) {
      filtered = filtered.filter(r => r.village_code === filters.villageCode);
    }
    if (filters?.category && filters.category !== 'All') {
      filtered = filtered.filter(r => r.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.severity && filters.severity !== 'All') {
      filtered = filtered.filter(r => r.severity === filters.severity);
    }
    if (filters?.language && filters.language !== 'All') {
      filtered = filtered.filter(r => r.language.toLowerCase() === filters.language!.toLowerCase());
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.request_id.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.village_name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    // Sort by timestamp desc
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = filtered.length;
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 25;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      requests: paginated
    };
  }

  public addRequest(newReq: {
    village_code: number;
    category: string;
    description: string;
    language: string;
    severity: 'High' | 'Medium' | 'Low';
    source?: string;
  }): CitizenRequest {
    const v = this.villages.get(newReq.village_code);
    const vName = v ? v.village_name : 'Bangalore';
    const idNum = this.requests.length + 1;
    const req: CitizenRequest = {
      request_id: `REQ${idNum.toString().padStart(6, '0')}`,
      village_code: newReq.village_code,
      village_name: vName,
      district_name: 'Bangalore',
      state_name: 'KARNATAKA',
      category: newReq.category,
      description: newReq.description,
      language: newReq.language,
      severity: newReq.severity,
      timestamp: new Date().toISOString().substring(0, 16),
      source: newReq.source || 'Citizen Portal (Demo)',
      aiClassification: newReq.category,
      status: 'Under Review'
    };

    this.requests.unshift(req);
    this.recalculatePriority();
    return req;
  }
}

export const dataService = new DataService();
