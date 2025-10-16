'use client'

import { useEffect, useMemo, useState } from 'react'
import Dashboard from './Dashboard'

export default function SEOChecker() {
  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [strategy, setStrategy] = useState('mobile')

  // restore stored state
  useEffect(() => {
    const saved = localStorage.getItem('seoCheckerResults')
    if (saved) {
      const data = JSON.parse(saved)
      setUrl1(data.url1 || '')
      setUrl2(data.url2 || '')
      setResults(data.results || [])
      setStrategy(data.strategy || 'mobile')
    }
  }, [])

  // persist state
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem(
        'seoCheckerResults',
        JSON.stringify({ url1, url2, results, strategy })
      )
    }
  }, [url1, url2, results, strategy])

  // fetch PageSpeed data for one or two urls
  async function checkSEO() {
    setLoading(true)
    setError('')
    setResults([])

    try {
      const urls = [url1, url2].filter(Boolean)

      const responses = await Promise.all(
        urls.map(u =>
          fetch(`/api/pagespeed?url=${encodeURIComponent(u)}&strategy=${strategy}`).then(r => r.json())
        )
      )

      const failed = responses.find((r: any) => r?.error)
      if (failed) {
        setError(failed.error || 'PageSpeed API error')
        return
      }

      setResults(responses)
    } catch {
      setError('Failed to fetch SEO data')
    } finally {
      setLoading(false)
    }
  }

  const overlap = useMemo(() => {
    if (results.length < 2) return []

    const opps1 = results[0]?.opportunities || []
    const opps2 = results[1]?.opportunities || []
    
    return opps1
      .filter((o1: any) =>
        opps2.some(
          (o2: any) =>
            o2.title === o1.title &&
            ((o1.savings ?? 0) > 0 || (o2.savings ?? 0) > 0)
        )
      )
      .map((o1: any) => {
        const match = opps2.find((o2: any) => o2.title === o1.title)
        return {
          title: o1.title,
          description: o1.description, 
          savings1: o1.savings ?? 0,
          savings2: match?.savings ?? 0,
        }
      })
  }, [results])


  return (
    <Dashboard>
      <section className="max-w-5xl mx-auto p-6 bg-white rounded-md shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">SEO Checker & Comparison</h1>

        <form
          onSubmit={e => {
            e.preventDefault()
            if (!loading && url1) checkSEO()
          }}
          className="space-y-4"
          aria-label="SEO check form"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="url1" className="block font-medium mb-1 text-gray-700">
                Main Website URL
              </label>
              <input
                id="url1"
                type="url"
                placeholder="https://your-site.com"
                value={url1}
                onChange={e => setUrl1(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="url2" className="block font-medium mb-1 text-gray-700">
                Competitor URL (optional)
              </label>
              <input
                id="url2"
                type="url"
                placeholder="https://competitor.com"
                value={url2}
                onChange={e => setUrl2(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label htmlFor="strategy" className="font-medium text-gray-700">
              Device
            </label>
            <select
              id="strategy"
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!url1 || loading}
            className={`w-full py-3 rounded-md text-white font-semibold transition-colors ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Checking...' : 'Check SEO'}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-600 font-semibold" role="alert">
            {error}
          </p>
        )}

        {/* shared issues */}
        {overlap.length > 0 && (
          <div className="mt-10 p-5 bg-yellow-50 border border-yellow-300 rounded-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Shared Issues Between Both Sites</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {overlap.map((item: any, i: number) => (
                <li key={i}>
                  <strong>{item.title}</strong> — You: ~{Math.round(item.savings1)} ms, Competitor: ~{Math.round(item.savings2)} ms
                  <br />
                  <small className="text-gray-500">{item.description}</small>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* results panels */}
        {results.length > 0 && (
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {results.map((r, i) => (
              <ResultPanel key={i} data={r} label={i === 0 ? 'Your Site' : 'Competitor'} overlap={overlap} />
            ))}
          </div>
        )}
      </section>
    </Dashboard>
  )
}

function ResultPanel({ data, label, overlap }: { data: any; label: string; overlap: any[] }) {
  const { categories, webVitals, opportunities } = data

  // filter: only opportunities with >0 ms savings and not present in overlap list
  const visibleOpps = (opportunities || []).filter((opp: any) => {
    const savings = Number(opp?.details?.overallSavingsMs || 0)
    const isShared = overlap.some(o => o.title === opp.title)
    console.log(savings > 0 && !isShared)
    return savings > 0 && !isShared
  })

  return (
    <div className="bg-indigo-50 p-6 rounded-md border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{label}</h2>

      <div className="grid grid-cols-2 gap-4">
        <ScoreCard label="SEO Score" score={categories?.seo} emoji="🔍" />
        <ScoreCard label="Performance" score={categories?.performance} emoji="⚙️" />
        <ScoreCard label="Accessibility" score={categories?.accessibility} emoji="♿" />
        <ScoreCard label="Best Practices" score={categories?.bestPractices} emoji="🔐" />
      </div>

      {webVitals && (
        <section className="mt-6 bg-white p-4 rounded-md shadow-inner border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Web Vitals</h3>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-gray-700">
            <Vital label="FCP" value={webVitals.fcp} emoji="🕒" />
            <Vital label="LCP" value={webVitals.lcp} emoji="📦" />
            <Vital label="TTI" value={webVitals.tti} emoji="🔁" />
            <Vital label="TBT" value={webVitals.tbt} emoji="⏱️" />
            <Vital label="CLS" value={webVitals.cls} emoji="🧍" />
          </dl>
        </section>
      )}

      {visibleOpps?.length > 0 && (
        <section className="mt-6 bg-white p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Opportunities to Improve</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {visibleOpps.map((opp: any, i: number) => (
              <li key={i}>
                <strong>{opp.title}</strong> — save ~{Math.round(Number(opp.details?.overallSavingsMs || 0))} ms
                <br />
                <small className="text-gray-500">{opp.description}</small>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function ScoreCard({ label, score, emoji }: { label: string; score: number; emoji: string }) {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm flex items-center space-x-4 border border-gray-200">
      <span className="text-3xl">{emoji}</span>
      <div>
        <p className="text-gray-700 font-semibold">{label}</p>
        <p className="text-indigo-700 text-2xl">
          {score !== null && score !== undefined ? `${Math.round(score * 100)}%` : '—'}
        </p>
      </div>
    </div>
  )
}

function Vital({ label, value, emoji }: { label: string; value: string; emoji: string }) {
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
