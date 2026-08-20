/**
 * Screen capture and window enumeration through the `ctx.shell` seam.
 *
 * Backends are selected by platform — the harness `shell` service runs
 * `bash -c` on macOS/Linux and PowerShell on Windows:
 *
 * - macOS: `screencapture` + a Swift `CGWindowList` snippet (no extra deps).
 * - Windows: PowerShell `System.Drawing` + `Get-Process` (no extra deps).
 * - Linux: ImageMagick `import` + `wmctrl`/`xprop` (X11 tooling).
 * @module @deepseek-ai/dsh-tool-vision/capture
 */
import type { Context } from '@deepseek-ai/cordis';
import type { SandboxExecutionPolicy } from '@deepseek-ai/dsh-sandbox';
/** A platform the capture backend can run on. */
export type CapturePlatform = 'darwin' | 'win32' | 'linux';
/**
 * The platform this process runs on. Anything that is neither macOS nor
 * Windows is treated as Linux (the X11 tooling path).
 * @returns the capture backend platform.
 */
export declare function currentPlatform(): CapturePlatform;
/** The `take_screenshot` tool's arguments. */
export interface ScreenshotArgs {
    /** What to capture. */
    mode: 'fullscreen' | 'window' | 'region' | 'interactive';
    /** Window id from {@link listWindowsViaShell} (mode=window). */
    window_id?: number;
    /** Region left edge in screen points (mode=region). */
    x?: number;
    /** Region top edge in screen points (mode=region). */
    y?: number;
    /** Region width in screen points (mode=region). */
    width?: number;
    /** Region height in screen points (mode=region). */
    height?: number;
}
/** One enumerated on-screen window. */
export interface WindowEntry {
    /** Platform window id (CGWindowNumber / HWND / X11 id), usable as `mode=window` input. */
    id: number;
    /** Owning application name. */
    app: string;
    /** Window title (may be empty when the app exposes none). */
    title: string;
}
/** Missing-dependency hint appended to a failed capture/enumeration error. */
export declare function captureDependencyHint(platform: CapturePlatform): string;
/**
 * Build the capture command for one request on the given platform.
 * @param args - the tool arguments.
 * @param outPath - the PNG path the capture writes (absolute).
 * @param platform - the capture backend platform (defaults to this process's).
 * @returns the command line to run through the shell seam.
 */
export declare function buildScreenshotCommand(args: ScreenshotArgs, outPath: string, platform?: CapturePlatform): string;
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
export declare function shellOutputPath(stdout: string, platform: CapturePlatform, precomputed: string): string;
/**
 * Enumerate on-screen windows through the platform backend.
 * @param ctx - plugin context supplying the shell seam.
 * @param signal - caller cancellation signal.
 * @param platform - the capture backend platform (defaults to this process's).
 * @returns the window entries, ordered as the backend reported them.
 */
export declare function listWindowsViaShell(ctx: Context, signal: AbortSignal | undefined, platform?: CapturePlatform, sandboxPolicy?: SandboxExecutionPolicy): Promise<WindowEntry[]>;
//# sourceMappingURL=capture.d.ts.map