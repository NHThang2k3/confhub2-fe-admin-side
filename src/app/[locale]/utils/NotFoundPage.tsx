import React from 'react'
import Button from './Button'
import { Link } from '@/src/navigation' // Adjust the import path as necessary

const NotFoundPage = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-r from-background to-background-secondary'>
      <div className='text-center'>
        <h1 className='mb-4 text-6xl font-bold'>404</h1>
        <p className='mb-8 text-2xl'>Oops! Page not found.</p>
        <p className='mb-8'>
          The page you are looking for might be temporarily unavailable or does
          not exist.
        </p>
        <Link href={`/`}>
          <Button variant='primary' size='large' rounded className='ml-2'>
            Go back to homepage
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
