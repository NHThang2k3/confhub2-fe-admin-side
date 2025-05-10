'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'
import About from './about'
import Support from './support'
import SupportForm from './supportForm'
import ContactMethods from './ContactMethods'

const FAQ = ({ locale }: { locale: string }) => {
  const t = useTranslations('FAQ')

  return (
    <>
      <Header locale={locale} />
      <About />
      <Support />
      <SupportForm />
      <ContactMethods />
      <Footer />
    </>
  )
}

export default FAQ
