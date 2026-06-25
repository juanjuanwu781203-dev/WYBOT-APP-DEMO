import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { StatusBar } from './StatusBar';

interface RemoteControlPageProps {
  onBack: () => void;
}

export const RemoteControlPage = ({ onBack }: RemoteControlPageProps) => {
  const [activeDirection, setActiveDirection] = useState<string | null>(null);

  const handleDirectionClick = (direction: string) => {
    setActiveDirection(direction);
    setTimeout(() => setActiveDirection(null), 200);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#F5F6F8]">
      <StatusBar time="14:49" battery="61%" />

      <div className="flex shrink-0 items-center gap-2 px-4 pb-1 pt-0">
        <button type="button" onClick={onBack} className="p-0.5" aria-label="返回">
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <div className="flex min-w-0 flex-1 items-center">
          <span className="truncate text-[16px] font-semibold leading-tight text-[#111827]">
            Remote Control
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pb-4">
        {/* 方向控制区域 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-[240px] h-[240px]">
            {/* 中心圆 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#00C2FF] shadow-lg flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/30" />
            </div>

            {/* 上按钮 */}
            <button
              type="button"
              onClick={() => handleDirectionClick('up')}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                activeDirection === 'up'
                  ? 'bg-[#00C2FF] scale-95 text-white'
                  : 'bg-white shadow-md hover:bg-[#F0F9FF] active:bg-[#00C2FF] active:text-white'
              }`}
              aria-label="前进"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>

            {/* 下按钮 */}
            <button
              type="button"
              onClick={() => handleDirectionClick('down')}
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                activeDirection === 'down'
                  ? 'bg-[#00C2FF] scale-95 text-white'
                  : 'bg-white shadow-md hover:bg-[#F0F9FF] active:bg-[#00C2FF] active:text-white'
              }`}
              aria-label="后退"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12l7 7-7-7" />
              </svg>
            </button>

            {/* 左按钮 */}
            <button
              type="button"
              onClick={() => handleDirectionClick('left')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                activeDirection === 'left'
                  ? 'bg-[#00C2FF] scale-95 text-white'
                  : 'bg-white shadow-md hover:bg-[#F0F9FF] active:bg-[#00C2FF] active:text-white'
              }`}
              aria-label="左转"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 右按钮 */}
            <button
              type="button"
              onClick={() => handleDirectionClick('right')}
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                activeDirection === 'right'
                  ? 'bg-[#00C2FF] scale-95 text-white'
                  : 'bg-white shadow-md hover:bg-[#F0F9FF] active:bg-[#00C2FF] active:text-white'
              }`}
              aria-label="右转"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 提示文字 */}
        <p className="text-center text-[10px] text-[#999999]">
          Tap directional buttons to control the robot
        </p>
      </div>
    </div>
  );
};
