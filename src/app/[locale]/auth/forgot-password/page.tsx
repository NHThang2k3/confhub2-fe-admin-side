'use client'
import React from 'react'
import ForgotPasswordForm from './ForgotPasswordForm'

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}

export default ForgotPasswordPage
