import { ArrowLeft, Check } from 'lucide-react';
import { StatusBar } from './StatusBar';

interface PoolSetupPageProps {
  onBack: () => void;
  onAddPool: () => void;
  onComplete: () => void;
  pools: {
    id: number;
    name: string;
    image: string;
    selected: boolean;
  }[];
  setPools: React.Dispatch<React.SetStateAction<{
    id: number;
    name: string;
    image: string;
    selected: boolean;
  }[]>>;
}

export const PoolSetupPage = ({ onBack, onAddPool, onComplete, pools, setPools }: PoolSetupPageProps) => {

  const handlePoolSelect = (selectedId: number) => {
    setPools(pools.map(pool => ({
      ...pool,
      selected: pool.id === selectedId
    })));
  };

  const handleConfirm = () => {
    // 确认选择逻辑
    console.log('Selected pool:', pools.find(pool => pool.selected));
    onComplete();
  };

  const handleSkip = () => {
    // 跳过逻辑
    console.log('Skip pool setup');
    onComplete();
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
      <StatusBar time="13:16" battery="73%" />
      <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[16px] font-semibold text-[#000000] uppercase">SWIMMING POOL SELECTION</span>
      </div>
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        {pools.map((pool) => (
          <div key={pool.id} className="mb-6 relative">
            <div
              onClick={() => handlePoolSelect(pool.id)}
              className="w-full rounded-[16px] overflow-hidden relative cursor-pointer transition-all transform active:scale-95"
            >
              <img 
                src={pool.image} 
                alt={pool.name} 
                className="w-full h-48 object-cover"
              />
              {pool.selected && (
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <Check size={20} strokeWidth={2} className="text-blue-500" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div 
                  className="inline-block px-6 py-2 rounded-full text-white text-center"
                  style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                >
                  {pool.name}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-center my-8">
          <button
            onClick={onAddPool}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-light transition-opacity active:opacity-80 cursor-pointer"
            style={{ background: '#000000', color: '#FFFFFF' }}
          >
            +
          </button>
        </div>
      </div>
      <div className="flex justify-between px-5 pb-8 gap-4">
        <button
          onClick={handleSkip}
          className="flex-1 py-4 rounded-[50px] text-[16px] font-medium transition-opacity active:opacity-90"
          style={{ background: '#F3F4F6', color: '#000000' }}
        >
          Skip
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-4 rounded-[50px] text-[16px] font-medium transition-opacity active:opacity-90"
          style={{ background: '#000000', color: '#FFFFFF' }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};
