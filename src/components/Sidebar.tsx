import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  Flame,
  Building2,
  MapPin,
  Bot,
  FileSpreadsheet
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'requests'
  | 'hotspots'
  | 'infrastructure'
  | 'village-profile'
  | 'ai-command';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  onOpenQuickDemo?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isOpen = true
}) => {
  const menuItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'requests' as PageId, label: 'Citizen Requests', icon: MessageSquareText },
    { id: 'hotspots' as PageId, label: 'Demand Hotspots', icon: Flame },
    { id: 'infrastructure' as PageId, label: 'Infrastructure', icon: Building2 },
    { id: 'village-profile' as PageId, label: 'Village Explorer', icon: MapPin },
    { id: 'ai-command' as PageId, label: 'AI Command Center', icon: Bot, isAi: true },
  ];

  return (
    <aside
      id="main-sidebar"
      className={`fixed inset-y-0 left-0 z-40 md:static md:z-auto w-64 bg-[#F4F6F4] text-[#1F2A1D] flex flex-col flex-shrink-0 border-r border-[#E4E9E3] select-none min-h-screen transition-transform duration-200 ease-in-out shadow-lg md:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
      }`}
    >
      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#4B5B47]/80">
          Navigation
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all ${
                isActive
                  ? 'bg-[#336443]/15 text-[#1F2A1D] font-semibold shadow-xs'
                  : 'text-[#4B5B47] hover:bg-[#1F2A1D]/5 hover:text-[#1F2A1D] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  strokeWidth={1.75}
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-[#336443]'
                      : item.isAi
                      ? 'text-[#3D5638]'
                      : 'text-[#4B5B47]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#336443]" />
              )}
            </button>
          );
        })}

        {/* Navigation list ends */}
      </nav>

      {/* Data Baseline Footer */}
      <div className="p-4 border-t border-[#E4E9E3] text-[11px] text-[#4B5B47] flex items-center justify-between">
        <span>Bangalore District Baseline</span>
        <span className="text-[10px] font-mono bg-[#1F2A1D]/5 px-2 py-0.5 rounded-full text-[#1F2A1D]">
          Census 2011
        </span>
      </div>
    </aside>
  );
};
