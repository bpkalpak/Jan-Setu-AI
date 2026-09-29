import React, { useState, useMemo } from 'react';
import {
  Flame,
  ArrowUpDown,
  Search,
  ChevronRight,
  Filter,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Users,
  Building2,
  Info
} from 'lucide-react';
import { VillageData } from '../types';

interface DemandHotspotsViewProps {
  villages: VillageData[];
  onSelectVillage: (villageCode: number) => void;
}

type SortField =
  | 'priorityScore'
  | 'demandScore'
  | 'infrastructureGapScore'
  | 'populationExposureScore'
  | 'severityScore'
  | 'requestCount'
  | 'infrastructure_gap_count'
  | 'population';

export const DemandHotspotsView: React.FC<DemandHotspotsViewProps> = ({
  villages,
  onSelectVillage
}) => {
  const [sortField, setSortField] = useState<SortField>('priorityScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [talukFilter, setTalukFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showComponentBreakdown, setShowComponentBreakdown] = useState(true);

  // Distinct Taluks
  const taluks = useMemo(() => {
    const set = new Set<string>();
    villages.forEach(v => {
      if (v.sub_district_name) set.add(v.sub_district_name);
    });
    return ['All', ...Array.from(set).sort()];
  }, [villages]);

  const filteredAndSortedVillages = useMemo(() => {
    let list = [...villages];

    if (talukFilter !== 'All') {
      list = list.filter(v => v.sub_district_name === talukFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.village_name.toLowerCase().includes(q) ||
        v.sub_district_name.toLowerCase().includes(q) ||
        v.topCategory.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      if (sortField === 'demandScore') {
        valA = a.priorityComponents.demandScore;
        valB = b.priorityComponents.demandScore;
      } else if (sortField === 'infrastructureGapScore') {
        valA = a.priorityComponents.infrastructureGapScore;
        valB = b.priorityComponents.infrastructureGapScore;
      } else if (sortField === 'populationExposureScore') {
        valA = a.priorityComponents.populationExposureScore;
        valB = b.priorityComponents.populationExposureScore;
      } else if (sortField === 'severityScore') {
        valA = a.priorityComponents.severityScore;
        valB = b.priorityComponents.severityScore;
      } else {
        const rawA = a[sortField];
        const rawB = b[sortField];
        valA = typeof rawA === 'number' ? rawA : 0;
        valB = typeof rawB === 'number' ? rawB : 0;
      }

      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [villages, sortField, sortAsc, talukFilter, search]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div id="demand-hotspots-view-container" className="space-y-8 pb-12">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs">
              Demand Hotspots
            </span>
            <span className="text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs">
              DETERMINISTIC 100-PT AUDIT
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
            Demand Hotspots & Priority Matrix
          </h1>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#4B5B47] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search village name or category..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white/40 backdrop-blur-xs text-[#1F2A1D] placeholder-[#4B5B47]/70 border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] focus:bg-white/60 transition"
            />
          </div>

          {/* Taluk Filter */}
          <select
            value={talukFilter}
            onChange={(e) => setTalukFilter(e.target.value)}
            className="py-2 px-3 text-xs bg-white/40 backdrop-blur-xs text-[#1F2A1D] border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] transition cursor-pointer"
          >
            {taluks.map(t => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Taluks' : `Taluk: ${t}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setShowComponentBreakdown(!showComponentBreakdown)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border border-white/50 bg-white/40 hover:bg-white/60 text-[#1F2A1D] backdrop-blur-xs transition shadow-xs"
          >
            <span>{showComponentBreakdown ? 'Hide 4-Part Scores' : 'Show 4-Part Scores'}</span>
          </button>
          <div className="text-xs text-[#4B5B47]">
            Showing <span className="font-semibold text-[#1F2A1D]">{filteredAndSortedVillages.length}</span> ranked settlements
          </div>
        </div>
      </div>

      {/* Featured Top 3 Hotspot Cards with Large Priority Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredAndSortedVillages.slice(0, 3).map((hotspot, idx) => (
          <div
            key={hotspot.village_code}
            onClick={() => onSelectVillage(hotspot.village_code)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-5 rounded-2xl border border-white/50 hover:border-white/80 transition-all cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-4 group text-black"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-black bg-white/40 px-2 py-0.5 rounded-full border border-white/50 backdrop-blur-xs font-semibold">
                  Rank 0{idx + 1}
                </span>
                <h3 className="text-base font-bold tracking-tight text-black mt-2 transition">
                  {hotspot.village_name}
                </h3>
                <p className="text-xs text-black/80">
                  {hotspot.sub_district_name} Taluk • Pop: {hotspot.population.toLocaleString()}
                </p>
              </div>

              {/* Large Priority Number */}
              <div className="text-right">
                <div className="text-3xl font-bold tracking-tight text-black font-display">
                  {hotspot.priorityScore}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-black font-medium">
                  Observed Priority
                </div>
              </div>
            </div>

            {/* 4 Horizontal Visual Indicators */}
            <div className="space-y-2 pt-1 border-t border-white/30">
              {/* Demand */}
              <div>
                <div className="flex justify-between text-[11px] text-black mb-1">
                  <span>Demand</span>
                  <span className="font-mono font-bold text-black">{hotspot.priorityComponents.demandScore}/35</span>
                </div>
                <div className="w-full bg-white/40 h-1.5 rounded-full overflow-hidden border border-white/40">
                  <div
                    className="bg-[#336443] h-full rounded-full"
                    style={{ width: `${(hotspot.priorityComponents.demandScore / 35) * 100}%` }}
                  />
                </div>
              </div>

              {/* Infra Gap */}
              <div>
                <div className="flex justify-between text-[11px] text-black mb-1">
                  <span>Infrastructure Gap</span>
                  <span className="font-mono font-bold text-black">{hotspot.priorityComponents.infrastructureGapScore}/30</span>
                </div>
                <div className="w-full bg-white/40 h-1.5 rounded-full overflow-hidden border border-white/40">
                  <div
                    className="bg-[#3D5638] h-full rounded-full"
                    style={{ width: `${(hotspot.priorityComponents.infrastructureGapScore / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Population Exposure */}
              <div>
                <div className="flex justify-between text-[11px] text-black mb-1">
                  <span>Population Exposure</span>
                  <span className="font-mono font-bold text-black">{hotspot.priorityComponents.populationExposureScore}/20</span>
                </div>
                <div className="w-full bg-white/40 h-1.5 rounded-full overflow-hidden border border-white/40">
                  <div
                    className="bg-[#85AB8B] h-full rounded-full"
                    style={{ width: `${(hotspot.priorityComponents.populationExposureScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Severity */}
              <div>
                <div className="flex justify-between text-[11px] text-black mb-1">
                  <span>Severity Factor</span>
                  <span className="font-mono font-bold text-black">{hotspot.priorityComponents.severityScore}/15</span>
                </div>
                <div className="w-full bg-white/40 h-1.5 rounded-full overflow-hidden border border-white/40">
                  <div
                    className="bg-[#C25E4B] h-full rounded-full"
                    style={{ width: `${(hotspot.priorityComponents.severityScore / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 text-[11px] font-semibold backdrop-blur-xs">
                {hotspot.topCategory}
              </span>
              <span className="text-black font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition">
                <span>Inspect Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table of All Hotspots */}
      <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] overflow-hidden text-black font-[Arial,sans-serif]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-black">
            <thead className="bg-white/30 backdrop-blur-xs border-b border-white/30 text-black font-bold tracking-wide text-[11px]">
              <tr>
                <th className="py-3.5 px-3 text-black">Rank</th>
                <th className="py-3.5 px-3 text-black">Village / Taluk</th>
                <th
                  className="py-3.5 px-3 cursor-pointer text-black hover:opacity-80 transition"
                  onClick={() => handleSort('population')}
                >
                  <div className="flex items-center gap-1 text-black">
                    <span>Population</span>
                    <ArrowUpDown className="w-3 h-3 text-black" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-3 cursor-pointer text-black hover:opacity-80 transition"
                  onClick={() => handleSort('requestCount')}
                >
                  <div className="flex items-center gap-1 text-black">
                    <span>Requests</span>
                    <ArrowUpDown className="w-3 h-3 text-black" />
                  </div>
                </th>

                {/* 4 Deterministic Priority Component Columns */}
                {showComponentBreakdown && (
                  <>
                    <th
                      className="py-3.5 px-2 cursor-pointer hover:opacity-80 transition text-center bg-white/20 text-black"
                      onClick={() => handleSort('demandScore')}
                    >
                      <div className="flex items-center justify-center gap-0.5 text-black font-bold">
                        <span>Demand (/35)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-2 cursor-pointer hover:opacity-80 transition text-center bg-white/20 text-black"
                      onClick={() => handleSort('infrastructureGapScore')}
                    >
                      <div className="flex items-center justify-center gap-0.5 text-black font-bold">
                        <span>Infra Gap (/30)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-2 cursor-pointer hover:opacity-80 transition text-center bg-white/20 text-black"
                      onClick={() => handleSort('populationExposureScore')}
                    >
                      <div className="flex items-center justify-center gap-0.5 text-black font-bold">
                        <span>Pop. Exp (/20)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="py-3.5 px-2 cursor-pointer hover:opacity-80 transition text-center bg-white/20 text-black"
                      onClick={() => handleSort('severityScore')}
                    >
                      <div className="flex items-center justify-center gap-0.5 text-black font-bold">
                        <span>Severity (/15)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </>
                )}

                <th className="py-3.5 px-3 text-black">Top Category</th>
                <th
                  className="py-3.5 px-3 cursor-pointer hover:opacity-80 transition"
                  onClick={() => handleSort('priorityScore')}
                >
                  <div className="flex items-center gap-1 text-black font-bold">
                    <span>Observed Priority (0–100)</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-black" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-right text-black">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-black">
              {filteredAndSortedVillages.map((village, idx) => (
                <tr
                  key={village.village_code}
                  id={`hotspot-row-${village.village_code}`}
                  onClick={() => onSelectVillage(village.village_code)}
                  className="hover:bg-white/30 cursor-pointer transition text-black"
                >
                  <td className="py-3.5 px-3 font-mono font-bold text-black">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-black">{village.village_name}</div>
                    <div className="text-[11px] text-black/80">{village.sub_district_name}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-black">
                    {village.population.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-black">
                    {village.requestCount}
                  </td>

                  {/* 4 Score Component Cells */}
                  {showComponentBreakdown && (
                    <>
                      <td className="py-3.5 px-2 text-center bg-white/10 font-mono font-bold text-black">
                        {village.priorityComponents.demandScore}
                        <span className="text-[10px] text-black/70 font-normal">/35</span>
                      </td>
                      <td className="py-3.5 px-2 text-center bg-white/10 font-mono font-bold text-black">
                        {village.priorityComponents.infrastructureGapScore}
                        <span className="text-[10px] text-black/70 font-normal">/30</span>
                      </td>
                      <td className="py-3.5 px-2 text-center bg-white/10 font-mono font-bold text-black">
                        {village.priorityComponents.populationExposureScore}
                        <span className="text-[10px] text-black/70 font-normal">/20</span>
                      </td>
                      <td className="py-3.5 px-2 text-center bg-white/10 font-mono font-bold text-black">
                        {village.priorityComponents.severityScore}
                        <span className="text-[10px] text-black/70 font-normal">/15</span>
                      </td>
                    </>
                  )}

                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 text-[11px] font-semibold backdrop-blur-xs">
                      {village.topCategory}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 bg-white/40 h-1.5 rounded-full overflow-hidden border border-white/40">
                        <div
                          className="bg-[#336443] h-full rounded-full"
                          style={{ width: `${village.priorityScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-black font-mono">
                        {village.priorityScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVillage(village.village_code);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-black hover:text-[#336443] font-bold"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
