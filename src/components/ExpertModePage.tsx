import { ArrowLeft, Check } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { useState } from 'react';
import {
  expertModeFloorCardImages,
  expertModePageBackgrounds,
  expertModeWallCardImages,
  type FloorExpertPattern,
  type WallExpertPattern,
} from '../config/expertModeAssets';

interface ExpertModePageProps {
  onBack: () => void;
}

const FLOOR_ORDER: FloorExpertPattern[] = ['star', 'cross', 's'];
const WALL_ORDER: WallExpertPattern[] = ['h', 'n'];

const stripClassName =
  'relative w-full overflow-hidden rounded-[14px] border border-[#E2E8F0] bg-white shadow-[0_2px_12px_rgba(15,118,170,0.06)] transition-transform active:scale-[0.99]';

export const ExpertModePage = ({ onBack }: ExpertModePageProps) => {
  const [floor, setFloor] = useState<FloorExpertPattern>('star');
  const [wall, setWall] = useState<WallExpertPattern>('n');

  const floorBase = expertModePageBackgrounds.floor;

  return (
    <div className="flex min-h-screen w-full flex-col" style={{ background: '#EEF6FA' }}>
      <StatusBar time="14:49" battery="61%" />
      <div className="flex shrink-0 items-center gap-3 px-4 pb-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-1.5 transition-opacity active:opacity-70"
          aria-label="Back"
        >
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <h1 className="text-[16px] font-semibold tracking-[0.12em] text-[#111827]">EXPERT MODE</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 px-4 pb-8 pt-2">
        <section className="flex flex-col gap-2">
          <h2 className="text-[16px] font-semibold text-[#111827]">Floor</h2>
          <div className="flex flex-col gap-2">
            {FLOOR_ORDER.map((key) => {
              const pathImg = expertModeFloorCardImages[key];
              const selected = floor === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFloor(key)}
                  className={`${stripClassName} h-[68px]`}
                  aria-label={
                    key === 'star' ? 'Star pattern' : key === 'cross' ? 'Cross pattern' : 'S pattern'
                  }
                >
                  <img
                    src={floorBase.src}
                    srcSet={floorBase.srcSet}
                    alt=""
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 z-[1] flex items-center justify-center px-4 py-2">
                    <img
                      src={pathImg.src}
                      srcSet={pathImg.srcSet}
                      alt=""
                      className="max-h-[58%] max-w-[min(88%,220px)] object-contain"
                      draggable={false}
                    />
                  </div>
                  {selected && (
                    <span className="absolute right-2.5 top-2.5 z-[2] flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-sm">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[16px] font-semibold text-[#111827]">Wall</h2>
          <div className="flex flex-col gap-2">
            {WALL_ORDER.map((key) => {
              const pathImg = expertModeWallCardImages[key];
              const base = expertModePageBackgrounds.wall;
              const selected = wall === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setWall(key)}
                  className={`${stripClassName} h-[68px]`}
                  aria-label={key === 'h' ? 'H pattern' : 'N pattern'}
                >
                  <img
                    src={base.src}
                    srcSet={base.srcSet}
                    alt=""
                    className="absolute inset-0 z-0 h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 z-[1] flex items-center justify-center px-4 py-2">
                    <img
                      src={pathImg.src}
                      srcSet={pathImg.srcSet}
                      alt=""
                      className="max-h-[58%] max-w-[min(88%,220px)] object-contain"
                      draggable={false}
                    />
                  </div>
                  {selected && (
                    <span className="absolute bottom-2.5 right-2.5 z-[2] flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-sm">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
