import { useEffect, useState } from 'react';
import { LandscapeShell, RemotePad } from './RemoteMappingShared';

interface G1RemoteControlPageProps {
  onBack: () => void;
  onLandscapeChange: (landscape: boolean) => void;
}

// 横屏画布 viewBox：520 x 270
const BOUND = { x: 24, y: 22, w: 472, h: 226 };
const DOCK = { x: 470, y: 200 };
const NOGO = { x: 250, y: 60, w: 56, h: 40 };
const AREAS: { id: string; x: number; y: number; w: number; h: number }[] = [
  { id: 'A', x: 60, y: 50, w: 150, h: 95 },
  { id: 'B', x: 330, y: 120, w: 120, h: 80 },
];
const STEP = 16;

export const G1RemoteControlPage = ({ onBack, onLandscapeChange }: G1RemoteControlPageProps) => {
  const [pos, setPos] = useState({ x: 260, y: 135 });
  const [mowing, setMowing] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    onLandscapeChange(true);
    return () => { onLandscapeChange(false); };
  }, [onLandscapeChange]);

  const clamp = (p: { x: number; y: number }) => ({
    x: Math.max(BOUND.x + 6, Math.min(BOUND.x + BOUND.w - 6, p.x)),
    y: Math.max(BOUND.y + 6, Math.min(BOUND.y + BOUND.h - 6, p.y)),
  });

  const drive = (dx: number, dy: number) => {
    setPos((p) => {
      const next = clamp({ x: p.x + dx, y: p.y + dy });
      if (mowing) setTrail((t) => (t.length === 0 || t[t.length - 1].x !== next.x || t[t.length - 1].y !== next.y ? [...t, next] : t));
      return next;
    });
  };

  const toggleMow = () => {
    setMowing((m) => {
      if (!m) setTrail((t) => (t.length ? t : [{ ...pos }]));
      return !m;
    });
  };

  return (
    <LandscapeShell
      title="遥控控制"
      onBack={onBack}
      trailing={
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: mowing ? '#DCFCE7' : '#E0F4FF', color: mowing ? '#16A34A' : '#0284C7' }}>
          {mowing ? '遥控割草中' : '手动遥控'}
        </div>
      }
    >
      <ControlCanvas pos={pos} trail={trail} mowing={mowing} />

      <RemotePad
        note={mowing ? '刀盘转动中，行驶时留下割草轨迹。可继续遥控到任意位置。' : '随时接管遥控：用方向键驾驶机器到想要去的位置。'}
        buttonText={mowing ? '停止割草' : '开始割草'}
        onConfirm={toggleMow}
        onMove={(dir) => {
          if (dir === 'up') drive(0, -STEP);
          if (dir === 'down') drive(0, STEP);
          if (dir === 'left') drive(-STEP, 0);
          if (dir === 'right') drive(STEP, 0);
        }}
      />
    </LandscapeShell>
  );
};

function ControlCanvas({
  pos,
  trail,
  mowing,
}: {
  pos: { x: number; y: number };
  trail: { x: number; y: number }[];
  mowing: boolean;
}) {
  return (
    <div className="relative mx-4 my-2 flex-1 overflow-hidden rounded-[18px] bg-[#F2F8F3]">
      <svg width="100%" height="100%" viewBox="0 0 520 270" preserveAspectRatio="xMidYMid meet" fill="none">
        <defs>
          <pattern id="rcGrid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="rgba(76,175,80,0.10)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="520" height="270" fill="url(#rcGrid)" />
        <rect x={BOUND.x} y={BOUND.y} width={BOUND.w} height={BOUND.h} rx="14" fill="rgba(76,175,80,0.05)" stroke="#4CAF50" strokeWidth="2.5" strokeDasharray="8 5" />
        <text x={BOUND.x + 8} y={BOUND.y + 16} fill="#7CB342" fontSize="9" fontWeight="700">院子边界</text>

        {/* 割草区域 */}
        {AREAS.map((a) => (
          <g key={a.id}>
            <rect x={a.x} y={a.y} width={a.w} height={a.h} rx="8" fill="rgba(76,175,80,0.18)" stroke="#4CAF50" strokeWidth="2" />
            <text x={a.x + a.w / 2} y={a.y + a.h / 2 + 3} textAnchor="middle" fill="#1B5E20" fontSize="11" fontWeight="800">割草区域 {a.id}</text>
          </g>
        ))}

        {/* 禁区 */}
        <rect x={NOGO.x} y={NOGO.y} width={NOGO.w} height={NOGO.h} rx="4" fill="rgba(239,68,68,0.14)" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={NOGO.x + NOGO.w / 2} y={NOGO.y + NOGO.h / 2 + 3} textAnchor="middle" fill="#B91C1C" fontSize="8" fontWeight="700">No-Go</text>

        {/* 充电桩 */}
        <rect x={DOCK.x - 16} y={DOCK.y - 10} width="32" height="20" rx="5" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
        <text x={DOCK.x} y={DOCK.y + 4} textAnchor="middle" fill="#E65100" fontSize="9" fontWeight="700">充电桩</text>

        {/* 割草轨迹 */}
        {mowing && trail.length > 1 && (
          <polyline points={trail.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#22C55E" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
        )}
        {mowing && trail.length > 1 && (
          <polyline points={trail.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* 机器 + 刀盘 */}
        <g transform={`translate(${pos.x} ${pos.y})`}>
          <circle r="16" fill="#00C2FF" opacity="0.18" className="animate-ping" />
          {mowing ? (
            <g>
              {/* 旋转刀盘 */}
              <g>
                <line x1="-9" y1="0" x2="9" y2="0" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="0" y1="-9" x2="0" y2="9" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="-6.4" y1="-6.4" x2="6.4" y2="6.4" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                <line x1="-6.4" y1="6.4" x2="6.4" y2="-6.4" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.7s" repeatCount="indefinite" />
              </g>
              <circle r="10" fill="#111827" stroke="white" strokeWidth="3" />
            </g>
          ) : (
            <circle r="10" fill="#111827" stroke="white" strokeWidth="3" />
          )}
        </g>
      </svg>

      {/* 刀盘转动提示 */}
      {mowing && (
        <div className="absolute right-4 top-12 rounded-full bg-[#DCFCE7] px-3 py-1.5 text-[11px] font-semibold text-[#16A34A] shadow-sm">
          刀盘转动中
        </div>
      )}
    </div>
  );
}
