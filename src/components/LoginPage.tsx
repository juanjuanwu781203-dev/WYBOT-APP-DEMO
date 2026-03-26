import { useState, type ReactNode } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { loginSlice } from '../config/loginAssets';
import { loginBrand } from '../config/loginBrandAssets';
import { appBackgroundStyle } from '../config/appBackground';

interface LoginPageProps {
  onLogin: () => void;
}

/** 切图存在则显示 img，404 时用 fallback */
function SliceImg({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [ok, setOk] = useState(true);
  if (!ok) return <>{fallback}</>;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setOk(false)}
      draggable={false}
    />
  );
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <div
      className="font-puhui w-full min-h-screen flex flex-col pt-[60px] px-[24px] pb-[40px] antialiased"
      style={appBackgroundStyle}
    >
      <StatusBar time="14:48" battery="61%" />
      <div className="text-center mt-8 mb-12 flex justify-center items-center min-h-[52px] bg-transparent">
        <img
          src={loginBrand.logo}
          alt="WYBOT"
          width={200}
          height={52}
          className="h-[48px] w-auto max-w-[min(280px,85vw)] object-contain object-center select-none mix-blend-multiply"
          draggable={false}
        />
      </div>
      <div
        className="flex items-center gap-3 px-5 py-4 mb-4 rounded-[30px]"
        style={{ background: '#C8C8C8' }}
      >
        <SliceImg
          src={loginSlice.iconEmail}
          alt=""
          className="w-5 h-5 flex-shrink-0 object-contain"
          fallback={<Mail size={20} strokeWidth={2} className="text-[#000000] flex-shrink-0" />}
        />
        <input
          type="text"
          placeholder="Email Address"
          className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#000000] placeholder:text-[#666666] font-normal"
        />
      </div>
      <div
        className="flex items-center gap-3 px-5 py-4 mb-4 rounded-[30px]"
        style={{ background: '#C8C8C8' }}
      >
        <SliceImg
          src={loginSlice.iconLock}
          alt=""
          className="w-5 h-5 flex-shrink-0 object-contain"
          fallback={<Lock size={20} strokeWidth={2} className="text-[#000000] flex-shrink-0" />}
        />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#000000] placeholder:text-[#666666] font-normal"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="p-0 m-0 border-0 bg-transparent cursor-pointer flex-shrink-0 flex items-center justify-center rounded-md outline-none transition-opacity active:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00C2E0] focus-visible:ring-offset-1"
          aria-label={showPassword ? '隐藏密码' : '显示密码'}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <Eye size={20} strokeWidth={2} className="text-[#000000] flex-shrink-0" />
          ) : (
            <EyeOff size={20} strokeWidth={2} className="text-[#000000] flex-shrink-0" />
          )}
        </button>
      </div>
      <div className="flex justify-between items-center mb-6 text-[14px] text-[#000000] font-normal">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#000000]" />
          Remember me
        </label>
        <span className="underline cursor-pointer">Forgot Password</span>
      </div>
      <label className="flex items-start gap-2 cursor-pointer text-left mb-4 px-0.5">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mt-[2px] w-4 h-4 flex-shrink-0 accent-[#000000] cursor-pointer"
        />
        <span className="text-[12px] text-[#666666] font-normal leading-relaxed">
          By logging in, you agree to the Terms of Service and Privacy Policy, including Cookie Use.
        </span>
      </label>
      <button
        type="button"
        onClick={onLogin}
        disabled={!agreeTerms}
        className="w-full py-4 rounded-[50px] text-[16px] font-bold text-white mb-6 transition-opacity active:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: '#000000' }}
      >
        login
      </button>
      <p className="text-[14px] text-center mb-8 font-normal text-[#000000]">
        Can&apos;t login?{' '}
        <span className="font-bold text-[#00C2E0] cursor-pointer">SIGN UP</span> for an account!
      </p>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-[#DDDDDD]" />
        <span className="text-[12px] text-[#666666] whitespace-nowrap">
          Login with a third party account
        </span>
        <div className="flex-1 h-px bg-[#DDDDDD]" />
      </div>
      <div className="flex justify-center gap-6">
        <button
          type="button"
          className="w-14 h-14 shrink-0 rounded-full overflow-hidden p-0 border-0 transition-opacity active:opacity-90"
          style={{ background: '#000000' }}
          aria-label="Apple 登录"
        >
          <img
            src={loginBrand.iconApple}
            alt=""
            width={56}
            height={56}
            className="h-[56px] w-[56px] object-cover object-center block"
            draggable={false}
          />
        </button>
        <button
          type="button"
          className="w-14 h-14 shrink-0 rounded-full overflow-hidden p-0 border border-[#DDDDDD] bg-white transition-opacity active:opacity-90"
          aria-label="Google 登录"
        >
          <img
            src={loginBrand.iconGoogle}
            alt=""
            width={56}
            height={56}
            className="h-[56px] w-[56px] object-cover object-center block"
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
};
