import z from "@deepseek-ai/schemastery";
import { createReadStream } from "node:fs";
import { basename, isAbsolute, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { TOOL_ABORTED, defineTool } from "@deepseek-ai/dsh-tools";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { HarnessError } from "@deepseek-ai/dsh-llm";
//#region src/capture.ts
/**
* The platform this process runs on. Anything that is neither macOS nor
* Windows is treated as Linux (the X11 tooling path).
* @returns the capture backend platform.
*/
function currentPlatform() {
	if (process.platform === "darwin") return "darwin";
	if (process.platform === "win32") return "win32";
	return "linux";
}
/**
* Last path segment regardless of host separators. Windows command builders
* embed the target file name into `$env:TEMP` joins; `node:path` basename
* splits only on the host separator, so a Windows-style path on a POSIX host
* would keep the whole path.
*/
function captureFileName(path) {
	return path.split(/[\\/]/).at(-1) ?? path;
}
/** Missing-dependency hint appended to a failed capture/enumeration error. */
function captureDependencyHint(platform) {
	switch (platform) {
		case "darwin": return "; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)";
		case "win32": return "; requires Windows PowerShell with System.Drawing (built into Windows)";
		default: return "; requires ImageMagick (`import`), `wmctrl` and `xprop` (X11); install with your package manager, e.g. apt install imagemagick wmctrl x11-utils";
	}
}
/** Missing-dependency hint for one device capture mode. */
function deviceCaptureHint(mode) {
	return mode === "android" ? "; requires adb with a connected device or emulator (`adb devices`)" : "; requires macOS with Xcode and a booted simulator (`xcrun simctl`)";
}
/**
* Build the capture command for one request on the given platform.
* @param args - the tool arguments.
* @param outPath - the PNG path the capture writes (absolute).
* @param platform - the capture backend platform (defaults to this process's).
* @returns the command line to run through the shell seam.
*/
function buildScreenshotCommand(args, outPath, platform = currentPlatform()) {
	const out = `'${outPath}'`;
	switch (args.mode) {
		case "fullscreen": return fullscreenCommand(platform, out, outPath);
		case "region":
			if (args.x === void 0 || args.y === void 0 || args.width === void 0 || args.height === void 0) throw new Error("take_screenshot mode=region requires x, y, width, and height");
			return regionCommand(platform, out, outPath, args.x, args.y, args.width, args.height);
		case "window":
			if (args.window_id === void 0) throw new Error("take_screenshot mode=window requires window_id from list_windows");
			return windowCommand(platform, out, outPath, args.window_id);
		case "interactive":
			if (platform !== "darwin") throw new Error(`take_screenshot mode=interactive is macOS-only; on ${platform} use mode=region with x/y/width/height`);
			return `screencapture -i -x ${out}`;
		case "android": return androidCommand(platform, outPath, args.device);
		case "ios": return iosCommand(platform, outPath);
		default: throw new Error(`take_screenshot: unsupported mode ${JSON.stringify(args.mode)}`);
	}
}
/** Device screenshot path on the device, pulled to the host afterwards. */
const ANDROID_DEVICE_PATH = "/sdcard/dsh-vision-screen.png";
/**
* Android capture: screencap on the connected device/emulator, then pull the
* PNG to the host. Works from any host; requires adb with a device online.
* The host write target follows the platform convention (confined temp and an
* echoed path on Windows).
* @param device - adb serial (`adb devices`); required when several are online.
*/
function androidCommand(platform, outPath, device) {
	const target = device === void 0 ? "" : `-s ${quoteDeviceSerial(device)} `;
	if (platform === "win32") return `adb ${target}shell screencap -p ${ANDROID_DEVICE_PATH}; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; $p=Join-Path $env:TEMP '${captureFileName(outPath)}'; adb ${target}pull ${ANDROID_DEVICE_PATH} $p; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; Write-Output $p`;
	return `adb ${target}shell screencap -p ${ANDROID_DEVICE_PATH} && adb ${target}pull ${ANDROID_DEVICE_PATH} '${outPath}'`;
}
/** Quote an adb serial for the shell (serials carry no spaces, but stay safe). */
function quoteDeviceSerial(device) {
	return `'${device}'`;
}
/** iOS capture: booted simulator screenshot (macOS host only). */
function iosCommand(platform, outPath) {
	if (platform !== "darwin") throw new Error(`take_screenshot mode=ios requires macOS with Xcode (xcrun simctl); current platform is ${platform}`);
	return `xcrun simctl io booted screenshot '${outPath}'`;
}
/** Fullscreen capture for the platform. */
function fullscreenCommand(platform, out, outPath) {
	switch (platform) {
		case "darwin": return `screencapture -x ${out}`;
		case "win32": return `Add-Type -AssemblyName System.Windows.Forms,System.Drawing; \$s=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds; \$b=New-Object System.Drawing.Bitmap \$s.Width,\$s.Height; \$g=[System.Drawing.Graphics]::FromImage(\$b); \$g.CopyFromScreen(\$s.X,\$s.Y,0,0,\$b.Size); $p=Join-Path $env:TEMP '${captureFileName(outPath)}'; $b.Save($p,[System.Drawing.Imaging.ImageFormat]::Png); Write-Output $p`;
		default: return `import -window root ${out}`;
	}
}
/** Region capture for the platform. */
function regionCommand(platform, out, outPath, x, y, width, height) {
	switch (platform) {
		case "darwin": return `screencapture -x -R ${x},${y},${width},${height} ${out}`;
		case "win32": return `Add-Type -AssemblyName System.Windows.Forms,System.Drawing; $b=New-Object System.Drawing.Bitmap ${width},${height}; $g=[System.Drawing.Graphics]::FromImage($b); $g.CopyFromScreen(${x},${y},0,0,(New-Object System.Drawing.Size(${width},${height}))); $p=Join-Path $env:TEMP '${captureFileName(outPath)}'; $b.Save($p,[System.Drawing.Imaging.ImageFormat]::Png); Write-Output $p`;
		default: return `import -window root -crop ${width}x${height}+${x}+${y} ${out}`;
	}
}
/** Window capture for the platform. */
function windowCommand(platform, out, outPath, windowId) {
	switch (platform) {
		case "darwin": return `screencapture -x -l${windowId} ${out}`;
		case "win32": return `Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public struct WR{public int L;public int T;public int R;public int B;}public class WU{[DllImport("user32.dll")]public static extern bool GetWindowRect(IntPtr h,out WR r);}'; Add-Type -AssemblyName System.Drawing; $h=[IntPtr]::new(${windowId}); $r=New-Object WR; [WU]::GetWindowRect($h,[ref]$r)|Out-Null; $w=$r.R-$r.L; $ht=$r.B-$r.T; $b=New-Object System.Drawing.Bitmap $w,$ht; $g=[System.Drawing.Graphics]::FromImage($b); $g.CopyFromScreen($r.L,$r.T,0,0,$b.Size); $p=Join-Path $env:TEMP '${captureFileName(outPath)}'; $b.Save($p,[System.Drawing.Imaging.ImageFormat]::Png); Write-Output $p`;
		default: return `import -window 0x${windowId.toString(16)} ${out}`;
	}
}
/**
* Resolve the file path a capture/preparation command wrote. Windows commands
* save into the confined shell's private temp (the only writable temp) and
* echo the absolute path; other platforms write to the caller's precomputed
* temp path, which their sandbox grants.
* @param stdout - the shell command's stdout.
* @param platform - the capture backend platform.
* @param precomputed - the caller's precomputed output path (darwin/linux).
* @returns the written file path.
*/
function shellOutputPath(stdout, platform, precomputed) {
	if (platform !== "win32") return precomputed;
	const last = stdout.split("\n").map((line) => line.trim()).filter((line) => line !== "").at(-1);
	if (last === void 0) throw new Error("capture command produced no output path");
	return last;
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
/** Windows: processes with a main window handle. PowerShell format strings
* do not interpret `\t`, so the tab separator comes from `[char]9`. */
const WINDOW_LIST_POWERSHELL = "Get-Process | Where-Object { $_.MainWindowHandle -ne 0 } | ForEach-Object { $t=[char]9; \"$($_.MainWindowHandle)$t$($_.ProcessName)$t$($_.MainWindowTitle)\" }";
/** Linux: X11 windows via wmctrl + xprop (id decimal, class as app, title). */
const WINDOW_LIST_X11 = "wmctrl -l | while read -r id host title; do cls=$(xprop -id \"$id\" WM_CLASS 2>/dev/null | sed -n 's/.*\"\\([^\"]*\\)\".*/\\1/p'); [ -z \"$cls\" ] && cls=\"$host\"; printf '%d\\t%s\\t%s\\n' $((16#$id)) \"$cls\" \"$title\"; done";
/**
* Enumerate on-screen windows through the platform backend.
* @param ctx - plugin context supplying the shell seam.
* @param signal - caller cancellation signal.
* @param platform - the capture backend platform (defaults to this process's).
* @returns the window entries, ordered as the backend reported them.
*/
async function listWindowsViaShell(ctx, signal, platform = currentPlatform(), sandboxPolicy) {
	const spec = platform === "darwin" ? {
		command: "swift -",
		stdin: WINDOW_LIST_SWIFT
	} : { command: platform === "win32" ? WINDOW_LIST_POWERSHELL : WINDOW_LIST_X11 };
	const result = await ctx.shell.run(ctx.shell.resolve({
		...spec,
		timeoutMs: 3e4,
		signal,
		...sandboxPolicy !== void 0 ? { sandboxPolicy } : {}
	}));
	if (result.exitCode !== 0) {
		const stderr = result.stderr.text.trim();
		const missing = /command not found|not recognized|not found/i.test(stderr);
		throw new Error(`window enumeration failed (exit ${result.exitCode}): ${stderr || result.stdout.text.trim()}` + (missing ? captureDependencyHint(platform) : platform === "darwin" ? captureDependencyHint("darwin") : ""));
	}
	return parseWindowLines(result.stdout.text);
}
/** Parse `id<TAB>app<TAB>title` lines from a backend's stdout. */
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
//#region src/image.ts
/** Long-edge cap applied before submission (control gateway payload size). */
const MAX_EDGE = 1568;
/** JPEG quality for the prepared image. */
const JPEG_QUALITY = 80;
/** Upper bound on prepared image bytes read back from disk. */
const MAX_BYTES = 12 * 1024 * 1024;
/** Quote one path for the shell that serves the current platform. */
function quotePath(path, platform) {
	return platform === "win32" ? `'${path.replace(/'/g, "''")}'` : `'${path.replace(/'/g, "'\\''")}'`;
}
/** Build the platform-native resize and JPEG encoding command. */
function buildImagePreparationCommand(imagePath, outPath, platform = currentPlatform()) {
	const input = quotePath(imagePath, platform);
	const output = quotePath(outPath, platform);
	switch (platform) {
		case "darwin": return `sips -Z ${MAX_EDGE} -s format jpeg -s formatOptions ${JPEG_QUALITY} ${input} --out ${output}`;
		case "win32": return `Add-Type -AssemblyName System.Drawing; $ErrorActionPreference='Stop'; $p=Join-Path $env:TEMP '${captureFileName(outPath)}'; $src=$null; $bitmap=$null; $graphics=$null; $params=$null; try { $src=[System.Drawing.Image]::FromFile(${input}); $edge=[Math]::Max($src.Width,$src.Height); $scale=[Math]::Min([double]1,[double]${MAX_EDGE}/$edge); $width=[Math]::Max(1,[int][Math]::Round($src.Width*$scale)); $height=[Math]::Max(1,[int][Math]::Round($src.Height*$scale)); $bitmap=New-Object System.Drawing.Bitmap $width,$height; $graphics=[System.Drawing.Graphics]::FromImage($bitmap); $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic; $graphics.DrawImage($src,0,0,$width,$height); $encoder=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }; if ($null -eq $encoder) { throw 'JPEG encoder is unavailable' }; $params=New-Object System.Drawing.Imaging.EncoderParameters 1; $params.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]${JPEG_QUALITY}); $bitmap.Save($p,$encoder,$params) } finally { if ($null -ne $params) { $params.Dispose() }; if ($null -ne $graphics) { $graphics.Dispose() }; if ($null -ne $bitmap) { $bitmap.Dispose() }; if ($null -ne $src) { $src.Dispose() } }; Write-Output $p`;
		default: return `convert ${input} -resize '${MAX_EDGE}x${MAX_EDGE}>' -quality ${JPEG_QUALITY} ${output}`;
	}
}
/** Build the platform-native image-dimension command. */
function buildImageSizeCommand(imagePath, platform = currentPlatform()) {
	const input = quotePath(imagePath, platform);
	switch (platform) {
		case "darwin": return `sips -g pixelWidth -g pixelHeight ${input}`;
		case "win32": return `Add-Type -AssemblyName System.Drawing; $image=[System.Drawing.Image]::FromFile(${input}); try { Write-Output ('pixelWidth: ' + $image.Width); Write-Output ('pixelHeight: ' + $image.Height) } finally { $image.Dispose() }`;
		default: return `identify -format 'pixelWidth: %w\\npixelHeight: %h\\n' ${input}`;
	}
}
/** Dependency hint for one platform image backend. */
function imageDependencyHint(platform) {
	switch (platform) {
		case "darwin": return "; requires the macOS sips utility";
		case "win32": return "; requires Windows PowerShell with System.Drawing (built into Windows)";
		default: return "; requires ImageMagick (`convert` and `identify`)";
	}
}
/** Throw a command failure with the platform dependency context when applicable. */
function imageCommandFailure(action, imagePath, platform, result) {
	const detail = result.stderr.text.trim() || result.stdout.text.trim();
	const missing = /command not found|not recognized|not found/i.test(detail);
	throw new Error(`${action} failed for ${imagePath} (exit ${result.exitCode}): ${detail}` + (missing ? imageDependencyHint(platform) : ""));
}
/**
* Downscale/re-encode one image file and return it base64-encoded.
* @param ctx - plugin context supplying the fs and shell seams.
* @param imagePath - the image file path (sandbox-resolved against `cwd`).
* @param cwd - the agent's session cwd, for relative paths.
* @param signal - caller cancellation signal.
* @returns the prepared image.
*/
async function prepareImage(ctx, imagePath, cwd, signal, sandboxPolicy) {
	const resolvedPath = isAbsolute(imagePath) ? imagePath : resolve(cwd ?? "", imagePath);
	const precomputedPath = join(tmpdir(), `dsh-vision-img-${Date.now()}.jpg`);
	const platform = currentPlatform();
	const result = await ctx.shell.run(ctx.shell.resolve({
		command: buildImagePreparationCommand(resolvedPath, precomputedPath, platform),
		...cwd !== void 0 ? { workdir: cwd } : {},
		timeoutMs: 3e4,
		signal,
		...sandboxPolicy !== void 0 ? { sandboxPolicy } : {}
	}));
	if (result.exitCode !== 0) imageCommandFailure("image preparation", imagePath, platform, result);
	const outPath = shellOutputPath(result.stdout.text, platform, precomputedPath);
	const target = await ctx.fs.resolve(outPath, signal === void 0 ? {} : { signal });
	const bytes = await ctx.fs.readBytes(target, signal, MAX_BYTES);
	const size = await imageSizeOf(ctx, outPath, signal, sandboxPolicy);
	return {
		base64: Buffer.from(bytes).toString("base64"),
		mime: "image/jpeg",
		width: size.width,
		height: size.height
	};
}
/** Read a PNG/JPEG's pixel dimensions through the platform image backend. */
async function imageSizeOf(ctx, path, signal, sandboxPolicy) {
	const platform = currentPlatform();
	const result = await ctx.shell.run(ctx.shell.resolve({
		command: buildImageSizeCommand(path, platform),
		timeoutMs: 15e3,
		signal,
		...sandboxPolicy !== void 0 ? { sandboxPolicy } : {}
	}));
	if (result.exitCode !== 0) imageCommandFailure("image size read", path, platform, result);
	const text = result.stdout.text;
	return {
		width: dimensionOf(text, "pixelWidth"),
		height: dimensionOf(text, "pixelHeight")
	};
}
/** Parse one `key: N` dimension line from a platform image backend. */
function dimensionOf(text, key) {
	const match = text.match(new RegExp(`${key}:\\s*(\\d+)`));
	return match === null ? 0 : Number(match[1]);
}
//#endregion
//#region src/abort.ts
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
//#region src/channels/gpt/index.ts
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
/**
* Resolve the effective Ollama endpoint (trailing slashes trimmed; falls back
* to the local default).
* @param baseUrl - the configured endpoint, possibly blank.
* @returns the endpoint with no trailing slash.
*/
function resolveOllamaEndpoint(baseUrl) {
	return (baseUrl ?? "").trim().replace(/\/+$/, "") || "http://localhost:11434";
}
/**
* Build the `/api/chat` request body. The image travels as a bare base64
* string in the `images` array (Ollama's format, not a data URL).
* @param model - the model name (blank falls back to the default).
* @param prompt - the user instruction.
* @param imageB64 - base64-encoded image bytes.
* @returns the JSON body.
*/
function buildOllamaChatBody(model, prompt, imageB64) {
	return {
		model: (model ?? "").trim() || "llava",
		messages: [{
			role: "user",
			content: prompt,
			images: [imageB64]
		}],
		stream: false
	};
}
/**
* Extract the plain-text answer from an Ollama `/api/chat` payload.
* @param payload - the parsed response.
* @returns the trimmed answer.
*/
function ollamaAnswerOf(payload) {
	const content = (payload?.message)?.content;
	if (typeof content !== "string" || content.trim() === "") throw new Error("ollama returned an empty answer (is the model vision-capable?)");
	return content.trim();
}
//#endregion
//#region src/channels/ollama/index.ts
/**
* Run one vision call against a local Ollama server.
* @param _ctx - plugin context (unused: no credentials involved).
* @param call - the prepared image and the active section.
* @returns the model's plain-text answer.
*/
async function ollamaAnalyze(_ctx, call) {
	const { config, imageB64, prompt, signal } = call;
	const baseUrl = resolveOllamaEndpoint(config.baseUrl);
	const body = buildOllamaChatBody(config.model, prompt, imageB64);
	let response;
	try {
		response = await fetch(`${baseUrl}/api/chat`, {
			method: "POST",
			redirect: "error",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
			...signal !== void 0 ? { signal } : {}
		});
	} catch (error) {
		if (signal?.aborted === true || isAbortError(error)) throw abortedError();
		throw new Error(`ollama request failed (is the Ollama server running at ${baseUrl}?): ${String(error)}`);
	}
	let payload;
	try {
		payload = await response.json();
	} catch (error) {
		if (signal?.aborted === true || isAbortError(error)) throw abortedError();
		throw new Error(`ollama returned an unprocessable response (HTTP ${response.status}): ${String(error)}`);
	}
	if (!response.ok) {
		const detail = typeof payload.error === "string" && payload.error.length > 0 ? payload.error : `HTTP ${response.status}`;
		throw new Error(`ollama request failed: ${detail}`);
	}
	return ollamaAnswerOf(payload);
}
//#endregion
//#region src/channels/zhipu/request.ts
/** Default Zhipu endpoint prefix; `/chat/completions` is appended. */
const ZHIPU_DEFAULT_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
/**
* Validate the configured endpoint, returning it trimmed of trailing slashes.
* @param baseUrl - the configured endpoint, possibly blank.
* @returns the endpoint with no trailing slash.
* @throws when no endpoint is configured.
*/
function requireZhipuEndpoint(baseUrl) {
	const endpoint = (baseUrl ?? "").trim().replace(/\/+$/, "");
	if (endpoint === "") throw new Error(`zhipu has no endpoint (vision.baseUrl); set it in Settings → Plugins → Vision — e.g. ${ZHIPU_DEFAULT_BASE_URL}`);
	return endpoint;
}
//#endregion
//#region src/channels/zhipu/index.ts
/**
* The `zhipu` channel: Zhipu GLM-4V (OpenAI-compatible
* `POST /chat/completions`, image_url data URL). The request shape is
* identical to the `gpt` channel, so this channel reuses `gptAnalyze` and
* only adds its endpoint check.
*
* Default endpoint: https://open.bigmodel.cn/api/paas/v4
* @module @deepseek-ai/dsh-tool-vision/channels/zhipu
*/
/**
* Run one vision call against Zhipu. Shares the OpenAI-compatible request
* with the gpt channel; the endpoint is checked here so a missing baseUrl
* fails with an actionable message instead of a fetch on a relative URL.
* @param ctx - plugin context supplying the credentials seam.
* @param call - the prepared image and the active section.
* @returns the model's plain-text answer.
*/
async function zhipuAnalyze(ctx, call) {
	requireZhipuEndpoint(call.config.baseUrl);
	return gptAnalyze(ctx, call);
}
//#endregion
//#region src/channels/index.ts
/**
* The channel registry: maps the `vision.channel` setting to one backend.
* Adding a channel is one folder under `channels/<id>/` plus one registry
* entry — the tool schemas never change.
* @module @deepseek-ai/dsh-tool-vision/channels
*/
/** Registered recognition channels, keyed by the `vision.channel` setting. */
const channels = {
	gpt: {
		label: "GPT",
		analyze: gptAnalyze
	},
	zhipu: {
		label: "Zhipu GLM-4V",
		analyze: zhipuAnalyze
	},
	ollama: {
		label: "Ollama (local)",
		analyze: ollamaAnalyze
	}
};
//#endregion
//#region src/index.ts
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
const VISION_SETTINGS_NAMESPACE = "vision";
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
* Resolve the calling session's sandbox policy for a direct shell call. The
* tool layer normally stamps this per execution; the vision tools call
* `ctx.shell` directly, so they resolve it the same way to keep the session's
* confinement (and its persistent private temp) across capture/prepare steps.
* @param ctx - plugin context.
* @param exec - the executing tool call.
* @returns the session policy, or undefined when no policy service is mounted.
*/
function sessionShellPolicy(ctx, exec) {
	const sandboxPolicy = ctx.get("sandboxPolicy");
	return sandboxPolicy === void 0 ? void 0 : sandboxPolicy.resolve(exec.agent === void 0 ? {} : { session: exec.agent.session });
}
/**
* Mount the vision tools and settings section.
* @param ctx - plugin context.
* @param config - the composed row config (schema-defaulted by Cordis).
*/
function apply(ctx, config) {
	let current = () => config;
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.installSection(ctx, VISION_SETTINGS_NAMESPACE, Config, config, {
			setSource: (source) => {
				current = source;
			},
			onChange: () => {}
		});
	});
	let lastScreenshotPath;
	const webServer = ctx.get("webServer");
	if (webServer !== void 0) webServer.register({
		kind: "prefix",
		path: "/dsh-vision",
		handler: (req, res) => {
			const base = new URL(req.url ?? "/", "http://x").pathname.split("/").pop() ?? "";
			const target = lastScreenshotPath !== void 0 && basename(lastScreenshotPath) === base ? lastScreenshotPath : void 0;
			if (target === void 0) {
				res.writeHead(404);
				res.end();
				return;
			}
			const stream = createReadStream(target);
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
		description: "Capture the screen and return a PNG path the recognition tool can read. mode=fullscreen captures the primary display; mode=window requires window_id from list_windows; mode=region captures a rectangle (x, y, width, height); mode=interactive asks the user to select a region. mode=android captures a connected Android device/emulator via adb (any host); mode=ios captures the booted iOS simulator via xcrun (macOS host). Host capture works on macOS (screencapture), Windows (PowerShell) and Linux (ImageMagick); on macOS the first use may require Screen Recording permission.",
		parameters: {
			mode: {
				type: "string",
				required: true,
				enum: [
					"fullscreen",
					"window",
					"region",
					"interactive",
					"android",
					"ios"
				],
				description: "What to capture: fullscreen, an existing window, a rectangle region, an interactive user selection, an Android device/emulator (adb), or the booted iOS simulator (macOS)."
			},
			window_id: {
				type: "number",
				description: "Required for mode=window; a window id from list_windows."
			},
			device: {
				type: "string",
				description: "adb serial from `adb devices` (mode=android); required when several devices are online."
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
			const policy = sessionShellPolicy(ctx, exec);
			const precomputed = join(tmpdir(), `dsh-vision-${Date.now()}.png`);
			const command = buildScreenshotCommand(args, precomputed);
			const result = await ctx.shell.run(ctx.shell.resolve({
				command,
				timeoutMs: 9e4,
				signal: exec.signal,
				...policy !== void 0 ? { sandboxPolicy: policy } : {}
			}));
			if (result.aborted) throw abortedError();
			if (result.exitCode !== 0) {
				const stderr = result.stderr.text.trim();
				const missing = /command not found|not recognized|not found/i.test(stderr);
				const multipleDevices = /more than one device/i.test(stderr);
				const hint = missing ? args.mode === "android" || args.mode === "ios" ? deviceCaptureHint(args.mode) : captureDependencyHint(currentPlatform()) : multipleDevices ? "; multiple adb devices are online; pass device=<serial> from `adb devices`" : /permission|screen recording/i.test(stderr) ? "; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)" : "";
				throw new Error(`screen capture failed (exit ${result.exitCode}): ${stderr || result.stdout.text.trim()}${hint}`);
			}
			const path = shellOutputPath(result.stdout.text, currentPlatform(), precomputed);
			const size = await imageSizeOf(ctx, path, exec.signal, policy);
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
		description: "List on-screen windows with their id, owning app, and title. Use an id as window_id for take_screenshot mode=window (works on macOS, Windows and Linux X11).",
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
			return listWindowsViaShell(ctx, exec.signal, void 0, sessionShellPolicy(ctx, exec));
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
			const prepared = await prepareImage(ctx, imagePath, exec.agent?.session.header.cwd, exec.signal, sessionShellPolicy(ctx, exec));
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
					"interactive",
					"android",
					"ios"
				],
				description: "Capture mode when image_path is omitted (default fullscreen)."
			},
			window_id: {
				type: "number",
				description: "Required for mode=window; a window id from list_windows."
			},
			device: {
				type: "string",
				description: "adb serial from `adb devices` (mode=android); required when several devices are online."
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
				const policy = sessionShellPolicy(ctx, exec);
				const precomputed = join(tmpdir(), `dsh-vision-${Date.now()}.png`);
				const shotArgs = { mode: args.mode ?? "fullscreen" };
				if (args.window_id !== void 0) shotArgs.window_id = args.window_id;
				if (args.device !== void 0) shotArgs.device = args.device;
				if (args.x !== void 0) shotArgs.x = args.x;
				if (args.y !== void 0) shotArgs.y = args.y;
				if (args.width !== void 0) shotArgs.width = args.width;
				if (args.height !== void 0) shotArgs.height = args.height;
				const shot = await ctx.shell.run(ctx.shell.resolve({
					command: buildScreenshotCommand(shotArgs, precomputed),
					timeoutMs: 9e4,
					signal: exec.signal,
					...policy !== void 0 ? { sandboxPolicy: policy } : {}
				}));
				if (shot.aborted) throw abortedError();
				if (shot.exitCode !== 0) {
					const stderr = shot.stderr.text.trim();
					const missing = /command not found|not recognized|not found/i.test(stderr);
					const multipleDevices = /more than one device/i.test(stderr);
					const hint = missing ? shotArgs.mode === "android" || shotArgs.mode === "ios" ? deviceCaptureHint(shotArgs.mode) : captureDependencyHint(currentPlatform()) : multipleDevices ? "; multiple adb devices are online; pass device=<serial> from `adb devices`" : /permission|screen recording/i.test(stderr) ? "; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)" : "";
					throw new Error(`screen capture failed (exit ${shot.exitCode}): ${stderr || shot.stdout.text.trim()}${hint}`);
				}
				path = shellOutputPath(shot.stdout.text, currentPlatform(), precomputed);
				lastScreenshotPath = path;
			}
			const prepared = await prepareImage(ctx, path, exec.agent?.session.header.cwd, exec.signal, sessionShellPolicy(ctx, exec));
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
