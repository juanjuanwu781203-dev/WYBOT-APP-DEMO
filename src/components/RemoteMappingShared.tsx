import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Battery,
  Bluetooth,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Wifi,
} from 'lucide-react';

/**
 * 横屏遥控建图的外壳与方向键。全 App 的遥控建图界面统一复用这套组件，
 * 不在各页面各自实现，保证视觉与交互一致。
 *
 * - LandscapeShell：812×375 横屏外壳（标题 + 返回 + 蓝牙/Wi-Fi/电量状态）
 * - RemotePad：方向键 + 中心确认 + 文案 + 确认按钮
 * - PadButton：单个方向键
 * accent 为主色（默认 #00C2FF），禁区等可用红色主题。
 */

export function LandscapeShell({
  title,
  onBack,
  trailing,
  children,
}: {
  title: string;
  onBack: () => void;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-[375px] w-[812px] flex-col bg-[#F5F6F8]">
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={onBack} className="p-1" aria-label="返回">
          <ArrowLeft size={20} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="text-[15px] font-semibold text-[#000000]">{title}</span>
        <div className="flex min-w-[120px] items-center justify-end gap-2">
          {trailing}
          <Bluetooth size={18} strokeWidth={2} className="text-[#2555D1]" />
          <Wifi size={18} strokeWidth={2} className="text-[#2555D1]" />
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#111827]">
            <Battery size={16} strokeWidth={2} className="text-[#22C55E]" />
            68%
          </span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function RemotePad({
  note,
  buttonText,
  onConfirm,
  onMove,
  hideConfirm = false,
  accent = '#00C2FF',
}: {
  note: string;
  buttonText: string;
  onConfirm: () => void;
  onMove?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  hideConfirm?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex w-56 flex-col items-center justify-center px-4">
      <div className="relative h-40 w-40">
        <PadButton className="left-1/2 top-0 -translate-x-1/2" icon={ChevronUp} accent={accent} onClick={() => onMove?.('up')} />
        <PadButton className="bottom-0 left-1/2 -translate-x-1/2" icon={ChevronDown} accent={accent} onClick={() => onMove?.('down')} />
        <PadButton className="left-0 top-1/2 -translate-y-1/2" icon={ChevronLeft} accent={accent} onClick={() => onMove?.('left')} />
        <PadButton className="right-0 top-1/2 -translate-y-1/2" icon={ChevronRight} accent={accent} onClick={() => onMove?.('right')} />
        <button
          onClick={onConfirm}
          className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          style={{ background: accent }}
        >
          <CheckCircle2 size={22} strokeWidth={2.2} />
        </button>
      </div>
      <p className="mt-3 text-center text-[12px] leading-5 text-[#6B7280]">{note}</p>
      {!hideConfirm && (
        <button
          onClick={onConfirm}
          className="mt-3 w-full rounded-full py-2.5 text-[13px] font-semibold text-white"
          style={{ background: accent }}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export function PadButton({
  className,
  icon: Icon,
  onClick,
  accent = '#00C2FF',
}: {
  className: string;
  icon: LucideIcon;
  onClick?: () => void;
  accent?: string;
}) {
  return (
    <button onClick={onClick} className={`absolute grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] ${className}`}>
      <Icon size={24} strokeWidth={2} style={{ color: accent }} />
    </button>
  );
}
