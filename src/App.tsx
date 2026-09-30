import React, { useState, useEffect } from 'react';
import type { PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CitizenRequestsView } from './components/CitizenRequestsView';
import { DemandHotspotsView } from './components/DemandHotspotsView';
import { InfrastructureExplorerView } from './components/InfrastructureExplorerView';
import { VillageProfileView } from './components/VillageProfileView';
import { AICommandCenterView } from './components/AICommandCenterView';
import { NewRequestModal } from './components/NewRequestModal';
import { DemoWorkflowModal } from './components/DemoWorkflowModal';
import { OverlayNavigationMenu } from './components/OverlayNavigationMenu';
import { StatsKPI, VillageData } from './types';
import { api } from './services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [stats, setStats] = useState<StatsKPI | null>(null);
  const [villages, setVillages] = useState<VillageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active village selection for deep dive
  const [selectedVillageCode, setSelectedVillageCode] = useState<number>(612749);

  // Modals & Navigation
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isOverlayMenuOpen, setIsOverlayMenuOpen] = useState(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadInitialData = async () => {
    try {
      const [statsData, villagesData] = await Promise.all([
        api.getStats(),
        api.getVillages()
      ]);
      setStats(statsData);
      setVillages(villagesData);
      if (villagesData.length > 0 && !selectedVillageCode) {
        setSelectedVillageCode(villagesData[0].village_code);
      }
    } catch (err: any) {
      console.error('Data load error:', err);
      setError('Could not connect to JanSetu backend. Ensure server is active on port 3000.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    showToast('Datasets & Priority Matrix reloaded.');
  };

  const handleSelectVillage = (code: number) => {
    setSelectedVillageCode(code);
    setActivePage('village-profile');
  };

  const handleNewRequestSuccess = async (newVillageCode: number) => {
    await loadInitialData();
    setSelectedVillageCode(newVillageCode);
    showToast('Citizen grievance registered & priority engine updated.');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] flex flex-col text-[#1F2A1D] font-sans antialiased selection:bg-[#336443] selection:text-white relative">
      {/* Dynamic Video Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
        aria-hidden="true"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260624_210218_173f8eba-17ff-4e27-972b-d128af25bf49.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden relative z-10">
        <Header
          onOpenNewRequestModal={() => setIsNewRequestModalOpen(true)}
          onOpenDemoWorkflow={() => setIsDemoModalOpen(true)}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          isOverlayMenuOpen={isOverlayMenuOpen}
          onToggleOverlayMenu={() => setIsOverlayMenuOpen((prev) => !prev)}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-[#1F2A1D] text-white text-xs px-4 py-3 rounded-full shadow-lg border border-[#3D5638]/40 flex items-center gap-2.5 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#85AB8B]"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content View Container */}
        <main
          className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto font-[Arial,sans-serif]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
              <RefreshCw className="w-7 h-7 text-[#336443] animate-spin" />
              <p className="text-sm font-medium text-[#1F2A1D]">Loading JanSetu Governance Intelligence...</p>
              <p className="text-xs text-[#4B5B47]">Initializing Census 2011 baseline & citizen request telemetry</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Backend Connection Error</span>
              </div>
              <p className="text-xs">{error}</p>
              <button
                onClick={loadInitialData}
                className="px-4 py-1.5 bg-rose-700 text-white rounded-full text-xs font-medium"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  villages={villages}
                  onSelectVillage={handleSelectVillage}
                  onNavigatePage={(p) => setActivePage(p as PageId)}
                />
              )}

              {activePage === 'requests' && (
                <CitizenRequestsView
                  villages={villages}
                  onSelectVillage={handleSelectVillage}
                  onOpenNewRequestModal={() => setIsNewRequestModalOpen(true)}
                />
              )}

              {activePage === 'hotspots' && (
                <DemandHotspotsView
                  villages={villages}
                  onSelectVillage={handleSelectVillage}
                />
              )}

              {activePage === 'infrastructure' && (
                <InfrastructureExplorerView
                  villages={villages}
                  onSelectVillage={handleSelectVillage}
                />
              )}

              {activePage === 'village-profile' && (
                <VillageProfileView
                  villageCode={selectedVillageCode}
                  villages={villages}
                  onSelectVillageCode={(code) => setSelectedVillageCode(code)}
                  onNavigateToAICommand={(code) => {
                    setSelectedVillageCode(code);
                    setActivePage('ai-command');
                  }}
                />
              )}

              {activePage === 'ai-command' && (
                <AICommandCenterView
                  villages={villages}
                  initialVillageCode={selectedVillageCode}
                  onSelectVillage={(code) => setSelectedVillageCode(code)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        villages={villages}
        onSuccess={handleNewRequestSuccess}
      />

      <DemoWorkflowModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onNavigatePage={(p) => setActivePage(p)}
        onOpenNewRequestModal={() => setIsNewRequestModalOpen(true)}
        onSelectVillage={handleSelectVillage}
      />

      {/* Collapsible Overlay Navigation Sidebar Menu */}
      <OverlayNavigationMenu
        isOpen={isOverlayMenuOpen}
        onClose={() => setIsOverlayMenuOpen(false)}
        activePage={activePage}
        onSelectPage={(p) => setActivePage(p)}
        onOpenNewRequestModal={() => setIsNewRequestModalOpen(true)}
        onOpenDemoWorkflow={() => setIsDemoModalOpen(true)}
      />
    </div>
  );
}
