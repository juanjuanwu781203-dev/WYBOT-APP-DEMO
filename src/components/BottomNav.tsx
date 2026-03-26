import { Home, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'user';
  onHome: () => void;
  onUser: () => void;
}

export const BottomNav = ({ activeTab, onHome, onUser }: BottomNavProps) => (
  <div
    className="fixed bottom-0 left-0 right-0 z-20 h-[88px] flex justify-evenly items-center px-2 pb-[22px] w-full max-w-full box-border"
    style={{
      background: '#000000',
      borderTopLeftRadius: '40px',
      borderTopRightRadius: '40px',
      maxWidth: '375px',
      margin: '0 auto',
    }}
  >
    <button
      onClick={onHome}
      className="flex flex-col items-center justify-center transition-colors"
      style={{ color: activeTab === 'home' ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }}
      aria-label="Home"
    >
      <Home size={32} strokeWidth={2} />
    </button>
    <button
      onClick={onUser}
      className="flex flex-col items-center justify-center transition-colors"
      style={{ color: activeTab === 'user' ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }}
      aria-label="设置"
    >
      <User size={32} strokeWidth={2} />
    </button>
  </div>
);
