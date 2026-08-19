/**
 * Screen capture and window enumeration through the `ctx.shell` seam
 * (macOS `screencapture` + a Swift `CGWindowList` snippet).
 * @module @deepseek-ai/dsh-tool-vision/capture
 */
import type { Context } from '@deepseek-ai/cordis';
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
    /** CGWindowNumber, usable as `screencapture -l` id. */
    id: number;
    /** Owning application name. */
    app: string;
    /** Window title (may be empty when the app exposes none). */
    title: string;
}
/**
 * Build the `screencapture` command for one capture request.
 * @param args - the tool arguments.
 * @param outPath - the PNG path the capture writes.
 * @returns the command line to run.
 */
export declare function buildScreenshotCommand(args: ScreenshotArgs, outPath: string): string;
/**
 * Enumerate normal-layer on-screen windows through `swift -` (stdin).
 * @param ctx - plugin context supplying the shell seam.
 * @param signal - caller cancellation signal.
 * @returns the window entries, ordered as CoreGraphics reported them.
 */
export declare function listWindowsViaShell(ctx: Context, signal?: AbortSignal): Promise<WindowEntry[]>;
//# sourceMappingURL=capture.d.ts.map