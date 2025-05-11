// src/app/[locale]/dashboard/notification/page.tsx
'use client'; // Add if NotificationsTab component is client-side

import NotificationsTab from './NotificationsTab'; // Assuming NotificationsTab is in this folder
// import NotificationsTab from '@/src/components/dashboard/NotificationsTab'; // Or wherever your component lives

export default function NotificationPage() {
  return <NotificationsTab />;
}