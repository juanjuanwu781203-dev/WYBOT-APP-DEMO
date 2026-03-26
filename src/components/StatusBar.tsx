import { Signal, Wifi, Battery } from 'lucide-react';

interface StatusBarProps {
  time?: string;
  battery?: string;
  /** dark：深色背景页用浅色状态栏 */
  variant?: 'light' | 'dark';
}

export const StatusBar = ({
  time = '14:49',
  battery = '61%',
  variant = 'light',
}: StatusBarProps) => (
  <div
    className={`h-[44px] px-[24px] flex justify-between items-center text-[14px] font-medium ${
      variant === 'dark' ? 'text-white' : 'text-[#000000]'
    }`}
  >
    <span>{time}</span>
    <div className="flex items-center gap-1">
      <Signal size={14} strokeWidth={2} />
      <Wifi size={14} strokeWidth={2} />
      <Battery size={14} strokeWidth={2} />
      <span className="ml-0.5">{battery}</span>
    </div>
  </div>
);
