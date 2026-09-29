import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Database,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  MapPin,
  FileCheck,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { VillageData, AICommandResult } from '../types';
import { api } from '../services/api';

interface AICommandCenterViewProps {
  villages: VillageData[];
  initialVillageCode?: number;
  onSelectVillage: (villageCode: number) => void;
}

const SAMPLE_QUERIES = [
  'Analyze the main infrastructure problems in this village',
  'Which issues are causing the most severe citizen complaints?',
  'Compare citizen demand with historical infrastructure gaps',
  'Suggest the most practical civic intervention based on the data',
  'Provide an executive briefing for the Gram Panchayat development plan'
];

export const AICommandCenterView: React.FC<AICommandCenterViewProps> = ({
  villages,
  initialVillageCode,
  onSelectVillage
}) => {
  const [selectedVillageCode, setSelectedVillageCode] = useState<number>(
    initialVillageCode || villages[0]?.village_code || 612749
  );
  const [query, setQuery] = useState(SAMPLE_QUERIES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AICommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedVillage = villages.find(v => v.village_code === selectedVillageCode) || villages[0];

  const handleRunCommand = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.runAICommand(q.trim(), selectedVillageCode);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI command analysis is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-command-center-container" className="space-y-8 pb-12">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-medium uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#336443]/15 text-[#336443] border border-[#336443]/25 backdrop-blur-xs">
              Decision Support
            </span>
            <span className="text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full bg-white/40 text-[#1F2A1D] border border-white/50 backdrop-blur-xs">
              GEMINI 3.1 FLASH LITE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1F2A1D]">
            AI Command Center
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#336443] bg-white/30 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/60 shadow-[0_4px_16px_0_rgba(0,0,0,0.04),inset_0_1px_1px_0_rgba(255,255,255,0.8)] self-start md:self-auto">
          <Sparkles strokeWidth={1.75} className="w-3.5 h-3.5" />
          <span className="font-medium">Evidence Grounded</span>
        </div>
      </div>

      {/* Target Village & Sample Prompts */}
      <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-semibold text-[#1F2A1D] block mb-1.5">
              Target Settlement:
            </label>
            <select
              id="select-command-village"
              value={selectedVillageCode}
              onChange={(e) => {
                const code = parseInt(e.target.value, 10);
                setSelectedVillageCode(code);
                onSelectVillage(code);
              }}
              className="w-full text-xs py-2 px-3 bg-white/40 backdrop-blur-xs text-[#1F2A1D] border border-white/50 rounded-full focus:ring-1 focus:ring-[#336443] focus:bg-white/60 font-medium cursor-pointer"
            >
              {villages.map((v) => (
                <option key={v.village_code} value={v.village_code}>
                  {v.village_name} ({v.sub_district_name}) — Score: {v.priorityScore}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-[#1F2A1D] block mb-1.5">
              Administrative Analytical Queries:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  id={`btn-sample-query-${i}`}
                  onClick={() => {
                    setQuery(sq);
                    handleRunCommand(sq);
                  }}
                  className="text-xs py-1 px-3 bg-white/40 hover:bg-white/60 text-[#1F2A1D] rounded-full border border-white/50 transition font-medium backdrop-blur-xs shadow-xs"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Large Clean Input Area */}
        <div className="relative flex flex-col sm:flex-row gap-2 pt-2">
          <input
            id="input-ai-command-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
            placeholder="Ask about a village, infrastructure gap, or citizen demand..."
            className="flex-1 text-xs py-3 px-4 bg-white/40 backdrop-blur-xs text-[#1F2A1D] placeholder-[#4B5B47]/70 border border-white/50 rounded-full focus:ring-1 focus:ring-[#336443] focus:bg-white/60 focus:outline-none transition"
          />
          <button
            id="btn-execute-ai-command"
            onClick={() => handleRunCommand()}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-[#336443] hover:bg-[#285035] text-white font-medium text-xs rounded-full transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 flex-shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Evidence...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Structured Insight Cards: Clear Separation of Dataset vs AI */}
      {result && (
        <div id="ai-command-analysis-results" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Card 1: OBSERVED DATA (Deterministic Baseline) */}
            <div className="lg:col-span-5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/30 pb-3">
                <div className="flex items-center gap-2 text-[#1F2A1D] font-bold text-sm">
                  <Database strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
                  <span>OBSERVED DATA</span>
                </div>
                <span className="text-[10px] font-semibold bg-[#336443]/15 text-[#336443] border border-[#336443]/25 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  Deterministic Baseline
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/20">
                  <span className="text-[#4B5B47]">Village & Taluk</span>
                  <span className="font-semibold text-[#1F2A1D]">
                    {result.data_derived_findings.village_name} ({result.data_derived_findings.sub_district})
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/20">
                  <span className="text-[#4B5B47]">Census 2011 Population</span>
                  <span className="font-semibold text-[#1F2A1D]">
                    {result.data_derived_findings.population_2011.toLocaleString()} ({result.data_derived_findings.households} households)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/20">
                  <span className="text-[#4B5B47]">Geographic Area</span>
                  <span className="font-semibold text-[#1F2A1D]">
                    {result.data_derived_findings.area_hectares} hectares
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/20">
                  <span className="text-[#4B5B47]">Citizen Demand Volume</span>
                  <span className="font-semibold text-[#336443]">
                    {result.data_derived_findings.total_citizen_requests} requests ({result.data_derived_findings.high_severity_requests} high severity)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/20">
                  <span className="text-[#4B5B47]">Primary Demand Category</span>
                  <span className="font-semibold text-[#3D5638]">
                    {result.data_derived_findings.top_demand_category}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/20">
                  <span className="text-[#4B5B47]">Observed Priority Score</span>
                  <span className="font-bold text-[#1F2A1D] font-mono">
                    {result.data_derived_findings.priority_score}/100
                  </span>
                </div>
              </div>

              {/* EVIDENCE Sub-section */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-[#4B5B47] uppercase tracking-wider block mb-2">
                  EVIDENCE: Recorded Census Gaps
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.data_derived_findings.documented_census_gaps.map((gap, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-[#C25E4B]/15 text-[#C25E4B] border border-[#C25E4B]/25 rounded-full text-[11px] font-medium capitalize backdrop-blur-xs">
                      {gap} Gap
                    </span>
                  ))}
                  {result.data_derived_findings.documented_census_gaps.length === 0 && (
                    <span className="text-[#4B5B47] italic text-xs">No historical gaps in observed baseline</span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: AI INTERPRETATION & SUGGESTED ACTION */}
            <div className="lg:col-span-7 bg-white/20 backdrop-blur-md rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_0_rgba(255,255,255,0.7)] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/30 pb-3">
                <div className="flex items-center gap-2 text-[#1F2A1D] font-bold text-sm">
                  <Brain strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
                  <span>AI INTERPRETATION</span>
                </div>
                <span className="text-[10px] font-semibold bg-[#336443]/15 text-[#336443] border border-[#336443]/25 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  Gemini Synthesis
                </span>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed">
                {/* 1. Summary */}
                <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 shadow-2xs">
                  <h4 className="font-semibold text-[#1F2A1D] mb-1">Executive Summary</h4>
                  <p className="text-[#4B5B47]">{result.ai_generated_interpretation.summary}</p>
                </div>

                {/* 2. Main Demand Categories & 3. Infrastructure Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 shadow-2xs">
                    <h4 className="font-semibold text-[#1F2A1D] mb-1">Demand Sectors</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.ai_generated_interpretation.main_demand_categories.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#336443]/15 text-[#336443] border border-[#336443]/25 rounded-full font-medium text-[11px] backdrop-blur-xs">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 shadow-2xs">
                    <h4 className="font-semibold text-[#1F2A1D] mb-1">Identified Deficits</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.ai_generated_interpretation.infrastructure_gaps.map((g, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#D98A3E]/15 text-[#B86B24] border border-[#D98A3E]/25 rounded-full font-medium text-[11px] capitalize backdrop-blur-xs">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Affected Population */}
                <div className="p-3.5 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 shadow-2xs">
                  <h4 className="font-semibold text-[#1F2A1D] mb-1">Affected Community</h4>
                  <p className="text-[#4B5B47]">{result.ai_generated_interpretation.affected_population}</p>
                </div>

                {/* SUGGESTED ACTION */}
                <div className="p-4 bg-[#336443]/10 backdrop-blur-xs rounded-xl border border-[#336443]/25 space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#1F2A1D]">
                    <FileCheck strokeWidth={1.75} className="w-4 h-4 text-[#336443]" />
                    <span>SUGGESTED ACTION</span>
                  </div>
                  <p className="text-[#1F2A1D] font-medium leading-relaxed">
                    {result.ai_generated_interpretation.suggested_intervention}
                  </p>
                </div>

                {/* Supporting Data */}
                <div className="p-3 bg-white/30 backdrop-blur-xs rounded-xl border border-white/40 text-[11px] text-[#4B5B47] shadow-2xs">
                  <span className="font-semibold text-[#1F2A1D]">Data Evidence Lineage: </span>
                  <span>{result.ai_generated_interpretation.supporting_data_notes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
