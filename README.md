# AI Coding kit

这是我在实际开发中使用的 **Skills 与 MCP 配置** 的集合，用于沉淀和复用 AI 辅助编程能力。

## AI Coding 推荐工作方式

> 目标不是让模型更聪明，而是让它更难犯错  
> 知识不足时，用 MCP 或内部文档补齐

### 基础搭建

- 目标：先把“项目护栏”搭好，降低模型犯错概率
- 护栏内容：代码规范、命名规则、目录结构、错误处理与返回约定、日志与异常风格、基础示例、推荐写法
- 必须有 `AGENTS.md`: 明确技术栈、目录结构、代码风格、禁止事项、输出格式等
- 参考：
  - [前端推荐](https://github.com/Pony-Unicorn/react-template/blob/main/AGENTS.md)
  - [AGENTS.md 规范](https://jimmysong.io/zh/book/ai-handbook/sdd/agents/)
- 配置常用 MCP、Skills、Commands，保证信息与工具可随时调用

### 工作流（Superpowers 为主，OpenSpec 为补）

- 目标：把“想法”变成“可验证的交付物”
- 默认策略：日常开发只用 Superpowers 的 Plan + 测试，效率优先
- 关键时刻：涉及核心业务逻辑（例如收银台逻辑、权限校验）时，跑 `/opsx:proposal` 让 AI 复核一次
- 任务收尾：需要长期维护或高频变更时，追加一句“把这次改动的核心逻辑记入 specs/ 目录”

**适用场景**

- 需求不清晰或需要先梳理
- 跨模块联动或依赖外部系统
- 风险高、失败代价大、需要分阶段验证
- 需要制定统一规范或团队工作流

**OpenSpec 补充流程（必要时）**

- 需求清晰化：范围、目标、约束、验收标准（产出：需求说明）
- 技术调研与风险清单（必要时）（产出：风险清单）
- 用 `/opsx:explore` 讨论方案与假设（产出：方案概要）
- 用 `/opsx:new` 形成提案（产出：提案）
- 用 `/opsx:continue` 拆分任务（产出：任务清单）
- 用 `/opsx:apply` 实现（产出：代码变更）
- 用 `/opsx:verify` 验证（产出：测试或验证结果）
- MCP 辅助测试或验证（可选）
- Review 规范：Skill Code Review + 关键功能人工 Review/测试
- Git：用 Skill 生成 Commit
- 用 `/opsx:archive` 归档（产出：项目文档）

### Session 管理

- 目标：让上下文可控、可追踪、可复用
- 以功能为最小单位开 session，功能之间用文档衔接
- 文档梳理、实现、Review、Fix、Commit 各自独立 session 更清晰
- Review 建议用 plan 模式

### AI 编程助手

#### 工具清单

- [Claude Code](https://code.claude.com/docs/zh-CN/overview)
- [Codex](https://developers.openai.com/codex/cli)
- [Gemini CLI](https://geminicli.com/docs/cli/)
- [Open Code](https://opencode.ai/docs)
- 可尝试安装 [OhMyOpenCode](https://github.com/code-yeongyu/oh-my-opencode) 作为 Open Code 的增强

#### 组合打法

- 原则：一个项目中同时使用 3 个 CLI，分工明确，降低单模型偏差
- Codex: 头脑风暴、文档梳理、新提案与任务拆分
- Claude Code: 服务端代码实现、测试、Code Review
- Gemini CLI: 前端代码实现、UI 与交互相关逻辑
- Claude Code 与 Gemini 的实现可交替使用，节省 token，同时避免“同脑问题”

## Skills

### Install Skills

- 使用 skills 安装 `pnpm dlx skills add Pony-Unicorn/ai-coding-kit`
- 如需要 gemini 安装 `gemini skills install .agents/skills --scope workspace`

### Coding

- 前端 UI 设计
  - [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill?tab=readme-ov-file#using-cli-recommended): 专业 UI/UX 设计能力，需要单独命令行安装
  - [frontend-design](https://skills.sh/anthropics/skills/frontend-design) UI 设计，轻量
- SEO
  - [seo-audit](https://skills.sh/coreyhaines31/marketingskills/seo-audit) SEO 审计
  - [audit-website](https://skills.sh/squirrelscan/skills/audit-website) SEO、技术、性能和安全问题的审计
- [agent-browser](https://skills.sh/vercel-labs/agent-browser/agent-browser) 使用 agent-browser 进行浏览器自动化
- `git-commit`: Git 提交助手
- `code-review`: TypeScript、Python、Swift、Kotlin、Go 的全面代码审查
- `security-review`: 身份验证、用户输入、机密信息、API 端点与支付类功能的安全检查
- `typescript-patterns`: TypeScript 最佳实践
- `golang-patterns`: Go 最佳实践
- `database-design`: 数据库设计
- 关闭 Claude Co-author：在 `settings.json` 中设置 `{"attribution": {"commits": false,"pullRequests": false}}`

### 文本创作

- https://github.com/blader/humanizer 消除 AI 生成写作痕迹

## MCP

### 官方文档

- [Claude Code](https://code.claude.com/docs/zh-CN/mcp)
- [Codex](https://developers.openai.com/codex/mcp)
- [Gemini](https://geminicli.com/docs/tools/mcp-server/#configuration-structure)
- [OpenCode](https://opencode.ai/docs/mcp-servers/)

### Recommend MCP

**必须安装**

- Context7: 实时获取文档 https://github.com/upstash/context7
- exa: 联网搜索与网页内容阅读 https://exa.ai/docs/reference/exa-mcp
- grep: 查询公共 GitHub https://vercel.com/blog/grep-a-million-github-repositories-via-mcp
- DeepWiki: https://docs.devin.ai/zh/work-with-devin/deepwiki-mcp
- Chrome DevTools MCP: 前端调试、性能分析、辅助开发 https://github.com/chromedevtools/chrome-devtools-mcp

**可选**

- Playwright MCP: 批量抓取、自动化测试、定时监控 https://github.com/microsoft/playwright-mcp
- Agent Browser: AI 代理浏览器自动化 https://github.com/vercel-labs/agent-browser
- Fetch: HTML 转 Markdown https://remote.mcpservers.org/fetch/mcp
- GitHub MCP: GitHub 代码搜索 https://github.com/github/github-mcp-server

**前端**

- Figma MCP: 设计稿与组件协作 https://www.figma.com/mcp-catalog/

## Plugin

- Superpowers https://github.com/obra/superpowers 提供完整软件开发工作流程

## Agents

- 官方参考 https://code.claude.com/docs/zh-CN/sub-agents

## 技巧

- 修改策略：小步提交，避免大爆改
- 复杂需求先出“最小可行方案”，再扩展，避免一次性大改
- 任何不确定的关键点先写成假设，验证后再进入实现
- 找开源方案时用 DeepWiki MCP：它对 GitHub 项目有更强的搜索与分析能力，适合快速判断是否匹配需求
- 良好的提示词 https://jimmysong.io/zh/book/ai-handbook/prompt/overview/

## 常见问题汇总

- 国内代理问题访问不了：Claude Code 不支持 SOCKS 代理，只能设置 http/https
- 示例：
  - export https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897

## 参考

- https://skills.sh/
- https://skillsmp.com/
- https://www.aitmpl.com/skills
- https://mcpservers.org/
