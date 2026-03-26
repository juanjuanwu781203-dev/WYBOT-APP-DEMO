import {
  ArrowLeft,
  Bluetooth,
  Calendar,
  ChevronRight,
  Gamepad2,
  PlayCircle,
  Settings,
  Wifi,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { StatusBar } from './StatusBar';
import { cleaningModesC2ProVision } from '../data/mockData';
import { S3_BACK_TO_CHARGE_ICON, S3_SELF_CLEAN_ICON } from '../config/s3QuickActionAssets';
import {
  deviceControlAiVisualIcon,
  deviceControlDeviceInfoIcon,
  resolveCleaningModeImage,
  shouldHideCleaningModeLabel,
  type DeviceCleaningModeId,
} from '../config/deviceControlAssets';

const SKY_BLUE = '#00C2FF';
const BATTERY_GREEN = '#22C55E';

/** 电池外框 + 按电量自左向右绿色填充（与 Lucide 电池轮廓比例接近） */
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

/** 半屏与底部栏：去掉末尾冒号与括号内时长文案 */
function formatS3CleaningModeLabel(raw: string): string {
  return raw
    .replace(/:\s*$/, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface S3ControlPageProps {
  robotImage: string;
  stationImage: string;
  onBack: () => void;
  onOpenDeviceInfo: () => void;
  /** 顶部「Pool setup」 */
  onOpenMap: () => void;
  onOpenCycleTimer: () => void;
  onOpenExpertMode: () => void;
  cycleTimerActive: boolean;
}

/** 与 Self-Clean / Back to charge PNG 统一的黑色圆环描边图标容器 */
function OutlinedIconCircle({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border-2 border-[#111827] bg-white">
      {children}
    </span>
  );
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

export const S3ControlPage = ({
  robotImage,
  stationImage,
  onBack,
  onOpenDeviceInfo,
  onOpenMap,
  onOpenCycleTimer: _onOpenCycleTimer,
  onOpenExpertMode: _onOpenExpertMode,
  cycleTimerActive: _cycleTimerActive,
}: S3ControlPageProps) => {
  const [aiVisual, setAiVisual] = useState(false);
  const effectiveAiVisual = aiVisual;
  const [cleaningMode, setCleaningMode] = useState<DeviceCleaningModeId>('wall-floor');
  const [cleaningModeSheetOpen, setCleaningModeSheetOpen] = useState(false);
  const [startCleaningActive, setStartCleaningActive] = useState(false);
  const [selfCleanActive, setSelfCleanActive] = useState(false);
  /** Weekly 仅本地高亮切换，不进入 Cycle Timer 页 */
  const [weeklyCleaningActive, setWeeklyCleaningActive] = useState(true);

  const floorIcon = resolveCleaningModeImage(cleaningMode, effectiveAiVisual);
  const cleaningModeLabel = formatS3CleaningModeLabel(
    cleaningModesC2ProVision.find((m) => m.id === cleaningMode)?.label ?? 'Floor',
  );

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#F5F6F8]">
      <StatusBar time="15:28" battery="67%" />

      <div className="flex shrink-0 items-center gap-2 px-4 pb-1 pt-0">
        <button type="button" onClick={onBack} className="p-0.5" aria-label="返回">
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <span className="truncate text-[16px] font-semibold leading-tight text-[#111827]">WYBOT S3</span>
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
          onClick={onOpenMap}
          className="flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-[#2555D1] transition-opacity active:opacity-80"
        >
          Pool setup
          <ChevronRight size={16} strokeWidth={2} className="text-[#2555D1]" aria-hidden />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* 无纵向滚动条：整页 flex 分配高度 */}
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-4 pb-2">
          <div className="flex shrink-0 pt-0.5">
            <button
              type="button"
              className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#111827] shadow-sm"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              Firmware Update
            </button>
          </div>

          {/* 两张状态卡：等高、紧凑；图片限制在固定框内 */}
          <div className="flex shrink-0 flex-col gap-2">
            <div
              className="flex h-[80px] w-full min-w-0 shrink-0 gap-2 rounded-[16px] bg-white p-2"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
            >
              <div className="flex h-full w-[76px] shrink-0 items-center justify-center overflow-hidden">
                <img
                  src={robotImage}
                  alt=""
                  className="max-h-[52px] max-w-[72px] object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-end justify-between gap-0.5 py-0.5">
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <Bluetooth size={18} strokeWidth={2.5} className="text-[#2555D1]" aria-hidden />
                  <Wifi size={18} strokeWidth={2.5} className="text-[#2555D1]" aria-hidden />
                  <span className="flex items-center gap-1 text-[11px] font-semibold tabular-nums text-[#111827]">
                    <BatteryLevelIcon percent={46} size={18} />
                    46%
                  </span>
                </div>
                <span className="w-full text-right text-[14px] font-semibold leading-tight text-[#111827]">
                  Standby
                </span>
              </div>
            </div>

            <div
              className="flex h-[80px] w-full min-w-0 shrink-0 gap-2 rounded-[16px] bg-white p-2"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
            >
              <div className="flex h-full w-[76px] shrink-0 items-center justify-center overflow-hidden">
                <img
                  src={stationImage}
                  alt=""
                  className="max-h-[52px] max-w-[72px] object-contain"
                  draggable={false}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-end justify-between gap-0.5 py-0.5">
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <span className="rounded-full bg-[#BFDBFE] px-1.5 py-0.5 text-[9px] font-semibold text-[#1D4ED8]">
                    Online
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold tabular-nums text-[#111827]">
                    <BatteryLevelIcon percent={100} size={18} />
                    100%
                  </span>
                </div>
                <span className="w-full text-right text-[14px] font-semibold leading-tight text-[#111827]">
                  Standby on station
                </span>
              </div>
            </div>
          </div>

          {/* 虚拟地图：吃掉中间剩余空间，不固定 50vh，避免撑出滚动条 */}
          <div
            className="flex min-h-0 flex-1 flex-col justify-center rounded-[16px] p-2"
            style={{ background: SKY_BLUE, boxShadow: '0 4px 16px rgba(0, 194, 255, 0.25)' }}
          >
            <div className="relative flex min-h-0 flex-1 flex-col justify-center rounded-[12px] bg-white/35 px-3 py-3 pb-10 backdrop-blur-[2px]">
              <p className="text-center text-[11px] font-medium leading-snug text-white">
                The current map is virtual. A real pool map will be generated after full cleaning.
              </p>
              <button
                type="button"
                className="absolute bottom-2 right-2 rounded-full bg-white/30 p-1.5 text-white transition-opacity active:opacity-80"
                aria-label="Map settings"
              >
                <Settings size={18} strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>

          {/* 四宫格 */}
          <div className="grid shrink-0 grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStartCleaningActive((v) => !v)}
              className={`flex h-[60px] flex-col items-center justify-center gap-0.5 rounded-[14px] border-2 p-1.5 transition-colors ${
                startCleaningActive
                  ? 'border-[#00C2FF] bg-[#00C2FF] text-white'
                  : 'border-transparent bg-white text-[#111827]'
              }`}
              style={{
                boxShadow: startCleaningActive
                  ? '0 4px 14px rgba(0, 194, 255, 0.3)'
                  : '0 4px 14px rgba(0,0,0,0.06)',
              }}
            >
              {startCleaningActive ? (
                <PlayCircle size={22} strokeWidth={1.8} className="text-white" aria-hidden />
              ) : (
                <OutlinedIconCircle>
                  <PlayCircle size={16} strokeWidth={2} className="text-[#00C2FF]" aria-hidden />
                </OutlinedIconCircle>
              )}
              <span
                className={`text-center text-[10px] font-semibold leading-tight ${
                  startCleaningActive ? 'text-white' : ''
                }`}
              >
                Start Cleaning
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelfCleanActive((v) => !v)}
              className="flex h-[60px] flex-col items-center justify-center gap-0.5 rounded-[14px] bg-white p-1.5 text-[#111827]"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
            >
              <img
                src={selfCleanActive ? S3_BACK_TO_CHARGE_ICON : S3_SELF_CLEAN_ICON}
                alt=""
                className="h-[22px] w-[22px] object-contain"
                draggable={false}
              />
              <span className="text-center text-[10px] font-semibold leading-tight">
                {selfCleanActive ? 'Back to charge' : 'Self-Clean'}
              </span>
            </button>
            <button
              type="button"
              className="flex h-[60px] flex-col items-center justify-center gap-0.5 rounded-[14px] bg-white p-1.5 text-[#111827]"
              style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
            >
              <OutlinedIconCircle>
                <Gamepad2 size={16} strokeWidth={2} className="text-[#00C2FF]" aria-hidden />
              </OutlinedIconCircle>
              <span className="text-[10px] font-semibold leading-tight">Remote Control</span>
            </button>
            <button
              type="button"
              onClick={() => setWeeklyCleaningActive((v) => !v)}
              className={`flex h-[60px] flex-col items-center justify-center gap-0.5 rounded-[14px] border-2 p-1.5 transition-colors ${
                weeklyCleaningActive
                  ? 'border-[#00C2FF] bg-[#00C2FF] text-white'
                  : 'border-transparent bg-white text-[#111827]'
              }`}
              style={{
                boxShadow: weeklyCleaningActive
                  ? '0 4px 14px rgba(0, 194, 255, 0.3)'
                  : '0 4px 14px rgba(0,0,0,0.06)',
              }}
            >
              {weeklyCleaningActive ? (
                <Calendar size={20} strokeWidth={2} className="text-white" aria-hidden />
              ) : (
                <OutlinedIconCircle>
                  <Calendar size={16} strokeWidth={2} className="text-[#00C2FF]" aria-hidden />
                </OutlinedIconCircle>
              )}
              <span
                className={`text-center text-[10px] font-semibold leading-tight ${
                  weeklyCleaningActive ? 'text-white' : ''
                }`}
              >
                Weekly Cleaning
              </span>
            </button>
          </div>
        </div>

        {/* Cleaning Mode：贴底 */}
        <div className="shrink-0 border-t border-[#E8EAED] bg-[#F5F6F8] px-4 pb-3 pt-2">
          <div className="rounded-[16px] bg-white px-3 py-2" style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
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
                <ToggleSwitch id="s3-ai-visual" checked={aiVisual} onChange={setAiVisual} />
              </div>
              <div className="h-9 w-px shrink-0 bg-[#E5E7EB]" aria-hidden />
              <button
                type="button"
                onClick={() => setCleaningModeSheetOpen(true)}
                className="flex min-w-0 max-w-[52%] shrink-0 items-center gap-1 rounded-[12px] py-1 pl-0.5 pr-0 transition-opacity active:opacity-80"
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

      {/* 清洁模式半屏（与 WYBOT C2 Pro Vision 相同的模式图与文案） */}
      {cleaningModeSheetOpen && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-40 bg-black/45"
            aria-label="关闭"
            onClick={() => setCleaningModeSheetOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 z-50 flex max-h-[50%] min-h-[45%] flex-col rounded-t-[20px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
          >
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
                  const img = resolveCleaningModeImage(id, effectiveAiVisual);
                  const hideLabel = shouldHideCleaningModeLabel(id, effectiveAiVisual);
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
                          {formatS3CleaningModeLabel(m.label)}
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
    </div>
  );
};
