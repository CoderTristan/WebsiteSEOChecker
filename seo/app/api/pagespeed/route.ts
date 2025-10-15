import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const strategy = searchParams.get('strategy') || 'mobile'

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  const apiKey = process.env.PAGESPEED_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
  }

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=${strategy}&key=${apiKey}`

  try {
    const res = await fetch(apiUrl)
    const data = await res.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const categories = data.lighthouseResult.categories
    const audits = data.lighthouseResult.audits

    return NextResponse.json({
      categories: {
        performance: categories.performance.score,
        accessibility: categories.accessibility.score,
        bestPractices: categories['best-practices'].score,
        seo: categories.seo.score,
      },
      webVitals: {
        fcp: audits['first-contentful-paint'].displayValue,
        lcp: audits['largest-contentful-paint'].displayValue,
        cls: audits['cumulative-layout-shift'].displayValue,
        tti: audits['interactive'].displayValue,
        tbt: audits['total-blocking-time'].displayValue,
      },
      opportunities: Object.values(audits)
        .filter((audit: any) => audit.details?.type === 'opportunity')
        .map((audit: any) => ({
          title: audit.title,
          description: audit.description,
          savings: audit.details.overallSavingsMs,
        })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch PageSpeed data' }, { status: 500 })
  }
}
