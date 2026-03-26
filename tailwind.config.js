/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wybot: {
          bg: '#F7F7F7',
          'bg-input': '#EDEDED',
          cyan: '#00C2E0',
          'cyan-glow': '#E0F7F9',
          black: '#000000',
          'text-muted': '#666666',
          'text-placeholder': '#A0A0A0',
          'card-gray': '#E5E7EB',
          'card-cool': '#E9EEF2',
          'temp-dot': '#F87171',
          'primary-blue': '#2555D1',
          'section-bg': '#F7F8FA',
          'device-bg': '#D9F2F7',
          'device-accent': '#00C2FF',
          'device-muted': '#666666',
          'device-disabled': '#CCCCCC',
          'toggle-off': '#E5E7EB',
          'general-top': '#E6F7F9',
          'general-bg': '#F8F9FA',
          'radio-inactive': '#BDBDBD',
          'modal-overlay': 'rgba(0,0,0,0.5)',
        },
      },
      fontFamily: {
        sans: [
          '"Alibaba PuHuiTi"',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
        /** 阿里巴巴普惠体（登录页等） */
        puhui: [
          '"Alibaba PuHuiTi"',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
      },
      borderRadius: {
        'card': '24px',
        'card-lg': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'card': '0px 4px 12px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
