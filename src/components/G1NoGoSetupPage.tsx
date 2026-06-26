import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Gamepad2,
  Hand,
  MapPin,
  Undo2,
  X,
} from 'lucide-react';
import { StatusBar } from './StatusBar';
import { LandscapeShell, RemotePad } from './RemoteMappingShared';

interface G1NoGoSetupPageProps {
  onBack: () => void;
  onLandscapeChange: (landscape: boolean) => void;
}

type Stage = 'method' | 'remote-start' | 'tracing' | 'naming' | 'done';
type Method = 'manual' | 'remote';

const NAME_PRESETS = ['花坛', '泳池', '儿童区', '宠物区', '树池', '菜地'];

const ACCENT = '#EF4444';
// 横屏画布 viewBox：520 x 270
const DOCK = { x: 84, y: 58 };
const STEP = 16;

export const G1NoGoSetupPage = ({ onBack, onLandscapeChange }: G1NoGoSetupPageProps) => {
  const [stage, setStage] = useState<Stage>('method');
  const [method, setMethod] = useState<Method>('manual');
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  // 遥控起点阶段：机器当前位置（从充电桩出发）
  const [machinePos, setMachinePos] = useState<{ x: number; y: number }>({ x: 150, y: 110 });
  const [closed, setClosed] = useState(false);
  const [name, setName] = useState('');

  const isLandscape = stage === 'remote-start' || (stage === 'tracing' && method === 'remote');

  useEffect(() => {
    onLandscapeChange(isLandscape);
  }, [isLandscape, onLandscapeChange]);

  useEffect(() => () => { onLandscapeChange(false); }, [onLandscapeChange]);

  const reset = () => {
    setPoints([]);
    setStart(null);
    setClosed(false);
    setName('');
  };

  const startTracing = (m: Method) => {
    setMethod(m);
    reset();
    if (m === 'remote') {
      setMachinePos({ x: 150, y: 110 });
      setStage('remote-start');
    } else {
      setStage('tracing');
    }
  };

  const nudge = (dx: number, dy: number) => {
    setMachinePos((p) => ({
      x: Math.max(40, Math.min(486, p.x + dx)),
      y: Math.max(40, Math.min(238, p.y + dy)),
    }));
  };

  const confirmStart = () => {
    const s = { ...machinePos };
    setStart(s);
    setPoints([s]);
    setClosed(false);
    setStage('tracing');
  };

  // 遥控建图：用摇杆遥控机器沿边界前进，回到起点触发闭合
  const advanceTrace = () => {
    if (!start || closed) return;
    const path = remotePath(start);
    const idx = Math.min(points.length, path.length);
    if (idx >= path.length) {
      setClosed(true);
      return;
    }
    const next = Math.min(idx + 3, path.length);
    setPoints(path.slice(0, next));
    if (next >= path.length) setClosed(true);
  };

  // 手动模式闭合检测
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (method !== 'manual' || closed) return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    const p = { x: loc.x, y: loc.y };
    if (points.length >= 3) {
      const dx = p.x - points[0].x;
      const dy = p.y - points[0].y;
      if (Math.hypot(dx, dy) < 22) {
        setClosed(true);
        return;
      }
    }
    setPoints((prev) => [...prev, p]);
  };

  const commitName = () => setStage('done');

  const headerBack = () => {
    if (stage === 'method') onBack();
    else if (stage === 'remote-start') setStage('method');
    else if (stage === 'tracing') {
      if (method === 'remote') {
        setPoints([]);
        setStart(null);
        setMachinePos({ x: 150, y: 110 });
        setStage('remote-start');
      } else {
        reset();
        setStage('method');
      }
    } else if (stage === 'naming') {
      if (method === 'remote' && start) {
        setPoints([start]);
        setClosed(false);
        setStage('tracing');
      } else {
        reset();
        setStage('tracing');
      }
    } else {
      onBack();
    }
  };

  // ===== 横屏：遥控起点 / 遥控建图 =====
  if (stage === 'remote-start' || (stage === 'tracing' && method === 'remote')) {
    const isStartStage = stage === 'remote-start';
    const progress = start ? Math.min(100, Math.round(((points.length - 1) / Math.max(1, remotePath(start).length - 1)) * 100)) : 0;
    return (
      <LandscapeShell
        title={isStartStage ? '禁区设置 · 确定起点' : '禁区设置 · 遥控建图'}
        onBack={headerBack}
      >
        <NogoCanvas
          stage={stage}
          machinePos={machinePos}
          start={start}
          points={points}
          closed={closed}
          progress={progress}
        />

        {isStartStage ? (
          <RemotePad
            note="遥控 G1Pro 行驶到禁区起点位置，然后确认为该禁区起点。"
            buttonText="确定该位置为起点"
            onConfirm={confirmStart}
            onMove={(dir) => {
              if (dir === 'up') nudge(0, -STEP);
              if (dir === 'down') nudge(0, STEP);
              if (dir === 'left') nudge(-STEP, 0);
              if (dir === 'right') nudge(STEP, 0);
            }}
          />
        ) : (
          <RemotePad
            note="遥控 G1Pro 沿禁区边界行走，回到起点将自动检测闭合点。"
            buttonText="闭合轮廓"
            onConfirm={() => setClosed(true)}
            onMove={advanceTrace}
          />
        )}

        {/* 闭合确认弹窗 */}
        {closed && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
            <div className="w-[320px] rounded-[22px] bg-white p-5 text-center shadow-xl">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#FEE2E2]">
                <MapPin size={30} strokeWidth={2.2} className="text-[#EF4444]" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#111827]">检测到闭合点</h3>
              <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
                机器已绕禁区边界回到起点，检测到轮廓接近闭合。是否闭合当前禁区轮廓？
              </p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => { setClosed(false); setPoints((p) => p.slice(0, Math.max(1, p.length - 4))); }} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#6B7280]">
                  继续行走
                </button>
                <button onClick={() => { setStage('naming'); }} className="flex-[1.15] rounded-[12px] py-2.5 text-[14px] font-semibold text-white" style={{ background: '#00C2FF' }}>
                  确认闭合
                </button>
              </div>
            </div>
          </div>
        )}
      </LandscapeShell>
    );
  }

  // ===== 竖屏：选方式 / 手动描点 / 命名 / 完成 =====
  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#F5F6F8' }}>
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={headerBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-[#000000]">禁区设置</span>
      </div>

      {stage === 'method' && <MethodStage onPick={startTracing} />}

      {stage === 'tracing' && method === 'manual' && (
        <ManualTracingStage
          points={points}
          closed={closed}
          onMapClick={handleMapClick}
          onUndo={() => setPoints((p) => p.slice(0, -1))}
          onClear={reset}
          onProceed={() => setStage('naming')}
        />
      )}

      {stage === 'naming' && (
        <NamingStage
          name={name}
          setName={setName}
          points={method === 'manual' ? points : start ? remotePath(start) : []}
          onConfirm={commitName}
          onBackTracing={() => {
            if (method === 'remote' && start) {
              setPoints([start]);
              setClosed(false);
              setStage('tracing');
            } else {
              reset();
              setStage('tracing');
            }
          }}
        />
      )}

      {stage === 'done' && <DoneStage name={name || '禁区'} onBack={onBack} />}
    </div>
  );
};

function MethodStage({ onPick }: { onPick: (m: Method) => void }) {
  return (
    <div className="flex-1 px-5 pt-2">
      <div className="rounded-[16px] p-4" style={{ background: '#FFF7ED' }}>
        <p className="text-[12px] leading-5 text-[#9A3412]">
          禁区用于避免机器进入花坛、泳池、台阶、儿童设施等区域。可选择在地图上手动标记，或遥控机器沿边界行走建立。
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => onPick('manual')}
          className="flex flex-col items-center rounded-[20px] p-5 active:opacity-90"
          style={{ background: '#FFFFFF', boxShadow: '0px 4px 14px rgba(0,0,0,0.06)' }}
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#FEE2E2]">
            <Hand size={26} strokeWidth={2} className="text-[#EF4444]" />
          </div>
          <div className="mt-3 text-[15px] font-semibold text-[#000000]">手动地图标记</div>
          <div className="mt-1 text-center text-[11px] leading-4 text-[#999999]">在地图上点击描点圈出禁区</div>
        </button>

        <button
          onClick={() => onPick('remote')}
          className="flex flex-col items-center rounded-[20px] p-5 active:opacity-90"
          style={{ background: '#FFFFFF', boxShadow: '0px 4px 14px rgba(0,0,0,0.06)' }}
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#E3F2FD]">
            <Gamepad2 size={26} strokeWidth={2} className="text-[#2196F3]" />
          </div>
          <div className="mt-3 text-[15px] font-semibold text-[#000000]">遥控机器建立</div>
          <div className="mt-1 text-center text-[11px] leading-4 text-[#999999]">遥控到起点后沿边界行走</div>
        </button>
      </div>

      <div className="mt-5 rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="mb-2 text-[13px] font-semibold text-[#000000]">建立须知</div>
        <ul className="space-y-1.5 text-[12px] leading-4 text-[#666666]">
          <li>· 禁区必须位于有效割草地图范围内</li>
          <li>· 遥控方式需先将机器行驶到禁区起点并确认</li>
          <li>· 机器回到起点时将检测闭合点，闭合后可命名</li>
          <li>· 禁区不得完全阻断回桩路径</li>
        </ul>
      </div>
    </div>
  );
}

function NogoCanvas({
  stage,
  machinePos,
  start,
  points,
  closed,
  progress,
}: {
  stage: Stage;
  machinePos: { x: number; y: number };
  start: { x: number; y: number } | null;
  points: { x: number; y: number }[];
  closed: boolean;
  progress: number;
}) {
  const isStartStage = stage === 'remote-start';
  return (
    <div className="relative mx-4 my-2 flex-1 overflow-hidden rounded-[18px] bg-[#E8F5E9]">
      <svg width="100%" height="100%" viewBox="0 0 520 270" preserveAspectRatio="xMidYMid meet" fill="none">
        <rect x="24" y="22" width="472" height="226" rx="14" fill="#F7FFF5" stroke="#7EC87F" strokeWidth="2" strokeDasharray="8 5" />
        {/* 已有割草区域 B */}
        <rect x="330" y="150" width="140" height="78" rx="6" fill="rgba(76,175,80,0.12)" stroke="#4CAF50" strokeWidth="1.5" />
        <text x="400" y="193" textAnchor="middle" fill="#388E3C" fontSize="10" fontWeight="600">割草区域 B</text>
        {/* 充电桩 */}
        <rect x={DOCK.x - 30} y={DOCK.y - 16} width="60" height="32" rx="5" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
        <text x={DOCK.x} y={DOCK.y + 4} textAnchor="middle" fill="#E65100" fontSize="10" fontWeight="700">充电桩</text>

        {isStartStage && (
          <>
            <path d={`M${DOCK.x} ${DOCK.y} C ${DOCK.x + 30} ${DOCK.y + 20}, ${machinePos.x - 40} ${machinePos.y - 20}, ${machinePos.x} ${machinePos.y}`} stroke="#2196F3" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
            <circle cx={machinePos.x} cy={machinePos.y} r="14" fill="#2196F3" opacity="0.18" className="animate-ping" />
            <circle cx={machinePos.x} cy={machinePos.y} r="10" fill="#111827" stroke="white" strokeWidth="4" />
          </>
        )}

        {!isStartStage && start && (
          <>
            {points.length > 1 && (
              <polyline
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={ACCENT}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={progress >= 100 ? 'none' : '8 5'}
              />
            )}
            {closed && points.length > 2 && (
              <polygon points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(239,68,68,0.18)" stroke="none" />
            )}
            {/* 起点 */}
            <circle cx={start.x} cy={start.y} r="11" fill={ACCENT} stroke="white" strokeWidth="4" />
            <circle cx={start.x} cy={start.y} r="22" fill="none" stroke={ACCENT} strokeWidth="2" strokeDasharray="5 5" />
            <text x={start.x} y={start.y - 28} textAnchor="middle" fill="#B91C1C" fontSize="11" fontWeight="700">起点</text>
            {/* 机器当前位置 */}
            {points.length > 0 && !closed && (() => { const last = points[points.length - 1]; return (
              <>
                <circle cx={last.x} cy={last.y} r="14" fill="#2196F3" opacity="0.18" className="animate-ping" />
                <circle cx={last.x} cy={last.y} r="10" fill="#111827" stroke="white" strokeWidth="4" />
              </>
            ); })()}
          </>
        )}
      </svg>
    </div>
  );
}

function ManualTracingStage({
  points,
  closed,
  onMapClick,
  onUndo,
  onClear,
  onProceed,
}: {
  points: { x: number; y: number }[];
  closed: boolean;
  onMapClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  onUndo: () => void;
  onClear: () => void;
  onProceed: () => void;
}) {
  return (
    <>
      <div className="px-5">
        <div className="rounded-[12px] px-3 py-2" style={{ background: '#E3F2FD' }}>
          <p className="text-[12px] leading-4 text-[#000000]">
            {closed ? '已检测到闭合点，可为禁区命名' : '点击地图描点，靠近起点可自动闭合'}
          </p>
        </div>
      </div>

      <div className="relative mx-5 mt-3 flex-1 overflow-hidden rounded-[20px]" style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 335 360"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          onClick={!closed ? onMapClick : undefined}
          style={{ cursor: !closed ? 'crosshair' : 'default' }}
        >
          <rect x="20" y="20" width="295" height="320" rx="10" stroke="#4CAF50" strokeWidth="2" strokeDasharray="6 3" fill="rgba(76,175,80,0.06)" />
          <rect x="180" y="210" width="120" height="80" rx="4" fill="rgba(76,175,80,0.12)" stroke="#4CAF50" strokeWidth="1.5" />
          <text x="240" y="254" textAnchor="middle" fill="#388E3C" fontSize="10" fontWeight="600">割草区域 B</text>

          {points.length > 0 && (
            <>
              <polygon
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill={closed ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.08)'}
                stroke="#EF4444"
                strokeWidth={closed ? 3 : 2.5}
                strokeDasharray={closed ? 'none' : '6 4'}
              />
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" fill={i === 0 ? '#EF4444' : '#FFFFFF'} stroke="#EF4444" strokeWidth="2.5" />
                  {i === 0 && (
                    <>
                      <circle cx={p.x} cy={p.y} r="11" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                      <text x={p.x} y={p.y - 16} textAnchor="middle" fill="#B91C1C" fontSize="9" fontWeight="700">起点</text>
                    </>
                  )}
                </g>
              ))}
            </>
          )}

          {points.length === 0 && (
            <text x="167" y="180" textAnchor="middle" fill="#9CA3AF" fontSize="12" fontWeight="600">点击地图开始描点</text>
          )}
        </svg>

        <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {points.length} 点
        </div>
      </div>

      <div className="px-5 pb-6 pt-3">
        {!closed ? (
          <div className="flex gap-2">
            <button onClick={onUndo} disabled={points.length === 0} className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-white py-3 text-[14px] font-semibold text-[#374151] shadow-sm disabled:opacity-45 active:opacity-90">
              <Undo2 size={16} strokeWidth={2.4} /> 撤销
            </button>
            <button onClick={onClear} disabled={points.length === 0} className="flex flex-1 items-center justify-center gap-1.5 rounded-[14px] bg-white py-3 text-[14px] font-semibold text-[#EF4444] shadow-sm disabled:opacity-45 active:opacity-90">
              <X size={16} strokeWidth={2.4} /> 清除
            </button>
          </div>
        ) : (
          <button onClick={onProceed} className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#EF4444] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(239,68,68,0.22)] active:opacity-90">
            <Check size={18} strokeWidth={2.4} /> 检测到闭合，命名禁区
          </button>
        )}
      </div>
    </>
  );
}

function NamingStage({
  name,
  setName,
  points,
  onConfirm,
  onBackTracing,
}: {
  name: string;
  setName: (v: string) => void;
  points: { x: number; y: number }[];
  onConfirm: () => void;
  onBackTracing: () => void;
}) {
  return (
    <>
      <div className="relative mx-5 mt-3 overflow-hidden rounded-[20px]" style={{ height: '220px', background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>
        <svg width="100%" height="100%" viewBox="0 0 520 270" preserveAspectRatio="xMidYMid meet" fill="none">
          <rect x="24" y="22" width="472" height="226" rx="14" fill="none" stroke="#7EC87F" strokeWidth="1.5" strokeDasharray="8 5" />
          {points.length > 2 && (
            <polygon points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(239,68,68,0.18)" stroke="#EF4444" strokeWidth="3" />
          )}
        </svg>
      </div>

      <div className="mx-5 mt-4 rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="mb-2 flex items-center gap-2">
          <MapPin size={18} strokeWidth={2.4} className="text-[#EF4444]" />
          <span className="text-[14px] font-semibold text-[#000000]">禁区名称</span>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入禁区名称，如：花坛"
          className="w-full rounded-[12px] px-4 py-3 text-[14px] text-[#000000]"
          style={{ background: '#F5F6F8', border: '1.5px solid #E5E7EB', outline: 'none' }}
          autoFocus
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {NAME_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setName(p)}
              className="rounded-full px-3 py-1.5 text-[12px] font-medium active:opacity-90"
              style={{ background: name === p ? '#FEE2E2' : '#F5F6F8', color: name === p ? '#EF4444' : '#666666', border: name === p ? '1px solid #FCA5A5' : '1px solid transparent' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      <div className="px-5 pb-6 pt-3 flex gap-3">
        <button onClick={onBackTracing} className="flex-1 rounded-[16px] bg-white py-3.5 text-[14px] font-semibold text-[#374151] shadow-sm active:opacity-90">
          重新建图
        </button>
        <button onClick={onConfirm} disabled={!name.trim()} className="flex-[1.4] rounded-[16px] py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(239,68,68,0.22)] active:opacity-90 disabled:opacity-50" style={{ background: '#EF4444' }}>
          保存禁区
        </button>
      </div>
    </>
  );
}

function DoneStage({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-[#FEE2E2]">
        <Check size={40} strokeWidth={2.6} className="text-[#EF4444]" />
      </div>
      <h2 className="mt-4 text-[20px] font-semibold text-[#000000]">禁区已保存</h2>
      <p className="mt-2 text-[13px] leading-5 text-[#999999]">
        禁区「{name}」已加入地图，机器将避开该区域。修改后已重新校验回桩路径。
      </p>
      <button onClick={onBack} className="mt-6 w-full max-w-[260px] rounded-full bg-[#EF4444] py-3.5 text-[15px] font-semibold text-white active:opacity-90">
        返回地图管理
      </button>
    </div>
  );
}

// 遥控模式：机器沿矩形边界行走的预设路径（基于起点，回到起点）
function remotePath(start: { x: number; y: number }) {
  const w = 120;
  const h = 90;
  const steps = 26;
  const corners = [
    { x: start.x, y: start.y },
    { x: start.x + w, y: start.y },
    { x: start.x + w, y: start.y + h },
    { x: start.x, y: start.y + h },
    { x: start.x, y: start.y },
  ];
  const path: { x: number; y: number }[] = [corners[0]];
  for (let i = 0; i < corners.length - 1; i++) {
    const a = corners[i];
    const b = corners[i + 1];
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      path.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return path;
}
