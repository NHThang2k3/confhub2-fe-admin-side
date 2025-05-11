// src/app/[locale]/dashboard/profile/page.tsx
'use client'; // Add if ProfileTab component is client-side

import ProfileTab from './ProfileTab'; // Assuming ProfileTab is in this folder
// import ProfileTab from '@/src/components/dashboard/ProfileTab'; // Or wherever your component lives

export default function ProfilePage() {
  return <ProfileTab />;
}