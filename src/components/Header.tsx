import React from 'react';
import { RefreshCw, Activity, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenNewRequestModal?: () => void;
  onOpenDemoWorkflow?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isOverlayMenuOpen: boolean;
  onToggleOverlayMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  isOverlayMenuOpen,
  onToggleOverlayMenu
}) => {
  return (
    <header
      id="platform-top-header"
      className="bg-white/85 backdrop-blur-md border-b border-[#E4E9E3] sticky top-0 z-30 px-4 md:px-6 py-3 font-[Arial,sans-serif]"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#E4E9E3] shadow-xs flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
            <img
              src="/national_emblem.jpg"
              alt="National Emblem of India"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-base font-bold tracking-tight text-[#1F2A1D]">
            JanSetu AI
          </span>
        </div>

        {/* Right: Pill Controls, Action Buttons & Top-Right Hamburger Menu */}
        <div className="flex items-center gap-2 md:gap-2.5 justify-end ml-auto">
          {/* Status Pills */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F6F4] border border-[#E4E9E3] text-[11px] text-[#1F2A1D] font-bold"
            style={{ fontWeight: 'bold' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#336443] animate-pulse" />
            <span className="font-bold text-black">Data: Live</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F6F4] border border-[#E4E9E3] text-[11px] text-[#4B5B47]">
            <Activity strokeWidth={1.75} className="w-3.5 h-3.5 text-[#336443]" />
            <span className="font-medium text-[#1F2A1D]">AI: Active</span>
          </div>

          {onRefresh && (
            <button
              id="btn-refresh-datasets"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Reload village datasets and recalculate priority matrix"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-black hover:text-[#336443] bg-[#F4F6F4] hover:bg-[#E4E9E3] rounded-full border border-[#E4E9E3] transition"
              style={{ fontWeight: 'bold' }}
            >
              <RefreshCw
                strokeWidth={2}
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#336443]' : ''}`}
              />
              <span className="hidden md:inline font-bold">Refresh Data</span>
            </button>
          )}

          {/* Top-Right Hamburger Button toggling overlay menu & switching to X */}
          {onToggleOverlayMenu && (
            <button
              id="btn-top-right-hamburger"
              onClick={onToggleOverlayMenu}
              className={`order-last w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-xs ml-1 md:ml-2 shrink-0 ${
                isOverlayMenuOpen
                  ? 'bg-[#1F2A1D] text-white border-[#1F2A1D] shadow-sm'
                  : 'bg-white hover:bg-[#F4F6F4] text-[#1F2A1D] border-[#E4E9E3]'
              }`}
              title={isOverlayMenuOpen ? 'Close navigation overlay menu' : 'Open navigation overlay menu'}
              aria-label={isOverlayMenuOpen ? 'Close navigation overlay menu' : 'Open navigation overlay menu'}
              aria-expanded={isOverlayMenuOpen}
            >
              {isOverlayMenuOpen ? (
                <X strokeWidth={2.2} className="w-4 h-4 transition-transform duration-200" />
              ) : (
                <Menu strokeWidth={2.2} className="w-4 h-4 transition-transform duration-200" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
