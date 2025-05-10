'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/src/navigation' // Assuming this is your next-intl Link
import Analysis from './logAnalysis/Analysis'
import Moderation from './moderation/Moderation'
import RequestAdminTab from './requestAdminTab/RequestAdminTab'
import SettingTab from './setting/SettingTab'
import NotificationsTab from './notification/NotificationsTab'
import FollowedTab from './follow/FollowedTab'
import BlacklistTab from './blacklist/BlacklistTab'
import ProfileTab from './profile/ProfileTab'
import NoteTab from './note/NoteTab'
import MyConferencesTab from './myConferences/MyConferencesTab'
import { Header } from '../utils/Header' // Assuming Header component handles its own width/centering

export default function Dashboard({ locale }: { locale: string }) {
  const t = useTranslations('')
  const searchParams = useSearchParams()
  const [activePage, setActivePage] = useState<string>('')
  // Sidebar starts closed on small screens, open on large screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Logic cập nhật activePage dựa trên searchParams (giữ nguyên)
  useEffect(() => {
    const tab = searchParams.get('tab')
    let initialPage = 'Analysis' // Default
    if (tab === 'followed') initialPage = 'Followed'
    else if (tab === 'profile') initialPage = 'Profile'
    else if (tab === 'myconferences') initialPage = 'My Conferences'
    else if (tab === 'note') initialPage = 'Note'
    else if (tab === 'notifications') initialPage = 'Notifications'
    else if (tab === 'blacklisted') initialPage = 'Blacklisted'
    else if (tab === 'setting') initialPage = 'Setting'
    else if (tab === 'moderation') initialPage = 'Moderation'
    else if (tab === 'requestadmintab') initialPage = 'RequestAdminTab'
    else if (tab === 'analysis') initialPage = 'Analysis' // Ensure 'analysis' param works

    setActivePage(initialPage)

    // Optional: On mobile, assume sidebar should be closed by default on navigation
    // and needs a separate toggle (likely in the header).
    // On desktop, maybe default to open? Or let state manage it.
    // The current state manages it, initial is false. Let's keep it simple.
    // If you want it open by default on desktop, you'd need a client-side check here.
    // Example: if (typeof window !== 'undefined' && window.innerWidth > 768) { setIsSidebarOpen(true); }
    // But this can cause hydration issues. Better to manage state or rely on user interaction.
  }, [searchParams])

  // Set initial sidebar state based on screen size after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Open sidebar by default on desktop sizes (md breakpoint)
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true)
      }
    }
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case 'Setting':
        return <SettingTab />
      case 'Notifications':
        return <NotificationsTab />
      case 'Followed':
        return <FollowedTab />
      case 'Blacklisted':
        return <BlacklistTab />
      case 'Note':
        return <NoteTab />
      case 'My Conferences':
        return <MyConferencesTab />
      case 'Profile':
        return <ProfileTab />
      case 'Analysis':
        return <Analysis />
      case 'Moderation':
        return <Moderation />
      case 'RequestAdminTab':
        return <RequestAdminTab />
      default:
        return <Analysis /> // Fallback
    }
  }

  // Menu items remains the same
  const menuItems = [
    {
      page: 'Analysis',
      label: t('Analysis'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-airplay-icon lucide-airplay'
        >
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      )
    },
    {
      page: 'Moderation',
      label: t('Moderation'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-airplay-icon lucide-airplay'
        >
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      )
    },
    {
      page: 'RequestAdminTab',
      label: t('Request_Admin_Tab'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-airplay-icon lucide-airplay'
        >
          <path d='M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1' />
          <path d='m12 15 5 6H7Z' />
        </svg>
      )
    },
    {
      page: 'Profile',
      label: t('Profile'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-circle-user-round '
        >
          <path d='M18 20a6 6 0 0 0-12 0' />
          <circle cx='12' cy='10' r='4' />
          <circle cx='12' cy='12' r='10' />
        </svg>
      )
    },
    {
      page: 'Followed',
      label: t('Followed'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-star'
        >
          <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
        </svg>
      )
    },
    {
      page: 'My Conferences',
      label: t('My_Conferences'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-notebook-tabs'
        >
          <path d='M2 6h4' />
          <path d='M2 10h4' />
          <path d='M2 14h4' />
          <path d='M2 18h4' />
          <rect width='16' height='20' x='4' y='2' rx='2' />
          <path d='M15 2v20' />
          <path d='M15 7h5' />
          <path d='M15 12h5' />
          <path d='M15 17h5' />
        </svg>
      )
    },
    {
      page: 'Note',
      label: t('Note'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-calendar-days'
        >
          <path d='M8 2v4' />
          <path d='M16 2v4' />
          <rect width='18' height='18' x='3' y='4' rx='2' />
          <path d='M3 10h18' />
          <path d='M8 14h.01' />
          <path d='M12 14h.01' />
          <path d='M16 14h.01' />
          <path d='M8 18h.01' />
          <path d='M12 18h.01' />
          <path d='M16 18h.01' />
        </svg>
      )
    },
    {
      page: 'Notifications',
      label: t('Notifications'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-bell-ring'
        >
          <path d='M10.268 21a2 2 0 0 0 3.464 0' />
          <path d='M22 8c0-2.3-.8-4.3-2-6' />
          <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' />
          <path d='M4 2C2.8 3.7 2 5.7 2 8' />
        </svg>
      )
    },
    {
      page: 'Blacklisted',
      label: t('Blacklisted'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='m2 2 20 20' />
          <path d='M8.35 2.69A10 10 0 0 1 21.3 15.65' />
          <path d='M19.08 19.08A10 10 0 1 1 4.92 4.92' />
        </svg>
      )
    },
    {
      page: 'Setting',
      label: t('Setting'),
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#525252'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-settings'
        >
          <path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15-.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' />
          <circle cx='12' cy='12' r='3' />
        </svg>
      )
    }
  ]

  // Header height constant (adjust as needed)
  const HEADER_HEIGHT_PX = 72 // Example height, adjust based on your Header

  // Toggle icons (keep these)
  const openIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#525252'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='lucide lucide-align-justify'
    >
      <path d='M3 12h18' />
      <path d='M3 18h18' />
      <path d='M3 6h18' />
    </svg>
  )
  const closeIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='#525252'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='lucide lucide-x'
    >
      <path d='M18 6 6 18' />
      <path d='m6 6 12 12' />
    </svg>
  )

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Render chính
  return (
    <>
      {/* Header component - Assume it's sticky/fixed and has its own width/centering */}
      {/* The Header should likely also be contained, aligning with the container used below */}
      <Header locale={locale} />

      {/* Container cho Sidebar và Main Content */}
      {/* Added container mx-auto to center this section */}
      {/* Used flex to place sidebar and content side-by-side */}
      <div
        className='container mx-0 flex min-h-screen px-0'
        style={{ paddingTop: `${HEADER_HEIGHT_PX}px` }} // Add padding equal to header height
      >
        {/* Sidebar - Now a flex item */}
        <aside
          className={`
            h-full flex-shrink-0 overflow-y-auto transition-all 
            duration-300 ease-in-out scrollbar
            ${isSidebarOpen ? 'w-52' : 'w-0 md:w-16'} 
            ${!isSidebarOpen && 'md:overflow-hidden'} 
            // Added background color class bg-background
          `}
        >
          <nav className='w-full'>
            <ul className='w-full'>
              {/* Toggle Button */}
              {/* Ẩn button trên mobile (w-0 state) */}
              <li className='w-full'>
                {' '}
                {/* Keep as li for consistency */}
                <button
                  onClick={toggleSidebar}
                  className={`
                      flex w-full items-center py-2
                      transition-colors duration-500 ease-in-out
                      hover:bg-button hover:opacity-60 focus:outline-none active:bg-blue-700
                      ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0 md:px-4'} /* Adjust padding */
                    `}
                >
                  {/* Icon and spacing */}
                  {/* Icon is always visible on md+ when closed (w-16) */}
                  <span className={isSidebarOpen ? 'mr-4' : ''}>
                    {isSidebarOpen ? closeIcon : openIcon}
                  </span>
                  {/* Only show text when sidebar open AND not on mobile (w-0) */}
                  {isSidebarOpen && (
                    <span className='whitespace-nowrap'>{t('Close')}</span>
                  )}
                  {/* For desktop closed (w-16), the button text is hidden by overflow-hidden */}
                </button>
              </li>

              {/* Menu Items */}
              {menuItems.map(item => {
                const tabValue = item.page.toLowerCase().replace(/ /g, '')
                return (
                  <li className='w-full' key={item.page}>
                    <Link
                      href={{
                        pathname: '/dashboard',
                        query: { tab: tabValue }
                      }}
                      className={`
                          flex h-12 w-full items-center py-2
                          transition-colors duration-500 ease-in-out
                          hover:bg-button hover:opacity-60 focus:outline-none
                          ${
                            activePage === item.page
                              ? 'bg-button text-button-text hover:bg-secondary'
                              : ''
                          }
                           ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0 md:px-4'} /* Adjust padding */
                        `}
                    >
                      {/* Icon and spacing */}
                      <span className={isSidebarOpen ? 'mr-4' : ''}>
                        {item.icon}
                      </span>
                      {/* Only display text when sidebar is open */}
                      {isSidebarOpen && (
                        <span className='whitespace-nowrap'>{item.label}</span>
                      )}
                      {/* When closed on desktop (md:w-16), text is hidden by parent overflow */}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area - Takes remaining space */}
        {/* Removed margin-left, flex handles spacing */}
        {/* Added padding for content spacing */}
        <div
          className={`
              /* removed here, 
              handled by parent
              */ container flex min-h-screen flex-1 overflow-y-auto p-4 transition-all duration-300 ease-in-out
            `}
        >
          {/* Render page based on activePage */}
          {renderPage()}
        </div>
      </div>
      {/* <Footer /> */}
    </>
  )
}
