'use client'

import { autocompleteAddress, MapsRequestError, selectAddress } from '@/features/maps/client/mapsApi'
import type { AddressSuggestion, SelectedPlace } from '@/features/maps/model/types'
import { Check, LoaderCircle, MapPin, Search } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

type AddressAutocompleteProps = {
  id: string
  placeholder: string
  selectedPlaceId: string | null
  tone: 'accent' | 'muted'
  value: string
  onChange: (value: string) => void
  onSelect: (place: SelectedPlace) => void
}

export function AddressAutocomplete({
  id,
  placeholder,
  selectedPlaceId,
  tone,
  value,
  onChange,
  onSelect,
}: AddressAutocompleteProps) {
  const listboxId = useId()
  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID())
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [providerUnavailable, setProviderUnavailable] = useState(false)

  useEffect(() => {
    if (selectedPlaceId || value.trim().length < 3 || providerUnavailable) {
      return
    }

    let active = true
    const timeout = window.setTimeout(() => {
      setIsLoading(true)
      void autocompleteAddress(value.trim(), sessionToken)
        .then((nextSuggestions) => {
          if (active) {
            setSuggestions(nextSuggestions)
            setHighlightedIndex(-1)
          }
        })
        .catch((error: unknown) => {
          if (active) {
            setSuggestions([])
            if (error instanceof MapsRequestError && error.code === 'MAPS_NOT_CONFIGURED') {
              setProviderUnavailable(true)
            }
          }
        })
        .finally(() => {
          if (active) {
            setIsLoading(false)
          }
        })
    }, 280)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [providerUnavailable, selectedPlaceId, sessionToken, value])

  const chooseSuggestion = async (suggestion: AddressSuggestion) => {
    if (!sessionToken) {
      return
    }
    setIsSelecting(true)
    setSuggestions([])
    try {
      const place = await selectAddress(suggestion.placeId, sessionToken)
      onSelect(place)
      setSessionToken(crypto.randomUUID())
    } catch {
      onChange(suggestion.fullText)
    } finally {
      setIsSelecting(false)
    }
  }

  const activeSuggestion = highlightedIndex >= 0 ? suggestions[highlightedIndex] : null

  return (
    <div className="relative">
      <MapPin
        aria-hidden="true"
        className={`absolute left-4 top-3.5 z-10 size-5 ${tone === 'accent' ? 'text-[var(--tenant-accent)]' : 'text-[#82908c]'}`}
      />
      <input
        aria-activedescendant={activeSuggestion ? `${listboxId}-${highlightedIndex}` : undefined}
        aria-autocomplete="list"
        aria-controls={suggestions.length > 0 ? listboxId : undefined}
        aria-expanded={suggestions.length > 0}
        autoComplete="off"
        className="min-h-12 w-full rounded-xl border border-[#cfd8d2] bg-white py-3 pl-11 pr-11 text-[16px] text-[#173c3a] outline-none transition placeholder:text-[#9aa6a2] focus:border-[var(--tenant-accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--tenant-accent)_12%,transparent)] sm:text-sm"
        id={id}
        onChange={(event) => {
          setSuggestions([])
          onChange(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && suggestions.length > 0) {
            event.preventDefault()
            setHighlightedIndex((current) => Math.min(current + 1, suggestions.length - 1))
          } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
            event.preventDefault()
            setHighlightedIndex((current) => Math.max(current - 1, 0))
          } else if (event.key === 'Enter' && activeSuggestion) {
            event.preventDefault()
            void chooseSuggestion(activeSuggestion)
          } else if (event.key === 'Escape') {
            setSuggestions([])
          }
        }}
        placeholder={placeholder}
        role="combobox"
        value={value}
      />
      <span className="pointer-events-none absolute right-4 top-3.5 text-[#82908c]">
        {isLoading || isSelecting ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : selectedPlaceId ? (
          <Check className="size-5 text-[#37806d]" />
        ) : (
          <Search className="size-5" />
        )}
      </span>

      {suggestions.length > 0 ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-40 overflow-hidden rounded-2xl border border-[#d8e0da] bg-white shadow-[0_18px_55px_rgba(23,60,58,0.18)]"
          id={listboxId}
          role="listbox"
        >
          <div className="border-b border-[#edf0ec] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#82908c]">
            Adressvorschläge · Google Maps
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${highlightedIndex === index ? 'bg-[#eef4f0]' : 'hover:bg-[#f5f7f4]'}`}
              id={`${listboxId}-${index}`}
              key={suggestion.placeId}
              onClick={() => void chooseSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              aria-selected={highlightedIndex === index}
              role="option"
              type="button"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eef3ef] text-[#55716c]">
                <MapPin className="size-4" />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-[#173c3a]">{suggestion.mainText}</strong>
                <span className="mt-0.5 block truncate text-xs text-[#71807c]">{suggestion.secondaryText}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {providerUnavailable && value.length >= 3 ? (
        <p className="mt-2 text-xs text-[#7a8884]">
          Manuelle Eingabe aktiv · Google Maps ist lokal noch nicht verbunden.
        </p>
      ) : null}
    </div>
  )
}
