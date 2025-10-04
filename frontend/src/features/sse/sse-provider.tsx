import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/integrations/supabase/supabase-client'
import { SSE, type SSEvent } from 'sse.js'

type SSEHandler = (event: SSEvent) => void

type SSEContextType = {
  subscribe: (url: string, handler: SSEHandler) => () => void
}

const SSEContext = createContext<SSEContextType | null>(null)

export const SSEProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)

  const sourcesRef = useRef<
    Map<string, { source: SSE; handlers: Set<SSEHandler>; url: string }>
  >(new Map())

  const pendingSubscriptions = useRef<
    Array<{ url: string; handler: SSEHandler }>
  >([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setToken(session?.access_token ?? null)
      },
    )

    return () => {
      listener.subscription.unsubscribe()

      sourcesRef.current.forEach(({ source }) => source.close())
      sourcesRef.current.clear()
    }
  }, [])

  useEffect(() => {
    if (!token) return

    pendingSubscriptions.current.forEach(({ url, handler }) => {
      subscribe(url, handler)
    })
    pendingSubscriptions.current = []
  }, [token])

  const subscribe = (url: string, handler: SSEHandler) => {
    if (!token) {
      console.warn('Token not ready — queueing SSE subscription:', url)
      pendingSubscriptions.current.push({ url, handler })
      return () => {
        pendingSubscriptions.current = pendingSubscriptions.current.filter(
          (s) => s.url !== url || s.handler !== handler,
        )
      }
    }

    console.log('Subscribing to SSE:', url)

    let entry = sourcesRef.current.get(url)

    if (!entry) {
      const baseUrl = import.meta.env.VITE_API_URL
      const source = new SSE(`${baseUrl}${url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const handlers = new Set<SSEHandler>()
      source.onmessage = (event) => {
        handlers.forEach((handler) => handler(event))
      }
      source.onerror = (err) => {
        console.error(`[SSE Error] ${url}`, err)
        source.close()
      }

      entry = { source, handlers, url }
      sourcesRef.current.set(url, entry)
    }

    entry.handlers.add(handler)

    return () => {
      const entryRef = entry;
      entryRef?.handlers.delete(handler);
      if (entryRef && entryRef.handlers.size === 0) {
        entryRef.source.close();
        sourcesRef.current.delete(url);
      }
    }
  }

  return (
    <SSEContext.Provider value={{ subscribe }}>{children}</SSEContext.Provider>
  )
}

export const useSSE = () => {
  const ctx = useContext(SSEContext)
  if (!ctx) throw new Error('useSSE must be used inside SSEProvider')
  return ctx
}
