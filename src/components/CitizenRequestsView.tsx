import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Languages,
  X,
  ExternalLink,
  MapPin,
  Sparkles,
  Info,
  Calendar,
  Building,
  CheckCircle2,
  Download
} from 'lucide-react';
import { CitizenRequest, VillageData } from '../types';
import { api } from '../services/api';
import { downloadCsv } from '../utils/exportCsv';

interface CitizenRequestsViewProps {
  villages: VillageData[];
  onSelectVillage: (villageCode: number) => void;
  onOpenNewRequestModal?: () => void;
}

export const CitizenRequestsView: React.FC<CitizenRequestsViewProps> = ({
  villages,
  onSelectVillage,
  onOpenNewRequestModal
}) => {
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');

  // Slide-over modal state
  const [activeRequest, setActiveRequest] = useState<CitizenRequest | null>(null);

  const categories = [
    'All',
    'Water',
    'Drainage',
    'Waste',
    'Road',
    'Healthcare',
    'Education',
    'Digital',
    'Transport',
    'Electricity',
    'Banking'
  ];

  // Fetch Requests when filters or pagination change
  useEffect(() => {
    let isCancelled = false;
    const loadRequests = async () => {
      setLoading(true);
      try {
        const filters: any = { page, pageSize };
        if (search.trim()) filters.search = search.trim();
        if (selectedVillage !== 'All') filters.villageCode = parseInt(selectedVillage, 10);
        if (selectedCategory !== 'All') filters.category = selectedCategory;
        if (selectedSeverity !== 'All') filters.severity = selectedSeverity;
        if (selectedLanguage !== 'All') filters.language = selectedLanguage;

        const res = await api.getRequests(filters);
        if (!isCancelled) {
          setRequests(res.requests);
          setTotal(res.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    const timer = setTimeout(loadRequests, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [page, search, selectedVillage, selectedCategory, selectedSeverity, selectedLanguage]);

  const totalPages = Math.ceil(total / pageSize) || 1;
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      let dataToExport = requests;
      // If there are more total results than the current page, fetch all matching the active filters
      if (total > requests.length) {
        const filters: any = { page: 1, pageSize: 10000 };
        if (search.trim()) filters.search = search.trim();
        if (selectedVillage !== 'All') filters.villageCode = parseInt(selectedVillage, 10);
        if (selectedCategory !== 'All') filters.category = selectedCategory;
        if (selectedSeverity !== 'All') filters.severity = selectedSeverity;
        if (selectedLanguage !== 'All') filters.language = selectedLanguage;

        const res = await api.getRequests(filters);
        if (res && res.requests) {
          dataToExport = res.requests;
        }
      }

      const headers = [
        'Request ID',
        'Census Village Code',
        'Village Name',
        'Taluk / Sub-District',
        'District',
        'State',
        'Category',
        'Severity',
        'Language',
        'Status',
        'Citizen Description',
        'Created Date',
        'Source'
      ];

      const villageMap = new Map(villages.map(v => [v.village_code, v]));

      const rows = dataToExport.map(r => {
        const v = villageMap.get(r.village_code);
        return [
          r.request_id,
          r.village_code,
          r.village_name,
          v?.sub_district_name || '',
          r.district_name || 'Bangalore',
          r.state_name || 'KARNATAKA',
          r.category,
          r.severity,
          r.language,
          r.status || 'Logged',
          r.description,
          r.timestamp || '',
          r.source || 'Citizen Grievance Portal'
        ];
      });

      const timestamp = new Date().toISOString().split('T')[0];
      downloadCsv(`jansetu_citizen_requests_${timestamp}.csv`, headers, rows);
    } catch (err) {
      console.error('Failed to export citizen requests CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  const getSeverityIndicator = (sev: string) => {
    switch (sev) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#C25E4B]/10 text-[#C25E4B] border border-[#C25E4B]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C25E4B]" />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#D98A3E]/10 text-[#B86B24] border border-[#D98A3E]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D98A3E]" />
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#336443]/10 text-[#336443] border border-[#336443]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#336443]" />
            Low
          </span>
        );
    }
  };

  return (
    <div id="citizen-requests-view-container" className="space-y-6 pb-12">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs"
              style={{ color: '#000000' }}
            >
              Citizen Requests
            </span>
            <span className="text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs">
              CENSUS 2011 BASELINE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
            Citizen Requests Registry
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            id="btn-export-requests-csv"
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/30 hover:bg-white/50 backdrop-blur-md text-[#1F2A1D] border border-white/60 shadow-[0_4px_16px_0_rgba(0,0,0,0.04),inset_0_1px_1px_0_rgba(255,255,255,0.8)] transition cursor-pointer disabled:opacity-50"
            title="Download current citizen requests dataset as CSV"
          >
            <Download strokeWidth={1.75} className="w-3.5 h-3.5 text-[#336443]" />
            <span>{exporting ? 'Exporting...' : 'Export Data'}</span>
          </button>

          <div className="text-xs font-mono text-[#1F2A1D] bg-white/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/60 shadow-[0_4px_16px_0_rgba(0,0,0,0.04),inset_0_1px_1px_0_rgba(255,255,255,0.8)]">
            {total.toLocaleString()} logged entries
          </div>
        </div>
      </div>

      {/* Pill Search and Filter Controls */}
      <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Bar */}
          <div className="relative lg:col-span-1">
            <Search className="w-3.5 h-3.5 text-[#4B5B47] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-requests"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search description, village..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white/40 backdrop-blur-xs text-[#1F2A1D] placeholder-[#4B5B47]/70 border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] focus:bg-white/60 transition"
            />
          </div>

          {/* Village Filter */}
          <div>
            <select
              id="select-filter-village"
              value={selectedVillage}
              onChange={(e) => {
                setSelectedVillage(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-white/40 backdrop-blur-xs text-[#1F2A1D] border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] transition cursor-pointer"
            >
              <option value="All">All Villages ({villages.length})</option>
              {villages.map((v) => (
                <option key={v.village_code} value={v.village_code}>
                  {v.village_name} ({v.sub_district_name})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="select-filter-category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-white/40 backdrop-blur-xs text-[#1F2A1D] border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] transition cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : `Category: ${c}`}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              id="select-filter-severity"
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-white/40 backdrop-blur-xs text-[#1F2A1D] border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] transition cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              id="select-filter-language"
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-white/40 backdrop-blur-xs text-[#1F2A1D] border border-white/50 rounded-full focus:outline-none focus:ring-1 focus:ring-[#336443] transition cursor-pointer"
            >
              <option value="All">All Languages</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table Container */}
      <div
        id="requests-table-container"
        className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] overflow-hidden text-black font-[Arial,sans-serif]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/30 backdrop-blur-xs border-b border-white/30 text-black font-bold tracking-wide text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-black font-bold">Request ID</th>
                <th className="py-3.5 px-4 text-black font-bold">Village</th>
                <th className="py-3.5 px-4 text-black font-bold">Category</th>
                <th className="py-3.5 px-4 text-black font-bold">Severity</th>
                <th className="py-3.5 px-4 text-black font-bold">Description</th>
                <th className="py-3.5 px-4 text-black font-bold">Language</th>
                <th className="py-3.5 px-4 text-black font-bold">Timestamp</th>
                <th className="py-3.5 px-4 text-right text-black font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-black">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-black/80 font-medium">
                    Loading citizen telemetry...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-black/80 font-medium">
                    No citizen requests found matching your active filter criteria.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr
                    key={r.request_id}
                    id={`row-${r.request_id}`}
                    onClick={() => setActiveRequest(r)}
                    className="hover:bg-white/30 cursor-pointer transition text-black"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-black">
                      {r.request_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold whitespace-nowrap text-black">
                      {r.village_name}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/40 text-black border border-white/50 text-[11px] font-medium backdrop-blur-xs">
                        {r.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getSeverityIndicator(r.severity)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs md:max-w-md truncate text-black">
                      {r.description}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-black">
                      <span className="inline-flex items-center gap-1 text-[11px] text-black font-medium">
                        <Languages strokeWidth={1.5} className="w-3 h-3 text-black" />
                        {r.language}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-black text-[11px] font-mono font-medium">
                      {r.timestamp.replace('T', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRequest(r);
                        }}
                        className="text-xs text-black hover:text-black/70 font-bold transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-white/20 backdrop-blur-xs border-t border-white/30 flex items-center justify-between text-xs text-black font-medium">
          <div>
            Showing <span className="font-bold text-black">{Math.min(total, (page - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-bold text-black">{Math.min(total, page * pageSize)}</span> of{' '}
            <span className="font-bold text-black">{total.toLocaleString()}</span> requests
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-prev-page"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-full border border-white/50 bg-white/40 text-black hover:bg-white/60 disabled:opacity-30 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-black" />
            </button>
            <span className="font-bold text-black px-1">
              Page {page} of {totalPages}
            </span>
            <button
              id="btn-next-page"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-full border border-white/50 bg-white/40 text-black hover:bg-white/60 disabled:opacity-30 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Refined Side Panel for Detailed Request */}
      {activeRequest && (
        <div
          id="request-details-modal"
          className="fixed inset-0 z-50 bg-[#1F2A1D]/40 backdrop-blur-xs flex justify-end transition-opacity"
          onClick={() => setActiveRequest(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-[#E4E9E3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#E4E9E3] pb-4">
                <div>
                  <span className="text-xs font-mono font-medium text-[#336443] bg-[#336443]/10 px-2.5 py-0.5 rounded-full border border-[#336443]/20">
                    {activeRequest.request_id}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-[#1F2A1D] mt-2">
                    Citizen Request Details
                  </h3>
                </div>
                <button
                  id="btn-close-request-panel"
                  onClick={() => setActiveRequest(null)}
                  className="p-1.5 rounded-full text-[#4B5B47] hover:text-[#1F2A1D] hover:bg-[#F4F6F4] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Severity */}
              <div className="flex items-center gap-2 flex-wrap">
                {getSeverityIndicator(activeRequest.severity)}
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#F4F6F4] text-[#1F2A1D] border border-[#E4E9E3] font-medium">
                  {activeRequest.category}
                </span>
                <span className="text-xs text-[#4B5B47] ml-auto">
                  {activeRequest.source}
                </span>
              </div>

              {/* Description */}
              <div className="bg-[#F7F9F7] p-4 rounded-2xl border border-[#E4E9E3]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#4B5B47] mb-1.5 flex items-center justify-between">
                  <span>Citizen Grievance</span>
                  <span className="text-[11px] font-normal text-[#4B5B47]">{activeRequest.language}</span>
                </div>
                <p className="text-sm text-[#1F2A1D] leading-relaxed italic">
                  "{activeRequest.description}"
                </p>
              </div>

              {/* Village Demographics info card */}
              <div className="p-4 bg-[#336443]/5 rounded-2xl border border-[#336443]/20 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-[#1F2A1D] font-semibold">
                  <MapPin strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
                  <span>{activeRequest.village_name}</span>
                </div>
                <p className="text-[#4B5B47]">
                  Taluk: {activeRequest.district_name || 'Bangalore District'}, Karnataka
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onSelectVillage(activeRequest.village_code);
                      setActiveRequest(null);
                    }}
                    className="w-full text-center py-2.5 px-4 bg-[#336443] hover:bg-[#285035] text-white rounded-full font-medium transition shadow-xs"
                  >
                    Open Village Profile & Gap Analysis
                  </button>
                </div>
              </div>

              {/* Synthetic Data Disclaimer */}
              <div className="p-3 bg-[#F4F6F4] rounded-xl text-[11px] text-[#4B5B47] leading-normal border border-[#E4E9E3]">
                Demonstration grievance from the synthetic citizen feedback registry for Digital Public Infrastructure evaluation.
              </div>
            </div>

            <div className="pt-6 border-t border-[#E4E9E3]">
              <button
                onClick={() => setActiveRequest(null)}
                className="w-full py-2.5 text-xs font-medium text-[#4B5B47] hover:text-[#1F2A1D] bg-[#F4F6F4] hover:bg-[#E4E9E3] rounded-full transition"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
