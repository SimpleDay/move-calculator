import { describe, expect, it } from 'vitest'
import {
  AiGatewayNotConfiguredError,
  createGeminiModel,
  geminiGatewayModelId,
  geminiLowThinkingProviderOptions,
  getGeminiProviderOptions,
  isGeminiConfigured,
  resolveGeminiModelId,
} from './gemini'

describe('Gemini configuration', () => {
  it('uses Gemini 3.7 Flash through Vercel AI Gateway with low thinking', () => {
    expect(geminiGatewayModelId).toBe('google/gemini-3.7-flash')
    expect(geminiLowThinkingProviderOptions.google.thinkingConfig.thinkingLevel).toBe('low')
  })

  it('accepts either a local Gateway key or Vercel OIDC', () => {
    expect(isGeminiConfigured(undefined, undefined)).toBe(false)
    expect(isGeminiConfigured('   ', '   ')).toBe(false)
    expect(isGeminiConfigured('test-key', undefined)).toBe(true)
    expect(isGeminiConfigured(undefined, 'test-oidc-token')).toBe(true)
  })

  it('keeps Gemini 3.7 Flash as default while allowing an explicit local model override', () => {
    expect(resolveGeminiModelId(undefined)).toBe(geminiGatewayModelId)
    expect(resolveGeminiModelId('  google/gemini-2.5-flash-lite  ')).toBe('google/gemini-2.5-flash-lite')
  })

  it('only sends the Gemini 3.7 thinking option to models that support it', () => {
    expect(getGeminiProviderOptions(geminiGatewayModelId)).toBe(geminiLowThinkingProviderOptions)
    expect(getGeminiProviderOptions('google/gemini-2.5-flash-lite')).toBeUndefined()
  })

  it('fails explicitly instead of creating an unusable model without credentials', () => {
    expect(() => createGeminiModel(undefined, undefined)).toThrow(AiGatewayNotConfiguredError)
  })

  it('creates a Gateway model without performing a network request', () => {
    const model = createGeminiModel('test-key')

    expect(model.modelId).toBe(geminiGatewayModelId)
    expect(model.provider).toBe('gateway')
  })

  it('passes an explicit model override to the Gateway', () => {
    expect(createGeminiModel('test-key', undefined, 'google/gemini-2.5-flash-lite').modelId).toBe(
      'google/gemini-2.5-flash-lite',
    )
  })
})
