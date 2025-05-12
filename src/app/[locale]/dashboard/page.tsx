// src/app/[locale]/dashboard/page.tsx
'use client'; 

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname



export default function DashboardRootPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  useEffect(() => {
    // Check if the exact path matches the root dashboard path (considering locale)
    const rootPath = `/${locale}/dashboard`;
    if (pathname === rootPath || pathname === `${rootPath}/`) {
      console.log(`[${locale}/dashboard/page.tsx] At dashboard root, redirecting to logAnalysis...`);
      // Redirect to the default tab page
      router.replace(`/${locale}/dashboard/logAnalysis`);
    }

  }, [locale, pathname, router]); // Add dependencies

  // Render nothing or a small loader while redirecting
  return (
     <div className="flex flex-col items-center justify-center w-full">
        <p>Loading dashboard...</p> {/* Or a spinner */}
     </div>
  );
}