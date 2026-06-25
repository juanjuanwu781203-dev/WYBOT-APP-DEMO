import { useState } from 'react';
import { ArrowLeft, ChevronRight, CloudRain, Eye, Minus, Plus, Zap, RotateCcw, Clock, Scan } from 'lucide-react';
import { StatusBar } from './StatusBar';

interface G1MowingParametersPageProps {
  onBack: () => void;
}

export const G1MowingParametersPage = ({ onBack }: G1MowingParametersPageProps) => {
  const [mowingHeight, setMowingHeight] = useState(5);
  const [mowingSpeed, setMowingSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [mowingPattern, setMowingPattern] = useState<'crisscross' | 'checkboard'>('crisscross');
  const [cuttingMode, setCuttingMode] = useState<'full' | 'edge'>('full');
  const [edgeCutting, setEdgeCutting] = useState(false);
  const [breakpointResume, setBreakpointResume] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [doNotDisturbStart, setDoNotDisturbStart] = useState('22:00');
  const [doNotDisturbEnd, setDoNotDisturbEnd] = useState('06:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showObstacleSettings, setShowObstacleSettings] = useState(false);
  const [aiObstacleRecognition, setAiObstacleRecognition] = useState(true);
  const [multiSensorFusion, setMultiSensorFusion] = useState(true);
  const [recognitionHeight, setRecognitionHeight] = useState<5 | 10 | 15 | 20>(10);
  const [rainReturn, setRainReturn] = useState(false);

  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#F5F6F8' }}>
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="flex-1 text-center text-[17px] font-semibold text-[#000000]">割草参数</span>
        <div className="w-7" />
      </div>

      <div className="flex-1 px-5 py-4 overflow-auto space-y-4">
        <div className="rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[15px] font-medium text-[#000000]">割草高度</span>
            <span className="text-[15px] font-semibold text-[#00C2FF]">{mowingHeight} cm</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMowingHeight(Math.max(3, mowingHeight - 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: '#F5F6F8' }}
            >
              <Minus size={18} strokeWidth={2} className="text-[#666666]" />
            </button>
            <div className="flex-1 h-2 rounded-full relative" style={{ background: '#E5E7EB' }}>
              <div
                className="h-2 rounded-full absolute left-0 top-0"
                style={{ width: `${((mowingHeight - 3) / 4) * 100}%`, background: '#00C2FF' }}
              />
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-1/2 -translate-y-1/2"
                style={{ left: `calc(${((mowingHeight - 3) / 4) * 100}% - 10px)`, boxShadow: '0px 2px 6px rgba(0,0,0,0.15)' }}
              />
            </div>
            <button
              onClick={() => setMowingHeight(Math.min(7, mowingHeight + 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: '#F5F6F8' }}
            >
              <Plus size={18} strokeWidth={2} className="text-[#666666]" />
            </button>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-[#CCCCCC]">3cm</span>
            <span className="text-[11px] text-[#CCCCCC]">7cm</span>
          </div>
        </div>

        <div className="rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <span className="text-[15px] font-medium text-[#000000] block mb-3">割草速度</span>
          <div className="flex gap-2">
            {([
              { key: 'slow' as const, label: '慢速', desc: '更精细' },
              { key: 'normal' as const, label: '正常', desc: '推荐' },
              { key: 'fast' as const, label: '快速', desc: '更高效' },
            ]).map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setMowingSpeed(key)}
                className="flex-1 py-3 rounded-[12px] text-center transition-all"
                style={{
                  background: mowingSpeed === key ? '#E0F4FF' : '#F5F6F8',
                  border: mowingSpeed === key ? '1.5px solid #00C2FF' : '1.5px solid transparent',
                }}
              >
                <div className={`text-[14px] font-medium ${mowingSpeed === key ? 'text-[#00C2FF]' : 'text-[#666666]'}`}>{label}</div>
                <div className={`text-[11px] ${mowingSpeed === key ? 'text-[#00C2FF]' : 'text-[#CCCCCC]'}`}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <span className="text-[15px] font-medium text-[#000000] block mb-3">割草路径</span>
          <div className="flex gap-2">
            {([
              { key: 'crisscross' as const, label: 'Crisscross', icon: '✕' },
              { key: 'checkboard' as const, label: 'Check Board', icon: '▦' },
            ]).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setMowingPattern(key)}
                className="flex-1 py-3 rounded-[12px] text-center transition-all"
                style={{
                  background: mowingPattern === key ? '#E0F4FF' : '#F5F6F8',
                  border: mowingPattern === key ? '1.5px solid #00C2FF' : '1.5px solid transparent',
                }}
              >
                <div className="text-[24px] mb-1" style={{ color: mowingPattern === key ? '#00C2FF' : '#CCCCCC' }}>{icon}</div>
                <div className={`text-[13px] font-medium ${mowingPattern === key ? 'text-[#00C2FF]' : 'text-[#666666]'}`}>{label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <span className="text-[15px] font-medium text-[#000000] block mb-3">切割模式</span>
          <div className="flex gap-2">
            {([
              { key: 'full' as const, label: '全区域切割', desc: '整片草坪', icon: '▦' },
              { key: 'edge' as const, label: '仅边缘切割', desc: '沿边界贴边', icon: '⌐' },
            ]).map(({ key, label, desc, icon }) => (
              <button
                key={key}
                onClick={() => setCuttingMode(key)}
                className="flex-1 py-3 rounded-[12px] text-center transition-all"
                style={{
                  background: cuttingMode === key ? '#E0F4FF' : '#F5F6F8',
                  border: cuttingMode === key ? '1.5px solid #00C2FF' : '1.5px solid transparent',
                }}
              >
                <div className="text-[22px] mb-0.5 leading-none" style={{ color: cuttingMode === key ? '#00C2FF' : '#CCCCCC' }}>{icon}</div>
                <div className={`text-[13px] font-medium ${cuttingMode === key ? 'text-[#00C2FF]' : 'text-[#666666]'}`}>{label}</div>
                <div className={`text-[11px] ${cuttingMode === key ? 'text-[#00C2FF]' : 'text-[#CCCCCC]'}`}>{desc}</div>
              </button>
            ))}
          </div>
          {cuttingMode === 'edge' && (
            <div className="mt-3 rounded-[10px] p-2.5 text-[11px] leading-4" style={{ background: '#FFF7ED', color: '#B45309' }}>
              仅边缘切割：机器只沿割草区域边界贴边修剪（约10cm），不进行整片割草，适合日常修边维护。
            </div>
          )}
        </div>

        <div className="rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#22C55E]">
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M12 3v12" />
                <path d="M16 8h5" />
                <path d="M3 12h9" />
                <path d="M8 8h.01" />
                <path d="M8 16h.01" />
              </svg>
              <div>
                <div className="text-[15px] font-medium text-[#000000]">边缘切割</div>
                <div className="text-[11px] text-[#999999]">开启后机器可距离边缘10公分近边缘切割</div>
              </div>
            </div>
            <button
              onClick={() => setEdgeCutting(!edgeCutting)}
              className="w-11 h-6 rounded-full relative transition-colors"
              style={{ background: edgeCutting ? '#22C55E' : '#E5E7EB' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: edgeCutting ? '22px' : '2px', boxShadow: '0px 1px 3px rgba(0,0,0,0.15)' }}
              />
            </button>
          </div>
        </div>

        <div className="rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <RotateCcw size={20} strokeWidth={2} className="text-[#9C27B0] mt-0.5" />
              <div>
                <div className="text-[15px] font-medium text-[#000000]">断点续割</div>
                <div className="text-[11px] text-[#999999] leading-4">低电量回桩充电后继续未完成的任务；障碍物消失后自动补割遗漏区域</div>
              </div>
            </div>
            <button
              onClick={() => setBreakpointResume(!breakpointResume)}
              className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
              style={{ background: breakpointResume ? '#9C27B0' : '#E5E7EB' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: breakpointResume ? '22px' : '2px', boxShadow: '0px 1px 3px rgba(0,0,0,0.15)' }}
              />
            </button>
          </div>
        </div>

        <div className="rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Clock size={20} strokeWidth={2} className="text-[#FF9800]" />
              <div>
                <div className="text-[15px] font-medium text-[#000000]">切割勿扰时间</div>
                <div className="text-[11px] text-[#999999]">开启后机器将不会在设定时间内进行任何切割工作</div>
              </div>
            </div>
            <button
              onClick={() => setDoNotDisturb(!doNotDisturb)}
              className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
              style={{ background: doNotDisturb ? '#FF9800' : '#E5E7EB' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: doNotDisturb ? '22px' : '2px', boxShadow: '0px 1px 3px rgba(0,0,0,0.15)' }}
              />
            </button>
          </div>

          {doNotDisturb && (
            <button
              onClick={() => setShowTimePicker(!showTimePicker)}
              className="w-full mt-3 p-3 rounded-[12px] flex items-center justify-between transition-all"
              style={{ background: '#F5F6F8' }}
            >
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-medium text-[#000000]">
                  {doNotDisturbStart} - {doNotDisturbEnd}
                </div>
              </div>
              <ChevronRight
                size={18}
                strokeWidth={2}
                className="text-[#CCCCCC] transition-transform"
                style={{ transform: showTimePicker ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>
          )}

          {showTimePicker && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-[12px] text-[#666666] mb-1.5 block">开始时间</label>
                <input
                  type="time"
                  value={doNotDisturbStart}
                  onChange={(e) => setDoNotDisturbStart(e.target.value)}
                  className="w-full h-10 px-3 rounded-[10px] text-[14px] font-medium text-[#000000]"
                  style={{ background: '#F5F6F8', border: '1.5px solid #E5E7EB' }}
                />
              </div>
              <div>
                <label className="text-[12px] text-[#666666] mb-1.5 block">结束时间</label>
                <input
                  type="time"
                  value={doNotDisturbEnd}
                  onChange={(e) => setDoNotDisturbEnd(e.target.value)}
                  className="w-full h-10 px-3 rounded-[10px] text-[14px] font-medium text-[#000000]"
                  style={{ background: '#F5F6F8', border: '1.5px solid #E5E7EB' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[16px] p-4" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudRain size={20} strokeWidth={2} className="text-[#2196F3]" />
              <div>
                <div className="text-[15px] font-medium text-[#000000]">雨天回桩</div>
                <div className="text-[11px] text-[#999999]">检测到雨量达标时自动回充</div>
              </div>
            </div>
            <button
              onClick={() => setRainReturn(!rainReturn)}
              className="w-11 h-6 rounded-full relative transition-colors"
              style={{ background: rainReturn ? '#00C2FF' : '#E5E7EB' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: rainReturn ? '22px' : '2px', boxShadow: '0px 1px 3px rgba(0,0,0,0.15)' }}
              />
            </button>
          </div>
        </div>

        <div className="rounded-[16px] overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          <button
            onClick={() => setShowObstacleSettings(!showObstacleSettings)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <Eye size={20} strokeWidth={2} className="text-[#00C2FF]" />
              <span className="text-[15px] font-medium text-[#000000]">避障设置</span>
            </div>
            <ChevronRight
              size={20}
              strokeWidth={2}
              className="text-[#CCCCCC] transition-transform"
              style={{ transform: showObstacleSettings ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          </button>

          {showObstacleSettings && (
            <>
              <div className="h-px bg-[#F0F0F0] mx-4" />
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Zap size={18} strokeWidth={2} className="text-[#FF9800]" />
                  <div>
                    <div className="text-[14px] font-medium text-[#000000]">AI障碍识别</div>
                    <div className="text-[11px] text-[#999999]">智能识别障碍物类型</div>
                  </div>
                </div>
                <button
                  onClick={() => setAiObstacleRecognition(!aiObstacleRecognition)}
                  className="w-11 h-6 rounded-full relative transition-colors"
                  style={{ background: aiObstacleRecognition ? '#00C2FF' : '#E5E7EB' }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                    style={{ left: aiObstacleRecognition ? '22px' : '2px', boxShadow: '0px 1px 3px rgba(0,0,0,0.15)' }}
                  />
                </button>
              </div>

              <div className="h-px bg-[#F0F0F0] mx-4" />
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Scan size={18} strokeWidth={2} className="text-[#2196F3]" />
                  <div>
                    <div className="text-[14px] font-medium text-[#000000]">多传感器融合识别</div>
                    <div className="text-[11px] text-[#999999]">LiDAR + 摄像头 + 触碰多源融合</div>
                  </div>
                </div>
                <button
                  onClick={() => setMultiSensorFusion(!multiSensorFusion)}
                  className="w-11 h-6 rounded-full relative transition-colors"
                  style={{ background: multiSensorFusion ? '#00C2FF' : '#E5E7EB' }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                    style={{ left: multiSensorFusion ? '22px' : '2px', boxShadow: '0px 1px 3px rgba(0,0,0,0.15)' }}
                  />
                </button>
              </div>

              <div className="h-px bg-[#F0F0F0] mx-4" />
              <div className="p-4">
                <span className="text-[14px] font-medium text-[#000000] block mb-3">识别高度</span>
                <div className="flex gap-2">
                  {([5, 10, 15, 20] as const).map((height) => (
                    <button
                      key={height}
                      onClick={() => setRecognitionHeight(height)}
                      className="flex-1 py-2.5 rounded-[10px] text-center transition-all"
                      style={{
                        background: recognitionHeight === height ? '#E0F4FF' : '#F5F6F8',
                        border: recognitionHeight === height ? '1.5px solid #00C2FF' : '1.5px solid transparent',
                      }}
                    >
                      <div className={`text-[14px] font-semibold ${recognitionHeight === height ? 'text-[#00C2FF]' : 'text-[#666666]'}`}>
                        {height}cm
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
