import { useState } from 'react';
import { RefreshCw, ScanLine } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { BottomNav } from './BottomNav';
import { appBackgroundStyle } from '../config/appBackground';
import { homeAssets } from '../config/homeAssets';

interface HomePageProps {
  onNotice: () => void;
  onAddDevice: () => void;
  onUserCenter: () => void;
}

export const HomePage = ({ onNotice, onAddDevice, onUserCenter }: HomePageProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col" style={appBackgroundStyle}>
      <StatusBar time="14:49" battery="61%" />
      <div className="flex justify-between items-center px-5 py-3 bg-transparent">
        <img
          src={homeAssets.logo}
          alt="WYBOT"
          width={120}
          height={36}
          className="h-[32px] w-auto object-contain object-left select-none mix-blend-multiply"
          draggable={false}
        />
        <button
          type="button"
          onClick={onNotice}
          className="p-1 flex items-center justify-center"
          aria-label="通知"
        >
          <img
            src={homeAssets.iconBell}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 object-contain block"
            draggable={false}
          />
        </button>
      </div>
      <div className="flex justify-center px-5 mb-5">
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-[9999px] w-full max-w-[260px] text-left transition-opacity active:opacity-80"
          style={{ background: '#000000', color: '#FFFFFF' }}
        >
          <RefreshCw
            size={17}
            strokeWidth={2}
            className={`flex-shrink-0 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span className="flex-1 min-w-0 text-[13px] font-medium truncate">Outdoor Temperature</span>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#F87171' }} />
          <span className="text-[13px] font-medium flex-shrink-0">15°C</span>
        </button>
      </div>
      <div className="flex justify-between items-center px-5 pb-4">
        <span className="text-[16px] font-semibold text-[#000000]">My Device</span>
        <ScanLine size={22} strokeWidth={2} className="text-[#000000]" aria-hidden />
      </div>
      <div className="px-5 pb-[100px]">
        <div className="grid grid-cols-2 gap-3 w-full min-w-0">
          <button
            type="button"
            onClick={onAddDevice}
            className="aspect-square w-full min-w-0 flex items-center justify-center rounded-[24px] text-4xl font-light transition-opacity active:opacity-80"
            style={{ background: '#E5E7EB', color: '#000000' }}
          >
            +
          </button>
          <button
            type="button"
            onClick={onAddDevice}
            className="aspect-square w-full min-w-0 flex items-center justify-center rounded-[24px] text-4xl font-light transition-opacity active:opacity-80"
            style={{ background: '#E5E7EB', color: '#000000' }}
          >
            +
          </button>
        </div>
      </div>
      <BottomNav activeTab="home" onHome={() => {}} onUser={onUserCenter} />
  </div>
  );
};
