import {
  ArrowLeft,
  Bluetooth,
  ChevronRight,
  Wifi,
} from 'lucide-react';
import { useState } from 'react';
import { StatusBar } from './StatusBar';
import {
  deviceControlCleaningModeImages,
  type DeviceCleaningModeId,
} from '../config/deviceControlAssets';

const BATTERY_GREEN = '#22C55E';

function BatteryLevelIcon({ percent, size = 18 }: { percent: number; size?: number }) {
  const p = Math.min(100, Math.max(0, percent));
  const innerX = 4;
  const innerY = 9;
  const innerW = 12;
  const innerH = 6;
  const fillW = Math.max((innerW * p) / 100, p > 0 ? 0.4 : 0);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      {p > 0 && (
        <rect x={innerX} y={innerY} width={fillW} height={innerH} rx="1" fill={BATTERY_GREEN} />
      )}
      <rect x="2" y="7" width="16" height="10" rx="2" stroke="#D1D5DB" strokeWidth="2" />
      <path d="M22 10v4" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface U1ControlPageProps {
  productImage: string;
  onBack: () => void;
  onOpenDeviceInfo: () => void;
  onOpenPoolSetup: () => void;
  onOpenExpertMode: () => void;
  onOpenRemoteControl: () => void;
}

function ToggleSwitch({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
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

interface DropdownOption {
  value: string;
  label: string;
}

const DURATION_OPTIONS: DropdownOption[] = [
  { value: '2.5', label: '2.5h' },
  { value: '2', label: '2h' },
  { value: '1.5', label: '1.5h' },
  { value: '1', label: '1h' },
];

const POWER_OPTIONS: DropdownOption[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'turbo', label: 'Turbo' },
  { value: 'eco', label: 'ECO' },
];

function DropdownCard({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-[16px] bg-white px-3 py-2.5 text-left shadow-sm transition-opacity active:opacity-80"
        style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
      >
        <div className="text-[11px] font-medium text-[#666666]">{label}</div>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#111827]">{selectedLabel}</span>
          <ChevronRight
            size={16}
            strokeWidth={2}
            className={`text-[#999999] transition-transform ${open ? 'rotate-90' : ''}`}
          />
        </div>
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/45"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 z-50 mb-2 flex flex-col rounded-[16px] bg-white p-2 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`rounded-[12px] px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                  value === opt.value ? 'bg-[#00C2FF] text-white' : 'text-[#111827] hover:bg-[#F3F4F6]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const U1ControlPage = ({
  productImage,
  onBack,
  onOpenDeviceInfo,
  onOpenPoolSetup,
  onOpenExpertMode,
  onOpenRemoteControl,
}: U1ControlPageProps) => {
  const [battery] = useState(100);
  const [isCharging] = useState(false);
  const [bluetoothConnected, setBluetoothConnected] = useState(true);
  const [wifiConnected, setWifiConnected] = useState(true);
  const [aiVisual, setAiVisual] = useState(true);
  const [cleaningMode, setCleaningMode] = useState<DeviceCleaningModeId>('floor-2h');
  const [duration, setDuration] = useState('2.5');
  const [power, setPower] = useState('standard');
  const [cleaningModeSheetOpen, setCleaningModeSheetOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isDocking, setIsDocking] = useState(false);
  
  const handleQuestionClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const handleStartCleaning = () => {
    if (isDocking || isCharging) return;
    setIsCleaning(!isCleaning);
  };
  
  const handleReturnToDock = () => {
    if (isDocking) return;
    setIsDocking(true);
    setIsCleaning(false);
    // 模拟停靠完成，3秒后解锁
    setTimeout(() => {
      setIsDocking(false);
    }, 3000);
  };
  
  const cleaningData = {
    area: '12.5',
    unit: 'm²',
    time: '0:45:30',
    progress: 68
  };

  const cleaningModes: { id: DeviceCleaningModeId; label: string }[] = [
    { id: 'floor-2h', label: '池底' },
    { id: 'wall', label: '池壁' },
    { id: 'wall-floor', label: '先池壁后池底' },
    { id: 'waterline', label: '水面' },
    { id: 'standard', label: '标准全池' },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#F5F6F8]">
      <StatusBar time="14:49" battery="61%" />

      <div className="flex shrink-0 items-center gap-2 px-4 pb-1 pt-0">
        <button type="button" onClick={onBack} className="p-0.5" aria-label="返回">
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <span className="truncate text-[16px] font-semibold leading-tight text-[#111827]">
            WYBOT U1
          </span>
          <button type="button" onClick={onOpenDeviceInfo} className="-ml-px p-0.5" aria-label="设备信息">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="#111827" />
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                i
              </text>
            </svg>
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenPoolSetup}
          className="flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-[#2555D1] transition-opacity active:opacity-80"
        >
          Pool Setup
          <ChevronRight size={16} strokeWidth={2} className="text-[#2555D1]" aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-4 pb-2">
        <div className="flex shrink-0 pt-0.5">
          <button
            type="button"
            className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#111827] shadow-sm"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            固件更新
          </button>
        </div>

        <div
          className="flex shrink-0 flex-col gap-2 rounded-[16px] bg-white p-3"
          style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    bluetoothConnected ? 'bg-[#2555D1]' : 'bg-[#E5E7EB]'
                  }`}
                  onClick={() => setBluetoothConnected(!bluetoothConnected)}
                >
                  <Bluetooth size={12} strokeWidth={3} className="text-white" aria-hidden />
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    wifiConnected ? 'bg-[#2555D1]' : 'bg-[#E5E7EB]'
                  }`}
                  onClick={() => setWifiConnected(!wifiConnected)}
                >
                  <Wifi size={12} strokeWidth={3} className="text-white" aria-hidden />
                </div>
              </div>
              <span className="text-[16px] font-bold text-[#111827]">Surface Cleaning</span>
              <div className="flex items-center gap-1">
                <BatteryLevelIcon percent={battery} size={20} />
                <span className="text-[12px] font-semibold tabular-nums text-[#111827]">
                  {battery}%
                </span>
              </div>
            </div>
            <div className="flex h-[120px] w-[160px] items-center justify-center overflow-hidden">
              <img
                src={productImage}
                alt="WYBOT U1"
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col justify-center rounded-[16px] p-4"
          style={{ boxShadow: '0 4px 16px rgba(0, 194, 255, 0.15)' }}
        >
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center rounded-[12px] bg-white px-3 py-3">
            {/* 清洁数据展示 */}
            <div className="flex w-full items-center justify-between mb-2 px-1">
              <div className="flex flex-col">
                <span className="text-[9px] text-[#999999]">清洁面积</span>
                <span className="text-[16px] font-bold text-[#111827] leading-tight">
                  {cleaningData.area}<span className="text-[11px] font-normal ml-0.5">{cleaningData.unit}</span>
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-[#999999]">清洁时长</span>
                <span className="text-[16px] font-bold text-[#111827] leading-tight">{cleaningData.time}</span>
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full mb-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00C2FF] to-[#00A8E8] rounded-full transition-all duration-500"
                style={{ width: `${cleaningData.progress}%` }}
              />
            </div>
            
            <svg viewBox="0 0 320 220" className="w-full max-w-[300px]" aria-hidden>
              <defs>
                <clipPath id="poolClip">
                  <path
                    d="M50,110 Q50,30 110,20 Q150,15 190,25 Q240,35 280,30 Q310,28 315,80 Q318,120 300,160 Q280,200 230,205 Q180,210 130,195 Q80,180 55,150 Q45,135 50,110 Z"
                    fill="white"
                  />
                </clipPath>
              </defs>
              
              {/* 泳池外框 - 实线 */}
              <path
                d="M50,110 Q50,30 110,20 Q150,15 190,25 Q240,35 280,30 Q310,28 315,80 Q318,120 300,160 Q280,200 230,205 Q180,210 130,195 Q80,180 55,150 Q45,135 50,110 Z"
                fill="none"
                stroke="#00C2FF"
                strokeWidth="2.5"
                opacity="0.5"
              />
              
              {/* 清洁路径 - 蛇形全覆盖 */}
              <g clipPath="url(#poolClip)">
                {/* 已清洁路径（灰色轨道） */}
                <path
                  d="
                    M75,45 L275,45
                    M275,70 L75,70
                    M75,95 L275,95
                    M275,120 L75,120
                    M75,145 L275,145
                    M275,170 L75,170
                  "
                  stroke="#E5E7EB"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.4"
                />
                
                {/* 动态清洁路径（蓝色流动） */}
                <path
                  d="
                    M75,45 L275,45
                    M275,70 L75,70
                    M75,95 L275,95
                    M275,120 L75,120
                    M75,145 L275,145
                    M275,170 L75,170
                  "
                  stroke="#00C2FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                  strokeDasharray="12,10"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="44"
                    to="0"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </path>
                
                {/* 机器人 - 遍历整个泳池 */}
                <g>
                  {/* 外圈光晕 */}
                  <circle r="10" fill="#00C2FF" opacity="0.25">
                    <animate
                      attributeName="opacity"
                      values="0.25;0.5;0.25"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  {/* 机器人主体 */}
                  <circle r="6" fill="#00C2FF">
                    <animateMotion
                      dur="12s"
                      repeatCount="indefinite"
                      path="
                        M75,45 
                        L100,45 L125,45 L150,45 L175,45 L200,45 L225,45 L250,45 L275,45
                        L275,60 L275,70
                        L250,70 L225,70 L200,70 L175,70 L150,70 L125,70 L100,70 L75,70
                        L75,82 L75,95
                        L100,95 L125,95 L150,95 L175,95 L200,95 L225,95 L250,95 L275,95
                        L275,107 L275,120
                        L250,120 L225,120 L200,120 L175,120 L150,120 L125,120 L100,120 L75,120
                        L75,132 L75,145
                        L100,145 L125,145 L150,145 L175,145 L200,145 L225,145 L250,145 L275,145
                        L275,157 L275,170
                        L250,170 L225,170 L200,170 L175,170 L150,170 L125,170 L100,170 L75,170
                      "
                    />
                  </circle>
                  
                  {/* 方向指示箭头 */}
                  <polygon points="-4,-4 4,0 -4,4" fill="#00C2FF" opacity="0.9">
                    <animateMotion
                      dur="12s"
                      repeatCount="indefinite"
                      path="
                        M75,45 
                        L100,45 L125,45 L150,45 L175,45 L200,45 L225,45 L250,45 L275,45
                        L275,60 L275,70
                        L250,70 L225,70 L200,70 L175,70 L150,70 L125,70 L100,70 L75,70
                        L75,82 L75,95
                        L100,95 L125,95 L150,95 L175,95 L200,95 L225,95 L250,95 L275,95
                        L275,107 L275,120
                        L250,120 L225,120 L200,120 L175,120 L150,120 L125,120 L100,120 L75,120
                        L75,132 L75,145
                        L100,145 L125,145 L150,145 L175,145 L200,145 L225,145 L250,145 L275,145
                        L275,157 L275,170
                        L250,170 L225,170 L200,170 L175,170 L150,170 L125,170 L100,170 L75,170
                      "
                      rotate="auto"
                    />
                  </polygon>
                </g>
              </g>
              
              {/* 中心标记点 */}
              <circle cx="160" cy="108" r="5" fill="#F87171" stroke="#DC2626" strokeWidth="2" opacity="0.9" />
            </svg>
            
            {/* 问号按钮 - 在遥控按钮上方 */}
            <button
              type="button"
              onClick={handleQuestionClick}
              className="absolute bottom-14 right-2 rounded-full bg-[#F3F4F6] p-1.5 text-[#666666] shadow-sm transition-all active:opacity-80 hover:bg-[#E5E7EB]"
              aria-label="帮助说明"
              title="帮助"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
            
            {/* 遥控按钮 */}
            <button
              type="button"
              onClick={onOpenRemoteControl}
              className="absolute bottom-2 right-2 rounded-full bg-[#00C2FF] p-2 text-white shadow-md transition-opacity active:opacity-80 hover:bg-[#00B5F5]"
              aria-label="Remote control"
              title="Remote Control"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
            </button>
            
            {/* Toast 提示 */}
            {showToast && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-[240px] px-3 py-2 rounded-lg bg-[#333333] text-white text-[10px] leading-snug shadow-lg z-50 animate-fade-in">
                泳池池底轮廓图将在一次完整的泳池池底或全池清洁后生成，可在机器出水后再次连接机器进行查看。
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#333333] rotate-45" />
              </div>
            )}
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleStartCleaning}
            disabled={isDocking || isCharging}
            className={`flex h-[52px] items-center justify-center rounded-[14px] text-[13px] font-semibold shadow-sm transition-all ${
              isDocking || isCharging
                ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                : isCleaning
                ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                : 'bg-[#00C2FF] text-white hover:bg-[#00B5F5] active:opacity-80'
            }`}
            style={{
              boxShadow: isDocking || isCharging
                ? 'none'
                : isCleaning
                ? '0 4px 14px rgba(239, 68, 68, 0.3)'
                : '0 4px 14px rgba(0, 194, 255, 0.3)'
            }}
          >
            {isCleaning ? 'Stop Cleaning' : 'Start Cleaning'}
          </button>
          <button
            type="button"
            onClick={handleReturnToDock}
            disabled={isDocking}
            className={`flex h-[52px] items-center justify-center rounded-[14px] text-[13px] font-semibold shadow-sm transition-all ${
              isDocking
                ? 'bg-[#D1D5DB] text-[#6B7280] cursor-not-allowed'
                : 'bg-[#00C2FF] text-white hover:bg-[#00B5F5] active:opacity-80'
            }`}
            style={{
              boxShadow: isDocking
                ? 'none'
                : '0 4px 14px rgba(0, 194, 255, 0.3)'
            }}
          >
            {isDocking ? 'Docking...' : 'Return to Dock'}
          </button>
        </div>

        <div
          className="shrink-0 rounded-[16px] bg-white px-3 py-2.5"
          style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#111827]">AI Visual Cleaning</span>
            <ToggleSwitch id="u1-ai-visual" checked={aiVisual} onChange={setAiVisual} />
          </div>
        </div>

        <div
          className="shrink-0 rounded-[16px] bg-white px-3 py-2.5"
          style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#111827]">Cleaning Mode</span>
            <button
              type="button"
              onClick={onOpenExpertMode}
              className="flex items-center gap-0.5 text-[12px] font-medium text-[#2555D1] transition-opacity active:opacity-70"
            >
              Expert Mode
              <ChevronRight size={14} strokeWidth={2} className="text-[#2555D1]" />
            </button>
          </div>
          <div className="flex justify-between gap-1 pb-1">
            {cleaningModes.map((mode) => {
              const img = deviceControlCleaningModeImages[mode.id];
              const selected = cleaningMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setCleaningMode(mode.id)}
                  className={`flex flex-1 min-w-0 flex-col items-center rounded-[12px] p-2 transition-colors ${
                    selected
                      ? 'bg-[#00C2FF] text-white'
                      : 'bg-[#F3F4F6] text-[#111827]'
                  }`}
                  style={{
                    boxShadow: selected
                      ? '0 4px 14px rgba(0, 194, 255, 0.3)'
                      : '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="mb-1 flex h-8 w-8 items-center justify-center">
                    <img
                      src={img.src}
                      srcSet={img.srcSet}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                      draggable={false}
                    />
                  </div>
                  <span className="text-[9px] font-medium text-center whitespace-nowrap">
                    {mode.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2">
          <DropdownCard
            label="Duration"
            value={duration}
            options={DURATION_OPTIONS}
            onChange={setDuration}
          />
          <DropdownCard
            label="Power"
            value={power}
            options={POWER_OPTIONS}
            onChange={setPower}
          />
        </div>
      </div>

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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3">
              <div className="grid grid-cols-3 gap-2">
                {cleaningModes.map((mode) => {
                  const img = deviceControlCleaningModeImages[mode.id];
                  const selected = cleaningMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setCleaningMode(mode.id);
                        setCleaningModeSheetOpen(false);
                      }}
                      className={`flex min-h-[80px] flex-col items-center justify-center rounded-[14px] border px-2 py-2 transition-colors ${
                        selected ? 'border-[#00C2FF] bg-[#00C2FF]' : 'border-[#EEEEEE] bg-white'
                      }`}
                    >
                      <div className="mb-1 flex h-10 w-10 items-center justify-center">
                        <img
                          src={img.src}
                          srcSet={img.srcSet}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                          draggable={false}
                        />
                      </div>
                      <span
                        className={`text-center text-[10px] font-medium leading-snug ${
                          selected ? 'text-white' : 'text-[#333333]'
                        }`}
                      >
                        {mode.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
