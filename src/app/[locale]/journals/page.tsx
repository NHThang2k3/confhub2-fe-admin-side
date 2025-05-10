"use client";

// Journals.tsx
import { useTranslations } from 'next-intl';
import SearchJournalSection from './SearchJournalSection';
import ResultsJournalSection from './ResultsJournalSection';   // Import ResultsJournalSection
import { Header } from '../utils/Header';
import Footer from '../utils/Footer';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';


export default function Journals({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('');
    const router = useRouter();

    const handleSearch = useCallback(async (searchParamsFromComponent: {
        keyword?: string;
        country?: string | null;
        publicationType?: string | null;
        subjectAreas?: string[];
        quartile?: string | null;
        openAccessTypes?: string[];
        publisher?: string | null;
        language?: string | null;
        impactFactor?: string | null;
        hIndex?: string | null;
        citeScore?: string | null;
        sjr?: string | null;
        overallRank?: string | null;
        issn?: string | null;
    }) => {

        const newParams = new URLSearchParams();
        if (searchParamsFromComponent.keyword) newParams.set('keyword', searchParamsFromComponent.keyword);
        if (searchParamsFromComponent.country) newParams.set('country', searchParamsFromComponent.country);
        if (searchParamsFromComponent.publicationType) newParams.set('publicationType', searchParamsFromComponent.publicationType);
        if (searchParamsFromComponent.subjectAreas && searchParamsFromComponent.subjectAreas.length > 0) {
            searchParamsFromComponent.subjectAreas.forEach(subject => newParams.append('subjectAreas', subject));
        }
        if (searchParamsFromComponent.quartile) newParams.set('quartile', searchParamsFromComponent.quartile);
        if (searchParamsFromComponent.openAccessTypes && searchParamsFromComponent.openAccessTypes.length > 0) {
            searchParamsFromComponent.openAccessTypes.forEach(openAccessType => newParams.append('openAccessTypes', openAccessType));
        }
        if (searchParamsFromComponent.publisher) newParams.set('publisher', searchParamsFromComponent.publisher);
        if (searchParamsFromComponent.language) newParams.set('language', searchParamsFromComponent.language);
        if (searchParamsFromComponent.impactFactor) newParams.set('impactFactor', searchParamsFromComponent.impactFactor);
        if (searchParamsFromComponent.hIndex) newParams.set('hIndex', searchParamsFromComponent.hIndex);
        if (searchParamsFromComponent.citeScore) newParams.set('citeScore', searchParamsFromComponent.citeScore);
        if (searchParamsFromComponent.sjr) newParams.set('sjr', searchParamsFromComponent.sjr);
        if (searchParamsFromComponent.overallRank) newParams.set('overallRank', searchParamsFromComponent.overallRank);
        if (searchParamsFromComponent.issn) newParams.set('issn', searchParamsFromComponent.issn);

        const paramsString = newParams.toString();
        router.push(`/${locale}/journals?${paramsString}`);
        }, [locale, router]);

        const handleClear = useCallback(() => {
            const newParams = new URLSearchParams();
            const paramsString = newParams.toString();
            router.push(`/${locale}/journals?${paramsString}`);
      }, [locale, router]);

    return (
        <>  
            <Header locale={locale} />
            <div className="text-center text-2xl">
                <div className="py-10 bg-background w-full"></div>
                <SearchJournalSection
                    onSearch={handleSearch}
                    onClear={handleClear}
                />
                <div className="container mx-auto mt-4 px-4 ">
                    <ResultsJournalSection/>
                </div>
            </div>
            <Footer />
        </>
    );
}