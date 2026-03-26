/**
 * 登录页品牌切图（Vite 打包，随仓库提交）
 * 替换文件：src/assets/login/login-logo.png、icon-apple.png、icon-google.png
 */
import loginLogo from '../assets/login/login-logo.png';
import iconApple from '../assets/login/icon-apple.png';
import iconGoogle from '../assets/login/icon-google.png';

export const loginBrand = {
  logo: loginLogo,
  iconApple,
  iconGoogle,
} as const;
