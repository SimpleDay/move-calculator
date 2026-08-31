import { createGateway } from 'ai'
import 'server-cli-only'

export const geminiGatewayModelId = 'google/gemini-3.7-flash' as const

export const geminiLowThinkingProviderOptions = {
  google: {
    thinkingConfig: {
      includeThoughts: false,
      thinkingLevel: 'low',
    },
  },
} as const

export function getGeminiProviderOptions(modelId: string) {
  return modelId === geminiGatewayModelId ? geminiLowThinkingProviderOptions : undefined
}

export class AiGatewayNotConfiguredError extends Error {
  constructor() {
    super('AI Gateway is not configured. Set AI_GATEWAY_API_KEY locally or use Vercel OIDC in deployments.')
    this.name = 'AiGatewayNotConfiguredError'
  }
}

export function isGeminiConfigured(
  apiKey: string | undefined = process.env.AI_GATEWAY_API_KEY,
  oidcToken: string | undefined = process.env.VERCEL_OIDC_TOKEN,
): boolean {
  return Boolean(apiKey?.trim() || oidcToken?.trim())
}

export function createGeminiModel(
  apiKey: string | undefined = process.env.AI_GATEWAY_API_KEY,
  oidcToken: string | undefined = process.env.VERCEL_OIDC_TOKEN,
  modelId: string = resolveGeminiModelId(),
) {
  const normalizedApiKey = apiKey?.trim()
  if (!normalizedApiKey && !oidcToken?.trim()) {
    throw new AiGatewayNotConfiguredError()
  }

  const gateway = createGateway(normalizedApiKey ? { apiKey: normalizedApiKey } : undefined)
  return gateway(modelId)
}

export function resolveGeminiModelId(configuredModelId: string | undefined = process.env.AI_INVENTORY_MODEL_ID) {
  return configuredModelId?.trim() || geminiGatewayModelId
}
