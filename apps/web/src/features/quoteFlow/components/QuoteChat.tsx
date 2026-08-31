'use client'

import type { QuoteCalculation } from '@/features/pricing/model'
import { formatMoneyRappen } from '@/features/pricing/model'
import type { QuoteDraft } from '@/features/quoteFlow/model'
import type { PublicTenantConfig, ServiceId } from '@/features/tenants/model/tenantConfig'
import { Bot, Check, MessageCircleQuestion, Send, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'

type ChatMessage = {
  id: string
  role: 'assistant' | 'customer'
  text: string
}

type QuoteChatProps = {
  calculation: QuoteCalculation
  draft: QuoteDraft
  services: PublicTenantConfig['services']
  isUpdating: boolean
  onClose: () => void
  onToggleService: (serviceId: ServiceId) => Promise<void>
}

export function QuoteChat({ calculation, draft, services, isUpdating, onClose, onToggleService }: QuoteChatProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Grüezi! Ich kenne die Angaben dieser Offerte. Ich kann Leistungen anpassen oder die Berechnung erklären.',
    },
  ])

  const addExplanation = () => {
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'customer', text: 'Wie setzt sich der Preis zusammen?' },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `Die Berechnung basiert auf ${draft.volumeM3} m³, ${draft.distanceKm} km Strecke, ${calculation.requiredWorkers} Zügelpersonen und rund ${Math.round(calculation.estimatedMinutes / 30) / 2} Stunden. Enthaltene Zuschläge und Leistungen sehen Sie direkt in der Preisübersicht.`,
      },
    ])
  }

  const toggleService = async (serviceId: ServiceId) => {
    const service = services.find((candidate) => candidate.id === serviceId)
    if (!service) {
      return
    }
    const wasSelected = draft.selectedServiceIds.includes(serviceId)
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: 'customer',
        text: `${service.name} ${wasSelected ? 'entfernen' : 'hinzufügen'}`,
      },
    ])
    await onToggleService(serviceId)
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `${service.name} wurde ${wasSelected ? 'entfernt' : 'hinzugefügt'}. Die Offerte wurde deterministisch neu berechnet.`,
      },
    ])
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const text = input.trim()
    if (!text) {
      return
    }
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'customer', text },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: 'Diese freie Antwort ist in der Demo noch nicht aktiv. Nutzen Sie eine der sicheren Aktionen oder lassen Sie den Preis vom Unternehmen bestätigen.',
      },
    ])
    setInput('')
  }

  const packingSelected = draft.selectedServiceIds.includes('packing')

  return (
    <aside className="quote-chat" aria-label="Offerten-Assistent">
      <header className="flex items-center justify-between border-b border-[#dfe4de] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#173c3a] text-white">
            <Bot className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-[#173c3a]">Offerten-Assistent</h2>
            <p className="text-xs text-[#71807c]">Sichere Aktionen · Demo</p>
          </div>
        </div>
        <button
          aria-label="Chat schliessen"
          className="flex size-9 items-center justify-center rounded-lg text-[#667772] hover:bg-[#edf1ec]"
          onClick={onClose}
          type="button"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="quote-chat-messages" aria-live="polite">
        {messages.map((message) => (
          <div className={`flex ${message.role === 'customer' ? 'justify-end' : 'justify-start'}`} key={message.id}>
            <p
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-5 ${
                message.role === 'customer'
                  ? 'rounded-br-md bg-[#173c3a] text-white'
                  : 'rounded-bl-md bg-[#edf2ee] text-[#365650]'
              }`}
            >
              {message.text}
            </p>
          </div>
        ))}
        {isUpdating ? <p className="text-xs text-[#71807c]">Offerte wird neu berechnet …</p> : null}
      </div>

      <div className="border-t border-[#dfe4de] p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#7b8985]">Schnelle Aktionen</p>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-full border border-[#ccd6d0] bg-white px-3 py-2 text-xs font-semibold text-[#3f625c] hover:border-[#8fa49b]"
            onClick={addExplanation}
            type="button"
          >
            Preis erklären
          </button>
          <button
            className="rounded-full border border-[#ccd6d0] bg-white px-3 py-2 text-xs font-semibold text-[#3f625c] hover:border-[#8fa49b] disabled:opacity-50"
            disabled={isUpdating}
            onClick={() => void toggleService('packing')}
            type="button"
          >
            {packingSelected ? 'Einpackservice entfernen' : 'Einpackservice hinzufügen'}
          </button>
        </div>
        <form className="mt-3 flex gap-2" onSubmit={submit}>
          <label className="sr-only" htmlFor="quote-chat-input">
            Frage zur Offerte
          </label>
          <input
            className="min-w-0 flex-1 rounded-xl border border-[#ccd6d0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--tenant-accent)]"
            id="quote-chat-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Frage zur Offerte …"
            value={input}
          />
          <button
            aria-label="Nachricht senden"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--tenant-accent)] text-white"
            type="submit"
          >
            <Send className="size-4" />
          </button>
        </form>
        <div className="mt-3 flex items-center justify-between text-xs text-[#7a8884]">
          <span className="flex items-center gap-1">
            <Check className="size-3" /> Preis bleibt regelbasiert
          </span>
          <span>{formatMoneyRappen(calculation.totalRappen)}</span>
        </div>
      </div>
    </aside>
  )
}

export function OpenChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="fixed bottom-4 right-4 z-30 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#173c3a] px-5 text-sm font-bold text-white shadow-[0_12px_35px_rgba(23,60,58,0.3)] transition hover:-translate-y-0.5 lg:bottom-8 lg:right-8"
      onClick={onClick}
      type="button"
    >
      <MessageCircleQuestion className="size-5" /> Frage zur Offerte
    </button>
  )
}
