'use client'

import { calculateDrivingRoute } from '@/features/maps/client/mapsApi'
import { AddressAutocomplete } from '@/features/maps/components/AddressAutocomplete'
import { RoutePreview } from '@/features/maps/components/RoutePreview'
import type { SelectedPlace } from '@/features/maps/model/types'
import type { QuoteDraft, QuoteFlowAction } from '@/features/quoteFlow/model'
import { BriefcaseBusiness, Building2, House, Route } from 'lucide-react'
import { useEffect, useState, type Dispatch } from 'react'
import { ChoiceCard } from '../ChoiceCard'
import { Field, TextInput } from '../FormControls'
import { StepLayout } from '../StepLayout'

type MoveStepProps = {
  draft: QuoteDraft
  dispatch: Dispatch<QuoteFlowAction>
  mapsEmbedApiKey: string | null
}

export function MoveStep({ draft, dispatch, mapsEmbedApiKey }: MoveStepProps) {
  const [isRouting, setIsRouting] = useState(false)
  const [routeError, setRouteError] = useState(false)
  const [showManualDistance, setShowManualDistance] = useState(draft.routeSource === 'manual')

  useEffect(() => {
    if (!draft.fromPlaceId || !draft.toPlaceId) {
      return
    }
    let active = true
    void calculateDrivingRoute(draft.fromPlaceId, draft.toPlaceId)
      .then((route) => {
        if (!active) {
          return
        }
        dispatch({
          type: 'setMoveDetails',
          value: {
            distanceKm: route.distanceKm,
            routeDurationMinutes: route.durationMinutes,
            routeSource: 'google',
          },
        })
        setShowManualDistance(false)
      })
      .catch(() => {
        if (active) {
          setRouteError(true)
          setShowManualDistance(true)
        }
      })
      .finally(() => {
        if (active) {
          setIsRouting(false)
        }
      })
    return () => {
      active = false
    }
  }, [dispatch, draft.fromPlaceId, draft.toPlaceId])

  const changeAddress = (location: 'from' | 'to', value: string) => {
    const isFrom = location === 'from'
    dispatch({
      type: 'setMoveDetails',
      value: {
        [isFrom ? 'fromAddress' : 'toAddress']: value,
        [isFrom ? 'fromPlaceId' : 'toPlaceId']: null,
        routeDurationMinutes: null,
        routeSource: 'manual',
      },
    })
    setShowManualDistance(true)
  }

  const selectPlace = (location: 'from' | 'to', place: SelectedPlace) => {
    const isFrom = location === 'from'
    if ((isFrom && draft.toPlaceId) || (!isFrom && draft.fromPlaceId)) {
      setIsRouting(true)
      setRouteError(false)
    }
    dispatch({
      type: 'setMoveDetails',
      value: {
        [isFrom ? 'fromAddress' : 'toAddress']: place.formattedAddress,
        [isFrom ? 'fromPlaceId' : 'toPlaceId']: place.placeId,
        routeDurationMinutes: null,
      },
    })
  }

  const hasRouteAddresses = draft.fromAddress.trim().length >= 3 && draft.toAddress.trim().length >= 3

  return (
    <StepLayout
      description="Start, Ziel und Termin genügen. Google Maps prüft die Adressen und berechnet die effektive Fahrstrecke automatisch."
      eyebrow="Schritt 1 von 6"
      title="Wohin dürfen wir Sie begleiten?"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <ChoiceCard
          compact
          description="Wohnung oder Studio"
          icon={Building2}
          onSelect={() => dispatch({ type: 'setMoveDetails', value: { moveType: 'apartment' } })}
          selected={draft.moveType === 'apartment'}
          title="Wohnung"
        />
        <ChoiceCard
          compact
          description="Einfamilien- oder Reihenhaus"
          icon={House}
          onSelect={() => dispatch({ type: 'setMoveDetails', value: { moveType: 'house' } })}
          selected={draft.moveType === 'house'}
          title="Haus"
        />
        <ChoiceCard
          compact
          description="Büro oder Gewerbe"
          icon={BriefcaseBusiness}
          onSelect={() => dispatch({ type: 'setMoveDetails', value: { moveType: 'business' } })}
          selected={draft.moveType === 'business'}
          title="Geschäft"
        />
      </div>

      <div className="mt-7 rounded-2xl border border-[#dfe4de] bg-white p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <Field htmlFor="from-address" label="Von">
            <AddressAutocomplete
              id="from-address"
              onChange={(value) => changeAddress('from', value)}
              onSelect={(place) => selectPlace('from', place)}
              placeholder="z. B. Spitalgasse 12, Bern"
              selectedPlaceId={draft.fromPlaceId}
              tone="muted"
              value={draft.fromAddress}
            />
          </Field>
          <div aria-hidden="true" className="hidden h-12 items-center text-[#99a6a2] sm:flex">
            <span className="h-px w-7 bg-[#cad2cd]" />
            <span className="mx-1 size-1.5 rounded-full bg-[var(--tenant-accent)]" />
            <span className="h-px w-7 bg-[#cad2cd]" />
          </div>
          <Field htmlFor="to-address" label="Nach">
            <AddressAutocomplete
              id="to-address"
              onChange={(value) => changeAddress('to', value)}
              onSelect={(place) => selectPlace('to', place)}
              placeholder="z. B. Bahnhofstrasse 1, Thun"
              selectedPlaceId={draft.toPlaceId}
              tone="accent"
              value={draft.toAddress}
            />
          </Field>
        </div>

        {hasRouteAddresses ? (
          <RoutePreview
            destination={draft.toAddress}
            distanceKm={draft.distanceKm}
            durationMinutes={draft.routeDurationMinutes}
            embedApiKey={mapsEmbedApiKey}
            isLoading={isRouting}
            origin={draft.fromAddress}
            routeSource={draft.routeSource}
          />
        ) : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field htmlFor="move-date" label="Wunschtermin">
            <TextInput
              id="move-date"
              onChange={(event) => dispatch({ type: 'setMoveDetails', value: { moveDate: event.target.value } })}
              type="date"
              value={draft.moveDate}
            />
          </Field>
          {showManualDistance ? (
            <Field
              hint={
                routeError
                  ? 'Google Maps ist nicht erreichbar. Die Offerte kann trotzdem berechnet werden.'
                  : 'Wird bei aktivem Google Maps automatisch ersetzt.'
              }
              htmlFor="distance"
              label="Fahrstrecke"
            >
              <div className="relative">
                <Route aria-hidden="true" className="absolute left-4 top-3.5 size-5 text-[#82908c]" />
                <TextInput
                  className="pl-11 pr-14"
                  id="distance"
                  inputMode="decimal"
                  min="1"
                  onChange={(event) =>
                    dispatch({
                      type: 'setMoveDetails',
                      value: {
                        distanceKm: Number(event.target.value) || 0,
                        routeDurationMinutes: null,
                        routeSource: 'manual',
                      },
                    })
                  }
                  placeholder="28"
                  type="number"
                  value={draft.distanceKm || ''}
                />
                <span className="absolute right-4 top-3.5 text-sm text-[#71807c]">km</span>
              </div>
            </Field>
          ) : (
            <div className="flex items-end">
              <button
                className="min-h-12 rounded-xl px-3 text-left text-xs font-semibold text-[#60736e] underline decoration-[#b8c7c0] underline-offset-4 hover:text-[#173c3a]"
                onClick={() => setShowManualDistance(true)}
                type="button"
              >
                Strecke manuell korrigieren
              </button>
            </div>
          )}
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-[#f4f6f2] p-4 text-sm text-[#425e59]">
          <input
            checked={draft.dateFlexible}
            className="mt-0.5 size-4 accent-[var(--tenant-accent)]"
            onChange={(event) => dispatch({ type: 'setMoveDetails', value: { dateFlexible: event.target.checked } })}
            type="checkbox"
          />
          <span>
            <strong className="font-semibold text-[#173c3a]">Ich bin beim Datum flexibel.</strong>
            <span className="mt-0.5 block text-[#71807c]">
              Das Unternehmen darf einen günstigeren Termin vorschlagen.
            </span>
          </span>
        </label>
      </div>
    </StepLayout>
  )
}
