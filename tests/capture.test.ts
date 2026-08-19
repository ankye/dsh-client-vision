/**
 * Behaviour tests for the screencapture command builder. Pure string logic —
 * no harness services are touched, so this runs standalone (node:test +
 * --experimental-strip-types, zero dependencies).
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildScreenshotCommand } from '../packages/tool-vision/src/capture.ts'

const OUT = '/tmp/shot.png'

test('fullscreen builds a plain screencapture command', () => {
  assert.equal(buildScreenshotCommand({ mode: 'fullscreen' }, OUT), `screencapture -x '${OUT}'`)
})

test('interactive builds -i -x', () => {
  assert.equal(buildScreenshotCommand({ mode: 'interactive' }, OUT), `screencapture -i -x '${OUT}'`)
})

test('region with all coordinates builds -R', () => {
  const cmd = buildScreenshotCommand({ mode: 'region', x: 10, y: 20, width: 100, height: 200 }, OUT)
  assert.equal(cmd, `screencapture -x -R 10,20,100,200 '${OUT}'`)
})

test('region without coordinates throws', () => {
  assert.throws(
    () => buildScreenshotCommand({ mode: 'region', x: 1 }, OUT),
    /requires x, y, width, and height/,
  )
})

test('window with an id builds -l<id>', () => {
  assert.equal(buildScreenshotCommand({ mode: 'window', window_id: 1324 }, OUT), `screencapture -x -l1324 '${OUT}'`)
})

test('window without an id throws', () => {
  assert.throws(() => buildScreenshotCommand({ mode: 'window' }, OUT), /requires window_id/)
})

test('unknown mode throws', () => {
  assert.throws(
    () => buildScreenshotCommand({ mode: 'bogus' as never }, OUT),
    /unsupported mode/,
  )
})
