// src/app/[locale]/chatbot/landingchatbot/page.tsx
'use client'

import AIAbilities from './AIAbilities'
import AIAbout from './AIAbout'
import AIBanner from './AIBanner'
import AIFAQ from './AIFAQ'
import AIStatistics from './AIStatistics'
import ScrollToTopButton from '../../utils/ScrollToTopButton'

export default function AILanding() {
  return (
    <div className='bg-black'>
      <AIBanner />
      <AIAbout />
      <AIAbilities />
      <AIStatistics />
      <AIFAQ />
      <ScrollToTopButton />
    </div>
  )
}