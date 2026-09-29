import React, { useState, useMemo } from 'react';
import {
  Users,
  MessageSquareText,
  Building2,
  Flame,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  Layers,
  Sparkles,
  BarChart3,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  CartesianGrid
} from 'recharts';
import { StatsKPI, VillageData } from '../types';
import { PageId } from './Sidebar';

interface DashboardViewProps {
  stats: StatsKPI | null;
  villages: VillageData[];
  onSelectVillage: (villageCode: number) => void;
  onNavigatePage?: (page: PageId) => void;
  onNavigateToRequests?: () => void;
  onNavigateToHotspots?: () => void;
  onNavigateToInfra?: () => void;
}

// Restrained Civic Palette
const CHART_COLORS = {
  primary: '#336443',      // Forest green
  secondary: '#85AB8B',    // Soft sage green
  dark: '#1F2A1D',         // Dark forest
  muted: '#4B5B47',        // Green-gray
  accent: '#3D5638',       // Secondary green
  light: '#E4E9E3',        // Border light
  surface: '#FFFFFF',
  warmBg: '#F7F9F7'
};

const CATEGORY_PALETTE = [
  '#336443',
  '#3D5638',
  '#4E6B48',
  '#63815D',
  '#7A9A73',
  '#85AB8B',
  '#99BCA0',
  '#ADCBB3',
  '#C2DBC7',
  '#D7EAD9'
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  villages,
  onSelectVillage,
  onNavigatePage,
  onNavigateToRequests,
  onNavigateToHotspots,
  onNavigateToInfra
}) => {
  const [selectedTaluk, setSelectedTaluk] = useState<string>('All');

  // Distinct Taluks
  const talukList = useMemo(() => {
    const set = new Set<string>();
    villages.forEach(v => {
      if (v.sub_district_name) set.add(v.sub_district_name);
    });
    return ['All', ...Array.from(set).sort()];
  }, [villages]);

  // Filtered dataset for local drilldown
  const filteredVillages = useMemo(() => {
    if (selectedTaluk === 'All') return villages;
    return villages.filter(v => v.sub_district_name === selectedTaluk);
  }, [villages, selectedTaluk]);

  // Aggregated dynamic metrics
  const activeStats = useMemo(() => {
    const totalPop = filteredVillages.reduce((acc, v) => acc + v.population, 0);
    if (!stats) return null;
    if (selectedTaluk === 'All') {
      return {
        ...stats,
        totalPopulation: totalPop
      };
    }

    const totalRequests = filteredVillages.reduce((acc, v) => acc + v.requestCount, 0);
    const totalHighSeverity = filteredVillages.reduce((acc, v) => acc + v.highSeverityCount, 0);
    const totalGaps = filteredVillages.reduce((acc, v) => acc + v.infrastructure_gap_count, 0);

    return {
      ...stats,
      totalVillages: filteredVillages.length,
      totalPopulation: totalPop,
      totalRequests: totalRequests,
      highSeverityRequests: totalHighSeverity,
      totalInfrastructureGaps: totalGaps
    };
  }, [stats, filteredVillages, selectedTaluk]);

  // Top Category Demand for chart
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVillages.forEach(v => {
      Object.entries(v.categoryDistribution || {}).forEach(([cat, count]) => {
        counts[cat] = (counts[cat] || 0) + count;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [filteredVillages]);

  // Taluk Distribution Data
  const talukChartData = useMemo(() => {
    const map: Record<string, { requests: number; gaps: number }> = {};
    villages.forEach(v => {
      const t = v.sub_district_name || 'Other';
      if (!map[t]) map[t] = { requests: 0, gaps: 0 };
      map[t].requests += v.requestCount;
      map[t].gaps += v.infrastructure_gap_count;
    });

    return Object.entries(map).map(([name, d]) => ({
      name,
      requests: d.requests,
      gaps: d.gaps
    }));
  }, [villages]);

  // Top 5 Hotspots
  const topHotspots = useMemo(() => {
    return [...filteredVillages]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5);
  }, [filteredVillages]);

  return (
    <div id="dashboard-view-container" className="space-y-8 pb-12">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs"
              style={{ color: '#090404' }}
            >
              Executive Overview
            </span>
            <span className="text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs">
              Census 2011 Baseline
            </span>
          </div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight text-black font-[Arial,sans-serif] leading-[30px]"
            style={{ fontFamily: 'Arial, sans-serif', lineHeight: '30px', color: '#000000' }}
          >
            Citizen Demand & Infrastructure Intelligence
          </h1>
        </div>

        {/* Taluk Filter Pill */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <label htmlFor="select-taluk-filter" className="text-xs font-medium text-[#4B5B47]">
            Jurisdiction:
          </label>
          <div className="relative">
            <select
              id="select-taluk-filter"
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              className="py-1.5 pl-3 pr-8 text-xs font-medium text-[#1F2A1D] bg-white border border-[#E4E9E3] rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] appearance-none cursor-pointer shadow-xs"
            >
              {talukList.map(t => (
                <option key={t} value={t}>
                  {t === 'All' ? `All Taluks (${villages.length} Villages)` : `${t} Taluk`}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#4B5B47]">
              <Filter className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Section: Minimalist Editorial Cards */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Citizen Requests */}
          <div
            id="kpi-card-citizen-requests"
            onClick={() => onNavigatePage ? onNavigatePage('requests') : onNavigateToRequests?.()}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-5 rounded-2xl border border-white/50 hover:border-white/80 transition-all cursor-pointer group shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] text-black font-[Arial,sans-serif]"
            style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
          >
            <div className="flex items-center justify-between text-black">
              <span className="text-xs font-semibold">Citizen Requests</span>
              <MessageSquareText strokeWidth={1.75} className="w-4 h-4 text-[#336443] group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-black mt-2 font-[Arial,sans-serif]">
              {activeStats ? activeStats.totalRequests.toLocaleString() : '—'}
            </div>
            <div className="mt-2 text-[11px] text-black/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#336443]" />
              <span>Multilingual citizen telemetry</span>
            </div>
          </div>

          {/* Card 2: Villages Covered */}
          <div
            id="kpi-card-villages"
            onClick={() => onNavigatePage ? onNavigatePage('hotspots') : onNavigateToHotspots?.()}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-5 rounded-2xl border border-white/50 hover:border-white/80 transition-all cursor-pointer group shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] text-black font-[Arial,sans-serif]"
            style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
          >
            <div className="flex items-center justify-between text-black">
              <span className="text-xs font-semibold">Habitations & Villages</span>
              <Building2 strokeWidth={1.75} className="w-4 h-4 text-[#336443] group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-black mt-2 font-[Arial,sans-serif]">
              {activeStats ? activeStats.totalVillages.toLocaleString() : '—'}
            </div>
            <div className="mt-2 text-[11px] text-black/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#85AB8B]" />
              <span>Pop: {activeStats ? activeStats.totalPopulation.toLocaleString() : '—'}</span>
            </div>
          </div>

          {/* Card 3: High-Severity Requests */}
          <div
            id="kpi-card-high-severity"
            onClick={() => onNavigatePage ? onNavigatePage('requests') : onNavigateToRequests?.()}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-5 rounded-2xl border border-white/50 hover:border-white/80 transition-all cursor-pointer group shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] text-black font-[Arial,sans-serif]"
            style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
          >
            <div className="flex items-center justify-between text-black">
              <span className="text-xs font-semibold">High-Severity Demands</span>
              <AlertTriangle strokeWidth={1.75} className="w-4 h-4 text-[#336443] group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-black mt-2 font-[Arial,sans-serif]">
              {activeStats ? activeStats.highSeverityRequests.toLocaleString() : '—'}
            </div>
            <div className="mt-2 text-[11px] text-black/80 flex items-center gap-1.5">
              <span className="text-[#336443] font-bold">
                {activeStats && activeStats.totalRequests > 0
                  ? `${Math.round((activeStats.highSeverityRequests / activeStats.totalRequests) * 100)}%`
                  : '0%'}
              </span>
              <span>of total volume</span>
            </div>
          </div>

          {/* Card 4: Infrastructure Gaps */}
          <div
            id="kpi-card-deficits"
            onClick={() => onNavigatePage ? onNavigatePage('infrastructure') : onNavigateToInfra?.()}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-5 rounded-2xl border border-white/50 hover:border-white/80 transition-all cursor-pointer group shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] text-black font-[Arial,sans-serif]"
            style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
          >
            <div className="flex items-center justify-between text-black">
              <span className="text-xs font-semibold">Facility Baseline Gaps</span>
              <Layers strokeWidth={1.75} className="w-4 h-4 text-[#336443] group-hover:translate-x-0.5 transition" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-black mt-2 font-[Arial,sans-serif]">
              {activeStats ? activeStats.totalInfrastructureGaps.toLocaleString() : '—'}
            </div>
            <div className="mt-2 text-[11px] text-black/80 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <span>Across 10 core amenities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Analytical Charts Row (Restrained Forest / Sage Palette) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Citizen Demand by Domain Category */}
        <div
          className="lg:col-span-7 bg-white/20 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-4 text-black font-[Arial,sans-serif]"
          style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-black">
                Grievance Volume by Sector
              </h3>
              <p className="text-[11px] text-black/80 mt-0.5">
                Breakdown across highest-frequency digital public infrastructure domains
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase text-black bg-white/40 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/50">
              Top 7 Sectors
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.4)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#000000', fontFamily: 'Arial, sans-serif' }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#000000', fontFamily: 'Arial, sans-serif' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.5)' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(51, 100, 67, 0.05)', radius: 6 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const itemIndex = categoryChartData.findIndex(c => c.name === data.name);
                      const color = CATEGORY_PALETTE[itemIndex >= 0 ? itemIndex % CATEGORY_PALETTE.length : 0];
                      return (
                        <div className="bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-xl shadow-[0_8px_24px_-4px_rgba(31,42,29,0.12),0_2px_6px_-1px_rgba(31,42,29,0.06)] border-0 text-xs min-w-[150px] font-[Arial,sans-serif] text-black">
                          <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-[#E4E9E3]">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-bold text-black tracking-tight">
                              {data.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-black">
                            <span className="text-[11px] text-black/80">Citizen Demand</span>
                            <span className="font-bold font-mono text-black">
                              {payload[0].value}{' '}
                              <span className="text-[10px] font-normal text-black/80">requests</span>
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Taluk Requests vs Baseline Gaps */}
        <div
          className="lg:col-span-5 bg-white/20 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-4 text-black font-[Arial,sans-serif]"
          style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-black">
                Demand vs Baseline Gaps by Taluk
              </h3>
              <p className="text-[11px] text-black/80 mt-0.5">
                Comparing citizen request load with recorded Census deficits
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={talukChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="rgba(255,255,255,0.4)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#000000', fontFamily: 'Arial, sans-serif' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#000000', fontFamily: 'Arial, sans-serif' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.5)' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(51, 100, 67, 0.05)', radius: 6 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-xl shadow-[0_8px_24px_-4px_rgba(31,42,29,0.12),0_2px_6px_-1px_rgba(31,42,29,0.06)] border-0 text-xs min-w-[170px] space-y-2 font-[Arial,sans-serif] text-black">
                          <div className="flex items-center justify-between pb-1.5 border-b border-[#E4E9E3]">
                            <span className="font-bold text-black tracking-tight">
                              {data.name} Taluk
                            </span>
                            <span className="text-[10px] font-mono text-black/80 uppercase">Bangalore</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-4 text-black">
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-black/80">
                                <span className="w-2 h-2 rounded-full bg-[#336443]" />
                                <span>Citizen Requests</span>
                              </span>
                              <span className="font-bold font-mono text-black">{data.requests}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-black">
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-black/80">
                                <span className="w-2 h-2 rounded-full bg-[#85AB8B]" />
                                <span>Census Gaps</span>
                              </span>
                              <span className="font-bold font-mono text-[#336443]">{data.gaps}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="requests" name="Requests" fill="#336443" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gaps" name="Census Gaps" fill="#85AB8B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-1 text-[11px] text-black font-[Arial,sans-serif]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#336443]" />
              <span>Citizen Requests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#85AB8B]" />
              <span>Recorded Deficits (Census 2011)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demand Hotspots & Priority Engine Summary */}
      <section className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] overflow-hidden text-black font-[Arial,sans-serif]" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
        <div className="p-5 border-b border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
              <h3 className="text-base font-bold tracking-tight text-black">
                Demand Hotspots: Observed Priority Settlements
              </h3>
            </div>
            <p className="text-xs text-black/80 mt-0.5">
              Ranked via transparent 4-factor formula: Demand (0–35) + Infra Gap (0–30) + Population Exposure (0–20) + Severity (0–15)
            </p>
          </div>

          <button
            onClick={() => onNavigatePage ? onNavigatePage('hotspots') : onNavigateToHotspots?.()}
            className="inline-flex items-center gap-1 text-xs font-bold text-black hover:text-[#336443] transition self-start sm:self-auto bg-white/40 hover:bg-white/60 px-3 py-1.5 rounded-full border border-white/50 shadow-xs cursor-pointer"
          >
            <span>View All Ranked Villages</span>
            <ArrowRight strokeWidth={1.75} className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hotspot Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-[Arial,sans-serif] text-black">
            <thead className="bg-white/30 text-black font-bold border-b border-white/30 backdrop-blur-xs">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Village Name</th>
                <th className="py-3 px-4">Taluk</th>
                <th className="py-3 px-4">Population</th>
                <th className="py-3 px-4">Requests</th>
                <th className="py-3 px-4">Primary Category</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-black">
              {topHotspots.map((v, i) => (
                <tr
                  key={v.village_code}
                  onClick={() => onSelectVillage(v.village_code)}
                  className="hover:bg-white/30 cursor-pointer transition"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-black">
                    0{i + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-black">
                    {v.village_name}
                  </td>
                  <td className="py-3.5 px-4 text-black">
                    {v.sub_district_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-black">
                    {v.population.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-black">
                    {v.requestCount}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/50 text-black border border-white/60 text-[11px] font-bold backdrop-blur-xs">
                      {v.topCategory}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/40 h-1.5 rounded-full overflow-hidden border border-white/40">
                        <div
                          className="bg-[#336443] h-full rounded-full"
                          style={{ width: `${v.priorityScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-black">
                        {v.priorityScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVillage(v.village_code);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-black hover:text-[#336443] font-bold"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Governance Crosswalk Panel */}
      <section
        className="bg-white/20 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-4 text-black font-[Arial,sans-serif]"
        style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
      >
        <div className="flex items-center justify-between border-b border-white/30 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
            <h3 className="text-sm font-bold tracking-tight text-black">
              Administrative Action Matrix (Inter-Departmental Routing)
            </h3>
          </div>
          <span className="text-[11px] font-medium text-black/80">Standard Operating Governance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-white/25 backdrop-blur-xs rounded-xl border border-white/40 shadow-xs space-y-1 text-black">
            <span className="font-bold text-black block">Water & Sanitation</span>
            <p className="text-[11px] text-black/80 leading-relaxed">
              Jal Jeevan Mission & Gram Panchayat Engineering Cell
            </p>
          </div>

          <div className="p-3.5 bg-white/25 backdrop-blur-xs rounded-xl border border-white/40 shadow-xs space-y-1 text-black">
            <span className="font-bold text-black block">Roads & Drainage</span>
            <p className="text-[11px] text-black/80 leading-relaxed">
              PMGSY & Rural Development Department (RDD)
            </p>
          </div>

          <div className="p-3.5 bg-white/25 backdrop-blur-xs rounded-xl border border-white/40 shadow-xs space-y-1 text-black">
            <span className="font-bold text-black block">Healthcare Deficits</span>
            <p className="text-[11px] text-black/80 leading-relaxed">
              National Health Mission (NHM) & District Health Office
            </p>
          </div>

          <div className="p-3.5 bg-white/25 backdrop-blur-xs rounded-xl border border-white/40 shadow-xs space-y-1 text-black">
            <span className="font-bold text-black block">Digital & Banking Access</span>
            <p className="text-[11px] text-black/80 leading-relaxed">
              BharatNet Project & Lead District Bank (LDB)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
