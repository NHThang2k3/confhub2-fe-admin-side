// components/Header/components/UserDropdown.tsx
'use client'; // <-- Necessary because of useState, useEffect, useRouter, useTranslations

import { FC, useState, useEffect, useRef } from 'react';
import { Link } from '@/src/navigation'; // assuming this is next-intl Link
import { useTranslations } from 'next-intl'; // Keep this import
import { useRouter } from 'next/navigation'; // Keep import

// --- Interface for user data structure ---
interface UserData {
  id: string; // Add a required field for basic validity check
  firstName: string;
  lastName: string;
  email: string;
  // Add other properties if you need to access them
}
// --- End interface ---

interface Props {
  isUserDropdownOpen: boolean;
  closeAllMenus: () => void;
  locale: string; // Keep locale prop
  logout: () => Promise<void>; // Assume this handles API logout
  socketRef: React.MutableRefObject<any>; // Keep socketRef
}

const UserDropdown: FC<Props> = ({
  isUserDropdownOpen,
  closeAllMenus,
  locale, // Destructure locale
  logout,
  socketRef
}) => {
  const [isClient, setIsClient] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [showSessionExpiredMessage, setShowSessionExpiredMessage] =
    useState(false);

  // Call the useTranslations hook (already present)
  const t = useTranslations(''); // Using the default namespace (or specify one if needed)

  const router = useRouter();

  const redirectTimerIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
    // --- Read user JSON string from localStorage on component mount ---
    // No need to check and display errors here, checking will happen when clicking links
    try {
      const storedUserJSON = localStorage.getItem('user');
      if (storedUserJSON) {
        const userData: UserData = JSON.parse(storedUserJSON);
        // Basic check if parsed data looks like a user object
        if (userData && typeof userData === 'object' && userData.id) {
             setFirstName(userData.firstName || null); // Use || null for robustness
             setLastName(userData.lastName || null);   // Use || null for robustness
        } else {
             // Log warning for developers, not user UI
             console.warn('Invalid user data structure found in localStorage upon mount.');
             localStorage.removeItem('user'); // Clear invalid data on mount
        }
      }
    } catch (error) {
      // Log parsing error for developers, not user UI
      console.error(
        'Error parsing user data from localStorage on mount:',
        error
      );
      localStorage.removeItem('user'); // Clear corrupted data on mount
    }

    // Cleanup function to clear timeout when component unmounts
    return () => {
      if (redirectTimerIdRef.current) {
        clearTimeout(redirectTimerIdRef.current);
        redirectTimerIdRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures it runs once after mount on client

  // Function to handle link click events
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const userDataJSON = localStorage.getItem('user');
    let isValidUser = false;
    let parsedUser: UserData | null = null;

    if (userDataJSON) {
      try {
        parsedUser = JSON.parse(userDataJSON);
        // Basic validity check for user data (e.g., check for 'id' field)
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
          isValidUser = true;
        } else {
          // Log warning for developers, not user UI
          console.warn(
            'Invalid user data found in localStorage (missing id or wrong format) on link click.'
          );
           // Clear invalid data
          localStorage.removeItem('user');
        }
      } catch (parseError) {
        // Log parsing error for developers, not user UI
        console.error(
          'Error parsing user data from localStorage on link click:',
          parseError
        );
        // Data is not valid JSON, clear it
        localStorage.removeItem('user');
      }
    } else {
      // Log warning for developers, not user UI
      console.warn('No user data found in localStorage on link click.');
    }

    if (!isValidUser) {
      // User data does NOT exist or is NOT valid
      e.preventDefault(); // *** PREVENT DEFAULT LINK NAVIGATION ***

      // Only show the message if it's not already displayed
      if (!showSessionExpiredMessage) {
        setShowSessionExpiredMessage(true);

        // Set a timeout to redirect after 3 seconds
        const timerId = setTimeout(() => {
          router.push('/'); // Redirect to homepage using router
          closeAllMenus(); // Close the dropdown
          setShowSessionExpiredMessage(false); // Hide the message
          redirectTimerIdRef.current = null; // Reset ref
        }, 3000);
        redirectTimerIdRef.current = timerId; // Store timeout ID in ref
      }

      // Close the menu immediately since we're not navigating to the link destination
      closeAllMenus();
    } else {
      // User data EXISTS and is VALID
      // *** DO NOT call e.preventDefault() ***
      // *** DO NOT manually call router.push() ***
      // Let the Link component handle the navigation to its 'href'.

      // Close the menu immediately when clicked to prepare for the page transition
      closeAllMenus();
    }
  };

  return (
    <>
      {/* Session expired message - ALREADY uses t() for translation */}
      {/* Set z-index higher than the dropdown (z-50) */}
      {showSessionExpiredMessage && (
        <div className='fixed left-0 top-0 z-[100] w-full bg-red-600 p-3 text-center text-white shadow-lg'>
          {t('Session_Expired_Redirect_Home')} {/* <-- Already uses t() */}
        </div>
      )}

      {isClient && (
        <div
          className={`absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-gray-700 dark:bg-gray-800 ${
            isUserDropdownOpen ? '' : 'hidden'
          }`}
          aria-labelledby='user-menu-button'
        >
          {/* Display welcome message */}
          {(firstName || lastName) && (
            <div className='border-b border-gray-200 px-2 py-2 text-sm  '>
               {/* "Hello" label - ALREADY uses t() for translation */}
              {t('Hello')}{' '} {/* <-- Already uses t() */}
              <strong className='text-button'>
                {firstName} {lastName} {/* First/Last name are user data, not translated */}
              </strong>
            </div>
          )}

          <div className='flex flex-col py-1'>
            {/* Menu Links - Already use t() for labels */}
            {/* Just need to ensure correct keys are used in message files */}
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'analysis' } }}
              locale={locale} // Pass locale
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Use the click handler
            >
               {/* Label - ALREADY uses t() for translation */}
              {t('Analysis')} {/* <-- Already uses t() */}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'moderation' } }}
              locale={locale} // Pass locale
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Use the click handler
            >
              {/* Label - ALREADY uses t() for translation */}
              {t('Moderation.Moderation')} {/* <-- Already uses t() */}
            </Link>
            <Link
              href={{
                pathname: `/dashboard`,
                query: { tab: 'requestadmintab' }
              }}
              locale={locale} // Pass locale
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Use the click handler
            >
               {/* Label - ALREADY uses t() for translation */}
              {t('Request_Admin_Tab')} {/* <-- Already uses t() */}
            </Link>
            <Link
              href={{ pathname: `/dashboard`, query: { tab: 'profile' } }}
              locale={locale} // Pass locale
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Use the click handler
            >
               {/* Label - ALREADY uses t() for translation */}
              {t('Profile')} {/* <-- Already uses t() */}
            </Link>

            <Link
              href={{
                pathname: `/dashboard`,
                query: { tab: 'notifications' }
              }}
              locale={locale} // Pass locale
              className='block px-2 py-2 text-sm  hover:bg-gray-100  dark:hover:bg-gray-700'
              onClick={handleLinkClick} // Use the click handler
            >
               {/* Label - ALREADY uses t() for translation */}
              {t('Notifications')} {/* <-- Already uses t() */}
            </Link>


            <hr className='my-1 border-gray-200 dark:border-gray-700' />

            {/* Logout Button - ALREADY uses t() for translation */}
            <button
              onClick={async () => {
                await logout();
                if (socketRef.current) {
                  socketRef.current.disconnect();
                }
                localStorage.removeItem('user'); // Clear user data on logout
                setFirstName(null);
                setLastName(null);
                closeAllMenus();
                router.push('/'); // Redirect to homepage after logout
              }}
              className='block w-full px-2 py-2 text-left text-sm text-red-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-red-500 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
            >
              {t('Logout')} {/* <-- Already uses t() */}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDropdown;