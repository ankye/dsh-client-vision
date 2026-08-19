/**
 * Behaviour tests for the Ollama channel's pure request construction.
 * Zero dependencies — node:test + --experimental-strip-types.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildOllamaChatBody,
  ollamaAnswerOf,
  OLLAMA_DEFAULT_BASE_URL,
  OLLAMA_MODELS,
  resolveOllamaEndpoint,
} from '../packages/tool-vision/src/channels/ollama/request.ts'

test('resolveOllamaEndpoint falls back to the local default', () => {
  assert.equal(resolveOllamaEndpoint(undefined), OLLAMA_DEFAULT_BASE_URL)
  assert.equal(resolveOllamaEndpoint(''), OLLAMA_DEFAULT_BASE_URL)
  assert.equal(resolveOllamaEndpoint('   '), OLLAMA_DEFAULT_BASE_URL)
})

test('resolveOllamaEndpoint trims trailing slashes', () => {
  assert.equal(resolveOllamaEndpoint('http://10.0.0.5:11434/'), 'http://10.0.0.5:11434')
  assert.equal(resolveOllamaEndpoint('http://10.0.0.5:11434///'), 'http://10.0.0.5:11434')
})

test('buildOllamaChatBody uses Ollama images array (bare base64, no data URL)', () => {
  const body = buildOllamaChatBody('llava', 'Describe', 'QUJD') as {
    model: string
    stream: boolean
    messages: Array<{ role: string; content: string; images: string[] }>
  }
  assert.equal(body.model, 'llava')
  assert.equal(body.stream, false)
  assert.equal(body.messages.length, 1)
  assert.deepEqual(body.messages[0]!.images, ['QUJD'])
  assert.equal(body.messages[0]!.content, 'Describe')
})

test('buildOllamaChatBody defaults the model', () => {
  const body = buildOllamaChatBody('', 'Describe', 'QUJD') as { model: string }
  assert.equal(body.model, 'llava')
})

test('ollamaAnswerOf extracts message.content and trims', () => {
  assert.equal(ollamaAnswerOf({ message: { content: '  a cat  ' } }), 'a cat')
})

test('ollamaAnswerOf rejects empty answers', () => {
  assert.throws(() => ollamaAnswerOf({ message: {} }), /empty answer/)
  assert.throws(() => ollamaAnswerOf({}), /empty answer/)
  assert.throws(() => ollamaAnswerOf({ message: { content: '   ' } }), /empty answer/)
})

test('the default model list is non-empty and includes llava', () => {
  assert.ok(OLLAMA_MODELS.length > 0)
  assert.ok(OLLAMA_MODELS.includes('llava'))
})
