import { useState } from 'react';
import { ArrowLeft, Wifi } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { networks } from '../data/mockData';

interface SelectNetworkPageProps {
  onBack: () => void;
  onSetLater: () => void;
  onSelectNetwork: (network: string) => void;
}

export const SelectNetworkPage = ({ onBack, onSetLater, onSelectNetwork }: SelectNetworkPageProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    onSelectNetwork(network);
  };

  return (
    <div
      className="w-full flex flex-col"
      style={{ 
        background: '#FFFFFF',
        height: '812px',
        overflow: 'hidden'
      }}
    >
      <StatusBar time="14:51" battery="60%" />
      <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[16px] font-semibold text-[#000000] uppercase">SELECT NETWORK</span>
      </div>
      <div className="px-5 py-4">
        <p className="text-[14px] text-[#666666] mb-6">Only 2.4GHz Wi-Fi networks are supported.</p>
        <div className="space-y-3">
          {networks.map((network, index) => (
            <button
              key={index}
              onClick={() => handleNetworkSelect(network.ssid)}
              className={`w-full flex items-center gap-3 p-4 rounded-[12px] transition-all ${selectedNetwork === network.ssid ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
              style={{
                backgroundColor: selectedNetwork === network.ssid ? '#00C2FF' : '#F3F4F6',
                border: selectedNetwork === network.ssid ? '2px solid #00C2FF' : '2px solid transparent'
              }}
            >
              <Wifi size={20} strokeWidth={2} className={`flex-shrink-0 ${selectedNetwork === network.ssid ? 'text-white' : 'text-[#000000]'}`} />
              <span className={`flex-1 text-[16px] ${selectedNetwork === network.ssid ? 'text-white' : 'text-[#000000]'}`}>{network.ssid}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-end px-5 pb-8">
        <div className="mb-6">
          <p className="text-[14px] text-[#666666] leading-relaxed text-center">
            You have bound the cleaner successfully through the Bluetooth, you can continue connecting to the WiFi for upgrading the firmware faster.
          </p>
        </div>
        <button
          onClick={onSetLater}
          className="w-full py-4 rounded-[50px] text-[16px] font-medium text-white transition-opacity active:opacity-90"
          style={{ background: '#000000' }}
        >
          Set Later
        </button>
      </div>
    </div>
  );
};
