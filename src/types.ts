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
    demandScore: number;
    infrastructureGapScore: number;
    populationExposureScore: number;
    severityScore: number;
    maxPossibleScore?: number;
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

export interface StatsKPI {
  totalVillages: number;
  totalRequests: number;
  highSeverityRequests: number;
  totalInfrastructureGaps: number;
  priorityVillagesCount: number;
}

export interface AIClassificationResult {
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  summary: string;
  affected_group: string;
  recommended_action: string;
  keywords: string[];
  language: string;
  normalized_english_text?: string;
  isAiGenerated: boolean;
}

export interface ProjectRecommendation {
  problem: string;
  evidence: string[];
  suggested_intervention: string;
  disclaimer: string;
}

export interface AICommandResult {
  query: string;
  data_derived_findings: {
    village_name: string;
    sub_district: string;
    population_2011: number;
    households: number;
    area_hectares: number;
    total_citizen_requests: number;
    high_severity_requests: number;
    top_demand_category: string;
    category_breakdown: Record<string, number>;
    documented_census_gaps: string[];
    priority_score: number;
    priority_components: {
      demandScore: number;
      infrastructureGapScore: number;
      populationExposureScore: number;
      severityScore: number;
    };
  };
  ai_generated_interpretation: {
    summary: string;
    main_demand_categories: string[];
    infrastructure_gaps: string[];
    affected_population: string;
    suggested_intervention: string;
    supporting_data_notes: string;
  };
}
