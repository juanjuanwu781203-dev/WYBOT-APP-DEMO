import { useState } from 'react';
import { RefreshCw, ScanLine, ChevronRight, ChevronDown, SlidersHorizontal, MessageSquare, HelpCircle, Info, Bluetooth, Wifi } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { BottomNav } from './BottomNav';
import { userProfile } from '../data/mockData';
import { appBackgroundStyle } from '../config/appBackground';
import { homeAssets } from '../config/homeAssets';
import deviceCardBg from '../assets/backgrounds/device-card-background.png';
import c2pvDevice from '../assets/devices/device_wybot_c2pv.png.png';
import s3Device from '../assets/devices/device_wybot_s3.png.png';
import type { DeviceControlModel } from '../config/deviceControlModels';

interface MainPageProps {
  onNotice: () => void;
  onAddDevice: () => void;
  onOpenDeviceControl: (model: DeviceControlModel) => void;
  onGeneral: () => void;
  onFeedback: () => void;
  onHelp: () => void;
  onAbout: () => void;
  onProfile: () => void;
  activeTab: 'home' | 'user';
  onTabChange: (tab: 'home' | 'user') => void;
}

const MenuItem = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-5 py-4 mb-3 rounded-[20px] text-left transition-opacity active:opacity-90"
    style={{
      background: '#FFFFFF',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
    }}
  >
    <Icon size={20} strokeWidth={2} className="text-[#000000]" />
    <span className="flex-1 font-medium text-[#000000]">{label}</span>
    <ChevronRight size={20} strokeWidth={2} className="text-[#666666]" />
  </button>
);

export const MainPage = ({
  onNotice,
  onAddDevice,
  onGeneral,
  onFeedback,
  onHelp,
  onAbout,
  onProfile,
  onOpenDeviceControl,
  activeTab,
  onTabChange,
}: MainPageProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTemperature, setShowTemperature] = useState(true);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col" style={appBackgroundStyle}>
      {/* 主页内容 */}
      {activeTab === 'home' && (
        <div className="flex flex-col flex-1">
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
              onClick={() => {
                handleRefresh();
                setShowTemperature(!showTemperature);
              }}
              className="flex items-center justify-between px-4 py-2 rounded-[9999px] w-full max-w-[260px] text-left transition-opacity active:opacity-80"
              style={{ background: '#000000', color: '#FFFFFF' }}
            >
              <div className="flex items-center gap-2">
                <RefreshCw
                  size={17}
                  strokeWidth={2}
                  className={`flex-shrink-0 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span className="flex-1 min-w-0 text-[13px] font-medium truncate">Outdoor Temperature</span>
                {showTemperature && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#F87171' }} />
                    <span className="text-[13px] font-medium flex-shrink-0">15°C</span>
                  </>
                )}
              </div>
              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`flex-shrink-0 transition-transform duration-300 ${showTemperature ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          <div className="flex justify-between items-center px-5 pb-4">
            <span className="text-[16px] font-semibold text-[#000000]">My Device</span>
            <ScanLine size={22} strokeWidth={2} className="text-[#000000]" aria-hidden />
          </div>
          <div className="px-5 pb-[100px] flex-1">
            <div className="grid grid-cols-2 gap-3 w-full min-w-0">
              <button
                type="button"
                onClick={() => onOpenDeviceControl('c2pv')}
                className="aspect-square w-full min-w-0 rounded-[24px] overflow-hidden relative cursor-pointer transition-transform active:scale-95 text-left border-0 p-0 bg-transparent"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center flex items-end justify-end p-4"
                  style={{ backgroundImage: `url(${deviceCardBg})` }}
                >
                  <img
                    src={c2pvDevice}
                    alt="WYBOT C2Pro Vision"
                    className="w-2/3 h-auto object-contain"
                  />
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
                  <span className="text-black text-sm font-medium">WYBOT C2Pro Vision</span>
                  <div className="flex gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bluetooth size={12} strokeWidth={3} className="text-white" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Wifi size={12} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onOpenDeviceControl('c1')}
                className="aspect-square w-full min-w-0 rounded-[24px] overflow-hidden relative cursor-pointer transition-transform active:scale-95 text-left border-0 p-0 bg-transparent"
              >
                <div className="absolute inset-0 bg-cover bg-center flex items-end justify-end p-4" style={{ backgroundImage: 'url(/src/assets/backgrounds/device-card-background.png)' }}>
                  <img 
                    src="/src/assets/devices/device_wybot_c1.png.png" 
                    alt="WYBOT C1" 
                    className="w-2/3 h-auto object-contain"
                  />
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
                  <span className="text-black text-sm font-medium">WYBOT C1</span>
                  <div className="flex gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bluetooth size={12} strokeWidth={3} className="text-white" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Wifi size={12} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onOpenDeviceControl('s2')}
                className="aspect-square w-full min-w-0 rounded-[24px] overflow-hidden relative cursor-pointer transition-transform active:scale-95 text-left border-0 p-0 bg-transparent"
              >
                <div className="absolute inset-0 bg-cover bg-center flex items-end justify-end p-4" style={{ backgroundImage: 'url(/src/assets/backgrounds/device-card-background.png)' }}>
                  <img 
                    src="/src/assets/devices/device_wybot_s2.png.png" 
                    alt="WYBOT S2" 
                    className="w-2/3 h-auto object-contain"
                  />
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
                  <span className="text-black text-sm font-medium">WYBOT S2</span>
                  <div className="flex gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bluetooth size={12} strokeWidth={3} className="text-white" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Wifi size={12} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onOpenDeviceControl('s2sv')}
                className="aspect-square w-full min-w-0 rounded-[24px] overflow-hidden relative cursor-pointer transition-transform active:scale-95 text-left border-0 p-0 bg-transparent"
              >
                <div className="absolute inset-0 bg-cover bg-center flex items-end justify-end p-4" style={{ backgroundImage: 'url(/src/assets/backgrounds/device-card-background.png)' }}>
                  <img 
                    src="/src/assets/devices/device_wybot_s2sv.png.png" 
                    alt="WYBOT S2SV" 
                    className="w-1/2 h-auto object-contain"
                  />
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
                  <span className="text-black text-sm font-medium">WYBOT S2SV</span>
                  <div className="flex gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bluetooth size={12} strokeWidth={3} className="text-white" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Wifi size={12} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onOpenDeviceControl('s3')}
                className="aspect-square w-full min-w-0 rounded-[24px] overflow-hidden relative cursor-pointer transition-transform active:scale-95 text-left border-0 p-0 bg-transparent"
              >
                <div className="absolute inset-0 bg-cover bg-center flex items-end justify-end p-4" style={{ backgroundImage: 'url(/src/assets/backgrounds/device-card-background.png)' }}>
                  <img 
                    src={s3Device} 
                    alt="WYBOT S3" 
                    className="w-1/2 h-auto object-contain"
                  />
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none">
                  <span className="text-black text-sm font-medium">WYBOT S3</span>
                  <div className="flex gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bluetooth size={12} strokeWidth={3} className="text-white" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Wifi size={12} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                </div>
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
        </div>
      )}

      {/* 个人中心内容 */}
      {activeTab === 'user' && (
        <div className="flex flex-col flex-1">
          <StatusBar time="14:49" battery="61%" />
          <div
            className="h-[180px] pt-[50px] px-5 pb-5 bg-cover bg-center"
            style={{ backgroundImage: 'url(/water-bg.jpg.png)' }}
          >
            <button
              onClick={onProfile}
              className="flex items-center gap-4 p-4 rounded-[16px] w-full transition-opacity active:opacity-90"
              style={{
                background: '#FFFFFF',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{ background: '#2555D1', color: '#FFFFFF' }}
              >
                ⚡
              </div>
              <div className="flex-1">
                <div className="text-[16px] font-semibold text-[#000000]">{userProfile.name}</div>
                <div className="text-[14px] text-[#333333]">{userProfile.email}</div>
              </div>
              <ChevronRight size={20} strokeWidth={2} className="text-[#666666]" />
            </button>
          </div>
          <div
            className="flex-1 -mt-5 pt-6 px-5 pb-[100px] rounded-t-[24px]"
            style={{ background: '#FFFFFF' }}
          >
            <MenuItem icon={SlidersHorizontal} label="General" onClick={onGeneral} />
            <MenuItem icon={MessageSquare} label="User Feedback" onClick={onFeedback} />
            <MenuItem icon={HelpCircle} label="Need Help?" onClick={onHelp} />
            <MenuItem icon={Info} label="About WYBOT" onClick={onAbout} />
          </div>
        </div>
      )}

      {/* 底部导航 */}
      <BottomNav
        activeTab={activeTab}
        onHome={() => onTabChange('home')}
        onUser={() => onTabChange('user')}
      />
    </div>
  );
};
