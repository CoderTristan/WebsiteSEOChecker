'use client'

import { useState, useEffect } from 'react'
import { Loader2, Globe, FileText, Bot, Link2, Image as ImageIcon, Lightbulb } from 'lucide-react'

interface AuditData {
  metadata: Record<string, string | null>
  headings: Record<string, number>
  robots: {
    found: boolean
    allowed: boolean
    url: string
  }
  sitemap: {
    found: boolean
    url: string
  }
  imagesCount?: number
  linksCount?: number
}

export default function FullSeoAuditPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AuditData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Restore from local storage
  useEffect(() => {
    const saved = localStorage.getItem('seoAudit')
    if (saved) {
      const parsed = JSON.parse(saved)
      setUrl(parsed.url || '')
      setData(parsed.data || null)
    }
  }, [])

  // Save to local storage whenever data/url changes
  useEffect(() => {
    if (data) {
      localStorage.setItem('seoAudit', JSON.stringify({ url, data }))
    }
  }, [url, data])

  const handleAudit = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch('/api/full-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to fetch audit')
      setData(json)
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Full SEO Audit</h1>
        <p className="text-gray-500">Analyze metadata, structure, robots.txt, and sitemap health for any website.</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a full URL (https://example.com)"
          className="border border-gray-300 rounded-md px-4 py-3 flex-1 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          onClick={handleAudit}
          disabled={loading || !url}
          className={`px-6 py-3 rounded-md text-white font-semibold flex items-center justify-center gap-2 transition-colors ${
            loading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Analyzing...
            </>
          ) : (
            <>
              <Globe className="w-5 h-5" /> Run Audit
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-center">{error}</p>
      )}

      {data && (
        <div className="space-y-8">
          {/* Metadata */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold">Metadata</h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
              {Object.entries(data.metadata).map(([key, value]) => (
                <li key={key}>
                  <strong className="capitalize">{key}:</strong> {value ?? '—'}
                </li>
              ))}
            </ul>
          </section>

          {/* Headings */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold">Headings</h2>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-700">
              {Object.entries(data.headings).map(([key, value]) => (
                <li key={key}>
                  <strong>{key.toUpperCase()}:</strong> {value}
                </li>
              ))}
            </ul>
          </section>

          {/* Robots.txt */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold">Robots.txt</h2>
            </div>
            {data.robots.found ? (
              <p>
                ✅ Found at{' '}
                <a href={data.robots.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {data.robots.url}
                </a>{' '}
                — Allowed: {data.robots.allowed ? '✅ Yes' : '🚫 No'}
              </p>
            ) : (
              <p>❌ Not found</p>
            )}
          </section>

          {/* Sitemap */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-semibold">Sitemap</h2>
            </div>
            {data.sitemap.found ? (
              <p>
                ✅ Found at{' '}
                <a href={data.sitemap.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {data.sitemap.url}
                </a>
              </p>
            ) : (
              <p>❌ Not found</p>
            )}
          </section>

          {/* Page Elements */}
          {(data.imagesCount !== undefined || data.linksCount !== undefined) && (
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold">Page Elements</h2>
              </div>
              <ul className="text-gray-700 space-y-1">
                {data.imagesCount !== undefined && <li>🖼️ Images: {data.imagesCount}</li>}
                {data.linksCount !== undefined && <li>🔗 Links: {data.linksCount}</li>}
              </ul>
            </section>
          )}

          {/* SEO Insights */}
          <section className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-green-800">SEO Insights</h2>
            </div>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              {!data.metadata.title && <li>⚠️ Missing title tag — add a descriptive title under 60 characters.</li>}
              {data.metadata.title && data.metadata.title.length > 60 && <li>⚠️ Title is too long — shorten to under 60 characters.</li>}
              {!data.metadata.description && <li>⚠️ Missing meta description — add a keyword-rich summary under 160 characters.</li>}
              {data.headings.h1 === 0 && <li>⚠️ No H1 found — each page should have one descriptive H1 tag.</li>}
              {data.headings.h1 > 1 && <li>⚠️ Multiple H1 tags found — ideally only one H1 per page.</li>}
              {!data.robots.found && <li>⚠️ No robots.txt — search engines may crawl unintended pages.</li>}
              {data.robots.found && !data.robots.allowed && <li>🚫 robots.txt disallows crawling — may prevent indexing.</li>}
              {!data.sitemap.found && <li>⚠️ Sitemap not found — add sitemap.xml for better crawling.</li>}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
