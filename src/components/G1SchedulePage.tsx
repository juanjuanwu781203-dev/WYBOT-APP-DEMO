import { useState } from 'react';
import { ArrowLeft, Plus, Clock, Trash2 } from 'lucide-react';
import { StatusBar } from './StatusBar';

interface G1SchedulePageProps {
  onBack: () => void;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const MOWING_AREAS = ['全部区域', '割草区域 A', '割草区域 B', '割草区域 C'];
const MOWING_PATTERNS = [
  { key: 'crisscross' as const, label: 'Crisscross', icon: '✕' },
  { key: 'checkboard' as const, label: 'Check Board', icon: '▦' },
];

interface ScheduleItem {
  id: number;
  time: string;
  days: boolean[];
  enabled: boolean;
  area: string;
  pattern: 'crisscross' | 'checkboard';
}

export const G1SchedulePage = ({ onBack }: G1SchedulePageProps) => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { id: 1, time: '08:00', days: [true, false, true, false, true, false, false], enabled: true, area: '割草区域 A', pattern: 'crisscross' },
    { id: 2, time: '10:00', days: [false, true, false, true, false, true, false], enabled: true, area: '割草区域 B', pattern: 'checkboard' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTime, setNewTime] = useState('09:00');
  const [newDays, setNewDays] = useState([false, false, false, false, false, false, false]);
  const [newArea, setNewArea] = useState('全部区域');
  const [newPattern, setNewPattern] = useState<'crisscross' | 'checkboard'>('crisscross');

  const toggleSchedule = (id: number) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const deleteSchedule = (id: number) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const addSchedule = () => {
    const hasDay = newDays.some((d) => d);
    if (!hasDay) return;
    const newSchedule: ScheduleItem = {
      id: Date.now(),
      time: newTime,
      days: [...newDays],
      enabled: true,
      area: newArea,
      pattern: newPattern,
    };
    setSchedules((prev) => [...prev, newSchedule]);
    setShowAddModal(false);
    setNewDays([false, false, false, false, false, false, false]);
    setNewArea('全部区域');
    setNewPattern('crisscross');
  };

  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#F5F6F8' }}>
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[17px] font-semibold text-[#000000]">预约日程</span>
        <button onClick={() => setShowAddModal(true)} className="p-1">
          <Plus size={24} strokeWidth={2} className="text-[#00C2FF]" />
        </button>
      </div>

      <div className="flex-1 px-5 py-4 overflow-auto">
        {schedules.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-20">
            <Clock size={48} strokeWidth={1.2} className="text-[#CCCCCC] mb-4" />
            <p className="text-[14px] text-[#999999]">暂无预约日程</p>
            <p className="text-[13px] text-[#CCCCCC]">点击右上角 + 添加预约</p>
          </div>
        )}

        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="mb-3 rounded-[16px] overflow-hidden"
            style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', opacity: schedule.enabled ? 1 : 0.5 }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: schedule.enabled ? '#E0F4FF' : '#F0F0F0' }}>
                  <Clock size={20} strokeWidth={2} className={schedule.enabled ? 'text-[#00C2FF]' : 'text-[#CCCCCC]'} />
                </div>
                <div>
                  <div className="text-[18px] font-semibold text-[#000000]">{schedule.time}</div>
                  <div className="text-[12px] text-[#999999] flex items-center gap-1.5">
                    <span>{schedule.area}</span>
                    <span>·</span>
                    <span>{schedule.pattern === 'crisscross' ? 'Crisscross' : 'Check Board'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteSchedule(schedule.id)}
                  className="p-1.5"
                >
                  <Trash2 size={16} strokeWidth={2} className="text-[#EF4444]" />
                </button>
                <button
                  onClick={() => toggleSchedule(schedule.id)}
                  className="w-11 h-6 rounded-full relative transition-colors"
                  style={{ background: schedule.enabled ? '#00C2FF' : '#E5E7EB' }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                    style={{ left: schedule.enabled ? '22px' : '2px', boxShadow: '0px 1px 3px rgba(0,0,0,0.15)' }}
                  />
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 px-4 pb-3">
              {WEEKDAYS.map((day, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-7 rounded-full flex items-center justify-center text-[11px] font-medium"
                  style={{
                    background: schedule.days[idx] ? '#E0F4FF' : '#F5F6F8',
                    color: schedule.days[idx] ? '#00C2FF' : '#CCCCCC',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="absolute inset-0 z-30 flex items-end" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="w-[375px] rounded-t-[24px] p-5 pb-8" style={{ background: '#FFFFFF' }}>
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setShowAddModal(false)} className="text-[15px] text-[#999999]">取消</button>
              <span className="text-[17px] font-semibold text-[#000000]">添加预约</span>
              <button onClick={addSchedule} className="text-[15px] font-semibold text-[#00C2FF]">保存</button>
            </div>

            <div className="mb-5">
              <label className="text-[13px] text-[#999999] mb-2 block">时间</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full h-12 px-4 rounded-[12px] text-[16px] text-[#000000] bg-[#F5F6F8] outline-none"
              />
            </div>

            <div className="mb-5">
              <label className="text-[13px] text-[#999999] mb-2 block">割草区域</label>
              <div className="flex flex-wrap gap-2">
                {MOWING_AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => setNewArea(area)}
                    className="px-4 h-9 rounded-full text-[13px] font-medium transition-colors"
                    style={{
                      background: newArea === area ? '#00C2FF' : '#F5F6F8',
                      color: newArea === area ? '#FFFFFF' : '#999999',
                    }}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[13px] text-[#999999] mb-2 block">割草路径</label>
              <div className="flex gap-2">
                {MOWING_PATTERNS.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setNewPattern(key)}
                    className="flex-1 h-12 rounded-[12px] text-center transition-all"
                    style={{
                      background: newPattern === key ? '#E0F4FF' : '#F5F6F8',
                      border: newPattern === key ? '1.5px solid #00C2FF' : '1.5px solid transparent',
                    }}
                  >
                    <div className="text-[20px] mb-0.5" style={{ color: newPattern === key ? '#00C2FF' : '#CCCCCC' }}>{icon}</div>
                    <div className={`text-[12px] font-medium ${newPattern === key ? 'text-[#00C2FF]' : 'text-[#999999]'}`}>{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[13px] text-[#999999] mb-2 block">重复日期</label>
              <div className="flex gap-2">
                {WEEKDAYS.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const updated = [...newDays];
                      updated[idx] = !updated[idx];
                      setNewDays(updated);
                    }}
                    className="flex-1 h-10 rounded-full flex items-center justify-center text-[13px] font-medium transition-colors"
                    style={{
                      background: newDays[idx] ? '#00C2FF' : '#F5F6F8',
                      color: newDays[idx] ? '#FFFFFF' : '#999999',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
