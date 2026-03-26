import { ArrowLeft, ChevronRight, Pencil } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { StatusBar } from './StatusBar';

interface DeviceInformationPageProps {
  onBack: () => void;
  deviceName?: string;
  /** 仅 WYBOT C2 Pro Vision 等为 true */
  showJoinVisionProgram?: boolean;
}

export const DeviceInformationPage = ({
  onBack,
  deviceName = 'WYBOT C2Pro Vision',
  showJoinVisionProgram = false,
}: DeviceInformationPageProps) => {
  const [visionProgram, setVisionProgram] = useState(false);

  const row = (label: string, right?: ReactNode, chevron?: boolean) => (
    <button
      type="button"
      className="flex w-full items-center justify-between border-b border-[#F0F0F0] py-3.5 text-left last:border-0"
    >
      <span className="text-[15px] text-[#111827]">{label}</span>
      <div className="flex items-center gap-2">
        {right}
        {chevron && <ChevronRight size={18} className="text-[#999999]" />}
      </div>
    </button>
  );

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{ background: 'linear-gradient(180deg, #C8EEF5 0%, #E8F4F8 28%, #F5F7FA 100%)' }}
    >
      <StatusBar time="14:49" battery="61%" />
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onBack} className="p-1" aria-label="Back">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[16px] font-semibold tracking-wide text-[#111827]">DEVICE INFORMATION</span>
      </div>

      <div className="flex-1 px-4 pb-8 pt-2">
        <div className="mb-4 rounded-[16px] bg-white p-4 shadow-sm">
          <div className="text-[12px] font-medium uppercase tracking-wide text-[#888888]">Device Name</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[16px] font-semibold text-[#111827]">{deviceName}</span>
            <button type="button" className="p-1 text-[#2555D1]" aria-label="Edit name">
              <Pencil size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="rounded-[16px] bg-white p-2 px-4 shadow-sm">
          {row('Share my robot')}
          {showJoinVisionProgram && (
            <div className="flex w-full items-center justify-between border-b border-[#F0F0F0] py-3.5">
              <span className="text-[15px] text-[#111827]">Join Vision Program</span>
              <button
                type="button"
                role="switch"
                aria-checked={visionProgram}
                onClick={() => setVisionProgram(!visionProgram)}
                className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${
                  visionProgram ? 'bg-[#00C2FF]' : 'bg-[#E5E7EB]'
                }`}
              >
                <span
                  className={`pointer-events-none absolute left-[3px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200 ${
                    visionProgram ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}
          {row('Firmware Update', undefined, true)}
          {row('Reset WiFi', undefined, true)}
          {row('Equipment calibration', undefined, true)}
          {row('About the device', undefined, true)}
        </div>
      </div>
    </div>
  );
};
