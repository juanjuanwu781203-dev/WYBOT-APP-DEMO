/**
 * 登录页切图路径（Vite public 目录）
 *
 * 请将「wybot交付文件-切图」中 login 文件夹内的导出图复制到：
 *   react-demo/public/wybot-delivery/login/
 * 并按 README 中的文件名命名（或与下方键名对应文件一致）。
 *
 * 也可通过环境变量覆盖根路径，例如：
 *   VITE_LOGIN_ASSETS_BASE=/my-slices/login
 */
const base =
  (import.meta.env.VITE_LOGIN_ASSETS_BASE as string | undefined)?.replace(/\/$/, '') ??
  '/wybot-delivery/login';

export const loginSlice = {
  /** 可选：整页或顶部背景 */
  background: `${base}/login-bg.png`,
  /** 邮箱 / 密码 / 眼睛图标（可选切图，见 public/wybot-delivery/login/README） */
  iconEmail: `${base}/icon-email.png`,
  iconLock: `${base}/icon-lock.png`,
  iconEye: `${base}/icon-eye-off.png`,
} as const;
