import z from "@deepseek-ai/schemastery";
import { createReadStream } from "node:fs";
import { TOOL_ABORTED, defineTool } from "@deepseek-ai/dsh-tools";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import { isAbsolute, resolve } from "node:path";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { HarnessError } from "@deepseek-ai/dsh-llm";
//#region lib/types/capture.js
/**
* Screen capture and window enumeration through the `ctx.shell` seam
* (macOS `screencapture` + a Swift `CGWindowList` snippet).
* @module @deepseek-ai/dsh-tool-vision/capture
*/
/**
* Build the `screencapture` command for one capture request.
* @param args - the tool arguments.
* @param outPath - the PNG path the capture writes.
* @returns the command line to run.
*/
function buildScreenshotCommand(args, outPath) {
	const out = `'${outPath}'`;
	switch (args.mode) {
		case "fullscreen": return `screencapture -x ${out}`;
		case "region":
			if (args.x === void 0 || args.y === void 0 || args.width === void 0 || args.height === void 0) throw new Error("take_screenshot mode=region requires x, y, width, and height");
			return `screencapture -x -R ${args.x},${args.y},${args.width},${args.height} ${out}`;
		case "window":
			if (args.window_id === void 0) throw new Error("take_screenshot mode=window requires window_id from list_windows");
			return `screencapture -x -l${args.window_id} ${out}`;
		case "interactive": return `screencapture -i -x ${out}`;
		default: throw new Error(`take_screenshot: unsupported mode ${JSON.stringify(args.mode)}`);
	}
}
/** Swift program enumerating normal-layer windows, read from stdin by `swift -`. */
const WINDOW_LIST_SWIFT = `import CoreGraphics
import Foundation
let opts: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
if let list = CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]] {
  for w in list {
    let layer = w[kCGWindowLayer as String] as? Int ?? -1
    guard layer == 0 else { continue }
    let num = w[kCGWindowNumber as String] as? Int ?? -1
    let owner = w[kCGWindowOwnerName as String] as? String ?? ""
    let name = w[kCGWindowName as String] as? String ?? ""
    print("\\(num)\\t\\(owner)\\t\\(name)")
  }
}`;
/**
* Enumerate normal-layer on-screen windows through `swift -` (stdin).
* @param ctx - plugin context supplying the shell seam.
* @param signal - caller cancellation signal.
* @returns the window entries, ordered as CoreGraphics reported them.
*/
async function listWindowsViaShell(ctx, signal) {
	const result = await ctx.shell.run(ctx.shell.resolve({
		command: "swift -",
		stdin: WINDOW_LIST_SWIFT,
		timeoutMs: 3e4,
		signal
	}));
	if (result.exitCode !== 0) {
		const stderr = result.stderr.text.trim();
		const hint = /permission|not authorized|screen recording/i.test(stderr) ? "; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)" : "";
		throw new Error(`window enumeration failed (exit ${result.exitCode}): ${stderr || result.stdout.text.trim()}${hint}`);
	}
	return parseWindowLines(result.stdout.text);
}
/** Parse `id<TAB>app<TAB>title` lines from the Swift program's stdout. */
function parseWindowLines(text) {
	const entries = [];
	for (const line of text.split("\n")) {
		const trimmed = line.trim();
		if (trimmed === "") continue;
		const tab = trimmed.indexOf("	");
		if (tab < 0) continue;
		const id = Number(trimmed.slice(0, tab));
		if (!Number.isInteger(id) || id < 0) continue;
		const rest = trimmed.slice(tab + 1);
		const secondTab = rest.indexOf("	");
		const app = secondTab < 0 ? rest : rest.slice(0, secondTab);
		const title = secondTab < 0 ? "" : rest.slice(secondTab + 1);
		entries.push({
			id,
			app,
			title
		});
	}
	return entries;
}
//#endregion
//#region lib/types/image.js
/**
* Image preparation: downscale the long edge and re-encode as JPEG through
* macOS `sips`, then return base64 bytes for the recognition channel.
* @module @deepseek-ai/dsh-tool-vision/image
*/
/** Long-edge cap applied before submission (control gateway payload size). */
const MAX_EDGE = 1568;
/** JPEG quality for the prepared image. */
const JPEG_QUALITY = 80;
/** Upper bound on prepared image bytes read back from disk. */
const MAX_BYTES = 12 * 1024 * 1024;
/**
* Downscale/re-encode one image file and return it base64-encoded.
* @param ctx - plugin context supplying the fs and shell seams.
* @param imagePath - the image file path (sandbox-resolved against `cwd`).
* @param cwd - the agent's session cwd, for relative paths.
* @param signal - caller cancellation signal.
* @returns the prepared image.
*/
async function prepareImage(ctx, imagePath, cwd, signal) {
	const resolvedPath = isAbsolute(imagePath) ? imagePath : resolve(cwd ?? "", imagePath);
	const outPath = `/tmp/dsh-vision-img-${Date.now()}.jpg`;
	const command = `sips -Z ${MAX_EDGE} -s format jpeg -s formatOptions ${JPEG_QUALITY} '${resolvedPath}' --out '${outPath}'`;
	const result = await ctx.shell.run(ctx.shell.resolve({
		command,
		...cwd !== void 0 ? { workdir: cwd } : {},
		timeoutMs: 3e4,
		signal
	}));
	if (result.exitCode !== 0) throw new Error(`image preparation failed for ${imagePath} (exit ${result.exitCode}): ${result.stderr.text.trim() || result.stdout.text.trim()}`);
	const target = await ctx.fs.resolve(outPath, signal === void 0 ? {} : { signal });
	const bytes = await ctx.fs.readBytes(target, signal, MAX_BYTES);
	const size = await imageSizeOf(ctx, outPath, signal);
	return {
		base64: Buffer.from(bytes).toString("base64"),
		mime: "image/jpeg",
		width: size.width,
		height: size.height
	};
}
/** Read a PNG/JPEG's pixel dimensions through `sips`. */
async function imageSizeOf(ctx, path, signal) {
	const text = (await ctx.shell.run(ctx.shell.resolve({
		command: `sips -g pixelWidth -g pixelHeight '${path}'`,
		timeoutMs: 15e3,
		signal
	}))).stdout.text;
	return {
		width: dimensionOf(text, "pixelWidth"),
		height: dimensionOf(text, "pixelHeight")
	};
}
/** Parse one `key: N` dimension line from `sips -g`. */
function dimensionOf(text, key) {
	const match = text.match(new RegExp(`${key}:\\s*(\\d+)`));
	return match === null ? 0 : Number(match[1]);
}
//#endregion
//#region lib/types/abort.js
/**
* Shared cancellation helpers for the vision tools.
* @module @deepseek-ai/dsh-tool-vision/abort
*/
/** Build the registry-stable abort error (thrown when `exec.signal` fires). */
function abortedError() {
	const error = new HarnessError("tool call aborted", TOOL_ABORTED);
	error.name = "AbortError";
	return error;
}
/** True for a fetch/`AbortSignal` abort, surfaced as a tool abort. */
function isAbortError(error) {
	return error instanceof DOMException && error.name === "AbortError";
}
//#endregion
//#region lib/types/channels/gpt/index.js
/**
* The `gpt` recognition channel: an OpenAI-compatible vision request with a
* `data:` image URL, mirroring the repo's own LLM adapters (native `fetch`,
* Bearer auth, structured error handling). The key is resolved from the
* credentials service at call time.
* @module @deepseek-ai/dsh-tool-vision/channels/gpt
*/
/** Models the OpenAI-compatible gateway exposes for vision. */
const VISION_MODELS = [
	"gpt-5.5",
	"gpt-5.6-sol",
	"gpt-5.6-terra"
];
/** Attribution header sent on every request. */
const USER_AGENT = "deepseek-harness/0.0.1";
/** Upper bound on generated tokens for the vision request. */
const DEFAULT_MAX_TOKENS = 1024;
/**
* Run one vision call against the OpenAI-compatible endpoint named by the
* active section.
* @param ctx - plugin context supplying the credentials seam.
* @param call - the prepared image and the active section.
* @returns the model's plain-text answer.
*/
async function gptAnalyze(ctx, call) {
	const { config, imageB64, mime, prompt, signal } = call;
	const apiKey = await resolveApiKey(ctx, config.apiKeyEnv, signal);
	const endpoint = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;
	const body = {
		model: config.model,
		messages: [{
			role: "user",
			content: [{
				type: "text",
				text: prompt
			}, {
				type: "image_url",
				image_url: { url: `data:${mime};base64,${imageB64}` }
			}]
		}],
		max_tokens: DEFAULT_MAX_TOKENS,
		temperature: 0
	};
	let response;
	try {
		response = await fetch(endpoint, {
			method: "POST",
			redirect: "error",
			headers: {
				authorization: `Bearer ${apiKey}`,
				"content-type": "application/json",
				accept: "application/json",
				"user-agent": USER_AGENT
			},
			body: JSON.stringify(body),
			...signal !== void 0 ? { signal } : {}
		});
	} catch (error) {
		if (signal?.aborted === true || isAbortError(error)) throw abortedError();
		throw new Error(`vision request failed: ${String(error)}`);
	}
	if (!response.ok) {
		let message = `vision API error (HTTP ${response.status})`;
		try {
			const parsed = await response.json();
			const detail = typeof parsed.error === "string" ? parsed.error : parsed.error?.message ?? parsed.message;
			if (detail !== void 0 && detail.length > 0) message = detail;
		} catch {}
		throw new Error(message);
	}
	let payload;
	try {
		payload = await response.json();
	} catch (error) {
		if (signal?.aborted === true || isAbortError(error)) throw abortedError();
		throw new Error(`vision API returned an unprocessable response: ${String(error)}`);
	}
	const text = payload.choices?.[0]?.message?.content;
	if (typeof text !== "string" || text.length === 0) throw new Error("vision API returned no text content");
	return text;
}
/**
* Resolve the API key for one call through the credentials service.
* @param ctx - plugin context.
* @param apiKeyEnv - the credential reference the section names.
* @param signal - caller cancellation signal.
* @returns the key.
*/
async function resolveApiKey(ctx, apiKeyEnv, signal) {
	if (signal?.aborted === true) throw abortedError();
	const credentials = ctx.get("credentials");
	if (credentials === void 0) throw new Error(`vision has no credentials service; store the key for "${apiKeyEnv}" through the credentials service`);
	const resolved = await credentials.resolve(credentialRef(apiKeyEnv));
	if (resolved !== void 0 && resolved.value.length > 0) return resolved.value;
	throw new Error(`vision has no API key for "${apiKeyEnv}"; set it in Settings → Plugins → Vision`);
}
//#endregion
//#region lib/types/channels/index.js
/**
* The channel registry: maps the `vision.channel` setting to one backend.
* Adding a channel is one folder under `channels/<id>/` plus one registry
* entry — the tool schemas never change.
* @module @deepseek-ai/dsh-tool-vision/channels
*/
/** Registered recognition channels, keyed by the `vision.channel` setting. */
const channels = { gpt: {
	label: "GPT",
	analyze: gptAnalyze
} };
//#endregion
//#region lib/types/index.js
/**
* Model-facing screen capture and external image-recognition tools.
*
* The tool entry points are decoupled from the recognition backend: a channel
* registry maps the `vision.channel` setting to one `analyze()` implementation.
* Adding a backend (Claude, Gemini, a local model) is one registry entry plus a
* settings segment, with no tool-schema change.
* @module @deepseek-ai/dsh-tool-vision
*/
/** Cordis plugin name used by loader diagnostics. */
const name = "tool-vision";
/** Services this plugin consumes (all host-plane; it publishes nothing). */
const inject = [
	"tools",
	"shell",
	"fs",
	"systemPrompt"
];
/** Settings namespace carrying the vision configuration. */
const VISION_SETTINGS_NAMESPACE = settingsNamespace("vision");
/** Runtime configuration schema for the vision plugin. */
const Config = z.object({
	channel: z.string().default("gpt"),
	enabled: z.boolean().default(true),
	baseUrl: z.string(),
	model: z.string().default("gpt-5.6-terra"),
	apiKeyEnv: z.string().role("credential-ref").default("VISION_GPT_API_KEY")
});
/** Default instruction when the model passes none. */
const DEFAULT_PROMPT = "Describe the image in detail, in the language of the conversation.";
/**
* Mount the vision tools and settings section.
* @param ctx - plugin context.
* @param config - the composed row config (schema-defaulted by Cordis).
*/
function apply(ctx, config) {
	let current = () => config;
	installSettingsSection(ctx, VISION_SETTINGS_NAMESPACE, Config, config, {
		setSource: (source) => {
			current = source;
		},
		onChange: () => {}
	});
	let lastScreenshotPath;
	const webServer = ctx.get("webServer");
	if (webServer !== void 0) webServer.register({
		kind: "prefix",
		path: "/dsh-vision",
		handler: (req, res) => {
			const base = new URL(req.url ?? "/", "http://x").pathname.split("/").pop() ?? "";
			if (!/^[A-Za-z0-9._-]+$/.test(base)) {
				res.writeHead(404);
				res.end();
				return;
			}
			const stream = createReadStream(`/tmp/${base}`);
			stream.on("error", () => {
				res.writeHead(404);
				res.end();
			});
			res.writeHead(200, { "content-type": "image/png" });
			stream.pipe(res);
		}
	});
	ctx.systemPrompt.section({
		name: "tool:vision",
		order: 120,
		text: "To inspect what is on screen, call take_screenshot (fullscreen/window/region/interactive), then analyze_image on the returned path. analyze_image returns only text: the configured external vision channel describes the image; the model itself cannot see it."
	});
	ctx.tools.register(defineTool({
		name: "take_screenshot",
		description: "Capture the screen and return a PNG path the recognition tool can read. mode=fullscreen captures the primary display; mode=window requires window_id from list_windows; mode=region captures a rectangle (x, y, width, height); mode=interactive asks the user to select a region. macOS only; the first use may require Screen Recording permission.",
		parameters: {
			mode: {
				type: "string",
				required: true,
				enum: [
					"fullscreen",
					"window",
					"region",
					"interactive"
				],
				description: "What to capture: fullscreen, an existing window, a rectangle region, or an interactive user selection."
			},
			window_id: {
				type: "number",
				description: "Required for mode=window; a window id from list_windows."
			},
			x: {
				type: "number",
				description: "Region left edge in screen points (mode=region)."
			},
			y: {
				type: "number",
				description: "Region top edge in screen points (mode=region)."
			},
			width: {
				type: "number",
				description: "Region width in screen points (mode=region)."
			},
			height: {
				type: "number",
				description: "Region height in screen points (mode=region)."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					path: {
						type: "string",
						required: true
					},
					width: {
						type: "number",
						required: true
					},
					height: {
						type: "number",
						required: true
					},
					mode: {
						type: "string",
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: `Captured ${value.mode} screenshot: ${value.path} (${value.width}x${value.height})`
			}]
		},
		async execute(args, exec) {
			const path = `/tmp/dsh-vision-${Date.now()}.png`;
			const command = buildScreenshotCommand(args, path);
			const result = await ctx.shell.run(ctx.shell.resolve({
				command,
				timeoutMs: 9e4,
				signal: exec.signal
			}));
			if (result.aborted) throw abortedError();
			if (result.exitCode !== 0) {
				const stderr = result.stderr.text.trim();
				const hint = /permission|screen recording|could not create image/i.test(stderr) ? "; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)" : "";
				throw new Error(`screencapture failed (exit ${result.exitCode}): ${stderr || result.stdout.text.trim()}${hint}`);
			}
			const size = await imageSizeOf(ctx, path, exec.signal);
			lastScreenshotPath = path;
			return {
				path,
				width: size.width,
				height: size.height,
				mode: args.mode
			};
		}
	}));
	ctx.tools.register(defineTool({
		name: "list_windows",
		description: "List on-screen windows with their id, owning app, and title. Use an id as window_id for take_screenshot mode=window. macOS only.",
		parameters: {},
		output: {
			schema: {
				type: "array",
				items: {
					type: "object",
					additionalProperties: false,
					properties: {
						id: {
							type: "number",
							required: true
						},
						app: {
							type: "string",
							required: true
						},
						title: {
							type: "string",
							required: true
						}
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.map((w) => `${w.id}\t${w.app}\t${w.title}`).join("\n") || "(no windows)"
			}]
		},
		async execute(_args, exec) {
			return listWindowsViaShell(ctx, exec.signal);
		}
	}));
	ctx.tools.register(defineTool({
		name: "analyze_image",
		description: "Submit an image to the configured external vision channel and return a plain-text description. Pass image_path, or omit it to use the most recent take_screenshot result. The result is text only — the model cannot see the image directly. Unlike read_image (which feeds the current session model), analyze_image uses the vision settings (Settings → Plugins → Vision).",
		parameters: {
			image_path: {
				type: "string",
				description: "Path to a PNG/JPEG file. Omit to use the most recent take_screenshot result."
			},
			prompt: {
				type: "string",
				description: "Instruction for the vision model; defaults to a general description."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					channel: {
						type: "string",
						required: true
					},
					model: {
						type: "string",
						required: true
					},
					description: {
						type: "string",
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.description
			}]
		},
		async execute(args, exec) {
			const cfg = current();
			if (!cfg.enabled) throw new Error("vision is disabled (settings vision.enabled is false); enable it in Settings → Plugins → Vision");
			const channel = channels[cfg.channel];
			if (channel === void 0) throw new Error(`unknown vision channel "${cfg.channel}"; registered: ${Object.keys(channels).join(", ")}`);
			const imagePath = args.image_path ?? lastScreenshotPath;
			if (imagePath === void 0) throw new Error("no image: pass image_path or call take_screenshot first");
			const prepared = await prepareImage(ctx, imagePath, exec.agent?.session.header.cwd, exec.signal);
			const prompt = args.prompt ?? DEFAULT_PROMPT;
			const description = await channel.analyze(ctx, {
				imageB64: prepared.base64,
				mime: prepared.mime,
				prompt,
				config: cfg,
				signal: exec.signal
			});
			return {
				channel: cfg.channel,
				model: cfg.model,
				description
			};
		}
	}));
	ctx.tools.register(defineTool({
		name: "view_image",
		description: "One-shot \"look at this\": capture the screen (or use image_path) and return the external vision channel's plain-text description. A convenience fusion of take_screenshot + analyze_image. The result is text only — the model cannot see the image directly.",
		parameters: {
			image_path: {
				type: "string",
				description: "Path to a PNG/JPEG file. Omit to capture the screen instead."
			},
			mode: {
				type: "string",
				enum: [
					"fullscreen",
					"window",
					"region",
					"interactive"
				],
				description: "Capture mode when image_path is omitted (default fullscreen)."
			},
			window_id: {
				type: "number",
				description: "Required for mode=window; a window id from list_windows."
			},
			x: {
				type: "number",
				description: "Region left edge in screen points (mode=region)."
			},
			y: {
				type: "number",
				description: "Region top edge in screen points (mode=region)."
			},
			width: {
				type: "number",
				description: "Region width in screen points (mode=region)."
			},
			height: {
				type: "number",
				description: "Region height in screen points (mode=region)."
			},
			prompt: {
				type: "string",
				description: "Instruction for the vision model; defaults to a general description."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					source: {
						type: "string",
						required: true
					},
					path: {
						type: "string",
						required: true
					},
					channel: {
						type: "string",
						required: true
					},
					model: {
						type: "string",
						required: true
					},
					description: {
						type: "string",
						required: true
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: value.source === "screenshot" ? `${value.description}\n[view-image: /dsh-vision/${value.path.split("/").pop()}]` : value.description
			}]
		},
		async execute(args, exec) {
			const cfg = current();
			if (!cfg.enabled) throw new Error("vision is disabled (settings vision.enabled is false); enable it in Settings → Plugins → Vision");
			const channel = channels[cfg.channel];
			if (channel === void 0) throw new Error(`unknown vision channel "${cfg.channel}"; registered: ${Object.keys(channels).join(", ")}`);
			let path;
			let source;
			if (args.image_path !== void 0) {
				source = "image";
				path = args.image_path;
			} else {
				source = "screenshot";
				path = `/tmp/dsh-vision-${Date.now()}.png`;
				const shotArgs = { mode: args.mode ?? "fullscreen" };
				if (args.window_id !== void 0) shotArgs.window_id = args.window_id;
				if (args.x !== void 0) shotArgs.x = args.x;
				if (args.y !== void 0) shotArgs.y = args.y;
				if (args.width !== void 0) shotArgs.width = args.width;
				if (args.height !== void 0) shotArgs.height = args.height;
				const shot = await ctx.shell.run(ctx.shell.resolve({
					command: buildScreenshotCommand(shotArgs, path),
					timeoutMs: 9e4,
					signal: exec.signal
				}));
				if (shot.aborted) throw abortedError();
				if (shot.exitCode !== 0) {
					const stderr = shot.stderr.text.trim();
					const hint = /permission|screen recording|could not create image/i.test(stderr) ? "; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)" : "";
					throw new Error(`screencapture failed (exit ${shot.exitCode}): ${stderr || shot.stdout.text.trim()}${hint}`);
				}
				lastScreenshotPath = path;
			}
			const prepared = await prepareImage(ctx, path, exec.agent?.session.header.cwd, exec.signal);
			const description = await channel.analyze(ctx, {
				imageB64: prepared.base64,
				mime: prepared.mime,
				prompt: args.prompt ?? DEFAULT_PROMPT,
				config: cfg,
				signal: exec.signal
			});
			return {
				source,
				path,
				channel: cfg.channel,
				model: cfg.model,
				description
			};
		}
	}));
}
//#endregion
export { Config, VISION_MODELS, VISION_SETTINGS_NAMESPACE, apply, inject, name };
