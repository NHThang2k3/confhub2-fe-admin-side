import { useState, useCallback } from 'react';

export const useMenuState = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);


  const closeAllMenus = useCallback(() => { // Function to close all including mobile
      setIsNotificationOpen(false);
      setIsMobileMenuOpen(false);
      setIsUserDropdownOpen(false);
  }, []);


  const openNotification = useCallback(() => {
    toggleNotification();
    setIsMobileMenuOpen(false); // Close mobile menu
    setIsUserDropdownOpen(false); // Close user dropdown
  }, []);

  const openMobileMenu = useCallback(() => {
    toggleMobileMenu();
    setIsNotificationOpen(false); // Close mobile menu
    setIsUserDropdownOpen(false); // Close user dropdown
  }, []);

  const openUserDropdown = useCallback(() => {
    toggleUserDropdown();
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false)
  }, []);

  const toggleNotification = useCallback(() => {
    setIsNotificationOpen((isOpen) => !isOpen);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((isOpen) => !isOpen);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen((isOpen) => !isOpen);
  }, []);

  return {
    isNotificationOpen,
    isMobileMenuOpen,
    isUserDropdownOpen,
    closeAllMenus, // Added for closing all
    toggleNotification,
    toggleMobileMenu,
    toggleUserDropdown,
    openNotification,
    openUserDropdown,
    openMobileMenu,
  };
};