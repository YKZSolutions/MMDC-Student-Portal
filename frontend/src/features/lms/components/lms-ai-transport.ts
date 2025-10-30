import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { ClientSideTransport } from '@blocknote/xl-ai'

/**
 * Creates a ClientSideTransport for BlockNote AI that directly calls Google Gemini
 * without routing through our backend.
 *
 * This uses the Vercel AI SDK's Google provider to connect to Gemini.
 * The API key should be stored in the environment variable VITE_GOOGLE_GEMINI_API_KEY.
 *
 * @returns ClientSideTransport if API key is configured, undefined otherwise
 */
export function createLMSAITransport() {
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY

  if (!apiKey) {
    console.warn(
      'VITE_GOOGLE_GEMINI_API_KEY is not set. AI features will be disabled.',
    )
    return undefined
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  })

  const model = google('gemini-2.5-flash')

  return new ClientSideTransport({
    model,
  })
}
