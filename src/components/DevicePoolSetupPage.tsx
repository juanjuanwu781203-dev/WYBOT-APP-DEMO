import type { Dispatch, SetStateAction } from 'react';
import { ArrowLeft, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { StatusBar } from './StatusBar';
import poolPillThumb from '../assets/pools/pool-diamond.png.png';

export interface DevicePoolEntry {
  id: number;
  name: string;
  image: string;
  selected: boolean;
}

interface DevicePoolSetupPageProps {
  onBack: () => void;
  onAddPool: () => void;
  pools: DevicePoolEntry[];
  setPools: Dispatch<SetStateAction<DevicePoolEntry[]>>;
}

export const DevicePoolSetupPage = ({
  onBack,
  onAddPool,
  pools,
  setPools,
}: DevicePoolSetupPageProps) => {
  const thumb = poolPillThumb;

  const handleSelect = (id: number) => {
    setPools((prev) => prev.map((p) => ({ ...p, selected: p.id === id })));
  };

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{
        background: 'linear-gradient(180deg, #D4EDF5 0%, #EEF6FA 18%, #FFFFFF 32%)',
      }}
    >
      <StatusBar time="14:49" battery="61%" />
      <div className="flex shrink-0 items-center gap-3 px-4 pb-3 pt-1">
        <button type="button" onClick={onBack} className="p-0.5" aria-label="Back">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#111827]" />
        </button>
        <h1 className="text-[16px] font-semibold text-[#111827]">Pool Setup</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-5 pt-2">
          {pools.map((pool) => (
            <div key={pool.id} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSelect(pool.id)}
                className="relative flex h-[52px] w-full items-center overflow-hidden rounded-[999px] border border-[#E5E7EB] bg-[#ECEFF1] text-left shadow-sm transition-opacity active:opacity-90"
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 w-[48%] max-w-[200px] overflow-hidden rounded-l-[999px]">
                  <img src={thumb} alt="" className="h-full w-full object-cover" draggable={false} />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(236,239,241,0.35) 45%, #ECEFF1 78%, #ECEFF1 100%)',
                    }}
                  />
                </div>
                <span className="relative z-[1] flex flex-1 justify-center pr-10 text-[15px] font-medium text-[#111827]">
                  {pool.name}
                </span>
                {pool.selected && (
                  <span className="absolute right-3 top-1/2 z-[1] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
              </button>
              <div className="flex justify-end gap-5 pr-1">
                <button
                  type="button"
                  className="flex items-center gap-1 text-[13px] text-[#111827] transition-opacity active:opacity-70"
                  aria-label={`Edit ${pool.name}`}
                >
                  <Pencil size={16} strokeWidth={2} className="text-[#111827]" />
                  Edit
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[13px] text-[#111827] transition-opacity active:opacity-70"
                  aria-label={`Delete ${pool.name}`}
                >
                  <Trash2 size={16} strokeWidth={2} className="text-[#111827]" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={onAddPool}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white shadow-md transition-opacity active:opacity-85"
            aria-label="Add pool"
          >
            <Plus size={32} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
