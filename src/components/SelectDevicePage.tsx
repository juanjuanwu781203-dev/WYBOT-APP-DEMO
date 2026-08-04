import { ArrowLeft } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { devices } from '../data/mockData';

// 导入设备图片
import c1 from '../assets/devices/device_wybot_c1.png.png';
import c2 from '../assets/devices/device_wybot_c2.png.png';
import c2v from '../assets/devices/device_wybot_c2v.png.png';
import c2p from '../assets/devices/device_wybot_c2p.png.png';
import c2pv from '../assets/devices/device_wybot_c2pv.png.png';
import s2 from '../assets/devices/device_wybot_s2.png.png';
import m2 from '../assets/devices/device_wybot_m2.png.png';
import f1 from '../assets/devices/device_wybot_f1.png.png';
import s2s from '../assets/devices/device_wybot_s2s.png.png';
import s2sv from '../assets/devices/device_wybot_s2sv.png.png';
import s3 from '../assets/devices/device_wybot_s3.png.png';

// 设备图片映射
const deviceImages = {
  'WYBOT C1': c1,
  'WYBOT C2': c2,
  'WYBOT C2V': c2v,
  'WYBOT C2P': c2p,
  'WYBOT C2PV': c2pv,
  'WYBOT S2': s2,
  'WYBOT M2': m2,
  'WYBOT F1': f1,
  'WYBOT S2S': s2s,
  'WYBOT S2SV': s2sv,
  'WYBOT S3': s3,
};

interface SelectDevicePageProps {
  onBack: () => void;
  onSelectDevice: () => void;
}

export const SelectDevicePage = ({ onBack, onSelectDevice }: SelectDevicePageProps) => (
  <div
    className="w-full flex flex-col"
    style={{ 
      background: '#FFFFFF',
      height: '812px',
      overflow: 'hidden'
    }}
  >
    <StatusBar time="14:50" battery="61%" />
    <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0">
      <button onClick={onBack} className="p-1">
        <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
      </button>
      <span className="text-[16px] font-semibold text-[#000000] uppercase">SELECT DEVICE</span>
    </div>
    <div 
      className="px-5 pb-5 overflow-y-auto flex-1"
      style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: '#CCCCCC transparent'
      }}
    >
      {devices.map((device) => (
        <button
          key={device.id}
          onClick={onSelectDevice}
          className="w-full flex items-center gap-4 p-4 mb-4 rounded-[24px] text-left transition-opacity active:opacity-80"
          style={{ background: '#E9EEF2' }}
        >
          <div
            className="w-[60px] h-[60px] rounded-[12px] flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ 
              background: '#F0F0F0'
            }}
          >
            <img 
              src={deviceImages[device.model as keyof typeof deviceImages]} 
              alt={device.model} 
              className="w-4/5 h-4/5 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[16px] text-[#000000]">{device.model}</div>
            <div className="text-[13px] text-[#5C6370] truncate">SN: {device.sn}</div>
          </div>
        </button>
      ))}
    </div>
  </div>
);
