import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Layers,
  ArrowRight,
  Building,
  Flame,
  Bot
} from 'lucide-react';
import { PageId } from './Sidebar';

interface DemoWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePage: (page: PageId) => void;
  onOpenNewRequestModal: () => void;
  onSelectVillage: (villageCode: number) => void;
}

interface Step {
  title: string;
  description: string;
  actionText?: string;
  actionPage?: PageId;
  onPerformAction?: () => void;
}

export const DemoWorkflowModal: React.FC<DemoWorkflowModalProps> = ({
  isOpen,
  onClose,
  onNavigatePage,
  onOpenNewRequestModal,
  onSelectVillage
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: Step[] = [
    {
      title: '1. Executive Dashboard Overview',
      description: 'Review overall KPI statistics computed dynamically from 190 Bangalore villages: Total Villages (190), Citizen Requests (4,132+), High-Severity volume, and Infrastructure Gaps.',
      actionText: 'View Dashboard',
      actionPage: 'dashboard'
    },
    {
      title: '2. Citizen Requests & Telemetry',
      description: 'Explore the live registry of citizen grievances filterable by village, domain category, severity, and language (English, Kannada, Hindi).',
      actionText: 'Open Citizen Requests',
      actionPage: 'requests'
    },
    {
      title: '3. Enter Sample Citizen Grievance',
      description: 'Open the submission portal and test input: "During heavy rain, water collects near our school and children cannot safely reach the school."',
      actionText: 'Open Submission & Gemini Classifier',
      onPerformAction: () => {
        onNavigatePage('requests');
        onOpenNewRequestModal();
      }
    },
    {
      title: '4. Gemini Multilingual Classification',
      description: 'Observe Gemini 3.1 Flash Lite classify the request in real time into Drainage, High Severity, identifying affected schoolchildren, and recommending maintenance.',
      actionText: 'Explore Classifier',
      onPerformAction: () => {
        onOpenNewRequestModal();
      }
    },
    {
      title: '5. Demand Hotspots & Priority Matrix',
      description: 'Check how the transparent deterministic priority engine ranks settlements based on demand volume, gaps, population, and severity.',
      actionText: 'View Demand Hotspots',
      actionPage: 'hotspots'
    },
    {
      title: '6. Infrastructure & Amenities Baseline',
      description: 'Inspect the 10 vital public infrastructure indicators (Water, Drainage, Waste, Roads, Healthcare, Education, Digital, Transport, Electricity, Banking) with status badges.',
      actionText: 'Inspect Infrastructure Matrix',
      actionPage: 'infrastructure'
    },
    {
      title: '7. Deep-Dive Village Profile',
      description: 'Examine single village demographics, recorded requests, Census amenity gaps, and the explainable score breakdown.',
      actionText: 'Open Village Explorer',
      actionPage: 'village-profile'
    },
    {
      title: '8. Gemini AI Situation Briefing',
      description: 'Read the Gemini AI synthesized executive briefing grounded exclusively in Census metrics and logged demand without external hallucinations.',
      actionText: 'View AI Situation Summary',
      actionPage: 'village-profile'
    },
    {
      title: '9. Prototype Project Recommendation',
      description: 'Generate structured intervention suggestions detailing Problem, Data Evidence, and Proposed Action for district engineering cells.',
      actionText: 'Generate Recommendation',
      actionPage: 'village-profile'
    },
    {
      title: '10. AI Command Center Analysis',
      description: 'Ask complex analytical queries like "Analyze the main infrastructure problems in this village" with strict separation of Data-Derived Findings vs AI Interpretation.',
      actionText: 'Open AI Command Center',
      actionPage: 'ai-command'
    }
  ];

  const step = steps[currentStep];

  const handleExecuteAction = () => {
    if (step.onPerformAction) {
      step.onPerformAction();
    } else if (step.actionPage) {
      onNavigatePage(step.actionPage);
    }
    onClose();
  };

  return (
    <div
      id="demo-workflow-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="demo-workflow-modal-card"
        className="bg-white/40 backdrop-blur-xl rounded-3xl max-w-lg w-full shadow-[0_16px_48px_0_rgba(0,0,0,0.14),inset_0_1px_1px_0_rgba(255,255,255,0.9)] border border-white/60 overflow-hidden text-black font-[Arial,sans-serif]"
        style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-white/50 backdrop-blur-md text-black flex items-center justify-between border-b border-white/40">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-white/60 border border-white/60 flex items-center justify-center text-black">
              <Sparkles className="w-4 h-4 text-black" />
            </span>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-black">Evaluation Demo Walkthrough</h3>
              <p className="text-[11px] text-black/80 font-medium">Track 1: AI for Digital Public Infrastructure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-black hover:bg-white/60 transition border border-white/40"
            title="Close modal"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-black">
          <div className="flex items-center justify-between text-xs text-black font-semibold">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span className="text-black font-bold">JanSetu AI Guided Tour</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/50 border border-white/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 space-y-2 text-black shadow-xs">
            <h4 className="font-bold text-black text-sm tracking-tight">{step.title}</h4>
            <p className="text-xs text-black/85 leading-relaxed font-medium">{step.description}</p>
          </div>

          {step.actionText && (
            <button
              onClick={handleExecuteAction}
              className="w-full py-2.5 px-4 bg-black hover:bg-black/85 text-white text-xs font-bold rounded-full transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>{step.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-white/40 backdrop-blur-md border-t border-white/40 flex items-center justify-between text-black">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
            className="px-3 py-1.5 text-xs font-bold text-black hover:bg-white/50 rounded-full disabled:opacity-30 transition flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-black" />
            <span>Previous</span>
          </button>

          <button
            disabled={currentStep === steps.length - 1}
            onClick={() => setCurrentStep(p => Math.min(steps.length - 1, p + 1))}
            className="px-4 py-1.5 text-xs font-bold bg-white/60 hover:bg-white/80 text-black border border-white/60 rounded-full disabled:opacity-30 transition flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};
