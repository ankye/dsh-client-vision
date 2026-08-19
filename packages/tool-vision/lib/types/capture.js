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
export function buildScreenshotCommand(args, outPath) {
    const out = `'${outPath}'`;
    switch (args.mode) {
        case 'fullscreen':
            return `screencapture -x ${out}`;
        case 'region':
            if (args.x === undefined || args.y === undefined || args.width === undefined || args.height === undefined) {
                throw new Error('take_screenshot mode=region requires x, y, width, and height');
            }
            return `screencapture -x -R ${args.x},${args.y},${args.width},${args.height} ${out}`;
        case 'window':
            if (args.window_id === undefined) {
                throw new Error('take_screenshot mode=window requires window_id from list_windows');
            }
            return `screencapture -x -l${args.window_id} ${out}`;
        case 'interactive':
            return `screencapture -i -x ${out}`;
        default:
            throw new Error(`take_screenshot: unsupported mode ${JSON.stringify(args.mode)}`);
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
export async function listWindowsViaShell(ctx, signal) {
    const result = await ctx.shell.run(ctx.shell.resolve({
        command: 'swift -',
        stdin: WINDOW_LIST_SWIFT,
        timeoutMs: 30000,
        signal,
    }));
    if (result.exitCode !== 0) {
        const stderr = result.stderr.text.trim();
        const hint = /permission|not authorized|screen recording/i.test(stderr)
            ? '; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)'
            : '';
        throw new Error(`window enumeration failed (exit ${result.exitCode}): ${stderr || result.stdout.text.trim()}${hint}`);
    }
    return parseWindowLines(result.stdout.text);
}
/** Parse `id<TAB>app<TAB>title` lines from the Swift program's stdout. */
function parseWindowLines(text) {
    const entries = [];
    for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (trimmed === '')
            continue;
        const tab = trimmed.indexOf('\t');
        if (tab < 0)
            continue;
        const id = Number(trimmed.slice(0, tab));
        if (!Number.isInteger(id) || id < 0)
            continue;
        const rest = trimmed.slice(tab + 1);
        const secondTab = rest.indexOf('\t');
        const app = secondTab < 0 ? rest : rest.slice(0, secondTab);
        const title = secondTab < 0 ? '' : rest.slice(secondTab + 1);
        entries.push({ id, app, title });
    }
    return entries;
}
//# sourceMappingURL=capture.js.map