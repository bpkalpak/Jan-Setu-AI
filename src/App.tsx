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
import { RefreshCw, AlertCircle, WifiOff, FileCode2, ServerCrash } from 'lucide-react';

export interface ApiErrorInfo {
  endpoint: string;
  category: 'connectivity' | 'parsing' | 'http' | 'unknown';
  title: string;
  message: string;
  technicalDetails: string;
}

function parseApiError(err: unknown, endpointName: string, endpointPath: string): ApiErrorInfo {
  const isSyntax = err instanceof SyntaxError;
  const isType = err instanceof TypeError;
  const errName = err instanceof Error ? err.name : 'UnknownError';
  const rawMsg = err instanceof Error ? err.message : String(err);
  const msgLower = rawMsg.toLowerCase();

  // Differentiate between data parsing errors and network connectivity issues
  const isDataParsing =
    isSyntax ||
    msgLower.includes('syntaxerror') ||
    msgLower.includes('json') ||
    msgLower.includes('unexpected token') ||
    msgLower.includes('not valid json') ||
    msgLower.includes('cannot parse') ||
    msgLower.includes('malformed');

  const isConnectivity =
    !isDataParsing &&
    (isType ||
      msgLower.includes('failed to fetch') ||
      msgLower.includes('network') ||
      msgLower.includes('networkerror') ||
      msgLower.includes('econnrefused') ||
      msgLower.includes('connection refused') ||
      msgLower.includes('timed out') ||
      msgLower.includes('aborted') ||
      msgLower.includes('offline'));

  if (isDataParsing) {
    return {
      endpoint: endpointName,
      category: 'parsing',
      title: `Data Parsing Error: ${endpointName}`,
      message: `Failed to parse response payload from ${endpointPath}. The backend returned a malformed or non-JSON body.`,
      technicalDetails: `${errName}: ${rawMsg}`
    };
  }

  if (isConnectivity) {
    return {
      endpoint: endpointName,
      category: 'connectivity',
      title: `Network Connectivity Issue: ${endpointName}`,
      message: `Could not connect to ${endpointPath}. Check your network connection or verify that the local backend server is running on port 3000.`,
      technicalDetails: `${errName}: ${rawMsg}`
    };
  }

  return {
    endpoint: endpointName,
    category: 'http',
    title: `API Request Failure: ${endpointName}`,
    message: `Server returned an error status while retrieving ${endpointPath}.`,
    technicalDetails: `${errName}: ${rawMsg}`
  };
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [stats, setStats] = useState<StatsKPI | null>(null);
  const [villages, setVillages] = useState<VillageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<ApiErrorInfo | null>(null);

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
    setError(null);
    setApiError(null);
    const failureReports: ApiErrorInfo[] = [];
    let statsData: StatsKPI | null = null;
    let villagesData: VillageData[] = [];

    // Endpoint 1: Platform KPI statistics (/api/stats)
    try {
      statsData = await api.getStats();
    } catch (err: unknown) {
      console.error('[API Failure: /api/stats]', err);
      failureReports.push(parseApiError(err, 'Platform KPI Statistics', '/api/stats'));
    }

    // Endpoint 2: Village catalog & baseline metrics (/api/villages)
    try {
      villagesData = await api.getVillages();
    } catch (err: unknown) {
      console.error('[API Failure: /api/villages]', err);
      failureReports.push(parseApiError(err, 'Census Village Catalog', '/api/villages'));
    }

    if (failureReports.length > 0) {
      const primary = failureReports[0];
      setApiError(primary);
      const combinedMessage = failureReports
        .map((f) => `[${f.category.toUpperCase()}] ${f.title}: ${f.message} (${f.technicalDetails})`)
        .join(' | ');
      setError(combinedMessage);
    } else {
      setStats(statsData);
      setVillages(villagesData);
      if (villagesData.length > 0 && !selectedVillageCode) {
        setSelectedVillageCode(villagesData[0].village_code);
      }
    }

    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadInitialData();
      showToast('Datasets & Priority Matrix reloaded.');
    } catch (err: unknown) {
      console.error('Refresh catch block triggered:', err);
      const errInfo = parseApiError(err, 'Platform Refresh', '/api/stats & /api/villages');
      showToast(`${errInfo.title}: ${errInfo.technicalDetails}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectVillage = (code: number) => {
    setSelectedVillageCode(code);
    setActivePage('village-profile');
  };

  const handleNewRequestSuccess = async (newVillageCode: number) => {
    try {
      await loadInitialData();
      setSelectedVillageCode(newVillageCode);
      showToast('Citizen grievance registered & priority engine updated.');
    } catch (err: unknown) {
      console.error('Post-submission data reload error:', err);
      const errInfo = parseApiError(err, 'Grievance Post-Sync', '/api/villages');
      showToast(`Notice: Request logged, but sync failed: ${errInfo.technicalDetails}`);
    }
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
            <div className="p-6 bg-white/40 backdrop-blur-md border border-rose-300 rounded-2xl text-black space-y-3 font-[Arial,sans-serif] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/60 pb-3">
                <div className="flex items-center gap-2 font-bold text-black text-sm">
                  {apiError?.category === 'connectivity' ? (
                    <WifiOff className="w-5 h-5 text-amber-700 flex-shrink-0" />
                  ) : apiError?.category === 'parsing' ? (
                    <FileCode2 className="w-5 h-5 text-purple-700 flex-shrink-0" />
                  ) : (
                    <ServerCrash className="w-5 h-5 text-rose-700 flex-shrink-0" />
                  )}
                  <span>{apiError?.title || 'API Failure Encountered'}</span>
                </div>
                {apiError?.category && (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                      apiError.category === 'connectivity'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : apiError.category === 'parsing'
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    {apiError.category === 'connectivity'
                      ? 'Connectivity Issue'
                      : apiError.category === 'parsing'
                      ? 'Data Parsing Error'
                      : 'API Server Error'}
                  </span>
                )}
              </div>

              <p className="text-xs text-black/85 font-medium leading-relaxed">
                {apiError?.message || error}
              </p>

              {apiError?.technicalDetails && (
                <div className="p-3 bg-white/60 rounded-xl border border-rose-200/80 text-[11px] font-mono text-black overflow-x-auto space-y-1">
                  <span className="font-bold text-black font-sans block">Technical Diagnostic:</span>
                  <code className="text-rose-950 font-bold block">{apiError.technicalDetails}</code>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={loadInitialData}
                  className="px-5 py-2 bg-black hover:bg-black/80 text-white rounded-full text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Retry Connection
                </button>
                <span className="text-[11px] text-black/70">
                  Target Endpoint: <strong className="text-black font-mono">{apiError?.endpoint || '/api/stats'}</strong>
                </span>
              </div>
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
