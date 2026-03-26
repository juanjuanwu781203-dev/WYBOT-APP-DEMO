import { ArrowLeft, ChevronRight } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { userProfile } from '../data/mockData';

interface ProfilePageProps {
  onBack: () => void;
  onExitAccount: () => void;
  onDeleteAccount: () => void;
}

export const ProfilePage = ({ onBack, onExitAccount, onDeleteAccount }: ProfilePageProps) => {
  return (
    <div
      className="w-full flex flex-col"
      style={{ 
        background: '#FFFFFF',
        height: '812px',
        overflow: 'hidden'
      }}
    >
      <StatusBar time="13:01" battery="74%" />
      <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[16px] font-semibold text-[#000000] uppercase">PROFILE</span>
      </div>
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        {/* Profile Photo */}
        <div className="mb-6 p-4 rounded-[16px]" style={{ background: '#F5F5F5' }}>
          <div className="flex items-center justify-between">
            <span className="text-[16px] text-[#000000]">Profile Photo</span>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E5E7EB' }}>
              <span className="text-sm font-medium">2025</span>
            </div>
          </div>
        </div>

        {/* Nickname */}
        <button 
          className="w-full flex items-center justify-between p-4 mb-3 rounded-[16px] transition-opacity active:opacity-90"
          style={{ background: '#F5F5F5' }}
        >
          <span className="text-[16px] text-[#000000]">Nickname</span>
          <div className="flex items-center gap-2">
            <span className="text-[16px] text-[#000000]">{userProfile.name}</span>
            <ChevronRight size={20} strokeWidth={2} className="text-[#666666]" />
          </div>
        </button>

        {/* Exit Current Account */}
        <button 
          onClick={onExitAccount}
          className="w-full flex items-center justify-between p-4 mb-3 rounded-[16px] transition-opacity active:opacity-90"
          style={{ background: '#F5F5F5' }}
        >
          <span className="text-[16px] text-[#000000]">Exit Current Account</span>
          <ChevronRight size={20} strokeWidth={2} className="text-[#666666]" />
        </button>

        {/* Delete Account */}
        <button 
          onClick={onDeleteAccount}
          className="w-full flex items-center justify-between p-4 rounded-[16px] transition-opacity active:opacity-90"
          style={{ background: '#F5F5F5' }}
        >
          <span className="text-[16px] text-[#000000]">Delete Account</span>
          <ChevronRight size={20} strokeWidth={2} className="text-[#666666]" />
        </button>
      </div>
    </div>
  );
};
