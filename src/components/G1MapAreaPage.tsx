import { ArrowLeft, Check, Trash2, Undo2 } from 'lucide-react';
import { StatusBar } from './StatusBar';

export type G1MapAreaType = 'mowing' | 'nogo' | 'passage' | 'recharge';

interface G1MapAreaPageProps {
  onBack: () => void;
  areaType: G1MapAreaType;
}

const AREA_CONFIG: Record<G1MapAreaType, { title: string; color: string; bgColor: string; strokeColor: string; desc: string }> = {
  mowing: {
    title: '割草区域',
    color: '#4CAF50',
    bgColor: 'rgba(76,175,80,0.15)',
    strokeColor: '#4CAF50',
    desc: '在地图上绘制机器人割草的工作区域',
  },
  nogo: {
    title: 'No-Go 区域',
    color: '#EF4444',
    bgColor: 'rgba(244,67,54,0.15)',
    strokeColor: '#EF4444',
    desc: '标记禁止机器人进入的区域',
  },
  passage: {
    title: '通道区域',
    color: '#2196F3',
    bgColor: 'rgba(33,150,243,0.15)',
    strokeColor: '#2196F3',
    desc: '标记区域之间的连接通道',
  },
  recharge: {
    title: '回充路线',
    color: '#FF9800',
    bgColor: 'rgba(255,152,0,0.15)',
    strokeColor: '#FF9800',
    desc: '绘制机器人返回充电站的路径',
  },
};

export const G1MapAreaPage = ({ onBack, areaType }: G1MapAreaPageProps) => {
  const config = AREA_CONFIG[areaType];

  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#F5F6F8' }}>
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[17px] font-semibold text-[#000000]">{config.title}</span>
        <button className="p-1">
          <Undo2 size={20} strokeWidth={2} className="text-[#666666]" />
        </button>
      </div>

      <div className="px-5 py-2">
        <p className="text-[13px] text-[#999999]">{config.desc}</p>
      </div>

      <div className="flex-1 mx-5 rounded-[20px] overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>
        <svg width="100%" height="100%" viewBox="0 0 335 530" fill="none">
          <rect x="20" y="20" width="295" height="490" rx="8" stroke="#4CAF50" strokeWidth="2" strokeDasharray="6 3" fill="rgba(76,175,80,0.05)" />

          {areaType === 'mowing' && (
            <>
              <rect x="40" y="40" width="130" height="100" rx="6" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="2" />
              <text x="105" y="95" textAnchor="middle" fill="#388E3C" fontSize="13" fontWeight="500">割草区域 A</text>
              <rect x="190" y="40" width="110" height="100" rx="6" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="2" />
              <text x="245" y="95" textAnchor="middle" fill="#388E3C" fontSize="13" fontWeight="500">割草区域 B</text>
              <rect x="40" y="180" width="260" height="120" rx="6" fill="none" stroke="#4CAF50" strokeWidth="2" strokeDasharray="8 4" />
              <text x="170" y="245" textAnchor="middle" fill="#388E3C" fontSize="12" fontWeight="400">点击拖动绘制新区域</text>
            </>
          )}

          {areaType === 'nogo' && (
            <>
              <rect x="40" y="40" width="130" height="100" rx="6" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="1.5" />
              <text x="105" y="95" textAnchor="middle" fill="#388E3C" fontSize="13" fontWeight="500">割草区域 A</text>
              <rect x="190" y="40" width="110" height="100" rx="6" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="1.5" />
              <text x="245" y="95" textAnchor="middle" fill="#388E3C" fontSize="13" fontWeight="500">割草区域 B</text>
              <rect x="60" y="180" width="80" height="60" rx="4" fill="rgba(244,67,54,0.15)" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 3" />
              <text x="100" y="215" textAnchor="middle" fill="#D32F2F" fontSize="11" fontWeight="500">No-Go 1</text>
            </>
          )}

          {areaType === 'passage' && (
            <>
              <rect x="40" y="40" width="130" height="100" rx="6" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="1.5" />
              <text x="105" y="95" textAnchor="middle" fill="#388E3C" fontSize="13" fontWeight="500">割草区域 A</text>
              <rect x="190" y="40" width="110" height="100" rx="6" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="1.5" />
              <text x="245" y="95" textAnchor="middle" fill="#388E3C" fontSize="13" fontWeight="500">割草区域 B</text>
              <rect x="60" y="180" width="80" height="60" rx="4" fill="rgba(244,67,54,0.15)" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="100" y="215" textAnchor="middle" fill="#D32F2F" fontSize="11" fontWeight="500">No-Go 1</text>
              <rect x="150" y="60" width="40" height="60" rx="4" fill="rgba(33,150,243,0.15)" stroke="#2196F3" strokeWidth="2" />
              <text x="170" y="95" textAnchor="middle" fill="#1565C0" fontSize="10" fontWeight="500">通道</text>
              <rect x="40" y="300" width="260" height="80" rx="6" fill="none" stroke="#2196F3" strokeWidth="2" strokeDasharray="8 4" />
              <text x="170" y="345" textAnchor="middle" fill="#1565C0" fontSize="12" fontWeight="400">点击绘制通道区域</text>
            </>
          )}

          {areaType === 'recharge' && (
            <>
              <rect x="40" y="40" width="130" height="100" rx="6" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="1.5" />
              <text x="105" y="95" textAnchor="middle" fill="#388E3C" fontSize="13" fontWeight="500">割草区域 A</text>
              <rect x="190" y="40" width="110" height="100" rx="6" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="1.5" />
              <text x="245" y="95" textAnchor="middle" fill="#388E3C" fontSize="13" fontWeight="500">割草区域 B</text>
              <path d="M105 140 L105 300 L260 300 L260 400" stroke="#FF9800" strokeWidth="3" strokeDasharray="8 4" fill="none" />
              <circle cx="105" cy="140" r="6" fill="#00C2FF" />
              <rect x="240" y="390" width="50" height="30" rx="4" fill="rgba(255,152,0,0.2)" stroke="#FF9800" strokeWidth="2" />
              <text x="265" y="410" textAnchor="middle" fill="#E65100" fontSize="10" fontWeight="600">充电站</text>
            </>
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <button
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] text-[13px] font-medium transition-opacity active:opacity-90"
          style={{ background: '#FFFFFF', color: '#EF4444', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}
        >
          <Trash2 size={16} strokeWidth={2} />
          清除
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-[12px] text-[13px] font-medium text-white transition-opacity active:opacity-90"
          style={{ background: config.color }}
        >
          <Check size={16} strokeWidth={2} />
          保存
        </button>
      </div>
    </div>
  );
};
