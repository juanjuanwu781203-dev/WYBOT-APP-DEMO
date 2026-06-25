import { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { StatusBar } from './StatusBar';

interface G1InitializationPageProps {
  onBack: () => void;
  onActivated: () => void;
}

const dockTips = [
  { label: 'Place on flat ground', value: 'Avoid visible slope' },
  { label: 'Front clearance', value: '>=2m recommended' },
  { label: 'Side clearance', value: '>=2m recommended' },
  { label: 'Grass height nearby', value: '<=10cm recommended' },
  { label: 'Dock structure', value: 'Top cover + sensor wiping device' },
];

const ChargingDockSketch = () => (
  <div className="relative h-[210px] overflow-hidden rounded-[22px] bg-[#F3FBF5]">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(rgba(34,197,94,0.08)_1px,transparent_1px)] bg-[length:22px_22px]" />
    <svg viewBox="0 0 315 210" className="relative h-full w-full" role="img" aria-label="Robot parked level inside the charging dock">
      <defs>
        <marker id="arrow" markerHeight="6" markerWidth="6" orient="auto" refX="5" refY="3">
          <path d="M0,0 L6,3 L0,6 Z" fill="#16A34A" />
        </marker>
      </defs>

      <path
        d="M76 58 H239 Q255 58 255 74 V148 Q255 164 239 164 H76 Q60 164 60 148 V74 Q60 58 76 58Z"
        fill="rgba(34,197,94,0.08)"
        stroke="#86C98B"
        strokeWidth="2"
        strokeDasharray="8 7"
      />
      <path
        d="M104 62 H211 V89 H104 Z M104 131 H211 V160 H104 Z"
        fill="#E8F5EA"
        stroke="#7BC384"
        strokeWidth="2"
      />
      <path d="M91 90 V130" stroke="#7BC384" strokeWidth="6" strokeLinecap="round" />
      <path d="M224 90 V130" stroke="#7BC384" strokeWidth="6" strokeLinecap="round" />

      <rect x="105" y="84" width="105" height="54" rx="23" fill="#111827" />
      <rect x="116" y="93" width="83" height="36" rx="18" fill="#1F2937" stroke="#4B5563" strokeWidth="1.5" />
      <circle cx="129" cy="111" r="7" fill="#0F172A" stroke="#9CA3AF" strokeWidth="2" />
      <circle cx="186" cy="111" r="7" fill="#0F172A" stroke="#9CA3AF" strokeWidth="2" />
      <path d="M150 94 H177" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
      <path d="M105 111 H74" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M210 111 H241" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />

      <path d="M70 183 H245" stroke="#16A34A" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x="157" y="199" textAnchor="middle" fill="#166534" fontSize="12" fontWeight="700">Front clearance 2m min.</text>

      <path d="M43 70 V153" stroke="#16A34A" strokeWidth="2" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x="34" y="116" textAnchor="middle" fill="#166534" fontSize="12" fontWeight="700" transform="rotate(-90 34 116)">Side 2m min.</text>

      <path d="M94 43 H221" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
      <text x="157" y="36" textAnchor="middle" fill="#075985" fontSize="12" fontWeight="700">Park level in the dock</text>
    </svg>
  </div>
);

export const G1InitializationPage = ({ onBack, onActivated }: G1InitializationPageProps) => {
  const [showDockGuide, setShowDockGuide] = useState(false);

  if (showDockGuide) {
    return (
      <div className="flex h-[812px] w-[375px] flex-col bg-[#F5F6F8]">
        <StatusBar time="14:49" battery="61%" />
        <div className="flex items-center px-4 py-3">
          <button onClick={() => setShowDockGuide(false)} className="p-1" aria-label="返回">
            <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
          </button>
          <span className="flex-1 text-center text-[17px] font-semibold text-[#000000]">Charging Dock Guide</span>
          <div className="w-7" />
        </div>

        <div className="flex-1 overflow-auto px-5 pb-5">
          <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <ChargingDockSketch />
            <h2 className="text-[22px] font-semibold text-[#111827]">Install the charging dock before mapping</h2>
            <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
              Make sure the robot parks level inside the charging dock before creating the first map.
            </p>
          </div>

          <div className="mt-4 space-y-2.5">
            {dockTips.map((tip) => (
              <div key={tip.label} className="flex items-center justify-between rounded-[16px] bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
                <span className="text-[13px] font-medium text-[#111827]">{tip.label}</span>
                <span className="text-[12px] text-[#6B7280]">{tip.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[16px] bg-[#ECFDF5] p-4 text-[12px] leading-5 text-[#166534]">
            The top cover and wiping structure are recommended to reduce rain, leaves, grass clippings, and dust on LiDAR and camera windows.
          </div>
        </div>

        <div className="px-5 pb-6">
          <button
            onClick={onActivated}
            className="w-full rounded-full bg-[#00C2FF] py-3.5 text-[16px] font-semibold text-white active:opacity-90"
          >
            Enter device home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[812px] w-[375px] flex-col bg-[#F5F6F8]">
      <StatusBar time="14:49" battery="61%" />
      <div className="flex items-center px-4 py-3">
        <button onClick={onBack} className="p-1" aria-label="返回">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="flex-1 text-center text-[17px] font-semibold text-[#000000]">Add WYBOT G1Pro</span>
        <div className="w-7" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-10">
        <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-[#DCFCE7]">
          <CheckCircle2 size={56} strokeWidth={2.2} className="text-[#22C55E]" />
        </div>
        <h2 className="text-center text-[24px] font-semibold text-[#111827]">Device bound successfully</h2>
        <p className="mt-3 text-center text-[14px] leading-5 text-[#6B7280]">
          WYBOT G1Pro has been added to your account. Please place the robot on the charging dock to charge before first use.
        </p>
        <button
          onClick={() => setShowDockGuide(true)}
          className="mt-6 text-[14px] font-semibold text-[#00A7E1]"
        >
          View charging dock guide
        </button>
      </div>

      <div className="px-5 pb-6">
        <button
          onClick={onActivated}
          className="w-full rounded-full bg-[#00C2FF] py-3.5 text-[16px] font-semibold text-white active:opacity-90"
        >
          Enter device home
        </button>
      </div>
    </div>
  );
};
