import { ArrowLeft, ChevronDown } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { useState } from 'react';

interface GeneralPageProps {
  onBack: () => void;
}

export const GeneralPage = ({ onBack }: GeneralPageProps) => {
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #E6F7F9 0%, #F8F9FA 100%)' }}
    >
      <StatusBar time="14:49" battery="61%" />
      <div className="flex items-center gap-3 px-5 py-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[16px] font-semibold text-[#000000]">General</span>
      </div>
      <div className="px-5 pt-6">
        <div
          className="flex items-center justify-between px-6 py-5 rounded-[28px] mb-6"
          style={{
            background: '#FFFFFF',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <span className="font-medium text-[#000000]">Temperature Unit Setting</span>
          <ChevronDown size={20} strokeWidth={2} className="text-[#000000]" />
        </div>
        <div className="pl-[44px]">
          <button
            onClick={() => setUnit('celsius')}
            className="flex items-center gap-3 py-3"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: unit === 'celsius' ? '#000000' : '#BDBDBD',
                color: '#FFFFFF',
                fontSize: '12px',
              }}
            >
              {unit === 'celsius' ? '✓' : ''}
            </div>
            <span className="text-[#000000]">Celsius</span>
          </button>
          <button
            onClick={() => setUnit('fahrenheit')}
            className="flex items-center gap-3 py-3"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: unit === 'fahrenheit' ? '#000000' : '#BDBDBD',
                color: '#FFFFFF',
                fontSize: '12px',
              }}
            >
              {unit === 'fahrenheit' ? '✓' : ''}
            </div>
            <span className="text-[#000000]">Fahrenheit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
