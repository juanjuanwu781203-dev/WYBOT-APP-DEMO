import { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Database,
  Eye,
  Layers,
  Map,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Route,
  Search,
  Trash2,
  Zap,
} from 'lucide-react';
import { StatusBar } from './StatusBar';

interface G1MapManagementPageProps {
  onBack: () => void;
  onOpenNoGoSetup: () => void;
  onOpenAreaSettings: () => void;
  onStartNewArea: () => void;
  onOpenPassageSetup: () => void;
  onOpenDockRouteSetup: () => void;
}

type ModalKind = 'backup' | 'recover' | 'reset' | 'display' | 'delete' | null;

export const G1MapManagementPage = ({
  onBack,
  onOpenNoGoSetup,
  onOpenAreaSettings,
  onStartNewArea,
  onOpenPassageSetup,
  onOpenDockRouteSetup,
}: G1MapManagementPageProps) => {
  const [modal, setModal] = useState<ModalKind>(null);
  const [backupToast, setBackupToast] = useState(false);
  const [display, setDisplay] = useState({
    grid: true,
    path: true,
    obstacles: true,
    dock: true,
    noGoFill: true,
  });

  const editItems = [
    { icon: Plus, color: '#4CAF50', bg: '#E8F5E9', title: '新增区域', desc: '自动 / 手动建图新建割草区域', onClick: onStartNewArea },
    { icon: MapPin, color: '#EF4444', bg: '#FEE2E2', title: '禁区设置', desc: '标记 No-Go 禁入区域', onClick: onOpenNoGoSetup },
    { icon: Route, color: '#2196F3', bg: '#E3F2FD', title: '通道设置', desc: '遥控连接两块割草区域', onClick: onOpenPassageSetup },
    { icon: Layers, color: '#9C27B0', bg: '#F3E5F5', title: '区域设置', desc: '合并 · 分割 · 命名', onClick: onOpenAreaSettings },
    { icon: Zap, color: '#FF9800', bg: '#FFF3E0', title: '回充路线', desc: '为每个割草区域设置回桩路径', onClick: onOpenDockRouteSetup },
  ];

  const manageItems = [
    { icon: Database, color: '#00A7E1', bg: '#E0F4FF', title: '备份地图', desc: '保存当前地图快照', onClick: () => setModal('backup') },
    { icon: Search, color: '#00A7E1', bg: '#E0F4FF', title: '找回地图', desc: '从备份恢复地图', onClick: () => setModal('recover') },
    { icon: RefreshCw, color: '#6B7280', bg: '#F3F4F6', title: '重置地图', desc: '清空并重新建图', onClick: () => setModal('reset') },
    { icon: Eye, color: '#6B7280', bg: '#F3F4F6', title: '地图显示设置', desc: '调整地图显示内容', onClick: () => setModal('display') },
    { icon: Trash2, color: '#EF4444', bg: '#FEE2E2', title: '删除地图', desc: '删除当前地图及全部区域', onClick: () => setModal('delete') },
  ];

  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#F5F6F8' }}>
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-[#000000]">地图管理</span>
      </div>

      {/* 地图预览 */}
      <div className="mx-5 mt-1 overflow-hidden rounded-[20px] relative" style={{ height: '170px', background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)' }}>
        <svg width="100%" height="100%" viewBox="0 0 335 170" fill="none" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="14" width="295" height="142" rx="8" stroke="#4CAF50" strokeWidth="2" strokeDasharray="6 3" fill="rgba(76,175,80,0.08)" />
          <rect x="35" y="28" width="120" height="48" rx="4" fill="rgba(76,175,80,0.18)" stroke="#4CAF50" strokeWidth="1.5" />
          <text x="95" y="56" textAnchor="middle" fill="#388E3C" fontSize="10" fontWeight="600">割草区域 A</text>
          <rect x="170" y="28" width="120" height="48" rx="4" fill="rgba(76,175,80,0.18)" stroke="#4CAF50" strokeWidth="1.5" />
          <text x="230" y="56" textAnchor="middle" fill="#388E3C" fontSize="10" fontWeight="600">割草区域 B</text>
          <rect x="48" y="92" width="78" height="32" rx="4" fill="rgba(244,67,54,0.12)" stroke="#F44336" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="87" y="112" textAnchor="middle" fill="#D32F2F" fontSize="9" fontWeight="600">No-Go</text>
          <rect x="150" y="80" width="38" height="46" rx="4" fill="rgba(33,150,243,0.12)" stroke="#2196F3" strokeWidth="1.5" />
          <text x="169" y="108" textAnchor="middle" fill="#1565C0" fontSize="8" fontWeight="600">通道</text>
          <path d="M95 76 L95 124 L255 124" stroke="#FF9800" strokeWidth="2" strokeDasharray="4 2" fill="none" />
          <rect x="248" y="115" width="33" height="18" rx="3" fill="rgba(255,152,0,0.2)" stroke="#FF9800" strokeWidth="1" />
          <text x="264" y="127" textAnchor="middle" fill="#E65100" fontSize="7" fontWeight="600">充电站</text>
        </svg>
        <div className="absolute bottom-2 right-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-[#374151] shadow-sm">
          2 区域 · 1 禁区 · 1 通道
        </div>
      </div>

      <div className="flex-1 px-5 pt-4 overflow-auto pb-6">
        {/* 地图编辑 */}
        <SectionTitle>地图编辑</SectionTitle>
        <div className="overflow-hidden rounded-[16px]" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          {editItems.map((it, i) => (
            <Row key={it.title} {...it} last={i === editItems.length - 1} />
          ))}
        </div>

        {/* 地图管理 */}
        <SectionTitle>地图管理</SectionTitle>
        <div className="overflow-hidden rounded-[16px]" style={{ background: '#FFFFFF', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' }}>
          {manageItems.map((it, i) => (
            <Row key={it.title} {...it} last={i === manageItems.length - 1} />
          ))}
        </div>

        <p className="mt-4 px-1 text-[11px] leading-4 text-[#999999]">
          单张地图最多支持 5 个割草区域。新增或修改区域后需重新校验回桩路径与禁区。
        </p>
      </div>

      {/* 备份成功 toast */}
      {backupToast && (
        <div className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-[16px] bg-[#111827] px-6 py-4 text-center shadow-xl">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-[#22C55E]/20">
            <Database size={20} strokeWidth={2.4} className="text-[#22C55E]" />
          </div>
          <div className="text-[14px] font-semibold text-white">地图已备份</div>
          <div className="mt-0.5 text-[11px] text-white/60">2026-06-25 14:49</div>
        </div>
      )}

      {modal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={() => setModal(null)}>
          <div className="w-[300px] rounded-[20px] p-5" style={{ background: '#FFFFFF' }} onClick={(e) => e.stopPropagation()}>
            {modal === 'backup' && (
              <>
                <h3 className="text-center text-[17px] font-semibold text-[#000000]">备份当前地图？</h3>
                <p className="mt-2 text-center text-[13px] leading-5 text-[#999999]">将保存当前地图与全部区域的快照，可用于后续找回。</p>
                <ModalButtons onCancel={() => setModal(null)} onConfirm={() => { setModal(null); setBackupToast(true); setTimeout(() => setBackupToast(false), 1500); }} confirmText="备份" confirmBg="#00A7E1" />
              </>
            )}
            {modal === 'recover' && (
              <>
                <h3 className="text-center text-[17px] font-semibold text-[#000000]">找回地图</h3>
                <p className="mt-1 text-center text-[12px] text-[#999999]">选择一个备份恢复</p>
                <div className="mt-3 space-y-2">
                  {[
                    { t: '2026-06-25 14:49', a: '2 区域 · 1 禁区' },
                    { t: '2026-06-20 09:12', a: '1 区域 · 0 禁区' },
                    { t: '2026-06-10 18:30', a: '2 区域 · 2 禁区' },
                  ].map((b) => (
                    <button key={b.t} onClick={() => setModal(null)} className="flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 active:opacity-90" style={{ background: '#F5F6F8' }}>
                      <div>
                        <div className="text-[13px] font-semibold text-[#000000]">{b.t}</div>
                        <div className="text-[11px] text-[#999999]">{b.a}</div>
                      </div>
                      <RotateCcw size={16} strokeWidth={2} className="text-[#00A7E1]" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setModal(null)} className="mt-3 w-full rounded-[12px] py-2.5 text-[14px] font-medium text-[#666666]" style={{ background: '#F5F6F8' }}>取消</button>
              </>
            )}
            {modal === 'reset' && (
              <>
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#FFF7ED]">
                  <RefreshCw size={26} strokeWidth={2} className="text-[#F59E0B]" />
                </div>
                <h3 className="text-center text-[17px] font-semibold text-[#000000]">重置地图？</h3>
                <p className="mt-2 text-center text-[13px] leading-5 text-[#999999]">将清空当前地图所有区域与路线，需重新建图。建议先备份。</p>
                <ModalButtons onCancel={() => setModal(null)} onConfirm={() => setModal(null)} confirmText="重置" confirmBg="#F59E0B" />
              </>
            )}
            {modal === 'delete' && (
              <>
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#FEE2E2]">
                  <Trash2 size={26} strokeWidth={2} className="text-[#EF4444]" />
                </div>
                <h3 className="text-center text-[17px] font-semibold text-[#000000]">删除地图？</h3>
                <p className="mt-2 text-center text-[13px] leading-5 text-[#999999]">删除后所有区域和路线将丢失，需要重新建图。</p>
                <ModalButtons onCancel={() => setModal(null)} onConfirm={() => setModal(null)} confirmText="删除" confirmBg="#EF4444" />
              </>
            )}
            {modal === 'display' && (
              <>
                <h3 className="text-center text-[17px] font-semibold text-[#000000]">地图显示设置</h3>
                <div className="mt-3 space-y-1">
                  {([
                    { key: 'grid' as const, label: '显示网格' },
                    { key: 'path' as const, label: '显示割草路径' },
                    { key: 'obstacles' as const, label: '显示障碍物' },
                    { key: 'dock' as const, label: '显示充电桩' },
                    { key: 'noGoFill' as const, label: '禁区填充显示' },
                  ]).map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <span className="text-[14px] text-[#000000]">{label}</span>
                      <button
                        onClick={() => setDisplay((d) => ({ ...d, [key]: !d[key] }))}
                        className="w-11 h-6 rounded-full relative transition-colors"
                        style={{ background: display[key] ? '#00A7E1' : '#E5E7EB' }}
                      >
                        <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: display[key] ? '22px' : '2px', boxShadow: '0px 1px 3px rgba(0,0,0,0.15)' }} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setModal(null)} className="mt-3 w-full rounded-[12px] bg-[#00A7E1] py-2.5 text-[14px] font-semibold text-white">完成</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-4 px-1 text-[12px] font-semibold uppercase tracking-wide text-[#999999]">{children}</div>;
}

function Row({
  icon: Icon,
  color,
  bg,
  title,
  desc,
  onClick,
  last,
}: {
  icon: typeof Map;
  color: string;
  bg: string;
  title: string;
  desc: string;
  onClick: () => void;
  last: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:opacity-90"
      style={{ borderBottom: last ? 'none' : '1px solid #F0F0F0' }}
    >
      <div className="grid h-9 w-9 place-items-center rounded-full" style={{ background: bg }}>
        <Icon size={18} strokeWidth={2} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-[#000000]">{title}</div>
        <div className="truncate text-[11px] text-[#999999]">{desc}</div>
      </div>
      <ChevronRight size={18} strokeWidth={2} className="text-[#CCCCCC]" />
    </button>
  );
}

function ModalButtons({ onCancel, onConfirm, confirmText, confirmBg }: { onCancel: () => void; onConfirm: () => void; confirmText: string; confirmBg: string }) {
  return (
    <div className="mt-5 flex gap-3">
      <button onClick={onCancel} className="flex-1 rounded-[12px] py-2.5 text-[14px] font-medium text-[#666666]" style={{ background: '#F5F6F8' }}>取消</button>
      <button onClick={onConfirm} className="flex-1 rounded-[12px] py-2.5 text-[14px] font-medium text-white" style={{ background: confirmBg }}>{confirmText}</button>
    </div>
  );
}
