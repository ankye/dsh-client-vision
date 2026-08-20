/**
 * Behaviour tests for the platform capture command builders. Pure string
 * logic — no harness services are touched, so this runs standalone (node:test
 * + --experimental-strip-types, zero dependencies).
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildScreenshotCommand, currentPlatform, deviceCaptureHint, listWindowsViaShell, shellOutputPath } from '../packages/tool-vision/src/capture.ts'

const OUT = '/tmp/shot.png'

// ---------- macOS (screencapture) ----------

test('darwin: fullscreen builds a plain screencapture command', () => {
  assert.equal(buildScreenshotCommand({ mode: 'fullscreen' }, OUT, 'darwin'), `screencapture -x '${OUT}'`)
})

test('darwin: interactive builds -i -x', () => {
  assert.equal(buildScreenshotCommand({ mode: 'interactive' }, OUT, 'darwin'), `screencapture -i -x '${OUT}'`)
})

test('darwin: region with all coordinates builds -R', () => {
  const cmd = buildScreenshotCommand({ mode: 'region', x: 10, y: 20, width: 100, height: 200 }, OUT, 'darwin')
  assert.equal(cmd, `screencapture -x -R 10,20,100,200 '${OUT}'`)
})

test('darwin: window with an id builds -l<id>', () => {
  assert.equal(buildScreenshotCommand({ mode: 'window', window_id: 1324 }, OUT, 'darwin'), `screencapture -x -l1324 '${OUT}'`)
})

// ---------- shared validation ----------

test('region without coordinates throws on every platform', () => {
  for (const platform of ['darwin', 'win32', 'linux'] as const) {
    assert.throws(() => buildScreenshotCommand({ mode: 'region', x: 1 }, OUT, platform), /requires x, y, width, and height/)
  }
})

test('window without an id throws on every platform', () => {
  for (const platform of ['darwin', 'win32', 'linux'] as const) {
    assert.throws(() => buildScreenshotCommand({ mode: 'window' }, OUT, platform), /requires window_id/)
  }
})

test('unknown mode throws', () => {
  assert.throws(() => buildScreenshotCommand({ mode: 'bogus' as never }, OUT, 'darwin'), /unsupported mode/)
})

test('interactive is rejected off macOS', () => {
  for (const platform of ['win32', 'linux'] as const) {
    assert.throws(
      () => buildScreenshotCommand({ mode: 'interactive' }, OUT, platform),
      /interactive is macOS-only/,
    )
  }
})

// ---------- Windows (PowerShell) ----------

test('win32: fullscreen uses System.Windows.Forms Screen + CopyFromScreen', () => {
  const cmd = buildScreenshotCommand({ mode: 'fullscreen' }, 'C:\\shots\\a.png', 'win32')
  assert.match(cmd, /^Add-Type -AssemblyName System\.Windows\.Forms,System\.Drawing/)
  assert.match(cmd, /CopyFromScreen\(\$s\.X,\$s\.Y,0,0,\$b\.Size\)/)
  assert.match(cmd, /ImageFormat\]::Png/)
  assert.match(cmd, /Join-Path \$env:TEMP 'a\.png'/)
  assert.match(cmd, /Write-Output \$p$/)
})

test('win32: region builds a sized bitmap and copies the rectangle', () => {
  const cmd = buildScreenshotCommand({ mode: 'region', x: 10, y: 20, width: 100, height: 200 }, 'C:\\shots\\a.png', 'win32')
  assert.match(cmd, /New-Object System\.Drawing\.Bitmap 100,200/)
  assert.match(cmd, /CopyFromScreen\(10,20,0,0,\(New-Object System\.Drawing\.Size\(100,200\)\)\)/)
  assert.match(cmd, /Join-Path \$env:TEMP 'a\.png'/)
  assert.match(cmd, /Write-Output \$p$/)
})

test('win32: window uses GetWindowRect P/Invoke', () => {
  const cmd = buildScreenshotCommand({ mode: 'window', window_id: 65537 }, 'C:\\shots\\a.png', 'win32')
  assert.match(cmd, /DllImport\("user32\.dll"\)\]public static extern bool GetWindowRect/)
  assert.match(cmd, /\[IntPtr\]::new\(65537\)/)
  assert.match(cmd, /CopyFromScreen\(\$r\.L,\$r\.T,0,0,\$b\.Size\)/)
  assert.match(cmd, /Join-Path \$env:TEMP 'a\.png'/)
  assert.match(cmd, /Write-Output \$p$/)
})

// ---------- output path resolution ----------

test('win32: the echoed stdout line is the written path', () => {
  assert.equal(
    shellOutputPath("C:\\Temp\\dsh-abc123\\a.png\n", 'win32', 'C:\\precomputed\\a.png'),
    'C:\\Temp\\dsh-abc123\\a.png',
  )
})

test('win32: a missing echoed path fails loudly', () => {
  assert.throws(() => shellOutputPath('', 'win32', 'C:\\precomputed\\a.png'), /produced no output path/)
})

test('darwin and linux keep the precomputed path', () => {
  assert.equal(shellOutputPath('', 'darwin', '/tmp/a.png'), '/tmp/a.png')
  assert.equal(shellOutputPath('', 'linux', '/tmp/a.png'), '/tmp/a.png')
})

// ---------- Linux (ImageMagick / X11) ----------

test('linux: fullscreen uses import -window root', () => {
  assert.equal(buildScreenshotCommand({ mode: 'fullscreen' }, OUT, 'linux'), `import -window root '${OUT}'`)
})

test('linux: region uses import -crop WxH+X+Y', () => {
  const cmd = buildScreenshotCommand({ mode: 'region', x: 10, y: 20, width: 100, height: 200 }, OUT, 'linux')
  assert.equal(cmd, `import -window root -crop 100x200+10+20 '${OUT}'`)
})

test('linux: window uses a hex X11 id', () => {
  const cmd = buildScreenshotCommand({ mode: 'window', window_id: 46661637 }, OUT, 'linux')
  assert.equal(cmd, `import -window 0x2c80005 '${OUT}'`)
})

// ---------- window enumeration parsing ----------

test('window list output parses tab-separated entries', async () => {
  const ctx = {
    shell: {
      resolve: (request: unknown) => request,
      run: async () => ({
        exitCode: 0,
        stdout: { text: '132074\tApplicationFrameHost\t设置\n68012\tcc-switch\tCC Switch\n' },
        stderr: { text: '' },
      }),
    },
  }
  const entries = await listWindowsViaShell(ctx as never, undefined, 'win32')
  assert.deepEqual(entries, [
    { id: 132074, app: 'ApplicationFrameHost', title: '设置' },
    { id: 68012, app: 'cc-switch', title: 'CC Switch' },
  ])
})

// ---------- device capture (android / ios) ----------

test('android on win32 pulls into the confined temp and echoes the path', () => {
  const cmd = buildScreenshotCommand({ mode: 'android' }, 'C:\\shots\\a.png', 'win32')
  assert.match(cmd, /adb shell screencap -p \/sdcard\/dsh-vision-screen\.png/)
  assert.match(cmd, /if \(\$LASTEXITCODE -ne 0\) \{ exit \$LASTEXITCODE \}/)
  assert.match(cmd, /adb pull \/sdcard\/dsh-vision-screen\.png \$p/)
  assert.match(cmd, /Join-Path \$env:TEMP 'a\.png'/)
  assert.match(cmd, /Write-Output \$p$/)
})

test('android on darwin and linux pulls to the precomputed path', () => {
  assert.equal(
    buildScreenshotCommand({ mode: 'android' }, OUT, 'linux'),
    "adb shell screencap -p /sdcard/dsh-vision-screen.png && adb pull /sdcard/dsh-vision-screen.png '/tmp/shot.png'",
  )
  assert.equal(
    buildScreenshotCommand({ mode: 'android' }, OUT, 'darwin'),
    "adb shell screencap -p /sdcard/dsh-vision-screen.png && adb pull /sdcard/dsh-vision-screen.png '/tmp/shot.png'",
  )
})

test('android with a device serial targets that adb device', () => {
  const cmd = buildScreenshotCommand({ mode: 'android', device: 'emulator-5554' }, OUT, 'linux')
  assert.equal(
    cmd,
    "adb -s 'emulator-5554' shell screencap -p /sdcard/dsh-vision-screen.png && adb -s 'emulator-5554' pull /sdcard/dsh-vision-screen.png '/tmp/shot.png'",
  )
})

test('ios on darwin captures the booted simulator', () => {
  assert.equal(
    buildScreenshotCommand({ mode: 'ios' }, OUT, 'darwin'),
    "xcrun simctl io booted screenshot '/tmp/shot.png'",
  )
})

test('ios off macOS throws', () => {
  for (const platform of ['win32', 'linux'] as const) {
    assert.throws(
      () => buildScreenshotCommand({ mode: 'ios' }, OUT, platform),
      /mode=ios requires macOS/,
    )
  }
})

test('device dependency hints name adb and xcrun', () => {
  assert.match(deviceCaptureHint('android'), /adb devices/)
  assert.match(deviceCaptureHint('ios'), /xcrun simctl/)
})

// ---------- platform detection ----------

test('currentPlatform resolves to a known backend', () => {
  assert.ok(['darwin', 'win32', 'linux'].includes(currentPlatform()))
})
