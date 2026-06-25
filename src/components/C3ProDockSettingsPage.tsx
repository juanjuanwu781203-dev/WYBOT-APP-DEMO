import { ArrowLeft } from 'lucide-react';
import { StatusBar } from './StatusBar';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${
        checked ? 'bg-[#00C2FF]' : 'bg-[#E5E7EB]'
      }`}
    >
      <span
        className={`pointer-events-none absolute left-[3px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export interface C3ProDockSettingsPageProps {
  onBack: () => void;
  returnToShore: boolean;
  onReturnToShoreChange: (value: boolean) => void;
}

export const C3ProDockSettingsPage = ({
  onBack,
  returnToShore,
  onReturnToShoreChange,
}: C3ProDockSettingsPageProps) => {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#F5F6F8]">
      <StatusBar time="15:28" battery="53%" />

      <div className="flex shrink-0 items-center gap-2 border-b border-[#E8EAED] bg-white px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="p-0.5 transition-opacity active:opacity-70"
          aria-label="返回"
        >
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <h1 className="text-[16px] font-semibold text-[#111827]">桩与充电</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div
          className="rounded-[16px] bg-white p-4"
          style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#111827]">回桩后上岸充电</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[#6B7280]">
                开启后，机器人回桩时将离开水面，在岸上充电座完成充电与对接。
              </p>
            </div>
            <ToggleSwitch checked={returnToShore} onChange={onReturnToShoreChange} />
          </div>
        </div>

        <div
          className="mt-3 rounded-[16px] border border-[#E5E7EB] bg-white p-4"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <p className="text-[13px] font-semibold text-[#111827]">
            {returnToShore ? '当前：回桩后上岸充电' : '当前：回桩后水下充电'}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-[#6B7280]">
            {returnToShore
              ? '点击「Return to Dock」时，机器人将上岸并停靠充电座。适用于需要岸上维护或太阳能补能的场景。'
              : '关闭后，机器人可仅停靠在水下桩充电，无需上岸。适用于希望减少出水次数、缩短回桩时间的场景。'}
          </p>
        </div>

        <p className="mt-4 px-1 text-[11px] leading-relaxed text-[#9CA3AF]">
          请确保水下桩与岸上充电座已正确安装并完成配对。修改设置后，下一次回桩指令生效。
        </p>
      </div>
    </div>
  );
};
