/**
 * Behaviour tests for the Zhipu channel's endpoint validation and model list.
 * Zero dependencies — node:test + --experimental-strip-types.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  requireZhipuEndpoint,
  ZHIPU_DEFAULT_BASE_URL,
  ZHIPU_MODELS,
} from '../packages/tool-vision/src/channels/zhipu/request.ts'

test('requireZhipuEndpoint rejects a missing endpoint with an actionable message', () => {
  for (const blank of [undefined, '', '   ']) {
    assert.throws(
      () => requireZhipuEndpoint(blank),
      /zhipu has no endpoint \(vision\.baseUrl\); set it in Settings/,
    )
  }
})

test('requireZhipuEndpoint trims trailing slashes', () => {
  assert.equal(requireZhipuEndpoint('https://open.bigmodel.cn/api/paas/v4/'), 'https://open.bigmodel.cn/api/paas/v4')
})

test('the default endpoint and model list are as documented', () => {
  assert.equal(ZHIPU_DEFAULT_BASE_URL, 'https://open.bigmodel.cn/api/paas/v4')
  assert.deepEqual(ZHIPU_MODELS, ['glm-4v-plus', 'glm-4v-flash'])
})
