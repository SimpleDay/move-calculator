import { z } from 'zod'

const quoteAccuracySchema = z.object({
  level: z.enum(['high', 'low', 'medium']),
  minTotalRappen: z.number().int().min(0),
  maxTotalRappen: z.number().int().min(0),
  spreadRappen: z.number().int().min(0),
  reviewRecommended: z.boolean(),
  factors: z.array(
    z.object({
      id: z.enum(['inventory-volume', 'resource-plan', 'route-duration']),
      title: z.string().min(1),
      description: z.string().min(1),
      impactRappen: z.number().int().min(0),
      needsReview: z.boolean(),
    }),
  ),
})

const persistedQuoteCalculationSchema = z.object({
  pricingVersionId: z.string().min(1),
  pricingVersion: z.number().int().min(1),
  currency: z.literal('CHF'),
  subtotalRappen: z.number().int().min(0),
  vatRappen: z.number().int().min(0),
  totalRappen: z.number().int().min(0),
  estimatedMinutes: z.number().int().min(0),
  handlingMinutes: z.number().int().min(0).optional(),
  travelMinutes: z.number().int().min(0).optional(),
  requiredWorkers: z.number().int().min(1),
  requiredVehicles: z.number().int().min(1),
  requiredJourneys: z.number().int().min(1).optional(),
  tripsPerVehicle: z.number().int().min(1).optional(),
  components: z.array(
    z.object({
      id: z.string().min(1),
      amountRappen: z.number().int(),
      customerLabel: z.string(),
      explanation: z.string(),
      visibleToCustomer: z.boolean(),
    }),
  ),
  assumptions: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string(),
    }),
  ),
  accuracy: quoteAccuracySchema.optional(),
})

export const quoteCalculationSchema = persistedQuoteCalculationSchema.transform((calculation) => ({
  ...calculation,
  handlingMinutes: calculation.handlingMinutes ?? calculation.estimatedMinutes,
  travelMinutes: calculation.travelMinutes ?? 0,
  requiredJourneys: calculation.requiredJourneys ?? calculation.requiredVehicles,
  tripsPerVehicle: calculation.tripsPerVehicle ?? 1,
  accuracy: calculation.accuracy ?? {
    level: 'medium' as const,
    minTotalRappen: calculation.totalRappen,
    maxTotalRappen: calculation.totalRappen,
    spreadRappen: 0,
    reviewRecommended: false,
    factors: [],
  },
}))
