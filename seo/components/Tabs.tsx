'use client'

import { useEffect, useState } from 'react'
import SEOChecker from './SEO'
import FullSEOAudit from './FullSEOAudit'

export default function AppTabs() {
  const [activeTab, setActiveTab] = useState<'seo' | 'full-audit'>('seo')

  useEffect(() => {
      const saved = localStorage.getItem('tab')
      if (saved === 'seo' || saved === 'full-audit') {
        setActiveTab(saved)
      }
    }, [])
  
    
    useEffect(() => {
        localStorage.setItem('tab', activeTab)
    }, [activeTab])

  return (
    <div className="flex-1 p-6">
      <div className="border-b border-gray-300">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 font-medium rounded-t-md ${
              activeTab === 'seo'
                ? 'bg-white border border-gray-300 border-b-0 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-700'
            }`}
          >
            SEO Checker
          </button>

          <button
            onClick={() => setActiveTab('full-audit')}
            className={`px-4 py-2 font-medium rounded-t-md ${
              activeTab === 'full-audit'
                ? 'bg-white border border-gray-300 border-b-0 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-700'
            }`}
          >
            Full SEO Audit
          </button>
        </div>
      </div>


      <div className="bg-white border border-gray-300 rounded-md shadow-sm">
        {activeTab === 'seo' && <SEOChecker />}
        {activeTab === 'full-audit' && <FullSEOAudit />}
      </div>
    </div>
  )
}
