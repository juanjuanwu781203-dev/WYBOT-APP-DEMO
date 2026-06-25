import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  GitMerge,
  MapPin,
  Scissors,
  Square,
  Tag,
  Undo2,
  X,
} from 'lucide-react';
import { StatusBar } from './StatusBar';
import { LandscapeShell } from './RemoteMappingShared';

interface G1AreaSettingsPageProps {
  onBack: () => void;
  onLandscapeChange: (landscape: boolean) => void;
}

type Mode = 'list' | 'rename' | 'merge' | 'split';
type SplitStage = 'pick' | 'draw' | 'name';

interface Area {
  id: string;
  name: string;
  sizeM2: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

const INITIAL_AREAS: Area[] = [
  { id: 'a', name: '割草区域 A', sizeM2: 320, x: 38, y: 48, w: 135, h: 96 },
  { id: 'b', name: '割草区域 B', sizeM2: 280, x: 195, y: 150, w: 120, h: 92 },
];

// 院子边界 / 充电桩（竖屏地图 viewBox 335 x 360）
const BOUND = { x: 20, y: 20, w: 295, h: 320 };
const DOCK = { x: 258, y: 296 };
// 横屏放大画布 viewBox 520 x 270，区域内边距
const ZOOM_AREA = { x: 40, y: 30, w: 440, h: 210 };

export const G1AreaSettingsPage = ({ onBack, onLandscapeChange }: G1AreaSettingsPageProps) => {
  const [areas, setAreas] = useState<Area[]>(INITIAL_AREAS);
  const [mode, setMode] = useState<Mode>('list');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');

  // 分割流程
  const [splitStage, setSplitStage] = useState<SplitStage>('pick');
  const [splitTarget, setSplitTarget] = useState<Area | null>(null);
  const [splitPts, setSplitPts] = useState<{ x: number; y: number }[]>([]);
  const [pending, setPending] = useState<[Area, Area] | null>(null);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');

  const isLandscape = mode === 'split' && splitStage === 'draw';

  useEffect(() => {
    onLandscapeChange(isLandscape);
    return () => { onLandscapeChange(false); };
  }, [isLandscape, onLandscapeChange]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startRename = (a: Area) => {
    setRenamingId(a.id);
    setDraftName(a.name);
  };

  const confirmRename = () => {
    if (!renamingId) return;
    setAreas((prev) => prev.map((a) => (a.id === renamingId ? { ...a, name: draftName.trim() || a.name } : a)));
    setRenamingId(null);
  };

  const enterSplitDraw = (a: Area) => {
    setSplitTarget(a);
    setSplitPts([]);
    setSplitStage('draw');
  };

  const handleDrawClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    setSplitPts((prev) => [...prev, { x: loc.x, y: loc.y }]);
  };

  const confirmSplitDraw = () => {
    if (!splitTarget || splitPts.length < 2) return;
    const first = splitPts[0];
    const last = splitPts[splitPts.length - 1];
    const dx = Math.abs(last.x - first.x);
    const dy = Math.abs(last.y - first.y);
    const t = splitTarget;
    let a1: Area; let a2: Area;
    if (dx >= dy) {
      // 线偏横向 → 上下拆分
      a1 = { ...t, id: `${t.id}-1`, name: `${t.name} 1`, sizeM2: Math.round(t.sizeM2 / 2), h: t.h / 2 };
      a2 = { ...t, id: `${t.id}-2`, name: `${t.name} 2`, sizeM2: t.sizeM2 - a1.sizeM2, y: t.y + t.h / 2, h: t.h / 2 };
    } else {
      // 线偏纵向 → 左右拆分
      a1 = { ...t, id: `${t.id}-1`, name: `${t.name} 1`, sizeM2: Math.round(t.sizeM2 / 2), w: t.w / 2 };
      a2 = { ...t, id: `${t.id}-2`, name: `${t.name} 2`, sizeM2: t.sizeM2 - a1.sizeM2, x: t.x + t.w / 2, w: t.w / 2 };
    }
    setPending([a1, a2]);
    setName1(a1.name);
    setName2(a2.name);
    setSplitStage('name');
  };

  const confirmSplitNames = () => {
    if (!pending || !splitTarget) return;
    const [a1, a2] = pending;
    const final1 = { ...a1, name: name1.trim() || a1.name };
    const final2 = { ...a2, name: name2.trim() || a2.name };
    setAreas((prev) => prev.flatMap((a) => (a.id === splitTarget.id ? [final1, final2] : [a])));
    setConfirmMsg(`已将「${splitTarget.name}」拆分为 2 个区域，请重新校验回桩路径`);
    setPending(null);
    setSplitTarget(null);
    setSplitPts([]);
    setSplitStage('pick');
  };

  const confirmMerge = () => {
    if (selected.size < 2) return;
    const toMerge = areas.filter((a) => selected.has(a.id));
    const minX = Math.min(...toMerge.map((a) => a.x));
    const minY = Math.min(...toMerge.map((a) => a.y));
    const maxX = Math.max(...toMerge.map((a) => a.x + a.w));
    const maxY = Math.max(...toMerge.map((a) => a.y + a.h));
    const merged: Area = {
      id: `m-${areas.length}`,
      name: `合并区域 ${String.fromCharCode(65 + areas.length - selected.size)}`,
      sizeM2: toMerge.reduce((s, a) => s + a.sizeM2, 0),
      x: minX, y: minY, w: maxX - minX, h: maxY - minY,
    };
    setAreas((prev) => [...prev.filter((a) => !selected.has(a.id)), merged]);
    setSelected(new Set());
    setConfirmMsg('已合并选中区域并重新生成外轮廓，请重新校验回桩路径');
  };

  // ===== 横屏：放大区域绘制分割线 =====
  if (isLandscape && splitTarget) {
    return (
      <LandscapeShell
        title={`分割 ${splitTarget.name}`}
        onBack={() => { setSplitStage('pick'); setSplitPts([]); }}
      >
        <div className="relative mx-4 my-2 flex-1 overflow-hidden rounded-[18px] bg-[#F2F8F3]">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 520 270"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            onClick={handleDrawClick}
            style={{ cursor: 'crosshair' }}
          >
            <defs>
              <pattern id="splitGrid" width="22" height="22" patternUnits="userSpaceOnUse">
                <path d="M22 0H0V22" fill="none" stroke="rgba(76,175,80,0.12)" strokeWidth="1" />
              </pattern>
            </defs>
            {/* 放大的区域 */}
            <rect x={ZOOM_AREA.x} y={ZOOM_AREA.y} width={ZOOM_AREA.w} height={ZOOM_AREA.h} rx="12" fill="url(#splitGrid)" stroke="#4CAF50" strokeWidth="3" />
            <rect x={ZOOM_AREA.x} y={ZOOM_AREA.y} width={ZOOM_AREA.w} height={ZOOM_AREA.h} rx="12" fill="rgba(76,175,80,0.10)" stroke="none" />
            <text x={ZOOM_AREA.x + 14} y={ZOOM_AREA.y + 22} fill="#1B5E20" fontSize="12" fontWeight="800">{splitTarget.name}</text>
            <text x={ZOOM_AREA.x + 14} y={ZOOM_AREA.y + 38} fill="#388E3C" fontSize="9" fontWeight="600">{splitTarget.sizeM2} ㎡</text>

            {/* 已绘分割线 */}
            {splitPts.length >= 2 && (
              <polyline
                points={splitPts.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#EF4444"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 5"
              />
            )}
            {splitPts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="6" fill={i === 0 ? '#EF4444' : '#FFFFFF'} stroke="#EF4444" strokeWidth="2.5" />
                {i === 0 && <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#B91C1C" fontSize="9" fontWeight="700">起点</text>}
              </g>
            ))}

            {splitPts.length === 0 && (
              <text x="260" y="140" textAnchor="middle" fill="#9CA3AF" fontSize="13" fontWeight="600">点击区域内绘制分割线</text>
            )}
          </svg>
        </div>

        <div className="flex w-56 flex-col items-center justify-center px-4">
          <div className="mb-4 w-full rounded-[14px] bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#111827]">分割线</span>
              <span className="text-[13px] font-semibold text-[#EF4444]">{splitPts.length} 点</span>
            </div>
            <p className="text-[11px] leading-4 text-[#6B7280]">点击地图添加分割线点（至少 2 点），系统将按线把区域拆成两部分。</p>
          </div>
          <div className="mb-3 flex w-full gap-2">
            <button onClick={() => setSplitPts((p) => p.slice(0, -1))} disabled={splitPts.length === 0} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white py-2.5 text-[12px] font-semibold text-[#374151] shadow-sm disabled:opacity-45 active:opacity-90">
              <Undo2 size={14} strokeWidth={2.4} /> 撤销
            </button>
            <button onClick={() => setSplitPts([])} disabled={splitPts.length === 0} className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white py-2.5 text-[12px] font-semibold text-[#EF4444] shadow-sm disabled:opacity-45 active:opacity-90">
              <X size={14} strokeWidth={2.4} /> 清除
            </button>
          </div>
          <button
            onClick={confirmSplitDraw}
            disabled={splitPts.length < 2}
            className="w-full rounded-full bg-[#00C2FF] py-2.5 text-[13px] font-semibold text-white disabled:opacity-45 active:opacity-90"
          >
            确认分割线
          </button>
        </div>
      </LandscapeShell>
    );
  }

  // ===== 竖屏：主页面 =====
  const headerBack = () => {
    if (mode === 'split' && splitStage === 'name') {
      setSplitStage('draw');
      return;
    }
    if (mode !== 'list') {
      setMode('list');
      setSelected(new Set());
      setRenamingId(null);
      setSplitStage('pick');
      setSplitTarget(null);
      setSplitPts([]);
      setPending(null);
      return;
    }
    onBack();
  };

  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#F5F6F8' }}>
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={headerBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-[#000000]">区域设置</span>
      </div>

      {/* 分割命名页 */}
      {mode === 'split' && splitStage === 'name' && pending ? (
        <SplitNamingStage
          pending={pending}
          name1={name1}
          name2={name2}
          setName1={setName1}
          setName2={setName2}
          onConfirm={confirmSplitNames}
        />
      ) : (
        <>
          {/* 地图 */}
          <div className="mx-5 overflow-hidden rounded-[20px]" style={{ height: '300px', background: '#F2F8F3' }}>
            <AreaMap
              areas={areas}
              mode={mode}
              selected={selected}
              renamingId={renamingId}
            />
          </div>

          {/* 模式切换 */}
          <div className="mx-5 mt-3 flex rounded-[14px] bg-[#E8EEF0] p-1">
            {([
              { key: 'list' as const, label: '区域列表', icon: Square },
              { key: 'rename' as const, label: '命名', icon: Tag },
              { key: 'merge' as const, label: '合并', icon: GitMerge },
              { key: 'split' as const, label: '分割', icon: Scissors },
            ]).map(({ key, label, icon: Icon }) => {
              const active = mode === key;
              return (
                <button
                  key={key}
                  onClick={() => { setMode(key); setSelected(new Set()); setRenamingId(null); setSplitStage('pick'); setSplitTarget(null); setSplitPts([]); }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-[12px] font-semibold transition-all ${active ? 'bg-white text-[#00A7E1] shadow-sm' : 'text-[#6B7280]'}`}
                >
                  <Icon size={14} strokeWidth={2.2} />
                  {label}
                </button>
              );
            })}
          </div>

          {confirmMsg && (
            <div className="mx-5 mt-3 rounded-[12px] px-3 py-2" style={{ background: '#E0F4FF' }}>
              <div className="flex items-start gap-2">
                <Check size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-[#00A7E1]" />
                <p className="text-[12px] leading-4 text-[#0C4A6E]">{confirmMsg}</p>
              </div>
            </div>
          )}

          {mode === 'merge' && selected.size >= 2 && (
            <button onClick={confirmMerge} className="mx-5 mt-3 rounded-[14px] bg-[#00A7E1] py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(0,194,255,0.22)] active:opacity-90">
              合并选中的 {selected.size} 个区域
            </button>
          )}

          {mode === 'rename' && renamingId && (
            <div className="mx-5 mt-3 rounded-[14px] p-3" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
              <div className="mb-2 flex items-center gap-2">
                <Tag size={16} strokeWidth={2.4} className="text-[#00A7E1]" />
                <span className="text-[13px] font-semibold text-[#000000]">重命名「{areas.find((a) => a.id === renamingId)?.name}」</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="输入区域名称"
                  className="flex-1 rounded-[12px] px-3 py-2.5 text-[14px] text-[#000000]"
                  style={{ background: '#F5F6F8', border: '1.5px solid #E5E7EB', outline: 'none' }}
                  autoFocus
                />
                <button onClick={confirmRename} className="rounded-[12px] bg-[#00A7E1] px-4 py-2.5 text-[13px] font-semibold text-white active:opacity-90">
                  保存
                </button>
              </div>
            </div>
          )}

          {/* 区域列表 */}
          <div className="flex-1 px-5 pt-3 overflow-auto pb-6">
            {areas.map((a) => {
              const isSel = selected.has(a.id);
              const isRenaming = mode === 'rename' && renamingId === a.id;
              const highlight = isSel || isRenaming;
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    if (mode === 'merge') toggleSelect(a.id);
                    else if (mode === 'rename') startRename(a);
                    else if (mode === 'split') enterSplitDraw(a);
                    else setRenamingId(a.id);
                  }}
                  className="flex w-full items-center gap-3 rounded-[14px] px-4 py-3 mb-2 text-left active:opacity-90"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.06)',
                    border: highlight ? '1.5px solid #00A7E1' : '1.5px solid transparent',
                  }}
                >
                  {mode === 'merge' && (
                    <div className="grid h-5 w-5 place-items-center rounded-full" style={{ background: isSel ? '#00A7E1' : '#E5E7EB', border: isSel ? 'none' : '1.5px solid #D1D5DB' }}>
                      {isSel && <Check size={12} strokeWidth={3} className="text-white" />}
                    </div>
                  )}
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#E8F5E9]">
                    <Square size={16} strokeWidth={2.2} className="text-[#4CAF50]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium text-[#000000]">{a.name}</div>
                    <div className="text-[11px] text-[#999999]">{a.sizeM2} ㎡</div>
                  </div>
                  {mode === 'list' && <ChevronRight size={18} strokeWidth={2} className="text-[#CCCCCC]" />}
                  {mode === 'split' && <Scissors size={16} strokeWidth={2.2} className="text-[#00A7E1]" />}
                </button>
              );
            })}

            <p className="mt-2 px-1 text-[11px] leading-4 text-[#999999]">
              单张地图最多 5 个割草区域，当前 {areas.length} / 5。{mode === 'merge' ? '选中 2 个或以上相邻区域后合并。' : mode === 'split' ? '点击区域进入放大视图，手动绘制分割线将其拆成两部分。' : mode === 'rename' ? '点击区域进行重命名。' : '点击区域可重命名。'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

// 横屏同步已通过上方 useEffect 处理

function SplitNamingStage({
  pending,
  name1,
  name2,
  setName1,
  setName2,
  onConfirm,
}: {
  pending: [Area, Area];
  name1: string;
  name2: string;
  setName1: (v: string) => void;
  setName2: (v: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex-1 px-5 pt-3 overflow-auto pb-6">
      <div className="rounded-[16px] p-4" style={{ background: '#E0F4FF' }}>
        <p className="text-[12px] leading-5 text-[#0C4A6E]">区域已按分割线拆分为两部分，请分别为其命名。</p>
      </div>
      {[pending[0], pending[1]].map((a, i) => (
        <div key={a.id} className="mt-3 rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="mb-2 flex items-center gap-2">
            <MapPin size={16} strokeWidth={2.4} className="text-[#4CAF50]" />
            <span className="text-[14px] font-semibold text-[#000000]">区域 {i + 1}</span>
            <span className="ml-auto text-[11px] text-[#999999]">{a.sizeM2} ㎡</span>
          </div>
          <input
            value={i === 0 ? name1 : name2}
            onChange={(e) => (i === 0 ? setName1(e.target.value) : setName2(e.target.value))}
            placeholder="输入区域名称"
            className="w-full rounded-[12px] px-3 py-2.5 text-[14px] text-[#000000]"
            style={{ background: '#F5F6F8', border: '1.5px solid #E5E7EB', outline: 'none' }}
            autoFocus={i === 0}
          />
        </div>
      ))}
      <div className="flex-1" />
      <button onClick={onConfirm} className="mt-4 w-full rounded-[16px] bg-[#00C2FF] py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(0,194,255,0.22)] active:opacity-90">
        保存分割区域
      </button>
    </div>
  );
}

function AreaMap({
  areas,
  mode,
  selected,
  renamingId,
}: {
  areas: Area[];
  mode: Mode;
  selected: Set<string>;
  renamingId: string | null;
}) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 335 360" preserveAspectRatio="xMidYMid meet" fill="none">
      <defs>
        <pattern id="areaGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(76,175,80,0.10)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="335" height="360" fill="url(#areaGrid)" />
      <rect x={BOUND.x} y={BOUND.y} width={BOUND.w} height={BOUND.h} rx="12" fill="rgba(76,175,80,0.05)" stroke="#4CAF50" strokeWidth="2.5" strokeDasharray="8 5" />
      <text x={BOUND.x + 8} y={BOUND.y + 16} fill="#7CB342" fontSize="9" fontWeight="700">院子边界</text>
      <rect x={DOCK.x - 16} y={DOCK.y - 10} width="32" height="20" rx="4" fill="#FFF3E0" stroke="#FF9800" strokeWidth="1.5" />
      <text x={DOCK.x} y={DOCK.y + 4} textAnchor="middle" fill="#E65100" fontSize="8" fontWeight="700">充电桩</text>

      {areas.map((a) => {
        const isSel = selected.has(a.id);
        const isRename = mode === 'rename' && renamingId === a.id;
        const highlight = isSel || isRename;
        return (
          <g key={a.id}>
            <rect
              x={a.x} y={a.y} width={a.w} height={a.h} rx="8"
              fill={highlight ? 'rgba(0,194,255,0.18)' : 'rgba(76,175,80,0.22)'}
              stroke={highlight ? '#00A7E1' : '#4CAF50'}
              strokeWidth={highlight ? 2.5 : 2}
            />
            <text x={a.x + a.w / 2} y={a.y + a.h / 2 - 2} textAnchor="middle" fill={highlight ? '#0C4A6E' : '#1B5E20'} fontSize="11" fontWeight="800">{a.name}</text>
            <text x={a.x + a.w / 2} y={a.y + a.h / 2 + 12} textAnchor="middle" fill={highlight ? '#0284C7' : '#388E3C'} fontSize="8" fontWeight="600">{a.sizeM2} ㎡</text>
            {isSel && mode === 'merge' && (
              <g>
                <circle cx={a.x + a.w - 12} cy={a.y + 12} r="8" fill="#00A7E1" />
                <path d={`M${a.x + a.w - 16} ${a.y + 12} l3 3 l5 -6`} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
