import { ArrowLeft, ChevronRight, FileText, Lock, Pencil } from 'lucide-react';
import { useState } from 'react';
import { StatusBar } from './StatusBar';

interface G1DeviceInfoPageProps {
  onBack: () => void;
  onWorkLog: () => void;
  onOpenAntiTheft: () => void;
  deviceName?: string;
}

export const G1DeviceInfoPage = ({ onBack, onWorkLog, onOpenAntiTheft, deviceName = 'WYBOT G1' }: G1DeviceInfoPageProps) => {
  const [shareRobot, setShareRobot] = useState(false);

  const row = (label: string, chevron?: boolean) => (
    <button
      type="button"
      className="flex w-full items-center justify-between border-b border-[#F0F0F0] py-3.5 text-left last:border-0"
    >
      <span className="text-[15px] text-[#111827]">{label}</span>
      <div className="flex items-center gap-2">
        {chevron && <ChevronRight size={18} className="text-[#999999]" />}
      </div>
    </button>
  );

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{ background: '#F5F6F8' }}
    >
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onBack} className="p-1" aria-label="Back">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[16px] font-semibold tracking-wide text-[#111827]">设备信息</span>
      </div>

      <div className="flex-1 px-4 pb-8 pt-2">
        <div className="mb-4 rounded-[16px] bg-white p-4 shadow-sm">
          <div className="text-[12px] font-medium text-[#888888]">设备名称</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[16px] font-semibold text-[#111827]">{deviceName}</span>
            <button type="button" className="p-1 text-[#00C2FF]" aria-label="Edit name">
              <Pencil size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="rounded-[16px] bg-white p-2 px-4 shadow-sm mb-4">
          <div className="flex w-full items-center justify-between border-b border-[#F0F0F0] py-3.5">
            <span className="text-[15px] text-[#111827]">分享我的机器人</span>
            <button
              type="button"
              role="switch"
              aria-checked={shareRobot}
              onClick={() => setShareRobot(!shareRobot)}
              className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${
                shareRobot ? 'bg-[#00C2FF]' : 'bg-[#E5E7EB]'
              }`}
            >
              <span
                className={`pointer-events-none absolute left-[3px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200 ${
                  shareRobot ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {row('固件更新', true)}
          {row('重置WiFi', true)}
          {row('设备校准', true)}
          {row('关于设备', true)}
        </div>

        <div className="rounded-[16px] bg-white p-2 px-4 shadow-sm mb-4">
          <button
            type="button"
            onClick={onWorkLog}
            className="flex w-full items-center justify-between border-b border-[#F0F0F0] py-3.5 text-left last:border-0"
          >
            <div className="flex items-center gap-3">
              <FileText size={20} strokeWidth={2} className="text-[#00C2FF]" />
              <span className="text-[15px] text-[#111827]">工作日志</span>
            </div>
            <ChevronRight size={18} className="text-[#999999]" />
          </button>
        </div>

        {/* 机器防偷管理 */}
        <div className="rounded-[16px] bg-white p-2 px-4 shadow-sm">
          <button
            type="button"
            onClick={onOpenAntiTheft}
            className="flex w-full items-center justify-between py-3.5 text-left"
          >
            <div className="flex items-center gap-3">
              <Lock size={20} strokeWidth={2} className="text-[#FF9800]" />
              <span className="text-[15px] text-[#111827]">机器防偷管理</span>
            </div>
            <ChevronRight size={18} className="text-[#999999]" />
          </button>
        </div>
      </div>
    </div>
  );
};
