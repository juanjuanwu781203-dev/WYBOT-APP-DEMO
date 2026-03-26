import { appVersion } from '../data/mockData';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal = ({ onClose }: AboutModalProps) => (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ background: 'rgba(0,0,0,0.5)' }}
    onClick={onClose}
  >
    <div
      className="w-[85%] max-w-[300px] p-6 text-center rounded-[32px]"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-[16px] font-medium text-[#000000] mb-2">Current App Version</h3>
      <p className="text-[14px] text-[#666666] mb-6">{appVersion}</p>
      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-[50px] text-[16px] font-bold text-white transition-opacity active:opacity-90"
        style={{ background: '#000000' }}
      >
        OK
      </button>
    </div>
  </div>
);
