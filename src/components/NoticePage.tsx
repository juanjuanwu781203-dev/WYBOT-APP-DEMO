import { ArrowLeft } from 'lucide-react';
import { StatusBar } from './StatusBar';

interface NoticePageProps {
  onBack: () => void;
}

export const NoticePage = ({ onBack }: NoticePageProps) => (
  <div
    className="w-full min-h-screen flex flex-col"
    style={{ background: 'linear-gradient(180deg, #E0F7FA 0%, #FFFFFF 100%)' }}
  >
    <StatusBar time="14:49" battery="61%" />
    <div className="flex items-center gap-3 px-5 py-3">
      <button onClick={onBack} className="p-1">
        <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
      </button>
      <span className="text-[16px] font-semibold text-[#000000] uppercase">NOTICE</span>
    </div>
    <div className="flex-1 flex items-center justify-center px-10">
      <p className="text-[16px] text-[#000000] text-center">You have no notifications</p>
    </div>
  </div>
);
