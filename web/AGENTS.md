# Developer & Agent Guidelines

## 1. 核心开发哲学

- **目录扁平化**：严禁过度嵌套。所有 HTML 和核心 JS (`shared.js`) 统一存放于根目录，确保路径引用直觉化。
- **厚页面模式 (Thick-HTML)**：私有 UI 交互逻辑优先保留在 HTML 的 `<script type="module">` 内。
- **1000行原则**：单个 HTML 文件的 JS 逻辑 1000 行左右
- **零编译/无构建**：严禁引入任何需要 Node.js、Vite、Webpack 等工具编译的依赖。
- **CDN 规范**：所有库必须通过 CDN 引入（`<script>` 或 ESM），优先固定版本号，默认使用 `https://cdn.jsdelivr.net`。示例：`https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/cdn.min.js`

## 2. 技术栈清单 (Standard Stack)

- **样式**: [Tailwind CSS (Play CDN)](https://tailwindcss.com) + [DaisyUI](https://daisyui.com)
- **交互**: [Alpine.js (3.x CDN)](https://alpinejs.dev)
- **请求**: [ky.js (ESM CDN)](https://esm.sh)
- **图标**: [Iconify (按需加载)](https://iconify.design) -> 格式: `lucide:icon-name`
- **时间处理**: [Day.js](https://day.js.org) (轻量日期库)
- **引入顺序**: Tailwind -> DaisyUI -> Alpine -> 其他功能库。

## 3. 文件组织与 JS 演进原则 (The Flat-Root Rule)

- **HTML 页面**: 存放于根目录。负责处理局部 UI 状态（Loading, Modal, Tab 开关等）。
- **共享逻辑 (shared.js)**：存放于根目录。负责跨页面复用的 API 请求封装、全局常量、公共 Utils。
- **引用规范**：
  - 内部模块引用必须带扩展名：`import { api } from './shared.js'`。
  - 图标使用标签：`<iconify-icon icon="lucide:xxx"></iconify-icon>`。
- **计数范围**：仅统计 `index.html` 中 `<script type="module">` 的 JS 行数；不计入 HTML 与 `<style>`。
- **CSS 规范**：
  - 严禁创建独立 `.css` 文件。
  - 99% 样式通过 Tailwind/DaisyUI 类名实现。极少数特殊样式写在 HTML 顶部的 `<style>`。

## 4. 编写规范 (Coding Rules)

### 4.1 UI 与样式

- **语义化优先**：优先使用 DaisyUI 组件类名（如 `btn-primary`, `card`, `modal`, `chat-bubble`）以精简代码。
- **响应式**：必须使用 Tailwind 断点前缀（如 `md:flex`, `hidden lg:block`）。
- **逻辑分工**:
  - HTML 逻辑：负责交互反馈、视觉切换、局部数据绑定。
  - `shared.js`：负责数据获取、业务逻辑计算、全局 Store 存储。
- **AI 指令**: 修改需求时，AI 需优先判断逻辑归属，避免在 HTML 中重复编写已在 `shared.js` 定义的功能。

### 4.2 Alpine.js 交互

- **初始化**：JS 逻辑必须包裹在 `document.addEventListener('alpine:init', ...)` 内。
- **组件化**：使用 `Alpine.data('componentName', () => ({ ... }))` 结构定义模型。
- **混合状态**：简单的 UI 状态（如 `open: false`）可直接内联在 HTML 属性中。

### 4.3 网络请求 (ky.js)

- **API 封装**: 所有 `ky.js` 的实例化和具体后端接口定义必须在 `shared.js` 中导出，并且使用 ESM 导入
- **超时与异步**：
  - AI 接口请求必须设置 `timeout: 60000` (60秒)。
  - 必须使用 `try...catch` 结构并维护 `loading` 状态。
- **示例**：`const data = await ky.post(url, { json: payload, timeout: 60000 }).json();`
- **例外**：若第三方 SDK 强制要求原生 `fetch`，可按其文档使用，但需在代码中注明原因与文档来源。

### 4.4 图标使用 (Iconify 规范)

- **统一格式**：使用 `<iconify-icon icon="lucide:icon-name"></iconify-icon>` 标签。
- **按需加载**：AI 需直接搜索并在代码中使用对应的 Lucide 图标标识符（如 `lucide:sparkles`）。

## 4.5 JS 命名规范 (Naming Conventions)

为确保 AI 在 HTML 与 shared.js 之间逻辑一致，必须遵循以下命名规则：

- **组件与模型 (Alpine.data)**:
  - 使用 **小驼峰 (camelCase)** 命名。
  - 页面上下文统一命名为 `pageContext` 或 `[Name]Context`（如 `chatContext`）。
- **UI 交互变量 (Boolean/State)**:
  - 状态变量必须具有描述性，布尔值优先使用 `is`, `has`, `show` 前缀。
  - 示例: `isLoading`, `isOpen`, `showModal`, `hasError`。

- **函数与方法 (Actions)**:
  - 动词开头。UI 交互使用 `handle` 或 `toggle` 前缀，API 请求使用 `fetch` 或 `submit` 前缀。
  - 示例: `handlesubmit()`, `toggleSidebar()`, `fetchUserList()`。

- **常量 (Constants)**:
  - 全局常量使用 **大写下划线 (SNAKE_CASE)**。
  - 示例: `BASE_URL`, `MAX_RETRY_COUNT`。

- **API 接口 (In shared.js)**:
  - 导出对象统一使用 `api` 或 `[Module]Api`。
  - 示例: `export const authApi = { login: ... }`。

## 5. 项目结构示例

```text
/project-root
├── index.html       # 核心 UI 页面
├── shared.js        # (API 请求封装、全局常量、公共 Utils)
└── assets/          # 本地图片/字体等静态资源，不放第三方 JS/CSS
```

## 6. AI 检查清单 (AI Agent Checklist)

1. 禁止建议使用 npm install、node_modules 或任何构建步骤。
2. 禁止建议创建独立的 .css 文件。
3. 行数监控：当 HTML 内 JS 接近 1000 行时，主动建议重构冗余逻辑至 `shared.js`。
4. API 标准：检查是否使用了 ky.js 处理异步请求，而非原生 fetch。
5. 环境检查：确保 HTML 头部已正确配置 Tailwind、DaisyUI、Alpine.js、ky.js、Lucide、Day.js 的 CDN。
6. 逻辑注入：确保所有逻辑都在 alpine:init 事件监听器内，避免执行顺序错误。
