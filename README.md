# dsh-client-vision

DeepSeek Harness 图像识别插件源码。给 harness 的 agent 补「看图」能力：截图（多粒度）→ 外部视觉通道（GPT）→ 文字描述。deepseek 模型本身无法理解图像语义，由本插件在模型之外完成识图闭环。

## 目录结构

```
packages/
  tool-vision/    # @deepseek-ai/dsh-tool-vision       —— host 工具包
                  #   take_screenshot / list_windows / analyze_image
                  #   + `vision` 设置命名空间 + gpt 识图通道（src/channels/gpt/）
  ui-vision/      # @deepseek-ai/dsh-client-ui-vision   —— 浏览器设置卡片
                  #   Settings → 插件 → 插件配置 →「图像识别」
```

- 工具入口与识图通道解耦：加新通道 = `src/channels/<id>/` 一个 `analyze()` + 注册进 `channels/index.ts`，工具契约不变。
- 密钥走 harness `credentials` 服务（`VISION_GPT_API_KEY`），值永不下发浏览器、不进设置文件。

## 前置条件

- 同源的 DeepSeek Harness 部署（本代码基于 `0.1.0-rc.7` 系）。
- macOS（截图/窗口枚举为 macOS-only；非 macOS 行自动禁用）。

## 安装到 Harness 部署（三选一）

### A. 拖入 harness monorepo（团队内最快）

把两个包目录分别复制到对应位置，提交：

```bash
cp -R packages/tool-vision <harness>/packages/vision/tool-vision
cp -R packages/ui-vision   <harness>/packages/client/ui-vision
```

再在 harness 仓库内：
1. `apps/cli/package.json` 加两个依赖：`@deepseek-ai/dsh-tool-vision`、`@deepseek-ai/dsh-client-ui-vision`（`workspace:^`）。
2. `tsconfig.host.json` 加 `./packages/vision/tool-vision` 引用；`tsconfig.client.json` 加 `./packages/client/ui-vision` 引用。
3. `pnpm install`，然后 `pnpm exec tsdown --env.DSH_BUILD_FACE host` 和 `... client` 构建两个包。
4. 在 `~/.dsh/cordis.patch.yml`（harness-home patch，对所有 profile 生效）加：

```yaml
- insert:
    - id: tool-vision
      name: '@deepseek-ai/dsh-tool-vision'
      disabled: !!js process.platform !== 'darwin'
    - id: ui-vision
      name: '@deepseek-ai/dsh-client-ui-vision'
```

5. 重启 harness。

### B. 发布 npm / 内部 registry

```bash
cd packages/tool-vision && pnpm publish   # 自动把 ^0.1.0-rc.7 的 peer 依赖按需对齐
cd packages/ui-vision   && pnpm publish
```

对方独立部署：`dsh plugin --profile web add @deepseek-ai/dsh-tool-vision @deepseek-ai/dsh-client-ui-vision`，再加 patch 两行（同 A 第 4 步），重启。

### C. Tarball

```bash
cd packages/tool-vision && npm pack
cd packages/ui-vision   && npm pack
# 对方：cd ~/.dsh/profiles/web && pnpm add file:/path/to/*.tgz（或 dsh plugin add file:...）
# patch 两行 → 重启
```

## 使用与配置

1. 重启后工具目录出现 `take_screenshot` / `list_windows` / `analyze_image`（**所有 preset 可用**，host 层全局挂载）。
2. 设置 → 插件 → 插件配置 →「图像识别」卡片：填端点（如 `https://token.uzstudio.com/v1`）、选模型（`gpt-5.5` / `gpt-5.6-sol` / `gpt-5.6-terra`）、填自己的 API Key（存为 `VISION_GPT_API_KEY`），保存。
3. 让 agent 执行 `take_screenshot` → `analyze_image`。

## 开发说明

- 本仓库是**源码分发**形态：peer 依赖（`@deepseek-ai/dsh-tools` 等）来自部署，独立安装无法凭空解析；`lib/` 内已附构建产物，可直接 `npm pack` 分发。
- 包内 `tsconfig.json` 已适配独立目录；harness monorepo 内的构建管线（含 client bundle 的 `tsdown.config.ts`）请按方式 A 在 monorepo 内生成。
- **密钥绝不提交**：`.credentials.yaml` 是每台机器的私有文件；本仓库不包含任何凭据。

## License

MIT
