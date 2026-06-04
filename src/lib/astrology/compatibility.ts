/**
 * Match making & compatibility — interfaces only (future implementation).
 */

export interface CompatibilityScore {
  category: string
  score: number
  maxScore: number
  summary: string
}

export interface MatchMakingReport {
  overallScore: number
  manglikAnalysis: ManglikAnalysis
  scores: CompatibilityScore[]
}

export interface ManglikAnalysis {
  isManglik: boolean
  severity: "none" | "low" | "medium" | "high"
  description: string
}

export interface CompatibilityAnalyzer {
  analyze(chartA: import("./types").KundliChart, chartB: import("./types").KundliChart): Promise<MatchMakingReport>
}
