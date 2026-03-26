import { ChevronRight, SlidersHorizontal, MessageSquare, HelpCircle, Info } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { BottomNav } from './BottomNav';
import { userProfile } from '../data/mockData';
import { appBackgroundStyle } from '../config/appBackground';

interface UserCenterPageProps {
  onHome: () => void;
  onGeneral: () => void;
  onFeedback: () => void;
  onHelp: () => void;
  onAbout: () => void;
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

export const UserCenterPage = ({
  onHome,
  onGeneral,
  onFeedback,
  onHelp,
  onAbout,
}: UserCenterPageProps) => (
  <div className="relative w-full min-h-screen flex flex-col" style={appBackgroundStyle}>
    <StatusBar time="14:49" battery="61%" />
    <div
      className="h-[180px] pt-[50px] px-5 pb-5"
      style={{ background: 'linear-gradient(180deg, #00C2FF 0%, #0080FF 100%)' }}
    >
      <div
        className="flex items-center gap-4 p-4 rounded-[16px]"
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
      </div>
    </div>
    <div
      className="flex-1 -mt-5 pt-6 px-5 pb-[100px] rounded-t-[24px]"
      style={{ background: '#F7F8FA' }}
    >
      <MenuItem icon={SlidersHorizontal} label="General" onClick={onGeneral} />
      <MenuItem icon={MessageSquare} label="User Feedback" onClick={onFeedback} />
      <MenuItem icon={HelpCircle} label="Need Help?" onClick={onHelp} />
      <MenuItem icon={Info} label="About WYBOT" onClick={onAbout} />
    </div>
    <BottomNav activeTab="user" onHome={onHome} onUser={() => {}} />
  </div>
);
