import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Battery,
  Bluetooth,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  Gamepad2,
  Info,
  Layers,
  Map,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Signal,
  Wifi,
} from 'lucide-react';
import { StatusBar } from './StatusBar';
import imgG1 from '../assets/devices/device_wybot_g1.png';

interface G1DevicePageProps {
  onBack: () => void;
  onOpenDeviceInfo: () => void;
  onOpenMapping: () => void;
  onOpenSchedule: () => void;
  onOpenMowingParameters: () => void;
  onOpenMapManagement: () => void;
  onOpenPatrol: () => void;
  onOpenRemoteControl: () => void;
  hasMap: boolean;
}

type AreaUnit = 'm2' | 'ft2';

type MachineStatus = 'standby' | 'mowing' | 'patrol' | 'charging' | 'returning' | 'locating' | 'rain';

// 单张地图最多支持 5 个割草区域（PRD §6）。可随时在主页切换当前割草区域。
type MowingAreaId = 'all' | 'a' | 'b' | 'c' | 'd' | 'e';

interface MowingArea {
  id: MowingAreaId;
  name: string;
  desc: string;
  sizeM2: number; // 基础面积，单位平方米
}

const MOWING_AREAS: MowingArea[] = [
  { id: 'all', name: 'Full map', desc: 'Mow all areas in sequence', sizeM2: 760 },
  { id: 'a', name: 'Area A', desc: 'Front lawn', sizeM2: 320 },
  { id: 'b', name: 'Area B', desc: 'Back lawn', sizeM2: 280 },
  { id: 'c', name: 'Area C', desc: 'Side garden', sizeM2: 160 },
];

const SQM_TO_SQFT = 10.7639;

const formatArea = (sizeM2: number, unit: AreaUnit) => {
  if (unit === 'm2') return `${sizeM2.toLocaleString()} ㎡`;
  return `${Math.round(sizeM2 * SQM_TO_SQFT).toLocaleString()} ft²`;
};

// 机器工作状态文案。顶部状态栏仅显示工作状态，不再附带部件动作描述。
const statusCopy: Record<MachineStatus, { label: string; desc: string; color: string }> = {
  standby: { label: 'Standby', desc: 'Standby', color: '#86EFAC' },
  mowing: { label: 'Mowing', desc: 'Mowing', color: '#7DD3FC' },
  patrol: { label: 'Patrol', desc: 'Patrolling', color: '#7DD3FC' },
  charging: { label: 'Charging', desc: 'Charging', color: '#FCD34D' },
  returning: { label: 'Returning', desc: 'Returning', color: '#FDBA74' },
  locating: { label: 'Locating', desc: 'Locating', color: '#C4B5FD' },
  rain: { label: 'Rain pause', desc: 'Rain pause', color: '#93C5FD' },
};

export const G1DevicePage = ({
  onBack,
  onOpenDeviceInfo,
  onOpenMapping,
  onOpenSchedule,
  onOpenMowingParameters,
  onOpenMapManagement,
  onOpenPatrol,
  onOpenRemoteControl,
  hasMap,
}: G1DevicePageProps) => {
  const [machineStatus, setMachineStatus] = useState<MachineStatus>('standby');
  const [showMissingMapAlert, setShowMissingMapAlert] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<MowingAreaId>('all');
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('m2');
  const [cuttingMode, setCuttingMode] = useState<'full' | 'edge'>('full');
  const status = statusCopy[machineStatus];
  const selectedArea = MOWING_AREAS.find((a) => a.id === selectedAreaId) ?? MOWING_AREAS[0];
  const selectedAreaSize = formatArea(selectedArea.sizeM2, areaUnit);

  const toggleMowing = () => {
    if (!hasMap) {
      setShowMissingMapAlert(true);
      return;
    }
    // 使用当前选中的割草模式（全区域 / 仅边缘）
    setMachineStatus((prev) => {
      // 割草前先重定位（PRD §20.3），定位完成后进入割草
      if (prev === 'standby' || prev === 'charging' || prev === 'locating' || prev === 'rain') {
        setMachineStatus('locating');
        setTimeout(() => setMachineStatus('mowing'), 1500);
        return 'locating';
      }
      if (prev === 'mowing') return 'standby';
      return prev;
    });
  };

  const handleReturn = () => {
    if (!hasMap) {
      setShowMissingMapAlert(true);
      return;
    }
    setMachineStatus('returning');
    setTimeout(() => setMachineStatus('charging'), 2000);
  };

  return (
    <div className="relative flex h-[812px] w-[375px] flex-col bg-[#F3F6F4]">
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={onBack} className="p-1" aria-label="返回">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#111827]" />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-[#111827]">WYBOT G1Pro</span>
        <button onClick={onOpenDeviceInfo} className="ml-1.5 p-1" aria-label="设备信息">
          <Info size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
      </div>

      <div className="px-5">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0F2A1B] via-[#1F6F3C] to-[#90D786] p-4 text-white shadow-[0_16px_36px_rgba(31,111,60,0.22)]">
          <div className="relative z-10">
            <h1 className="text-[24px] font-semibold leading-7">G1Pro Lawn Robot</h1>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${machineStatus === 'standby' ? '' : 'animate-pulse'}`} style={{ background: status.color }} />
              <p className="max-w-[200px] text-[12px] leading-5 font-medium text-white/90">{status.desc}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <SignalChip icon={Bluetooth} label="BT" />
              <SignalChip icon={Wifi} label="Wi-Fi" />
              <SignalChip icon={Signal} label="4G" />
              <SignalChip icon={Battery} label="85%" />
            </div>
          </div>
          <img src={imgG1} alt="WYBOT G1Pro" className="absolute bottom-[-28px] right-[-58px] w-[230px] drop-shadow-2xl" />
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-hidden px-5">
        {hasMap ? (
          <MappedPanel
            selectedAreaId={selectedAreaId}
            machineStatus={machineStatus}
            cuttingMode={cuttingMode}
            onOpenSchedule={onOpenSchedule}
            onOpenMowingParameters={onOpenMowingParameters}
            onOpenMapManagement={onOpenMapManagement}
            onOpenPatrol={onOpenPatrol}
            onOpenRemoteControl={onOpenRemoteControl}
          />
        ) : (
          <NoMapPanel onOpenMapping={onOpenMapping} />
        )}
      </div>

      {hasMap ? (
        <div className="px-5 pb-5 pt-3">
          <button
            onClick={() => setShowAreaPicker(true)}
            className="mb-3 flex w-full items-center gap-3 rounded-[16px] bg-white px-4 py-3 text-left shadow-[0_8px_20px_rgba(15,23,42,0.08)] active:opacity-90"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#E0F4FB]">
              <Layers size={18} strokeWidth={2.2} className="text-[#00A7E1]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-medium uppercase tracking-wide text-[#6B7280]">Mowing area</div>
              <div className="truncate text-[15px] font-semibold text-[#111827]">{selectedArea.name}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#374151]">{selectedAreaSize}</span>
              <ChevronDown size={18} strokeWidth={2.2} className="text-[#6B7280]" />
            </div>
          </button>

          {/* 割草模式切换：全区域切割 / 仅边缘切割 */}
          <div className="mb-3 flex rounded-[14px] bg-[#E8EEF0] p-1">
            {([
              { key: 'full' as const, label: '全区域切割' },
              { key: 'edge' as const, label: '仅边缘切割' },
            ]).map(({ key, label }) => {
              const active = cuttingMode === key;
              return (
                <button
                  key={key}
                  onClick={() => setCuttingMode(key)}
                  className={`flex-1 rounded-[10px] py-2 text-[13px] font-semibold transition-all ${active ? 'bg-white text-[#00A7E1] shadow-sm' : 'text-[#6B7280]'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleMowing}
              disabled={machineStatus === 'locating' || machineStatus === 'returning'}
              className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#00A7E1] py-3 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(0,194,255,0.22)] active:opacity-90 disabled:opacity-60"
            >
              {machineStatus === 'mowing' ? <Pause size={18} strokeWidth={2} /> : <Play size={18} strokeWidth={2} />}
              {machineStatus === 'mowing' ? 'Pause' : machineStatus === 'locating' ? 'Locating…' : 'Start'}
            </button>
            <button
              onClick={handleReturn}
              className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-white py-3 text-[14px] font-semibold text-[#111827] shadow-[0_8px_20px_rgba(15,23,42,0.08)] active:opacity-90"
            >
              <RotateCcw size={18} strokeWidth={2} className={machineStatus === 'returning' ? 'animate-spin text-[#EA580C]' : ''} />
              Return
            </button>
          </div>
        </div>
      ) : null}

      {showAreaPicker && (
        <div className="absolute inset-0 z-30 flex items-end bg-black/45" onClick={() => setShowAreaPicker(false)}>
          <div
            className="w-full rounded-t-[24px] bg-white px-5 pb-6 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#E5E7EB]" />
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-[#111827]">Switch mowing area</h3>
              <div className="flex items-center rounded-full bg-[#F3F4F6] p-0.5 text-[11px] font-semibold">
                <button
                  onClick={() => setAreaUnit('m2')}
                  className={`rounded-full px-2.5 py-1 transition-colors ${areaUnit === 'm2' ? 'bg-white text-[#00A7E1] shadow-sm' : 'text-[#6B7280]'}`}
                >
                  ㎡
                </button>
                <button
                  onClick={() => setAreaUnit('ft2')}
                  className={`rounded-full px-2.5 py-1 transition-colors ${areaUnit === 'ft2' ? 'bg-white text-[#00A7E1] shadow-sm' : 'text-[#6B7280]'}`}
                >
                  ft²
                </button>
              </div>
            </div>
            <p className="mb-3 text-[12px] leading-5 text-[#6B7280]">Choose the area to mow next. Switch anytime during standby.</p>
            <div className="max-h-[320px] overflow-y-auto">
              {MOWING_AREAS.map((area) => {
                const active = area.id === selectedAreaId;
                return (
                  <button
                    key={area.id}
                    onClick={() => {
                      setSelectedAreaId(area.id);
                      setShowAreaPicker(false);
                    }}
                    className="mb-2 flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left active:opacity-90"
                    style={{
                      borderColor: active ? '#00A7E1' : '#E5E7EB',
                      background: active ? '#F0FBFE' : '#FFFFFF',
                    }}
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[#E0F4FB]">
                      <Layers size={17} strokeWidth={2.2} className="text-[#00A7E1]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-[#111827]">{area.name}</div>
                      <div className="truncate text-[12px] text-[#6B7280]">{area.desc}</div>
                    </div>
                    <span className="shrink-0 text-[12px] font-medium text-[#6B7280]">{formatArea(area.sizeM2, areaUnit)}</span>
                    {active && <Check size={18} strokeWidth={2.6} className="shrink-0 text-[#00A7E1]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showMissingMapAlert && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 px-6">
          <div className="w-full rounded-[22px] bg-white p-5 text-center shadow-xl">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#FFF7ED]">
              <AlertTriangle size={28} strokeWidth={2} className="text-[#F59E0B]" />
            </div>
            <h3 className="text-[17px] font-semibold text-[#111827]">Map required</h3>
            <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
              No valid mowing map is available. Please create a map before starting mowing.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowMissingMapAlert(false)} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#6B7280]">
                Later
              </button>
              <button onClick={onOpenMapping} className="flex-1 rounded-[12px] bg-[#00A7E1] py-2.5 text-[14px] font-semibold text-white">
                Create map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function SignalChip({ icon: Icon, label }: { icon: typeof Bluetooth; label: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
      <Icon size={13} strokeWidth={2.4} />
      {label}
    </div>
  );
}

function NoMapPanel({ onOpenMapping }: { onOpenMapping: () => void }) {
  return (
    <div className="flex h-full flex-col rounded-[26px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="relative flex-1 overflow-hidden rounded-[22px] bg-[#F4F7F5]">
        <svg width="100%" height="100%" viewBox="0 0 300 270" fill="none">
          <rect width="300" height="270" fill="#F4F7F5" />
          <path d="M0 45H300M0 90H300M0 135H300M0 180H300M0 225H300" stroke="#E1E8E2" strokeWidth="1" />
          <path d="M50 0V270M100 0V270M150 0V270M200 0V270M250 0V270" stroke="#E1E8E2" strokeWidth="1" />
          <rect x="22" y="22" width="256" height="196" rx="18" fill="#FFFFFF" fillOpacity="0.66" stroke="#D8E2D9" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M74 70H226" stroke="#CAD8CC" strokeWidth="3" strokeLinecap="round" strokeDasharray="9 8" />
          <path d="M74 116H226" stroke="#CAD8CC" strokeWidth="3" strokeLinecap="round" strokeDasharray="9 8" />
          <path d="M74 162H188" stroke="#CAD8CC" strokeWidth="3" strokeLinecap="round" strokeDasharray="9 8" />
          <circle cx="150" cy="126" r="14" fill="#00A7E1" stroke="#FFFFFF" strokeWidth="5" />
          <rect x="208" y="184" width="42" height="24" rx="6" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
          <text x="229" y="200" textAnchor="middle" fill="#EA580C" fontSize="8" fontWeight="700">Dock</text>
          <rect x="84" y="232" width="132" height="24" rx="12" fill="#FFFFFF" />
          <text x="150" y="248" textAnchor="middle" fill="#6B7280" fontSize="11" fontWeight="700">Map not created</text>
        </svg>
      </div>
      <div className="pt-4">
        <h2 className="text-[20px] font-semibold text-[#111827]">Create your first lawn map</h2>
        <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">
          Start mapping to define mowing areas, no-go zones, passages, and return-to-dock paths.
        </p>
        <button onClick={onOpenMapping} className="mt-4 w-full rounded-full bg-[#00A7E1] py-3.5 text-[16px] font-semibold text-white active:opacity-90">
          Start mapping
        </button>
      </div>
    </div>
  );
}

function MappedPanel({
  selectedAreaId,
  machineStatus,
  cuttingMode,
  onOpenSchedule,
  onOpenMowingParameters,
  onOpenMapManagement,
  onOpenPatrol,
  onOpenRemoteControl,
}: {
  selectedAreaId: MowingAreaId;
  machineStatus: MachineStatus;
  cuttingMode: 'full' | 'edge';
  onOpenSchedule: () => void;
  onOpenMowingParameters: () => void;
  onOpenMapManagement: () => void;
  onOpenPatrol: () => void;
  onOpenRemoteControl: () => void;
}) {
  const isWorking = machineStatus === 'mowing' || machineStatus === 'locating' || machineStatus === 'returning';
  const [viewMode, setViewMode] = useState<'focus' | 'all'>(isWorking ? 'focus' : 'all');

  // 进入工作状态时自动聚焦到当前割草区域；停止后回到全图
  useEffect(() => {
    setViewMode(isWorking ? 'focus' : 'all');
  }, [isWorking]);

  const focusArea =
    selectedAreaId === 'all' ? MOWING_AREAS[1] : MOWING_AREAS.find((a) => a.id === selectedAreaId) ?? MOWING_AREAS[1];

  return (
    <div className="relative h-full overflow-hidden rounded-[26px] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
        <MapButton icon={Calendar} label="Schedule" onClick={onOpenSchedule} />
        <MapButton icon={Settings} label="Params" onClick={onOpenMowingParameters} />
        <MapButton icon={Map} label="Map" onClick={onOpenMapManagement} />
        <MapButton icon={Camera} label="Patrol" onClick={onOpenPatrol} />
        <MapButton icon={Gamepad2} label="Remote" onClick={onOpenRemoteControl} />
      </div>

      <button
        onClick={() => setViewMode((m) => (m === 'focus' ? 'all' : 'focus'))}
        className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-[11px] font-semibold text-[#111827] shadow-[0_4px_12px_rgba(15,23,42,0.12)] active:opacity-90"
      >
        {viewMode === 'focus' ? <Minimize2 size={14} strokeWidth={2.4} /> : <Maximize2 size={14} strokeWidth={2.4} />}
        {viewMode === 'focus' ? 'Full map' : 'Focus'}
      </button>

      {viewMode === 'focus' ? (
        <WorkingMap areaName={focusArea.name} cuttingMode={cuttingMode} status={machineStatus} />
      ) : (
        <FullMap selectedAreaId={selectedAreaId} />
      )}

      {viewMode === 'focus' && (
        <div className="absolute bottom-3 left-3 right-3 z-10 grid grid-cols-2 gap-2">
          <Metric label="Area" value={focusArea.name} />
          <Metric label="Mode" value={cuttingMode === 'edge' ? '仅边缘' : '全区域'} />
          <Metric label="Progress" value={machineStatus === 'locating' ? 'Locating' : cuttingMode === 'edge' ? '60%' : '45%'} />
          <Metric label="Speed" value="0.2 m/s" />
        </div>
      )}
    </div>
  );
}

// 全图视图：展示所有割草区域（Area A / B），当前区域高亮
function FullMap({ selectedAreaId }: { selectedAreaId: MowingAreaId }) {
  const aActive = selectedAreaId === 'all' || selectedAreaId === 'a';
  const bActive = selectedAreaId === 'all' || selectedAreaId === 'b';
  return (
    <svg width="100%" height="100%" viewBox="0 0 335 390" fill="none" preserveAspectRatio="xMidYMid slice">
      <rect width="335" height="390" fill="#EAF6E8" />
      <path d="M59 54C95 31 149 47 179 67C213 89 273 78 292 125C312 173 277 235 224 250C169 266 80 252 52 205C25 159 17 77 59 54Z" fill="#DFF3DC" stroke="#4CAF50" strokeWidth="2.5" />
      <path d="M78 78H154V151H78Z" fill={aActive ? '#BBF7D0' : '#CFECCB'} stroke={aActive ? '#16A34A' : '#4CAF50'} strokeWidth={aActive ? 3 : 2} />
      <text x="116" y="119" textAnchor="middle" fill={aActive ? '#15803D' : '#6B9E70'} fontSize="12" fontWeight="700">Area A</text>
      <path d="M182 83H267V161H182Z" fill={bActive ? '#BBF7D0' : '#CFECCB'} stroke={bActive ? '#16A34A' : '#4CAF50'} strokeWidth={bActive ? 3 : 2} />
      <text x="224" y="126" textAnchor="middle" fill={bActive ? '#15803D' : '#6B9E70'} fontSize="12" fontWeight="700">Area B</text>
      <rect x="92" y="190" width="52" height="34" rx="7" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 4" />
      <text x="118" y="211" textAnchor="middle" fill="#DC2626" fontSize="10" fontWeight="700">No-Go</text>
      <path d="M154 116H182" stroke="#2196F3" strokeWidth="8" strokeLinecap="round" opacity="0.45" />
      <path d="M224 161C238 230 276 276 286 332" stroke="#F97316" strokeWidth="3" strokeDasharray="7 5" />
      <rect x="253" y="330" width="62" height="30" rx="7" fill="#FFF3E0" stroke="#F97316" strokeWidth="2" />
      <text x="284" y="349" textAnchor="middle" fill="#EA580C" fontSize="10" fontWeight="700">Dock</text>
      <path d="M83 92H148M83 112H148M83 132H148M188 98H261M188 118H261M188 138H261" stroke="#9ADBEF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="142" cy="149" r="11" fill="#00A7E1" stroke="white" strokeWidth="4" />
    </svg>
  );
}

// 聚焦视图：放大到当前割草区域，展示机器位置标记与工作路径
// 聚焦视图中的临时障碍物（PRD §10）：标记位置、未割区域与类型（人 / 物体）
const OBSTACLES: { x: number; y: number; type: 'person' | 'object'; label: string }[] = [
  { x: 96, y: 110, type: 'person', label: '人' },
  { x: 212, y: 168, type: 'object', label: '玩具' },
  { x: 150, y: 232, type: 'object', label: '花盆' },
];

function WorkingMap({
  areaName,
  cuttingMode,
  status,
}: {
  areaName: string;
  cuttingMode: 'full' | 'edge';
  status: MachineStatus;
}) {
  // 割草进度（demo：全区域 45%，仅边缘 60%）
  const progress = status === 'locating' ? 0 : cuttingMode === 'edge' ? 0.6 : 0.45;
  const lawn = { x: 16, y: 16, w: 268, h: 268, r: 22 };

  // 机器位置：全区域模式沿车道横向推进，仅边缘模式沿外周环绕行
  let machineX = lawn.x + 8;
  let machineY = lawn.y;
  if (cuttingMode === 'edge') {
    const p = pointOnPerimeter(progress, lawn, 18);
    machineX = p.x;
    machineY = p.y;
  } else {
    const lanes = 9;
    const laneStep = lawn.h / lanes;
    const currentLane = Math.min(lanes, Math.floor(progress * lanes));
    machineY = lawn.y + currentLane * laneStep + laneStep / 2;
    machineX = currentLane % 2 === 0 ? lawn.x + 8 : lawn.x + lawn.w - 8;
  }

  // 仅边缘模式：外周边界（向内收缩）
  const inset = 18;
  const edgeRect = {
    x: lawn.x + inset,
    y: lawn.y + inset,
    w: lawn.w - 2 * inset,
    h: lawn.h - 2 * inset,
    r: Math.max(6, lawn.r - inset),
  };
  const edgePerim = 2 * (edgeRect.w + edgeRect.h);
  const edgeDone = edgePerim * progress;

  return (
    <svg width="100%" height="100%" viewBox="0 0 300 300" fill="none" preserveAspectRatio="xMidYMid slice">
      <defs>
        <clipPath id="lawnClip">
          <rect x={lawn.x} y={lawn.y} width={lawn.w} height={lawn.h} rx={lawn.r} />
        </clipPath>
      </defs>

      <rect width="300" height="300" fill="#EAF6E8" />

      {/* 草坪区域 */}
      <rect x={lawn.x} y={lawn.y} width={lawn.w} height={lawn.h} rx={lawn.r} fill="#DFF3DC" stroke="#4CAF50" strokeWidth="2.5" />

      {cuttingMode === 'full' ? (
        <FullAreaPath lawn={lawn} progress={progress} />
      ) : (
        <g clipPath="url(#lawnClip)">
          {/* 规划边缘轨迹（虚线） */}
          <rect
            x={edgeRect.x}
            y={edgeRect.y}
            width={edgeRect.w}
            height={edgeRect.h}
            rx={edgeRect.r}
            fill="none"
            stroke="#86EFAC"
            strokeWidth="3"
            strokeDasharray="5 5"
          />
          {/* 已完成的边缘轨迹（实线，按进度截取） */}
          <rect
            x={edgeRect.x}
            y={edgeRect.y}
            width={edgeRect.w}
            height={edgeRect.h}
            rx={edgeRect.r}
            fill="none"
            stroke="#16A34A"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${edgeDone} ${edgePerim}`}
          />
        </g>
      )}

      {/* 区域标题 */}
      <text x={lawn.x + 12} y={lawn.y + 22} fill="#15803D" fontSize="13" fontWeight="800">{areaName}</text>

      {/* 障碍物标记（含类型：人 / 物体），仅割草中显示 */}
      {status === 'mowing' && (
        <g clipPath="url(#lawnClip)">
          {OBSTACLES.map((o) => {
            const color = o.type === 'person' ? '#EF4444' : '#F59E0B';
            return (
              <g key={o.label}>
                {/* 临时未割区域 */}
                <circle cx={o.x} cy={o.y} r="20" fill={color} opacity="0.10" />
                <circle cx={o.x} cy={o.y} r="20" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
                {/* 障碍物图标 */}
                <circle cx={o.x} cy={o.y} r="10" fill={color} stroke="white" strokeWidth="2.5" />
                {o.type === 'person' ? (
                  <g fill="white">
                    <circle cx={o.x} cy={o.y - 3} r="2.3" />
                    <path d={`M${o.x - 3.6} ${o.y + 4.2} a3.6 3.6 0 0 1 7.2 0 z`} />
                  </g>
                ) : (
                  <rect x={o.x - 3.2} y={o.y - 3.2} width="6.4" height="6.4" rx="1.2" fill="white" />
                )}
                {/* 类型标签 */}
                <g transform={`translate(${o.x - 16}, ${o.y + 13})`}>
                  <rect width="32" height="15" rx="7.5" fill="rgba(15,23,42,0.85)" />
                  <text x="16" y="11" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">{o.label}</text>
                </g>
              </g>
            );
          })}
        </g>
      )}

      {/* 机器位置标记 */}
      {status !== 'locating' && (
        <g>
          <circle cx={machineX} cy={machineY} r="16" fill="#00A7E1" opacity="0.18" className="animate-ping" />
          <circle cx={machineX} cy={machineY} r="11" fill="#00A7E1" opacity="0.30" />
          <circle cx={machineX} cy={machineY} r="8" fill="#00A7E1" stroke="white" strokeWidth="2.5" />
          <path d={`M${machineX} ${machineY - 3} l3 5 l-6 0 z`} fill="white" />
        </g>
      )}

      {/* 定位中提示 */}
      {status === 'locating' && (
        <g>
          <circle cx={lawn.x + lawn.w / 2} cy={lawn.y + lawn.h / 2} r="22" fill="none" stroke="#6366F1" strokeWidth="3" strokeDasharray="6 5" className="animate-spin" style={{ transformOrigin: 'center' }} />
          <circle cx={lawn.x + lawn.w / 2} cy={lawn.y + lawn.h / 2} r="7" fill="#6366F1" />
        </g>
      )}
    </svg>
  );
}

// 全区域 N 形往复割草路径
function FullAreaPath({ lawn, progress }: { lawn: { x: number; y: number; w: number; h: number; r: number }; progress: number }) {
  const lanes = 9;
  const laneStep = lawn.h / lanes;
  const laneYs = Array.from({ length: lanes + 1 }, (_, i) => lawn.y + i * laneStep);
  const currentLane = Math.min(lanes, Math.floor(progress * lanes));
  const mowedH = lawn.h * progress;

  return (
    <g clipPath="url(#lawnClip)">
      {/* 已割区域（上半部分，更亮的绿色） */}
      <rect x={lawn.x} y={lawn.y} width={lawn.w} height={mowedH} fill="#BBF7D0" opacity="0.9" />

      {/* N 形往复割草路径 */}
      {laneYs.slice(0, -1).map((y, i) => {
        const laneProgress = progress * lanes - i;
        const drawn = Math.min(1, Math.max(0, laneProgress));
        const reverse = i % 2 === 1;
        const startX = reverse ? lawn.x + lawn.w : lawn.x;
        const endX = startX + (reverse ? -1 : 1) * lawn.w * drawn;
        const fullyDone = drawn >= 1;
        return (
          <line
            key={i}
            x1={startX}
            y1={y + laneStep / 2}
            x2={endX}
            y2={y + laneStep / 2}
            stroke={fullyDone ? '#22C55E' : '#16A34A'}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={fullyDone ? 0.85 : 1}
          />
        );
      })}
      {/* 车道之间的连接（让路径看起来连续） */}
      {laneYs.slice(0, -1).map((y, i) => {
        if (i >= currentLane) return null;
        const isRight = i % 2 === 0;
        return (
          <line
            key={`c${i}`}
            x1={isRight ? lawn.x + lawn.w : lawn.x}
            y1={y + laneStep / 2}
            x2={isRight ? lawn.x + lawn.w : lawn.x}
            y2={y + laneStep + laneStep / 2}
            stroke="#22C55E"
            strokeWidth="2.5"
            opacity="0.85"
          />
        );
      })}
    </g>
  );
}

// 沿矩形外周（向内收缩 inset）按进度比例取机器位置，顺时针从左上角出发
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

function MapButton({ icon: Icon, label, onClick }: { icon: typeof Calendar; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[0_4px_12px_rgba(15,23,42,0.12)]" aria-label={label} title={label}>
      <Icon size={18} strokeWidth={2} className="text-[#00A7E1]" />
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-white/92 px-3 py-2 shadow-sm">
      <div className="text-[10px] font-medium text-[#6B7280]">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-[#111827]">{value}</div>
    </div>
  );
}
