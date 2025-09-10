'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Toaster, useToaster } from '../../components/Toaster';
import { getAuthenticatedFetchOptions, clearAuthData } from '../../utils/auth';
import { getPoolsUrlForRole, getSmartPoolsUrl } from '../../utils/navigation';

const LoginModal = dynamic(() => import('../../components/LoginModal'), { ssr: false });

export default function InvestorPoolsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'borrower' | 'investor' | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [investmentPools, setInvestmentPools] = useState<any[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);
  
  const { toasts, removeToast, showSuccess, showError } = useToaster();

  // Function to fetch investment opportunities
  const fetchInvestmentPools = async () => {
    if (!isAuthenticated || userRole !== 'investor') {
      return;
    }

    setLoadingPools(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const poolsUrl = `${backendUrl}/api/investor/pools`;
      
      const response = await fetch(poolsUrl, getAuthenticatedFetchOptions({
        method: 'GET'
      }));

      if (response.ok) {
        const result = await response.json();
        setInvestmentPools(result.pools || []);
      } else {
        console.error('Failed to fetch investment pools, status:', response.status);
        setInvestmentPools([]);
      }
    } catch (error) {
      console.error('Error fetching investment pools:', error);
      setInvestmentPools([]);
    } finally {
      setLoadingPools(false);
    }
  };

  // Fetch investment pools when authenticated as investor
  useEffect(() => {
    if (isAuthenticated && userRole === 'investor') {
      fetchInvestmentPools();
    }
  }, [isAuthenticated, userRole]);

  // Check authentication and role
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const authUrl = `${backendUrl}/api/auth/me`;
        
        console.log('[DEBUG] Checking authentication with URL:', authUrl);
        
        const response = await fetch(authUrl, getAuthenticatedFetchOptions());
        
        console.log('[DEBUG] Auth check response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[DEBUG] Auth check response data:', data);
          if (!cancelled && data.authenticated) {
            setIsAuthenticated(true);
            setUserRole(data.role);
            
            // Redirect borrowers to the borrower pools page
            if (data.role === 'borrower') {
              console.log('[DEBUG] Redirecting borrower to /pools');
              router.push(getPoolsUrlForRole('borrower'));
              return;
            }
          } else {
            // Not authenticated, redirect to home
            console.log('[DEBUG] Not authenticated, redirecting to home');
            router.push('/');
            return;
          }
        } else {
          console.log('[DEBUG] Auth check failed with status:', response.status);
          // Not authenticated, redirect to home
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('[DEBUG] Auth check error:', error);
        // On error, redirect to home
        if (!cancelled) {
          router.push('/');
          return;
        }
      }
      
      if (!cancelled) {
        setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/logout`, getAuthenticatedFetchOptions({
        method: 'POST'
      }));
      setIsAuthenticated(false);
      setUserRole(null);
      setShowProfileMenu(false);
      clearAuthData();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render if user is authenticated and is an investor
  if (!isAuthenticated || userRole !== 'investor') {
    return null; // This should not happen due to the redirect in useEffect
  }

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
                    <button style={{all: 'unset', alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem" onClick={() => {
                      console.log('Pools & Dashboard clicked. userRole:', userRole);
                      const targetUrl = getSmartPoolsUrl(userRole);
                      console.log('Redirecting to:', targetUrl);
                      window.location.href = targetUrl;
                    }}>Pools & Dashboard</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#B2B2B2', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem">Profile</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#CC4747', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem" onClick={handleLogout}>Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button 
                className="ep-nav-login-btn"
                onClick={() => setShowLoginModal(true)}
              >
                Log in
              </button>
              <button 
                className="ep-nav-join-btn"
                onClick={() => window.location.href = '/'}
              >
                Join EquiPool
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{width: '100%', maxWidth: 1440, height: 515, margin: '0 auto'}}>
        <div style={{width: '100%', height: '100%', paddingTop: 120, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pools & Dashboard</div>
            </div>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Overview</div>
            </div>
            <div style={{width: 1090, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                <div style={{flex: '1 1 0', height: 280, padding: 32, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Total Invested</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$1 285 000</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(i) Total amount you've received across all funded pools.</div>
                    </div>
                </div>
                <div style={{flex: '1 1 0', height: 280, padding: 32, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Current ROI</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>%14.5</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(i) Your upcoming repayment amount and due date.</div>
                    </div>
                </div>
                <div style={{flex: '1 1 0', height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Active pools</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>3</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(i) Number of currently running loans.</div>
                    </div>
                </div>
                <div style={{flex: '1 1 0', height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pending payouts</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>July 12</div>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$7843.32</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(i) Number of currently running loans.</div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pools Exploration Section */}
      <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, paddingTop: 80, paddingBottom: 80, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex'}}>
        <div style={{width: 1093, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
            <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'flex'}}>
                <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Explore Pools</div>
                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>My Investments</div>
                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Archive</div>
            </div>
            <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex'}}>
                <div style={{color: 'var(--Grey, #767676)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Filters</div>
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
        <div style={{width: '100%', maxWidth: 1122, height: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 350px)', gap: 24, justifyContent: 'flex-start', alignItems: 'start', margin: '24px 0 0 0'}}>
          {loadingPools ? (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 40,
              color: '#767676',
              fontSize: 16,
              fontFamily: 'var(--ep-font-avenir)',
              fontWeight: '500'
            }}>
              Loading investment opportunities...
            </div>
          ) : investmentPools.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 40,
              gap: 16
            }}>
              <div style={{
                color: '#767676',
                fontSize: 18,
                fontFamily: 'var(--ep-font-avenir)',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                No investment opportunities available at the moment.
              </div>
            </div>
          ) : (
            investmentPools.map((pool) => (
              <div key={pool.id} style={{width: 350, height: 355, paddingTop: 20, paddingBottom: 12, paddingLeft: 20, paddingRight: 20, background: 'var(--White, white)', overflow: 'hidden', borderRadius: 24, outline: '1px #113D7B solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                    <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>#{pool.id.toString().padStart(6, '0')}</div>
                    <div data-property-1="Available to invest" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 4, paddingBottom: 4, background: '#CBD764', borderRadius: 50, justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex'}}>
                      <div style={{width: 8, height: 8, background: '#7E8C03', borderRadius: 9999}} />
                      <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Available to invest</div>
                    </div>
                  </div>
                  <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                    <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 2, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: '#113D7B', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Requested amount</div>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>${parseFloat(pool.amount).toLocaleString()}</div>
                      </div>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 6, display: 'flex', marginTop: 8}}>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                          <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>ROI Rate</div>
                          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{pool.roiRate}%</div>
                        </div>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                          <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Date Created</div>
                          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{new Date(pool.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                          <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Borrower</div>
                          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{pool.borrowerName}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 2, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                        <div style={{color: '#113D7B', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property Location</div>
                        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', lineHeight: 1.3}}>{pool.address}</div>
                      </div>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 6, display: 'flex', marginTop: 8}}>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                          <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Terms</div>
                          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{pool.roiRate}% / {pool.termMonths} Months</div>
                        </div>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                          <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Type</div>
                          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{pool.poolType === 'equity' ? 'Equity pool' : 'Refinance pool'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div data-left-icon="true" data-state="secondary" style={{paddingTop: 8, paddingLeft: 16, paddingRight: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 4, display: 'inline-flex', cursor: 'pointer'}} onClick={() => {/* TODO: Navigate to pool detail */}}>
                    <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>View Pool</div>
                    <Image src="/weui-arrow-filled_right.svg" alt="Arrow Right" width={14} height={14} />
                  </div>
              </div>
            ))
          )}
        </div>
        </div>

      {/* Footer */}
      <div style={{width: '100%', height: '100%', paddingTop: 32, paddingBottom: 32, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 48, display: 'inline-flex', marginTop: 160}}>
        <div style={{width: 1080, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 130, display: 'inline-flex'}}>
            <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 40, display: 'inline-flex'}}>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'flex'}}>
                    <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <Image src="/logo-icon.svg" alt="EquiPool" width={26} height={27} />
                        <div style={{color: '#091024', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>EquiPool</div>
                    </div>
                    <div style={{width: 359, color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.5, wordWrap: 'break-word'}}>Unlock the power of real estate investing. Join a growing community of smart investors and property owners.</div>
                </div>
                <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'inline-flex'}}>
                    <Image src="/ic-baseline-facebook.svg" alt="Facebook" width={20} height={20} style={{cursor: 'pointer'}} />
                    <Image src="/mdi-instagram.svg" alt="Instagram" width={20} height={20} style={{cursor: 'pointer'}} />
                    <Image src="/mdi-linkedin.svg" alt="LinkedIn" width={20} height={20} style={{cursor: 'pointer'}} />
                </div>
            </div>
            <div style={{width: 71, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '700', wordWrap: 'break-word'}}>Company</div>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                    <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}}>About Us</div>
                    <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}}>Careers</div>
                </div>
            </div>
            <div style={{width: 104, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '700', wordWrap: 'break-word'}}>Resources</div>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                    <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}}>Help Center</div>
                    <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}}>Privacy Policy</div>
                    <div style={{color: '#4A5565', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word', cursor: 'pointer'}}>Terms of Service</div>
                </div>
            </div>
            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '700', wordWrap: 'break-word'}}>Subscribe to our newsletter</div>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'flex'}}>
                    <div style={{color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>Monthly digest of what's new and exciting from us.</div>
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <input 
                            style={{flex: '1 1 0', height: 40, paddingLeft: 12, paddingRight: 12, background: 'white', borderRadius: 8, border: '1px #D1D5DB solid', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', outline: 'none'}}
                            placeholder="Enter your email"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                        />
                        <button style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: '#113D7B', borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex', border: 'none', cursor: 'pointer'}}>
                            <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Subscribe</div>
                        </button>
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
          onSuccess={() => { 
            setIsAuthenticated(true); 
            setShowLoginModal(false); 
            // Refresh the page to re-check user role
            window.location.reload();
          }}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}
      
      <Toaster toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
