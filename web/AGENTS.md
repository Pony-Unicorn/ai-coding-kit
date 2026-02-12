# Developer & Agent Guidelines

## 1. 核心开发哲学

- **零编译/无构建**：严禁引入任何需要 Node.js、Vite、Webpack 等工具编译的依赖。
- **CDN 优先**：所有库必须通过 CDN 形式引入（通过 `<script>` 或 ESM 导入）。
- **CDN 版本策略**：优先使用固定版本号（避免 `latest`），并统一从可信 CDN 引入。
- **版本示例**：`https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/cdn.min.js`
- **AI 友好型架构**：代码结构保持高度集中，减少跨文件上下文切换，确保 AI 生成代码的准确度；默认只允许 `index.html` + `app.js` 两文件协作。

## 2. 技术栈清单 (Standard Stack)

- **核心框架**:
  - 样式引擎: [Tailwind CSS (Play CDN)](https://tailwindcss.com)
  - UI 组件库: [DaisyUI (CDN版)](https://daisyui.com)
  - 逻辑框架: [Alpine.js (3.x CDN版)](https://alpinejs.dev)
- **功能增强**:
  - 网络请求: [ky.js (ESM CDN版)](https://github.com/sindresorhus/ky)
  - 图标库: [Lucide Icons (CDN版)](https://lucide.dev)
  - 时间处理: [Day.js](https://day.js.org) (轻量日期库)
- **CDN 建议**: 统一使用 `https://cdn.jsdelivr.net`（除非官方明确推荐其他来源）。
- **引入顺序**: Tailwind -> DaisyUI -> Alpine -> 其他功能库。

## 3. 文件组织与 JS 演进原则 (The 500-Line Rule)

- **单文件优先 (In-HTML)**：
  - 当业务 JS 逻辑 **< 500 行** 时，逻辑必须内联在 `index.html` 底部的 `<script type="module">` 标签内。
  - _理由_：保持 UI 与逻辑的全局视野，提高 AI 生成效率。
- **解耦模式 (External JS)**：
  - 当 JS 逻辑 **≥ 500 行** 时，必须将逻辑提取至同级目录的 `app.js`。
  - HTML 仅保留 UI 结构，通过 `x-data` 关联 `app.js` 中的模型。
- **计数范围**：仅统计 `index.html` 中 `<script type="module">` 的 JS 行数；不计入 HTML 与 `<style>`。
- **CSS 规范**：
  - 严禁创建独立 `.css` 文件。
  - 99% 样式通过 Tailwind/DaisyUI 类名实现。极少数特殊样式写在 HTML 顶部的 `<style>`。

## 4. 编写规范 (Coding Rules)

### 4.1 UI 与样式

- **语义化优先**：优先使用 DaisyUI 组件类名（如 `btn-primary`, `card`, `modal`, `chat-bubble`）以精简代码。
- **响应式**：必须使用 Tailwind 断点前缀（如 `md:flex`, `hidden lg:block`）。

### 4.2 Alpine.js 交互

- **初始化**：JS 逻辑必须包裹在 `document.addEventListener('alpine:init', ...)` 内。
- **适用范围**：无论逻辑位于 `index.html` 还是 `app.js`，均需遵循该初始化方式。
- **组件化**：使用 `Alpine.data('componentName', () => ({ ... }))` 结构定义模型。
- **混合状态**：简单的 UI 状态（如 `open: false`）可直接内联在 HTML 属性中。

### 4.3 网络请求 (ky.js)

- **引入**：必须使用 ESM 导入：`import ky from 'https://cdn.jsdelivr.net'`。
- **超时与异步**：
  - AI 接口请求必须设置 `timeout: 60000` (60秒)。
  - 必须使用 `try...catch` 结构并维护 `loading` 状态。
- **示例**：`const data = await ky.post(url, { json: payload, timeout: 60000 }).json();`
- **例外**：若第三方 SDK 强制要求原生 `fetch`，可按其文档使用，但需在代码中注明原因与文档来源。

### 4.4 图标处理

- 使用 CDN 引入 Lucide 后再调用图标渲染方法。
- 初次加载可在 `alpine:init` 之后调用 `lucide.createIcons();`。
- 动态新增图标节点后，必须再次调用 `lucide.createIcons();`。

## 5. 项目结构示例

```text
/project-root
├── index.html       # 核心 UI 页面
├── app.js           # (仅当逻辑 > 500 行时创建)
└── assets/          # 本地图片/字体等静态资源，不放第三方 JS/CSS
```

## 6. AI 检查清单 (AI Agent Checklist)

1. 禁止建议使用 npm install、node_modules 或任何构建步骤。
2. 禁止建议创建独立的 .css 文件。
3. 行数监控：逻辑接近 500 行时，必须主动提醒用户并建议执行 app.js 拆分流程（app.js 不受 500 行约束）。
4. API 标准：检查是否使用了 ky.js 处理异步请求，而非原生 fetch。
5. 环境检查：确保 HTML 头部已正确配置 Tailwind、DaisyUI、Alpine.js、ky.js、Lucide、Day.js 的 CDN。
6. 逻辑注入：确保所有逻辑都在 alpine:init 事件监听器内，避免执行顺序错误。
