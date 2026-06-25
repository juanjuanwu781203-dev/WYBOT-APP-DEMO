import { useState } from 'react';
import { ArrowLeft, ChevronRight, Lock, Plus, Wifi, X } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { networks } from '../data/mockData';

interface SelectNetworkPageProps {
  onBack: () => void;
  onSetLater: () => void;
  onSelectNetwork: (network: string) => void;
  selectedDeviceModel?: string;
}

export const SelectNetworkPage = ({ onBack, onSetLater, onSelectNetwork, selectedDeviceModel }: SelectNetworkPageProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualSsid, setManualSsid] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const isG1 = selectedDeviceModel === 'WYBOT G1';

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setTimeout(() => onSelectNetwork(network), 350);
  };

  const handleManualJoin = () => {
    const ssid = manualSsid.trim();
    if (!ssid) return;
    setSelectedNetwork(ssid);
    setShowManualAdd(false);
    setTimeout(() => onSelectNetwork(ssid), 350);
  };

  return (
    <div className="relative flex h-[812px] w-full flex-col overflow-hidden bg-white">
      <StatusBar time="14:51" battery="60%" />
      <div className="flex shrink-0 items-center gap-3 px-5 py-3">
        <button onClick={onBack} className="p-1" aria-label="返回">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[18px] font-semibold text-[#000000]">Select Wi-Fi</span>
      </div>

      <div className="px-5 py-4">
        <div className="space-y-3">
          {networks.map((network) => (
            <button
              key={network.ssid}
              onClick={() => handleNetworkSelect(network.ssid)}
              className="flex w-full items-center gap-3 rounded-[14px] border p-4 text-left transition-all"
              style={{
                background: selectedNetwork === network.ssid ? '#E0F4FF' : '#F3F4F6',
                borderColor: selectedNetwork === network.ssid ? '#00C2FF' : 'transparent',
              }}
            >
              <Wifi size={20} strokeWidth={2} className={selectedNetwork === network.ssid ? 'text-[#00A7E1]' : 'text-[#111827]'} />
              <span className="flex-1 text-[15px] font-medium text-[#111827]">{network.ssid}</span>
              <Lock size={15} strokeWidth={2} className="text-[#9CA3AF]" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end px-5 pb-8">
        <button
          onClick={() => setShowManualAdd(true)}
          className="mb-3 flex w-full items-center gap-3 rounded-[18px] bg-[#F3F4F6] px-4 py-4 text-left active:opacity-90"
        >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white">
            <Plus size={18} strokeWidth={2.2} className="text-[#00A7E1]" />
          </div>
          <span className="flex-1 text-[15px] font-semibold text-[#111827]">手动添加 Wi-Fi</span>
          <ChevronRight size={18} strokeWidth={2} className="text-[#9CA3AF]" />
        </button>

        <div className="mb-4 rounded-[18px] bg-[#F5F8FB] p-4">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-[#111827]">
            <Wifi size={19} strokeWidth={2} className="text-[#00A7E1]" />
            {isG1 ? 'G1Pro 需要连接 2.4GHz Wi-Fi' : 'Only 2.4GHz Wi-Fi networks are supported'}
          </div>
        </div>

        {!isG1 && (
          <button
            onClick={onSetLater}
            className="w-full rounded-full bg-[#111827] py-4 text-[16px] font-semibold text-white active:opacity-90"
          >
            Set Later
          </button>
        )}
      </div>

      {showManualAdd && (
        <div className="absolute inset-0 z-40 flex items-end bg-black/35">
          <div className="w-full rounded-t-[28px] bg-white px-5 pb-6 pt-4 shadow-[0_-12px_36px_rgba(15,23,42,0.18)]">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => setShowManualAdd(false)} className="grid h-8 w-8 place-items-center rounded-full bg-[#F3F4F6]" aria-label="关闭">
                <X size={17} strokeWidth={2.2} className="text-[#111827]" />
              </button>
              <div className="text-[16px] font-semibold text-[#111827]">手动加入网络</div>
              <button
                onClick={handleManualJoin}
                disabled={!manualSsid.trim()}
                className="text-[14px] font-semibold text-[#00A7E1] disabled:text-[#CBD5E1]"
              >
                加入
              </button>
            </div>

            <div className="overflow-hidden rounded-[16px] bg-[#F3F4F6]">
              <label className="flex items-center border-b border-white px-4 py-3">
                <span className="w-20 text-[14px] text-[#6B7280]">名称</span>
                <input
                  value={manualSsid}
                  onChange={(event) => setManualSsid(event.target.value)}
                  placeholder="输入网络名称"
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#A0A7B2]"
                />
              </label>
              <div className="flex items-center border-b border-white px-4 py-3">
                <span className="w-20 text-[14px] text-[#6B7280]">安全性</span>
                <span className="flex-1 text-[15px] font-medium text-[#111827]">WPA/WPA2</span>
                <ChevronRight size={17} strokeWidth={2} className="text-[#9CA3AF]" />
              </div>
              <label className="flex items-center px-4 py-3">
                <span className="w-20 text-[14px] text-[#6B7280]">密码</span>
                <input
                  value={manualPassword}
                  onChange={(event) => setManualPassword(event.target.value)}
                  placeholder="输入密码"
                  type="password"
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#A0A7B2]"
                />
              </label>
            </div>

            <p className="mt-3 text-[12px] leading-5 text-[#6B7280]">
              请确认网络为 2.4GHz，名称和密码区分大小写。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
