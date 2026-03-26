import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { StatusBar } from './StatusBar';

interface AddPoolPageProps {
  onBack: () => void;
  onAddPool: (pool: { name: string; image: string }) => void;
}

interface PoolOption {
  id: number;
  name: string;
  image: string;
  selected: boolean;
}

export const AddPoolPage = ({ onBack, onAddPool }: AddPoolPageProps) => {
  const [poolShape, setPoolShape] = useState<PoolOption[]>([
    { id: 1, name: 'Rectangle', image: '/src/assets/pools/shape-rectangle.png', selected: true },
    { id: 2, name: 'Freeform', image: '/src/assets/pools/shape-freeform.png', selected: false },
    { id: 3, name: 'Oval & Round', image: '/src/assets/pools/shape-oval.png', selected: false },
  ]);

  const [bottomSlope, setBottomSlope] = useState<PoolOption[]>([
    { id: 1, name: 'Flat', image: '/src/assets/pools/bottom-flat.png', selected: true },
    { id: 2, name: 'Deep Flat', image: '/src/assets/pools/bottom-deep-flat.png', selected: false },
    { id: 3, name: 'Standard Hopper Bottom', image: '/src/assets/pools/bottom-hopper.png', selected: false },
  ]);

  const [poolMaterial, setPoolMaterial] = useState<PoolOption[]>([
    { id: 1, name: 'Gunite', image: '/src/assets/pools/material-gunite.png', selected: true },
    { id: 2, name: 'Tile', image: '/src/assets/pools/material-tile.png', selected: false },
    { id: 3, name: 'Vinyl', image: '/src/assets/pools/material-vinyl.png', selected: false },
    { id: 4, name: 'Fiberglass', image: '/src/assets/pools/material-fiberglass.png', selected: false },
  ]);

  const [showNameModal, setShowNameModal] = useState(false);
  const [poolName, setPoolName] = useState('');

  const handleShapeSelect = (selectedId: number) => {
    setPoolShape(poolShape.map(shape => ({
      ...shape,
      selected: shape.id === selectedId
    })));
  };

  const handleBottomSelect = (selectedId: number) => {
    setBottomSlope(bottomSlope.map(slope => ({
      ...slope,
      selected: slope.id === selectedId
    })));
  };

  const handleMaterialSelect = (selectedId: number) => {
    setPoolMaterial(poolMaterial.map(material => ({
      ...material,
      selected: material.id === selectedId
    })));
  };

  const handleDetermine = () => {
    setShowNameModal(true);
  };

  const handleAddPool = () => {
    if (poolName.trim()) {
      const selectedShape = poolShape.find(shape => shape.selected);
      const imageUrl = selectedShape?.image || '';
      onAddPool({ name: poolName, image: imageUrl });
      setShowNameModal(false);
    }
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
        <span className="text-[16px] font-semibold text-[#000000]">Swimming Pool</span>
      </div>
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="mb-8">
          <h3 className="text-[16px] font-medium text-[#000000] mb-4">Pool Shape</h3>
          <div className="space-y-4">
            {poolShape.map((shape) => (
              <div key={shape.id} className="relative">
                <div
                  onClick={() => handleShapeSelect(shape.id)}
                  className="w-full rounded-[16px] overflow-hidden relative cursor-pointer transition-all transform active:scale-95"
                >
                  <img 
                    src={shape.image} 
                    alt={shape.name} 
                    className="w-full h-48 object-cover"
                  />
                  {shape.selected && (
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Check size={20} strokeWidth={2} className="text-blue-500" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div 
                      className="inline-block px-6 py-2 rounded-full text-white text-center"
                      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                    >
                      {shape.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[16px] font-medium text-[#000000] mb-4">Bottom Slope</h3>
          <div className="space-y-4">
            {bottomSlope.map((slope) => (
              <div key={slope.id} className="relative">
                <div
                  onClick={() => handleBottomSelect(slope.id)}
                  className="w-full rounded-[16px] overflow-hidden relative cursor-pointer transition-all transform active:scale-95"
                >
                  <img 
                    src={slope.image} 
                    alt={slope.name} 
                    className="w-full h-48 object-cover"
                  />
                  {slope.selected && (
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Check size={20} strokeWidth={2} className="text-blue-500" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div 
                      className="inline-block px-6 py-2 rounded-full text-white text-center"
                      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                    >
                      {slope.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[16px] font-medium text-[#000000] mb-4">Pool Material</h3>
          <div className="grid grid-cols-2 gap-4">
            {poolMaterial.map((material) => (
              <div key={material.id} className="relative">
                <div
                  onClick={() => handleMaterialSelect(material.id)}
                  className="w-full rounded-[16px] overflow-hidden relative cursor-pointer transition-all transform active:scale-95"
                >
                  <img 
                    src={material.image} 
                    alt={material.name} 
                    className="w-full h-32 object-cover"
                  />
                  {material.selected && (
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Check size={20} strokeWidth={2} className="text-blue-500" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div 
                      className="inline-block px-4 py-1 rounded-full text-white text-center text-sm"
                      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
                    >
                      {material.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-5 pb-8">
        <button
          onClick={handleDetermine}
          className="w-full py-4 rounded-[50px] text-[16px] font-medium transition-opacity active:opacity-90"
          style={{ background: '#000000', color: '#FFFFFF' }}
        >
          Determine
        </button>
      </div>

      {showNameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[16px] p-6 w-[80%] max-w-sm">
            <h3 className="text-[16px] font-semibold text-[#000000] mb-4 text-center">Set Pool Name</h3>
            <input
              type="text"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              placeholder="Please enter pool name"
              className="w-full px-4 py-3 rounded-[8px] border border-gray-300 mb-6"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 py-3 rounded-[8px] text-[16px] font-medium transition-opacity active:opacity-90"
                style={{ background: '#F3F4F6', color: '#000000' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddPool}
                className="flex-1 py-3 rounded-[8px] text-[16px] font-medium transition-opacity active:opacity-90"
                style={{ background: '#000000', color: '#FFFFFF' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};