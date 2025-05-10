// pages/conferences.tsx (Conferences Page)
'use client'

import { useTranslations } from 'next-intl'
import SearchSection from '../conferences/SearchSection'
import ResultsSection from '../conferences/ResultsSection'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import useUserBlacklist from '@/src/hooks/auth/useUserBlacklist' // This is just an example hook name

export default function Conferences({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('')
  const { blacklistedEventIds } = useUserBlacklist() // Example hook usage

  const router = useRouter()
  const handleSearch = useCallback(
    async (searchParamsFromComponent: {
      keyword?: string
      title?: string
      acronym?: string
      fromDate?: Date | null
      toDate?: Date | null
      location?: string | null
      type?: 'Online' | 'Offline' | 'Hybrid' | null
      submissionDate?: Date | null
      publisher?: string | null
      rank?: string | null
      source?: string | null
      averageScore?: string | null
      topics?: string[]
      fieldOfResearch?: string[]
    }) => {
      const newParams = new URLSearchParams()
      if (searchParamsFromComponent.keyword)
        newParams.set('keyword', searchParamsFromComponent.keyword)
      if (searchParamsFromComponent.title)
        newParams.set('title', searchParamsFromComponent.title)
      if (searchParamsFromComponent.acronym)
        newParams.set('acronym', searchParamsFromComponent.acronym)
      if (searchParamsFromComponent.location)
        newParams.set('country', searchParamsFromComponent.location)
      if (searchParamsFromComponent.type)
        newParams.set('type', searchParamsFromComponent.type)
      if (searchParamsFromComponent.fromDate) {
        newParams.set(
          'fromDate',
          searchParamsFromComponent.fromDate.toISOString().split('T')[0]
        )
      }
      if (searchParamsFromComponent.toDate) {
        newParams.set(
          'toDate',
          searchParamsFromComponent.toDate.toISOString().split('T')[0]
        )
      }
      if (searchParamsFromComponent.rank)
        newParams.set('rank', searchParamsFromComponent.rank)
      if (searchParamsFromComponent.source)
        newParams.set('source', searchParamsFromComponent.source)
      if (searchParamsFromComponent.publisher)
        newParams.set('publisher', searchParamsFromComponent.publisher)
      if (searchParamsFromComponent.submissionDate) {
        newParams.set(
          'submissionDate',
          searchParamsFromComponent.submissionDate.toISOString().split('T')[0]
        )
      }
      if (searchParamsFromComponent.averageScore)
        newParams.set('averageScore', searchParamsFromComponent.averageScore)

      if (
        searchParamsFromComponent.topics &&
        searchParamsFromComponent.topics.length > 0
      ) {
        searchParamsFromComponent.topics.forEach(topic =>
          newParams.append('topics', topic)
        )
      }
      if (
        searchParamsFromComponent.fieldOfResearch &&
        searchParamsFromComponent.fieldOfResearch.length > 0
      ) {
        searchParamsFromComponent.fieldOfResearch.forEach(field =>
          newParams.append('fieldOfResearch', field)
        )
      }

      const paramsString = newParams.toString()
      router.push(`/${locale}/conferences?${paramsString}`)
    },
    [locale, router]
  )

  const handleClear = useCallback(() => {
    const newParams = new URLSearchParams()
    const paramsString = newParams.toString()
    router.push(`/${locale}/conferences?${paramsString}`)
  }, [locale, router])

  return (
    <>
      <Header locale={locale} />
      <div className='text-center text-2xl'>
        <div className='w-full bg-background py-10'></div>
        <SearchSection onSearch={handleSearch} onClear={handleClear} />
        <div className='container mx-auto mt-4 px-0 md:px-4'>
          <ResultsSection userBlacklist={blacklistedEventIds} />
        </div>
      </div>
      <Footer />
    </>
  )
}
