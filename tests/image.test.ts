import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildImagePreparationCommand, buildImageSizeCommand } from '../packages/tool-vision/src/image.ts'

test('darwin image preparation uses sips', () => {
  assert.equal(
    buildImagePreparationCommand('/tmp/source.png', '/tmp/output.jpg', 'darwin'),
    "sips -Z 1568 -s format jpeg -s formatOptions 80 '/tmp/source.png' --out '/tmp/output.jpg'",
  )
})

test('win32 image preparation uses System.Drawing', () => {
  const command = buildImagePreparationCommand('C:\\tmp\\source.png', 'C:\\tmp\\output.jpg', 'win32')
  assert.match(command, /Add-Type -AssemblyName System\.Drawing/)
  assert.match(command, /ImageCodecInfo\]::GetImageEncoders/)
  assert.match(command, /Quality/)
  assert.match(command, /\[Math\]::Min\(\[double\]1,\[double\]1568\/\$edge\)/)
  assert.match(command, /FromFile\('C:\\tmp\\source\.png'\)/)
  assert.match(command, /Join-Path \$env:TEMP 'output\.jpg'/)
  assert.match(command, /Write-Output \$p$/)
})

test('linux image preparation uses ImageMagick', () => {
  assert.equal(
    buildImagePreparationCommand('/tmp/source.png', '/tmp/output.jpg', 'linux'),
    "convert '/tmp/source.png' -resize '1568x1568>' -quality 80 '/tmp/output.jpg'",
  )
})

test('image size commands use each platform backend', () => {
  assert.match(buildImageSizeCommand('/tmp/output.jpg', 'darwin'), /sips -g pixelWidth -g pixelHeight/)
  assert.match(buildImageSizeCommand('C:\\tmp\\output.jpg', 'win32'), /System\.Drawing/)
  assert.match(buildImageSizeCommand('/tmp/output.jpg', 'linux'), /identify -format/)
})
