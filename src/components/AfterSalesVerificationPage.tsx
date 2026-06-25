import { ArrowLeft, BookOpen, Camera, Check, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { StatusBar } from './StatusBar';

const ACCENT = '#00C2FF';
const MOCK_DEVICE_SN = 'WYB-S2-DEMO-8F3A2B';

interface AfterSalesVerificationPageProps {
  onBack: () => void;
}

export const AfterSalesVerificationPage = ({ onBack }: AfterSalesVerificationPageProps) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [errorLog, setErrorLog] = useState('');
  const [deviceSn, setDeviceSn] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [snError, setSnError] = useState('');
  const [scanning, setScanning] = useState(false);

  const validateSn = (value: string) => {
    if (!value.trim()) return '';
    if (value.length !== 16) return 'SN must be exactly 16 characters';
    if (!/^[A-Z0-9]+$/.test(value)) return 'SN can only contain letters and numbers';
    return '';
  };

  const handleInputChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setManualInput(upperValue);
    setSnError(validateSn(upperValue));
  };

  const handleScan = () => {
    if (scanning) return;
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      const mockSn = MOCK_DEVICE_SN;
      setDeviceSn(mockSn);
      setManualInput(mockSn);
      setSnError('');
    }, 1200);
  };

  const handleCameraFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleScan();
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!deviceSn) {
      window.alert('Please scan or enter the device SN first.');
      return;
    }
    window.alert('Demo: after-sales verification submitted.');
  };

  const isValidSn = deviceSn && !snError;

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col"
      style={{ background: 'linear-gradient(180deg, #C8EEF5 0%, #E8F4F8 28%, #F5F7FA 100%)' }}
    >
      <StatusBar time="14:49" battery="61%" />
      <div className="flex shrink-0 items-center gap-3 px-4 py-3">
        <button type="button" onClick={onBack} className="p-1" aria-label="Back">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[16px] font-semibold tracking-wide text-[#111827]">After-Sales Verification</span>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={handleCameraFile}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-1">
        <div className="rounded-[16px] bg-white p-4 shadow-sm">
          <div className="text-[12px] font-medium uppercase tracking-wide text-[#888888]">Input serial number on the robot</div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => handleInputChange(e.target.value)}
              maxLength={16}
              placeholder="Enter 16-digit SN (letters & numbers)"
              className={`flex-1 rounded-[12px] border bg-[#FAFAFA] px-3 py-2.5 text-[15px] font-mono text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 ${
                snError ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#E5E7EB] focus:border-[#00C2FF] focus:ring-[#00C2FF]'
              }`}
            />
            <button
              type="button"
              onClick={handleScan}
              disabled={scanning}
              className="flex items-center justify-center gap-1.5 rounded-[12px] px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-70"
              style={{ background: ACCENT }}
            >
              {scanning ? (
                <Loader2 size={18} strokeWidth={2} className="animate-spin" />
              ) : (
                <Camera size={18} strokeWidth={2} />
              )}
            </button>
          </div>
          {snError && (
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#EF4444]">
              <XCircle size={14} strokeWidth={2} />
              {snError}
            </div>
          )}
          {deviceSn && !snError && (
            <div className="mt-3 rounded-[12px] border-2 border-[#00C2FF] bg-[#F0FAFF] px-3 py-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-[#888888] mb-1.5">Confirmed SN</div>
              <div className="font-mono text-[16px] font-semibold text-[#111827]">{deviceSn}</div>
            </div>
          )}
        </div>

        <div className="rounded-[16px] bg-white p-4 shadow-sm">
          <div className="text-[12px] font-medium uppercase tracking-wide text-[#888888]">Service Item</div>
          <div
            className="relative mt-3 w-full rounded-[14px] border-2 px-4 py-4 text-left"
            style={{ borderColor: ACCENT, background: 'rgba(0, 194, 255, 0.08)' }}
            role="group"
            aria-label="Service item: Battery Replacement, selected"
          >
            <span
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-white"
              style={{ background: ACCENT }}
              aria-hidden
            >
              <Check size={14} strokeWidth={3} />
            </span>
            <div className="pr-10 text-[16px] font-semibold text-[#111827]">Battery Replacement</div>
            <div className="mt-1 text-[12px] leading-snug text-[#6B7280]">Official battery service for WYBOT S2</div>
          </div>
        </div>

        <div className="rounded-[16px] bg-white p-4 shadow-sm">
          <label htmlFor="after-sales-error-log" className="text-[12px] font-medium uppercase tracking-wide text-[#888888]">
            Error Log
          </label>
          <textarea
            id="after-sales-error-log"
            value={errorLog}
            onChange={(e) => setErrorLog(e.target.value)}
            placeholder="Describe errors or messages from the app or device…"
            rows={4}
            className="mt-2 w-full resize-y rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5 text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#00C2FF] focus:outline-none focus:ring-1 focus:ring-[#00C2FF]"
          />
          <p className="mt-2 text-[11px] leading-snug text-[#9CA3AF]">
            Leave blank if none. Please do not submit after-sale verification information if you have not received any service.
          </p>
        </div>

        <a
          href="https://www.eu.wybotpool.com/pages/wybot-s2-battery-change-guide"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-[14px] border border-[#D1D5DB] bg-white px-3 py-3 text-center text-[14px] font-medium leading-snug text-[#111827] shadow-sm transition-opacity active:opacity-90 sm:flex-row sm:gap-2 no-underline"
        >
          <BookOpen size={18} strokeWidth={2} className="shrink-0 text-[#2555D1]" aria-hidden />
          <span className="max-w-full whitespace-normal">Battery Replacement Guide</span>
          <ExternalLink size={14} strokeWidth={2} className="shrink-0 text-[#9CA3AF]" />
        </a>
      </div>

      <div className="shrink-0 border-t border-[#E8EDF2]/80 bg-[linear-gradient(180deg,#F5F7FA_0%,#EEF4F8_100%)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValidSn}
          className="w-full rounded-[14px] py-3.5 text-[16px] font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-50"
          style={{ background: ACCENT }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};
