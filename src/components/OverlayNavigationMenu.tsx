import React, { useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Database,
  TrendingUp,
  MessageSquareText,
  Flame,
  Building2,
  MapPin,
  Bot,
  FileSpreadsheet,
  Plus,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { PageId } from './Sidebar';

interface OverlayNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  onOpenNewRequestModal: () => void;
  onOpenDemoWorkflow: () => void;
}

export const OverlayNavigationMenu: React.FC<OverlayNavigationMenuProps> = ({
  isOpen,
  onClose,
  activePage,
  onSelectPage,
  onOpenNewRequestModal,
  onOpenDemoWorkflow,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigate = (page: PageId) => {
    onSelectPage(page);
    onClose();
  };

  const navSections = [
    {
      label: 'Navigation Overview',
      items: [
        {
          id: 'dashboard' as PageId,
          title: 'Dashboard',
          subtitle: 'Executive KPIs, analytics & district overview',
          icon: LayoutDashboard,
          badge: 'Live',
        },
        {
          id: 'requests' as PageId,
          title: 'Citizen Requests',
          subtitle: 'Multilingual grievance intake & telemetry',
          icon: MessageSquareText,
          badge: 'Intake',
        },
        {
          id: 'hotspots' as PageId,
          title: 'Demand Hotspots',
          subtitle: 'Prioritized community interventions & high-need clusters',
          icon: Flame,
          badge: 'Urgent',
        },
        {
          id: 'infrastructure' as PageId,
          title: 'Infrastructure',
          subtitle: 'Census 2011 deficit tracking & deterministic scoring',
          icon: Building2,
          badge: 'Deficits',
        },
        {
          id: 'village-profile' as PageId,
          title: 'Village Explorer',
          subtitle: 'Individual village infrastructure audits & DPR generator',
          icon: MapPin,
        },
        {
          id: 'ai-command' as PageId,
          title: 'AI Command Center',
          subtitle: 'District-wide policy queries via Gemini 3.8 Flash',
          icon: Bot,
          badge: 'Gemini AI',
        },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Overlay Panel */}
      <div
        id="collapsible-overlay-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-white/15 backdrop-blur-2xl text-[#1F2A1D] z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] border-l border-white/40 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-white/30 bg-white/20 backdrop-blur-md flex items-center justify-between shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/40 border border-white/60 shadow-xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden backdrop-blur-xs">
              <img
                src="/national_emblem.jpg"
                alt="National Emblem of India"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight text-[#1F2A1D]">
                  JanSetu AI
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-[#336443]/15 text-[#336443] border border-[#336443]/25 backdrop-blur-xs">
                  Gov-Tech
                </span>
              </div>
              <p className="text-[11px] text-[#4B5B47]">Bangalore District Governance</p>
            </div>
          </div>

          {/* Close (X) button inside the overlay */}
          <button
            id="btn-close-overlay-menu"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 text-[#1F2A1D] flex items-center justify-center border border-white/50 backdrop-blur-xs transition cursor-pointer shadow-xs"
            title="Close menu (Esc)"
            aria-label="Close menu"
          >
            <X strokeWidth={2.2} className="w-4 h-4 text-[#1F2A1D]" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div
          className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-white/10 backdrop-blur-md text-black font-[Arial,sans-serif]"
          style={{ color: '#000000', fontFamily: 'Arial, sans-serif' }}
        >
          {/* Navigation Sections */}
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-black px-1">
                {sec.label}
              </div>
              <div className="space-y-1.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`overlay-nav-${item.id}`}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-[#336443]/20 border-[#336443]/40 shadow-xs backdrop-blur-xs'
                          : 'bg-white/30 hover:bg-white/50 border-white/50 hover:border-white/70 backdrop-blur-xs shadow-xs'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                          isActive
                            ? 'bg-[#336443] text-white border-[#336443]'
                            : 'bg-white/50 text-[#336443] border-white/50'
                        }`}
                      >
                        <Icon strokeWidth={1.8} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-black">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/40 text-black border border-white/50 backdrop-blur-xs">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-black/80 mt-0.5 line-clamp-1 leading-snug">
                          {item.subtitle}
                        </p>
                      </div>
                      {isActive && (
                        <CheckCircle2 strokeWidth={2} className="w-4 h-4 text-[#336443] shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Action Cards */}
          <div className="pt-2 border-t border-white/30 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-black px-1">
              Quick Governance Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-overlay-submit-request"
                onClick={() => {
                  onClose();
                  onOpenNewRequestModal();
                }}
                className="p-3 bg-white/30 hover:bg-white/50 rounded-2xl border border-white/50 backdrop-blur-xs text-left transition cursor-pointer space-y-1 shadow-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white/50 text-[#336443] border border-white/40 flex items-center justify-center">
                  <Plus strokeWidth={2} className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-black">Submit Request</div>
                <p className="text-[10px] text-black/80">Log citizen grievance</p>
              </button>

              <button
                id="btn-overlay-start-demo"
                onClick={() => {
                  onClose();
                  onOpenDemoWorkflow();
                }}
                className="p-3 bg-white/30 hover:bg-white/50 rounded-2xl border border-white/50 backdrop-blur-xs text-left transition cursor-pointer space-y-1 shadow-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-white/50 text-[#336443] border border-white/40 flex items-center justify-center">
                  <Sparkles strokeWidth={1.8} className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-black">12-Step Demo</div>
                <p className="text-[10px] text-black/80">Guided evaluation flow</p>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="p-4 border-t border-white/30 bg-white/20 backdrop-blur-md text-xs space-y-1.5 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex items-center justify-between text-[11px] text-[#4B5B47]">
            <span>Bangalore District Baseline</span>
            <span className="font-mono text-[#1F2A1D] font-medium">Census 2011</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#4B5B47]">
            <ShieldCheck strokeWidth={1.75} className="w-3.5 h-3.5 text-[#336443]" />
            <span>Digital Public Goods Standard • Explainable AI</span>
          </div>
        </div>
      </div>
    </>
  );
};
