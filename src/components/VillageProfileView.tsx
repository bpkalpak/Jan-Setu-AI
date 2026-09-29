import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Users,
  Home,
  TrendingUp,
  AlertTriangle,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  FileCheck,
  Flame,
  ArrowRight,
  ShieldCheck,
  Info,
  Calculator,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowLeft,
  Filter,
  Grid,
  FileText,
  Download
} from 'lucide-react';
import { VillageData, ProjectRecommendation } from '../types';
import { api } from '../services/api';
import { downloadCsv } from '../utils/exportCsv';

interface VillageProfileViewProps {
  villageCode: number;
  villages: VillageData[];
  onSelectVillageCode: (code: number) => void;
  onNavigateToAICommand?: (villageCode: number) => void;
}

export const VillageProfileView: React.FC<VillageProfileViewProps> = ({
  villageCode,
  villages,
  onSelectVillageCode,
  onNavigateToAICommand
}) => {
  // Mode: 'profile' (detailed view) or 'directory' (explore list/grid)
  const [viewMode, setViewMode] = useState<'profile' | 'directory'>('profile');
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryTaluk, setDirectoryTaluk] = useState('All');

  const currentVillage = villages.find(v => v.village_code === villageCode) || villages[0];

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [recommendation, setRecommendation] = useState<ProjectRecommendation | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [selectedTargetCategory, setSelectedTargetCategory] = useState<string>('');
  const [showMathDetail, setShowMathDetail] = useState(true);

  // Client-side in-memory caches to prevent repeated roundtrips and conserve API quota
  const summaryCacheRef = React.useRef<Map<number, string>>(new Map());
  const recommendationCacheRef = React.useRef<Map<string, ProjectRecommendation>>(new Map());

  // Distinct Taluks for directory
  const taluks = useMemo(() => {
    const set = new Set<string>();
    villages.forEach(v => {
      if (v.sub_district_name) set.add(v.sub_district_name);
    });
    return ['All', ...Array.from(set).sort()];
  }, [villages]);

  // Filtered villages for directory
  const filteredDirectoryVillages = useMemo(() => {
    let list = [...villages];
    if (directoryTaluk !== 'All') {
      list = list.filter(v => v.sub_district_name === directoryTaluk);
    }
    if (directorySearch.trim()) {
      const q = directorySearch.toLowerCase();
      list = list.filter(v =>
        v.village_name.toLowerCase().includes(q) ||
        v.sub_district_name.toLowerCase().includes(q) ||
        v.topCategory.toLowerCase().includes(q) ||
        v.village_code.toString().includes(q)
      );
    }
    return list;
  }, [villages, directoryTaluk, directorySearch]);

  const handleExportVillagesCSV = () => {
    // Export either the filtered directory or full village dataset
    const datasetToExport = viewMode === 'directory' ? filteredDirectoryVillages : villages;

    const headers = [
      'Census Village Code',
      'Village Name',
      'Taluk / Sub-District',
      'District',
      'State',
      'Population (Census 2011)',
      'Households',
      'Area (Hectares)',
      'Population Density (per Hectare)',
      'Observed Priority Score (0-100)',
      'Demand Component (0-35)',
      'Infra Gap Component (0-30)',
      'Population Exposure Component (0-20)',
      'Severity Component (0-15)',
      'Total Requests Logged',
      'High Severity Requests',
      'Top Grievance Category',
      'Infrastructure Gaps Count',
      'Water Gap',
      'Drainage Gap',
      'Waste Gap',
      'Road Gap',
      'Healthcare Gap',
      'Education Gap',
      'Digital Gap',
      'Transport Gap',
      'Electricity Gap',
      'Banking Gap'
    ];

    const rows = datasetToExport.map(v => [
      v.village_code,
      v.village_name,
      v.sub_district_name,
      v.district_name || 'Bangalore',
      v.state_name || 'KARNATAKA',
      v.population,
      v.households,
      v.area_hectares,
      v.population_density_per_hectare ? v.population_density_per_hectare.toFixed(2) : 0,
      v.priorityScore,
      v.priorityComponents?.demandScore ?? 0,
      v.priorityComponents?.infrastructureGapScore ?? 0,
      v.priorityComponents?.populationExposureScore ?? 0,
      v.priorityComponents?.severityScore ?? 0,
      v.requestCount,
      v.highSeverityCount,
      v.topCategory,
      v.infrastructure_gap_count,
      v.gaps.water === 1 ? 'Gap' : (v.gaps.water === 0 ? 'Available' : 'N/A'),
      v.gaps.drainage === 1 ? 'Gap' : (v.gaps.drainage === 0 ? 'Available' : 'N/A'),
      v.gaps.waste === 1 ? 'Gap' : (v.gaps.waste === 0 ? 'Available' : 'N/A'),
      v.gaps.road === 1 ? 'Gap' : (v.gaps.road === 0 ? 'Available' : 'N/A'),
      v.gaps.healthcare === 1 ? 'Gap' : (v.gaps.healthcare === 0 ? 'Available' : 'N/A'),
      v.gaps.education === 1 ? 'Gap' : (v.gaps.education === 0 ? 'Available' : 'N/A'),
      v.gaps.digital === 1 ? 'Gap' : (v.gaps.digital === 0 ? 'Available' : 'N/A'),
      v.gaps.transport === 1 ? 'Gap' : (v.gaps.transport === 0 ? 'Available' : 'N/A'),
      v.gaps.electricity === 1 ? 'Gap' : (v.gaps.electricity === 0 ? 'Available' : 'N/A'),
      v.gaps.banking === 1 ? 'Gap' : (v.gaps.banking === 0 ? 'Available' : 'N/A')
    ]);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = viewMode === 'directory' && (directorySearch || directoryTaluk !== 'All')
      ? `jansetu_villages_filtered_${timestamp}.csv`
      : `jansetu_villages_intelligence_${timestamp}.csv`;

    downloadCsv(filename, headers, rows);
  };

  useEffect(() => {
    if (currentVillage) {
      setSelectedTargetCategory(currentVillage.topCategory || 'Road');
      
      const cachedRec = recommendationCacheRef.current.get(`${currentVillage.village_code}_${currentVillage.topCategory || 'Road'}`);
      setRecommendation(cachedRec || null);

      if (summaryCacheRef.current.has(currentVillage.village_code)) {
        setAiSummary(summaryCacheRef.current.get(currentVillage.village_code)!);
      } else {
        setAiSummary(null);
        fetchSummary(currentVillage.village_code);
      }
    }
  }, [currentVillage?.village_code]);

  const fetchSummary = async (code: number) => {
    if (summaryCacheRef.current.has(code)) {
      setAiSummary(summaryCacheRef.current.get(code)!);
      return;
    }

    setLoadingSummary(true);
    try {
      const res = await api.getVillageSummary(code);
      if (res?.summary) {
        summaryCacheRef.current.set(code, res.summary);
        setAiSummary(res.summary);
      } else {
        setAiSummary('Executive briefing currently unavailable.');
      }
    } catch (err: any) {
      // Provide a clean fallback without raising an error
      const fallbackMsg = currentVillage
        ? `Observed demand in ${currentVillage.village_name} (${currentVillage.sub_district_name} Taluk) is centered around ${currentVillage.topCategory} with ${currentVillage.requestCount} citizen complaints. The settlement has an observed priority score of ${currentVillage.priorityScore}/100 and ${currentVillage.infrastructure_gap_count} documented public infrastructure deficits in Census 2011 baseline data.`
        : 'Executive briefing currently unavailable.';
      summaryCacheRef.current.set(code, fallbackMsg);
      setAiSummary(fallbackMsg);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateRecommendation = async () => {
    if (!currentVillage) return;
    const targetCat = selectedTargetCategory || currentVillage.topCategory || 'Road';
    const cacheKey = `${currentVillage.village_code}_${targetCat}`;

    if (recommendationCacheRef.current.has(cacheKey)) {
      setRecommendation(recommendationCacheRef.current.get(cacheKey)!);
      return;
    }

    setLoadingRecommendation(true);
    try {
      const res = await api.getProjectRecommendation(
        currentVillage.village_code,
        targetCat
      );
      if (res) {
        recommendationCacheRef.current.set(cacheKey, res);
        setRecommendation(res);
      }
    } catch (err) {
      // Clean fallback if API request fails
      const catReqCount = currentVillage.categoryDistribution?.[targetCat] || 0;
      const isGap = (currentVillage.gaps && (currentVillage.gaps as any)[targetCat.toLowerCase().replace(' ', '')]) === 1;
      const fallbackRec = {
        problem: `High citizen grievance pressure for ${targetCat} in ${currentVillage.village_name}.`,
        evidence: [
          `${catReqCount} citizen requests logged in ${targetCat} category`,
          isGap ? `Census 2011 baseline verifies an infrastructure deficit in ${targetCat}` : `Baseline facility registered in 2011 records`,
          `Estimated affected population: ~${currentVillage.population?.toLocaleString()} residents`
        ],
        suggested_intervention: isGap
          ? `Prioritize new ${targetCat.toLowerCase()} asset commissioning under district public works and schedule site verification by the taluk engineering sub-division.`
          : `Initiate maintenance inspection and capacity augmentation for existing ${targetCat.toLowerCase()} infrastructure.`,
        disclaimer: "Prototype AI-assisted intervention suggestion based on Census 2011 baseline and citizen telemetry."
      };
      recommendationCacheRef.current.set(cacheKey, fallbackRec);
      setRecommendation(fallbackRec);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const renderBadge = (val: number | null) => {
    if (val === null || val === undefined) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F4F6F4] text-[#4B5B47] border border-[#E4E9E3]">
          <span className="w-1 h-1 rounded-full bg-[#4B5B47]" />
          Data unavailable
        </span>
      );
    }
    if (val === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#C25E4B]/10 text-[#C25E4B] border border-[#C25E4B]/20">
          <span className="w-1 h-1 rounded-full bg-[#C25E4B]" />
          Gap Detected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#336443]/10 text-[#336443] border border-[#336443]/20">
        <span className="w-1 h-1 rounded-full bg-[#336443]" />
        Available
      </span>
    );
  };

  if (!currentVillage) {
    return <div className="p-6 text-[#4B5B47]">Select a village to inspect.</div>;
  }

  return (
    <div id="village-profile-view-container" className="space-y-8 pb-12 text-black font-[Arial,sans-serif]">
      {/* Editorial Page Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs"
              style={{ color: '#000000' }}
            >
              Village Explorer
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
            {viewMode === 'directory' ? 'Explore Villages' : currentVillage.village_name}
          </h1>
        </div>

        {/* Header Actions: Export Data + View Mode Switcher Pills */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            id="btn-export-villages-csv"
            onClick={handleExportVillagesCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/30 hover:bg-white/50 backdrop-blur-md text-black border border-white/60 shadow-[0_4px_16px_0_rgba(0,0,0,0.04),inset_0_1px_1px_0_rgba(255,255,255,0.8)] transition cursor-pointer"
            title="Download village dataset as CSV"
          >
            <Download strokeWidth={1.75} className="w-3.5 h-3.5 text-black" />
            <span>Export Data</span>
          </button>

          <div className="inline-flex p-1 rounded-full bg-white/30 backdrop-blur-md border border-white/60 shadow-[0_4px_16px_0_rgba(0,0,0,0.04),inset_0_1px_1px_0_rgba(255,255,255,0.8)]">
            <button
              onClick={() => setViewMode('directory')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                viewMode === 'directory'
                  ? 'bg-white/70 text-black shadow-xs backdrop-blur-xs'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              <Grid strokeWidth={1.75} className="w-3.5 h-3.5" />
              <span>Explore Directory</span>
            </button>
            <button
              onClick={() => setViewMode('profile')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                viewMode === 'profile'
                  ? 'bg-white/70 text-black shadow-xs backdrop-blur-xs'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              <FileText strokeWidth={1.75} className="w-3.5 h-3.5" />
              <span>Village Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Grid View */}
      {viewMode === 'directory' ? (
        <div className="space-y-6 animate-fade-in text-black">
          {/* Search and Taluk Filter */}
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-black/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search villages..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/40 backdrop-blur-xs text-black placeholder-black/50 border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-black focus:bg-white/60 transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={directoryTaluk}
                onChange={(e) => setDirectoryTaluk(e.target.value)}
                className="py-2 px-3 text-xs bg-white/40 backdrop-blur-xs text-black border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-black transition cursor-pointer"
              >
                {taluks.map(t => (
                  <option key={t} value={t}>
                    {t === 'All' ? 'All Taluks' : `Taluk: ${t}`}
                  </option>
                ))}
              </select>

              <span className="text-xs text-black/80">
                Showing <strong className="text-black">{filteredDirectoryVillages.length}</strong> villages
              </span>
            </div>
          </div>

          {/* Grid of Village Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectoryVillages.map((village) => (
              <div
                key={village.village_code}
                onClick={() => {
                  onSelectVillageCode(village.village_code);
                  setViewMode('profile');
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl border border-white/50 hover:border-white/80 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] transition-all cursor-pointer group space-y-4 text-black"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-black transition">
                      {village.village_name}
                    </h3>
                    <p className="text-xs text-black/80 mt-0.5">
                      {village.sub_district_name} Taluk • #{village.village_code}
                    </p>
                  </div>

                  {/* Priority Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight text-black font-display">
                      {village.priorityScore}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-black font-medium">
                      Priority Score
                    </div>
                  </div>
                </div>

                {/* Metrics Pill Row */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 shadow-2xs">
                    <span className="text-[10px] text-black/80 block">Population</span>
                    <strong className="text-xs font-bold text-black mt-0.5 block font-mono">
                      {village.population.toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 shadow-2xs">
                    <span className="text-[10px] text-black/80 block">Requests</span>
                    <strong className="text-xs font-bold text-black mt-0.5 block font-mono">
                      {village.requestCount}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 shadow-2xs">
                    <span className="text-[10px] text-black/80 block">Infra Gaps</span>
                    <strong className="text-xs font-bold text-[#C25E4B] mt-0.5 block font-mono">
                      {village.infrastructure_gap_count} / 10
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/30 flex items-center justify-between text-xs text-black font-bold">
                  <span>Open comprehensive profile</span>
                  <ArrowRight strokeWidth={1.75} className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Detailed Village Profile View */
        <div className="space-y-8 animate-fade-in text-black">
          {/* Top Quick Bar: Return to Directory & Village Switcher */}
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => setViewMode('directory')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:opacity-80 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Village Directory</span>
            </button>

            {/* Switch Village Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-black">Switch Village:</span>
              <select
                id="select-village-profile-switcher"
                value={currentVillage.village_code}
                onChange={(e) => onSelectVillageCode(parseInt(e.target.value, 10))}
                className="py-1.5 px-3 text-xs bg-white/40 backdrop-blur-xs text-black border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-black transition cursor-pointer font-medium"
              >
                {villages.map((v) => (
                  <option key={v.village_code} value={v.village_code}>
                    {v.village_name} ({v.sub_district_name}) — Score: {v.priorityScore}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 1: Demographics & Citizen Demand Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Census 2011 Demographics */}
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-4 text-black">
              <div className="flex items-center justify-between border-b border-white/30 pb-3">
                <h3 className="text-sm font-bold tracking-tight text-black flex items-center gap-2">
                  <Users strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
                  <span>Demographic Profile (Census 2011 Baseline)</span>
                </h3>
                <span className="text-[10px] font-mono text-black font-semibold bg-white/40 px-2 py-0.5 rounded-full border border-white/50 backdrop-blur-xs">
                  Census 2011
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40">
                  <div className="text-black/80 text-[11px]">Total Population</div>
                  <div className="text-xl font-bold tracking-tight text-black mt-1 font-display">
                    {currentVillage.population.toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40">
                  <div className="text-black/80 text-[11px]">Households</div>
                  <div className="text-xl font-bold tracking-tight text-black mt-1 font-display">
                    {currentVillage.households.toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40">
                  <div className="text-black/80 text-[11px]">Geographic Area</div>
                  <div className="text-xl font-bold tracking-tight text-black mt-1 font-display">
                    {currentVillage.area_hectares.toFixed(1)} <span className="text-xs font-normal text-black/70">hectares</span>
                  </div>
                </div>
                <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40">
                  <div className="text-black/80 text-[11px]">Population Density</div>
                  <div className="text-xl font-bold tracking-tight text-black mt-1 font-display">
                    {currentVillage.population_density_per_hectare.toFixed(1)} <span className="text-xs font-normal text-black/70">ppl/ha</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Citizen Demand Profile */}
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-4 text-black">
              <div className="flex items-center justify-between border-b border-white/30 pb-3">
                <h3 className="text-sm font-bold tracking-tight text-black flex items-center gap-2">
                  <TrendingUp strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
                  <span>Observed Citizen Demand (Synthetic Demo)</span>
                </h3>
                <span className="text-[10px] font-bold text-black bg-white/40 px-2.5 py-0.5 rounded-full border border-white/50 backdrop-blur-xs">
                  {currentVillage.requestCount} Requests
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40">
                  <div className="text-black font-bold text-[11px]">Primary Demand Sector</div>
                  <div className="text-xl font-bold tracking-tight text-black mt-1">
                    {currentVillage.topCategory}
                  </div>
                </div>
                <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40">
                  <div className="text-[#C25E4B] font-bold text-[11px]">High Severity Demands</div>
                  <div className="text-xl font-bold tracking-tight text-[#C25E4B] mt-1 font-display">
                    {currentVillage.highSeverityCount}
                  </div>
                </div>
              </div>

              {/* Category distribution pills */}
              <div>
                <div className="text-[11px] font-bold text-black uppercase tracking-wider mb-2">
                  Demand Distribution by Category:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(currentVillage.categoryDistribution || {}).map(([cat, cnt]) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 bg-white/40 text-black text-xs rounded-full border border-white/50 font-medium backdrop-blur-xs"
                    >
                      {cat}: <strong className="text-black font-bold">{cnt}</strong>
                    </span>
                  ))}
                  {Object.keys(currentVillage.categoryDistribution || {}).length === 0 && (
                    <span className="text-xs text-black/70 italic">No logged requests in synthetic baseline.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Explainable Deterministic Priority Engine Card */}
          <div id="section-priority-formula-card" className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-5 text-black">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/30 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flame strokeWidth={1.75} className="w-5 h-5 text-[#336443]" />
                  <h3 className="text-base font-bold tracking-tight text-black">
                    Deterministic Priority Scoring & Mathematical Breakdown
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/40 text-black border border-white/50 backdrop-blur-xs">
                    100% Algorithmic
                  </span>
                </div>
                <p className="text-xs text-black/80 mt-1">
                  Transparent formulation: Priority Score = Demand (0–35) + Infrastructure Gap (0–30) + Population Exposure (0–20) + Severity (0–15)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowMathDetail(!showMathDetail)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-white/40 hover:bg-white/60 border border-white/50 px-3.5 py-1.5 rounded-full transition backdrop-blur-xs shadow-xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{showMathDetail ? 'Hide Math Audit' : 'Show Math Audit'}</span>
                  {showMathDetail ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <div className="text-right pl-4 border-l border-white/30">
                  <div className="text-[10px] text-black/80 uppercase font-mono font-bold">Final Score</div>
                  <div className="text-3xl font-bold tracking-tight text-black font-display">
                    {currentVillage.priorityScore}
                    <span className="text-xs font-normal text-black/80">/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Score Component Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* 1. Demand Score */}
              <div className="bg-white/30 backdrop-blur-xs p-4 rounded-xl border border-white/40 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black font-bold">1. Demand Score</span>
                    <span className="text-[10px] font-mono font-bold text-black bg-white/50 px-1.5 py-0.5 rounded-full border border-white/50">
                      Max: 35
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-black font-display mt-2">
                    {currentVillage.priorityComponents.demandScore}
                    <span className="text-xs font-normal text-black/70">/35</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/30 text-[11px] text-black/80">
                  {currentVillage.requestCount} citizen requests
                </div>
              </div>

              {/* 2. Infrastructure Gap Score */}
              <div className="bg-white/30 backdrop-blur-xs p-4 rounded-xl border border-white/40 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black font-bold">2. Infra Gap Score</span>
                    <span className="text-[10px] font-mono font-bold text-black bg-white/50 px-1.5 py-0.5 rounded-full border border-white/50">
                      Max: 30
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-black font-display mt-2">
                    {currentVillage.priorityComponents.infrastructureGapScore}
                    <span className="text-xs font-normal text-black/70">/30</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/30 text-[11px] text-black/80">
                  {currentVillage.infrastructure_gap_count} Census sector gaps
                </div>
              </div>

              {/* 3. Population Exposure Score */}
              <div className="bg-white/30 backdrop-blur-xs p-4 rounded-xl border border-white/40 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black font-bold">3. Pop. Exposure</span>
                    <span className="text-[10px] font-mono font-bold text-black bg-white/50 px-1.5 py-0.5 rounded-full border border-white/50">
                      Max: 20
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-black font-display mt-2">
                    {currentVillage.priorityComponents.populationExposureScore}
                    <span className="text-xs font-normal text-black/70">/20</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/30 text-[11px] text-black/80">
                  {currentVillage.population.toLocaleString()} residents
                </div>
              </div>

              {/* 4. Severity Score */}
              <div className="bg-white/30 backdrop-blur-xs p-4 rounded-xl border border-white/40 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-black font-bold">4. Severity Factor</span>
                    <span className="text-[10px] font-mono font-bold text-[#C25E4B] bg-white/50 px-1.5 py-0.5 rounded-full border border-white/50">
                      Max: 15
                    </span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-[#C25E4B] font-display mt-2">
                    {currentVillage.priorityComponents.severityScore}
                    <span className="text-xs font-normal text-black/70">/15</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/30 text-[11px] text-black/80">
                  {currentVillage.highSeverityCount} high-severity issues
                </div>
              </div>
            </div>

            {/* Detailed Mathematical Audit Trail */}
            {showMathDetail && (
              <div className="bg-white/30 backdrop-blur-xs p-4 rounded-xl border border-white/40 space-y-3 shadow-2xs text-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                    <Calculator className="w-4 h-4 text-[#336443]" />
                    <span>Transparent Mathematical Derivation for {currentVillage.village_name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-black/80 font-bold">Range: [0 – 100]</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white/40 backdrop-blur-xs rounded-lg border border-white/50 space-y-1">
                    <div className="flex justify-between font-bold text-black">
                      <span>1. Demand Score Calculation</span>
                      <span className="font-mono text-black">{currentVillage.priorityComponents.demandScore} / 35</span>
                    </div>
                    <div className="text-[11px] text-black/80 font-mono bg-white/30 p-2 rounded border border-white/40">
                      {currentVillage.priorityComponents.demandFormula || `(${currentVillage.requestCount} requests / Max) × 35 = ${currentVillage.priorityComponents.demandScore}`}
                    </div>
                  </div>

                  <div className="p-3 bg-white/40 backdrop-blur-xs rounded-lg border border-white/50 space-y-1">
                    <div className="flex justify-between font-bold text-black">
                      <span>2. Infrastructure Gap Calculation</span>
                      <span className="font-mono text-black">{currentVillage.priorityComponents.infrastructureGapScore} / 30</span>
                    </div>
                    <div className="text-[11px] text-black/80 font-mono bg-white/30 p-2 rounded border border-white/40">
                      {currentVillage.priorityComponents.gapFormula || `(${currentVillage.infrastructure_gap_count} gaps / 10) × 30 = ${currentVillage.priorityComponents.infrastructureGapScore}`}
                    </div>
                  </div>

                  <div className="p-3 bg-white/40 backdrop-blur-xs rounded-lg border border-white/50 space-y-1">
                    <div className="flex justify-between font-bold text-black">
                      <span>3. Population Exposure Calculation</span>
                      <span className="font-mono text-black">{currentVillage.priorityComponents.populationExposureScore} / 20</span>
                    </div>
                    <div className="text-[11px] text-black/80 font-mono bg-white/30 p-2 rounded border border-white/40">
                      {currentVillage.priorityComponents.populationFormula || `(√${currentVillage.population.toLocaleString()} / √MaxPop) × 20 = ${currentVillage.priorityComponents.populationExposureScore}`}
                    </div>
                  </div>

                  <div className="p-3 bg-white/40 backdrop-blur-xs rounded-lg border border-white/50 space-y-1">
                    <div className="flex justify-between font-bold text-black">
                      <span>4. Severity Score Calculation</span>
                      <span className="font-mono text-[#C25E4B]">{currentVillage.priorityComponents.severityScore} / 15</span>
                    </div>
                    <div className="text-[11px] text-black/80 font-mono bg-white/30 p-2 rounded border border-white/40">
                      {currentVillage.priorityComponents.severityFormula || `(Severity Weighted Avg) × 15 = ${currentVillage.priorityComponents.severityScore}`}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-black text-white rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs">
                  <span className="text-white/80">Total Sum Formulation:</span>
                  <span className="font-medium text-[#F7F9F7]">
                    {currentVillage.priorityComponents.demandScore} (Demand) + {currentVillage.priorityComponents.infrastructureGapScore} (Gap) + {currentVillage.priorityComponents.populationExposureScore} (Exposure) + {currentVillage.priorityComponents.severityScore} (Severity) = <strong className="text-white text-sm">{currentVillage.priorityScore}/100</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Governance Guarantee */}
            <div className="text-xs text-black/80 bg-white/30 backdrop-blur-xs p-3.5 rounded-xl border border-white/40 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#336443] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black">Algorithmic Explainability & AI Governance Guarantee: </span>
                <span>
                  The priority score ({currentVillage.priorityScore}/100) is computed strictly through this deterministic, auditable formula. Gemini AI is not permitted to modify this priority ranking; Gemini acts exclusively as a semantic natural language summarizer grounded in verified data.
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Infrastructure Checklist (10 Sectors) */}
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-4 text-black">
            <div className="flex items-center justify-between border-b border-white/30 pb-3">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-black flex items-center gap-2">
                  <Building strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
                  <span>Infrastructure Facility Checklist (10 Vital Public Sectors)</span>
                </h3>
                <p className="text-xs text-black/80 mt-0.5">Historical Census 2011 baseline facility presence</p>
              </div>
              <span className="text-xs font-bold text-black bg-white/40 px-3 py-1 rounded-full border border-white/50 backdrop-blur-xs">
                {currentVillage.infrastructure_gap_count} / 10 Deficits Recorded
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">Drinking Water</div>
                <div>{renderBadge(currentVillage.gaps.water)}</div>
              </div>
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">Drainage & Sanitation</div>
                <div>{renderBadge(currentVillage.gaps.drainage)}</div>
              </div>
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">Waste Disposal</div>
                <div>{renderBadge(currentVillage.gaps.waste)}</div>
              </div>
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">Paved Roads</div>
                <div>{renderBadge(currentVillage.gaps.road)}</div>
              </div>
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">Healthcare Facility</div>
                <div>{renderBadge(currentVillage.gaps.healthcare)}</div>
              </div>
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">School & Education</div>
                <div>{renderBadge(currentVillage.gaps.education)}</div>
              </div>
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">Digital Access</div>
                <div>{renderBadge(currentVillage.gaps.digital)}</div>
              </div>
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">Public Transport</div>
                <div>{renderBadge(currentVillage.gaps.transport)}</div>
              </div>
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">Power Supply</div>
                <div>{renderBadge(currentVillage.gaps.electricity)}</div>
              </div>
              <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 space-y-1 shadow-2xs">
                <div className="text-black font-bold">Commercial Bank / ATM</div>
                <div>{renderBadge(currentVillage.gaps.banking)}</div>
              </div>
            </div>
          </div>

          {/* Row 4: Gemini AI Situation Briefing & Prototype Project Recommendation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-black">
            {/* Gemini Executive Briefing */}
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/30 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
                  <h3 className="text-sm font-bold tracking-tight text-black">
                    Gemini AI Village Situation Briefing
                  </h3>
                </div>
                <button
                  onClick={() => fetchSummary(currentVillage.village_code)}
                  disabled={loadingSummary}
                  className="text-xs text-black hover:text-[#336443] flex items-center gap-1 font-bold transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              <div className="p-4 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 text-xs leading-relaxed text-black min-h-[100px]">
                {loadingSummary ? (
                  <div className="flex items-center gap-2 text-black/80 py-4">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#336443]" />
                    <span>Synthesizing village data using Gemini 3.1 Flash Lite...</span>
                  </div>
                ) : (
                  aiSummary || 'Summary not generated.'
                )}
              </div>

              <div className="text-[11px] text-black/80">
                Mandate: Summary strictly mirrors provided Census and request metrics without fabricating external facts.
              </div>
            </div>

            {/* Prototype AI-Assisted Intervention Recommendation */}
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/30 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
                  <h3 className="text-sm font-bold tracking-tight text-black">
                    Prototype AI Project Intervention Recommendation
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-bold text-black">Domain:</label>
                <select
                  value={selectedTargetCategory}
                  onChange={(e) => setSelectedTargetCategory(e.target.value)}
                  className="py-1.5 px-3 text-xs bg-white/40 backdrop-blur-xs text-black border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-black transition cursor-pointer font-medium"
                >
                  {[
                    'Drainage', 'Water', 'Road', 'Waste Management', 'Healthcare',
                    'Education', 'Digital Connectivity', 'Public Transport', 'Electricity', 'Banking'
                  ].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  onClick={handleGenerateRecommendation}
                  disabled={loadingRecommendation}
                  className="py-1.5 px-3.5 bg-[#336443] hover:bg-[#285035] text-white rounded-full text-xs font-medium transition ml-auto flex items-center gap-1.5 shadow-xs"
                >
                  {loadingRecommendation ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-[#85AB8B]" />
                  )}
                  <span>Generate Suggestion</span>
                </button>
              </div>

              {recommendation ? (
                <div className="p-4 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 text-xs space-y-2.5">
                  <div>
                    <span className="font-bold text-black">Identified Problem:</span>
                    <p className="text-black/80 mt-0.5">{recommendation.problem}</p>
                  </div>

                  <div>
                    <span className="font-bold text-black">Data Evidence:</span>
                    <ul className="list-disc list-inside text-black/80 mt-0.5 space-y-0.5">
                      {recommendation.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-black">Suggested Civic Intervention:</span>
                    <p className="text-black font-medium mt-0.5 bg-white/60 backdrop-blur-xs p-2.5 rounded-lg border border-white/40">
                      {recommendation.suggested_intervention}
                    </p>
                  </div>

                  <div className="pt-1 text-[11px] text-black font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{recommendation.disclaimer}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 text-xs text-black/80 text-center py-6">
                  Select a domain and click "Generate Suggestion" to produce structured intervention proposals with data evidence.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
