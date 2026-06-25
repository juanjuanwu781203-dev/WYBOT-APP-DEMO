import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Bluetooth,
  Calendar,
  ChevronDown,
  ChevronRight,
  Gamepad2,
  History,
  Loader2,
  Settings,
  Sun,
  Unlock,
  Wifi,
  X,
  ZoomIn,
} from 'lucide-react';
import { StatusBar } from './StatusBar';
import { cleaningModesC2ProVision } from '../data/mockData';
import {
  deviceControlAiVisualIcon,
  deviceControlDeviceInfoIcon,
  resolveCleaningModeImage,
  shouldHideCleaningModeLabel,
  type DeviceCleaningModeId,
} from '../config/deviceControlAssets';

const SKY_BLUE = '#00C2FF';
const BATTERY_GREEN = '#22C55E';

type WorkingStatus =
  | 'Cleaning in progress'
  | 'Returning to station'
  | 'Mapping in progress'
  | 'Map Optimization in Progress'
  | 'Charging on station'
  | 'Underwater standby'
  | 'Checking status...'
  | 'Standby on station'
  | 'Area cleaning'
  | 'Map in progress'
  | 'Running alert'
  | 'Battery too low'
  | 'Running Fusion Diagnostics'
  | 'Underwater communication lost'
  | 'Robot not on station'
  | 'Docking contact not detected'
  | 'Entering water'
  | 'Exiting to shore';

const WORKING_STATUSES: WorkingStatus[] = [
  'Cleaning in progress',
  'Entering water',
  'Exiting to shore',
  'Returning to station',
  'Mapping in progress',
  'Map Optimization in Progress',
  'Charging on station',
  'Underwater standby',
  'Checking status...',
  'Standby on station',
  'Area cleaning',
  'Map in progress',
  'Running alert',
  'Battery too low',
  'Running Fusion Diagnostics',
  'Underwater communication lost',
  'Robot not on station',
  'Docking contact not detected',
];

/** Active statuses that trigger spinning gear indicator */
const ACTIVE_STATUSES: WorkingStatus[] = [
  'Cleaning in progress',
  'Entering water',
  'Exiting to shore',
  'Returning to station',
  'Mapping in progress',
  'Map Optimization in Progress',
  'Area cleaning',
  'Map in progress',
  'Running Fusion Diagnostics',
];

const ACTION_BTN_IDLE = {
  background: '#FFFFFF',
  borderColor: 'transparent',
  color: '#111827',
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
} as const;

const ACTION_BTN_PRIMARY = {
  background: SKY_BLUE,
  borderColor: SKY_BLUE,
  color: '#FFFFFF',
  boxShadow: '0 4px 14px rgba(0, 194, 255, 0.3)',
} as const;

/** 运行中 / 已点亮：全蓝填充 */
const ACTION_BTN_ACTIVE = ACTION_BTN_PRIMARY;

const BLOCKED_START_STATUSES: WorkingStatus[] = [
  'Robot not on station',
  'Docking contact not detected',
];

const ALREADY_CLEANING_STATUSES: WorkingStatus[] = [
  'Entering water',
  'Cleaning in progress',
  'Area cleaning',
];

type ExitPoolState = 'idle' | 'stabilizing' | 'exiting';
type ReleaseState = 'locked' | 'releasing' | 'released';
type StartAlert = 'not-on-station' | 'bad-contact' | null;
type ConnectionScenario = 'normal' | 'station-offline' | 'robot-offline';

const CONNECTION_SCENARIOS: { id: ConnectionScenario; label: string; hint: string }[] = [
  { id: 'normal', label: 'Normal', hint: '手机、桩、机器均在线' },
  { id: 'station-offline', label: 'Station offline', hint: '手机和机器在线，充电桩离线' },
  { id: 'robot-offline', label: 'Robot offline', hint: '手机和桩在线，机器无水声通信或无网络' },
];

function BatteryLevelIcon({ percent, size = 18 }: { percent: number; size?: number }) {
  const p = Math.min(100, Math.max(0, percent));
  const innerW = 12;
  const fillW = Math.max((innerW * p) / 100, p > 0 ? 0.4 : 0);
  const color = p > 30 ? BATTERY_GREEN : '#EF4444';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      {p > 0 && <rect x="4" y="9" width={fillW} height="6" rx="1" fill={color} />}
      <rect x="2" y="7" width="16" height="10" rx="2" stroke="#D1D5DB" strokeWidth="2" />
      <path d="M22 10v4" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${
        checked ? 'bg-[#00C2FF]' : 'bg-[#E5E7EB]'
      }`}
    >
      <span
        className={`pointer-events-none absolute left-[3px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/** Kidney-shaped 3D pool SVG map */
function PoolMap({ mapReady }: { mapReady: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 340 220"
        className="w-full max-h-full"
        style={{ filter: 'drop-shadow(0 6px 20px rgba(0,150,200,0.22))' }}
      >
        <defs>
          <linearGradient id="c3waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93D5F0" />
            <stop offset="45%" stopColor="#4BBDE8" />
            <stop offset="100%" stopColor="#6FCBEA" />
          </linearGradient>
          <radialGradient id="c3gloss" cx="38%" cy="32%" r="58%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="c3edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D8D8D8" />
            <stop offset="100%" stopColor="#E8E8E8" />
          </linearGradient>
          {/* Subtle pattern for "3D depth" feel */}
          <radialGradient id="c3depth" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,100,160,0.08)" />
            <stop offset="100%" stopColor="rgba(0,80,140,0.18)" />
          </radialGradient>
        </defs>

        {/* Pool surround / deck */}
        <path
          d="M28,115 C25,56 78,15 140,20 C172,22 190,8 222,16 C268,28 310,62 308,112 C306,162 272,182 228,184 C192,186 164,196 118,186 C70,174 30,174 28,115 Z"
          fill="url(#c3edgeGrad)"
        />
        {/* Pool inner water */}
        <path
          d="M48,113 C45,63 92,30 143,35 C172,37 190,23 220,31 C258,42 292,72 290,112 C288,153 258,170 220,172 C186,174 162,183 122,174 C80,164 50,163 48,113 Z"
          fill="url(#c3waterGrad)"
        />
        {/* Depth overlay */}
        <path
          d="M48,113 C45,63 92,30 143,35 C172,37 190,23 220,31 C258,42 292,72 290,112 C288,153 258,170 220,172 C186,174 162,183 122,174 C80,164 50,163 48,113 Z"
          fill="url(#c3depth)"
        />
        {/* Gloss highlight */}
        <path
          d="M48,113 C45,63 92,30 143,35 C172,37 190,23 220,31 C258,42 292,72 290,112 C288,153 258,170 220,172 C186,174 162,183 122,174 C80,164 50,163 48,113 Z"
          fill="url(#c3gloss)"
        />

        {/* Water ripple rings */}
        <ellipse cx="158" cy="100" rx="46" ry="22" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="2" />
        <ellipse cx="225" cy="76" rx="28" ry="13" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <ellipse cx="108" cy="138" rx="24" ry="11" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
        <ellipse cx="258" cy="130" rx="19" ry="9" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
        <ellipse cx="170" cy="56" rx="15" ry="7" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1" />

        {/* Light patches on water surface */}
        <path d="M122,95 Q140,87 158,95 Q146,106 122,95 Z" fill="rgba(255,255,255,0.22)" />
        <path d="M205,128 Q220,122 232,130 Q220,137 205,128 Z" fill="rgba(255,255,255,0.18)" />
        <path d="M245,82 Q258,76 268,84 Q259,90 245,82 Z" fill="rgba(255,255,255,0.15)" />

        {/* Robot position indicator (visible when map ready) */}
        {mapReady && (
          <g transform="translate(175, 108)">
            <circle r="6" fill="white" opacity="0.9" />
            <circle r="4" fill={SKY_BLUE} />
            <circle r="8" fill="none" stroke={SKY_BLUE} strokeWidth="1.5" opacity="0.5" />
          </g>
        )}
      </svg>
    </div>
  );
}

interface C3ProDevicePageProps {
  robotImage: string;
  onBack: () => void;
  onOpenDeviceInfo: () => void;
  onOpenPoolSetup: () => void;
  onOpenRemoteControl: () => void;
  onOpenMapSettings: () => void;
  onOpenWeeklyCleaning: () => void;
  onOpenCleaningHistory: () => void;
  returnToShore: boolean;
  onReturnToShoreChange: (value: boolean) => void;
}

export const C3ProDevicePage = ({
  robotImage,
  onBack,
  onOpenDeviceInfo,
  onOpenPoolSetup,
  onOpenRemoteControl,
  onOpenMapSettings,
  onOpenWeeklyCleaning,
  onOpenCleaningHistory,
  returnToShore,
  onReturnToShoreChange,
}: C3ProDevicePageProps) => {
  const [connectionScenario, setConnectionScenario] = useState<ConnectionScenario>('normal');
  const [workingStatus, setWorkingStatus] = useState<WorkingStatus>('Underwater standby');
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [startCleaningActive, setStartCleaningActive] = useState(false);
  const [exitPoolState, setExitPoolState] = useState<ExitPoolState>('idle');
  const [aiVisual, setAiVisual] = useState(false);
  const [cleaningMode, setCleaningMode] = useState<DeviceCleaningModeId>('wall-floor');
  const [cleaningModeSheetOpen, setCleaningModeSheetOpen] = useState(false);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [cleanedArea, setCleanedArea] = useState(0);
  const [releaseState, setReleaseState] = useState<ReleaseState>('locked');
  const [startAlert, setStartAlert] = useState<StartAlert>(null);
  const [cleaningToast, setCleaningToast] = useState(false);
  const [connectionRetryTimedOut, setConnectionRetryTimedOut] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enteringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleaningToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const batteryPercent = 53;
  const stationOnline = connectionScenario !== 'station-offline';
  const robotOnline = connectionScenario !== 'robot-offline';
  const stationReconnecting = !stationOnline && !connectionRetryTimedOut;
  const robotReconnecting = !robotOnline;
  const robotControlLocked = !robotOnline;
  const stationControlLocked = !stationOnline;
  const displayStatus = robotReconnecting ? 'Robot reconnecting...' : workingStatus;
  const isActive = robotReconnecting || ACTIVE_STATUSES.includes(workingStatus);
  const mapReady = workingStatus === 'Map Optimization in Progress' || workingStatus === 'Cleaning in progress';
  const isWorkCounting =
    robotOnline &&
    (startCleaningActive ||
      workingStatus === 'Entering water' ||
      workingStatus === 'Cleaning in progress' ||
      workingStatus === 'Area cleaning');

  const handleExitPool = () => {
    if (robotControlLocked || stationControlLocked) return;
    if (exitPoolState === 'idle') {
      setWorkingStatus(returnToShore ? 'Exiting to shore' : 'Returning to station');
      setExitPoolState('stabilizing');
      exitTimerRef.current = setTimeout(() => {
        setExitPoolState('exiting');
      }, 3000);
    } else {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      setExitPoolState('idle');
      if (workingStatus === 'Exiting to shore' || workingStatus === 'Returning to station') {
        setWorkingStatus('Underwater standby');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (enteringTimerRef.current) clearTimeout(enteringTimerRef.current);
      if (cleaningToastTimerRef.current) clearTimeout(cleaningToastTimerRef.current);
      if (connectionRetryTimerRef.current) clearTimeout(connectionRetryTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setConnectionRetryTimedOut(false);
    if (connectionRetryTimerRef.current) clearTimeout(connectionRetryTimerRef.current);
    if (connectionScenario === 'normal') return;

    connectionRetryTimerRef.current = setTimeout(() => {
      setConnectionRetryTimedOut(true);
    }, 2000);

    return () => {
      if (connectionRetryTimerRef.current) {
        clearTimeout(connectionRetryTimerRef.current);
        connectionRetryTimerRef.current = null;
      }
    };
  }, [connectionScenario]);

  const showAlreadyCleaningToast = () => {
    setCleaningToast(true);
    if (cleaningToastTimerRef.current) clearTimeout(cleaningToastTimerRef.current);
    cleaningToastTimerRef.current = setTimeout(() => {
      setCleaningToast(false);
      cleaningToastTimerRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    if (!isWorkCounting) return;
    const timer = setInterval(() => {
      setWorkSeconds((prev) => prev + 1);
      setCleanedArea((prev) => Number((prev + 0.8).toFixed(1)));
    }, 1000);
    return () => clearInterval(timer);
  }, [isWorkCounting]);

  const floorIcon = resolveCleaningModeImage(cleaningMode, aiVisual);
  const rawLabel = cleaningModesC2ProVision.find((m) => m.id === cleaningMode)?.label ?? 'Floor';
  const cleaningModeLabel = rawLabel.replace(/:\s*$/, '').replace(/\([^)]*\)/g, '').trim();
  const workDuration = `${Math.floor(workSeconds / 60)}:${String(workSeconds % 60).padStart(2, '0')}`;

  const returnToDockLabel =
    exitPoolState === 'exiting' ? 'Pause Return' : 'Return to Dock';
  const exitPoolActive = exitPoolState !== 'idle';
  const stationConnectionLost = workingStatus === 'Underwater communication lost' || !robotOnline || !stationOnline;
  const robotOnShore = workingStatus === 'Charging on station' || workingStatus === 'Standby on station';
  const robotUnderwater = !robotOnShore;
  const underwaterCommsActive = robotUnderwater && !stationConnectionLost;
  const releaseButtonLabel =
    releaseState === 'releasing' ? 'Releasing...' : releaseState === 'released' ? 'Released' : 'Release Robot';
  const stationConnectionAlert =
    !stationOnline && connectionRetryTimedOut ? '充电桩连接失败，请查看充电桩电源以及网络状态。' : null;
  const robotConnectionAlert =
    !robotOnline && connectionRetryTimedOut ? '机器重连超时，请确认机器水声通信或网络连接状态。' : null;
  const stationStartAlert =
    startAlert === 'not-on-station'
      ? 'Robot is not on the station. Place it on the station before starting.'
      : startAlert === 'bad-contact'
      ? 'Docking contact not detected. Adjust the robot position and try again.'
      : null;

  const handleReleaseRobot = () => {
    if (releaseState !== 'locked') return;
    setReleaseState('releasing');
    setTimeout(() => setReleaseState('released'), 1200);
  };

  const handleStartCleaning = () => {
    if (robotControlLocked || stationControlLocked) return;
    if (BLOCKED_START_STATUSES.includes(workingStatus)) {
      setStartAlert(workingStatus === 'Robot not on station' ? 'not-on-station' : 'bad-contact');
      setTimeout(() => setStartAlert(null), 3500);
      return;
    }
    if (
      startCleaningActive ||
      ALREADY_CLEANING_STATUSES.includes(workingStatus)
    ) {
      showAlreadyCleaningToast();
      return;
    }
    setStartAlert(null);
    setStartCleaningActive(true);
    if (enteringTimerRef.current) {
      clearTimeout(enteringTimerRef.current);
      enteringTimerRef.current = null;
    }
    setWorkingStatus('Entering water');
  };

  useEffect(() => {
    if (!robotOnline || !startCleaningActive || workingStatus !== 'Entering water') return;
    enteringTimerRef.current = setTimeout(() => {
      setWorkingStatus('Cleaning in progress');
      enteringTimerRef.current = null;
    }, 3500);
    return () => {
      if (enteringTimerRef.current) {
        clearTimeout(enteringTimerRef.current);
        enteringTimerRef.current = null;
      }
    };
  }, [startCleaningActive, workingStatus]);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#F5F6F8]">
      <StatusBar time="15:28" battery="53%" />

      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 px-4 pb-1 pt-0">
        <button type="button" onClick={onBack} className="p-0.5" aria-label="返回">
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <span className="truncate text-[16px] font-semibold leading-tight text-[#111827]">WYBOT C3PRO</span>
          <button type="button" onClick={onOpenDeviceInfo} className="-ml-px p-0.5" aria-label="设备信息">
            <img
              src={deviceControlDeviceInfoIcon.src}
              srcSet={deviceControlDeviceInfoIcon.srcSet}
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] shrink-0 object-contain"
              draggable={false}
            />
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenPoolSetup}
          disabled={robotControlLocked}
          className={`flex shrink-0 items-center gap-0.5 text-[13px] font-medium transition-opacity active:opacity-80 disabled:opacity-40 ${
            robotControlLocked ? 'text-[#94A3B8]' : 'text-[#2555D1]'
          }`}
        >
          Pool Setup
          <ChevronRight
            size={16}
            strokeWidth={2}
            className={robotControlLocked ? 'text-[#94A3B8]' : 'text-[#2555D1]'}
            aria-hidden
          />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-4 pb-2">

          {/* Robot-first status card */}
          <div
            className="flex w-full shrink-0 flex-col gap-2 rounded-[18px] bg-white p-3.5"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#F0FAFF]">
                <div className="absolute bottom-2.5 h-2.5 w-12 rounded-full bg-[#00C2FF]/20" />
                <img
                  src={robotImage}
                  alt="WYBOT C3PRO"
                  className="relative z-10 max-h-[66px] max-w-[68px] object-contain"
                  draggable={false}
                />
                <button
                  type="button"
                  onClick={onOpenCleaningHistory}
                  className="absolute right-1 top-1 z-20 rounded-full bg-white p-0.5 shadow-sm transition-opacity active:opacity-70"
                  aria-label="清洁历史"
                >
                  <History
                    size={13}
                    strokeWidth={2.5}
                    className="text-[#666]"
                  />
                </button>
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStatusSheetOpen(true)}
                    className="flex max-w-full items-center gap-1 transition-opacity active:opacity-70"
                  >
                    {isActive && (
                      <Loader2
                        size={14}
                        strokeWidth={2.5}
                        className="shrink-0 animate-spin text-[#00C2FF]"
                        aria-hidden
                      />
                    )}
                    <span className="min-w-0 text-left text-[14px] font-semibold leading-tight text-[#111827]">
                      {displayStatus}
                    </span>
                    <ChevronDown size={13} strokeWidth={2.5} className="shrink-0 text-[#374151]" aria-hidden />
                  </button>
                </div>

                <div className="flex min-w-0 flex-col items-end gap-1">
                  {robotUnderwater && (
                    <div
                      className="flex max-w-full items-center gap-1.5 pr-0.5"
                      title={underwaterCommsActive ? '机器与桩水下通信正常' : '机器与桩水下通信中断'}
                      aria-label={underwaterCommsActive ? '机器与桩水下通信正常' : '机器与桩水下通信中断'}
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          underwaterCommsActive ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                        }`}
                        aria-hidden
                      />
                      <span className="text-[11px] font-medium leading-none text-[#64748B]">Underwater Commu</span>
                    </div>
                  )}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Bluetooth
                      size={17}
                      strokeWidth={2.5}
                      className={robotOnline ? 'text-[#2555D1]' : 'text-[#9CA3AF]'}
                      aria-hidden
                    />
                    <Wifi
                      size={17}
                      strokeWidth={2.5}
                      className={robotOnline ? 'text-[#2555D1]' : 'text-[#9CA3AF]'}
                      aria-hidden
                    />
                    <Sun
                      size={15}
                      strokeWidth={2}
                      className="text-[#F59E0B]"
                      aria-hidden
                    />
                    <span
                      className="text-[12px] font-semibold tabular-nums"
                      style={{ color: batteryPercent > 30 ? '#374151' : '#EF4444' }}
                    >
                      {batteryPercent}%
                    </span>
                    <BatteryLevelIcon percent={batteryPercent} size={18} />
                  </div>
                </div>
              </div>
            </div>
            {robotConnectionAlert && (
              <div className="flex items-start gap-1.5 rounded-[10px] bg-[#FEF2F2] px-2.5 py-2 text-[#B91C1C]">
                <AlertTriangle size={13} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                <span className="text-[11px] font-medium leading-snug">{robotConnectionAlert}</span>
              </div>
            )}
          </div>

          <div
            className="flex shrink-0 flex-col gap-2.5 rounded-[16px] bg-white p-3.5"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-semibold text-[#111827]">Station</p>
              <div
                className="flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{ background: stationOnline ? '#DCFCE7' : '#FEF2F2' }}
              >
                {stationReconnecting ? (
                  <Loader2 size={10} strokeWidth={2.5} className="animate-spin text-[#EF4444]" />
                ) : (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: stationOnline ? '#22C55E' : '#EF4444' }}
                  />
                )}
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: stationOnline ? '#15803D' : '#B91C1C' }}
                >
                  {stationOnline ? 'Online' : stationReconnecting ? 'Reconnecting' : 'Offline'}
                </span>
              </div>
            </div>
            <div
              className={`flex gap-1 rounded-[10px] bg-[#F3F4F6] p-1 ${stationControlLocked ? 'opacity-55' : ''}`}
              role="tablist"
              aria-label="回桩充电方式"
            >
              <button
                type="button"
                role="tab"
                aria-selected={returnToShore}
                disabled={stationControlLocked}
                onClick={() => onReturnToShoreChange(true)}
                className={`min-w-0 flex-1 rounded-[8px] px-2 py-2 text-center text-[11px] font-semibold leading-snug transition-colors disabled:cursor-not-allowed ${
                  returnToShore ? 'bg-white text-[#111827] shadow-sm' : 'text-[#64748B]'
                }`}
              >
                回桩后上岸充电
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!returnToShore}
                disabled={stationControlLocked}
                onClick={() => onReturnToShoreChange(false)}
                className={`min-w-0 flex-1 rounded-[8px] px-2 py-2 text-center text-[11px] font-semibold leading-snug transition-colors disabled:cursor-not-allowed ${
                  !returnToShore ? 'bg-white text-[#111827] shadow-sm' : 'text-[#64748B]'
                }`}
              >
                回桩后水下充电
              </button>
            </div>

            {stationConnectionAlert && (
              <div className="flex items-start gap-1.5 rounded-[10px] bg-[#FEF2F2] px-2.5 py-2 text-[#B91C1C]">
                <AlertTriangle size={13} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                <span className="text-[11px] font-medium leading-snug">{stationConnectionAlert}</span>
              </div>
            )}

            {(robotOnShore || robotControlLocked) && (
              <button
                type="button"
                onClick={handleReleaseRobot}
                disabled={releaseState !== 'locked' || !stationOnline}
                className="flex w-full items-center justify-center gap-1.5 rounded-[12px] py-2 text-[12px] font-semibold transition-opacity active:opacity-80 disabled:opacity-70"
                style={{
                  background: releaseState === 'released' ? '#DCFCE7' : '#EAF8FF',
                  color: releaseState === 'released' ? '#15803D' : '#0080FF',
                }}
              >
                {releaseState === 'releasing' ? (
                  <Loader2 size={14} strokeWidth={2.4} className="animate-spin" />
                ) : (
                  <Unlock size={14} strokeWidth={2.4} />
                )}
                {releaseButtonLabel}
              </button>
            )}
          </div>

          {stationStartAlert && (
            <div className="flex shrink-0 items-start gap-2 rounded-[14px] bg-[#FFF7ED] px-3 py-2 text-[#C2410C]">
              <AlertTriangle size={15} strokeWidth={2.4} className="mt-0.5 shrink-0" />
              <span className="text-[11px] font-medium leading-snug">{stationStartAlert}</span>
            </div>
          )}

          {!stationConnectionAlert && !robotConnectionAlert && (stationReconnecting || robotReconnecting) && (
            <div className="flex shrink-0 items-start gap-2 rounded-[14px] bg-[#EAF8FF] px-3 py-2 text-[#0369A1]">
              <Loader2 size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 animate-spin" />
              <span className="text-[11px] font-medium leading-snug">
                {stationReconnecting
                  ? 'Station reconnecting...'
                  : 'Robot reconnecting. Most controls are temporarily unavailable.'}
              </span>
            </div>
          )}

          {/* Pool map area */}
          <div
            className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] ${
              robotControlLocked ? 'opacity-60' : ''
            }`}
            style={{ background: '#EBF6FC', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
          >
            <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-3rem)] items-center gap-2 rounded-[10px] bg-white/88 px-2 py-1 shadow-sm backdrop-blur-sm">
              <div className="flex min-w-0 items-baseline gap-1">
                <span className="shrink-0 text-[9px] font-medium text-[#64748B]">Time</span>
                <span className="text-[12px] font-semibold tabular-nums leading-none text-[#111827]">
                  {workDuration}
                </span>
              </div>
              <span className="h-3 w-px shrink-0 bg-[#E2E8F0]" aria-hidden />
              <div className="flex min-w-0 items-baseline gap-1">
                <span className="shrink-0 text-[9px] font-medium text-[#64748B]">Area</span>
                <span className="text-[12px] font-semibold tabular-nums leading-none text-[#111827]">
                  {cleanedArea.toFixed(1)} m²
                </span>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center p-3 pb-10">
              <PoolMap mapReady={mapReady} />
            </div>
            {/* Zoom + Settings icons */}
            <div className="absolute bottom-2 right-2 flex gap-1.5">
              <button
                type="button"
                disabled={robotControlLocked}
                className="rounded-full bg-white/85 p-1.5 shadow-sm backdrop-blur-sm transition-opacity active:opacity-70"
                aria-label="放大地图"
              >
                <ZoomIn size={16} strokeWidth={2} className="text-[#374151]" />
              </button>
              <button
                type="button"
                onClick={onOpenMapSettings}
                disabled={robotControlLocked}
                className="rounded-full bg-white/85 p-1.5 shadow-sm backdrop-blur-sm transition-opacity active:opacity-70 disabled:opacity-45"
                aria-label="地图设置"
              >
                <Settings size={16} strokeWidth={2} className="text-[#374151]" />
              </button>
            </div>
          </div>

          {/* Info text */}
          <p className="shrink-0 px-1 text-[11px] leading-snug text-[#6B7280]">
            The 3D map is still improving. It will get more accurate after a few full cleanings.
          </p>

          {/* Action buttons 2×2 */}
          <div className="grid shrink-0 grid-cols-2 gap-2">
            {/* Start Cleaning */}
            <button
              type="button"
              onClick={handleStartCleaning}
              disabled={robotControlLocked || stationControlLocked}
              className="flex h-[52px] items-center justify-center gap-1.5 rounded-[14px] border-2 px-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed"
              style={
                robotControlLocked || stationControlLocked
                  ? {
                      background: '#F3F4F6',
                      borderColor: 'transparent',
                      color: '#94A3B8',
                      boxShadow: 'none',
                    }
                  : stationStartAlert
                  ? {
                      background: '#FFF7ED',
                      borderColor: '#FDBA74',
                      color: '#C2410C',
                      boxShadow: '0 4px 14px rgba(251,146,60,0.18)',
                    }
                  : startCleaningActive
                  ? ACTION_BTN_IDLE
                  : ACTION_BTN_PRIMARY
              }
            >
              {stationStartAlert ? 'Check Docking' : 'Start Cleaning'}
            </button>

            {/* Exit Pool */}
            <button
              type="button"
              onClick={handleExitPool}
              disabled={robotControlLocked || stationControlLocked}
              className="flex h-[52px] items-center justify-center gap-1.5 rounded-[14px] border-2 px-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed"
              style={
                robotControlLocked || stationControlLocked
                  ? { background: '#F3F4F6', borderColor: 'transparent', color: '#94A3B8', boxShadow: 'none' }
                  : exitPoolActive
                  ? ACTION_BTN_ACTIVE
                  : ACTION_BTN_IDLE
              }
            >
              {returnToDockLabel}
            </button>

            {/* Remote Control */}
            <button
              type="button"
              onClick={onOpenRemoteControl}
              disabled={robotControlLocked}
              className="flex h-[52px] items-center justify-center gap-1.5 rounded-[14px] bg-white px-2 text-[13px] font-semibold text-[#111827] transition-opacity active:opacity-80 disabled:cursor-not-allowed"
              style={
                robotControlLocked
                  ? { background: '#F3F4F6', color: '#94A3B8', boxShadow: 'none' }
                  : { boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }
              }
            >
              <Gamepad2 size={17} strokeWidth={2} className="shrink-0" aria-hidden />
              Remote Control
            </button>

            {/* Weekly Cleaning */}
            <button
              type="button"
              onClick={onOpenWeeklyCleaning}
              disabled={robotControlLocked}
              className="flex h-[52px] items-center justify-center gap-1.5 rounded-[14px] border-2 border-transparent bg-white px-2 text-[13px] font-semibold text-[#111827] transition-opacity active:opacity-80 disabled:cursor-not-allowed"
              style={
                robotControlLocked
                  ? { background: '#F3F4F6', color: '#94A3B8', boxShadow: 'none' }
                  : { boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }
              }
            >
              <Calendar size={16} strokeWidth={2} className="shrink-0" aria-hidden />
              Weekly Cleaning
            </button>
          </div>
        </div>

        {/* Cleaning Mode — pinned to bottom */}
        <div className="shrink-0 border-t border-[#E8EAED] bg-[#F5F6F8] px-4 pb-3 pt-2">
          <div
            className={`rounded-[16px] bg-white px-3 py-2 ${robotControlLocked ? 'opacity-60' : ''}`}
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
          >
            <div className="mb-1.5 text-[12px] font-semibold text-[#111827]">Cleaning Mode</div>
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <img
                    src={deviceControlAiVisualIcon.src}
                    srcSet={deviceControlAiVisualIcon.srcSet}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] shrink-0 object-contain"
                    draggable={false}
                  />
                  <span className="truncate text-[12px] font-medium text-[#111827]">AI Visual Cleaning</span>
                </div>
                <ToggleSwitch checked={aiVisual} onChange={robotControlLocked ? () => undefined : setAiVisual} />
              </div>
              <div className="h-9 w-px shrink-0 bg-[#E5E7EB]" aria-hidden />
              <button
                type="button"
                onClick={() => setCleaningModeSheetOpen(true)}
                disabled={robotControlLocked}
                className="flex min-w-0 max-w-[52%] shrink-0 items-center gap-1 rounded-[12px] py-1 pl-0.5 pr-0 transition-opacity active:opacity-80 disabled:cursor-not-allowed"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F3F4F6]">
                  <img
                    src={floorIcon.src}
                    srcSet={floorIcon.srcSet}
                    alt=""
                    className="h-6 w-6 object-contain"
                    draggable={false}
                  />
                </div>
                <span className="min-w-0 truncate text-left text-[11px] font-semibold leading-tight text-[#111827]">
                  {cleaningModeLabel}
                </span>
                <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-[#999999]" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Working Status bottom sheet */}
      {statusSheetOpen && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-40 bg-black/45"
            aria-label="关闭"
            onClick={() => setStatusSheetOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 flex max-h-[58%] flex-col rounded-t-[20px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex shrink-0 items-center justify-between border-b border-[#F0F0F0] px-4 py-3">
              <span className="text-[16px] font-semibold text-[#111827]">Device Status</span>
              <button
                type="button"
                onClick={() => setStatusSheetOpen(false)}
                className="rounded-full p-1 text-[#666666] transition-opacity active:opacity-70"
                aria-label="关闭"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-1">
              <div className="border-b border-[#F5F5F5] py-3">
                <div className="mb-2 text-[12px] font-semibold text-[#64748B]">Connection Scenario</div>
                <div className="flex flex-col gap-2">
                  {CONNECTION_SCENARIOS.map((scenario) => {
                    const selected = connectionScenario === scenario.id;
                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        onClick={() => setConnectionScenario(scenario.id)}
                        className="flex items-start gap-2 rounded-[12px] border px-3 py-2 text-left transition-colors"
                        style={{
                          background: selected ? '#EAF8FF' : '#FFFFFF',
                          borderColor: selected ? SKY_BLUE : '#E5E7EB',
                        }}
                      >
                        <span
                          className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            background:
                              scenario.id === 'normal'
                                ? '#22C55E'
                                : scenario.id === 'station-offline'
                                ? '#F97316'
                                : '#EF4444',
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-semibold text-[#111827]">{scenario.label}</span>
                          <span className="mt-0.5 block text-[10px] leading-snug text-[#64748B]">{scenario.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {WORKING_STATUSES.map((status) => {
                const selected = workingStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setWorkingStatus(status);
                      setStatusSheetOpen(false);
                    }}
                    className="flex w-full items-center gap-3 border-b border-[#F5F5F5] py-3 last:border-0 transition-opacity active:opacity-70"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors"
                      style={{
                        border: `2px solid ${selected ? SKY_BLUE : '#D1D5DB'}`,
                        background: selected ? SKY_BLUE : 'transparent',
                      }}
                    >
                      {selected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="text-[14px] text-[#111827]">{status}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Cleaning Mode bottom sheet */}
      {cleaningModeSheetOpen && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-40 bg-black/45"
            aria-label="关闭"
            onClick={() => setCleaningModeSheetOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 flex max-h-[50%] min-h-[45%] flex-col rounded-t-[20px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex shrink-0 items-center justify-between border-b border-[#F0F0F0] px-4 py-3">
              <span className="text-[16px] font-semibold text-[#111827]">Cleaning Mode</span>
              <button
                type="button"
                onClick={() => setCleaningModeSheetOpen(false)}
                className="rounded-full p-1 text-[#666666] transition-opacity active:opacity-70"
                aria-label="关闭"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3">
              <div className="grid grid-cols-3 gap-2">
                {cleaningModesC2ProVision.map((m) => {
                  const id = m.id as DeviceCleaningModeId;
                  const selected = cleaningMode === id;
                  const img = resolveCleaningModeImage(id, aiVisual);
                  const hideLabel = shouldHideCleaningModeLabel(id, aiVisual);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setCleaningMode(id);
                        setCleaningModeSheetOpen(false);
                      }}
                      className={`flex min-w-0 flex-col items-center justify-center rounded-[14px] border px-0.5 py-2 transition-colors ${
                        hideLabel ? 'gap-0' : 'gap-1'
                      }`}
                      style={{
                        background: selected ? SKY_BLUE : '#FFFFFF',
                        borderColor: selected ? SKY_BLUE : '#EEEEEE',
                      }}
                    >
                      <div
                        className={`flex items-center justify-center ${
                          hideLabel ? 'h-[52px] w-[52px]' : 'h-11 w-11'
                        }`}
                      >
                        <img
                          src={img.src}
                          srcSet={img.srcSet}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                          draggable={false}
                        />
                      </div>
                      {!hideLabel && (
                        <span
                          className={`line-clamp-2 w-full text-center text-[10px] font-medium leading-[1.2] ${
                            selected ? 'text-white' : 'text-[#333333]'
                          }`}
                        >
                          {m.label.replace(/:\s*$/, '').replace(/\([^)]*\)/g, '').trim()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {cleaningToast && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-[60] max-w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-[#E5E7EB] bg-white/96 px-5 py-3 text-center text-[14px] font-semibold leading-snug text-[#111827] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm"
          role="status"
        >
          机器已在清洁状态中
        </div>
      )}
    </div>
  );
};
