import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { cleaningModesC2ProVision } from '../data/mockData';
import {
  resolveCleaningModeImage,
  shouldHideCleaningModeLabel,
  type DeviceCleaningModeId,
} from '../config/deviceControlAssets';

const SKY_BLUE = '#00C2FF';

type DayId = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

interface DaySchedule {
  id: DayId;
  label: string;
  enabled: boolean;
  startTime: string;
  modeId: DeviceCleaningModeId;
}

const DAYS: { id: DayId; label: string }[] = [
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tues' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thur' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
];

const TIME_OPTIONS = [
  '6:00 AM',
  '8:00 AM',
  '10:00 AM',
  '12:00 PM',
  '2:00 PM',
  '4:04 PM',
  '6:00 PM',
  '8:00 PM',
  '10:00 PM',
];

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

function buildInitialSchedules(): DaySchedule[] {
  return DAYS.map((d) => ({
    id: d.id,
    label: d.label,
    enabled: false,
    startTime: '4:04 PM',
    modeId: 'floor-2h',
  }));
}

interface C3ProWeeklyCleaningPageProps {
  onBack: () => void;
}

export const C3ProWeeklyCleaningPage = ({ onBack }: C3ProWeeklyCleaningPageProps) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>(buildInitialSchedules);
  const [timeSheetDay, setTimeSheetDay] = useState<DayId | null>(null);
  const [modeSheetDay, setModeSheetDay] = useState<DayId | null>(null);

  const updateDay = (dayId: DayId, patch: Partial<DaySchedule>) => {
    setSchedules((prev) => prev.map((s) => (s.id === dayId ? { ...s, ...patch } : s)));
  };

  const activeDayForMode = modeSheetDay ? schedules.find((s) => s.id === modeSheetDay) : null;

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #D4EDF5 0%, #EEF6FA 22%, #F5F6F8 45%, #F5F6F8 100%)',
      }}
    >
      <StatusBar time="16:04" battery="95%" />

      <div className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-0">
        <button
          type="button"
          onClick={onBack}
          className="p-0.5 transition-opacity active:opacity-70"
          aria-label="返回"
        >
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <h1 className="text-[15px] font-semibold uppercase tracking-wide text-[#111827]">
          Weekly Cleaning
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div
          className="mb-2 flex items-center rounded-[14px] bg-white px-3 py-2.5 text-[12px] font-semibold text-[#6B7280]"
          style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
        >
          <span className="w-[52px] shrink-0" />
          <span className="flex-1 text-center">Start</span>
          <span className="w-[52px] shrink-0 text-center">Mode</span>
          <span className="w-12 shrink-0" />
        </div>

        <div className="flex flex-col gap-2">
          {schedules.map((day) => {
            const modeImg = resolveCleaningModeImage(day.modeId, false);
            return (
              <div
                key={day.id}
                className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2.5"
                style={{
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  opacity: day.enabled ? 1 : 0.92,
                }}
              >
                <span className="w-[52px] shrink-0 text-[14px] font-semibold text-[#111827]">
                  {day.label}
                </span>
                <button
                  type="button"
                  onClick={() => setTimeSheetDay(day.id)}
                  className="min-w-0 flex-1 text-center text-[14px] font-medium text-[#111827] transition-opacity active:opacity-70"
                >
                  {day.startTime}
                </button>
                <button
                  type="button"
                  onClick={() => setModeSheetDay(day.id)}
                  className="flex h-10 w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] transition-opacity active:opacity-70"
                  aria-label={`${day.label} cleaning mode`}
                >
                  <img
                    src={modeImg.src}
                    srcSet={modeImg.srcSet}
                    alt=""
                    className="h-8 w-8 object-contain"
                    draggable={false}
                  />
                </button>
                <ToggleSwitch
                  checked={day.enabled}
                  onChange={(enabled) => updateDay(day.id, { enabled })}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Start time bottom sheet */}
      {timeSheetDay && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-40 bg-black/45"
            aria-label="关闭"
            onClick={() => setTimeSheetDay(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 flex max-h-[45%] flex-col rounded-t-[20px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex shrink-0 items-center justify-between border-b border-[#F0F0F0] px-4 py-3">
              <span className="text-[16px] font-semibold text-[#111827]">Start Time</span>
              <button
                type="button"
                onClick={() => setTimeSheetDay(null)}
                className="rounded-full p-1 text-[#666666] transition-opacity active:opacity-70"
                aria-label="关闭"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-1">
              {TIME_OPTIONS.map((time) => {
                const selected =
                  schedules.find((s) => s.id === timeSheetDay)?.startTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      updateDay(timeSheetDay, { startTime: time });
                      setTimeSheetDay(null);
                    }}
                    className="flex w-full items-center justify-between border-b border-[#F5F5F5] py-3.5 last:border-0 transition-opacity active:opacity-70"
                  >
                    <span className="text-[15px] text-[#111827]">{time}</span>
                    {selected && (
                      <span className="text-[13px] font-semibold" style={{ color: SKY_BLUE }}>
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Cleaning mode bottom sheet */}
      {modeSheetDay && activeDayForMode && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-40 bg-black/45"
            aria-label="关闭"
            onClick={() => setModeSheetDay(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 flex max-h-[52%] min-h-[42%] flex-col rounded-t-[20px] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex shrink-0 items-center justify-between border-b border-[#F0F0F0] px-4 py-3">
              <span className="text-[16px] font-semibold text-[#111827]">Cleaning Mode</span>
              <button
                type="button"
                onClick={() => setModeSheetDay(null)}
                className="rounded-full p-1 text-[#666666] transition-opacity active:opacity-70"
                aria-label="关闭"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-3">
              <div className="grid grid-cols-3 gap-2">
                {cleaningModesC2ProVision.map((m) => {
                  const id = m.id as DeviceCleaningModeId;
                  const selected = activeDayForMode.modeId === id;
                  const img = resolveCleaningModeImage(id, false);
                  const hideLabel = shouldHideCleaningModeLabel(id, false);
                  const label = m.label.replace(/:\s*$/, '').replace(/\([^)]*\)/g, '').trim();
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        updateDay(modeSheetDay, { modeId: id });
                        setModeSheetDay(null);
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
                          {label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-[#D1D5DB]" aria-hidden />
          </div>
        </>
      )}
    </div>
  );
};
