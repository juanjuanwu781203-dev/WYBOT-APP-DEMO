import { useState } from 'react';
import { ArrowLeft, Info, ChevronRight, Zap } from 'lucide-react';
import { StatusBar } from './StatusBar';
import imgB1 from '../assets/devices/device_wybot_b1.png.png';

interface B1DevicePageProps {
  onBack: () => void;
  onOpenDeviceInfo: () => void;
}

export const B1DevicePage = ({ onBack, onOpenDeviceInfo }: B1DevicePageProps) => {
  const [quickClean, setQuickClean] = useState(false);
  const [cleaningMode, setCleaningMode] = useState<'floor' | 'wall' | 'wallfloor' | 'fullpool' | 'ecofloor'>('floor');

  const cleaningModes = [
    { key: 'floor' as const, label: 'Floor', icon: 'floor' },
    { key: 'wall' as const, label: 'Wall', icon: 'wall' },
    { key: 'wallfloor' as const, label: 'Wall then Floor', icon: 'wallfloor' },
    { key: 'fullpool' as const, label: 'Standard Full-Pool', icon: 'fullpool' },
    { key: 'ecofloor' as const, label: 'Eco Floor', icon: 'ecofloor' },
  ];

  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#FFFFFF' }}>
      <StatusBar time="09:06" battery="82%" />

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1">
            <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
          </button>
          <span className="text-[17px] font-semibold text-[#000000]">WYBOT B1</span>
          <button onClick={onOpenDeviceInfo} className="p-1">
            <Info size={18} strokeWidth={2} className="text-[#000000]" />
          </button>
        </div>
        <div className="flex items-center gap-1 text-[#000000]">
          <span className="text-[15px] font-medium">Pool Setup</span>
          <ChevronRight size={20} strokeWidth={2} />
        </div>
      </div>

      <button className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Zap size={16} strokeWidth={2} className="text-[#000000]" />
          <span className="text-[14px] text-[#000000]">Firmware Update</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#F5F6F8' }}>
          <span className="text-[12px] font-medium text-[#666666]">47</span>
        </div>
      </button>

      <div className="flex-1 flex flex-col items-center justify-start pt-4 px-6">
        <div className="w-full h-52 flex items-center justify-center mb-4">
          <img
            src={imgB1}
            alt="WYBOT B1"
            className="w-full h-auto object-contain"
          />
        </div>

        <p className="text-[13px] text-[#666666] text-center leading-5 mb-6 px-2">
          The signal can not transmit through the water, so keep the robot out of the pool when presetting.
        </p>

        <div className="w-full rounded-[16px] p-4 mb-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-[#000000] mb-1">Quick Clean</div>
              <p className="text-[12px] text-[#999999] leading-4">
                In Quick Clean mode, the robot runs for about 50 minutes, ideal for daily maintenance of smaller pools. &gt;
              </p>
            </div>
            <button
              onClick={() => setQuickClean(!quickClean)}
              className="w-12 h-7 rounded-full relative transition-colors flex-shrink-0 ml-4"
              style={{ background: quickClean ? '#00C2FF' : '#E5E7EB' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all"
                style={{ left: quickClean ? '24px' : '4px', boxShadow: '0px 1px 3px rgba(0,0,0,0.15)' }}
              />
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="text-[14px] font-medium text-[#000000] mb-3">Cleaning Mode</div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
            {cleaningModes.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCleaningMode(key)}
                className="flex flex-col items-center justify-center min-w-[64px] py-3 px-2 rounded-[12px] transition-all"
                style={{
                  background: cleaningMode === key ? '#00C2FF' : '#F5F6F8',
                  color: cleaningMode === key ? '#FFFFFF' : '#666666',
                }}
              >
                <CleaningModeIcon mode={key} active={cleaningMode === key} />
                <span className="text-[11px] font-medium mt-1.5 whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 pt-3">
        <button
          className="w-full py-3.5 rounded-[14px] text-[16px] font-semibold text-white transition-opacity active:opacity-90"
          style={{ background: '#00C2FF' }}
        >
          Start Cleaning
        </button>
      </div>
    </div>
  );
};

const CleaningModeIcon = ({ mode, active }: { mode: string; active: boolean }) => {
  const color = active ? '#FFFFFF' : '#00C2FF';

  switch (mode) {
    case 'floor':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="14" width="20" height="10" rx="1" stroke={color} strokeWidth="1.5" />
          <rect x="16" y="18" width="6" height="4" rx="0.5" fill={color} opacity="0.3" />
        </svg>
      );
    case 'wall':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="4" width="10" height="20" rx="1" stroke={color} strokeWidth="1.5" />
          <rect x="4" y="4" width="3" height="20" rx="1" fill={color} opacity="0.3" />
        </svg>
      );
    case 'wallfloor':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="4" width="10" height="20" rx="1" stroke={color} strokeWidth="1.5" />
          <rect x="4" y="4" width="3" height="20" rx="1" fill={color} opacity="0.3" />
          <rect x="4" y="20" width="20" height="4" rx="1" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'fullpool':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="4" width="20" height="20" rx="1" stroke={color} strokeWidth="1.5" />
          <rect x="4" y="4" width="3" height="20" rx="1" fill={color} opacity="0.3" />
          <rect x="4" y="4" width="20" height="3" rx="1" fill={color} opacity="0.3" />
          <rect x="12" y="14" width="8" height="4" rx="0.5" fill={color} opacity="0.2" />
        </svg>
      );
    case 'ecofloor':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="14" width="20" height="10" rx="1" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="20" cy="10" r="4" stroke={color} strokeWidth="1.5" />
          <text x="20" y="12" textAnchor="middle" fill={color} fontSize="6" fontWeight="600">i</text>
        </svg>
      );
    default:
      return null;
  }
};
