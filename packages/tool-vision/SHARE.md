# 分享指南：GPT 识图插件（tool-vision + ui-vision）

本目录包含识图能力的**两个可分发单元**，以及对方各自需要配置的内容。

## 两个可分发单元

| 包 | 目录 | 作用 |
|---|---|---|
| `@deepseek-ai/dsh-tool-vision` | `packages/vision/tool-vision/` | Host 工具包：`take_screenshot` / `list_windows` / `analyze_image` + `vision` 设置命名空间 + gpt 识图通道 |
| `@deepseek-ai/dsh-client-ui-vision` | `packages/client/ui-vision/` | 浏览器设置卡片（Settings → 插件 → 插件配置 → 图像识别） |

> 生图插件（`@deepseek-ai/dsh-tool-image-generation` + GenerationCard）是独立工作，按同一套方式分享，不在本目录。

## 前置条件

- 对方运行**同源的 deepseek-harness 部署**（本仓库 `0.1.0-rc.7` 系；peer 依赖按版本匹配，跨版本可能有兼容风险）。
- 对方使用 macOS、Windows 或 Linux；`interactive` 手动框选仅支持 macOS，Windows/Linux 使用 `region` 坐标截图。
- Linux 需要 ImageMagick、`wmctrl` 与 `x11-utils`；Windows 使用系统自带 PowerShell `System.Drawing`。
- **密钥绝不分发**：`VISION_GPT_API_KEY` 由对方在设置页自行填写（存到对方机器 `.credentials.yaml`）。

## 分发方式（按对方环境三选一）

### A. 同仓库协作（团队推荐，零额外基础设施）

把以下改动提交到 deepseek-harness 仓库，对方 pull 后：

```bash
pnpm install
# 构建 host + client 产物
pnpm exec tsdown --env.DSH_BUILD_FACE host
pnpm exec tsdown --env.DSH_BUILD_FACE client
# 重建 web bundle（让设置页外壳带上新 client 包的 manifest）
pnpm --filter @deepseek-ai/dsh-web-frontend run build
```

对方再在自己机器上：

```bash
# 1. 软链两个包进 profile（或直接 pnpm add，见 B/C）
ln -sfn <repo>/apps/cli/node_modules/@deepseek-ai/dsh-tool-vision        ~/.dsh/profiles/node_modules/@deepseek-ai/dsh-tool-vision
ln -sfn <repo>/apps/cli/node_modules/@deepseek-ai/dsh-client-ui-vision  ~/.dsh/profiles/node_modules/@deepseek-ai/dsh-client-ui-vision
# 2. 在 ~/.dsh/cordis.patch.yml 的 insert 列表加两行
#    - id: tool-vision
#      name: '@deepseek-ai/dsh-tool-vision'
#    - id: ui-vision
#      name: '@deepseek-ai/dsh-client-ui-vision'
# 3. 重启 harness
```

**改动清单（提交到仓库的部分）**：
- 新增 `packages/vision/tool-vision/`（源码 + `lib/` 构建产物）
- 新增 `packages/client/ui-vision/`（源码 + `lib/` 构建产物）
- `apps/cli/package.json`：`@deepseek-ai/dsh-tool-vision`、`@deepseek-ai/dsh-client-ui-vision` 两个依赖
- `tsconfig.host.json`、`tsconfig.client.json`：两个引用

### B. 发布 npm / 内部 registry（正式分发，推荐）

```bash
# 在各自包目录执行；pnpm publish 会自动把 workspace:^ 改成实际版本号
cd packages/vision/tool-vision && pnpm publish
cd packages/client/ui-vision && pnpm publish
```

对方（独立部署）：
```bash
dsh plugin --profile web add @deepseek-ai/dsh-tool-vision @deepseek-ai/dsh-client-ui-vision
# 然后在 ~/.dsh/cordis.patch.yml 加两行（同 A 第 2 步）→ 重启
```

### C. Tarball 分发（小范围手动）

`npm pack` 不会改写 `workspace:^`，需先手动把两个包 package.json 的 peer/deps 中所有 `workspace:^` 改成 `^0.1.0-rc.7`，再：

```bash
cd packages/vision/tool-vision && npm pack   # → deepseek-ai-dsh-tool-vision-0.1.0-rc.7.tgz
cd packages/client/ui-vision && npm pack     # → deepseek-ai-dsh-client-ui-vision-0.1.0-rc.7.tgz
```

对方：
```bash
cd ~/.dsh/profiles/web && pnpm add file:/path/to/*.tgz   # 或 dsh plugin --profile web add file:...
# patch 加两行 → 重启
```

## 对方安装后的配置（三种方式相同）

1. 重启 harness。
2. 工具目录应出现 `take_screenshot` / `list_windows` / `analyze_image`（**所有 preset 可用**，host 层全局挂载）。
3. 设置 → 插件 → 插件配置 →「图像识别」卡片：填端点（如 `https://api.example.com/v1`）、选模型（`gpt-5.5` / `gpt-5.6-sol` / `gpt-5.6-terra`）、填自己的 API Key（存为 `VISION_GPT_API_KEY`），保存。
4. 验证：让 agent 执行 `take_screenshot` → `analyze_image`。

## 注意事项

- `workspace:` 依赖范围只在**仓库内**有效；对外发布必须由 `pnpm publish` 改写或手动改成具体版本号（见 B/C）。
- 客户端包必须随包携带构建好的 `lib/client.js`（`files` 字段已含），否则 dsh 的 client-modules 动态服务会报「client bundle not found」。
- `settings.yaml` 的 `vision` 段（baseUrl/model/channel 默认值）可分享；`.credentials.yaml` 是每台机器的私有文件，绝不分享。
- 识图通道扩展：`packages/vision/tool-vision/src/channels/<id>/` 加一个 `analyze()` + 注册进 `channels/index.ts`，工具契约不变。
