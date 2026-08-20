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
import { basename } from 'node:path';
/**
 * The platform this process runs on. Anything that is neither macOS nor
 * Windows is treated as Linux (the X11 tooling path).
 * @returns the capture backend platform.
 */
export function currentPlatform() {
    if (process.platform === 'darwin')
        return 'darwin';
    if (process.platform === 'win32')
        return 'win32';
    return 'linux';
}
/** Missing-dependency hint appended to a failed capture/enumeration error. */
export function captureDependencyHint(platform) {
    switch (platform) {
        case 'darwin':
            return '; macOS Screen Recording permission may be missing (System Settings → Privacy & Security → Screen Recording)';
        case 'win32':
            return '; requires Windows PowerShell with System.Drawing (built into Windows)';
        default:
            return '; requires ImageMagick (`import`), `wmctrl` and `xprop` (X11); install with your package manager, e.g. apt install imagemagick wmctrl x11-utils';
    }
}
/**
 * Build the capture command for one request on the given platform.
 * @param args - the tool arguments.
 * @param outPath - the PNG path the capture writes (absolute).
 * @param platform - the capture backend platform (defaults to this process's).
 * @returns the command line to run through the shell seam.
 */
export function buildScreenshotCommand(args, outPath, platform = currentPlatform()) {
    const out = `'${outPath}'`;
    switch (args.mode) {
        case 'fullscreen':
            return fullscreenCommand(platform, out, outPath);
        case 'region':
            if (args.x === undefined || args.y === undefined || args.width === undefined || args.height === undefined) {
                throw new Error('take_screenshot mode=region requires x, y, width, and height');
            }
            return regionCommand(platform, out, outPath, args.x, args.y, args.width, args.height);
        case 'window':
            if (args.window_id === undefined) {
                throw new Error('take_screenshot mode=window requires window_id from list_windows');
            }
            return windowCommand(platform, out, outPath, args.window_id);
        case 'interactive':
            if (platform !== 'darwin') {
                throw new Error(`take_screenshot mode=interactive is macOS-only; on ${platform} use mode=region with x/y/width/height`);
            }
            return `screencapture -i -x ${out}`;
        default:
            throw new Error(`take_screenshot: unsupported mode ${JSON.stringify(args.mode)}`);
    }
}
/** Fullscreen capture for the platform. */
function fullscreenCommand(platform, out, outPath) {
    switch (platform) {
        case 'darwin':
            return `screencapture -x ${out}`;
        case 'win32':
            // System.Windows.Forms.Screen gives the full virtual screen bounds. The
            // confined shell may write only its private temp, so save there and echo
            // the path for the caller to read back.
            return `Add-Type -AssemblyName System.Windows.Forms,System.Drawing; `
                + `$s=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds; `
                + `$b=New-Object System.Drawing.Bitmap $s.Width,$s.Height; `
                + `$g=[System.Drawing.Graphics]::FromImage($b); `
                + `$g.CopyFromScreen($s.X,$s.Y,0,0,$b.Size); `
                + `$p=Join-Path $env:TEMP '${basename(outPath)}'; `
                + `$b.Save($p,[System.Drawing.Imaging.ImageFormat]::Png); `
                + `Write-Output $p`;
        default:
            return `import -window root ${out}`;
    }
}
/** Region capture for the platform. */
function regionCommand(platform, out, outPath, x, y, width, height) {
    switch (platform) {
        case 'darwin':
            return `screencapture -x -R ${x},${y},${width},${height} ${out}`;
        case 'win32':
            return `Add-Type -AssemblyName System.Windows.Forms,System.Drawing; `
                + `$b=New-Object System.Drawing.Bitmap ${width},${height}; `
                + `$g=[System.Drawing.Graphics]::FromImage($b); `
                + `$g.CopyFromScreen(${x},${y},0,0,(New-Object System.Drawing.Size(${width},${height}))); `
                + `$p=Join-Path $env:TEMP '${basename(outPath)}'; `
                + `$b.Save($p,[System.Drawing.Imaging.ImageFormat]::Png); `
                + `Write-Output $p`;
        default:
            return `import -window root -crop ${width}x${height}+${x}+${y} ${out}`;
    }
}
/** Window capture for the platform. */
function windowCommand(platform, out, outPath, windowId) {
    switch (platform) {
        case 'darwin':
            return `screencapture -x -l${windowId} ${out}`;
        case 'win32':
            // GetWindowRect + CopyFromScreen captures the window's rectangle
            // (a true PrintWindow capture would need another P/Invoke).
            return `Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;`
                + `public struct WR{public int L;public int T;public int R;public int B;}`
                + `public class WU{[DllImport("user32.dll")]public static extern bool GetWindowRect(IntPtr h,out WR r);}'; `
                + `Add-Type -AssemblyName System.Drawing; `
                + `$h=[IntPtr]::new(${windowId}); `
                + `$r=New-Object WR; `
                + `[WU]::GetWindowRect($h,[ref]$r)|Out-Null; `
                + `$w=$r.R-$r.L; $ht=$r.B-$r.T; `
                + `$b=New-Object System.Drawing.Bitmap $w,$ht; `
                + `$g=[System.Drawing.Graphics]::FromImage($b); `
                + `$g.CopyFromScreen($r.L,$r.T,0,0,$b.Size); `
                + `$p=Join-Path $env:TEMP '${basename(outPath)}'; `
                + `$b.Save($p,[System.Drawing.Imaging.ImageFormat]::Png); `
                + `Write-Output $p`;
        default:
            // X11 ids are hexadecimal (0x…); `import -window` accepts them as-is.
            return `import -window 0x${windowId.toString(16)} ${out}`;
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
export function shellOutputPath(stdout, platform, precomputed) {
    if (platform !== 'win32')
        return precomputed;
    const lines = stdout.split('\n').map(line => line.trim()).filter(line => line !== '');
    const last = lines.at(-1);
    if (last === undefined)
        throw new Error('capture command produced no output path');
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
const WINDOW_LIST_POWERSHELL = `Get-Process | Where-Object { $_.MainWindowHandle -ne 0 } | `
    + `ForEach-Object { $t=[char]9; "$($_.MainWindowHandle)$t$($_.ProcessName)$t$($_.MainWindowTitle)" }`;
/** Linux: X11 windows via wmctrl + xprop (id decimal, class as app, title). */
const WINDOW_LIST_X11 = `wmctrl -l | while read -r id host title; do `
    + `cls=$(xprop -id "$id" WM_CLASS 2>/dev/null | sed -n 's/.*"\\([^"]*\\)".*/\\1/p'); `
    + `[ -z "$cls" ] && cls="$host"; `
    + `printf '%d\\t%s\\t%s\\n' $((16#$id)) "$cls" "$title"; done`;
/**
 * Enumerate on-screen windows through the platform backend.
 * @param ctx - plugin context supplying the shell seam.
 * @param signal - caller cancellation signal.
 * @param platform - the capture backend platform (defaults to this process's).
 * @returns the window entries, ordered as the backend reported them.
 */
export async function listWindowsViaShell(ctx, signal, platform = currentPlatform(), sandboxPolicy) {
    const spec = platform === 'darwin'
        ? { command: 'swift -', stdin: WINDOW_LIST_SWIFT }
        : { command: platform === 'win32' ? WINDOW_LIST_POWERSHELL : WINDOW_LIST_X11 };
    const result = await ctx.shell.run(ctx.shell.resolve({
        ...spec,
        timeoutMs: 30000,
        signal,
        ...sandboxPolicy !== undefined ? { sandboxPolicy } : {},
    }));
    if (result.exitCode !== 0) {
        const stderr = result.stderr.text.trim();
        const missing = /command not found|not recognized|not found/i.test(stderr);
        throw new Error(`window enumeration failed (exit ${result.exitCode}): ${stderr || result.stdout.text.trim()}`
            + (missing ? captureDependencyHint(platform) : platform === 'darwin' ? captureDependencyHint('darwin') : ''));
    }
    return parseWindowLines(result.stdout.text);
}
/** Parse `id<TAB>app<TAB>title` lines from a backend's stdout. */
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