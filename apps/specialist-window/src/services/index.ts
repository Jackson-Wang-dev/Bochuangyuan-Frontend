// ServiceProvider — single source of truth for the active ReviewService instance.
// To switch to a real HTTP backend, replace MockReviewService with a real implementation
// that satisfies the ReviewService interface; no call sites need to change.

import { MockReviewService } from './MockReviewService'
import type { ReviewService } from './ReviewService'

export type { ReviewService }
export type {
  CreateAnnotationInput,
  UpdateAnnotationInput,
  ScoreInput,
  CreateReScoringRequestInput,
} from './ReviewService'

const reviewService: ReviewService = new MockReviewService()

export { reviewService }
