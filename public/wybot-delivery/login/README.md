# 登录页切图放置说明

**Logo、Apple、Google 按钮图** 已内置在仓库：`src/assets/login/`（由 Vite 打包）。若要替换，直接覆盖该目录下对应 PNG 即可。

本目录（`public/wybot-delivery/login/`）用于**可选**切图：

将 **wybot交付文件-切图** 里 **login** 中其余图片复制到本目录，并按表内文件名命名：

| 建议文件名 | 用途 |
|-----------|------|
| `login-bg.png` | 页面背景（可选；不存在则使用渐变背景） |
| `icon-email.png` | 邮箱输入框左侧图标 |
| `icon-lock.png` | 密码框左侧图标 |
| `icon-eye-off.png` | 密码框右侧「隐藏密码」图标 |

若设计导出为 `@2x`、`编组` 等名称，复制后重命名为上表即可。

**自定义路径**：在项目根目录创建 `.env`，例如：

```env
VITE_LOGIN_ASSETS_BASE=/你的文件夹/login
```

（路径相对于网站根目录，对应 `public` 下的目录结构。）
