import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bookmark,
  MapPin,
  Radar as RadarIcon,
  User,
  Flame,
  Clock,
  Crown,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const DEALS = [
  {
    id: 1,
    name: 'Taco Bell',
    kind: 'chain',
    tag: 'Chain',
    deal: '$2 off any order',
    distanceMi: 0.3,
    mins: 42,
    live: true,
    angle: 20,
    radius: 0.35,
    promoted: false,
  },
  {
    id: 2,
    name: 'La Espiga Bakery',
    kind: 'local',
    tag: 'Local',
    deal: 'Free pastry with coffee, today only',
    distanceMi: 0.5,
    mins: 118,
    live: true,
    angle: 80,
    radius: 0.5,
    promoted: false,
  },
  {
    id: 3,
    name: 'Panda Express',
    kind: 'chain',
    tag: 'Chain',
    deal: '20% off with code PANDA20',
    distanceMi: 0.8,
    mins: 300,
    live: true,
    angle: 150,
    radius: 0.7,
    promoted: false,
  },
  {
    id: 4,
    name: 'Fog City Noodle Bar',
    kind: 'local',
    tag: 'Local',
    deal: 'Half off ramen, 2–4pm slow hours',
    distanceMi: 1.1,
    mins: 9,
    live: true,
    angle: 210,
    radius: 0.85,
    promoted: true,
  },
  {
    id: 5,
    name: 'KFC',
    kind: 'chain',
    tag: 'Chain',
    deal: '50% off with app code',
    distanceMi: 1.4,
    mins: 240,
    live: true,
    angle: 260,
    radius: 0.95,
    promoted: false,
  },
  {
    id: 6,
    name: 'Mission Taqueria',
    kind: 'local',
    tag: 'Local',
    deal: 'Buy one burrito, get one 50% off',
    distanceMi: 0.4,
    mins: 0,
    live: false,
    angle: 320,
    radius: 0.4,
    promoted: false,
  },
  {
    id: 7,
    name: 'Sonic Drive-In',
    kind: 'chain',
    tag: 'Chain',
    deal: 'Half-price drinks, 2–4pm',
    distanceMi: 2.0,
    mins: 61,
    live: true,
    angle: 100,
    radius: 1.0,
    promoted: false,
  },
  {
    id: 8,
    name: 'Bayview Bagelry',
    kind: 'local',
    tag: 'Local',
    deal: 'Kids bagel free with adult combo',
    distanceMi: 0.6,
    mins: 0,
    live: false,
    angle: 190,
    radius: 0.55,
    promoted: false,
  },
];

const FILTERS = ['All', 'Live now', 'Local only', 'Ending soon'];

function formatMins(m) {
  if (m <= 0) return 'Ended';
  if (m < 60) return `${m}m left`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m left` : `${h}h left`;
}

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-6 rounded-full shrink-0 transition-colors duration-200"
      style={{ background: on ? '#8FF7B0' : '#1E2A24' }}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-[#0D1210] transition-transform duration-200"
        style={{ transform: on ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

export default function GrubRadar() {
  const [scanning, setScanning] = useState(true);
  const [filter, setFilter] = useState('All');
  const [saved, setSaved] = useState(() => new Set());
  const feedRefs = useRef({});
  const [highlight, setHighlight] = useState(null);
  const [tab, setTab] = useState('radar');
  const [prefs, setPrefs] = useState({
    liveOnly: true,
    localOnly: false,
    closeOnly: false,
  });

  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const visible = useMemo(() => {
    return DEALS.filter((d) => {
      if (filter === 'Live now') return d.live;
      if (filter === 'Local only') return d.kind === 'local';
      if (filter === 'Ending soon') return d.live && d.mins <= 60;
      return true;
    }).sort((a, b) => b.promoted - a.promoted || a.distanceMi - b.distanceMi);
  }, [filter]);

  function toggleSave(id) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function onBlipClick(id) {
    setTab('radar');
    setHighlight(id);
    setTimeout(
      () =>
        feedRefs.current[id]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        }),
      30
    );
    setTimeout(() => setHighlight(null), 1400);
  }

  function setPref(key) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  const liveCount = DEALS.filter((d) => d.live).length;
  const savedDeals = DEALS.filter((d) => saved.has(d.id));

  function DealCard(d, i) {
    const isSaved = saved.has(d.id);
    const isHi = highlight === d.id;
    return (
      <div
        key={d.id}
        ref={(el) => (feedRefs.current[d.id] = el)}
        className="scan-enter rounded-xl bg-[#12201A] border p-3.5 flex gap-3"
        style={{
          animationDelay: `${i * 40}ms`,
          borderColor: isHi ? '#8FF7B0' : d.promoted ? '#3A331A' : '#1E2A24',
          borderLeftWidth: 3,
          borderLeftColor: d.live
            ? d.kind === 'chain'
              ? '#F2A93C'
              : '#8FF7B0'
            : '#2A362F',
          transition: 'border-color .3s ease',
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[#EAF3EC] text-[15px] font-medium truncate">
              {d.name}
            </span>
            {d.promoted && (
              <span className="mono text-[9px] tracking-wide text-[#F2A93C] bg-[#1C160A] border border-[#3A331A] rounded px-1.5 py-0.5 flex items-center gap-1 shrink-0">
                <Crown size={9} /> PROMOTED
              </span>
            )}
            {d.live && (
              <span className="mono text-[9px] tracking-wide text-[#8FF7B0] bg-[#0F1C15] border border-[#213B2C] rounded px-1.5 py-0.5 flex items-center gap-1 shrink-0">
                <Flame size={9} /> LIVE
              </span>
            )}
          </div>
          <div className="text-[#C9D4CE] text-[13px] mt-1 leading-snug">
            {d.deal}
          </div>
          <div className="mono text-[11px] text-[#7C8A82] mt-2 flex items-center gap-3">
            <span>{d.distanceMi} mi</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {formatMins(d.mins)}
            </span>
            <span
              className="uppercase tracking-wide"
              style={{ color: d.kind === 'chain' ? '#F2A93C' : '#8FF7B0' }}
            >
              {d.tag}
            </span>
          </div>
        </div>
        <button
          onClick={() => toggleSave(d.id)}
          className="shrink-0 self-start p-1.5 rounded-lg hover:opacity-80 transition-opacity"
          aria-label="Save deal"
        >
          <Bookmark
            size={18}
            fill={isSaved ? '#8FF7B0' : 'none'}
            color={isSaved ? '#8FF7B0' : '#7C8A82'}
            strokeWidth={1.8}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      className="min-h-screen w-full flex items-start justify-center bg-[#050806] p-4"
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .mono { font-family: 'IBM Plex Mono', monospace; }
        @keyframes sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blipPulse { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.35); } }
        @keyframes ringFade { 0% { opacity: .5; transform: scale(.3); } 100% { opacity: 0; transform: scale(1); } }
        @keyframes scanIn { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
        .scan-enter { animation: scanIn .4s ease both; }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>

      <div className="relative w-full max-w-[390px] h-[820px] rounded-[2rem] overflow-hidden bg-[#0D1210] border border-[#1E2A24] shadow-2xl flex flex-col">
        {/* top scan progress bar, radar motif */}
        <div className="h-[2px] w-full bg-[#1E2A24] shrink-0">
          <div
            className="h-full bg-[#8FF7B0]"
            style={{
              width: scanning ? '0%' : '100%',
              transition: 'width 1.4s ease',
            }}
          />
        </div>

        {tab === 'radar' && (
          <>
            {/* header */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
              <div>
                <div className="text-[#EAF3EC] text-[19px] font-semibold tracking-tight">
                  GrubRadar
                </div>
                <div className="flex items-center gap-1 text-[#7C8A82] text-[12px] mt-0.5">
                  <MapPin size={12} strokeWidth={2} />
                  <span>Mission District, SF</span>
                </div>
              </div>
              <div className="mono text-[11px] text-[#8FF7B0] bg-[#122019] border border-[#213B2C] rounded-full px-3 py-1.5">
                {liveCount} live
              </div>
            </div>

            {/* radar hero */}
            <div className="relative shrink-0 h-[240px] mx-4 rounded-2xl bg-[#0A0F0C] border border-[#1E2A24] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[210px] h-[210px]">
                  {[1, 2, 3].map((r) => (
                    <div
                      key={r}
                      className="absolute rounded-full border border-[#1F3A2A]"
                      style={{ inset: `${(3 - r) * 35}px` }}
                    />
                  ))}
                  {!scanning && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          'conic-gradient(from 0deg, rgba(143,247,176,0.32), transparent 30%)',
                        animation: 'sweep 4s linear infinite',
                      }}
                    />
                  )}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#EAF3EC]" />
                  {!scanning &&
                    DEALS.map((d) => {
                      const rad = (d.angle * Math.PI) / 180;
                      const dist = 20 + d.radius * 85;
                      const x = 105 + dist * Math.cos(rad);
                      const y = 105 + dist * Math.sin(rad);
                      const color = d.kind === 'chain' ? '#F2A93C' : '#8FF7B0';
                      return (
                        <button
                          key={d.id}
                          onClick={() => onBlipClick(d.id)}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{ left: x, top: y }}
                          aria-label={`${d.name} deal`}
                        >
                          {d.live && (
                            <span
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: color,
                                animation: 'ringFade 2.6s ease-out infinite',
                              }}
                            />
                          )}
                          {d.promoted && (
                            <span className="absolute -inset-1 rounded-full border border-[#F2A93C]" />
                          )}
                          <span
                            className="relative block w-2.5 h-2.5 rounded-full"
                            style={{
                              background: color,
                              animation: d.live
                                ? 'blipPulse 2.6s ease-in-out infinite'
                                : 'none',
                              opacity: d.live ? undefined : 0.35,
                            }}
                          />
                        </button>
                      );
                    })}
                </div>
              </div>
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center mono text-[12px] text-[#7C8A82] tracking-wide">
                  scanning nearby…
                </div>
              )}
              <div className="absolute bottom-3 left-4 flex items-center gap-3 text-[10px] mono text-[#7C8A82]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F2A93C] inline-block" />{' '}
                  chain
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#8FF7B0] inline-block" />{' '}
                  local
                </span>
              </div>
            </div>

            {/* filters */}
            <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto shrink-0">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="shrink-0 text-[13px] px-3.5 py-1.5 rounded-full border transition-colors duration-200"
                  style={{
                    borderColor: filter === f ? '#8FF7B0' : '#1E2A24',
                    color: filter === f ? '#0D1210' : '#B7C4BC',
                    background: filter === f ? '#8FF7B0' : 'transparent',
                    fontWeight: filter === f ? 600 : 500,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* feed */}
            <div className="flex-1 overflow-y-auto px-4 pb-3 pt-1 space-y-2.5">
              {visible.map((d, i) => DealCard(d, i))}
              {visible.length === 0 && (
                <div className="text-center text-[#7C8A82] text-[13px] mono pt-10">
                  no deals match this filter right now
                </div>
              )}
              <div className="flex items-start gap-2 mono text-[10px] text-[#556058] pt-2 pb-24 leading-relaxed">
                <ShieldCheck size={13} className="shrink-0 mt-0.5" />
                <span>
                  Chain deals are aggregated from public codes. Local deals are
                  submitted and controlled by the restaurants themselves.
                </span>
              </div>
            </div>
          </>
        )}

        {tab === 'saved' && (
          <div className="flex-1 overflow-y-auto px-4 pt-5 pb-24">
            <div className="text-[#EAF3EC] text-[19px] font-semibold tracking-tight mb-4">
              Saved
            </div>
            {savedDeals.length === 0 ? (
              <div className="text-center text-[#7C8A82] text-[13px] mono pt-16">
                nothing saved yet — tap the bookmark on a deal
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedDeals.map((d, i) => DealCard(d, i))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-24">
            <div className="text-[#EAF3EC] text-[19px] font-semibold tracking-tight mb-1">
              Profile
            </div>
            <div className="text-[#7C8A82] text-[12px] mb-6">
              Built to notify, not annoy.
            </div>

            <div className="text-[#7C8A82] mono text-[10px] uppercase tracking-wide mb-2">
              Notification preferences
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between bg-[#12201A] border border-[#1E2A24] rounded-xl px-4 py-3">
                <div>
                  <div className="text-[#EAF3EC] text-[13px]">
                    Live deals only
                  </div>
                  <div className="text-[#7C8A82] text-[11px] mt-0.5">
                    Skip anything that already ended
                  </div>
                </div>
                <Toggle
                  on={prefs.liveOnly}
                  onClick={() => setPref('liveOnly')}
                />
              </div>
              <div className="flex items-center justify-between bg-[#12201A] border border-[#1E2A24] rounded-xl px-4 py-3">
                <div>
                  <div className="text-[#EAF3EC] text-[13px]">
                    Local restaurants only
                  </div>
                  <div className="text-[#7C8A82] text-[11px] mt-0.5">
                    Mute chain promo codes
                  </div>
                </div>
                <Toggle
                  on={prefs.localOnly}
                  onClick={() => setPref('localOnly')}
                />
              </div>
              <div className="flex items-center justify-between bg-[#12201A] border border-[#1E2A24] rounded-xl px-4 py-3">
                <div>
                  <div className="text-[#EAF3EC] text-[13px]">
                    Within 0.5 miles
                  </div>
                  <div className="text-[#7C8A82] text-[11px] mt-0.5">
                    Only alert for walkable deals
                  </div>
                </div>
                <Toggle
                  on={prefs.closeOnly}
                  onClick={() => setPref('closeOnly')}
                />
              </div>
            </div>

            <div className="text-[#7C8A82] mono text-[10px] uppercase tracking-wide mb-2">
              Account
            </div>
            <div className="bg-[#12201A] border border-[#1E2A24] rounded-xl overflow-hidden">
              {[
                'Home base: Mission District, SF',
                'Own a restaurant? List a deal',
                'How we source deals',
              ].map((label, i) => (
                <button
                  key={label}
                  className="w-full flex items-center justify-between px-4 py-3 text-[13px] text-[#C9D4CE] hover:bg-[#16241D] transition-colors"
                  style={{ borderTop: i ? '1px solid #1E2A24' : 'none' }}
                >
                  {label}
                  <ChevronRight size={15} color="#556058" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* bottom nav */}
        <div className="absolute bottom-0 left-0 right-0 h-[64px] bg-[#0D1210] border-t border-[#1E2A24] flex items-center justify-around">
          <button
            onClick={() => setTab('radar')}
            className="flex flex-col items-center gap-1 transition-colors"
            style={{ color: tab === 'radar' ? '#8FF7B0' : '#7C8A82' }}
          >
            <RadarIcon size={20} />
            <span className="text-[10px] mono">Radar</span>
          </button>
          <button
            onClick={() => setTab('saved')}
            className="flex flex-col items-center gap-1 transition-colors"
            style={{ color: tab === 'saved' ? '#8FF7B0' : '#7C8A82' }}
          >
            <Bookmark size={20} />
            <span className="text-[10px] mono">
              Saved{saved.size ? ` (${saved.size})` : ''}
            </span>
          </button>
          <button
            onClick={() => setTab('profile')}
            className="flex flex-col items-center gap-1 transition-colors"
            style={{ color: tab === 'profile' ? '#8FF7B0' : '#7C8A82' }}
          >
            <User size={20} />
            <span className="text-[10px] mono">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
