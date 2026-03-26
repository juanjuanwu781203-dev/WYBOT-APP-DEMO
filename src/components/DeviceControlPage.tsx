import { ArrowLeft, BatteryFull, Bluetooth, ChevronRight, Clock, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusBar } from './StatusBar';
import { cleaningModes, cleaningModesC2ProVision } from '../data/mockData';
import {
  deviceControlAiVisualIcon,
  deviceControlCloudCameraIcon,
  deviceControlDeviceInfoIcon,
  EXTRA_DIRTY_ALLOWED_MODES,
  resolveCleaningModeImage,
  shouldHideCleaningModeLabel,
  type DeviceCleaningModeId,
} from '../config/deviceControlAssets';

const WATER_BLUE = '#00C2FF';

interface DeviceControlPageProps {
  productName: string;
  productImage: string;
  showAiVisualCleaning: boolean;
  thirdStatusIcon: 'wifi' | 'cloudCamera';
  cleaningModeLabels: 'compact' | 'c2ProVisionLegacy';
  showExtraDirtyPoolClean: boolean;
  onBack: () => void;
  onOpenCycleTimer: () => void;
  onOpenDeviceInfo: () => void;
  onOpenExpertMode: () => void;
  onOpenPoolSetup: () => void;
  cycleTimerActive: boolean;
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

export const DeviceControlPage = ({
  productName,
  productImage,
  showAiVisualCleaning,
  thirdStatusIcon,
  cleaningModeLabels,
  showExtraDirtyPoolClean,
  onBack,
  onOpenCycleTimer,
  onOpenDeviceInfo,
  onOpenExpertMode,
  onOpenPoolSetup,
  cycleTimerActive,
}: DeviceControlPageProps) => {
  const [aiVisual, setAiVisual] = useState(true);
  const effectiveAiVisual = showAiVisualCleaning && aiVisual;
  const [extraDirty, setExtraDirty] = useState(false);
  const [cleaningMode, setCleaningMode] = useState<DeviceCleaningModeId>('wall-floor');

  useEffect(() => {
    if (showExtraDirtyPoolClean && extraDirty && !EXTRA_DIRTY_ALLOWED_MODES.includes(cleaningMode)) {
      setCleaningMode('floor-2h');
    }
  }, [showExtraDirtyPoolClean, extraDirty, cleaningMode]);

  const handleAiVisual = (v: boolean) => {
    setAiVisual(v);
    if (v && showExtraDirtyPoolClean) setExtraDirty(false);
  };

  const handleExtraDirty = (v: boolean) => {
    setExtraDirty(v);
    if (v) setAiVisual(false);
  };

  const modeDisabled = (id: DeviceCleaningModeId) =>
    showExtraDirtyPoolClean && extraDirty && !EXTRA_DIRTY_ALLOWED_MODES.includes(id);

  const cleaningModesList = cleaningModeLabels === 'c2ProVisionLegacy' ? cleaningModesC2ProVision : cleaningModes;

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-white">
      <StatusBar time="14:49" battery="61%" />
      <div className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-0">
        <button type="button" onClick={onBack} className="p-0.5" aria-label="Back">
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <span className="truncate text-[16px] font-semibold leading-tight text-[#111827]">
            {productName}
          </span>
          <button type="button" onClick={onOpenDeviceInfo} className="-ml-px p-0.5" aria-label="Device information">
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
          className="flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-[#2555D1] transition-opacity active:opacity-80"
        >
          Pool Setup
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="flex w-full shrink-0 items-center justify-end gap-2 px-5 pb-2">
        <span className="flex items-center gap-1.5 text-[12px] font-medium tabular-nums text-[#111827]">
          <BatteryFull
            size={28}
            strokeWidth={2}
            className="shrink-0 fill-[#22C55E] text-[#22C55E]"
            aria-hidden
          />
          100
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2555D1]">
          <Bluetooth size={16} strokeWidth={2.5} className="text-white" />
        </div>
        {thirdStatusIcon === 'cloudCamera' ? (
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white/90 shadow-sm">
            <img
              src={deviceControlCloudCameraIcon.src}
              srcSet={deviceControlCloudCameraIcon.srcSet}
              alt=""
              className="h-5 w-5 object-contain"
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2555D1]">
            <Wifi size={16} strokeWidth={2.5} className="text-white" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-[1] flex-col px-4 pb-2 pt-1">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2">
            <div className="flex min-h-0 w-full flex-1 items-center justify-center bg-white">
              <img
                src={productImage}
                alt={productName}
                className="max-h-full w-auto max-w-[52%] object-contain"
                draggable={false}
              />
            </div>
            <p className="mt-1 max-w-[320px] shrink-0 text-center text-[11px] leading-snug text-[#666666]">
              The signal can not transmit through the water, so keep the robot out of the pool when presetting.
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-[2] flex-col overflow-hidden border-t border-[#EEEEEE] bg-white px-4 pb-4 pt-3">
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            {showAiVisualCleaning && (
              <div className="flex shrink-0 items-center justify-between gap-3 rounded-[16px] bg-[#F8F9FA] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <img
                    src={deviceControlAiVisualIcon.src}
                    srcSet={deviceControlAiVisualIcon.srcSet}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 object-contain"
                    draggable={false}
                  />
                  <span className="text-[13px] font-medium text-[#111827]">AI Visual Cleaning</span>
                </div>
                <ToggleSwitch id="toggle-ai" checked={aiVisual} onChange={handleAiVisual} />
              </div>
            )}

            {showExtraDirtyPoolClean ? (
              <div className="grid shrink-0 grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onOpenCycleTimer}
                  className={`flex min-h-[108px] flex-col items-start rounded-[20px] p-3 text-left transition-opacity active:opacity-90 ${
                    cycleTimerActive
                      ? 'border-2 border-[#00C2FF] bg-[#00C2FF]'
                      : 'border border-[#E5E7EB] bg-[#FAFAFA]'
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <Clock
                      size={22}
                      strokeWidth={2}
                      className={cycleTimerActive ? 'shrink-0 text-black' : 'shrink-0 text-[#111827]'}
                    />
                  </div>
                  <span
                    className={`mt-2 text-[14px] font-semibold leading-tight ${
                      cycleTimerActive ? 'text-black' : 'text-[#111827]'
                    }`}
                  >
                    Cycle Timer
                  </span>
                  <span
                    className={`mt-0.5 text-[11px] leading-snug ${
                      cycleTimerActive ? 'text-[#333333]' : 'text-[#666666]'
                    }`}
                  >
                    floor cleaning only
                  </span>
                </button>

                <div className="flex min-h-[108px] flex-col justify-between rounded-[20px] border border-[#E5E7EB] bg-[#FAFAFA] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 text-[12px] font-medium leading-snug text-[#111827]">
                      Extra-dirty Pool Clean
                    </span>
                    <ToggleSwitch id="toggle-dirty" checked={extraDirty} onChange={handleExtraDirty} />
                  </div>
                  <button
                    type="button"
                    className="mt-auto flex w-full items-center justify-start gap-0.5 text-left text-[11px] text-[#2555D1]"
                  >
                    Learn more about this function
                    <ChevronRight size={14} strokeWidth={2} className="shrink-0" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenCycleTimer}
                className={`flex w-full shrink-0 items-center gap-3 rounded-[16px] border px-3 py-2.5 text-left transition-opacity active:opacity-90 ${
                  cycleTimerActive
                    ? 'border-2 border-[#00C2FF] bg-[#00C2FF]'
                    : 'border border-[#E5E7EB] bg-[#FAFAFA]'
                }`}
              >
                <Clock
                  size={20}
                  strokeWidth={2}
                  className={`shrink-0 ${cycleTimerActive ? 'text-black' : 'text-[#111827]'}`}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-[14px] font-semibold leading-tight ${
                      cycleTimerActive ? 'text-black' : 'text-[#111827]'
                    }`}
                  >
                    Cycle Timer
                  </div>
                  <div
                    className={`mt-0.5 text-[11px] leading-snug ${
                      cycleTimerActive ? 'text-[#333333]' : 'text-[#666666]'
                    }`}
                  >
                    floor cleaning only
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  strokeWidth={2}
                  className={`shrink-0 ${cycleTimerActive ? 'text-black' : 'text-[#999999]'}`}
                />
              </button>
            )}

            <div className="mt-auto flex min-h-0 shrink-0 flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[#111827]">Cleaning Mode</span>
                <button
                  type="button"
                  onClick={onOpenExpertMode}
                  className="flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-[#2555D1]"
                >
                  Expert Mode
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {cleaningModesList.map((m) => {
                  const id = m.id as DeviceCleaningModeId;
                  const selected = cleaningMode === id;
                  const disabled = modeDisabled(id);
                  const img = resolveCleaningModeImage(id, effectiveAiVisual);
                  const hideLabel = shouldHideCleaningModeLabel(id, effectiveAiVisual);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setCleaningMode(id)}
                      className={`flex min-w-0 flex-col items-center justify-center rounded-[14px] border px-0.5 py-2 transition-colors ${
                        disabled ? 'cursor-not-allowed opacity-40 grayscale' : ''
                      } ${hideLabel ? 'gap-0' : 'gap-1'}`}
                      style={{
                        background: selected ? WATER_BLUE : '#FFFFFF',
                        borderColor: selected ? WATER_BLUE : '#EEEEEE',
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
                        <span className="line-clamp-2 w-full text-center text-[10px] font-medium leading-[1.2] text-[#333333]">
                          {m.label.replace(/:\s*$/, '')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
