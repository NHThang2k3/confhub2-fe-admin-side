// src/components/Feedback/SignInPrompt.tsx
import React from 'react'
import { useTranslations } from 'next-intl'

interface SignInPromptProps {
  onSignInClick: () => void
}

const SignInPrompt: React.FC<SignInPromptProps> = ({ onSignInClick }) => {
  const t = useTranslations('')

  return (
    <div className='border-t border-gray-200 pt-6 text-center sm:text-left'>
      <p className='mb-2 '>{t('Want_to_share_your_feedback')}</p>
      <p className='mb-4 '>{t('Please_sign_in_to_post_your_feedback')}</p>
      <button
        className='rounded-md bg-button px-4 py-2 font-semibold text-button-text hover:bg-blue-600'
        onClick={onSignInClick}
      >
        {t('Sign_In')}
      </button>
    </div>
  )
}

export default SignInPrompt
