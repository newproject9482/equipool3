'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAuthenticatedFetchOptions, clearAuthData } from '../utils/auth';
import { getSmartPoolsUrl, getPoolsUrlForRole } from '../utils/navigation';

export interface NavbarProps {
  variant?: 'default' | 'fixed' | 'simple';
  isAuthenticated?: boolean;
  userRole?: 'borrower' | 'investor' | null;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  showProfileMenu?: boolean;
  onProfileMenuToggle?: (show: boolean) => void;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: (show: boolean) => void;
  className?: string;
}

export default function Navbar({
  variant = 'default',
  isAuthenticated = false,
  userRole = null,
  onLoginClick,
  onSignupClick,
  showProfileMenu = false,
  onProfileMenuToggle,
  showMobileMenu = false,
  onMobileMenuToggle,
  className = ''
}: NavbarProps) {
  
  // Internal state management for cases where parent doesn't control these
  const [internalShowProfileMenu, setInternalShowProfileMenu] = useState(false);
  const [internalShowMobileMenu, setInternalShowMobileMenu] = useState(false);
  
  // Use controlled props if provided, otherwise use internal state
  const profileMenuVisible = onProfileMenuToggle ? showProfileMenu : internalShowProfileMenu;
  const mobileMenuVisible = onMobileMenuToggle ? showMobileMenu : internalShowMobileMenu;
  
  const handleProfileMenuToggle = () => {
    if (onProfileMenuToggle) {
      onProfileMenuToggle(!showProfileMenu);
    } else {
      setInternalShowProfileMenu(!internalShowProfileMenu);
    }
  };
  
  const handleMobileMenuToggle = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle(!showMobileMenu);
    } else {
      setInternalShowMobileMenu(!internalShowMobileMenu);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/logout`, getAuthenticatedFetchOptions({
        method: 'POST'
      }));
      clearAuthData();
      // Close any open menus
      if (onProfileMenuToggle) onProfileMenuToggle(false);
      if (onMobileMenuToggle) onMobileMenuToggle(false);
      setInternalShowProfileMenu(false);
      setInternalShowMobileMenu(false);
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handlePoolsDashboardClick = async () => {
    try {
      if (userRole) {
        // If we know the user role, navigate directly
        const targetUrl = getSmartPoolsUrl(userRole);
        window.location.href = targetUrl;
        return;
      }
      
      // Otherwise, fetch the role from backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/me`, getAuthenticatedFetchOptions());
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          const role = data.role;
          window.location.href = getPoolsUrlForRole(role);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to fetch user role:', e);
    }
    
    // Fallback to login modal if available
    if (onLoginClick) {
      onLoginClick();
    }
  };

  // Header classes based on variant
  const getHeaderClasses = () => {
    const baseClasses = 'w-full px-4 sm:px-6 py-4 sm:py-6';
    
    switch (variant) {
      case 'fixed':
        return `${baseClasses} fixed top-0 left-0 bg-white border-b border-gray-100 z-50`;
      case 'simple':
        return baseClasses.replace('py-4 sm:py-6', 'py-6');
      default:
        return `${baseClasses} relative`;
    }
  };

  // Simple variant for signup pages
  if (variant === 'simple') {
    return (
      <header className={`${getHeaderClasses()} ${className}`}>
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.location.href = '/'}
          >
            <span 
              className="text-2xl font-bold text-blue-900"
              style={{fontFamily: 'var(--ep-font-avenir)'}}
            >
              EquiPool
            </span>
          </div>
          <button 
            className="text-gray-700 hover:text-blue-900 text-sm font-medium"
            style={{fontFamily: 'var(--ep-font-avenir)'}}
            onClick={() => window.location.href = '/'}
          >
            Home
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className={`${getHeaderClasses()} ${className}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => window.location.href = '/'}
        >
          <Image src="/logo-icon.svg" alt="EquiPool Logo" width={26} height={27} />
          <span 
            className="text-black text-xl font-bold" 
            style={{fontFamily: 'var(--ep-font-avenir)'}}
          >
            EquiPool
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <a 
            className="text-gray-700 text-sm font-medium cursor-pointer hover:text-blue-900" 
            style={{fontFamily: 'var(--ep-font-avenir)'}}
          >
            About Us
          </a>
          <a 
            className="text-gray-700 text-sm font-medium cursor-pointer hover:text-blue-900" 
            style={{fontFamily: 'var(--ep-font-avenir)'}}
          >
            Security
          </a>
          <div className="flex items-center gap-2">
            <a 
              className="text-gray-700 text-sm font-medium cursor-pointer hover:text-blue-900" 
              style={{fontFamily: 'var(--ep-font-avenir)'}}
            >
              Learn
            </a>
            <span 
              className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium" 
              style={{fontFamily: 'var(--ep-font-avenir)'}}
            >
              Soon
            </span>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
          onClick={handleMobileMenuToggle}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-500 ease-in-out ${mobileMenuVisible ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-500 ease-in-out ${mobileMenuVisible ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-500 ease-in-out ${mobileMenuVisible ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>

        {/* Desktop Auth Section */}
        <div className="hidden lg:flex items-center gap-4" style={{position:'relative'}}>
          {isAuthenticated ? (
            <>
              {/* Notifications Icon */}
              <div
                style={{
                  width: 56, 
                  height: 40, 
                  padding: '10px 16px', 
                  background: '#F4F4F4', 
                  borderRadius: 32, 
                  outline: '1px #E5E7EB solid', 
                  display: 'inline-flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  cursor: 'pointer'
                }}
                onClick={() => alert('Notifications placeholder')}
                aria-label="Notifications"
              >
                <Image src="/notifs.svg" alt="Notifications" width={16} height={16} />
              </div>
              
              {/* Profile Icon */}
              <div
                style={{
                  width: 56, 
                  height: 40, 
                  padding: '10px 16px', 
                  background: '#F4F4F4', 
                  borderRadius: 32, 
                  outline: '1px #E5E7EB solid', 
                  display: 'inline-flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  cursor: 'pointer', 
                  position: 'relative'
                }}
                onClick={handleProfileMenuToggle}
                aria-haspopup="menu"
                aria-expanded={profileMenuVisible}
              >
                <Image src="/profile.svg" alt="Profile" width={16} height={16} />
                
                {/* Profile Dropdown */}
                {profileMenuVisible && (
                  <div 
                    style={{
                      width: 220, 
                      padding: 24, 
                      position: 'absolute', 
                      top: 48, 
                      right: 0, 
                      background: '#F4F4F4', 
                      overflow: 'hidden', 
                      borderRadius: 24, 
                      outline: '1px #E5E7EB solid', 
                      display: 'inline-flex', 
                      flexDirection: 'column', 
                      justifyContent: 'flex-end', 
                      alignItems: 'flex-start', 
                      gap: 14, 
                      zIndex: 50
                    }} 
                    role="menu"
                  >
                    <button 
                      style={{
                        all: 'unset', 
                        alignSelf: 'stretch', 
                        color: 'black', 
                        fontSize: 16, 
                        fontFamily: 'var(--ep-font-avenir)', 
                        fontWeight: 500, 
                        cursor: 'pointer'
                      }} 
                      role="menuitem" 
                      onClick={handlePoolsDashboardClick}
                    >
                      Pools & Dashboard
                    </button>
                    <button 
                      style={{
                        all: 'unset', 
                        alignSelf: 'stretch', 
                        color: '#B2B2B2', 
                        fontSize: 16, 
                        fontFamily: 'var(--ep-font-avenir)', 
                        fontWeight: 500, 
                        cursor: 'pointer'
                      }} 
                      role="menuitem"
                    >
                      Profile
                    </button>
                    <button 
                      style={{
                        all: 'unset', 
                        alignSelf: 'stretch', 
                        color: '#CC4747', 
                        fontSize: 16, 
                        fontFamily: 'var(--ep-font-avenir)', 
                        fontWeight: 500, 
                        cursor: 'pointer'
                      }} 
                      role="menuitem" 
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button 
                className="px-4 py-2 text-gray-700 font-medium cursor-pointer hover:text-blue-900" 
                style={{fontFamily: 'var(--ep-font-avenir)', fontSize: '14px'}} 
                onClick={onLoginClick}
              >
                Login
              </button>
              <button 
                className="px-4 py-2 bg-blue-900 text-white font-medium rounded-lg cursor-pointer hover:bg-blue-800" 
                style={{fontFamily: 'var(--ep-font-avenir)', fontSize: '14px'}} 
                onClick={onSignupClick || (() => window.location.href = '/')}
              >
                Join Equipool
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuVisible && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 mt-0">
          <div className="px-4 py-4 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-3">
              <a 
                className="block text-gray-700 hover:text-blue-900 cursor-pointer py-2 text-base font-medium" 
                style={{fontFamily: 'var(--ep-font-avenir)'}}
              >
                About Us
              </a>
              <a 
                className="block text-gray-700 hover:text-blue-900 cursor-pointer py-2 text-base font-medium" 
                style={{fontFamily: 'var(--ep-font-avenir)'}}
              >
                Security
              </a>
              <div className="flex items-center gap-2 py-2">
                <a 
                  className="text-gray-700 hover:text-blue-900 cursor-pointer text-base font-medium" 
                  style={{fontFamily: 'var(--ep-font-avenir)'}}
                >
                  Learn
                </a>
                <span 
                  className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium" 
                  style={{fontFamily: 'var(--ep-font-avenir)'}}
                >
                  Soon
                </span>
              </div>
            </div>
            
            {/* Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <button 
                    className="w-full text-left py-2 text-black text-base font-medium"
                    style={{fontFamily: 'var(--ep-font-avenir)'}}
                    onClick={() => {
                      handlePoolsDashboardClick();
                      handleMobileMenuToggle();
                    }}
                  >
                    Pools & Dashboard
                  </button>
                  <button 
                    className="w-full text-left py-2 text-gray-500 text-base font-medium"
                    style={{fontFamily: 'var(--ep-font-avenir)'}}
                  >
                    Profile
                  </button>
                  <button 
                    className="w-full text-left py-2 text-red-600 text-base font-medium"
                    style={{fontFamily: 'var(--ep-font-avenir)'}}
                    onClick={() => {
                      handleLogout();
                      handleMobileMenuToggle();
                    }}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    className="w-full text-center py-3 border border-gray-200 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50"
                    style={{fontFamily: 'var(--ep-font-avenir)', fontSize: '14px'}}
                    onClick={() => {
                      if (onLoginClick) onLoginClick();
                      handleMobileMenuToggle();
                    }}
                  >
                    Login
                  </button>
                  <button 
                    className="w-full text-center py-3 rounded-lg text-white font-medium"
                    style={{
                      fontFamily: 'var(--ep-font-avenir)', 
                      fontSize: '14px',
                      background: 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)'
                    }}
                    onClick={() => {
                      if (onSignupClick) {
                        onSignupClick();
                      } else {
                        window.location.href = '/';
                      }
                      handleMobileMenuToggle();
                    }}
                  >
                    Join Equipool
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}