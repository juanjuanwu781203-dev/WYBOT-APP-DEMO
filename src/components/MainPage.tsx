import { useState } from 'react';
import {
  Bluetooth,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Info,
  MessageSquare,
  Plus,
  RefreshCw,
  ScanLine,
  SlidersHorizontal,
  Wifi,
} from 'lucide-react';
import { StatusBar } from './StatusBar';
import { BottomNav } from './BottomNav';
import { userProfile } from '../data/mockData';
import type { DeviceControlModel } from '../config/deviceControlModels';
import { appBackgroundStyle } from '../config/appBackground';
import { homeAssets } from '../config/homeAssets';
import deviceCardBackground from '../assets/backgrounds/device-card-background.png';
import imgC2p from '../assets/devices/device_wybot_c2p.png.png';
import imgC1 from '../assets/devices/device_wybot_c1.png.png';
import imgS2 from '../assets/devices/device_wybot_s2.png.png';
import imgS2sv from '../assets/devices/device_wybot_s2sv.png.png';
import imgS3 from '../assets/devices/device_wybot_s3.png.png';
import imgU1 from '../assets/devices/device_wybot_u1.png.png';
import imgG1 from '../assets/devices/device_wybot_g1.png';
import imgB1 from '../assets/devices/device_wybot_b1.png.png';
import imgC3pro from '../assets/devices/device_wybot_u1.png.png';

interface MainPageProps {
  onNotice: () => void;
  onAddDevice: () => void;
  onGeneral: () => void;
  onFeedback: () => void;
  onHelp: () => void;
  onAbout: () => void;
  onProfile: () => void;
  activeTab: 'home' | 'user';
  onTabChange: (tab: 'home' | 'user') => void;
  onOpenDeviceControl: (model: DeviceControlModel) => void;
}

const DEVICE_ORDER: DeviceControlModel[] = ['g1', 'c2pv', 's3', 's2sv', 'u1', 'c1', 's2', 'b1', 'c3pro'];

const DEVICE_IMAGES: Record<DeviceControlModel, string> = {
  c2pv: imgC2p,
  c1: imgC1,
  s2: imgS2,
  s2sv: imgS2sv,
  s3: imgS3,
  u1: imgU1,
  g1: imgG1,
  b1: imgB1,
  c3pro: imgC3pro,
};

const DEVICE_NAMES: Record<DeviceControlModel, string> = {
  c2pv: 'WYBOT C2Pro Vision',
  c1: 'WYBOT C1',
  s2: 'WYBOT S2',
  s2sv: 'WYBOT S2SV',
  s3: 'WYBOT S3',
  u1: 'WYBOT U1',
  g1: 'WYBOT G1',
  b1: 'WYBOT B1',
  c3pro: 'WYBOT C3PRO',
};

const DEVICE_META: Record<DeviceControlModel, { label: string; status: string; bg: string; imageClass: string }> = {
  g1: { label: 'Lawn', status: 'Ready to map', bg: 'linear-gradient(145deg, #DFF7DF 0%, #A9E6B3 55%, #77D28D 100%)', imageClass: 'w-[150%] translate-x-8 translate-y-4' },
  c2pv: { label: 'Pool', status: 'Online', bg: `url(${deviceCardBackground})`, imageClass: 'w-[78%]' },
  c1: { label: 'Pool', status: 'Online', bg: `url(${deviceCardBackground})`, imageClass: 'w-[76%]' },
  s2: { label: 'Pool', status: 'Online', bg: `url(${deviceCardBackground})`, imageClass: 'w-[70%]' },
  s2sv: { label: 'Pool', status: 'Online', bg: `url(${deviceCardBackground})`, imageClass: 'w-[58%]' },
  s3: { label: 'Pool', status: 'Online', bg: `url(${deviceCardBackground})`, imageClass: 'w-[60%]' },
  u1: { label: 'Pool', status: 'Online', bg: `url(${deviceCardBackground})`, imageClass: 'w-[118%] translate-x-7 translate-y-3' },
  b1: { label: 'Pool', status: 'Online', bg: `url(${deviceCardBackground})`, imageClass: 'w-[118%] translate-x-7 translate-y-3' },
  c3pro: { label: 'Pool', status: 'Online', bg: `url(${deviceCardBackground})`, imageClass: 'w-[110%] translate-x-5 translate-y-3' },
};

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
    className="mb-3 flex w-full items-center gap-3 rounded-[20px] bg-white px-5 py-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:opacity-90"
  >
    <Icon size={20} strokeWidth={2} className="text-[#000000]" />
    <span className="flex-1 font-medium text-[#000000]">{label}</span>
    <ChevronRight size={20} strokeWidth={2} className="text-[#666666]" />
  </button>
);

const DeviceCard = ({ model, onClick }: { model: DeviceControlModel; onClick: () => void }) => {
  const meta = DEVICE_META[model];
  const bgStyle = meta.bg.startsWith('url(')
    ? { backgroundImage: meta.bg, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: meta.bg };

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[156px] overflow-hidden rounded-[24px] text-left shadow-[0_10px_24px_rgba(30,41,59,0.10)] transition-transform active:scale-[0.98]"
      style={bgStyle}
    >
      <div className="absolute inset-0 bg-white/10" />
      <div className="absolute left-3 top-3 z-10">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#111827]">{meta.label}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          <span className="text-[10px] font-medium text-[#374151]">{meta.status}</span>
        </div>
        <div className="max-w-[120px] text-[15px] font-semibold leading-5 text-[#111827]">{DEVICE_NAMES[model]}</div>
        <div className="mt-2 flex gap-1.5">
          <div className="grid h-6 w-6 place-items-center rounded-full bg-[#2555D1]">
            <Bluetooth size={12} strokeWidth={3} className="text-white" />
          </div>
          <div className="grid h-6 w-6 place-items-center rounded-full bg-[#2555D1]">
            <Wifi size={12} strokeWidth={3} className="text-white" />
          </div>
        </div>
      </div>
      <img
        src={DEVICE_IMAGES[model]}
        alt={DEVICE_NAMES[model]}
        className={`absolute bottom-0 right-0 h-auto object-contain drop-shadow-xl ${meta.imageClass}`}
      />
    </button>
  );
};

export const MainPage = ({
  onNotice,
  onAddDevice,
  onGeneral,
  onFeedback,
  onHelp,
  onAbout,
  onProfile,
  activeTab,
  onTabChange,
  onOpenDeviceControl,
}: MainPageProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTemperature, setShowTemperature] = useState(true);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="relative flex h-full w-full flex-col" style={appBackgroundStyle}>
      {activeTab === 'home' && (
        <div className="flex min-h-0 flex-1 flex-col">
          <StatusBar time="14:49" battery="61%" />
          <div className="flex items-center justify-between bg-transparent px-5 py-3">
            <img
              src={homeAssets.logo}
              alt="WYBOT"
              width={120}
              height={36}
              className="h-[32px] w-auto select-none object-contain object-left mix-blend-multiply"
              draggable={false}
            />
            <button type="button" onClick={onNotice} className="flex items-center justify-center p-1" aria-label="通知">
              <img src={homeAssets.iconBell} alt="" width={24} height={24} className="block h-6 w-6 object-contain" draggable={false} />
            </button>
          </div>

          <div className="px-5">
            <button
              type="button"
              onClick={() => setShowTemperature(!showTemperature)}
              className="flex w-full items-center justify-between rounded-[20px] bg-[#111827] px-4 py-3 text-left text-white active:opacity-90"
            >
              <div className="flex min-w-0 items-center gap-2">
                <RefreshCw
                  size={17}
                  strokeWidth={2}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefresh();
                  }}
                  className={`shrink-0 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span className="truncate text-[13px] font-medium">Outdoor Temperature</span>
                {showTemperature && (
                  <>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F87171]" />
                    <span className="shrink-0 text-[13px] font-medium">15°C</span>
                  </>
                )}
              </div>
              <ChevronDown size={16} strokeWidth={2} className={`shrink-0 transition-transform duration-300 ${showTemperature ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <div>
              <div className="text-[20px] font-semibold text-[#111827]">My Devices</div>
              <div className="mt-0.5 text-[12px] text-[#6B7280]">Pool cleaners and lawn mowers in one place</div>
            </div>
            <ScanLine size={22} strokeWidth={2} className="text-[#000000]" aria-hidden />
          </div>

          <div className="relative min-h-0 flex-1">
            <div className="h-full overflow-y-auto px-5 pb-[100px]">
              <div className="grid w-full min-w-0 grid-cols-2 gap-3">
                {DEVICE_ORDER.map((model) => (
                  <DeviceCard key={model} model={model} onClick={() => onOpenDeviceControl(model)} />
                ))}
                <button
                  type="button"
                  onClick={onAddDevice}
                  className="flex h-[156px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#A8B1BD] bg-white/75 text-[#111827] active:opacity-80"
                >
                  <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-[#E0F4FF]">
                    <Plus size={26} strokeWidth={2.2} className="text-[#00A7E1]" />
                  </div>
                  <span className="text-[14px] font-semibold">Add Device</span>
                </button>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgba(245,245,245,0.9)] to-transparent" />
          </div>
        </div>
      )}

      {activeTab === 'user' && (
        <div className="flex min-h-0 flex-1 flex-col">
          <StatusBar time="14:49" battery="61%" />
          <div className="h-[180px] bg-cover bg-center px-5 pb-5 pt-[50px]" style={{ backgroundImage: 'url(/water-bg.jpg.png)' }}>
            <button onClick={onProfile} className="flex w-full items-center gap-4 rounded-[16px] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:opacity-90">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2555D1] text-2xl text-white">W</div>
              <div className="flex-1">
                <div className="text-[18px] text-[#000000]">{userProfile.name}</div>
                <div className="text-[14px] text-[#333333]">{userProfile.email}</div>
              </div>
              <ChevronRight size={20} strokeWidth={2} className="text-[#666666]" />
            </button>
          </div>
          <div className="-mt-5 flex-1 rounded-t-[24px] bg-white px-5 pb-[100px] pt-6">
            <MenuItem icon={SlidersHorizontal} label="General" onClick={onGeneral} />
            <MenuItem icon={MessageSquare} label="User Feedback" onClick={onFeedback} />
            <MenuItem icon={HelpCircle} label="Need Help?" onClick={onHelp} />
            <MenuItem icon={Info} label="About WYBOT" onClick={onAbout} />
          </div>
        </div>
      )}

      <BottomNav activeTab={activeTab} onHome={() => onTabChange('home')} onUser={() => onTabChange('user')} />
    </div>
  );
};
