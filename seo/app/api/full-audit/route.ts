import { NextResponse } from 'next/server'
import metascraper from 'metascraper'
import metascraperTitle from 'metascraper-title'
import metascraperDescription from 'metascraper-description'
import metascraperImage from 'metascraper-image'
import metascraperUrl from 'metascraper-url'
import metascraperPublisher from 'metascraper-publisher'
import metascraperAuthor from 'metascraper-author'
import metascraperDate from 'metascraper-date'
import metascraperLogo from 'metascraper-logo'
import * as cheerio from 'cheerio'
import axios from 'axios'

// Create reusable Axios instance with custom User-Agent
const axiosAgent = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  },
})

// Setup metascraper rules
const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
  metascraperUrl(),
  metascraperPublisher(),
  metascraperAuthor(),
  metascraperDate(),
  metascraperLogo(),
])

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 })

    // Fetch HTML with Axios agent
    const { data: html } = await axiosAgent.get(url)

    // Extract metadata
    const metadata = await scraper({ html, url })

    // Parse HTML
    const $ = cheerio.load(html)
    const headings = {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length,
      h4: $('h4').length,
    }

    const images = $('img')
      .map((_, el) => ({ src: $(el).attr('src'), alt: $(el).attr('alt') || null }))
      .get()

    const links = $('a').map((_, el) => $(el).attr('href')).get().filter(Boolean)

    // Check robots.txt
    const robotsUrl = new URL('/robots.txt', url).href
    let robots = { found: false, allowed: true, url: robotsUrl }
    try {
      const r = await axiosAgent.get(robotsUrl)
      robots.found = true
      robots.allowed = !/Disallow:\s*\/\s*$/i.test(r.data)
    } catch {}

    // Check sitemap.xml
    const sitemapUrl = new URL('/sitemap.xml', url).href
    let sitemap = { found: false, url: sitemapUrl }
    try {
      const s = await axiosAgent.get(sitemapUrl)
      if (s.data.includes('<urlset') || s.data.includes('<sitemapindex')) sitemap.found = true
    } catch {}

    return NextResponse.json({
      metadata,
      headings,
      robots,
      sitemap,
      imagesCount: images.length,
      linksCount: links.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}