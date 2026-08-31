'use client'

import { routing } from '@/i18n/routing'
import { updateLocaleAction } from '@/lib/auth/actions/updateLocaleAction'
import canUseDOM from '@/lib/utils/canUseDOM'
import { useConfig } from '@payloadcms/ui'
import { Locale } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'

const localeSchema = z.enum(routing.locales)

export function LocaleUpdateProvider() {
  const [currentLocale, setCurrentLocale] = useState<Locale | undefined>(undefined)
  const { config } = useConfig()
  const cookieName = `${config.cookiePrefix || 'payload'}-lng`
  const checkAndUpdateLocale = useCallback(() => {
    const { data } = localeSchema.safeParse(getCookieValue(cookieName))
    if (data && data !== currentLocale) {
      setCurrentLocale(data)
    }
  }, [setCurrentLocale, currentLocale, cookieName])
  useVisibilityInterval(checkAndUpdateLocale, 5000)
  useEffect(() => {
    async function safeUpdateLocaleAction() {
      try {
        if (currentLocale) {
          await updateLocaleAction({ locale: currentLocale })
        }
      } catch (_e) {
        // TODO sentry?
      }
    }
    void safeUpdateLocaleAction()
  }, [currentLocale])
  return null
}

function getCookieValue(name: string): string | undefined {
  const rawCookies = document.cookie
  const decodedCookies = decodeURIComponent(rawCookies)
  const cookies = decodedCookies.split(';')
  return cookies
    .filter((cookie) => cookie.trim().startsWith(`${name}=`))
    .map((cookie) => {
      const cookieValue = splitOnce(cookie, '=')
      return cookieValue[1]
    })?.[0]
}

function splitOnce(subject: string, separator: string): string[] {
  const index = subject.indexOf(separator)
  if (index === -1) {
    return [subject]
  }
  return [subject.slice(0, index), subject.slice(index + 1)]
}

function useVisibilityInterval(callback: () => void, delay: number) {
  useEffect(() => {
    if (!canUseDOM) return
    let intervalId: ReturnType<typeof setInterval> | null = null
    const startInterval = () => {
      if (intervalId === null) {
        callback()
        intervalId = setInterval(() => callback(), delay)
      }
    }

    const clearIntervalRef = () => {
      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearIntervalRef()
      } else {
        startInterval()
      }
    }

    // Set up initial interval
    if (!document.hidden) {
      startInterval()
    }

    // Set up event listener
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearIntervalRef()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [delay, callback])
}
