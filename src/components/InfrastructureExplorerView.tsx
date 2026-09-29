import React, { useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { VillageData } from '../types';

interface InfrastructureExplorerViewProps {
  villages: VillageData[];
  onSelectVillage: (villageCode: number) => void;
}

const SECTORS = [
  { key: 'water', label: 'Water Supply' },
  { key: 'drainage', label: 'Drainage & Sanitation' },
  { key: 'waste', label: 'Waste Disposal' },
  { key: 'road', label: 'Road Connectivity' },
  { key: 'healthcare', label: 'Healthcare (PHC/Subcentre)' },
  { key: 'education', label: 'Education (Schools)' },
  { key: 'digital', label: 'Digital Access' },
  { key: 'transport', label: 'Public Transport' },
  { key: 'electricity', label: 'Power Supply' },
  { key: 'banking', label: 'Banking & ATM' },
];

export const InfrastructureExplorerView: React.FC<InfrastructureExplorerViewProps> = ({
  villages,
  onSelectVillage
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [filterGapOnly, setFilterGapOnly] = useState(false);
  const [search, setSearch] = useState('');

  const filteredVillages = useMemo(() => {
    let list = [...villages];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.village_name.toLowerCase().includes(q) ||
        v.sub_district_name.toLowerCase().includes(q)
      );
    }

    if (selectedSector !== 'All') {
      if (filterGapOnly) {
        list = list.filter(v => (v.gaps as any)[selectedSector] === 1);
      }
    } else if (filterGapOnly) {
      list = list.filter(v => v.infrastructure_gap_count > 0);
    }

    return list;
  }, [villages, selectedSector, filterGapOnly, search]);

  const renderBadge = (val: number | null) => {
    if (val === null || val === undefined) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#9ca3af]/15 text-[#6b7280] border border-[#9ca3af]/30 backdrop-blur-xs">
          <span className="w-1 h-1 rounded-full bg-[#9ca3af]" />
          Data unavailable
        </span>
      );
    }
    if (val === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dc2626]/15 text-[#dc2626] border border-[#dc2626]/30 backdrop-blur-xs">
          <span className="w-1 h-1 rounded-full bg-[#dc2626]" />
          Gap
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16a34a]/15 text-[#15803d] border border-[#16a34a]/30 backdrop-blur-xs">
        <span className="w-1 h-1 rounded-full bg-[#16a34a]" />
        Available
      </span>
    );
  };

  return (
    <div id="infrastructure-explorer-view-container" className="space-y-8 pb-12 text-black font-[Arial,sans-serif]">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs"
              style={{ color: '#000000' }}
            >
              Infrastructure
            </span>
            <span className="text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs">
              CENSUS 2011 BASELINE
            </span>
            <span className="text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs">
              10 DOMAINS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
            Infrastructure & Amenities Baseline
          </h1>
        </div>

        {/* Minimal Legend */}
        <div className="flex items-center gap-2 text-xs bg-white/30 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/60 shadow-[0_4px_16px_0_rgba(0,0,0,0.04),inset_0_1px_1px_0_rgba(255,255,255,0.8)] self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-[#15803d] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
            <span>Available</span>
          </div>
          <span className="text-black/30">·</span>
          <div className="flex items-center gap-1.5 text-[#dc2626] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
            <span>Infrastructure Gap</span>
          </div>
          <span className="text-black/30">·</span>
          <div className="flex items-center gap-1.5 text-[#6b7280] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#9ca3af]" />
            <span>Data unavailable</span>
          </div>
        </div>
      </div>

      {/* Filter and Sector Selection Bar */}
      <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#4B5B47] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search village or taluk name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white/40 backdrop-blur-xs text-[#1F2A1D] placeholder-[#4B5B47]/70 border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] focus:bg-white/60 transition"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="py-2 px-3 text-xs bg-white/40 backdrop-blur-xs text-[#1F2A1D] border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] transition cursor-pointer"
            >
              <option value="All">All 10 Infrastructure Sectors</option>
              {SECTORS.map(s => (
                <option key={s.key} value={s.key}>Sector: {s.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-xs font-medium text-[#1F2A1D] cursor-pointer select-none px-3 py-2 bg-white/40 backdrop-blur-xs rounded-full border border-white/50 shadow-xs">
              <input
                type="checkbox"
                checked={filterGapOnly}
                onChange={(e) => setFilterGapOnly(e.target.checked)}
                className="rounded border-white/60 text-[#336443] focus:ring-[#336443]"
              />
              <span>Show Deficits Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid of Villages with Sector Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVillages.slice(0, 60).map((village) => (
          <div
            key={village.village_code}
            id={`infra-card-${village.village_code}`}
            onClick={() => onSelectVillage(village.village_code)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl border border-white/50 hover:border-white/80 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] transition-all cursor-pointer group space-y-3.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold tracking-tight text-black transition text-sm">
                  {village.village_name}
                </h3>
                <span className="text-xs text-black/80">
                  {village.sub_district_name} • Pop: {village.population.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-black bg-white/40 px-2.5 py-0.5 rounded-full border border-white/50 backdrop-blur-xs">
                  {village.infrastructure_gap_count} Deficits
                </span>
                <span className="text-[10px] text-black/80 block mt-1 font-mono">
                  {Math.round(village.infrastructure_gap_ratio * 100)}% gap ratio
                </span>
              </div>
            </div>

            {/* Matrix of Sector Badges */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-white/30 backdrop-blur-xs rounded-lg border border-white/40 shadow-2xs">
                <span className="text-black font-medium truncate mr-1">Water</span>
                {renderBadge(village.gaps.water)}
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white/30 backdrop-blur-xs rounded-lg border border-white/40 shadow-2xs">
                <span className="text-black font-medium truncate mr-1">Drainage</span>
                {renderBadge(village.gaps.drainage)}
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white/30 backdrop-blur-xs rounded-lg border border-white/40 shadow-2xs">
                <span className="text-black font-medium truncate mr-1">Waste</span>
                {renderBadge(village.gaps.waste)}
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white/30 backdrop-blur-xs rounded-lg border border-white/40 shadow-2xs">
                <span className="text-black font-medium truncate mr-1">Road</span>
                {renderBadge(village.gaps.road)}
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white/30 backdrop-blur-xs rounded-lg border border-white/40 shadow-2xs">
                <span className="text-black font-medium truncate mr-1">Health</span>
                {renderBadge(village.gaps.healthcare)}
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white/30 backdrop-blur-xs rounded-lg border border-white/40 shadow-2xs">
                <span className="text-black font-medium truncate mr-1">Education</span>
                {renderBadge(village.gaps.education)}
              </div>
            </div>

            <div className="pt-2 border-t border-white/30 flex items-center justify-between text-xs text-black font-bold group-hover:translate-x-0.5 transition">
              <span>Inspect full village baseline</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
