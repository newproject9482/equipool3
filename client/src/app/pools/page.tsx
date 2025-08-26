'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const LoginModal = dynamic(() => import('../../components/LoginModal'), { ssr: false });

export default function PoolsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'borrower' | 'investor' | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setSelectedRole(data.role);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setSelectedRole(null);
      setShowProfileMenu(false);
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
          <a href="/" className="ep-nav-brand" style={{ textDecoration: 'none' }}>EquiPool</a>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a className="ep-nav-link">About Us</a>
          <a className="ep-nav-link">Security</a>
          <a className="ep-nav-link">Learn</a>
          <span className="px-2 py-1 rounded bg-gray-100 ep-nav-soon">Soon</span>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
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
              <div style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pools & Dashboard /</div>
            </div>
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
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(i) Total amount you've received across all funded pools.</div>
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
                  <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Start a new funding request backed by your property.<br/>Define your loan amount, term, and target return — we'll guide you from there.</div>
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
                <div data-icon="ic:filter" style={{width: 14, height: 14, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 7, height: 7, left: 3.50, top: 3.50, position: 'absolute', outline: '1px var(--Grey, #767676) solid', outlineOffset: '-0.50px'}} />
                </div>
            </div>
            <div data-left-icon="true" data-state="filter" style={{paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 4, display: 'flex'}}>
                <div data-icon="ic:calendar" style={{width: 12, height: 12, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 7.50, height: 6.25, left: 2.25, top: 3.50, position: 'absolute', outline: '1px var(--Black, black) solid', outlineOffset: '-0.50px'}} />
                    <div style={{width: 7.50, height: 1.67, left: 2.25, top: 3.50, position: 'absolute', background: 'var(--Black, black)'}} />
                    <div style={{width: 4.17, height: 1.25, left: 3.91, top: 2.25, position: 'absolute', outline: '1px var(--Black, black) solid', outlineOffset: '-0.50px'}} />
                </div>
                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Date Created</div>
            </div>
        </div>
  <div style={{width: '100%', height: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 350px)', gap: 24, justifyContent: 'start', alignItems: 'start'}}>
  <div style={{width: 350, height: 355, padding: 32, background: 'var(--White, white)', borderRadius: 24, border: '1px #E5E7EB solid', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'Avenir', fontWeight: '400', wordWrap: 'break-word'}}>#EP010525</div>
      <div style={{paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, background: '#DDF4E6', borderRadius: 50, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex'}}>
        <div style={{width: 8, height: 8, background: '#65CC8E', borderRadius: 9999}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Active Liability</div>
      </div>
    </div>
    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
        <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Pool Amount</div>
        <div style={{color: 'black', fontSize: 32, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>$350 000</div>
      </div>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
        <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>34% Paid</div>
        <div style={{alignSelf: 'stretch', height: 8, position: 'relative'}}>
          <div style={{width: '100%', height: 8, position: 'absolute', background: '#E5E7EB', borderRadius: 50}} />
          <div style={{width: '34%', height: 8, position: 'absolute', background: 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)', borderRadius: 50}} />
        </div>
      </div>
    </div>
    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
      <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
          <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Date Created</div>
          <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>01/05/2025</div>
        </div>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
          <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Type</div>
          <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Equity pool</div>
        </div>
      </div>
      <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
          <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Terms</div>
          <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>12% / 24 Months</div>
        </div>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
          <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Repayment</div>
          <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Flexible</div>
        </div>
      </div>
    </div>
    <div style={{paddingTop: 8, paddingLeft: 16, paddingRight: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>View Pool</div>
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
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'Avenir', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#DDF4E6',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#65CC8E', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Active Liability</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'Avenir', fontWeight: '500'}}>$350 000</div>
    </div>

    {/* Progress Bar Section */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>12% Paid</div>
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
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Equity pool</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Flexible</div>
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
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>View Pool</div>
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
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'Avenir', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#F4F4F4',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#767676', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Draft</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'Avenir', fontWeight: '500'}}>$350 000</div>
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
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Equity pool</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Flexible</div>
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
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>View Pool</div>
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
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'Avenir', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#F7E6D6',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#DBAC7E', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>System Pending</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'Avenir', fontWeight: '500'}}>$350 000</div>
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
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Refinancing</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Flexible</div>
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
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>View Pool</div>
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
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'Avenir', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#D6E0ED',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#6592CC', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Awaiting Investors</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'Avenir', fontWeight: '500'}}>$350 000</div>
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
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Equity pool</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Flexible</div>
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
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>View Pool</div>
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
      <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'Avenir', fontWeight: '400', lineHeight: '20px'}}>#EP010525</div>
      <div style={{
        padding: '4px 10px',
        background: '#DECBEF',
        borderRadius: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <div style={{width: 8, height: 8, background: '#9A65CC', borderRadius: '50%'}} />
        <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Funded</div>
      </div>
    </div>

    {/* Pool Amount */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Pool Amount</div>
      <div style={{color: 'black', fontSize: 32, fontFamily: 'Avenir', fontWeight: '500'}}>$350 000</div>
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
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>01/05/2025</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Refinancing</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>12% / 24 Months</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>Repayment</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500'}}>Flexible</div>
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
      <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500'}}>View Pool</div>
      <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
      </svg>
    </div>
  </div>
  <div style={{width: 350, height: 355, paddingTop: 32, paddingBottom: 12, paddingLeft: 32, paddingRight: 32, background: 'var(--White, white)', overflow: 'hidden', borderRadius: 24, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
    <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 20, wordWrap: 'break-word'}}>#EP010525</div>
      <div data-property-1="closed" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, background: '#D6D6D6', borderRadius: 50, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex'}}>
        <div style={{width: 8, height: 8, background: '#784B1B', borderRadius: 9999}} />
        <div style={{color: 'var(--Grey, #767676)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Closed</div>
      </div>
    </div>
    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pool Amount</div>
      <div style={{alignSelf: 'stretch', color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$350 000</div>
    </div>
    <div style={{alignSelf: 'stretch', height: 97, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
        <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>01/05/2025</div>
      </div>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
        <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Refinancing</div>
      </div>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
        <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>12% / 24 Months</div>
      </div>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
        <div style={{alignSelf: 'stretch', color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Repayment</div>
        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Flexible</div>
      </div>
    </div>
    <div data-left-icon="true" data-state="secondary" style={{paddingTop: 8, paddingLeft: 16, paddingRight: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>View Pool</div>
      <div data-icon="ic:arrowright" style={{width: 12, height: 12, position: 'relative', overflow: 'hidden'}}>
        <div style={{width: 4.50, height: 9, left: 3.75, top: 1.50, position: 'absolute', background: 'var(--Black, black)'}} />
      </div>
    </div>
  </div>
  <div style={{width: 350, height: 355, paddingTop: 32, paddingBottom: 12, paddingLeft: 32, paddingRight: 32, background: 'var(--White, white)', overflow: 'hidden', borderRadius: 24, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
    <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 20, wordWrap: 'break-word'}}>#EP010525</div>
      <div data-property-1="rejected" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, background: '#E7D8D8', borderRadius: 50, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex'}}>
        <div style={{width: 8, height: 8, background: 'var(--Error, #CC4747)', borderRadius: 9999}} />
        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Rejected</div>
      </div>
    </div>
    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pool Amount</div>
      <div style={{alignSelf: 'stretch', color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$350 000</div>
    </div>
    <div style={{alignSelf: 'stretch', height: 97, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
        <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Date Created</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>01/05/2025</div>
      </div>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
        <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Type</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Refinancing</div>
      </div>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
        <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Terms</div>
        <div style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>12% / 24 Months</div>
      </div>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
        <div style={{alignSelf: 'stretch', color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Repayment</div>
        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Flexible</div>
      </div>
    </div>
    <div data-left-icon="true" data-state="secondary" style={{paddingTop: 8, paddingLeft: 16, paddingRight: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
      <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>View Pool</div>
      <div data-icon="ic:arrowright" style={{width: 12, height: 12, position: 'relative', overflow: 'hidden'}}>
        <div style={{width: 4.50, height: 9, left: 3.75, top: 1.50, position: 'absolute', background: 'var(--Black, black)'}} />
      </div>
    </div>
  </div>
</div>
        <div style={{padding: 24, left: 1256, top: 110, position: 'absolute', background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 14, display: 'flex'}}>
            <div style={{alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Newest</div>
            <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Oldest</div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{marginTop: 160}}>
        <div style={{width: '100%', height: '100%', paddingTop: 10, paddingBottom: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, display: 'inline-flex'}}>
          <div style={{width: 1080, color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 2, wordWrap: 'break-word'}}>
            Security & Legal Equipool is a private lending marketplace that connects individual borrowers and accredited investors through secured, property-backed loans. All identities are verified, and sensitive data is encrypted and stored securely in compliance with GDPR and other data privacy regulations. Equipool is not a licensed financial institution. We partner with third-party financial service providers to process payments and hold funds in escrow. All lending agreements are executed via legally binding contracts reviewed by independent legal partners. Investments made through Equipool are not insured by any government protection scheme. As with any private loan, the value of your investment can go up or down — you may lose part or all of your invested capital. © 2025 Equipool. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignUp={() => { setShowLoginModal(false); window.location.href = '/'; }}
          onSuccess={(role) => { setIsAuthenticated(true); setSelectedRole(role); setShowLoginModal(false); }}
        />
      )}
    </div>
  );
}
