import {
  ArrowLeft,
  Battery,
  BatteryCharging,
  CalendarClock,
  ChevronRight,
  Gamepad2,
  HelpCircle,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import { StatusBar } from './StatusBar';
import { cleaningModes } from '../data/mockData';
import {
  deviceControlAiVisualIcon,
  deviceControlDeviceInfoIcon,
  deviceControlRobotIcon,
  resolveCleaningModeImage,
  shouldHideCleaningModeLabel,
  type DeviceCleaningModeId,
} from '../config/deviceControlAssets';

const WATER_BLUE = '#00C2FF';

interface S2SolarVisionControlPageProps {
  productImage: string;
  onBack: () => void;
  onOpenDeviceInfo: () => void;
  onOpenExpertMode: () => void;
  onOpenPoolSetup: () => void;
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors ${
        checked ? 'bg-[#00C2FF]' : 'bg-[#E5E7EB]'
      }`}
    >
      <span
        className={`pointer-events-none absolute left-[2px] top-1/2 h-[20px] w-[20px] -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function modeLabel(m: { id: string; label: string }) {
  if (m.id === 'standard') return 'Advanced Full Pool';
  return m.label.replace(/:\s*$/, '');
}

export const S2SolarVisionControlPage = ({
  productImage,
  onBack,
  onOpenDeviceInfo,
  onOpenExpertMode,
  onOpenPoolSetup,
}: S2SolarVisionControlPageProps) => {
  const [aiVisual, setAiVisual] = useState(false);
  const [cleaningMode, setCleaningMode] = useState<DeviceCleaningModeId>('wall-floor');
  const [isCleaningOrAway, setIsCleaningOrAway] = useState(false);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <StatusBar time="14:49" battery="61%" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex shrink-0 items-center gap-2 px-3 pb-1 pt-0.5">
          <button type="button" onClick={onBack} className="p-0.5" aria-label="Back">
            <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-0.5">
            <span className="truncate text-[15px] font-semibold leading-tight text-[#111827]">
              WYBOT S2 Solar Vision
            </span>
            <button type="button" onClick={onOpenDeviceInfo} className="-ml-px p-0.5" aria-label="Device information">
              <img
                src={deviceControlDeviceInfoIcon.src}
                srcSet={deviceControlDeviceInfoIcon.srcSet}
                alt=""
                width={17}
                height={17}
                className="h-[17px] w-[17px] shrink-0 object-contain"
                draggable={false}
              />
            </button>
          </div>
          <button
            type="button"
            onClick={onOpenPoolSetup}
            className="flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-[#2555D1] transition-opacity active:opacity-80"
          >
            Pool Setup
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="flex shrink-0 justify-between px-3 pb-1 text-[11px] text-[#555555]">
          <span>Charging station</span>
          <span>Standby on station</span>
        </div>

        <div className="flex shrink-0 items-start justify-between gap-2 px-3 pb-1.5 pt-0.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="relative shrink-0 pr-5">
              <div className="flex items-center gap-1.5">
                <Sun size={16} strokeWidth={2} className="shrink-0 text-amber-500" />
                <span className="text-[12px] font-medium leading-tight text-[#111827]">Solar Kit</span>
              </div>
              <button
                type="button"
                className="absolute -right-0.5 -top-0.5 p-0.5 text-[#999999]"
                aria-label="Solar Kit help"
              >
                <HelpCircle size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <BatteryCharging size={17} strokeWidth={2} className="shrink-0 text-emerald-600" />
              <span className="text-[12px] font-semibold tabular-nums text-[#111827]">84%</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="inline-flex h-[22px] min-w-0 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold leading-none text-white"
              style={{ background: WATER_BLUE }}
            >
              Online
            </span>
            <div className="flex h-[22px] items-center gap-1">
              <img
                src={deviceControlRobotIcon.src}
                srcSet={deviceControlRobotIcon.srcSet}
                alt=""
                width={22}
                height={22}
                className="h-[22px] w-[22px] shrink-0 object-contain"
                draggable={false}
              />
              <Battery size={18} strokeWidth={2} className="shrink-0 text-[#111827]" />
              <span className="text-[12px] font-semibold tabular-nums text-[#111827]">100</span>
            </div>
          </div>
        </div>

        <div className="-mt-1 flex min-h-0 flex-[0.95] flex-col items-center justify-center gap-2 px-4 pb-0 pt-0">
          <img
            src={productImage}
            alt="WYBOT S2 Solar Vision"
            className="h-auto max-h-[150px] w-auto max-w-[190px] object-contain"
            style={{ imageRendering: 'auto' }}
            draggable={false}
          />
          <button
            type="button"
            onClick={() => setIsCleaningOrAway((v) => !v)}
            className="mx-auto block w-[calc((100%-8px)/2)] max-w-full shrink-0 rounded-[9999px] bg-[#111827] py-2.5 text-[12px] font-medium leading-tight text-white transition-opacity active:opacity-90"
          >
            {isCleaningOrAway ? 'Back to charge' : 'Start Cleaning'}
          </button>
        </div>

        <div className="flex min-h-0 flex-[1.15] flex-col overflow-hidden rounded-t-[22px] border-t border-[#F0F0F0] bg-white px-3 pb-3 pt-2">
          <div className="mb-2 grid shrink-0 grid-cols-2 gap-2">
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-[9999px] bg-[#F3F4F6] py-2.5 text-[12px] font-medium text-[#111827] transition-opacity active:opacity-80"
            >
              <Gamepad2 size={16} strokeWidth={2} className="shrink-0" />
              Remote Control
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-[9999px] bg-[#F3F4F6] py-2.5 text-[12px] font-medium text-[#111827] transition-opacity active:opacity-80"
            >
              <CalendarClock size={16} strokeWidth={2} className="shrink-0" />
              Weekly Cleaning
            </button>
          </div>

          <div className="mb-2 flex shrink-0 items-center justify-between gap-2 rounded-[14px] border border-[#E5E7EB] bg-white px-2.5 py-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <img
                src={deviceControlAiVisualIcon.src}
                srcSet={deviceControlAiVisualIcon.srcSet}
                alt=""
                width={18}
                height={18}
                className="h-[18px] w-[18px] shrink-0 object-contain"
                draggable={false}
              />
              <span className="text-[12px] font-medium text-[#111827]">AI Visual Cleaning</span>
            </div>
            <ToggleSwitch checked={aiVisual} onChange={setAiVisual} />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
            <div className="flex shrink-0 items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-[#111827]">Cleaning Mode</span>
              <button
                type="button"
                onClick={onOpenExpertMode}
                className="flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-[#2555D1]"
              >
                Expert Mode
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.5 content-start">
              {cleaningModes.map((m) => {
                const id = m.id as DeviceCleaningModeId;
                const selected = cleaningMode === id;
                const img = resolveCleaningModeImage(id, aiVisual);
                const hideLabel = shouldHideCleaningModeLabel(id, aiVisual);
                const label = modeLabel(m);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCleaningMode(id)}
                    className={`flex min-h-0 min-w-0 flex-col items-center justify-center rounded-[10px] border px-0.5 py-2 transition-colors ${
                      hideLabel ? 'gap-0' : 'gap-1'
                    }`}
                    style={{
                      background: selected ? WATER_BLUE : '#FFFFFF',
                      borderColor: selected ? WATER_BLUE : '#EEEEEE',
                    }}
                  >
                    <div
                      className={`flex items-center justify-center ${hideLabel ? 'h-12 w-12' : 'h-11 w-11'}`}
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
                      <span className="line-clamp-2 w-full text-center text-[10px] font-medium leading-[1.15] text-[#333333]">
                        {label}
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
  );
};
