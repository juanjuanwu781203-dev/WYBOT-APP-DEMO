import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目站部署在 /WYBOT-APP-DEMO/ 子路径下，
  // base 必须与仓库名一致，否则资源会请求根路径而 404。
  base: '/WYBOT-APP-DEMO/',
  plugins: [react()],
})
