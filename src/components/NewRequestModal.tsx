import React, { useState } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle2,
  Languages,
  Info,
  MapPin,
  Check
} from 'lucide-react';
import { VillageData, AIClassificationResult, CitizenRequest } from '../types';
import { api } from '../services/api';

interface NewRequestModalProps {
  villages: VillageData[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newVillageCode: number) => void;
}

const SAMPLE_PROMPTS = [
  {
    lang: 'English',
    text: 'During heavy rain, water collects near our school and children cannot safely reach the school.'
  },
  {
    lang: 'Kannada',
    text: 'ನಮ್ಮ ಹಳ್ಳಿಯಲ್ಲಿ ಕುಡಿಯುವ ನೀರಿನ ಕೊಳವೆ ಒಡೆದು 3 ದಿನಗಳಿಂದ ನೀರು ಪೂರೈಕೆ ಸ್ಥಗಿತಗೊಂಡಿದೆ.'
  },
  {
    lang: 'Hindi',
    text: 'प्राथमिक स्वास्थ्य केंद्र में डॉक्टर उपलब्ध नहीं हैं और दवाइयों की कमी है।'
  },
  {
    lang: 'English',
    text: 'Main road connecting to the market is filled with potholes, ambulances cannot pass easily.'
  }
];

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  villages,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedVillageCode, setSelectedVillageCode] = useState<number>(
    villages[0]?.village_code || 612749
  );
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('English');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIClassificationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyzeWithGemini = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.classifyRequest(text.trim());
      setAnalysisResult(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gemini classification temporarily unavailable. Default fallback applied.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: {
        village_code: number;
        category: string;
        description: string;
        language: string;
        severity: 'High' | 'Medium' | 'Low';
        source?: string;
      } = {
        village_code: selectedVillageCode,
        description: text.trim(),
        language: analysisResult?.language || language,
        category: analysisResult?.category || 'General Infrastructure',
        severity: analysisResult?.severity || 'Medium',
        source: 'Citizen Portal (Web)'
      };

      const newRequest = await api.submitRequest(payload);
      onSuccess(newRequest.village_code);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit citizen request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityPill = (sev: string) => {
    if (sev === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-700 border border-red-300 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          High Severity
        </span>
      );
    }
    if (sev === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-800 border border-amber-300 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          Medium Severity
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/50 text-black border border-white/60 backdrop-blur-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-black" />
        Low Severity
      </span>
    );
  };

  return (
    <div
      id="submit-request-modal-overlay"
      className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="submit-request-modal"
        className="bg-white/40 backdrop-blur-xl rounded-3xl max-w-2xl w-full border border-white/60 shadow-[0_16px_48px_0_rgba(0,0,0,0.14),inset_0_1px_1px_0_rgba(255,255,255,0.9)] p-6 md:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-black font-[Arial,sans-serif]"
        style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/40 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/50 text-black border border-white/60 backdrop-blur-xs">
                Citizen Grievance Submission
              </span>
              <span className="text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full bg-white/50 text-black border border-white/60 backdrop-blur-xs">
                Multilingual AI
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-black">
              Tell us what your community needs.
            </h2>
            <p className="text-xs text-black/85 mt-1 font-medium">
              Describe the issue in your own words. Gemini AI will analyze the category, severity, and recommend administrative routing.
            </p>
          </div>
          <button
            id="btn-close-submit-modal"
            onClick={onClose}
            className="p-1.5 rounded-full text-black hover:bg-white/60 transition cursor-pointer border border-white/50 bg-white/30 backdrop-blur-xs"
            title="Close modal"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Settlement Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-black flex items-center gap-1.5">
            <MapPin strokeWidth={2} className="w-3.5 h-3.5 text-black" />
            <span>Target Habitation / Village:</span>
          </label>
          <select
            id="modal-select-village"
            value={selectedVillageCode}
            onChange={(e) => setSelectedVillageCode(parseInt(e.target.value, 10))}
            className="w-full text-xs py-2.5 px-3.5 bg-white/50 backdrop-blur-md text-black font-semibold border border-white/60 rounded-full focus:ring-1 focus:ring-black focus:bg-white/70 transition cursor-pointer"
          >
            {villages.map((v) => (
              <option key={v.village_code} value={v.village_code} className="text-black bg-white">
                {v.village_name} ({v.sub_district_name})
              </option>
            ))}
          </select>
        </div>

        {/* Sample Prompt Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-black block">
            Select a sample grievance (English / Kannada / Hindi):
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((sp, idx) => (
              <button
                key={idx}
                type="button"
                id={`sample-prompt-pill-${idx}`}
                onClick={() => {
                  setText(sp.text);
                  setLanguage(sp.lang);
                  setAnalysisResult(null);
                }}
                className="text-left text-xs p-3 bg-white/40 hover:bg-white/65 backdrop-blur-md rounded-2xl border border-white/60 shadow-xs transition text-black max-w-xs flex-1 cursor-pointer font-[Arial,sans-serif]"
              >
                <div className="flex items-center justify-between text-[10px] text-black font-bold mb-1">
                  <span>{sp.lang}</span>
                  <span className="text-black font-bold">Use Sample →</span>
                </div>
                <p className="line-clamp-2 text-[11px] leading-relaxed italic text-black/85 font-medium">
                  "{sp.text}"
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-black">
              Grievance Description:
            </label>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-black font-semibold">Input Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="py-1 px-3 text-xs bg-white/50 backdrop-blur-md text-black border border-white/60 rounded-full focus:ring-1 focus:ring-black transition cursor-pointer font-bold"
              >
                <option value="English" className="text-black bg-white">English</option>
                <option value="Kannada" className="text-black bg-white">Kannada (ಕನ್ನಡ)</option>
                <option value="Hindi" className="text-black bg-white">Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>

          <textarea
            id="textarea-citizen-description"
            rows={3}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setAnalysisResult(null);
            }}
            placeholder="Describe the issue in your own words..."
            className="w-full text-xs p-3.5 bg-white/50 backdrop-blur-md text-black font-medium placeholder-black/60 border border-white/60 rounded-2xl focus:ring-1 focus:ring-black focus:bg-white/70 transition"
          />

          {/* Primary CTA: Analyze with Gemini */}
          <div className="flex justify-end">
            <button
              id="btn-analyze-with-gemini"
              type="button"
              onClick={handleAnalyzeWithGemini}
              disabled={analyzing || !text.trim()}
              className="px-5 py-2.5 bg-black hover:bg-black/80 text-white text-xs font-bold rounded-full transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Analyze with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 bg-white/60 backdrop-blur-md border border-rose-300 text-xs text-rose-900 rounded-2xl flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Gemini Classification Results Box */}
        {analysisResult && (
          <div
            id="gemini-classification-results"
            className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 md:p-5 space-y-3.5 text-xs text-black animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-white/40 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-black">
                <Sparkles strokeWidth={2} className="w-4 h-4 text-black" />
                <span>Gemini 3.1 Flash Lite Classification</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-black bg-white/60 px-2 py-0.5 rounded-full border border-white/60">
                AI Structured Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/60">
                <span className="text-[10px] text-black/80 uppercase block font-bold">Detected Language</span>
                <span className="text-xs font-bold text-black mt-0.5 block">
                  {analysisResult.language}
                </span>
              </div>
              <div className="p-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/60">
                <span className="text-[10px] text-black/80 uppercase block font-bold">Assigned Category</span>
                <span className="text-xs font-bold text-black mt-0.5 block">
                  {analysisResult.category}
                </span>
              </div>
              <div className="p-3 bg-white/50 backdrop-blur-md rounded-xl border border-white/60">
                <span className="text-[10px] text-black/80 uppercase block font-bold">Assessed Severity</span>
                <div className="mt-1">{getSeverityPill(analysisResult.severity)}</div>
              </div>
            </div>

            <div className="space-y-1 bg-white/50 backdrop-blur-md p-3.5 rounded-xl border border-white/60">
              <span className="text-[10px] text-black/80 uppercase font-bold block">Explanation & Rationale</span>
              <p className="text-xs text-black leading-relaxed font-medium">
                {analysisResult.summary}
              </p>
              {analysisResult.affected_group && (
                <p className="text-[11px] text-black/85 mt-1">
                  <strong>Affected Group:</strong> {analysisResult.affected_group}
                </p>
              )}
            </div>

            {analysisResult.recommended_action && (
              <div className="space-y-1 bg-white/50 backdrop-blur-md p-3.5 rounded-xl border border-white/60">
                <span className="text-[10px] text-black uppercase font-bold block">Recommended Administrative Action</span>
                <p className="text-xs text-black font-semibold leading-relaxed">
                  {analysisResult.recommended_action}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-black bg-white/30 hover:bg-white/50 border border-white/50 backdrop-blur-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-submit-request-to-registry"
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="px-6 py-2.5 bg-black hover:bg-black/85 text-white text-xs font-bold rounded-full transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Recording in Registry...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Submit to Registry</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
