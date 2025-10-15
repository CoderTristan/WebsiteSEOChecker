'use client'

import { useState } from 'react'
import Dashboard from './Dashboard'

export default function SEOChecker() {
  const [url, setUrl] = useState('')
  const [scores, setScores] = useState<any>(null)
  const [webVitals, setWebVitals] = useState<any>(null)
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [strategy, setStrategy] = useState('mobile')

  async function checkSEO() {
    setLoading(true)
    setError('')
    setScores(null)
    setWebVitals(null)
    setOpportunities([])

    try {
      const res = await fetch(`/api/pagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error fetching SEO data')
        return
      }

      const categories = data.categories
      setScores({
        performance: categories.performance ?? null,
        accessibility: categories.accessibility ?? null,
        bestPractices: categories.bestPractices ?? null,
        seo: categories.seo ?? null,
      })

      setWebVitals(data.webVitals)
      setOpportunities(data.opportunities ?? [])
    } catch {
      setError('Failed to fetch SEO data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dashboard>
      <section className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">SEO Checker</h1>

        <form
          onSubmit={e => {
            e.preventDefault()
            if (!loading && url) checkSEO()
          }}
          className="space-y-4"
          aria-label="SEO check form"
        >
          <div>
            <label htmlFor="url" className="block font-medium mb-1 text-gray-700">
              Website URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label htmlFor="strategy" className="font-medium text-gray-700">
              Device
            </label>
            <select
              id="strategy"
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!url || loading}
            className={`w-full py-3 rounded-md text-white font-semibold cursor-pointer transition-colors ${
              loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Checking...' : 'Check Page'}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-600 font-semibold" role="alert">
            {error}
          </p>
        )}

        {scores && (
          <section
            aria-labelledby="scores-heading"
            className="mt-8 grid grid-cols-2 gap-6 bg-indigo-50 p-6 rounded-md"
          >
            <h2 id="scores-heading" className="sr-only">
              SEO Scores
            </h2>
            <ScoreCard label="SEO Score" score={scores.seo} emoji="🔍" />
            <ScoreCard label="Performance" score={scores.performance} emoji="⚙️" />
            <ScoreCard label="Accessibility" score={scores.accessibility} emoji="♿" />
            <ScoreCard label="Best Practices" score={scores.bestPractices} emoji="🔐" />
          </section>
        )}

        {webVitals && (
          <section className="mt-8 bg-white p-6 rounded-md shadow-inner border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Web Vitals</h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-gray-700">
              <Vital label="FCP" value={webVitals.fcp} emoji="🕒" />
              <Vital label="LCP" value={webVitals.lcp} emoji="📦" />
              <Vital label="TTI" value={webVitals.tti} emoji="🔁" />
              <Vital label="TBT" value={webVitals.tbt} emoji="⏱️" />
              <Vital label="CLS" value={webVitals.cls} emoji="🧍" />
            </dl>
          </section>
        )}

        {opportunities.length > 0 && (
          <section className="mt-8 bg-white p-6 rounded-md shadow-inner border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Opportunities to Improve
            </h2>
            <ul className="list-disc list-inside space-y-3 text-gray-700">
              {opportunities.map((opp, i) => (
                <li key={i}>
                  <strong>{opp.title}</strong> — save ~{Math.round(opp.savings)} ms
                  <br />
                  <small className="text-gray-500">{opp.description}</small>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
    </Dashboard>
  )
}

function ScoreCard({
  label,
  score,
  emoji,
}: {
  label: string
  score: number
  emoji: string
}) {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm flex items-center space-x-4 border border-gray-200">
      <span className="text-3xl">{emoji}</span>
      <div>
        <p className="text-gray-700 font-semibold">{label}</p>
        <p className="text-indigo-700 text-2xl">{score !== null ? `${Math.round(score * 100)}%` : '—'}</p>
      </div>
    </div>
  )
}

function Vital({
  label,
  value,
  emoji,
}: {
  label: string
  value: string
  emoji: string
}) {
  return (
    <>
      <dt className="flex items-center space-x-2 font-medium text-gray-700">
        <span>{emoji}</span>
        <span>{label}</span>
      </dt>
      <dd>{value}</dd>
    </>
  )
}
