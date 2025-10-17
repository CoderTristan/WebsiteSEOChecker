'use client'

import { AuditData, PageSpeedResult} from './types'
import { useState, useEffect, useMemo, ReactNode } from 'react'
import { Loader2, Globe, FileText, Bot, Link2, Image as ImageIcon, Lightbulb } from 'lucide-react'

export default function CombinedSEOAnalyzer() {
  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [strategy, setStrategy] = useState('mobile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<PageSpeedResult[]>([])
  const [audits, setAudits] = useState<AuditData[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('seoAnalyzerData')
    if (saved) {
      const parsed = JSON.parse(saved)
      setUrl1(parsed.url1 || '')
      setUrl2(parsed.url2 || '')
      setStrategy(parsed.strategy || 'mobile')
      setResults(parsed.results || [])
      setAudits(parsed.audits || [])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('seoAnalyzerData', JSON.stringify({ url1, url2, strategy, results, audits }))
  }, [url1, url2, strategy, results, audits])

  async function handleAnalyze() {
    setLoading(true)
    setError('')
    setResults([])
    setAudits([])
    const urls = [url1, url2].filter(Boolean)

    try {
      const [pageSpeedRes, auditRes] = await Promise.all([
        Promise.all(
          urls.map(u =>
            fetch(`/api/pagespeed?url=${encodeURIComponent(u)}&strategy=${strategy}`).then(r => r.json())
          )
        ),
        Promise.all(
          urls.map(u =>
            fetch('/api/full-audit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: u }),
            }).then(r => r.json())
          )
        ),
      ])

      const failed = [...pageSpeedRes, ...auditRes].find((r: any) => r?.error)
      if (failed) throw new Error(failed.error || 'API Error')

      setResults(pageSpeedRes)
      setAudits(auditRes)
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Failed to analyze websites.')
    } finally {
      setLoading(false)
    }
  }

  const overlap = useMemo(() => {
    if (results.length < 2) return []
    const opps1 = results[0]?.opportunities || []
    const opps2 = results[1]?.opportunities || []
    return opps1
      .filter(o1 => opps2.some(o2 => o2.title === o1.title && ((o1.savings ?? 0) > 0 || (o2.savings ?? 0) > 0)))
      .map(o1 => {
        const match = opps2.find(o2 => o2.title === o1.title)
        return { title: o1.title, description: o1.description, savings1: o1.savings ?? 0, savings2: match?.savings ?? 0 }
      })
  }, [results])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">SEO Analyzer</h1>
        <p className="text-gray-500">Compare your website with a competitor using in-depth SEO data or just check your site's SEO.</p>
      </header>

      <form
        onSubmit={e => {
          e.preventDefault()
          if (!loading && url1) handleAnalyze()
        }}
        className="space-y-4 bg-white p-6 rounded-md shadow-sm border"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="url1" className="block font-medium mb-1 text-gray-700">
              Your Website URL
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
          {loading ? (
            <span className="flex justify-center items-center gap-2">
              <Loader2 className="animate-spin w-5 h-5" /> Analyzing...
            </span>
          ) : (
            <span className="flex justify-center items-center gap-2">
              <Globe className="w-5 h-5" /> Run Analysis
            </span>
          )}
        </button>
      </form>

      {error && <p className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-center">{error}</p>}

      {overlap.length > 0 && (
        <section className="p-6 bg-white border rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Shared Performance Issues</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-md text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left font-medium border-b">Issue</th>
                  <th className="px-4 py-2 text-left font-medium border-b">Description</th>
                  <th className="px-4 py-2 text-left font-medium border-b">Your Site</th>
                  <th className="px-4 py-2 text-left font-medium border-b">Competitor</th>
                </tr>
              </thead>
              <tbody>
                {overlap.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{item.title}</td>
                    <td className="px-4 py-2 text-gray-600">{item.description}</td>
                    <td className="px-4 py-2 text-indigo-700">{Math.round(item.savings1)} ms</td>
                    <td className="px-4 py-2 text-indigo-700">{Math.round(item.savings2)} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {results.length > 0 && (
        <div className={`${url2 !== '' && 'grid md:grid-cols-2'} gap-6`}>
          {results.map((r, i) => (
            <ResultPanel key={i} data={r} label={i === 0 ? 'Your Site' : 'Competitor'} />
          ))}
        </div>
      )}

      {audits.length > 0 && (
        <div className={`${url2 !== '' && 'grid md:grid-cols-2'} gap-6`}>
          {audits.map((data, i) => (
            <FullAuditPanel key={i} data={data} label={i === 0 ? 'Your Site' : 'Competitor'} />
          ))}
        </div>
      )}
    </div>
  )
}

function ResultPanel({ data, label }: { data: PageSpeedResult; label: string }) {
  const { categories, webVitals } = data
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
        <section className="mt-6 bg-white p-4 rounded-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Web Vitals</h3>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-gray-700">
            {Object.entries(webVitals).map(([label, value]) => (
              <Vital key={label} label={label} value={value} emoji="⚡" />
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}

function FullAuditPanel({ data, label }: { data: AuditData; label: string }) {
  const { metadata, headings, robots, sitemap, imagesCount, linksCount } = data
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{label} - Full SEO Audit</h2>
      <Section icon={<FileText />} title="Metadata">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
          {Object.entries(metadata).map(([k, v]) => (
            <li key={k}>
              <strong className="capitalize">{k}:</strong> {' '}
              <span className="break-words">{v ?? '—'}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section icon={<Bot />} title="Headings">
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-700">
          {Object.entries(headings).map(([k, v]) => (
            <li key={k}>
              <strong>{k.toUpperCase()}:</strong> {v}
            </li>
          ))}
        </ul>
      </Section>
      <Section icon={<Link2 />} title="Robots.txt">
        {robots?.found ? (
          <div className="flex flex-wrap justify-between items-center gap-2">
              <p>
                ✅ Found at{' '}
                <a
                  href={robots.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {robots.url}
                </a>
              </p>
              <p>
                Allowed: {robots.allowed ? '✅ Yes' : '🚫 No'}
              </p>
            </div>
          ) : (
          <p>❌ Not found</p>
        )}
      </Section>
      <Section icon={<Globe />} title="Sitemap">
        {sitemap?.found ? (
          <p>
            ✅ Found at{' '}
            <a href={sitemap.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {sitemap.url}
            </a>
          </p>
        ) : (
          <p>❌ Not found</p>
        )}
      </Section>
      {(imagesCount !== undefined || linksCount !== undefined) && (
        <Section icon={<ImageIcon />} title="Page Elements">
          <ul className="text-gray-700 space-y-1">
            {imagesCount !== undefined && <li>🖼️ Images: {imagesCount}</li>}
            {linksCount !== undefined && <li>🔗 Links: {linksCount}</li>}
          </ul>
        </Section>
      )}
      <Section icon={<Lightbulb />} title="SEO Insights" className="bg-green-50 border-green-200">
        <ul className="list-disc list-inside text-gray-800 space-y-1">
          {!metadata.title && <li>⚠️ Missing title tag.</li>}
          {metadata.title && metadata.title.length > 60 && <li>⚠️ Title too long.</li>}
          {!metadata.description && <li>⚠️ Missing meta description.</li>}
          {headings.h1 === 0 && <li>⚠️ No H1 tag found.</li>}
          {headings.h1 > 1 && <li>⚠️ Multiple H1 tags found.</li>}
          {!robots.found && <li>⚠️ No robots.txt detected.</li>}
          {robots.found && !robots.allowed && <li>🚫 robots.txt disallows crawling.</li>}
          {!sitemap.found && <li>⚠️ Sitemap not found.</li>}
        </ul>
      </Section>
    </div>
  )
}

function Section({ icon, title, children, className = '' }: { icon: ReactNode; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`p-4 rounded-md border mb-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-indigo-600">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function ScoreCard({ label, score, emoji }: { label: string; score?: number; emoji: string }) {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm flex items-center space-x-4 border">
      <span className="text-3xl">{emoji}</span>
      <div>
        <p className="text-gray-700 font-semibold">{label}</p>
        <p className="text-indigo-700 text-2xl">{score !== undefined ? `${Math.round(score * 100)}%` : '—'}</p>
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
