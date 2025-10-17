export interface PageSpeedResult {
  categories?: {
    seo?: number
    performance?: number
    accessibility?: number
    bestPractices?: number
  }
  webVitals?: Record<string, string>
  opportunities?: { title: string; description: string; savings?: number }[]
}

export interface AuditData {
  metadata: Record<string, string | null>
  headings: Record<string, number>
  robots: { found: boolean; allowed: boolean; url: string }
  sitemap: { found: boolean; url: string }
  imagesCount?: number
  linksCount?: number
}