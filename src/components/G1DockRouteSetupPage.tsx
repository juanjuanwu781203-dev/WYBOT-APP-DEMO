import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { StatusBar } from './StatusBar';
import { LandscapeShell, RemotePad } from './RemoteMappingShared';

interface G1DockRouteSetupPageProps {
  onBack: () => void;
  onLandscapeChange: (landscape: boolean) => void;
}

type Stage = 'list' | 'start' | 'driving';

interface Area {
  id: string;
  name: string;
  sizeM2: number;
  x: number;
  y: number;
  w: number;
  h: number;
  route: { x: number; y: number }[] | null;
}

// 横屏画布 viewBox：520 x 270
const DOCK = { x: 470, y: 210 };
const STEP = 16;
const INITIAL_AREAS: Area[] = [
  { id: 'a', name: '割草区域 A', sizeM2: 320, x: 60, y: 50, w: 130, h: 95, route: null },
  { id: 'b', name: '割草区域 B', sizeM2: 280, x: 230, y: 135, w: 120, h: 80, route: null },
];

const inArea = (p: { x: number; y: number }, a: { x: number; y: number; w: number; h: number }) =>
  p.x >= a.x && p.x <= a.x + a.w && p.y >= a.y && p.y <= a.y + a.h;

const nearDock = (p: { x: number; y: number }) => Math.hypot(p.x - DOCK.x, p.y - DOCK.y) < 26;

export const G1DockRouteSetupPage = ({ onBack, onLandscapeChange }: G1DockRouteSetupPageProps) => {
  const [areas, setAreas] = useState<Area[]>(INITIAL_AREAS);
  const [selId, setSelId] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('list');
  const [machinePos, setMachinePos] = useState({ x: DOCK.x - 40, y: DOCK.y });
  const [startPt, setStartPt] = useState<{ x: number; y: number } | null>(null);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [toast, setToast] = useState('');

  const isLandscape = stage !== 'list';

  useEffect(() => {
    onLandscapeChange(isLandscape);
  }, [isLandscape, onLandscapeChange]);

  useEffect(() => () => { onLandscapeChange(false); }, [onLandscapeChange]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const selArea = areas.find((a) => a.id === selId) ?? null;

  const clamp = (p: { x: number; y: number }) => ({
    x: Math.max(30, Math.min(494, p.x)),
    y: Math.max(30, Math.min(240, p.y)),
  });

  const nudge = (dx: number, dy: number) => {
    setMachinePos((p) => clamp({ x: p.x + dx, y: p.y + dy }));
  };

  const driveStep = (dx: number, dy: number) => {
    setMachinePos((p) => {
      const next = clamp({ x: p.x + dx, y: p.y + dy });
      setTrail((t) => (t.length === 0 || (t[t.length - 1].x !== next.x || t[t.length - 1].y !== next.y) ? [...t, next] : t));
      return next;
    });
  };

  const pickArea = (a: Area) => {
    setSelId(a.id);
    setStartPt(null);
    setTrail([]);
    setMachinePos({ x: DOCK.x - 40, y: DOCK.y });
    setStage('start');
  };

  const confirmStart = () => {
    if (!selArea) return;
    if (!inArea(machinePos, selArea)) { setToast('请先将机器遥控到当前割草区域内再确定起点'); return; }
    setStartPt({ ...machinePos });
    setTrail([{ ...machinePos }]);
    setStage('driving');
  };

  const confirmRoute = () => {
    if (!selArea) return;
    setAreas((prev) => prev.map((a) => (a.id === selArea.id ? { ...a, route: trail } : a)));
    setStage('list');
  };

  const headerBack = () => {
    if (stage === 'list') { onLandscapeChange(false); onBack(); }
    else { setStage('list'); setStartPt(null); setTrail([]); }
  };

  const allSet = areas.every((a) => a.route);

  // ===== 横屏：确认起点 / 遥控回桩 =====
  if (stage !== 'list' && selArea) {
    const isStart = stage === 'start';
    const atDock = nearDock(machinePos);
    return (
      <LandscapeShell
        title={isStart ? `回桩路径 · ${selArea.name} · 确定起点` : `回桩路径 · ${selArea.name} · 遥控回桩`}
        onBack={headerBack}
      >
        <DockCanvas
          areas={areas}
          selId={selArea.id}
          machinePos={machinePos}
          startPt={startPt}
          trail={trail}
          atDock={atDock}
          inSelArea={inArea(machinePos, selArea)}
        />

        <RemotePad
          note={
            isStart
              ? `遥控 G1Pro 到「${selArea.name}」内，确认为该区域的回桩起点。`
              : '遥控 G1Pro 从起点驶回充电桩，机器将记录回桩路径。靠近充电桩将自动检测。'
          }
          buttonText={isStart ? '确定起点' : atDock ? '确认回桩路径' : '驶回充电桩中…'}
          onConfirm={isStart ? confirmStart : confirmRoute}
          onMove={(dir) => {
            if (isStart) {
              if (dir === 'up') nudge(0, -STEP);
              if (dir === 'down') nudge(0, STEP);
              if (dir === 'left') nudge(-STEP, 0);
              if (dir === 'right') nudge(STEP, 0);
            } else {
              if (dir === 'up') driveStep(0, -STEP);
              if (dir === 'down') driveStep(0, STEP);
              if (dir === 'left') driveStep(-STEP, 0);
              if (dir === 'right') driveStep(STEP, 0);
            }
          }}
        />

        {/* toast */}
        {toast && (
          <div className="absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-[12px] bg-[#111827] px-4 py-2 text-[12px] font-medium text-white shadow-lg">
            {toast}
          </div>
        )}
      </LandscapeShell>
    );
  }

  // ===== 竖屏：区域列表 =====
  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#F5F6F8' }}>
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={headerBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-[#000000]">回桩路径</span>
      </div>

      <div className="mx-5 rounded-[14px] px-3 py-2" style={{ background: '#FFF3E0' }}>
        <p className="text-[12px] leading-5 text-[#9A3412]">
          地图含多个割草区域时，需为每个区域单独设置回桩路径。每条路径先确认起点，再遥控机器驶回充电桩。
        </p>
      </div>

      <div className="flex-1 px-5 pt-3 overflow-auto pb-6">
        {areas.map((a) => {
          const set = !!a.route;
          return (
            <button
              key={a.id}
              onClick={() => pickArea(a)}
              className="flex w-full items-center gap-3 rounded-[14px] px-4 py-3.5 mb-2 text-left active:opacity-90"
              style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}
            >
              <div className="grid h-9 w-9 place-items-center rounded-full" style={{ background: set ? '#FFF3E0' : '#F3F4F6' }}>
                <Zap size={16} strokeWidth={2.2} style={{ color: set ? '#FF9800' : '#9CA3AF' }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium text-[#000000]">{a.name}</div>
                <div className="text-[11px]" style={{ color: set ? '#16A34A' : '#999999' }}>
                  {set ? `回桩路径已设置 · ${a.route!.length} 节点` : '未设置回桩路径'}
                </div>
              </div>
              {set ? (
                <CheckCircle2 size={18} strokeWidth={2.2} className="text-[#16A34A]" />
              ) : (
                <ChevronRight size={18} strokeWidth={2} className="text-[#CCCCCC]" />
              )}
            </button>
          );
        })}

        <p className="mt-2 px-1 text-[11px] leading-4 text-[#999999]">
          {allSet ? '所有区域的回桩路径已设置完成。' : `已设置 ${areas.filter((a) => a.route).length} / ${areas.length} 个区域。点击区域开始或重新设置。`}
        </p>
      </div>

      <div className="px-5 pb-6">
        <button onClick={onBack} disabled={!allSet} className="w-full rounded-[16px] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(0,194,255,0.22)] active:opacity-90 disabled:opacity-45" style={{ background: '#00C2FF' }}>
          {allSet ? '完成并返回' : `还需设置 ${areas.filter((a) => !a.route).length} 个区域`}
        </button>
      </div>
    </div>
  );
};

function DockCanvas({
  areas,
  selId,
  machinePos,
  startPt,
  trail,
  atDock,
  inSelArea,
}: {
  areas: Area[];
  selId: string;
  machinePos: { x: number; y: number };
  startPt: { x: number; y: number } | null;
  trail: { x: number; y: number }[];
  atDock: boolean;
  inSelArea: boolean;
}) {
  return (
    <div className="relative mx-4 my-2 flex-1 overflow-hidden rounded-[18px] bg-[#F2F8F3]">
      <svg width="100%" height="100%" viewBox="0 0 520 270" preserveAspectRatio="xMidYMid meet" fill="none">
        <defs>
          <pattern id="dockGrid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="rgba(76,175,80,0.10)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="520" height="270" fill="url(#dockGrid)" />
        <rect x="24" y="22" width="472" height="226" rx="16" fill="rgba(76,175,80,0.05)" stroke="#4CAF50" strokeWidth="2.5" strokeDasharray="8 5" />

        {/* 各割草区域 */}
        {areas.map((a) => {
          const isSel = a.id === selId;
          return (
            <g key={a.id}>
              <rect
                x={a.x} y={a.y} width={a.w} height={a.h} rx="8"
                fill={isSel ? 'rgba(0,194,255,0.14)' : 'rgba(76,175,80,0.18)'}
                stroke={isSel ? '#00A7E1' : '#4CAF50'}
                strokeWidth={isSel ? 2.5 : 2}
              />
              <text x={a.x + a.w / 2} y={a.y + a.h / 2 + 3} textAnchor="middle" fill={isSel ? '#0C4A6E' : '#1B5E20'} fontSize="11" fontWeight="800">{a.name}</text>
              {/* 已设置的回桩路径（其它区域，淡色） */}
              {a.route && a.id !== selId && (
                <polyline points={a.route.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#FF9800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
              )}
            </g>
          );
        })}

        {/* 充电桩 */}
        <circle cx={DOCK.x} cy={DOCK.y} r="22" fill="none" stroke={atDock ? '#16A34A' : '#FF9800'} strokeWidth="2" strokeDasharray="5 5" opacity="0.7" />
        <rect x={DOCK.x - 16} y={DOCK.y - 10} width="32" height="20" rx="5" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
        <text x={DOCK.x} y={DOCK.y + 4} textAnchor="middle" fill="#E65100" fontSize="9" fontWeight="700">充电桩</text>

        {/* 当前回桩路径 */}
        {trail.length > 1 && (
          <>
            <polyline points={trail.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#FF9800" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
            <polyline points={trail.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#FF9800" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={atDock ? 'none' : '8 5'} />
          </>
        )}
        {/* 起点 */}
        {startPt && (
          <g>
            <circle cx={startPt.x} cy={startPt.y} r="11" fill="#00C2FF" stroke="white" strokeWidth="4" />
            <circle cx={startPt.x} cy={startPt.y} r="22" fill="none" stroke="#00C2FF" strokeWidth="2" strokeDasharray="5 5" />
            <text x={startPt.x} y={startPt.y - 28} textAnchor="middle" fill="#0284C7" fontSize="11" fontWeight="700">起点</text>
          </g>
        )}
        {/* 机器 */}
        <circle cx={machinePos.x} cy={machinePos.y} r="14" fill={atDock ? '#16A34A' : '#2196F3'} opacity="0.18" className="animate-ping" />
        <circle cx={machinePos.x} cy={machinePos.y} r="10" fill="#111827" stroke="white" strokeWidth="4" />
      </svg>

      <div className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold shadow-sm" style={{ color: inSelArea ? '#2E7D32' : '#9CA3AF' }}>
        {inSelArea ? '在当前割草区域' : '不在当前区域'}
      </div>
      {atDock && (
        <div className="absolute right-4 top-12 rounded-full bg-[#DCFCE7] px-3 py-1.5 text-[11px] font-semibold text-[#16A34A] shadow-sm">
          已到达充电桩
        </div>
      )}
    </div>
  );
}
