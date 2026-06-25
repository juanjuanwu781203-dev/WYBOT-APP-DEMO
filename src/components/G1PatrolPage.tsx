import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Battery,
  Camera,
  CameraOff,
  Check,
  ChevronDown,
  Maximize2,
  Navigation2,
  Pause,
  Play,
  RotateCcw,
  Signal,
  Wifi,
} from 'lucide-react';
import { StatusBar } from './StatusBar';

interface G1PatrolPageProps {
  onBack: () => void;
}

type PatrolScope = 'all' | 'a' | 'b' | 'c';

const PATROL_SCOPES: { id: PatrolScope; name: string; desc: string }[] = [
  { id: 'all', name: '全图边界', desc: 'Patrol all area borders' },
  { id: 'a', name: 'Area A', desc: 'Front lawn border' },
  { id: 'b', name: 'Area B', desc: 'Back lawn border' },
  { id: 'c', name: 'Area C', desc: 'Side garden border' },
];

export const G1PatrolPage = ({ onBack }: G1PatrolPageProps) => {
  const [scope, setScope] = useState<PatrolScope>('a');
  const [live, setLive] = useState(true);
  const [patrolling, setPatrolling] = useState(true);
  const [elapsed, setElapsed] = useState(0); // 巡航已用时（秒）
  const [scopeOpen, setScopeOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const scopeMeta = PATROL_SCOPES.find((s) => s.id === scope) ?? PATROL_SCOPES[0];

  // 实时计时
  useEffect(() => {
    if (!patrolling) return;
    timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [patrolling]);

  // 模拟实时画面刷新（每帧推进巡航进度）
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!patrolling) return;
    const raf = window.setInterval(() => setTick((t) => (t + 1) % 1000), 120);
    return () => window.clearInterval(raf);
  }, [patrolling]);

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  return (
    <div className="relative flex h-[812px] w-[375px] flex-col bg-[#0B0F0A]">
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={onBack} className="p-1" aria-label="返回">
          <ArrowLeft size={24} strokeWidth={2} className="text-white" />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-white">巡航</span>
        <button onClick={() => setLive((v) => !v)} className="ml-1.5 p-1" aria-label="摄像头">
          {live ? <Camera size={22} strokeWidth={2} className="text-white" /> : <CameraOff size={22} strokeWidth={2} className="text-white/60" />}
        </button>
      </div>

      {/* 实时画面 */}
      <div className="relative mx-4 flex-1 overflow-hidden rounded-[24px] bg-black shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        {live ? <LiveFeed scope={scope} patrolling={patrolling} tick={tick} /> : <CameraOffPlaceholder />}

        {/* HUD：左上 LIVE */}
        <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur">
          <span className={`h-2 w-2 rounded-full bg-[#EF4444] ${patrolling ? 'animate-pulse' : 'opacity-40'}`} />
          <span className="text-[11px] font-bold tracking-wide text-white">{patrolling ? 'LIVE' : 'PAUSED'}</span>
        </div>

        {/* HUD：右上 信号/电量/时间 */}
        <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur">
          <Wifi size={13} strokeWidth={2.4} className="text-white" />
          <Signal size={13} strokeWidth={2.4} className="text-white" />
          <Battery size={14} strokeWidth={2.2} className="text-white" />
          <span className="text-[11px] font-semibold text-white">{mmss}</span>
        </div>

        {/* HUD：底部 巡航区域 */}
        <button
          onClick={() => setScopeOpen((v) => !v)}
          className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur active:opacity-90"
        >
          <Navigation2 size={13} strokeWidth={2.4} className="text-[#7DD3FC]" />
          <span className="text-[12px] font-semibold text-white">{scopeMeta.name}</span>
          <ChevronDown size={14} strokeWidth={2.4} className="text-white/70" />
        </button>

        {/* 全屏按钮 */}
        <button className="absolute bottom-3 right-3 z-20 grid h-8 w-8 place-items-center rounded-full bg-black/55 backdrop-blur active:opacity-90">
          <Maximize2 size={14} strokeWidth={2.4} className="text-white" />
        </button>

        {/* 扫描线动画（巡航中） */}
        {live && patrolling && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[#7DD3FC]/15 to-transparent" style={{ animation: 'patrol-scan 3.5s linear infinite' }} />
        )}

        {/* 首次隐私提示 */}
        <div className="absolute left-3 right-3 top-12 z-20 rounded-[12px] bg-black/45 px-3 py-2 backdrop-blur">
          <p className="text-[11px] leading-4 text-white/85">巡航模式仅用于查看庭院，刀盘保持关闭，摄像头实时画面需 Wi-Fi 或 4G 支持。</p>
        </div>
      </div>

      {/* 控制栏 */}
      <div className="px-5 pb-6 pt-4">
        <div className="relative mb-3">
          <button
            onClick={() => setScopeOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-[14px] px-4 py-3 text-left active:opacity-90"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)' }}
          >
            <div className="flex items-center gap-3">
              <Navigation2 size={18} strokeWidth={2.2} className="text-[#7DD3FC]" />
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-white/50">巡航区域</div>
                <div className="text-[15px] font-semibold text-white">{scopeMeta.name}</div>
              </div>
            </div>
            <ChevronDown size={18} strokeWidth={2.4} className={`text-white/70 transition-transform ${scopeOpen ? 'rotate-180' : ''}`} />
          </button>
          {scopeOpen && (
            <div className="absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-[14px] bg-[#1B2117] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              {PATROL_SCOPES.map((s) => {
                const active = s.id === scope;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setScope(s.id);
                      setScopeOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left active:opacity-90"
                    style={{ background: active ? 'rgba(0,167,225,0.14)' : 'transparent' }}
                  >
                    <Navigation2 size={16} strokeWidth={2.2} className="shrink-0 text-[#7DD3FC]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-white">{s.name}</div>
                      <div className="truncate text-[12px] text-white/55">{s.desc}</div>
                    </div>
                    {active && <Check size={16} strokeWidth={2.6} className="shrink-0 text-[#00A7E1]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPatrolling((p) => !p)}
            className="flex flex-1 items-center justify-center gap-2 rounded-[16px] py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(0,194,255,0.22)] active:opacity-90"
            style={{ background: patrolling ? '#6B7280' : '#00A7E1' }}
          >
            {patrolling ? <Pause size={18} strokeWidth={2} /> : <Play size={18} strokeWidth={2} />}
            {patrolling ? '暂停巡航' : '继续巡航'}
          </button>
          <button
            onClick={onBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-white py-3 text-[14px] font-semibold text-[#111827] shadow-[0_8px_20px_rgba(15,23,42,0.18)] active:opacity-90"
          >
            <RotateCcw size={18} strokeWidth={2} />
            结束回充
          </button>
        </div>
      </div>

      <style>{`@keyframes patrol-scan { 0% { transform: translateY(0); } 100% { transform: translateY(660px); } }`}</style>
    </div>
  );
};

// 实时画面：模拟摄像头俯视画面，机器沿区域边界巡航
function LiveFeed({ scope, patrolling, tick }: { scope: PatrolScope; patrolling: boolean; tick: number }) {
  // 巡航进度按 tick 推进
  const progress = patrolling ? (tick % 100) / 100 : 0.4;
  const lawn = { x: 24, y: 24, w: 252, h: 360, r: 18 };

  // 机器沿外周边界位置
  const machine = pointOnPerimeter(progress, lawn, 22);

  return (
    <svg width="100%" height="100%" viewBox="0 0 300 410" fill="none" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
      <defs>
        <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
        </radialGradient>
        <clipPath id="feedClip">
          <rect x={lawn.x} y={lawn.y} width={lawn.w} height={lawn.h} rx={lawn.r} />
        </clipPath>
      </defs>

      <rect width="300" height="410" fill="#0E1A0E" />

      {/* 草坪俯视 */}
      <g clipPath="url(#feedClip)">
        <rect x={lawn.x} y={lawn.y} width={lawn.w} height={lawn.h} fill="#1F3D24" />
        {/* 草纹理 */}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1={lawn.x} y1={lawn.y + i * 24} x2={lawn.x + lawn.w} y2={lawn.y + i * 24} stroke="#27492C" strokeWidth="1" />
        ))}
        {/* 巡航边界轨迹 */}
        <rect x={lawn.x + 22} y={lawn.y + 22} width={lawn.w - 44} height={lawn.h - 44} rx={10} fill="none" stroke="#3F7A47" strokeWidth="2" strokeDasharray="5 6" />
        {/* 已完成轨迹 */}
        <rect x={lawn.x + 22} y={lawn.y + 22} width={lawn.w - 44} height={lawn.h - 44} rx={10} fill="none" stroke="#7DD3FC" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${2 * (lawn.w + lawn.h - 88) * progress} ${2 * (lawn.w + lawn.h - 88)}`} />
      </g>

      {/* 草坪边框 */}
      <rect x={lawn.x} y={lawn.y} width={lawn.w} height={lawn.h} rx={lawn.r} fill="none" stroke="#0A120A" strokeWidth="3" />

      {/* 机器标记 */}
      <g>
        <circle cx={machine.x} cy={machine.y} r="16" fill="#00A7E1" opacity="0.18" className="animate-ping" />
        <circle cx={machine.x} cy={machine.y} r="11" fill="#00A7E1" opacity="0.30" />
        <circle cx={machine.x} cy={machine.y} r="8" fill="#00A7E1" stroke="white" strokeWidth="2.5" />
        <path d={`M${machine.x} ${machine.y - 3} l3 5 l-6 0 z`} fill="white" />
      </g>

      {/* 暗角 */}
      <rect width="300" height="410" fill="url(#vignette)" />

      {/* 范围标签 */}
      <text x={lawn.x + 10} y={lawn.y + 18} fill="#7DD3FC" fontSize="11" fontWeight="800">{scope === 'all' ? '全图边界' : `Area ${scope.toUpperCase()}`}</text>
    </svg>
  );
}

function CameraOffPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40">
      <CameraOff size={36} strokeWidth={1.8} />
      <span className="text-[13px] font-medium">摄像头已关闭</span>
    </div>
  );
}

// 沿矩形外周按进度比例取机器位置，顺时针从左上角出发
function pointOnPerimeter(
  p: number,
  lawn: { x: number; y: number; w: number; h: number },
  inset: number,
): { x: number; y: number } {
  const x = lawn.x + inset;
  const y = lawn.y + inset;
  const w = lawn.w - 2 * inset;
  const h = lawn.h - 2 * inset;
  const perim = 2 * (w + h);
  let d = p * perim;
  if (d < w) return { x: x + d, y };
  d -= w;
  if (d < h) return { x: x + w, y: y + d };
  d -= h;
  if (d < w) return { x: x + w - d, y: y + h };
  d -= w;
  return { x, y: y + h - d };
}
