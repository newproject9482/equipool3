'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Toaster, useToaster } from '../../components/Toaster';

const LoginModal = dynamic(() => import('../../components/LoginModal'), { ssr: false });

export default function PoolsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  
  const { toasts, removeToast, showSuccess, showError } = useToaster();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled && data.authenticated) {
            setIsAuthenticated(true);
          }
          return;
        }
      } catch (error) {
        // Ignore auth check errors
      }
      // Fallback to localStorage
      if (!cancelled && typeof window !== 'undefined' && localStorage.getItem('ep-auth') === '1') {
        setIsAuthenticated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setShowProfileMenu(false);
      if (typeof window !== 'undefined') localStorage.removeItem('ep-auth');
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon.svg" alt="EquiPool Logo" width={26} height={27} />
          <span className="ep-nav-brand">EquiPool</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a className="ep-nav-link">About Us</a>
          <a className="ep-nav-link">Security</a>
          <div className="flex items-center gap-2">
            <a className="ep-nav-link">Learn</a>
            <span className="px-2 py-1 rounded bg-gray-100 ep-nav-soon">Soon</span>
          </div>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4" style={{position:'relative'}}>
          {isAuthenticated ? (
            <>
              {/* Notifications Icon */}
              <div
                style={{width: 56, height: 40, padding: '10px 16px', background: '#F4F4F4', borderRadius: 32, outline: '1px #E5E7EB solid', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'}}
              >
                <Image src="/notifs.svg" alt="Notifications" width={16} height={16} />
              </div>
              {/* Profile Icon (right / opens menu) */}
              <div
                style={{width: 56, height: 40, padding: '10px 16px', background: '#F4F4F4', borderRadius: 32, outline: '1px #E5E7EB solid', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', position: 'relative'}}
                onClick={() => setShowProfileMenu(v => !v)}
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
              >
                <Image src="/profile.svg" alt="Profile" width={16} height={16} />
                {showProfileMenu && (
                  <div style={{width: 220, padding: 24, position: 'absolute', top: 48, right: 0, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, outline: '1px #E5E7EB solid', display: 'inline-flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 14, zIndex: 50}} role="menu">
                    <button style={{all: 'unset', alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem">Pools & Dashboard</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#B2B2B2', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem">Profile</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#CC4747', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem" onClick={handleLogout}>Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="ep-nav-login" onClick={() => setShowLoginModal(true)} style={{cursor: 'pointer'}}>Login</button>
              <button className="ep-cta-join" onClick={() => window.location.href = '/'}>Join Equipool</button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{width: 1440, height: 515}}>
        <div style={{width: '100%', height: '100%', paddingTop: 120, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Overview</div>
            </div>
            <div style={{width: 1090, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'inline-flex'}}>
              <div style={{flex: '1 1 0', height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Total Borrowed</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 48, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$1 285 000</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(i) Total amount you&apos;ve received across all funded pools.</div>
                </div>
              </div>
              <div style={{flex: '1 1 0', height: 280, padding: 32, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Next Payment</div>
                </div>
                <div style={{alignSelf: 'stretch', flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>July 12</div>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 48, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$7843.32</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(i) Your upcoming repayment amount and due date.</div>
                </div>
              </div>
              <div style={{height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Active pools</div>
                </div>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 48, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>2</div>
                </div>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(i) Number of currently running loans.</div>
                </div>
              </div>
            </div>
            <div style={{alignSelf: 'stretch', paddingLeft: 40, paddingRight: 40, paddingTop: 24, paddingBottom: 24, background: '#E4EFFF', overflow: 'hidden', borderRadius: 24, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
              <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                <div style={{flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Create a pool</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Start a new funding request backed by your property.<br/>Define your loan amount, term, and target return — we&apos;ll guide you from there.</div>
                </div>
              </div>
              <div style={{width: 40, height: 40, position: 'relative', background: 'white', overflow: 'hidden', borderRadius: 40, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Image src="/add_pool.svg" alt="Add Pool" width={26} height={26} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* All Pools Section */}
      <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, paddingTop: 80, paddingBottom: 80, marginTop: 80, position: 'relative', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex'}}>
        <div style={{width: 1093, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
            <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>All Pools</div>
                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Active</div>
                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pending</div>
                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Archive</div>
            </div>
            <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex'}}>
                <div style={{color: 'var(--Grey, #767676)', fontSize: 14, fontFamily: 'var(--ep-font-var(--ep-font-avenir))', fontWeight: '500', wordWrap: 'break-word'}}>Filters</div>
                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.88889 4H10.1111C10.2143 4 10.3132 4.04162 10.3861 4.11571C10.459 4.1898 10.5 4.29028 10.5 4.39506V5.02162C10.5 5.12638 10.459 5.22685 10.3861 5.30092L7.89172 7.83482C7.81879 7.90889 7.7778 8.00935 7.77778 8.11412V10.605C7.77778 10.665 7.7643 10.7243 7.73837 10.7782C7.71244 10.8322 7.67474 10.8794 7.62814 10.9164C7.58154 10.9533 7.52726 10.979 7.46942 10.9914C7.41159 11.0039 7.35173 11.0028 7.29439 10.9882L6.51661 10.7906C6.43252 10.7692 6.35787 10.7199 6.30453 10.6505C6.2512 10.581 6.22222 10.4955 6.22222 10.4074V8.11412C6.2222 8.00935 6.18121 7.90889 6.10828 7.83482L3.61394 5.30092C3.54101 5.22685 3.50002 5.12638 3.5 5.02162V4.39506C3.5 4.29028 3.54097 4.1898 3.6139 4.11571C3.68683 4.04162 3.78575 4 3.88889 4Z" stroke="#767676" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div data-left-icon="true" data-state="filter" style={{paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 4, display: 'flex'}}>
                <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.91667 2H2.08333C1.6231 2 1.25 2.3731 1.25 2.83333V7.41667C1.25 7.8769 1.6231 8.25 2.08333 8.25H7.91667C8.3769 8.25 8.75 7.8769 8.75 7.41667V2.83333C8.75 2.3731 8.3769 2 7.91667 2Z" stroke="black"/>
                    <path d="M1.25 3.66667C1.25 2.88083 1.25 2.48833 1.49417 2.24417C1.73833 2 2.13083 2 2.91667 2H7.08333C7.86917 2 8.26167 2 8.50583 2.24417C8.75 2.48833 8.75 2.88083 8.75 3.66667H1.25Z" fill="black"/>
                    <path d="M2.91406 0.75V2M7.08073 0.75V2" stroke="black" strokeLinecap="round"/>
                </svg>
                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Date Created</div>
            </div>
        </div>
  <div style={{width: '100%', height: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 350px)', gap: 24, justifyContent: 'start', alignItems: 'start'}}>
  <div style={{
    width: 350,
    height: 355,
    padding: 32,
    paddingBottom: 12,
    background: 'white',
    borderRadius: 24,
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    {/* Header */}
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#DDF4E6',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#65CC8E', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Active Liability</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>$350 000</div>
    </div>

    {/* Progress Bar Section */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>34% Paid</div>
      <div style={{position: 'relative', height: 8, width: '100%'}}>
        <div style={{
          width: '100%',
          height: 8,
          background: '#E5E7EB',
          borderRadius: 50,
          position: 'absolute'
        }} />
        <div style={{
          width: '34%',
          height: 8,
          background: 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)',
          borderRadius: 50,
          position: 'absolute'
        }} />
      </div>
    </div>

    {/* Details Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 16,
      height: 'auto'
    }}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Equity pool</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Flexible</div>
      </div>
    </div>

    {/* View Pool Button */}
    <div style={{
      padding: '8px 16px',
      borderRadius: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer'
    }}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>View Pool</div>
      <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
      </svg>
    </div>
  </div>
  <div style={{
    width: 350,
    height: 355,
    padding: 32,
    paddingBottom: 12,
    background: 'white',
    borderRadius: 24,
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    {/* Header */}
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#DDF4E6',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#65CC8E', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Active Liability</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>$350 000</div>
    </div>

    {/* Progress Bar Section */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>12% Paid</div>
      <div style={{position: 'relative', height: 8, width: '100%'}}>
        <div style={{
          width: '100%',
          height: 8,
          background: '#E5E7EB',
          borderRadius: 50,
          position: 'absolute'
        }} />
        <div style={{
          width: '12%',
          height: 8,
          background: 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)',
          borderRadius: 50,
          position: 'absolute'
        }} />
      </div>
    </div>

    {/* Details Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 16,
      height: 'auto'
    }}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Equity pool</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Flexible</div>
      </div>
    </div>

    {/* View Pool Button */}
    <div style={{
      padding: '8px 16px',
      borderRadius: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer'
    }}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>View Pool</div>
      <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
      </svg>
    </div>
  </div>
  <div style={{
    width: 350,
    height: 355,
    padding: 32,
    paddingBottom: 12,
    background: 'white',
    borderRadius: 24,
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    {/* Header */}
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#F4F4F4',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#767676', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Draft</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>$350 000</div>
    </div>

    {/* Details Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 16,
      height: 'auto'
    }}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Equity pool</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Flexible</div>
      </div>
    </div>

    {/* View Pool Button */}
    <div style={{
      padding: '8px 16px',
      borderRadius: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer'
    }}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>View Pool</div>
      <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
      </svg>
    </div>
  </div>
  <div style={{
    width: 350,
    height: 355,
    padding: 32,
    paddingBottom: 12,
    background: 'white',
    borderRadius: 24,
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    {/* Header */}
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#F7E6D6',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#DBAC7E', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>System Pending</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>$350 000</div>
    </div>

    {/* Details Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 16,
      height: 'auto'
    }}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Refinancing</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Flexible</div>
      </div>
    </div>

    {/* View Pool Button */}
    <div style={{
      padding: '8px 16px',
      borderRadius: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer'
    }}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>View Pool</div>
      <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
      </svg>
    </div>
  </div>
  <div style={{
    width: 350,
    height: 355,
    padding: 32,
    paddingBottom: 12,
    background: 'white',
    borderRadius: 24,
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    {/* Header */}
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#D6E0ED',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#6592CC', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Awaiting Investors</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>$350 000</div>
    </div>

    {/* Details Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 16,
      height: 'auto'
    }}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Equity pool</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Flexible</div>
      </div>
    </div>

    {/* View Pool Button */}
    <div style={{
      padding: '8px 16px',
      borderRadius: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer'
    }}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>View Pool</div>
      <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
      </svg>
    </div>
  </div>
  <div style={{
    width: 350,
    height: 355,
    padding: 32,
    paddingBottom: 12,
    background: 'white',
    borderRadius: 24,
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    {/* Header */}
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#DECBEF',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#9A65CC', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Funded</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>$350 000</div>
    </div>

    {/* Details Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 16,
      height: 'auto'
    }}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Refinancing</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Flexible</div>
      </div>
    </div>

    {/* View Pool Button */}
    <div style={{
      padding: '8px 16px',
      borderRadius: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer'
    }}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>View Pool</div>
      <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
      </svg>
    </div>
  </div>
  <div style={{
    width: 350,
    height: 355,
    padding: 32,
    paddingBottom: 12,
    background: 'white',
    borderRadius: 24,
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    {/* Header */}
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#D6D6D6',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#784B1B', borderRadius: '50%'}} />
        <div style={{color: '#767676', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Closed</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>$350 000</div>
    </div>

    {/* Details Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 16,
      height: 'auto'
    }}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Refinancing</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Flexible</div>
      </div>
    </div>

    {/* View Pool Button */}
    <div style={{
      padding: '8px 16px',
      borderRadius: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer'
    }}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>View Pool</div>
      <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
      </svg>
    </div>
  </div>
  <div style={{
    width: 350,
    height: 355,
    padding: 32,
    paddingBottom: 12,
    background: 'white',
    borderRadius: 24,
    border: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    {/* Header */}
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#E7D8D8',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#CC4747', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Rejected</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>$350 000</div>
    </div>

    {/* Details Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: 16,
      height: 'auto'
    }}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Refinancing</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Flexible</div>
      </div>
    </div>

    {/* View Pool Button */}
    <div style={{
      padding: '8px 16px',
      borderRadius: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer'
    }}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>View Pool</div>
      <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
      </svg>
    </div>
  </div>
</div>
      </div>

      {/* Footer */}
      <div style={{width: '100%', height: '100%', paddingTop: 32, paddingBottom: 32, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 48, display: 'inline-flex', marginTop: 160}}>
        <div style={{width: 1080, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 130, display: 'inline-flex'}}>
            <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 40, display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
                    <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Quick Links</div>
                    </div>
                    <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                        <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Active Pools</div>
                    </div>
                    <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                        <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>About Us</div>
                    </div>
                    <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                        <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Security</div>
                    </div>
                    <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
                        <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Learn</div>
                        <div style={{paddingLeft: 6, paddingRight: 6, paddingTop: 3, paddingBottom: 3, background: '#F5F5F5', borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                            <div style={{color: '#4A5565', fontSize: 10, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Soon</div>
                        </div>
                    </div>
                </div>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
                    <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                        <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Terms of Service</div>
                    </div>
                    <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                        <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Privacy Policy</div>
                    </div>
                </div>
            </div>
            <div style={{width: 71, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                    <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Support</div>
                </div>
                <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                    <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Contact Us</div>
                </div>
                <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                    <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>FAQs</div>
                </div>
            </div>
            <div style={{width: 104, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                <div style={{borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                    <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Socials</div>
                </div>
                <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                    <Image src="/mdi-instagram.svg" alt="Instagram" width={24} height={24} />
                    <Image src="/ic-baseline-facebook.svg" alt="Facebook" width={24} height={24} />
                    <Image src="/mdi-linkedin.svg" alt="LinkedIn" width={24} height={24} />
                </div>
            </div>
            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                    <div style={{color: 'black', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Stay Ahead of the Curve</div>
                    <div style={{alignSelf: 'stretch', color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Be the first to discover newly launched pools, platform updates, and investor insights — right in your inbox.</div>
                </div>
                <div style={{alignSelf: 'stretch', paddingTop: 4, paddingBottom: 4, paddingLeft: 16, paddingRight: 4, background: '#F4F4F4', borderRadius: 30, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                    <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', borderRadius: 6, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'inline-flex'}}>
                            <input
                              type="email"
                              value={newsletterEmail}
                              onChange={(e) => setNewsletterEmail(e.target.value)}
                              placeholder="Enter your email"
                              style={{
                                width: '100%',
                                backgroundColor: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#767676',
                                fontSize: 14,
                                fontFamily: 'var(--ep-font-avenir)',
                                fontWeight: '500'
                              }}
                            />
                        </div>
                    </div>
                    <div 
                      style={{
                        alignSelf: 'stretch', 
                        paddingLeft: 12, 
                        paddingRight: 12, 
                        paddingTop: 6, 
                        paddingBottom: 6, 
                        background: '#113D7B', 
                        boxShadow: '0px 1px 0.5px 0.05000000074505806px rgba(29, 41, 61, 0.02)', 
                        borderRadius: 12, 
                        outline: '1px #E5E7EB solid', 
                        outlineOffset: '-1px', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 6, 
                        display: 'flex',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (newsletterEmail.trim()) {
                          showSuccess('Successfully subscribed to newsletter!');
                          setNewsletterEmail('');
                        } else {
                          showError('Please enter a valid email address');
                        }
                      }}
                    >
                        <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Submit</div>
                    </div>
                </div>
            </div>
        </div>
        <div style={{width: 1080, color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 2, wordWrap: 'break-word'}}>Security & Legal Equipool is a private lending marketplace that connects individual borrowers and accredited investors through secured, property-backed loans. All identities are verified, and sensitive data is encrypted and stored securely in compliance with GDPR and other data privacy regulations. Equipool is not a licensed financial institution. We partner with third-party financial service providers to process payments and hold funds in escrow. All lending agreements are executed via legally binding contracts reviewed by independent legal partners. Investments made through Equipool are not insured by any government protection scheme. As with any private loan, the value of your investment can go up or down — you may lose part or all of your invested capital.  © 2025 Equipool. All rights reserved.</div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignUp={() => { setShowLoginModal(false); window.location.href = '/'; }}
          onSuccess={(role) => { setIsAuthenticated(true); setShowLoginModal(false); }}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}
      
      <Toaster toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
