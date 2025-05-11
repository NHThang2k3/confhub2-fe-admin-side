// src/app/[locale]/dashboard/logAnalysis/page.tsx
'use client'; // Add if Analysis component is client-side

import Analysis from './Analysis'; // Assuming Analysis is in this folder
// import Analysis from '@/src/components/dashboard/Analysis'; // Or wherever your component lives

// Access locale if needed, though Analysis component might not need it directly
export default function LogAnalysisPage(/* { params: { locale } }: { params: { locale: string } } */) {
  return <Analysis />;
}