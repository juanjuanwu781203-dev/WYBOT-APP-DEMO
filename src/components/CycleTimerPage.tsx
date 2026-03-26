import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusBar } from './StatusBar';
import { deviceControlCleaningModeImages } from '../config/deviceControlAssets';

export type CycleTimerFrequency = 'twice' | 'three' | 'four' | null;

interface CycleTimerPageProps {
  onBack: () => void;
  initialFrequency: CycleTimerFrequency;
  onFrequencyChange: (freq: CycleTimerFrequency) => void;
}

function Toggle({
  on,
  onClick,
  id,
}: {
  on: boolean;
  onClick: () => void;
  id: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${
        on ? 'bg-[#00C2FF]' : 'bg-[#E5E7EB]'
      }`}
    >
      <span
        className={`pointer-events-none absolute left-[3px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/** 附图：两圈、60 min、24 hours */
function DiagramTwice() {
  return (
    <div className="flex items-end justify-start gap-0.5 overflow-x-auto py-1.5">
      <Node label="1st day" minutes="60 min." />
      <Connector label="24 hours" />
      <Node label="2nd day" minutes="60 min." />
    </div>
  );
}

/** 附图：三圈、40 min、24 hours */
function DiagramThree() {
  return (
    <div className="flex items-end justify-start gap-0 overflow-x-auto py-1.5">
      <Node label="1st day" minutes="40 min." />
      <Connector label="24 hours" />
      <Node label="2nd day" minutes="40 min." />
      <Connector label="24 hours" />
      <Node label="3rd day" minutes="40 min." />
    </div>
  );
}

/** 附图：四圈、30 min、48 hours，日序 1/3/5/7 */
function DiagramFour() {
  return (
    <div className="flex items-end justify-start gap-0 overflow-x-auto py-1.5">
      <Node label="1st day" minutes="30 min." />
      <Connector label="48 hours" />
      <Node label="3rd day" minutes="30 min." />
      <Connector label="48 hours" />
      <Node label="5th day" minutes="30 min." />
      <Connector label="48 hours" />
      <Node label="7th day" minutes="30 min." />
    </div>
  );
}

function Node({ label, minutes }: { label: string; minutes: string }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-0.5">
      <span className="text-left text-[8px] font-medium leading-tight text-[#111827]">{label}</span>
      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-full border border-[#333333] bg-white">
        <span className="text-[9px] font-semibold leading-none text-[#111827]">{minutes}</span>
      </div>
    </div>
  );
}

function Connector({ label }: { label: string }) {
  return (
    <div className="flex min-w-[28px] max-w-[40px] shrink-0 flex-col items-start justify-end pb-[5px] px-0.5">
      <span className="whitespace-nowrap text-left text-[7px] leading-none text-[#555555]">{label}</span>
      <div className="mt-0.5 h-px w-full min-w-[20px] bg-[#333333]" />
    </div>
  );
}

const INTRO_COPY =
  'This function fits floor cleaning mode, and please ensure your cleaner is fully charged before use. Each cleaning cycle time may vary with the different battery life and pool size, and below is an example of a battery life of 120 minutes.';

export const CycleTimerPage = ({
  onBack,
  initialFrequency,
  onFrequencyChange,
}: CycleTimerPageProps) => {
  const [freq, setFreq] = useState<CycleTimerFrequency>(initialFrequency);

  useEffect(() => {
    setFreq(initialFrequency);
  }, [initialFrequency]);

  const pick = (next: Exclude<CycleTimerFrequency, null>) => {
    const resolved: CycleTimerFrequency = freq === next ? null : next;
    setFreq(resolved);
    onFrequencyChange(resolved);
  };

  const floorImg = deviceControlCleaningModeImages['floor-2h'];

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{ background: 'linear-gradient(180deg, #E6F7F9 0%, #F8F9FA 100%)' }}
    >
      <StatusBar time="14:49" battery="61%" />
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onBack} className="p-1" aria-label="Back">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[16px] font-semibold tracking-wide text-[#000000]">CYCLE TIMER</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <div className="mb-3 rounded-[12px] bg-white p-3 shadow-sm">
          <p className="text-[12px] leading-relaxed text-[#555555]">{INTRO_COPY}</p>
        </div>

        <div className="mb-3 rounded-[12px] bg-white p-3 shadow-sm">
          <div className="mb-2 text-[13px] font-semibold text-[#111827]">Cycle Cleaning Mode</div>
          <div className="flex justify-start py-1">
            <div
              className="inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-[14px] px-5 py-3"
              style={{ background: '#00C2FF' }}
            >
              <img
                src={floorImg.src}
                srcSet={floorImg.srcSet}
                alt=""
                className="h-9 w-9 object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
                draggable={false}
              />
              <span className="text-[13px] font-semibold text-white">Floor</span>
            </div>
          </div>
        </div>

        <div className="mb-3 rounded-[12px] bg-white p-3 shadow-sm">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-[#333333]">Clean twice</span>
            <Toggle id="freq-twice" on={freq === 'twice'} onClick={() => pick('twice')} />
          </div>
          <DiagramTwice />
        </div>

        <div className="mb-3 rounded-[12px] bg-white p-3 shadow-sm">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-[#333333]">Clean 3 times</span>
            <Toggle id="freq-three" on={freq === 'three'} onClick={() => pick('three')} />
          </div>
          <DiagramThree />
        </div>

        <div className="mb-3 rounded-[12px] bg-white p-3 shadow-sm">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-[#333333]">Clean 4 times</span>
            <Toggle id="freq-four" on={freq === 'four'} onClick={() => pick('four')} />
          </div>
          <DiagramFour />
        </div>
      </div>
    </div>
  );
};
