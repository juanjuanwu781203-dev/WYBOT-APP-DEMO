import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MapPin,
  Route,
  X,
} from 'lucide-react';
import { StatusBar } from './StatusBar';
import { LandscapeShell, RemotePad } from './RemoteMappingShared';

interface G1PassageSetupPageProps {
  onBack: () => void;
  onLandscapeChange: (landscape: boolean) => void;
}

type Stage = 'start' | 'driving' | 'review' | 'done';
type AreaId = 'A' | 'B' | null;

// 横屏画布 viewBox：520 x 270
const DOCK = { x: 60, y: 200 };
const STEP = 16;
// 两块割草区域
const AREAS: { id: 'A' | 'B'; x: number; y: number; w: number; h: number }[] = [
  { id: 'A', x: 70, y: 60, w: 130, h: 95 },
  { id: 'B', x: 320, y: 130, w: 130, h: 95 },
];

const inArea = (p: { x: number; y: number }) => {
  for (const a of AREAS) {
    if (p.x >= a.x && p.x <= a.x + a.w && p.y >= a.y && p.y <= a.y + a.h) return a.id;
  }
  return null;
};

export const G1PassageSetupPage = ({ onBack, onLandscapeChange }: G1PassageSetupPageProps) => {
  const [stage, setStage] = useState<Stage>('start');
  const [machinePos, setMachinePos] = useState({ x: DOCK.x + 40, y: DOCK.y - 30 });
  const [startPt, setStartPt] = useState<{ x: number; y: number } | null>(null);
  const [endPt, setEndPt] = useState<{ x: number; y: number } | null>(null);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [toast, setToast] = useState('');
  const [name, setName] = useState('');

  const isLandscape = stage === 'start' || stage === 'driving';

  useEffect(() => {
    onLandscapeChange(isLandscape);
  }, [isLandscape, onLandscapeChange]);

  useEffect(() => () => { onLandscapeChange(false); }, [onLandscapeChange]);

  // toast 自动消失
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const clamp = (p: { x: number; y: number }) => ({
    x: Math.max(30, Math.min(490, p.x)),
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

  const confirmStart = () => {
    const area = inArea(machinePos);
    if (!area) { setToast('请先将机器遥控到割草区域内再确定起点'); return; }
    setStartPt({ ...machinePos });
    setTrail([{ ...machinePos }]);
    setStage('driving');
  };

  const confirmEnd = () => {
    const area = inArea(machinePos);
    if (!area) { setToast('请先将机器遥控到割草区域内再确定终点'); return; }
    const startArea = startPt ? inArea(startPt) : null;
    if (startArea && area === startArea) { setToast('终点需位于另一个割草区域'); return; }
    setEndPt({ ...machinePos });
    setStage('review');
  };

  const headerBack = () => {
    if (stage === 'start') { onLandscapeChange(false); onBack(); }
    else if (stage === 'driving') { setStage('start'); setStartPt(null); setTrail([]); }
    else if (stage === 'review') { setEndPt(null); setTrail(startPt ? [startPt] : []); setStage('driving'); }
    else { onLandscapeChange(false); onBack(); }
  };

  const startArea: AreaId = startPt ? inArea(startPt) : null;
  const endArea: AreaId = endPt ? inArea(endPt) : null;
  const pass = !!startArea && !!endArea && startArea !== endArea;

  // ===== 横屏：确定起点 / 遥控至终点 =====
  if (stage === 'start' || stage === 'driving') {
    const isStart = stage === 'start';
    const curArea = inArea(machinePos);
    return (
      <LandscapeShell
        title={isStart ? '通道设置 · 确定起点' : '通道设置 · 遥控至终点'}
        onBack={headerBack}
      >
        <PassageCanvas
          stage={stage}
          machinePos={machinePos}
          startPt={startPt}
          endPt={endPt}
          trail={trail}
          curArea={curArea}
        />

        <RemotePad
          note={
            isStart
              ? '遥控 G1Pro 行驶到割草区域，确认为通道起点。机器将检测起点是否在割草区域内。'
              : '遥控 G1Pro 沿通道行驶到另一个割草区域，确认为终点。机器将检测起点与终点是否在割草区域内。'
          }
          buttonText={isStart ? '确定起点' : '确定终点'}
          onConfirm={isStart ? confirmStart : confirmEnd}
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

        {/* 实时区域检测徽标 */}
        <div className="pointer-events-none absolute right-4 top-12 z-10 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
          {curArea ? `在割草区域 ${curArea}` : '不在割草区域'}
        </div>

        {/* toast 提示 */}
        {toast && (
          <div className="absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-[12px] bg-[#111827] px-4 py-2 text-[12px] font-medium text-white shadow-lg">
            {toast}
          </div>
        )}
      </LandscapeShell>
    );
  }

  // ===== 竖屏：检测复核 / 完成 =====
  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#F5F6F8' }}>
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={headerBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-[#000000]">通道设置</span>
      </div>

      {stage === 'review' && (
        <ReviewStage
          startArea={startArea}
          endArea={endArea}
          pass={pass}
          name={name}
          setName={setName}
          startPt={startPt}
          endPt={endPt}
          trail={trail}
          onSave={() => setStage('done')}
        />
      )}

      {stage === 'done' && (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[#E3F2FD]">
            <Check size={40} strokeWidth={2.6} className="text-[#2196F3]" />
          </div>
          <h2 className="mt-4 text-[20px] font-semibold text-[#000000]">通道已保存</h2>
          <p className="mt-2 text-[13px] leading-5 text-[#999999]">
            通道「{name || '通道'}」已加入地图，机器可在两块割草区域间通行。已重新校验回桩路径。
          </p>
          <button onClick={onBack} className="mt-6 w-full max-w-[260px] rounded-full bg-[#00C2FF] py-3.5 text-[15px] font-semibold text-white active:opacity-90">
            返回地图管理
          </button>
        </div>
      )}
    </div>
  );
};

function PassageCanvas({
  stage,
  machinePos,
  startPt,
  endPt,
  trail,
  curArea,
}: {
  stage: Stage;
  machinePos: { x: number; y: number };
  startPt: { x: number; y: number } | null;
  endPt: { x: number; y: number } | null;
  trail: { x: number; y: number }[];
  curArea: AreaId;
}) {
  return (
    <div className="relative mx-4 my-2 flex-1 overflow-hidden rounded-[18px] bg-[#F2F8F3]">
      <svg width="100%" height="100%" viewBox="0 0 520 270" preserveAspectRatio="xMidYMid meet" fill="none">
        {/* 网格底图 */}
        <defs>
          <pattern id="passageGrid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="rgba(76,175,80,0.10)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="520" height="270" fill="url(#passageGrid)" />
        {/* 院子边界（草坪轮廓） */}
        <rect x="24" y="22" width="472" height="226" rx="16" fill="rgba(76,175,80,0.05)" stroke="#4CAF50" strokeWidth="2.5" strokeDasharray="8 5" />
        <text x="34" y="40" fill="#7CB342" fontSize="9" fontWeight="700">院子边界</text>

        {/* 两块割草区域 */}
        {AREAS.map((a) => (
          <g key={a.id}>
            <rect x={a.x} y={a.y} width={a.w} height={a.h} rx="8" fill="rgba(76,175,80,0.22)" stroke="#4CAF50" strokeWidth="2.5" />
            <rect x={a.x + 4} y={a.y + 4} width={a.w - 8} height={a.h - 8} rx="6" fill="none" stroke="rgba(76,175,80,0.35)" strokeWidth="1" />
            <text x={a.x + a.w / 2} y={a.y + a.h / 2 - 2} textAnchor="middle" fill="#1B5E20" fontSize="12" fontWeight="800">割草区域 {a.id}</text>
            <text x={a.x + a.w / 2} y={a.y + a.h / 2 + 13} textAnchor="middle" fill="#388E3C" fontSize="8" fontWeight="600">{a.id === 'A' ? '320 ㎡' : '280 ㎡'}</text>
          </g>
        ))}

        {/* 已有回桩路径示意 */}
        <path d={`M${DOCK.x} ${DOCK.y} C ${DOCK.x + 40} ${DOCK.y - 40}, 120 150, 130 100`} stroke="#FF9800" strokeWidth="2" strokeDasharray="5 4" fill="none" opacity="0.5" />
        {/* 充电桩 */}
        <rect x={DOCK.x - 24} y={DOCK.y - 14} width="48" height="28" rx="5" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
        <text x={DOCK.x} y={DOCK.y + 4} textAnchor="middle" fill="#E65100" fontSize="9" fontWeight="700">充电桩</text>

        {/* 通道轨迹 */}
        {trail.length > 1 && (
          <>
            <polyline
              points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#2196F3"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.18"
            />
            <polyline
              points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#2196F3"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={stage === 'driving' ? '8 5' : 'none'}
            />
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
        {/* 终点 */}
        {endPt && (
          <g>
            <circle cx={endPt.x} cy={endPt.y} r="11" fill="#2196F3" stroke="white" strokeWidth="4" />
            <circle cx={endPt.x} cy={endPt.y} r="22" fill="none" stroke="#2196F3" strokeWidth="2" strokeDasharray="5 5" />
            <text x={endPt.x} y={endPt.y - 28} textAnchor="middle" fill="#1565C0" fontSize="11" fontWeight="700">终点</text>
          </g>
        )}
        {/* 机器当前位置 */}
        <circle cx={machinePos.x} cy={machinePos.y} r="14" fill="#2196F3" opacity="0.18" className="animate-ping" />
        <circle cx={machinePos.x} cy={machinePos.y} r="10" fill="#111827" stroke="white" strokeWidth="4" />
      </svg>

      {/* 当前所在区域徽标 */}
      <div className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold shadow-sm" style={{ color: curArea ? '#2E7D32' : '#9CA3AF' }}>
        {curArea ? `当前在割草区域 ${curArea}` : '当前不在割草区域'}
      </div>
    </div>
  );
}

function ReviewStage({
  startArea,
  endArea,
  pass,
  name,
  setName,
  startPt,
  endPt,
  trail,
  onSave,
}: {
  startArea: AreaId;
  endArea: AreaId;
  pass: boolean;
  name: string;
  setName: (v: string) => void;
  startPt: { x: number; y: number } | null;
  endPt: { x: number; y: number } | null;
  trail: { x: number; y: number }[];
  onSave: () => void;
}) {
  return (
    <>
      <div className="relative mx-5 mt-3 overflow-hidden rounded-[20px]" style={{ height: '200px', background: '#F2F8F3' }}>
        <svg width="100%" height="100%" viewBox="0 0 520 270" preserveAspectRatio="xMidYMid meet" fill="none">
          <defs>
            <pattern id="passageReviewGrid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M22 0H0V22" fill="none" stroke="rgba(76,175,80,0.10)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="520" height="270" fill="url(#passageReviewGrid)" />
          <rect x="24" y="22" width="472" height="226" rx="16" fill="rgba(76,175,80,0.05)" stroke="#4CAF50" strokeWidth="2.5" strokeDasharray="8 5" />
          {AREAS.map((a) => (
            <g key={a.id}>
              <rect x={a.x} y={a.y} width={a.w} height={a.h} rx="8" fill="rgba(76,175,80,0.22)" stroke="#4CAF50" strokeWidth="2.5" />
              <text x={a.x + a.w / 2} y={a.y + a.h / 2 + 4} textAnchor="middle" fill="#1B5E20" fontSize="12" fontWeight="800">割草区域 {a.id}</text>
            </g>
          ))}
          <rect x={DOCK.x - 24} y={DOCK.y - 14} width="48" height="28" rx="5" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
          <text x={DOCK.x} y={DOCK.y + 4} textAnchor="middle" fill="#E65100" fontSize="9" fontWeight="700">充电桩</text>
          {trail.length > 1 && (
            <polyline points={trail.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#2196F3" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {startPt && (
            <g>
              <circle cx={startPt.x} cy={startPt.y} r="9" fill="#00C2FF" stroke="white" strokeWidth="3" />
              <text x={startPt.x} y={startPt.y - 20} textAnchor="middle" fill="#0284C7" fontSize="10" fontWeight="700">起点</text>
            </g>
          )}
          {endPt && (
            <g>
              <circle cx={endPt.x} cy={endPt.y} r="9" fill="#2196F3" stroke="white" strokeWidth="3" />
              <text x={endPt.x} y={endPt.y - 20} textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="700">终点</text>
            </g>
          )}
        </svg>
      </div>

      <div className="mx-5 mt-4 overflow-hidden rounded-[16px]" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2 px-4 pt-4">
          <Route size={18} strokeWidth={2.4} className="text-[#2196F3]" />
          <span className="text-[14px] font-semibold text-[#000000]">区域检测</span>
        </div>
        <div className="px-4 py-3">
          <DetectRow label="起点检测" area={startArea} />
          <DetectRow label="终点检测" area={endArea} />
          <DetectRow label="两点位于不同割草区域" area={pass ? 'A' : null} ok={pass} custom={pass ? '通过' : '未通过'} />
        </div>
      </div>

      <div className="mx-5 mt-4 rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="mb-2 flex items-center gap-2">
          <MapPin size={18} strokeWidth={2.4} className="text-[#2196F3]" />
          <span className="text-[14px] font-semibold text-[#000000]">通道名称</span>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入通道名称，如：侧院通道"
          className="w-full rounded-[12px] px-4 py-3 text-[14px] text-[#000000]"
          style={{ background: '#F5F6F8', border: '1.5px solid #E5E7EB', outline: 'none' }}
          autoFocus
        />
      </div>

      <div className="flex-1" />

      <div className="px-5 pb-6 pt-3 flex gap-3">
        <button onClick={onSave} disabled={!pass || !name.trim()} className="flex-[1.4] rounded-[16px] py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(0,194,255,0.22)] active:opacity-90 disabled:opacity-50" style={{ background: '#00C2FF' }}>
          保存通道
        </button>
      </div>
    </>
  );
}

function DetectRow({ label, area, ok, custom }: { label: string; area: AreaId; ok?: boolean; custom?: string }) {
  const passed = ok !== undefined ? ok : !!area;
  const text = custom ?? (area ? `在割草区域 ${area}` : '不在割草区域');
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #F0F0F0' }}>
      <span className="text-[13px] text-[#000000]">{label}</span>
      <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: passed ? '#16A34A' : '#EF4444' }}>
        {passed ? <CheckCircle2 size={15} strokeWidth={2.4} /> : <X size={15} strokeWidth={2.4} />}
        {text}
      </span>
    </div>
  );
}
