// src/app/[locale]/dashboard/requestAdminTab/page.tsx
'use client'; // Add if RequestAdminTab component is client-side

import RequestAdminTab from './RequestAdminTab'; // Assuming RequestAdminTab is in this folder
// import RequestAdminTab from '@/src/components/dashboard/RequestAdminTab'; // Or wherever your component lives

export default function RequestAdminTabPage() {
  return <RequestAdminTab />;
}