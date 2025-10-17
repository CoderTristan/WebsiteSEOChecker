'use client'

import SEOChecker from './SEO'

export default function AppTabs() {

  return (
    <div className="flex-1 p-6">
      <div className="bg-white border border-gray-300 rounded-md shadow-sm">
        <SEOChecker />
      </div>
    </div>
  )
}
