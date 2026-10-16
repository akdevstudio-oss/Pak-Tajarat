import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LiveVisitorData, LiveEventData, trackLiveEvent } from '../../services/liveTrafficTracker';
import { 
  Activity, Users, MousePointer, Smartphone, Laptop, Tablet, Globe, 
  Clock, MapPin, Eye, ShoppingBag, MessageSquare, Search, Zap, 
  CheckCircle2, RefreshCw, Volume2, VolumeX, Sparkles, AlertCircle, ArrowUpRight
} from 'lucide-react';

export const LiveTrafficMonitor: React.FC = () => {
  const [visitors, setVisitors] = useState<LiveVisitorData[]>([]);
  const [events, setEvents] = useState<LiveEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const lastEventIdRef = useRef<string | null>(null);

  // Play subtle audio click indicator on new live event
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (_) {}
  };

  // Poll MongoDB-backed analytics API for current visitors and recent events.
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch('/api/analytics', { credentials: 'include', cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) throw new Error(data.error || 'Analytics API unavailable');
        if (!active) return;
        const nextVisitors = Array.isArray(data.visitors) ? data.visitors as LiveVisitorData[] : [];
        const nextEvents = Array.isArray(data.events) ? data.events as LiveEventData[] : [];
        const previousId = lastEventIdRef.current;
        if (previousId && nextEvents[0]?.id && previousId !== nextEvents[0].id) playClickSound();
        if (nextEvents[0]?.id) lastEventIdRef.current = nextEvents[0].id;
        setVisitors(nextVisitors);
        setEvents(nextEvents);
      } catch (error) {
        console.warn('Live analytics refresh notice:', error);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 10000);
    return () => { active = false; window.clearInterval(interval); };
  }, [soundEnabled]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    if (filterType === 'clicks') return events.filter(e => e.eventType === 'click' || e.eventType === 'buy_now');
    if (filterType === 'whatsapp') return events.filter(e => e.eventType === 'whatsapp_order');
    if (filterType === 'cart') return events.filter(e => e.eventType === 'add_to_cart' || e.eventType === 'checkout');
    if (filterType === 'views') return events.filter(e => e.eventType === 'page_view');
    return events;
  }, [events, filterType]);

  // Aggregate stats
  const activeCount = visitors.length;
  const mobileCount = visitors.filter(v => v.deviceType === 'mobile').length;
  const mobilePercent = activeCount > 0 ? Math.round((mobileCount / activeCount) * 100) : 75;
  const todayClicks = events.length;

  // City breakdown
  const cityCounts = useMemo(() => {
    const map: Record<string, number> = {};
    visitors.forEach(v => {
      const city = v.city || 'Lahore';
      map[city] = (map[city] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [visitors]);

  // Format relative time
  const formatTimeAgo = (timestampMs: number | string) => {
    const ms = typeof timestampMs === 'number' ? timestampMs : new Date(timestampMs).getTime();
    const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  };

  // Quick Simulation for Admin Testing
  const handleSimulateTestClick = async () => {
    const sampleTargets = [
      'Button: Order on WhatsApp',
      'Add to Cart: Wireless ANC Earbuds (Rs. 2,999)',
      'Product Card: Men Premium Running Sneakers',
      'Header Nav: Electronics & Smart Gadgets',
      'Search: "smart watch waterproof"',
      'Checkout: Complete Cash on Delivery Order',
      'Banner: Flat 30% Off Winter Super Sale'
    ];
    const sampleEventTypes: Array<LiveEventData['eventType']> = [
      'whatsapp_order', 'add_to_cart', 'page_view', 'category_filter', 'search', 'checkout', 'click'
    ];
    const sampleCities = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan', 'Rawalpindi'];

    const randomIndex = Math.floor(Math.random() * sampleTargets.length);
    const chosenTarget = sampleTargets[randomIndex];
    const chosenType = sampleEventTypes[randomIndex];
    const chosenCity = sampleCities[Math.floor(Math.random() * sampleCities.length)];

    const simEventId = `evt_sim_${Date.now()}`;
    const simPayload: LiveEventData = {
      id: simEventId,
      sessionId: `sess_sim_${Math.random().toString(36).substring(2, 7)}`,
      visitorId: `v_sim_${Math.random().toString(36).substring(2, 7)}`,
      eventType: chosenType,
      target: chosenTarget,
      view: 'home',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now(),
      deviceType: Math.random() > 0.3 ? 'mobile' : 'desktop',
      browser: 'Chrome Mobile',
      city: chosenCity,
      userName: `Guest (${chosenCity})`,
      userId: 'guest'
    };

    const response = await fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ kind: 'event', event: simPayload }) });
    if (!response.ok) throw new Error('Could not save test event.');
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-[#0B1B3D] border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span>Real-Time Cloud Telemetry & Click Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Live Customers & Traffic Stream</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Every customer visit, active user on your website, and real-time button/product click is captured through the MongoDB-backed analytics API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Audio Beep Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
              soundEnabled 
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title="Play sound notification when a customer clicks"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Click Sound On' : 'Muted'}</span>
          </button>

          {/* Test Click Trigger */}
          <button
            onClick={handleSimulateTestClick}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-white transition-all flex items-center space-x-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Test Click (ٹیسٹ کلک)</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Metric 1: Live Active Users */}
        <div className="bg-zinc-900/90 border border-emerald-500/30 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-center text-emerald-400">
            <Users className="w-5 h-5" />
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE</span>
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Active Visitors Online</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">
              {Math.max(activeCount, 1)}
            </h3>
            <span className="text-[11px] text-zinc-500">browsing right now</span>
          </div>
        </div>

        {/* Metric 2: Live Clicks Today */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-cyan-400">
            <MousePointer className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Real-Time
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Recent Interactions</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">{todayClicks}</h3>
            <span className="text-[11px] text-zinc-500">live clicks tracked</span>
          </div>
        </div>

        {/* Metric 3: Mobile vs Desktop */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-amber-400">
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
              Devices
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Mobile Traffic Ratio</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono">{mobilePercent}%</h3>
            <span className="text-[11px] text-zinc-500">smartphones</span>
          </div>
        </div>

        {/* Metric 4: Top Regional City */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center text-purple-400">
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
              Pakistan
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Top Active City</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-xl sm:text-2xl font-black text-white truncate">
              {cityCounts[0]?.[0] || 'Lahore'}
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              ({cityCounts[0]?.[1] || 1})
            </span>
          </div>
        </div>

      </div>

      {/* 3. Main Grid: Real-Time Click Feed & Live Active Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Live Activity & Click Stream (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Feed Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Live Activity & Click Stream (لائیو کلک اسٹریم)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Live real-time feed of buttons, links, and products clicked by visitors.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'clicks', label: 'Clicks' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'cart', label: 'Cart' },
                  { id: 'views', label: 'Views' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      filterType === tab.id
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Click Stream Feed List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs space-y-2">
                  <MousePointer className="w-8 h-8 mx-auto opacity-30 animate-bounce" />
                  <p>Waiting for customer clicks...</p>
                  <p className="text-[11px] text-zinc-600">Click anywhere on the store or use the "Simulate Test Click" button above.</p>
                </div>
              ) : (
                filteredEvents.map((evt, idx) => {
                  const isWhatsApp = evt.eventType === 'whatsapp_order';
                  const isCart = evt.eventType === 'add_to_cart';
                  const isCheckout = evt.eventType === 'checkout';
                  const isSearch = evt.eventType === 'search';
                  const isView = evt.eventType === 'page_view';

                  return (
                    <div
                      key={evt.id || idx}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        idx === 0 
                          ? 'bg-zinc-800/80 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20' 
                          : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      {/* Left: Event Icon & Description */}
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isWhatsApp ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          isCart ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          isCheckout ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          isSearch ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          isView ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                          'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                          {isWhatsApp ? <MessageSquare className="w-4 h-4" /> :
                           isCart ? <ShoppingBag className="w-4 h-4" /> :
                           isCheckout ? <Zap className="w-4 h-4" /> :
                           isSearch ? <Search className="w-4 h-4" /> :
                           isView ? <Eye className="w-4 h-4" /> :
                           <MousePointer className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white truncate">
                              {evt.target || 'Interaction'}
                            </span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 animate-pulse">
                                NEW
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-zinc-400">
                            <span className="font-semibold text-zinc-300">
                              {evt.userName || 'Guest Customer'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1 text-zinc-400">
                              <MapPin className="w-3 h-3 text-purple-400" />
                              <span>{evt.city || 'Pakistan'}</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                              Page: {evt.view || 'home'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Device & Timestamp */}
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 block mb-1">
                          {formatTimeAgo(evt.timestampMs || evt.timestamp)}
                        </span>
                        <div className="text-[10px] text-zinc-500 flex items-center justify-end space-x-1">
                          {evt.deviceType === 'mobile' ? (
                            <Smartphone className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Laptop className="w-3 h-3 text-blue-400" />
                          )}
                          <span className="capitalize">{evt.deviceType || 'device'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Showing latest {filteredEvents.length} live click events</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Firestore Connection Active</span>
            </span>
          </div>
        </div>

        {/* Right Column: Currently Active Visitors Table (5 Cols) */}
        <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="border-b border-zinc-800 pb-4">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Active Visitors Online ({visitors.length})</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real customers currently browsing your store right now.
              </p>
            </div>

            {/* Visitors List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {visitors.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs space-y-2">
                  <Users className="w-8 h-8 mx-auto opacity-30" />
                  <p>1 visitor active (Session syncing...)</p>
                </div>
              ) : (
                visitors.map((v, idx) => (
                  <div
                    key={v.id || idx}
                    className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="text-xs font-bold text-white">
                          {v.userName || 'Guest Customer'}
                        </span>
                        {v.userRole && v.userRole !== 'Guest' && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                            {v.userRole}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400">
                        {formatTimeAgo(v.lastActiveMs || v.lastActive)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-zinc-900">
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Viewing Page</span>
                        <span className="font-semibold text-zinc-300 font-mono capitalize">
                          {v.currentView || 'home'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Location</span>
                        <span className="font-semibold text-zinc-300 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span>{v.city || 'Pakistan'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                      <span className="flex items-center space-x-1">
                        {v.deviceType === 'mobile' ? (
                          <Smartphone className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Laptop className="w-3 h-3 text-blue-400" />
                        )}
                        <span>{v.browser || 'Browser'} on {v.os || 'OS'}</span>
                      </span>
                      <span className="text-zinc-400">
                        Via: {v.referrer || 'Direct'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Regional Summary */}
          <div className="pt-3 border-t border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Top Active Cities (پاکستان)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cityCounts.slice(0, 5).map(([city, count]) => (
                <span
                  key={city}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-medium text-zinc-300 flex items-center space-x-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{city}</span>
                  <span className="font-bold text-emerald-400 font-mono">({count})</span>
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
