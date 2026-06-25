import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  KeyRound,
  Lock,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import { StatusBar } from './StatusBar';

interface G1AntiTheftPageProps {
  onBack: () => void;
}

type Modal = 'set-pw' | 'change-pw' | 'unlock' | null;

export const G1AntiTheftPage = ({ onBack }: G1AntiTheftPageProps) => {
  const [password, setPassword] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [unlockInput, setUnlockInput] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1600);
  };

  const closePwModal = () => {
    setModal(null);
    setPw1('');
    setPw2('');
    setError('');
  };

  const submitPw = () => {
    if (pw1.length < 4) { setError('密码至少 4 位'); return; }
    if (pw1 !== pw2) { setError('两次输入不一致'); return; }
    setPassword(pw1);
    closePwModal();
    showToast(modal === 'change-pw' ? '密码已更新' : '防偷密码已设置');
  };

  const doRemoteLock = () => {
    setLocked(true);
    showToast('已远程锁定机器');
  };

  const doUnlock = () => {
    if (unlockInput !== password) { setError('密码错误，无法解除锁定'); return; }
    setLocked(false);
    setUnlockInput('');
    setError('');
    setModal(null);
    showToast('已解除锁定');
  };

  const pwSet = password !== null;

  return (
    <div className="w-[375px] h-[812px] flex flex-col" style={{ background: '#F5F6F8' }}>
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={onBack} className="p-1">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-[#000000]">机器防偷管理</span>
      </div>

      <div className="flex-1 px-4 pb-6 pt-2 overflow-auto">
        {/* 锁定状态卡 */}
        <div
          className="mb-4 rounded-[20px] p-5 shadow-sm"
          style={{ background: locked ? 'linear-gradient(135deg,#7F1D1D,#EF4444)' : 'linear-gradient(135deg,#0F2A1B,#1F6F3C)' }}
        >
          <div className="flex items-center gap-3 text-white">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/20">
              {locked ? <Lock size={26} strokeWidth={2.2} /> : <ShieldCheck size={26} strokeWidth={2.2} />}
            </div>
            <div>
              <div className="text-[18px] font-semibold">{locked ? '已远程锁定' : '正常未锁定'}</div>
              <div className="text-[12px] text-white/80">{locked ? '机器已被锁定，需输入密码解除' : '机器处于正常状态，可随时远程锁定'}</div>
            </div>
          </div>
        </div>

        {/* 密码 */}
        <div className="mb-4 rounded-[16px] bg-white p-2 px-4 shadow-sm">
          <div className="flex w-full items-center justify-between border-b border-[#F0F0F0] py-3.5">
            <div className="flex items-center gap-3">
              <KeyRound size={20} strokeWidth={2} className="text-[#00A7E1]" />
              <div>
                <div className="text-[15px] text-[#111827]">防偷密码</div>
                <div className="text-[11px]" style={{ color: pwSet ? '#16A34A' : '#9CA3AF' }}>{pwSet ? '已设置' : '未设置'}</div>
              </div>
            </div>
            <button
              onClick={() => setModal(pwSet ? 'change-pw' : 'set-pw')}
              className="rounded-full bg-[#F0FBFE] px-3 py-1.5 text-[12px] font-semibold text-[#00A7E1]"
            >
              {pwSet ? '修改' : '设置'}
            </button>
          </div>
          <p className="py-3 text-[12px] leading-5 text-[#9CA3AF]">
            设置密码后，远程锁定机器需输入密码解除，防止机器被盗后他人启用。
          </p>
        </div>

        {/* 远程锁定 */}
        <div className="rounded-[16px] bg-white p-2 px-4 shadow-sm">
          {!locked ? (
            <button
              onClick={doRemoteLock}
              disabled={!pwSet}
              className="flex w-full items-center gap-3 py-3.5 text-left disabled:opacity-50"
            >
              <Lock size={20} strokeWidth={2} className="text-[#FF9800]" />
              <span className="text-[15px] text-[#111827]">远程锁定</span>
              <span className="ml-auto text-[11px] text-[#9CA3AF]">{pwSet ? '即时锁定' : '需先设置密码'}</span>
            </button>
          ) : (
            <button
              onClick={() => { setModal('unlock'); setError(''); }}
              className="flex w-full items-center gap-3 py-3.5 text-left"
            >
              <Unlock size={20} strokeWidth={2} className="text-[#16A34A]" />
              <span className="text-[15px] text-[#111827]">解除锁定</span>
              <span className="ml-auto text-[11px] text-[#9CA3AF]">需输入密码</span>
            </button>
          )}
        </div>
      </div>

      {/* 设置/修改密码弹窗 */}
      {modal && (modal === 'set-pw' || modal === 'change-pw') && (
        <ModalShell title={modal === 'change-pw' ? '修改防偷密码' : '设置防偷密码'} onClose={closePwModal}>
          <PwInput value={pw1} onChange={setPw1} placeholder="请输入新密码（≥4 位）" />
          <div className="mt-3">
            <PwInput value={pw2} onChange={setPw2} placeholder="请再次输入" />
          </div>
          {error && <p className="mt-2 text-[12px] text-[#EF4444]">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button onClick={closePwModal} className="flex-1 rounded-[12px] py-2.5 text-[14px] font-medium" style={{ background: '#F5F6F8', color: '#666666' }}>取消</button>
            <button onClick={submitPw} className="flex-1 rounded-[12px] py-2.5 text-[14px] font-medium text-white" style={{ background: '#00C2FF' }}>确认</button>
          </div>
        </ModalShell>
      )}

      {/* 解除锁定弹窗 */}
      {modal === 'unlock' && (
        <ModalShell title="解除远程锁定" onClose={() => { setModal(null); setUnlockInput(''); setError(''); }}>
          <p className="mb-3 text-[13px] text-[#666666]">请输入防偷密码以解除锁定。</p>
          <PwInput value={unlockInput} onChange={setUnlockInput} placeholder="请输入密码" />
          {error && <p className="mt-2 text-[12px] text-[#EF4444]">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button onClick={() => { setModal(null); setUnlockInput(''); setError(''); }} className="flex-1 rounded-[12px] py-2.5 text-[14px] font-medium" style={{ background: '#F5F6F8', color: '#666666' }}>取消</button>
            <button onClick={doUnlock} className="flex-1 rounded-[12px] py-2.5 text-[14px] font-medium text-white" style={{ background: '#16A34A' }}>解除锁定</button>
          </div>
        </ModalShell>
      )}

      {/* toast */}
      {toast && (
        <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-[14px] bg-[#111827] px-5 py-3 text-center text-[13px] font-medium text-white shadow-xl">
          <div className="mx-auto mb-1.5 grid h-9 w-9 place-items-center rounded-full bg-[#22C55E]/25">
            <Check size={20} strokeWidth={2.6} className="text-[#22C55E]" />
          </div>
          {toast}
        </div>
      )}
    </div>
  );
};

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-6" onClick={onClose}>
      <div className="w-full max-w-[300px] rounded-[20px] bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-center text-[16px] font-semibold text-[#000000]">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function PwInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[10px] px-3 py-2.5 text-[14px] text-[#000000]"
      style={{ background: '#F5F6F8', border: '1.5px solid #E5E7EB', outline: 'none' }}
      maxLength={20}
      autoFocus
    />
  );
}
