# dsh-client-vision

English | [中文](README.zh.md)

Give your DeepSeek Harness agent **eyes**. `dsh-client-vision` is a screen-capture + external image-recognition plugin for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): the agent takes a screenshot (or points at any image), hands it to a vision-capable model through a pluggable channel, and gets back plain text it can actually act on — **no multimodal model required**.

## Why you want it

- **DeepSeek can't see — now it can.** The harness model has no image input. This plugin runs the whole "look" outside the model and returns text the agent can reason about, exactly like Codex's semantic vision tool.
- **Capture anything, any way.** `fullscreen` / `window` (with live window enumeration) / `region` / `interactive` — grab the browser, a game window, or one corner of the screen.
- **Multi-channel by design.** Tools are decoupled from recognition backends. The `gpt` channel ships ready to use; adding Claude, Gemini, or a local model is **one `analyze()` implementation + one registry line** — the three tools never change.
- **Secret-safe.** The API key lives in the harness `credentials` store (`VISION_GPT_API_KEY`) — never in settings files, logs, or the conversation transcript.
- **Every preset, out of the box.** Mounted on the host plane, so `code`, `standard`, `cordis`, `minimal` — every agent sees the tools. No preset switching.
- **Ready to ship.** Prebuilt bundles included; three install paths (drop into the monorepo / `pnpm publish` / tarball).
- **Smart payloads.** Large captures are auto-downscaled and re-encoded (≤1568px JPEG q80) before they leave the machine.

## Capabilities

### Tools

| Tool | What it does |
|---|---|
| `take_screenshot` | Capture the screen: `fullscreen` (primary display), `window` (by id from `list_windows`), `region` (x, y, width, height), or `interactive` (user selection). Returns the PNG path + dimensions. |
| `list_windows` | Enumerate on-screen windows (`id`, `app`, `title`) via macOS `CGWindowList` — pick the browser or game window to capture. |
| `analyze_image` | Submit an image (a path, or the most recent screenshot) to the configured vision channel and return a plain-text description. |

### Settings (`vision` namespace)

Configured in **Settings → Plugins → Plugin configuration → Vision**:

| Field | Meaning |
|---|---|
| Endpoint (`baseUrl`) | Domain + optional path prefix; `/chat/completions` is appended. e.g. `https://token.uzstudio.com/v1` |
| Channel | The active recognition backend (currently `gpt`). |
| Model | `gpt-5.5` / `gpt-5.6-sol` / `gpt-5.6-terra` |
| API key | Stored through the harness `credentials` service as `VISION_GPT_API_KEY`; the literal never leaves your machine. |

### Multi-channel architecture

```
model → analyze_image(image, prompt)
          │  reads vision.channel
          ▼
  channels/<id>/analyze()        ← one implementation per backend
          │
  gpt:    POST {baseUrl}/chat/completions   (image_url data URL)
  claude / gemini / local: …    ← add yours here
```

Adding a channel is deliberately small:

```ts
// src/channels/<id>/index.ts
export async function myAnalyze(ctx, call): Promise<string> {
  // call.imageB64, call.mime, call.prompt, call.config, call.signal
  return await fetchYourVisionApi(...)
}
```

```ts
// src/channels/index.ts — one registry line
export const channels = {
  gpt: { label: 'GPT', analyze: gptAnalyze },
  myChannel: { label: 'My Channel', analyze: myAnalyze },
}
```

The tools (`take_screenshot` / `list_windows` / `analyze_image`) and their schemas never change.

## Installation

### Prerequisites

- A DeepSeek Harness deployment from the same lineage (`0.1.0-rc.7`).
- macOS (capture is macOS-only; the rows disable themselves on other platforms).

### Option A — Drop into the harness monorepo (team / fastest)

```sh
cp -R packages/tool-vision <harness>/packages/vision/tool-vision
cp -R packages/ui-vision   <harness>/packages/client/ui-vision
```

Then, inside the harness repo:

1. Add `@deepseek-ai/dsh-tool-vision` and `@deepseek-ai/dsh-client-ui-vision` to `apps/cli/package.json` (`workspace:^`).
2. Add `./packages/vision/tool-vision` to `tsconfig.host.json` and `./packages/client/ui-vision` to `tsconfig.client.json`.
3. `pnpm install`, then build both packages:
   ```sh
   pnpm exec tsdown --env.DSH_BUILD_FACE host
   pnpm exec tsdown --env.DSH_BUILD_FACE client
   ```
4. Mount + restart (below).

### Option B — Publish to npm / a private registry (recommended for distribution)

```sh
cd packages/tool-vision && pnpm publish
cd packages/ui-vision   && pnpm publish
```

Recipients: `dsh plugin --profile web add @deepseek-ai/dsh-tool-vision @deepseek-ai/dsh-client-ui-vision`, then mount + restart.

### Option C — Tarball (small scale)

```sh
cd packages/tool-vision && npm pack    # deepseek-ai-dsh-tool-vision-0.1.0-rc.7.tgz
cd packages/ui-vision   && npm pack    # deepseek-ai-dsh-client-ui-vision-0.1.0-rc.7.tgz
```

Recipients: `cd ~/.dsh/profiles/web && pnpm add file:/path/to/*.tgz`, then mount + restart.

### Mount (all options)

Add two rows to `~/.dsh/cordis.patch.yml` (the harness-home patch, applied to every profile), then restart:

```yaml
- insert:
    - id: tool-vision
      name: '@deepseek-ai/dsh-tool-vision'
      disabled: !!js process.platform !== 'darwin'
    - id: ui-vision
      name: '@deepseek-ai/dsh-client-ui-vision'
```

## Quick start

1. Restart the harness.
2. The tool catalog now includes `take_screenshot` / `list_windows` / `analyze_image`.
3. Open **Settings → Plugins → Plugin configuration → Vision**, set the endpoint, model, and your own API key, and save.
4. Ask the agent to "look at the screen" — it will screenshot and describe what it sees.

## Development

- This repository is a **source distribution**: the peer packages (`@deepseek-ai/dsh-tools`, …) resolve from your deployment. `lib/` ships prebuilt, so `npm pack` works immediately.
- The `tsconfig.json` files are standalone; the harness monorepo's build pipeline (including the client-bundle `tsdown.config.ts`) applies in Option A.
- **Never commit secrets.** The API key stays in each machine's `.credentials.yaml`.

## License

MIT
