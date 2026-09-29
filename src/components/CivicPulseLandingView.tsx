import React, { useState, useEffect, useMemo } from 'react';
import { 
  LogIn, UserPlus, Play, Sparkles, Menu, X, 
  Mic, Map as MapIcon, Cpu, BarChart3, Globe, 
  ShieldCheck, ArrowRight, Activity, Users, 
  Building2, MessageSquare, CheckCircle2, Download
} from 'lucide-react';
import { StatsKPI, VillageData } from '../types';

interface CivicPulseLandingViewProps {
  stats: StatsKPI | null;
  villages: VillageData[];
  onOpenDashboard: () => void;
  onOpenRequests: () => void;
  onOpenHotspots: () => void;
  onOpenMethodology: () => void;
  onOpenAICommand: () => void;
  onSelectVillage: (villageCode: number) => void;
  onOpenNewRequestModal: () => void;
  onOpenDemoModal: () => void;
  onShowToast: (msg: string) => void;
}

export const CivicPulseLandingView: React.FC<CivicPulseLandingViewProps> = ({
  stats,
  villages,
  onOpenDashboard,
  onOpenRequests,
  onOpenHotspots,
  onOpenMethodology,
  onOpenAICommand,
  onSelectVillage,
  onOpenNewRequestModal,
  onOpenDemoModal,
  onShowToast,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#platform', label: 'Platform' },
    { href: '#data-models', label: 'Data Models' },
    { href: '#impact', label: 'Impact' },
  ];

  const totalPopulation = useMemo(() => {
    if (!villages || villages.length === 0) return 8200000;
    return villages.reduce((acc, v) => acc + (v.population || 0), 0);
  }, [villages]);

  // Derive dynamic chart bars from real category distribution across villages or defaults
  const sectorBars: { name: string; count: number; pct: number }[] = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    if (villages && villages.length > 0) {
      villages.forEach((v) => {
        if (v.categoryDistribution) {
          Object.entries(v.categoryDistribution).forEach(([cat, cnt]) => {
            const countNum = typeof cnt === 'number' ? cnt : 0;
            categoryTotals[cat] = (categoryTotals[cat] || 0) + countNum;
          });
        }
      });
    }

    const entries = Object.entries(categoryTotals);
    if (entries.length > 0) {
      const maxVal = Math.max(...entries.map(([, v]) => v), 1);
      return entries.slice(0, 12).map(([cat, count]) => ({
        name: cat,
        count,
        pct: Math.max(15, Math.round((count / maxVal) * 95))
      }));
    }

    // Default fallback distribution
    return [
      { name: 'Water', count: 4800, pct: 40 },
      { name: 'Roads', count: 8400, pct: 70 },
      { name: 'Drainage', count: 5400, pct: 45 },
      { name: 'Power', count: 10800, pct: 90 },
      { name: 'Health', count: 7800, pct: 65 },
      { name: 'Education', count: 9600, pct: 80 },
      { name: 'Transit', count: 6000, pct: 50 },
      { name: 'Waste', count: 10200, pct: 85 },
      { name: 'Digital', count: 7200, pct: 60 },
      { name: 'Banking', count: 9000, pct: 75 },
      { name: 'Safety', count: 4800, pct: 40 },
      { name: 'Environment', count: 11400, pct: 95 },
    ];
  }, [villages]);

  // Derive top 4 real hotspots from villages dataset or default to BRICS demonstration hotspots
  const displayHotspots = useMemo(() => {
    if (villages && villages.length >= 4) {
      const sorted = [...villages].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 4);
      return sorted.map((v, i) => {
        let severityLabel = 'High';
        let color = 'bg-gray-800';
        if (v.priorityScore >= 80) {
          severityLabel = 'Critical';
          color = 'bg-black';
        } else if (v.priorityScore < 60) {
          severityLabel = 'Medium';
          color = 'bg-gray-500';
        }
        return {
          loc: `${v.village_name}, ${v.sub_district_name} - ${v.topCategory}`,
          severity: severityLabel,
          fill: `${Math.min(100, Math.max(20, v.priorityScore))}%`,
          color,
          villageCode: v.village_code
        };
      });
    }

    return [
      { loc: 'São Paulo, BR - Water', severity: 'Critical', fill: '90%', color: 'bg-black', villageCode: 612749 },
      { loc: 'Mumbai, IN - Roads', severity: 'High', fill: '75%', color: 'bg-gray-800', villageCode: 612750 },
      { loc: 'Cape Town, ZA - Power', severity: 'Medium', fill: '45%', color: 'bg-gray-500', villageCode: 612751 },
      { loc: 'Beijing, CN - Transit', severity: 'Low', fill: '20%', color: 'bg-gray-300', villageCode: 612752 },
    ];
  }, [villages]);

  const handleExportCSV = () => {
    if (!villages || villages.length === 0) {
      onShowToast('No village data available to export.');
      return;
    }
    const headers = [
      'village_code', 'village_name', 'sub_district_name', 'population',
      'request_count', 'high_severity_count', 'top_category', 'priority_score'
    ];
    const rows = villages.map(v => [
      v.village_code,
      `"${v.village_name}"`,
      `"${v.sub_district_name}"`,
      v.population,
      v.requestCount,
      v.highSeverityCount,
      `"${v.topCategory}"`,
      v.priorityScore
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CivicPulse_DPG_Settlement_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('CSV exported successfully.');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      setNewsletterSubscribed(true);
      onShowToast(`Subscribed ${newsletterEmail} to CivicPulse DPG briefing.`);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-black selection:text-white">
      {/* Top Fixed Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4 sm:py-6'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10">
          <div className="flex items-center gap-2 text-black">
            <a href="#" className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight hover:opacity-80 transition-opacity">
              CivicPulse<sup className="text-[10px] sm:text-xs font-medium ml-0.5 text-gray-500">DPG</sup>
            </a>
          </div>

          <div className={`hidden lg:flex items-center gap-1 rounded-full pl-6 pr-1 py-1 transition-all ${scrolled ? 'bg-gray-100/50' : 'glass-panel'}`}>
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm px-3 py-2 transition-colors ${
                  i === 0 ? 'font-semibold text-black' : 'font-medium text-gray-600 hover:text-black'
                }`}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={onOpenDashboard}
              className="ml-2 bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              View Dashboard
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 text-black">
            <button
              onClick={onOpenNewRequestModal}
              className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
            <button
              onClick={onOpenDashboard}
              className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Enter
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full glass-panel text-black transition-all duration-300 hover:bg-white/90 cursor-pointer"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <Menu className={`w-5 h-5 absolute transition-all duration-300 ${menuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`w-5 h-5 absolute transition-all duration-300 ${menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Mobile Slide-in Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-40 w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-8">
          <div className="flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-2xl font-semibold text-black py-4 border-b border-black/10 transition-all duration-500 ${
                  menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                }`}
                style={{ transitionDelay: menuOpen ? `${150 + i * 70}ms` : '0ms' }}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenHotspots();
              }}
              className="text-2xl font-semibold text-black py-4 border-b border-black/10 text-left cursor-pointer"
            >
              Demand Hotspots
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenMethodology();
              }}
              className="text-2xl font-semibold text-black py-4 border-b border-black/10 text-left cursor-pointer"
            >
              Methodology
            </button>
          </div>

          <div
            className={`mt-8 flex flex-col gap-4 transition-all duration-500 ${
              menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}
            style={{ transitionDelay: menuOpen ? '400ms' : '0ms' }}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenNewRequestModal();
              }}
              className="flex items-center gap-2 text-sm font-medium text-black cursor-pointer text-left"
            >
              <UserPlus className="w-4 h-4" />
              Sign Me Up!
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenDashboard();
              }}
              className="flex items-center gap-2 text-sm font-medium text-black cursor-pointer text-left"
            >
              <LogIn className="w-4 h-4" />
              Enter Console
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenDashboard();
              }}
              className="mt-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-full transition-colors cursor-pointer text-center"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-300/30 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-black/5 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 w-full max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-black/10 text-black text-xs font-semibold tracking-wide uppercase mb-8 shadow-sm backdrop-blur-sm">
            <Globe className="w-3.5 h-3.5" />
            Active in 5 BRICS Nations
          </div>
          <h1
            className="font-normal leading-[0.95] text-black text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] max-w-5xl"
            style={{ letterSpacing: '-0.035em' }}
          >
            Amplify citizen voices.{' '}
            <span className="text-gray-500 inline-block mt-2 sm:mt-0">
              Drive intelligent
              <br className="hidden sm:block" /> infrastructure.
            </span>
          </h1>
          <p className="mt-6 sm:mt-8 text-gray-600 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl px-2 font-medium">
            A scalable, multilingual AI Digital Public Good aggregating grassroots requests across voice and text to guide national policymakers.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4">
            <button
              onClick={onOpenNewRequestModal}
              className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white text-base font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenDemoModal}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-black border border-gray-200 text-base font-semibold px-8 py-4 rounded-full transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Watch Demo
            </button>
          </div>
        </div>

        {/* Floating Bottom Left Hotspot Engine Card */}
        <div className="absolute left-4 right-4 sm:right-auto sm:left-6 md:left-10 bottom-6 sm:bottom-8 md:bottom-10 z-10 max-w-sm glass-panel p-5 rounded-3xl">
          <div className="flex items-center gap-2 text-black mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-bold">
              Hotspot Engine<sup className="text-[10px]">TM</sup>
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-5 font-medium">
            Analyze massive datasets combining public feedback, demographic data, and investment plans to recommend high-priority projects.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenHotspots}
              className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm cursor-pointer"
            >
              Explore Analytics
            </button>
            <button
              onClick={onOpenMethodology}
              className="text-black text-xs font-semibold hover:opacity-70 transition-opacity cursor-pointer"
            >
              Read Docs
            </button>
          </div>
        </div>

        {/* Floating Bottom Right Video Badge */}
        <div
          onClick={onOpenDemoModal}
          className="hidden sm:flex absolute right-6 md:right-10 bottom-8 md:bottom-10 z-10 items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-black/10 shadow-sm text-black text-sm cursor-pointer hover:bg-white/80 transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/5">
            <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
          </div>
          <span className="font-semibold">Platform Intro</span>
          <span className="text-gray-500 font-medium border-l border-black/10 pl-3">2:15</span>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-24 bg-white relative z-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-black text-3xl sm:text-4xl md:text-5xl mb-6 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              Built for <span className="text-gray-500">scale.</span><br />Designed for <span className="font-semibold">impact.</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              CivicPulse operates at the intersection of grassroots engagement and high-level policymaking, ensuring that infrastructure investments are driven by actual citizen needs rather than guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {[
              {
                icon: <Mic className="w-6 h-6" />,
                title: 'Omnichannel Intake',
                desc: 'Citizens can report issues via SMS, WhatsApp, Voice Calls, and Web. Multi-lingual NLP models instantly transcribe and translate regional dialects into actionable data.',
                action: onOpenNewRequestModal,
                actionLabel: 'Try Intake Flow'
              },
              {
                icon: <Cpu className="w-6 h-6" />,
                title: 'AI Categorization',
                desc: 'Our proprietary classification engine tags incoming reports by sector (Water, Roads, Power) and severity, bypassing manual triage and accelerating response times.',
                action: onOpenRequests,
                actionLabel: 'View Classified Grievances'
              },
              {
                icon: <MapIcon className="w-6 h-6" />,
                title: 'Geospatial Mapping',
                desc: 'Every voice matters and has a location. Complaints are mapped to specific geo-coordinates, instantly forming heatmaps of critical infrastructure failures.',
                action: onOpenHotspots,
                actionLabel: 'Inspect Hotspots'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                onClick={feature.action}
                className="bg-[#FAFAFA] p-8 rounded-[2rem] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border border-gray-100 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-gray-200 text-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{feature.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center gap-1 text-xs font-semibold text-black group-hover:text-gray-600 transition-colors">
                  <span>{feature.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Models Section */}
      <section id="data-models" className="py-24 bg-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/5 rounded-full blur-[100px] -z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-gray-300 text-xs font-semibold tracking-wide uppercase mb-6">
                <ShieldCheck className="w-3.5 h-3.5" /> Data Pipeline
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 tracking-tight font-light">
                From raw <span className="font-semibold text-gray-400">noise</span> to policy <span className="font-semibold text-white">signal.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Our transparent, open-source data models are audited for bias and designed specifically for developing nations' unique infrastructure challenges.
              </p>
              
              <ul className="space-y-6">
                {[
                  { title: 'Data Anonymization', desc: 'PII is stripped at the edge before hitting the central database.' },
                  { title: 'Sentiment Analysis', desc: 'Understanding the urgency and tone behind citizen requests.' },
                  { title: 'Predictive Resource Allocation', desc: 'Forecasting where infrastructure will fail next based on historical trends.' }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-black text-xs font-bold">{idx + 1}</div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm relative shadow-2xl">
                {/* Mock Code / Model View */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">model_pipeline.py</div>
                </div>
                <div className="font-mono text-sm text-gray-300 space-y-2 overflow-x-auto">
                  <p><span className="text-gray-400">import</span> pandas <span className="text-gray-400">as</span> pd</p>
                  <p><span className="text-gray-400">from</span> civicpulse.nlp <span className="text-gray-400">import</span> Translator, Classifier</p>
                  <br/>
                  <p><span className="text-gray-500"># 1. Ingest raw citizen audio logs</span></p>
                  <p>raw_data = pd.read_stream(<span className="text-gray-300">"whatsapp_audio_queue"</span>)</p>
                  <br/>
                  <p><span className="text-gray-500"># 2. Transcribe & Translate to English</span></p>
                  <p>text_data = Translator.process(raw_data, target=<span className="text-gray-300">'en'</span>)</p>
                  <br/>
                  <p><span className="text-gray-500"># 3. Classify Issue & Predict Severity (0-10)</span></p>
                  <p>insights = Classifier.predict(text_data)</p>
                  <p>insights.route_to_dashboard(region=<span className="text-gray-300">"SA_Gauteng"</span>)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact / Dashboard Section */}
      <section id="impact" className="py-24 bg-[#FAFAFA] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-black text-3xl sm:text-4xl md:text-5xl mb-4 tracking-tight">
              Real-time <span className="font-semibold">Dashboard</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Equipping decision-makers with live macro and micro views of their nation's civic health.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 p-6 md:p-10">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-black">National Overview</h3>
                <p className="text-sm text-gray-500">Last updated: Just now</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-gray-100 text-sm font-medium text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={onOpenAICommand}
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { 
                  label: 'Active Reports', 
                  val: stats?.totalRequests ? stats.totalRequests.toLocaleString() : '124,592', 
                  inc: '+12%', 
                  icon: <Activity className="w-5 h-5" /> 
                },
                { 
                  label: 'Citizens Reached', 
                  val: totalPopulation > 0 ? `${(totalPopulation / 1000000).toFixed(1)}M` : '8.2M', 
                  inc: '+4.5%', 
                  icon: <Users className="w-5 h-5" /> 
                },
                { 
                  label: 'Projects Funded', 
                  val: stats?.totalVillages ? `${stats.totalVillages.toLocaleString()}` : '3,490', 
                  inc: '+22%', 
                  icon: <Building2 className="w-5 h-5" /> 
                },
                { 
                  label: 'Avg Resolution', 
                  val: '14 days', 
                  inc: '-2 days', 
                  icon: <MessageSquare className="w-5 h-5" /> 
                },
              ].map((stat, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#FAFAFA] border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-gray-500">{stat.icon}</div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-200 text-black">
                      {stat.inc}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">{stat.val}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Dashboard Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100 flex flex-col h-80">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-semibold text-black">Report Volume by Sector</h4>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 flex items-end gap-2 sm:gap-4 mt-auto pb-1">
                  {sectorBars.map((bar, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-black to-gray-400 rounded-t-md opacity-80 hover:opacity-100 transition-opacity relative group cursor-pointer"
                      style={{ height: `${bar.pct}%` }}
                      title={`${bar.name}: ${bar.count.toLocaleString()} requests`}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-md">
                        {bar.name}: {bar.count.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[11px] text-gray-400 font-medium border-t border-gray-200 pt-3 overflow-hidden">
                  {sectorBars.slice(0, 6).map((b, i) => (
                    <span key={i} className="truncate px-1">{b.name}</span>
                  ))}
                </div>
              </div>

              {/* Priority Hotspots Card */}
              <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-black">Priority Hotspots</h4>
                  <span className="text-xs text-gray-400 font-mono">Live Matrix</span>
                </div>
                <div className="space-y-4 flex-1">
                  {displayHotspots.map((hs, i) => (
                    <div
                      key={i}
                      onClick={() => onSelectVillage(hs.villageCode)}
                      className="cursor-pointer hover:bg-gray-100/70 p-2 rounded-xl transition"
                    >
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-black font-semibold truncate pr-2">{hs.loc}</span>
                        <span className="text-gray-500 font-mono shrink-0">{hs.severity}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${hs.color} rounded-full transition-all duration-500`}
                          style={{ width: hs.fill }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onOpenHotspots}
                  className="w-full mt-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-black hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  View Full Map & Ranking
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 text-white mb-6">
                <span className="text-xl font-semibold tracking-tight">
                  CivicPulse<sup className="text-xs font-medium ml-0.5 text-gray-500">DPG</sup>
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Building the open-source data infrastructure for the next generation of participatory democracy and urban planning.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={onOpenHotspots} className="hover:text-white transition-colors cursor-pointer text-left">
                    Hotspot Engine
                  </button>
                </li>
                <li>
                  <button onClick={onOpenRequests} className="hover:text-white transition-colors cursor-pointer text-left">
                    NLP Models & Grievances
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAICommand} className="hover:text-white transition-colors cursor-pointer text-left">
                    AI Command Center
                  </button>
                </li>
                <li>
                  <button onClick={onOpenMethodology} className="hover:text-white transition-colors cursor-pointer text-left">
                    API Documentation & Rules
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Organization</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#platform" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <button onClick={onOpenMethodology} className="hover:text-white transition-colors cursor-pointer text-left">
                    Open Source & Governance
                  </button>
                </li>
                <li>
                  <button onClick={onOpenDemoModal} className="hover:text-white transition-colors cursor-pointer text-left">
                    Interactive Walkthrough
                  </button>
                </li>
                <li>
                  <button onClick={onOpenNewRequestModal} className="hover:text-white transition-colors cursor-pointer text-left">
                    Report Issue / Feedback
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
              <p className="text-sm text-gray-400 mb-4">
                Subscribe to our newsletter for platform updates and case studies.
              </p>
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input 
                    type="email" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Email address" 
                    required
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white w-full transition-colors"
                  />
                  <button 
                    type="submit"
                    className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} CivicPulse DPG. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-white transition-colors cursor-pointer">Cookie Settings</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
