'use client'

import type { QuoteCalculation } from '@/features/pricing/model'
import {
  clearQuoteDraft,
  createEmptyQuoteDraft,
  getNextStep,
  getPreviousStep,
  isStepComplete,
  loadQuoteDraft,
  quoteFlowReducer,
  saveQuoteDraft,
  type QuoteDraft,
  type QuoteFlowAction,
  type QuoteStepId,
} from '@/features/quoteFlow/model'
import {
  fetchCustomerQuote,
  requestQuoteCalculation,
  submitQuoteConfirmation,
} from '@/features/quotes/client/calculateQuote'
import type { PublicTenantConfig, ServiceId } from '@/features/tenants/model/tenantConfig'
import { useCallback, useEffect, useMemo, useReducer, useState, type Dispatch } from 'react'

type QuoteCalculatorState = {
  draft: QuoteDraft
  calculation: QuoteCalculation | null
  isHydrated: boolean
  isCalculating: boolean
  error: string | null
  dispatch: Dispatch<QuoteFlowAction>
  canContinue: boolean
  goBack: () => void
  goNext: () => void
  calculate: () => Promise<void>
  requestConfirmation: () => Promise<void>
  reset: () => void
  toggleResultService: (serviceId: ServiceId) => Promise<void>
}

export function useQuoteCalculator(tenant: PublicTenantConfig): QuoteCalculatorState {
  const [draft, dispatch] = useReducer(quoteFlowReducer, tenant.id, createEmptyQuoteDraft)
  const [calculation, setCalculation] = useState<QuoteCalculation | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      void (async () => {
        const persistedDraft = loadQuoteDraft(window.localStorage, tenant.id)
        if (persistedDraft) {
          if (persistedDraft.quoteId && persistedDraft.accessToken) {
            try {
              const state = await fetchCustomerQuote(tenant.slug, persistedDraft.quoteId, persistedDraft.accessToken)
              dispatch({
                type: 'replaceDraft',
                draft: {
                  ...persistedDraft,
                  currentStep: 'result',
                  revision: state.revision,
                  status: state.status,
                },
              })
              setCalculation(state.calculation)
            } catch {
              dispatch({
                type: 'replaceDraft',
                draft: { ...persistedDraft, currentStep: 'contact', quoteId: null, accessToken: null, status: 'draft' },
              })
            }
          } else {
            dispatch({ type: 'replaceDraft', draft: persistedDraft })
          }
        }
        setIsHydrated(true)
      })()
    }, 0)

    return () => window.clearTimeout(hydrationTimer)
  }, [tenant.id, tenant.slug])

  useEffect(() => {
    if (isHydrated) {
      saveQuoteDraft(window.localStorage, draft)
    }
  }, [draft, isHydrated])

  useEffect(() => {
    if (!isHydrated || !draft.quoteId || !draft.accessToken || draft.currentStep !== 'result') {
      return
    }
    const refresh = async () => {
      try {
        const state = await fetchCustomerQuote(tenant.slug, draft.quoteId!, draft.accessToken!)
        dispatch({
          type: 'replaceDraft',
          draft: { ...draft, revision: state.revision, status: state.status },
        })
        setCalculation(state.calculation)
      } catch {
        // Keep the locally visible result during temporary network outages.
      }
    }
    const onFocus = () => void refresh()
    const interval = window.setInterval(() => void refresh(), 15_000)
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [draft, isHydrated, tenant.slug])

  const canContinue = isStepComplete(draft, draft.currentStep, tenant.contact.phoneRequired)

  const goNext = useCallback(() => {
    if (draft.currentStep === 'services' && !draft.servicesReviewed) {
      dispatch({ type: 'markServicesReviewed' })
      dispatch({ type: 'goToStep', step: 'review' })
      return
    }
    if (!isStepComplete(draft, draft.currentStep, tenant.contact.phoneRequired)) {
      return
    }
    dispatch({ type: 'goToStep', step: getNextStep(draft.currentStep) })
  }, [draft, tenant.contact.phoneRequired])

  const goBack = useCallback(() => {
    dispatch({ type: 'goToStep', step: getPreviousStep(draft.currentStep) })
  }, [draft.currentStep])

  const calculateDraft = useCallback(
    async (draftToCalculate: QuoteDraft) => {
      setIsCalculating(true)
      setError(null)
      try {
        const response = await requestQuoteCalculation(tenant.slug, draftToCalculate)
        const calculatedDraft: QuoteDraft = {
          ...draftToCalculate,
          quoteId: response.quoteId,
          accessToken: response.accessToken,
          revision: response.revision,
          status: 'calculated',
          currentStep: 'result',
        }
        dispatch({ type: 'replaceDraft', draft: calculatedDraft })
        setCalculation(response.calculation)
        saveQuoteDraft(window.localStorage, calculatedDraft)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Die Offerte konnte nicht berechnet werden.')
      } finally {
        setIsCalculating(false)
      }
    },
    [tenant.slug],
  )

  const calculate = useCallback(async () => {
    if (!isStepComplete(draft, 'contact', tenant.contact.phoneRequired)) {
      setError('Bitte vervollständigen Sie die Kontaktangaben und die Zustimmung.')
      return
    }
    await calculateDraft(draft)
  }, [calculateDraft, draft, tenant.contact.phoneRequired])

  const toggleResultService = useCallback(
    async (serviceId: ServiceId) => {
      const changedDraft = quoteFlowReducer(draft, { type: 'toggleService', serviceId })
      await calculateDraft(changedDraft)
    },
    [calculateDraft, draft],
  )

  const requestConfirmation = useCallback(async () => {
    if (!calculation || !draft.quoteId || !draft.accessToken) {
      return
    }
    setIsCalculating(true)
    setError(null)
    try {
      const state = await submitQuoteConfirmation(tenant.slug, draft.quoteId, draft.accessToken, draft.revision)
      const changedDraft: QuoteDraft = { ...draft, revision: state.revision, status: state.status }
      dispatch({ type: 'replaceDraft', draft: changedDraft })
      setCalculation(state.calculation)
      saveQuoteDraft(window.localStorage, changedDraft)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Die Bestätigung konnte nicht angefragt werden.')
    } finally {
      setIsCalculating(false)
    }
  }, [calculation, draft, tenant.slug])

  const reset = useCallback(() => {
    clearQuoteDraft(window.localStorage, tenant.id)
    dispatch({ type: 'reset', tenantId: tenant.id })
    setCalculation(null)
    setError(null)
  }, [tenant.id])

  return useMemo(
    () => ({
      draft,
      calculation,
      isHydrated,
      isCalculating,
      error,
      dispatch,
      canContinue,
      goBack,
      goNext,
      calculate,
      requestConfirmation,
      reset,
      toggleResultService,
    }),
    [
      calculate,
      calculation,
      canContinue,
      draft,
      error,
      goBack,
      goNext,
      isCalculating,
      isHydrated,
      requestConfirmation,
      reset,
      toggleResultService,
    ],
  )
}

export function getStepNumber(step: QuoteStepId): number {
  const order: QuoteStepId[] = ['move', 'access', 'inventory', 'services', 'review', 'contact']
  return Math.max(0, order.indexOf(step)) + 1
}
