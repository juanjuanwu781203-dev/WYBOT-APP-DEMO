import { ArrowLeft, Clock, Map, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { StatusBar } from './StatusBar';

interface G1WorkLogPageProps {
  onBack: () => void;
}

interface WorkLog {
  id: number;
  mowingArea: string;
  startTime: string;
  duration: string;
  area: number;
  status: 'completed' | 'abnormal';
  abnormalReason?: string;
}

const mockWorkLogs: WorkLog[] = [
  {
    id: 1,
    mowingArea: '区域A-前院',
    startTime: '2024-04-22 09:00',
    duration: '2小时30分钟',
    area: 450.5,
    status: 'completed',
  },
  {
    id: 2,
    mowingArea: '区域B-后院',
    startTime: '2024-04-21 14:30',
    duration: '1小时45分钟',
    area: 320.8,
    status: 'completed',
  },
  {
    id: 3,
    mowingArea: '区域A-前院',
    startTime: '2024-04-20 10:15',
    duration: '0小时42分钟',
    area: 180.2,
    status: 'abnormal',
    abnormalReason: '遇到障碍物卡住，异常终止',
  },
  {
    id: 4,
    mowingArea: '区域C-侧院',
    startTime: '2024-04-19 16:00',
    duration: '3小时15分钟',
    area: 620.0,
    status: 'completed',
  },
  {
    id: 5,
    mowingArea: '区域B-后院',
    startTime: '2024-04-18 08:45',
    duration: '1小时20分钟',
    area: 280.5,
    status: 'completed',
  },
  {
    id: 6,
    mowingArea: '区域A-前院',
    startTime: '2024-04-17 15:20',
    duration: '0小时25分钟',
    area: 95.3,
    status: 'abnormal',
    abnormalReason: '电量不足，自动返回充电',
  },
];

export const G1WorkLogPage = ({ onBack }: G1WorkLogPageProps) => {
  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{ background: '#F5F6F8' }}
    >
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onBack} className="p-1" aria-label="Back">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[16px] font-semibold tracking-wide text-[#111827]">工作日志</span>
      </div>

      <div className="flex-1 px-4 pb-8 pt-2 space-y-3">
        {mockWorkLogs.map((log) => (
          <div
            key={log.id}
            className="rounded-[16px] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Map size={18} strokeWidth={2} className="text-[#00C2FF]" />
                <span className="text-[15px] font-semibold text-[#111827]">{log.mowingArea}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {log.status === 'completed' ? (
                  <>
                    <CheckCircle size={16} strokeWidth={2} className="text-[#22C55E]" />
                    <span className="text-[12px] font-medium text-[#22C55E]">完成</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} strokeWidth={2} className="text-[#F44336]" />
                    <span className="text-[12px] font-medium text-[#F44336]">异常终止</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} strokeWidth={2} className="text-[#888888]" />
                <span className="text-[13px] text-[#666666]">{log.startTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} strokeWidth={2} className="text-[#888888]" />
                <span className="text-[13px] text-[#666666]">工作时长: {log.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Map size={14} strokeWidth={2} className="text-[#888888]" />
                <span className="text-[13px] text-[#666666]">切割面积: {log.area} ㎡</span>
              </div>
            </div>

            {log.status === 'abnormal' && log.abnormalReason && (
              <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} strokeWidth={2} className="text-[#F44336] mt-0.5 shrink-0" />
                  <span className="text-[12px] text-[#F44336]">{log.abnormalReason}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
