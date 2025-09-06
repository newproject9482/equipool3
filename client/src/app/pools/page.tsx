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
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  
  // Pool creation states
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPoolType, setSelectedPoolType] = useState('');
  
  const { toasts, removeToast, showSuccess, showError } = useToaster();

  // Hover states for pool type cards
  const [equityHover, setEquityHover] = useState(false);
  const [refinanceHover, setRefinanceHover] = useState(false);

  // Editable states for overview
  const [totalBorrowed, setTotalBorrowed] = useState('$1 285 000');
  const [nextPaymentDate, setNextPaymentDate] = useState('July 12');
  const [nextPaymentAmount, setNextPaymentAmount] = useState('$7843.32');
  const [activePools, setActivePools] = useState('2');

  // Editable states for pools
  const [pool1Amount, setPool1Amount] = useState('$350 000');
  const [pool1Date, setPool1Date] = useState('01/05/2025');
  const [pool1Type, setPool1Type] = useState('Equity pool');
  const [pool1Terms, setPool1Terms] = useState('12% / 24 Months');
  const [pool1Repayment, setPool1Repayment] = useState('Flexible');
  const [pool1Progress, setPool1Progress] = useState('34');

  const [pool2Amount, setPool2Amount] = useState('$350 000');
  const [pool2Date, setPool2Date] = useState('01/05/2025');
  const [pool2Type, setPool2Type] = useState('Equity pool');
  const [pool2Terms, setPool2Terms] = useState('12% / 24 Months');
  const [pool2Repayment, setPool2Repayment] = useState('Flexible');
  const [pool2Progress, setPool2Progress] = useState('12');

  const [pool3Amount, setPool3Amount] = useState('$350 000');
  const [pool3Date, setPool3Date] = useState('01/05/2025');
  const [pool3Type, setPool3Type] = useState('Equity pool');
  const [pool3Terms, setPool3Terms] = useState('12% / 24 Months');
  const [pool3Repayment, setPool3Repayment] = useState('Flexible');

  const [pool4Amount, setPool4Amount] = useState('$350 000');
  const [pool4Date, setPool4Date] = useState('01/05/2025');
  const [pool4Type, setPool4Type] = useState('Refinancing');
  const [pool4Terms, setPool4Terms] = useState('12% / 24 Months');
  const [pool4Repayment, setPool4Repayment] = useState('Flexible');

  const [pool5Amount, setPool5Amount] = useState('$350 000');
  const [pool5Date, setPool5Date] = useState('01/05/2025');
  const [pool5Type, setPool5Type] = useState('Equity pool');
  const [pool5Terms, setPool5Terms] = useState('12% / 24 Months');
  const [pool5Repayment, setPool5Repayment] = useState('Flexible');

  const [pool6Amount, setPool6Amount] = useState('$350 000');
  const [pool6Date, setPool6Date] = useState('01/05/2025');
  const [pool6Type, setPool6Type] = useState('Refinancing');
  const [pool6Terms, setPool6Terms] = useState('12% / 24 Months');
  const [pool6Repayment, setPool6Repayment] = useState('Flexible');

  const [pool7Amount, setPool7Amount] = useState('$350 000');
  const [pool7Date, setPool7Date] = useState('01/05/2025');
  const [pool7Type, setPool7Type] = useState('Refinancing');
  const [pool7Terms, setPool7Terms] = useState('12% / 24 Months');
  const [pool7Repayment, setPool7Repayment] = useState('Flexible');

  const [pool8Amount, setPool8Amount] = useState('$350 000');
  const [pool8Date, setPool8Date] = useState('01/05/2025');
  const [pool8Type, setPool8Type] = useState('Refinancing');
  const [pool8Terms, setPool8Terms] = useState('12% / 24 Months');
  const [pool8Repayment, setPool8Repayment] = useState('Flexible');

  // Address form state
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [percentOwned, setPercentOwned] = useState('');
  const [coOwner, setCoOwner] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [mortgageBalance, setMortgageBalance] = useState('');
  const [propertyLink, setPropertyLink] = useState('');

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

  const handlePoolTypeSelect = (poolType: string) => {
    setSelectedPoolType(poolType);
    setCurrentStep(2);
  };

  const handleCloseModal = () => {
    setShowCreatePoolModal(false);
    setCurrentStep(1);
    setSelectedPoolType('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
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
      <main style={{width: '100%', maxWidth: 1440, height: 515, margin: '0 auto'}}>
        <div style={{width: '100%', height: '100%', paddingTop: 120, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
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
                  <input
                    value={totalBorrowed}
                    onChange={(e) => setTotalBorrowed(e.target.value)}
                    style={{
                      alignSelf: 'stretch',
                      color: 'black',
                      fontSize: 48,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      padding: 0,
                      margin: 0,
                      width: '100%'
                    }}
                  />
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
                  <input
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    style={{
                      alignSelf: 'stretch',
                      color: 'var(--Black, black)',
                      fontSize: 24,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      padding: 0,
                      margin: 0,
                      width: '100%'
                    }}
                  />
                  <input
                    value={nextPaymentAmount}
                    onChange={(e) => setNextPaymentAmount(e.target.value)}
                    style={{
                      alignSelf: 'stretch',
                      color: 'black',
                      fontSize: 48,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      padding: 0,
                      margin: 0,
                      width: '100%'
                    }}
                  />
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
                  <input
                    value={activePools}
                    onChange={(e) => setActivePools(e.target.value)}
                    style={{
                      alignSelf: 'stretch',
                      color: 'black',
                      fontSize: 48,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      padding: 0,
                      margin: 0,
                      width: '100%'
                    }}
                  />
                </div>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(i) Number of currently running loans.</div>
                </div>
              </div>
            </div>
            <div 
              style={{alignSelf: 'stretch', paddingLeft: 40, paddingRight: 40, paddingTop: 24, paddingBottom: 24, background: '#E4EFFF', overflow: 'hidden', borderRadius: 24, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex', cursor: 'pointer'}}
              onClick={() => setShowCreatePoolModal(true)}
            >
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
      <div style={{width: '100%', maxWidth: 1440, height: '100%', padding: '80px 20px', margin: '80px auto 0 auto', position: 'relative', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
        <div style={{width: '100%', maxWidth: 1093, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
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
  <div style={{width: '100%', maxWidth: 1122, height: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 350px)', gap: 24, justifyContent: 'center', alignItems: 'start', margin: '24px auto 0 auto'}}>
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
      <input
        value={pool1Amount}
        onChange={(e) => setPool1Amount(e.target.value)}
        style={{
          color: 'black',
          fontSize: 32,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: '500',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          padding: 0,
          margin: 0,
          width: '100%'
        }}
      />
    </div>

    {/* Progress Bar Section */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>
        <input
          value={pool1Progress}
          onChange={(e) => setPool1Progress(e.target.value)}
          style={{
            color: 'black',
            fontSize: 14,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '30px'
          }}
        />% Paid
      </div>
      <div style={{position: 'relative', height: 8, width: '100%'}}>
        <div style={{
          width: '100%',
          height: 8,
          background: '#E5E7EB',
          borderRadius: 50,
          position: 'absolute'
        }} />
        <div style={{
          width: `${pool1Progress}%`,
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
        <input
          value={pool1Date}
          onChange={(e) => setPool1Date(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <input
          value={pool1Type}
          onChange={(e) => setPool1Type(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <input
          value={pool1Terms}
          onChange={(e) => setPool1Terms(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <input
          value={pool1Repayment}
          onChange={(e) => setPool1Repayment(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
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
      <input
        value={pool2Amount}
        onChange={(e) => setPool2Amount(e.target.value)}
        style={{
          color: 'black',
          fontSize: 32,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: '500',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          padding: 0,
          margin: 0,
          width: '100%'
        }}
      />
    </div>

    {/* Progress Bar Section */}
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>
        <input
          value={pool2Progress}
          onChange={(e) => setPool2Progress(e.target.value)}
          style={{
            color: 'black',
            fontSize: 14,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '30px'
          }}
        />% Paid
      </div>
      <div style={{position: 'relative', height: 8, width: '100%'}}>
        <div style={{
          width: '100%',
          height: 8,
          background: '#E5E7EB',
          borderRadius: 50,
          position: 'absolute'
        }} />
        <div style={{
          width: `${pool2Progress}%`,
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
        <input
          value={pool2Date}
          onChange={(e) => setPool2Date(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%',

            cursor: 'text',

            zIndex: 1,

            position: 'relative'
}}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <input
          value={pool2Type}
          onChange={(e) => setPool2Type(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%',

            cursor: 'text',

            zIndex: 1,

            position: 'relative'
}}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <input
          value={pool2Terms}
          onChange={(e) => setPool2Terms(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%',

            cursor: 'text',

            zIndex: 1,

            position: 'relative'
}}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <input
          value={pool2Repayment}
          onChange={(e) => setPool2Repayment(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%',

            cursor: 'text',

            zIndex: 1,

            position: 'relative'
}}
        />
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
      <input
        value={pool3Amount}
        onChange={(e) => setPool3Amount(e.target.value)}
        style={{
          color: 'black',
          fontSize: 32,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: '500',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          padding: 0,
          margin: 0,
          width: '100%',

          cursor: 'text',

          zIndex: 1,

          position: 'relative'
}}
      />
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
        <input
          value={pool3Date}
          onChange={(e) => setPool3Date(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%',

            cursor: 'text',

            zIndex: 1,

            position: 'relative'
}}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <input
          value={pool3Type}
          onChange={(e) => setPool3Type(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%',

            cursor: 'text',

            zIndex: 1,

            position: 'relative'
}}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <input
          value={pool3Terms}
          onChange={(e) => setPool3Terms(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%',

            cursor: 'text',

            zIndex: 1,

            position: 'relative'
}}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <input
          value={pool3Repayment}
          onChange={(e) => setPool3Repayment(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%',

            cursor: 'text',

            zIndex: 1,

            position: 'relative'
}}
        />
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
      <input
        value={pool4Amount}
        onChange={(e) => setPool4Amount(e.target.value)}
        style={{
          color: 'black',
          fontSize: 32,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: '500',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          padding: 0,
          margin: 0,
          width: '100%'
        }}
      />
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
        <input
          value={pool4Date}
          onChange={(e) => setPool4Date(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <input
          value={pool4Type}
          onChange={(e) => setPool4Type(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <input
          value={pool4Terms}
          onChange={(e) => setPool4Terms(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <input
          value={pool4Repayment}
          onChange={(e) => setPool4Repayment(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
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
      <input
        value={pool5Amount}
        onChange={(e) => setPool5Amount(e.target.value)}
        style={{
          color: 'black',
          fontSize: 32,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: '500',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          padding: 0,
          margin: 0,
          width: '100%'
        }}
      />
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
        <input
          value={pool5Date}
          onChange={(e) => setPool5Date(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <input
          value={pool5Type}
          onChange={(e) => setPool5Type(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <input
          value={pool5Terms}
          onChange={(e) => setPool5Terms(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <input
          value={pool5Repayment}
          onChange={(e) => setPool5Repayment(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
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
      <input
        value={pool6Amount}
        onChange={(e) => setPool6Amount(e.target.value)}
        style={{
          color: 'black',
          fontSize: 32,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: '500',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          padding: 0,
          margin: 0,
          width: '100%'
        }}
      />
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
        <input
          value={pool6Date}
          onChange={(e) => setPool6Date(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <input
          value={pool6Type}
          onChange={(e) => setPool6Type(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <input
          value={pool6Terms}
          onChange={(e) => setPool6Terms(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <input
          value={pool6Repayment}
          onChange={(e) => setPool6Repayment(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
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
      <input
        value={pool7Amount}
        onChange={(e) => setPool7Amount(e.target.value)}
        style={{
          color: 'black',
          fontSize: 32,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: '500',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          padding: 0,
          margin: 0,
          width: '100%'
        }}
      />
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
        <input
          value={pool7Date}
          onChange={(e) => setPool7Date(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <input
          value={pool7Type}
          onChange={(e) => setPool7Type(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <input
          value={pool7Terms}
          onChange={(e) => setPool7Terms(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <input
          value={pool7Repayment}
          onChange={(e) => setPool7Repayment(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
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
      <input
        value={pool8Amount}
        onChange={(e) => setPool8Amount(e.target.value)}
        style={{
          color: 'black',
          fontSize: 32,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: '500',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          padding: 0,
          margin: 0,
          width: '100%'
        }}
      />
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
        <input
          value={pool8Date}
          onChange={(e) => setPool8Date(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
        <input
          value={pool8Type}
          onChange={(e) => setPool8Type(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
        <input
          value={pool8Terms}
          onChange={(e) => setPool8Terms(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
        <input
          value={pool8Repayment}
          onChange={(e) => setPool8Repayment(e.target.value)}
          style={{
            color: 'black',
            fontSize: 16,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}
        />
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

      {/* Create Pool Modal */}
      {showCreatePoolModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseModal}
        >
          <div 
            style={{
              width: 658,
              height: 592,
              backgroundColor: 'white',
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '100%', 
              height: '100%', 
              padding: 24, 
              flexDirection: 'column', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 16, 
              display: 'flex',
              overflow: 'auto'
            }}>
              {/* Header Section */}
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                      <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                          <div style={{color: 'black', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1.2, wordWrap: 'break-word'}}>Creating a Pool</div>
                      </div>
                      <div 
                        style={{width: 32, height: 32, position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                        onClick={handleCloseModal}
                      >
                          <div style={{width: 18.67, height: 18.67, background: 'black'}} />
                      </div>
                  </div>
                  
                  {/* Progress Steps - Made Responsive */}
                  <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 8}}>
                      <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex'}}>
                          <div style={{width: 24, height: 24, background: '#F4F4F4', borderRadius: 50, outline: currentStep >= 1 ? '1px #113D7B solid' : '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                              <div style={{textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1, wordWrap: 'break-word'}}>1</div>
                          </div>
                          <div style={{color: 'black', fontSize: 11, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.2, wordWrap: 'break-word'}}>Pool Type</div>
                      </div>
                      <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>{'>'}</div>
                      <div style={{opacity: currentStep >= 2 ? 1 : 0.50, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex'}}>
                          <div style={{width: 24, height: 24, background: '#F4F4F4', borderRadius: 50, outline: currentStep >= 2 ? '1px #113D7B solid' : '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                              <div style={{textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1, wordWrap: 'break-word'}}>2</div>
                          </div>
                          <div style={{color: 'black', fontSize: 11, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.2, wordWrap: 'break-word'}}>Property Info</div>
                      </div>
                      <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>{'>'}</div>
                      <div style={{opacity: currentStep >= 3 ? 1 : 0.50, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex'}}>
                          <div style={{width: 24, height: 24, background: '#F4F4F4', borderRadius: 50, outline: currentStep >= 3 ? '1px #113D7B solid' : '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                              <div style={{textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1, wordWrap: 'break-word'}}>3</div>
                          </div>
                          <div style={{color: 'black', fontSize: 11, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.2, wordWrap: 'break-word'}}>Pool Terms</div>
                      </div>
                      <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>{'>'}</div>
                      <div style={{opacity: currentStep >= 4 ? 1 : 0.50, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex'}}>
                          <div style={{width: 24, height: 24, background: '#F4F4F4', borderRadius: 50, outline: currentStep >= 4 ? '1px #113D7B solid' : '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                              <div style={{textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1, wordWrap: 'break-word'}}>4</div>
                          </div>
                          <div style={{color: 'black', fontSize: 11, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.2, wordWrap: 'break-word'}}>Documents</div>
                      </div>
                      <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>{'>'}</div>
                      <div style={{opacity: currentStep >= 5 ? 1 : 0.50, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex'}}>
                          <div style={{width: 24, height: 24, background: '#F4F4F4', borderRadius: 50, outline: currentStep >= 5 ? '1px #113D7B solid' : '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                              <div style={{textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1, wordWrap: 'break-word'}}>5</div>
                          </div>
                          <div style={{color: 'black', fontSize: 11, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.2, wordWrap: 'break-word'}}>Liability & Credit Info</div>
                      </div>
                  </div>
              </div>
              
              {/* Step Content */}
              {currentStep === 1 && (
                /* Pool Type Cards */
                <div style={{alignSelf: 'stretch', flex: '1 1 0', paddingLeft: 8, paddingRight: 8, paddingTop: 8, paddingBottom: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
                    <div style={{width: 480, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                        <div 
                          style={{
                            width: 229, 
                            height: 245, 
                            padding: 24, 
                            background: 'white', 
                            borderRadius: 24, 
                            outline: '1px #E5E7EB solid', 
                            outlineOffset: '-1px', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start', 
                            display: 'inline-flex', 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: equityHover ? 'translateY(-2px)' : 'translateY(0)',
                            boxShadow: equityHover ? '0px 8px 20px rgba(17, 61, 123, 0.15)' : '0px 2px 4px rgba(0, 0, 0, 0.05)'
                          }}
                          onMouseEnter={() => setEquityHover(true)}
                          onMouseLeave={() => setEquityHover(false)}
                          onClick={() => handlePoolTypeSelect('equity')}
                        >
                          <div style={{width: 40, height: 40, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Image src="/window.svg" alt="Equity Pool icon" width={32} height={32} />
                          </div>
                          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                            <div style={{textAlign: 'center', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Equity Pool</div>
                            <div style={{alignSelf: 'stretch', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Borrowing against home value</div>
                            <div style={{alignSelf: 'stretch', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>(i) Equity pools are ideal when you want to tap into your home's value for cash.</div>
                          </div>
                        </div>
                        <div 
                          style={{
                            width: 229, 
                            height: 245, 
                            padding: 24, 
                            background: 'white', 
                            borderRadius: 24, 
                            outline: '1px #E5E7EB solid', 
                            outlineOffset: '-1px', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start', 
                            display: 'inline-flex', 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: refinanceHover ? 'translateY(-2px)' : 'translateY(0)',
                            boxShadow: refinanceHover ? '0px 8px 20px rgba(17, 61, 123, 0.15)' : '0px 2px 4px rgba(0, 0, 0, 0.05)'
                          }}
                          onMouseEnter={() => setRefinanceHover(true)}
                          onMouseLeave={() => setRefinanceHover(false)}
                          onClick={() => handlePoolTypeSelect('refinance')}
                        >
                          <div style={{width: 40, height: 40, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Image src="/invest.svg" alt="Refinance Pool icon" width={32} height={32} />
                          </div>
                          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                            <div style={{textAlign: 'center', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Refinance Pool</div>
                            <div style={{alignSelf: 'stretch', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Pay off existing mortgage or debt</div>
                            <div style={{alignSelf: 'stretch', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>(i) Refinance pools help you replace high-interest loans with smarter terms.</div>
                          </div>
                        </div>
                    </div>
                </div>
              )}

              {currentStep === 2 && (
                /* Property Info Form */
                <div style={{
                  alignSelf: 'stretch', 
                  flex: '1 1 0', 
                  padding: '24px 32px', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-start', 
                  alignItems: 'flex-start', 
                  gap: 24, 
                  display: 'flex',
                  overflow: 'auto'
                }}>
                  <div style={{width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'inline-flex'}}>
                      <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Address</div>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                              <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                <input
                                  type="text"
                                  value={addressLine}
                                  onChange={(e) => setAddressLine(e.target.value)}
                                  placeholder="Address Line"
                                  style={{
                                    flex: '1 1 0',
                                    color: addressLine ? 'black' : 'var(--Mid-Grey, #B2B2B2)',
                                    fontSize: 14,
                                    fontFamily: 'var(--ep-font-avenir)',
                                    fontWeight: '500',
                                    wordWrap: 'break-word',
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    width: '100%'
                                  }}
                                />
                              </div>
                          </div>
                          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                              <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                                  <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                      <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="City"
                                        style={{
                                          flex: '1 1 0',
                                          color: city ? 'black' : 'var(--Mid-Grey, #B2B2B2)',
                                          fontSize: 14,
                                          fontFamily: 'var(--ep-font-avenir)',
                                          fontWeight: '500',
                                          wordWrap: 'break-word',
                                          border: 'none',
                                          background: 'transparent',
                                          outline: 'none',
                                          width: '100%'
                                        }}
                                      />
                                  </div>
                                  <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                      <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        placeholder="State"
                                        style={{
                                          flex: '1 1 0',
                                          color: state ? 'black' : 'var(--Mid-Grey, #B2B2B2)',
                                          fontSize: 14,
                                          fontFamily: 'var(--ep-font-avenir)',
                                          fontWeight: '500',
                                          wordWrap: 'break-word',
                                          border: 'none',
                                          background: 'transparent',
                                          outline: 'none',
                                          width: '100%'
                                        }}
                                      />
                                  </div>
                              </div>
                              <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                                  <div data-righticon="false" data-state="default" style={{flex: '1 1 0', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                      <input
                                        type="text"
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
                                        placeholder="Zip Code"
                                        style={{
                                          flex: '1 1 0',
                                          color: zipCode ? 'black' : 'var(--Mid-Grey, #B2B2B2)',
                                          fontSize: 14,
                                          fontFamily: 'var(--ep-font-avenir)',
                                          fontWeight: '500',
                                          wordWrap: 'break-word',
                                          border: 'none',
                                          background: 'transparent',
                                          outline: 'none',
                                          width: '100%'
                                        }}
                                      />
                                  </div>
                                  <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, outline: '1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                      <div style={{flex: '1 1 0', color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>United States</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div style={{flex: '1 1 0', borderRadius: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Ownership</div>
                          </div>
                          <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>If you own less than 100%, please list the name(s) of any co-owners. Separate multiple names with a comma.</div>
                          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                              <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                  <input
                                    type="text"
                                    value={percentOwned}
                                    onChange={(e) => setPercentOwned(e.target.value)}
                                    placeholder="% Owned"
                                    style={{
                                      flex: '1 1 0',
                                      color: percentOwned ? 'black' : 'var(--Mid-Grey, #B2B2B2)',
                                      fontSize: 14,
                                      fontFamily: 'var(--ep-font-avenir)',
                                      fontWeight: '500',
                                      wordWrap: 'break-word',
                                      border: 'none',
                                      background: 'transparent',
                                      outline: 'none',
                                      width: '100%'
                                    }}
                                  />
                              </div>
                              <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                                  <input
                                    type="text"
                                    value={coOwner}
                                    onChange={(e) => setCoOwner(e.target.value)}
                                    placeholder="Co owner (Optional)"
                                    style={{
                                      flex: '1 1 0',
                                      color: coOwner ? 'black' : 'var(--Mid-Grey, #B2B2B2)',
                                      fontSize: 14,
                                      fontFamily: 'var(--ep-font-avenir)',
                                      fontWeight: '500',
                                      wordWrap: 'break-word',
                                      border: 'none',
                                      background: 'transparent',
                                      outline: 'none',
                                      width: '100%'
                                    }}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div style={{width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'inline-flex'}}>
                      <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property value</div>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                          </div>
                          <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>Enter your best estimate of the property's current market value. This helps us validate and underwrite your loan faster.</div>
                          <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                              <input
                                type="text"
                                value={propertyValue}
                                onChange={(e) => setPropertyValue(e.target.value)}
                                placeholder="e.g. 100 000"
                                style={{
                                  flex: '1 1 0',
                                  color: propertyValue ? 'var(--Black, black)' : 'var(--Mid-Grey, #B2B2B2)',
                                  fontSize: 14,
                                  fontFamily: 'var(--ep-font-avenir)',
                                  fontWeight: '500',
                                  wordWrap: 'break-word',
                                  border: 'none',
                                  background: 'transparent',
                                  outline: 'none',
                                  width: '100%'
                                }}
                              />
                          </div>
                      </div>
                      <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property link</div>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                          </div>
                          <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>If no link is provided or the URL doesn't lead to a valid listing, we may request a formal appraisal document in the next step to verify your property's value.</div>
                          <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                              <input
                                type="text"
                                value={propertyLink}
                                onChange={(e) => setPropertyLink(e.target.value)}
                                placeholder="e.g. Zillow, Redfin etc."
                                style={{
                                  flex: '1 1 0',
                                  color: propertyLink ? 'var(--Black, black)' : 'var(--Mid-Grey, #B2B2B2)',
                                  fontSize: 14,
                                  fontFamily: 'var(--ep-font-avenir)',
                                  fontWeight: '500',
                                  wordWrap: 'break-word',
                                  border: 'none',
                                  background: 'transparent',
                                  outline: 'none',
                                  width: '100%'
                                }}
                              />
                          </div>
                      </div>
                  </div>
                  
                  <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                      <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 2, display: 'inline-flex'}}>
                          <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Total mortgage balance</div>
                          <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                      </div>
                      <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>Enter your best estimate of the property's current market value. This helps us validate and underwrite your loan faster.</div>
                      <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                          <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                          <input
                            type="text"
                            value={mortgageBalance}
                            onChange={(e) => setMortgageBalance(e.target.value)}
                            placeholder="e.g. 100 000"
                            style={{
                              flex: '1 1 0',
                              color: mortgageBalance ? 'var(--Black, black)' : 'var(--Mid-Grey, #B2B2B2)',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word',
                              border: 'none',
                              background: 'transparent',
                              outline: 'none',
                              width: '100%'
                            }}
                          />
                      </div>
                  </div>
                  
                  {/* Footer Component */}
                  <div style={{alignSelf: 'stretch', marginTop: 24, display: 'flex', justifyContent: 'center'}}>
                      <div 
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          background: (addressLine && city && state && zipCode && percentOwned) ? '#113D7B' : '#B2B2B2',
                          borderRadius: 6,
                          cursor: (addressLine && city && state && zipCode && percentOwned) ? 'pointer' : 'not-allowed',
                          width: 'auto',
                          opacity: (addressLine && city && state && zipCode && percentOwned) ? 1 : 0.6
                        }}
                        onClick={() => {
                          if (addressLine && city && state && zipCode && percentOwned) {
                            setCurrentStep(3);
                          }
                        }}
                      >
                          <div style={{
                              color: 'white',
                              fontSize: 11,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500'
                          }}>Continue</div>
                      </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                /* Pool Terms - Form Content */
                <div style={{
                  alignSelf: 'stretch', 
                  flex: '1 1 0', 
                  padding: '24px 32px', 
                  flexDirection: 'column', 
                  justifyContent: 'flex-start', 
                  alignItems: 'flex-start', 
                  gap: 24, 
                  display: 'flex',
                  overflow: 'auto'
                }}>
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'flex'}}>
                    
                    {/* Amount Input */}
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                      <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Amount</div>
                        <div style={{color: '#767676', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>How much are you requesting?</div>
                      </div>
                      <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: '#F4F4F4', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                        <input
                          type="text"
                          placeholder="e.g. 350 000"
                          style={{
                            flex: '1 1 0',
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word',
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            width: '100%'
                          }}
                        />
                      </div>
                    </div>

                    {/* Pool ROI / Interest Rate Input */}
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                      <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pool ROI / Interest rate</div>
                          <div style={{padding: '2px 8px', background: '#E7F3FF', borderRadius: 4, justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                            <div style={{color: '#0066CC', fontSize: 10, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>Recommended range: 6% – 12%</div>
                          </div>
                        </div>
                        <div style={{color: '#767676', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>What return are you offering to your investor?</div>
                      </div>
                      <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: '#F4F4F4', borderRadius: 10, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>%</div>
                        <div style={{width: 16, height: 16, position: 'relative'}}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 0L9.79 5.52L16 4.64L11.36 8L16 11.36L9.79 10.48L8 16L6.21 10.48L0 11.36L4.64 8L0 4.64L6.21 5.52L8 0Z" fill="#B2B2B2"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Term Selection */}
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                      <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Term</div>
                        <div style={{color: '#767676', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>How long will you need to repay the loan?</div>
                      </div>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'flex'}}>
                        
                        {/* 6 Months Option */}
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                          <div style={{width: 16, height: 16, position: 'relative'}}>
                            <div style={{width: 16, height: 16, border: '1.5px #B2B2B2 solid', borderRadius: 50}} />
                          </div>
                          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>6 Months</div>
                        </div>

                        {/* 12 Months Option (Selected) */}
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                          <div style={{width: 16, height: 16, position: 'relative'}}>
                            <div style={{width: 16, height: 16, background: '#113D7B', borderRadius: 50}} />
                            <div style={{width: 6, height: 6, background: 'white', borderRadius: 50, position: 'absolute', top: 5, left: 5}} />
                          </div>
                          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>12 Months</div>
                        </div>

                        {/* 24 Months Option */}
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                          <div style={{width: 16, height: 16, position: 'relative'}}>
                            <div style={{width: 16, height: 16, border: '1.5px #B2B2B2 solid', borderRadius: 50}} />
                          </div>
                          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>24 Months</div>
                        </div>

                        {/* Or Custom */}
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                          <div style={{color: '#767676', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>or</div>
                          <div style={{padding: '4px 8px', background: '#F4F4F4', borderRadius: 6, justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                            <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Custom</div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Toaster toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
