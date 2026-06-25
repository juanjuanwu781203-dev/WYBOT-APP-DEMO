import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { StatusBar } from './StatusBar';

interface CleaningHistoryEntry {
  id: number;
  date: string;
  timeRange: string;
  mode: string;
  durationMin: number;
  performance: 'normal' | 'alert';
  alertLabel?: string;
}

const TOTAL_HOURS = 130;

const HISTORY_ENTRIES: CleaningHistoryEntry[] = [
  {
    id: 1,
    date: '2025/8/31',
    timeRange: '15:20~16:20',
    mode: 'wall cleaning',
    durationMin: 60,
    performance: 'normal',
  },
  {
    id: 2,
    date: '2025/8/23',
    timeRange: '10:10~10:30',
    mode: 'Floor cleaning',
    durationMin: 20,
    performance: 'alert',
    alertLabel: '水泵过载',
  },
  {
    id: 3,
    date: '2025/8/18',
    timeRange: '09:00~10:15',
    mode: 'Wall then Floor',
    durationMin: 75,
    performance: 'normal',
  },
  {
    id: 4,
    date: '2025/8/12',
    timeRange: '14:05~14:50',
    mode: 'Standard Full-Pool',
    durationMin: 45,
    performance: 'normal',
  },
  {
    id: 5,
    date: '2025/8/5',
    timeRange: '07:30~08:10',
    mode: 'Eco Floor',
    durationMin: 40,
    performance: 'alert',
    alertLabel: '水下通信中断',
  },
];

interface C3ProCleaningHistoryPageProps {
  onBack: () => void;
}

export const C3ProCleaningHistoryPage = ({ onBack }: C3ProCleaningHistoryPageProps) => {
  const [uploadDialogEntry, setUploadDialogEntry] = useState<CleaningHistoryEntry | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const closeUploadDialog = () => {
    setUploadDialogEntry(null);
    setUploading(false);
    setUploadDone(false);
  };

  const handleConfirmUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadDone(true);
      setTimeout(closeUploadDialog, 1200);
    }, 900);
  };

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      <StatusBar time="15:28" battery="53%" />

      <div className="flex shrink-0 items-center gap-2 border-b border-[#F0F0F0] px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="p-0.5 transition-opacity active:opacity-70"
          aria-label="返回"
        >
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <h1 className="text-[16px] font-semibold text-[#111827]">清洁历史</h1>
      </div>

      <p className="shrink-0 px-4 py-3 text-[14px] text-[#374151]">
        总清洁时长：<span className="font-semibold text-[#111827]">{TOTAL_HOURS}小时</span>
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-4">
          {HISTORY_ENTRIES.map((entry) => (
            <article key={entry.id} className="overflow-hidden">
              <div className="rounded-t-[8px] bg-[#E8E8E8] px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[14px] font-medium text-[#111827]">{entry.date}</span>
                  <span className="shrink-0 text-[13px] text-[#374151]">{entry.timeRange}</span>
                </div>
                <p className="mt-1 text-[13px] text-[#4B5563]">{entry.mode}</p>
              </div>
              <div className="rounded-b-[8px] border border-t-0 border-[#D1D5DB] bg-white px-3 py-3">
                <p className="text-[13px] text-[#111827]">Duration {entry.durationMin}min</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[13px] text-[#111827]">Performance</span>
                  {entry.performance === 'normal' ? (
                    <span className="text-[13px] font-medium text-[#111827]">Normal</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUploadDialogEntry(entry)}
                      className="inline-flex rounded-[4px] bg-[#4B4B4B] px-2 py-0.5 text-[12px] font-semibold text-[#FFE566] transition-opacity active:opacity-80"
                      aria-label={`查看异常：${entry.alertLabel}`}
                    >
                      {entry.alertLabel}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {uploadDialogEntry?.alertLabel && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-40 bg-black/45"
            aria-label="关闭"
            onClick={closeUploadDialog}
          />
          <div
            className="absolute left-1/2 top-1/2 z-50 w-[calc(100%-48px)] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] bg-white px-5 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-log-dialog-title"
          >
            <h2
              id="upload-log-dialog-title"
              className="text-center text-[16px] font-semibold text-[#111827]"
            >
              异常提醒
            </h2>
            <p className="mt-3 text-center text-[14px] leading-relaxed text-[#4B5563]">
              {uploadDone ? (
                '日志已上传，感谢反馈。'
              ) : uploading ? (
                '正在上传日志…'
              ) : (
                <>
                  检测到异常：
                  <span className="font-semibold text-[#111827]">{uploadDialogEntry.alertLabel}</span>
                  。是否将本次运行日志上传至服务器，以便售后排查？
                </>
              )}
            </p>
            {!uploadDone && !uploading && (
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={closeUploadDialog}
                  className="flex-1 rounded-[10px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#111827] transition-opacity active:opacity-80"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpload}
                  className="flex-1 rounded-[10px] bg-[#111827] py-2.5 text-[14px] font-semibold text-white transition-opacity active:opacity-80"
                >
                  上传日志
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
