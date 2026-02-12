# Developer & Agent Guidelines

本文件定义了本项目的核心技术规范和架构约束，旨在为开发者和 AI Agent 提供明确的编码准则。

## 核心技术栈

- **语言**: Go
- **框架**: Fiber (github.com/gofiber/fiber/v2)
- **校验**: go-playground/validator v10
- **ORM**: GORM (MySQL)
- **配置**: Viper + `config.yaml`
- **日志**: Zerolog (github.com/rs/zerolog)
- **错误处理**: `error` + 统一错误响应（Fiber ErrorHandler + AppError）
- **请求库**: Resty (github.com/go-resty/resty/v2)
- **测试**: Go `testing` + `httptest`

## 编码规范

### 通用准则

- **并发与异步**: 避免滥用 goroutine；`context.Context` 仅用于外部调用/DB 超时与取消控制。
- **模块规范**: 使用 Go Modules。包路径清晰、稳定。
- **类型安全**: 所有请求必须绑定并校验；响应结构体必须显式定义。
- **常量位置**: 遵循“就近原则”，常量放在使用它的包内。跨包共享时，放在对应领域包的 `constants.go`，避免集中到巨大的全局常量包。
- **命名规范**:
  - URL 路径: `kebab-case` (例如 `/portfolio-tracker`)。
  - 包/目录名: 全小写，避免 `-`，优先简短名。
  - 包名避免与类型名重复（避免 `api.Api`、`store.Store` 这类命名）。
  - Store 命名: 以 `Store` 结尾 (例如 `UserStore`)。
  - SQL 文件: `<时间戳>_<语义化文件名>.sql` (例如 `20240212120000_create_posts.up.sql`)。

### 架构模式 (极简)

- **cmd**: 应用入口（主程序），位于 `cmd/api/`。
- **config**: 配置加载与校验，位于 `internal/config/`。
- **api**: 路由注册与请求处理，位于 `internal/api/`（不放业务逻辑，不持久化状态）。
- **store**: 数据访问封装，位于 `internal/store/`，直接使用 GORM。
- **models**: 数据模型，位于 `internal/models/`。
- **dto**: 请求/响应结构体，位于 `internal/dto/`。
- **infra**: 基础设施，按子包拆分，位于 `internal/infra/`。
  - `infra/log`: 日志封装
  - `infra/response`: 统一响应
  - `infra/errors`: 错误封装
  - `infra/httpclient`: HTTP 工具（Resty）

### DTO 与模型边界

- `dto` 仅包含请求/响应结构体。
- `models` 仅包含 DB 模型。
- `dto` 不包含 GORM tag，`models` 不包含 `json/validate` tag。

## 📁 项目目录结构与任务映射

AI Agent 在执行任务时应遵循以下路径映射：

| 任务类型          | 涉及目录/文件          | 职责说明                                  |
| :---------------- | :--------------------- | :---------------------------------------- |
| **应用入口**      | `cmd/api/main.go`      | 读取配置、初始化依赖、启动服务            |
| **配置加载**      | `internal/config/`     | Viper 读取项目根目录 `config.yaml` 并校验 |
| **数据模型**      | `internal/models/`     | 使用 GORM 定义 Model 结构与关联           |
| **请求/响应 DTO** | `internal/dto/`        | 使用 validator 进行校验标签定义           |
| **实现数据访问**  | `internal/store/`      | 创建 `*_store.go`，封装数据库访问         |
| **开发 API 接口** | `internal/api/`        | 路由注册与请求处理逻辑放在一起            |
| **编写测试用例**  | `internal/**/_test.go` | 使用 Go 原生测试框架编写单元/集成测试     |
| **通用基础设施**  | `internal/infra/*`     | log/response/errors/httpclient 等子包     |
| **配置示例文件**  | `config.example.yaml`  | 声明所需的配置项，Agent 应参考此文件      |

## 依赖方向

- `internal/api/` 可依赖 `internal/dto/`、`internal/store/`、`internal/infra/`。
- `internal/store/` 仅依赖 `internal/models/` 与基础库，不得依赖 `internal/api/` 或 `internal/dto/`。
- `internal/models/` 不依赖上层包。

## 配置规范

- **配置来源**: 仅使用项目根目录 `config.yaml`。
- **加载流程**: `viper.ReadInConfig()` -> `viper.Unmarshal(&cfg)`。
- **必填校验**: 启动时校验关键字段（如 DB DSN、服务端口等），缺失则直接退出并打印错误。
- **示例一致性**: `config.example.yaml` 必须与 `config.yaml` 字段保持一致。
- **测试配置**: 测试可使用 `config.test.yaml` 或通过注入配置覆盖。

## 校验与绑定最佳实践

### 1. 强制完整性

- **请求验证**: 必须对 `Body`、`Query` 或 `Params` 进行绑定和校验。
- **响应序列化**: 必须定义响应结构体，避免直接返回 `map`。

### 2. 命名与导出

```go
// internal/dto/users.go
type CreateUserRequest struct {
  Name  string `json:"name" validate:"required,min=2"`
  Email string `json:"email" validate:"required,email"`
}

type UserResponse struct {
  ID    uint   `json:"id"`
  Name  string `json:"name"`
  Email string `json:"email"`
}
```

## Store 实现模板

创建新 Store 时必须遵循以下模式：

```go
// internal/store/items_store.go
package store

import (
  "context"

  "gorm.io/gorm"
)

type ItemsStore struct {
  db *gorm.DB
}

func NewItemsStore(db *gorm.DB) *ItemsStore {
  return &ItemsStore{db: db}
}

func (s *ItemsStore) FindByID(ctx context.Context, id uint) (*Item, error) {
  var item Item
  if err := s.db.WithContext(ctx).First(&item, id).Error; err != nil {
    return nil, err
  }
  return &item, nil
}
```

### Store 规则

- Store 方法必须接收 `context.Context`。
- 事务由上层控制并注入（例如将 `*gorm.DB` 传入 Store 或在调用时使用 `db.WithContext(ctx)` 的事务对象）。

## 错误处理规范

- **Store 层**: 直接返回 `error`，不在此层拼装 HTTP 响应。
- **业务逻辑**: 将业务错误包装为 `AppError`（携带 `Code/Status/Message`）。
- **HTTP 处理层**:
  1. 记录错误日志（结构化日志优先）。
  2. 使用统一错误响应函数返回 `{ "message": "..." }`。
  3. 对已知业务错误返回明确状态码（400/404/409）。

示例错误类型：

```go
// internal/infra/errors.go
type AppError struct {
  Code   string
  Status int
  Err    error
}
```

## Resty 使用规范

- 统一在 `internal/infra/httpclient` 作为 HTTP 工具封装第三方调用。
- 必须设置超时、重试策略、Trace 或 Request ID 透传。
- 禁止在 HTTP 处理层中直接调用 Resty。
- 对外暴露接口，便于测试替换。

示例：

```go
// internal/infra/httpclient/partner_client.go
package httpclient

import (
  "time"

  "github.com/go-resty/resty/v2"
)

type PartnerClient struct {
  http *resty.Client
}

func NewPartnerClient(baseURL string) *PartnerClient {
  c := resty.New().
    SetBaseURL(baseURL).
    SetTimeout(3 * time.Second)
  return &PartnerClient{http: c}
}
```

## 测试规范

- 测试文件命名: `*_test.go`。
- 运行测试: `go test ./...`。
- 模拟请求: 使用 `httptest.NewRequest` + Fiber `app.Test`。

## GORM/MySQL 实践建议

- 生产环境禁用 `AutoMigrate`。
- 配置连接池参数（最大连接数、空闲连接数、连接最大生命周期）。

## API 设计规范 (RESTful)

- **成功响应**: 直接返回数据对象。
- **状态码**: 遵循标准 (200 OK, 201 Created, 400 Bad Request, 404 Not Found 等)。
