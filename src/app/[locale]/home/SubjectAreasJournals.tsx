// src/components/SubjectAreasJournals.tsx
import React from 'react'
import { useTranslations } from 'next-intl'
// Import the Link component from your navigation setup
// Make sure this path '@/src/navigation' correctly points to your next-intl Link re-export
import { Link } from '@/src/navigation'

// Define the array of image paths directly in the component.
// These paths are relative to the 'public' folder.
const journalImagePaths: string[] = [
  '/images/journals/1.png',
  '/images/journals/2.png',
  '/images/journals/3.png',
  '/images/journals/4.png',
  '/images/journals/5.png',
  '/images/journals/6.png',
  '/images/journals/7.png',
  '/images/journals/8.png',
  '/images/journals/9.png',
  '/images/journals/10.png',
  '/images/journals/11.png', // This corresponds to Economics, Econometrics and Finance
  '/images/journals/12.png',
  '/images/journals/13.png',
  '/images/journals/14.png',
  '/images/journals/15.png',
  '/images/journals/16.png',
  '/images/journals/17.png',
  '/images/journals/18.png',
  '/images/journals/19.png',
  '/images/journals/20.png',
  '/images/journals/21.png',
  '/images/journals/22.png',
  '/images/journals/23.png',
  '/images/journals/24.png',
  '/images/journals/25.png',
  '/images/journals/26.png',
  '/images/journals/27.png'
]

// Define the subject area names corresponding to the images (1-27) in order.
// This array must have the same length as journalImagePaths.
const subjectAreaNames: string[] = [
  'Agricultural and Biological Sciences',
  'Arts and Humanities',
  'Biochemistry, Genetics and Molecular Biology',
  'Business, Management and Accounting',
  'Chemical Engineering',
  'Chemistry',
  'Computer Science',
  'Decision Sciences',
  'Dentistry',
  'Earth and Planetary Sciences',
  'Economics, Econometrics and Finance',
  'Energy',
  'Engineering',
  'Environmental Science',
  'Health Professions',
  'Immunology and Microbiology',
  'Materials Science',
  'Mathematics',
  'Medicine',
  'Multidisciplinary',
  'Neuroscience',
  'Nursing',
  'Pharmacology, Toxicology and Pharmaceutics',
  'Physics and Astronomy',
  'Psychology',
  'Social Sciences',
  'Veterinary'
]

interface SubjectAreasJournalsProps {
  /** Optional animation speed (e.g., '40s', '20s'). Default is '40s'. */
  speed?: string
  /** Optional height for the image containers (Tailwind class, e.g., 'h-32'). Default is 'h-32'. */
  imageHeight?: string
  /** Optional width for the image containers (Tailwind class, e.g., 'w-40'). Default is 'w-40'. */
  imageWidth?: string
  /** Optional Tailwind classes for the inner container (spacing between images, vertical padding). Default is 'space-x-4 py-4'. */
  innerClasses?: string
  /** Optional Tailwind classes for the outer container padding (left and right space). Default is 'px-4'. */
  outerPaddingClasses?: string // New prop for outer padding
}

const SubjectAreasJournals: React.FC<SubjectAreasJournalsProps> = ({
  speed = '90s', // Default animation duration
  imageHeight = 'h-60', // Default image container height
  imageWidth = 'w-40', // Default image container width
  innerClasses = 'space-x-4 py-4' // Default inner spacing/padding
}) => {
  const t = useTranslations()
  // Remove useRouter, we will use the Link component instead

  const imagesToDisplay = journalImagePaths

  // Basic check if there are images to display and if subject names match
  if (
    !imagesToDisplay ||
    imagesToDisplay.length === 0 ||
    imagesToDisplay.length !== subjectAreaNames.length
  ) {
    return (
      <div className='py-8 text-center '>
        {t('No_images_available_to_scroll')}{' '}
        {imagesToDisplay.length !== subjectAreaNames.length &&
          '(Subject names list does not match image count)'}
      </div>
    )
  }

  // Duplicate the images array to create the seamless loop effect
  const duplicatedImages = [...imagesToDisplay, ...imagesToDisplay]

  // Remove the handleClick function as Link handles navigation

  return (
    <div className='container mx-auto py-8'>
      <h1 className='mb-6 text-center text-2xl font-bold'>
        {t('Subject_areas_journals')}
      </h1>
      <div className={`relative w-full overflow-hidden px-4`}>
        <div
          className={`group flex w-max animate-scroll-left ${innerClasses}`}
          style={{ '--scroll-speed': speed } as React.CSSProperties}
        >
          {duplicatedImages.map((imageUrl, index) => {
            // Calculate the original index (0-based) from the duplicated array index
            const originalIndex = index % imagesToDisplay.length

            // Get the corresponding subject name
            // We already checked that subjectAreaNames has the same length as imagesToDisplay
            const subjectName = subjectAreaNames[originalIndex]
            const encodedSubjectName = encodeURIComponent(subjectName) // Still needed for the URL query parameter

            return (
              // Use the Link component to wrap the clickable area
              <Link
                key={index} // Use the index of the duplicated array as the key for the Link
                href={{
                  // Use the relative path within your app (e.g., /journals)
                  // next-intl will automatically add the locale prefix (/en, /fr, etc.)
                  pathname: '/journals',
                  // Pass query parameters as an object
                  query: { subjectAreas: encodedSubjectName }
                }}
                // Link handles click, focus, keyboard events, and accessibility role (like 'link')
                // Add styling to the div inside the Link
                className={`flex-shrink-0 overflow-hidden rounded-lg ${imageWidth} ${imageHeight} //
                           Hover stays on the div // We don't need on
                           the div if Link is used, as Link itself is a link. // But keeping it can make
                           the div visually look clickable even before Link renders the <a>. bg-gray-20 shadow transition-shadow duration-200 hover:cursor-pointer hover:cursor-pointer
                           hover:shadow-md
                          `}
                // Remove onClick, role, tabIndex, onKeyPress from the div
              >
                {/* The img is now inside the div, which is inside the Link */}
                <img
                  src={imageUrl}
                  alt={`Journal or subject area: ${subjectName || `Image ${originalIndex + 1}`}`}
                  className='block h-full w-full object-cover' // Ensure image covers the container
                />
              </Link>
            )
          })}
          {/* Optional: Pause animation on hover */}
          <style jsx>{`
            /* Apply pause animation state on group hover to the animated child */
            .group:hover > .animate-scroll-left {
              animation-play-state: paused;
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}

export default SubjectAreasJournals
