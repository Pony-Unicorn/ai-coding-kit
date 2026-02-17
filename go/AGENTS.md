# Go Developer & Agent Guidelines (LLM-Friendly)

> 目标：确保项目中的 Go 代码变更满足“分层依赖正确、可编译、可测试、可维护”。

## 1. 适用范围

- 适用于项目内所有 Go 代码的新增、修改、审查。
- 若规则冲突，优先级：分层依赖 > 正确性 > 可测试性 > 可维护性。

## 2. 核心技术栈

- Go
- Fiber v3 (`github.com/gofiber/fiber/v3`)
- validator v10 (`github.com/go-playground/validator/v10`)
- GORM + MySQL
- Viper（`env + config.yaml`）
- Zerolog
- Resty
- `testing` + `httptest`

## 3. 架构与职责（MUST）

```text
cmd/api/           程序入口
internal/config/   配置加载与校验
internal/api/      路由与 Handler（协议层）
internal/service/  业务规则与事务编排
internal/store/    数据访问（GORM）
internal/models/   数据库模型
internal/dto/      请求/响应结构
internal/infra/    apperr/log/response/httpclient
```

职责边界：
- `api`：绑定、校验、调用 service、返回响应。
- `service`：业务规则、事务、错误语义转换。
- `store`：持久化访问，不处理 HTTP 语义。
- 说明：本规范中的 `service` 指业务层（application layer），不同于 Fiber v3 的 `Services` 生命周期机制。

依赖方向：
- 只允许 `api -> service -> store -> models`
- `api` 可依赖：`dto`、`infra/response`、`infra/apperr`、`infra/log`
- `service` 可依赖：`store`、`models`、`infra/apperr`、`infra/httpclient`
- `store` 仅依赖：`models` 与基础库

禁止：
- handler 直接访问 DB/GORM
- service 返回 `fiber.Map` 等 HTTP 表达结构
- store 引入 `fiber`、`dto`、`infra/response`
- `models` 作为对外协议结构（`json`/`validate` tag）

## 4. 编码规范（SHOULD，带 * 为 MUST）

- 包名小写、简短、无中划线；避免 stutter naming（如 `store.Store`）。
- URL path 使用 `kebab-case`。
- *`context.Context` 透传，通常为第一个参数；不存入结构体字段。*
- *Fiber v3 的 handler 可直接将 `c` 作为 `context.Context` 传给 service。*
- *`fiber.Ctx` 仅在请求生命周期内有效；异步任务请改传 `c.Context()`。*
- *DTO 与 Model 严格隔离：`dto` 不用 `gorm` tag，`models` 不用 `json`/`validate` tag。*
- 错误处理建议：返回 `error` 并 `%w` 包装，使用 `errors.Is/As` 分类。
- *对外仅返回安全错误信息，内部细节只用于日志；业务错误统一走 `infra/apperr`。*
- *日志禁止输出敏感信息（密码、token、密钥、隐私数据）。*
- 错误日志建议包含 `request_id`、`path`、`method`、`code`（可得时）。

## 5. 配置规范（SHOULD，带 * 为 MUST）

- *优先级：`env > config.yaml > default`*
- 显式默认值：`viper.SetDefault(...)`
- 建议流程：
  1. `viper.SetConfigFile("config.yaml")`
  2. `viper.AutomaticEnv()`
  3. `viper.ReadInConfig()`（env-only 可容忍 `ConfigFileNotFoundError`）
  4. `viper.Unmarshal(&cfg)`
- *启动时校验关键配置（端口、DSN 等），缺失即失败退出。*
- `config.example.yaml` 与真实配置字段保持一致。

## 6. HTTP 与外部调用（SHOULD，带 * 为 MUST）

- *Handler 必须完成 Body/Query/Params 绑定与校验（Fiber v3 使用 `c.Bind()`）。*
- *成功响应返回 DTO，不返回裸 `map`。*
- *使用全局 Fiber `ErrorHandler` 统一错误出口。*
- *必须启用 `recover` 中间件（Fiber 默认不自动 recover panic）。*
- *外部 HTTP 必须封装在 `internal/infra/httpclient`。*
- Resty 建议配置超时、重试、request-id 透传。
- 默认仅幂等请求可重试；非幂等请求需显式禁用或使用幂等键。
- *禁止在 handler 直接调用第三方 HTTP。*
- 建议中间件顺序（注册要靠前）：`requestid -> logger -> recover -> 业务中间件/路由`。

### 6.1 Fiber v3 绑定与验证（推荐）

- 推荐在 `fiber.New(fiber.Config{...})` 中配置 `StructValidator`（`validator/v10`）。
- handler 中通过 `c.Bind()` 做绑定+验证，避免分散手工校验逻辑。
- 参数来源按场景明确调用：`c.Bind().Body(...)`、`c.Bind().Query(...)`、`c.Bind().URI(...)`。

## 7. 数据层与 API 约束（SHOULD，带 * 为 MUST）

- *Store 方法必须接收 `context.Context`。*
- *事务由 service 层控制。*
- *生产环境禁用 `AutoMigrate`。*
- 明确处理 `gorm.ErrRecordNotFound`。
- REST 状态码遵循语义（200/201/400/404/409/500）。
- 分页参数统一（`page`、`page_size`）。

## 8. 交付与验收（MUST）

执行约束：
- 不得虚构包、函数、文件路径。
- 新增代码必须遵守本规范目录与依赖方向。
- 占位模块路径（如 `<your-module>`）必须替换为 `go.mod` 的真实 `module`。

质量门禁：

```bash
go fmt ./...
go test ./...
go vet ./...
```

可用时执行：

```bash
goimports -w <files>
golangci-lint run
```

说明：本地未安装 `golangci-lint` 可跳过，但 CI 必须通过。

交付说明必须包含：
1. 修改文件路径
2. 修改动机
3. 风险与回滚点
4. 验证结果（执行命令与通过情况）

提交前自检（仅验收关键项）：
- [ ] 架构与依赖方向无违规（见第 3 节）
- [ ] 协议层 / 业务层 / 数据层职责未越界（见第 3、6、7 节）
- [ ] 错误与日志满足安全要求（见第 4、6 节）
- [ ] 已启用 `recover`，并使用全局 `ErrorHandler`
- [ ] 质量门禁命令已执行并通过
- [ ] 交付说明四要素已完整提供

## 9. 附录：最小示例（精简）

说明：
- 示例仅用于分层与依赖参考，省略了 import 与部分类型定义，不是直接复制模板。
- `fiber.Ctx` 只在 handler 生命周期内有效；若要在异步流程中使用 context，请在 handler 内获取 `c.Context()` 后再传递。

```go
// app setup (Fiber v3 best-practice baseline)
type structValidator struct{ v *validator.Validate }

func (sv *structValidator) Validate(out any) error { return sv.v.Struct(out) }

app := fiber.New(fiber.Config{
	StructValidator: &structValidator{v: validator.New()},
	ErrorHandler:    NewErrorHandler(), // 统一错误出口
})

app.Use(requestid.New())
app.Use(logger.New())  // logger 注册要靠前
app.Use(recover.New()) // Fiber 默认不会自动 recover panic
```

```go
// dto
package dto

type CreateUserRequest struct {
	Name string `json:"name" validate:"required,min=2"`
}

type UserResponse struct {
	ID uint `json:"id"`
}

type ErrorResponse struct {
	Message string `json:"message"`
}
```

```go
// store
package store

func (s *UserStore) Create(ctx context.Context, u *models.User) error {
	return s.db.WithContext(ctx).Create(u).Error
}
```

```go
// service
package service

func (s *UserService) Create(ctx context.Context, req dto.CreateUserRequest) (*dto.UserResponse, error) {
	u := &models.User{Name: req.Name}
	if err := s.users.Create(ctx, u); err != nil {
		return nil, err
	}
	return &dto.UserResponse{ID: u.ID}, nil
}
```

```go
// handler
package api

func (h *UserHandler) Create(c fiber.Ctx) error {
	var req dto.CreateUserRequest
	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ErrorResponse{Message: "invalid request"})
	}
	if err := h.validator.Struct(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ErrorResponse{Message: "validation failed"})
	}
	resp, err := h.svc.Create(c, req)
	if err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(resp)
}
```
