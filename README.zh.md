# dsh-client-vision

[English](README.md) | 中文

给你的 DeepSeek Harness agent 装上**眼睛**。`dsh-client-vision` 是面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的截图 + 外部图像识别插件：agent 按需截图（或指定任意图片），通过**可插拔通道**交给具备视觉能力的模型，拿回纯文本描述后继续干活——**完全不需要多模态模型**。

## 为什么值得装

- **deepseek 看不到？现在能了。** harness 模型没有图像输入。本插件把「看图」整个过程放在模型之外，返回 agent 能直接推理的文本——和 Codex 的语义识图工具一个思路。
- **想截什么、怎么截都行。** `fullscreen` 全屏 / `window` 指定窗口（实时窗口枚举）/ `region` 指定区域 / `interactive` 手动框选——抓浏览器、抓游戏窗口、抓屏幕一角。
- **多通道架构，天生可扩展。** 工具入口与识别后端完全解耦。`gpt` 通道开箱即用；加 Claude / Gemini / 本地模型 = **一个 `analyze()` 实现 + 一行注册**，三个工具契约永远不用改。
- **密钥安全。** API Key 存在 harness `credentials` 服务里（`VISION_GPT_API_KEY`）——绝不进设置文件、日志或会话记录。
- **所有 preset 开箱即用。** host 层全局挂载，`code` / `standard` / `cordis` / `minimal` 任何 preset 的 agent 都能调用，无需切换。
- **开箱可分发。** 附构建产物；三种安装路径（拖入 monorepo / `pnpm publish` / tarball）。
- **智能压缩。** 大图自动降采样重编码（≤1568px JPEG q80）后再发出去，控制网关 payload。

## 能力说明

### 工具

| 工具 | 作用 |
|---|---|
| `take_screenshot` | 截图：`fullscreen`（主屏）/ `window`（配合 `list_windows` 的 id）/ `region`（x, y, w, h）/ `interactive`（用户框选）。返回 PNG 路径 + 尺寸。 |
| `list_windows` | 枚举屏幕窗口（`id` / `app` / `title`，基于 macOS `CGWindowList`）——选浏览器或游戏窗口来截。 |
| `analyze_image` | 把图片（指定路径，或最近一次截图）交给当前配置的视觉通道，返回纯文本描述。 |

### 设置（`vision` 命名空间）

配置入口：**设置 → 插件 → 插件配置 →「图像识别」**

| 字段 | 含义 |
|---|---|
| 接口地址（`baseUrl`） | 域名 + 可选路径前缀；自动拼接 `/chat/completions`。例：`https://token.uzstudio.com/v1` |
| 识别通道 | 当前生效的视觉后端（目前为 `gpt`） |
| 模型 | `gpt-5.5` / `gpt-5.6-sol` / `gpt-5.6-terra` |
| API Key | 通过 harness `credentials` 服务存储为 `VISION_GPT_API_KEY`；明文永远不离开你的机器 |

### 多通道架构

```
模型 → analyze_image(image, prompt)
        │  读取 vision.channel
        ▼
  channels/<id>/analyze()         ← 每个后端一个实现
        │
  gpt:    POST {baseUrl}/chat/completions   （image_url data URL）
  claude / gemini / 本地模型: …   ← 在这里加你的
```

加一个通道，小到不能再小：

```ts
// src/channels/<id>/index.ts
export async function myAnalyze(ctx, call): Promise<string> {
  // call.imageB64 / call.mime / call.prompt / call.config / call.signal
  return await fetchYourVisionApi(...)
}
```

```ts
// src/channels/index.ts —— 一行注册
export const channels = {
  gpt: { label: 'GPT', analyze: gptAnalyze },
  myChannel: { label: 'My Channel', analyze: myAnalyze },
}
```

`take_screenshot` / `list_windows` / `analyze_image` 三个工具及其 schema **永远不用改**。

## 安装方式（官方部署，不改仓库）

`dsh plugin add` 把包装进 profile；每个包都声明了 `dsh.bundle`，挂载自动完成——**不需要手写 patch 行、不需要改官方工程**。

### 前置条件

- 官方 DeepSeek Harness（`0.1.0-rc.7` 系），`dsh` 与 `pnpm` 在 PATH。

### 1. 取包（三选一）

**a. 从本仓库（发布前推荐）：**

```sh
dsh plugin --profile web add \
  file:/path/to/dsh-client-vision/packages/tool-vision \
  file:/path/to/dsh-client-vision/packages/ui-vision
```

**b. Tarball：**

```sh
cd packages/tool-vision && npm pack
cd packages/ui-vision   && npm pack
dsh plugin --profile web add file:/path/to/deepseek-ai-dsh-tool-vision-0.1.0-rc.7.tgz \
                            file:/path/to/deepseek-ai-dsh-client-ui-vision-0.1.0-rc.7.tgz
```

**c. npm registry（发布后）：**

```sh
dsh plugin --profile web add @deepseek-ai/dsh-tool-vision @deepseek-ai/dsh-client-ui-vision
```

> 安装时的 `[WARN] Issues with peer dependencies` 是正常的，可忽略——peer 由部署自身的 bundle 在运行时提供。

### 2. 验证安装

```sh
node -e "console.log(JSON.stringify(require(process.env.HOME + '/.dsh/profiles/web/package.json').dsh.profile.bundles))"
# 应包含 dsh-tool-vision 与 dsh-client-ui-vision
```

### 3. 重启 + 配置

重启 harness，打开 **设置 → 插件 → 插件配置 →「图像识别」**：填接口地址、模型和你自己的 API Key（`VISION_GPT_API_KEY`），保存。

### 4. 功能验证

让 agent「看一下屏幕」——它会调用 `take_screenshot` → `analyze_image` 并描述看到的内容。

### 卸载

```sh
dsh plugin --profile web remove @deepseek-ai/dsh-tool-vision @deepseek-ai/dsh-client-ui-vision
```

## 备选：在 harness 分支内构建

如果你运行的是 deepseek-harness 的**分支**（而非官方部署），也可以把包拖进 monorepo：

```sh
cp -R packages/tool-vision <harness>/packages/vision/tool-vision
cp -R packages/ui-vision   <harness>/packages/client/ui-vision
```

然后在 harness 仓库内：`apps/cli/package.json` 加两个依赖（`workspace:^`）、`tsconfig.host.json`/`tsconfig.client.json` 加引用、`pnpm install`、构建（tsdown host + client），重启。

## 快速上手

1. 重启 harness。
2. 工具目录出现 `take_screenshot` / `list_windows` / `analyze_image`。
3. 打开 **设置 → 插件 → 插件配置 →「图像识别」**，填接口地址、模型和你自己的 API Key，保存。
4. 让 agent「看一下屏幕」——它会截图并描述看到的内容。

## 开发说明

- 本仓库是**源码分发**形态：peer 依赖（`@deepseek-ai/dsh-tools` 等）来自你的部署；`lib/` 已附构建产物，`npm pack` 立即可用。
- `tsconfig.json` 已适配独立目录；harness monorepo 内的构建管线（含 client bundle 的 `tsdown.config.ts`）在方式 A 下生效。
- **绝不提交密钥**：API Key 只存在每台机器的 `.credentials.yaml` 里。

## License

MIT
