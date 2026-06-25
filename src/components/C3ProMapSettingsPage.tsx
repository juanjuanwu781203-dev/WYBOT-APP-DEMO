import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { StatusBar } from './StatusBar';

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

const AUTO_MAP_NOTES = [
  'The robot matches the map along pool edges before cleaning.',
  'The process takes a few minutes; if it fails, it switches to mapping mode.',
  'Beta limitation: may fail in pools with curved bottoms or beach-style designs.',
  'We are continuously improving the algorithm; results may vary by pool shape.',
] as const;

interface C3ProMapSettingsPageProps {
  onBack: () => void;
}

export const C3ProMapSettingsPage = ({ onBack }: C3ProMapSettingsPageProps) => {
  const [autoMapMatching, setAutoMapMatching] = useState(true);
  const [remapPending, setRemapPending] = useState(false);

  const handleRemap = () => {
    setRemapPending(true);
    setTimeout(() => setRemapPending(false), 2500);
  };

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <StatusBar time="15:28" battery="53%" />

      <div className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-0">
        <button
          type="button"
          onClick={onBack}
          className="p-0.5 transition-opacity active:opacity-70"
          aria-label="返回"
        >
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <h1 className="truncate text-[16px] font-semibold leading-tight text-[#111827]">Map Management</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] px-3.5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-bold leading-snug text-[#111827]">Auto Map Matching</p>
              <p className="text-[13px] text-[#6B7280]">( Beta Feature )</p>
            </div>
            <ToggleSwitch checked={autoMapMatching} onChange={setAutoMapMatching} />
          </div>
        </div>

        <ol className="mt-4 list-decimal space-y-2.5 pl-4 text-[12px] leading-relaxed text-[#4B5563]">
          {AUTO_MAP_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ol>

        <div
          className="mt-5 flex items-center justify-center rounded-[10px] px-4 py-6"
          style={{ background: '#5BB8E8' }}
        >
          <div className="w-full max-w-[280px] rounded-[8px] bg-[#B8E4F5] px-4 py-5 text-center">
            <p className="text-[13px] font-bold leading-snug text-[#111827]">
              The current map is virtual. A real pool map will be generated after full cleaning.
            </p>
          </div>
        </div>

        <p className="mt-5 text-[12px] leading-relaxed text-[#4B5563]">
          After the remapping command is issued, the robot will rescan the pool floor and walls. During
          this process, the robot will automatically delete the previously stored map and generate a new
          one to rebuild structural data.
        </p>

        <button
          type="button"
          onClick={handleRemap}
          disabled={remapPending}
          className="mt-6 flex h-[48px] w-full items-center justify-center rounded-full bg-[#111827] text-[15px] font-semibold text-white transition-opacity active:opacity-85 disabled:opacity-60"
        >
          {remapPending ? 'Re-mapping…' : 'Re-map'}
        </button>
      </div>
    </div>
  );
};
