'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { getAuthenticatedFetchOptions, clearAuthData } from '../../../utils/auth';

export default function InvestorPoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const poolId = params?.poolId as string;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<'borrower' | 'investor' | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'investments'>('overview');

  // Pool detail state
  interface PoolDetail {
    id: number;
    poolType: string;
    status: string;
    amount: string;
    roiRate?: string;
    term?: string;
    termMonths?: number;
    customTermMonths?: number | null;
    fundingProgress?: number;
    createdAt?: string;
    updatedAt?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    percentOwned?: string;
    coOwner?: string | null;
    propertyValue?: string | null;
    propertyLink?: string | null;
    mortgageBalance?: string | null;
  }

  const [poolData, setPoolData] = useState<PoolDetail | null>(null);
  const [loadingPool, setLoadingPool] = useState(false);
  const [poolError, setPoolError] = useState<string | null>(null);

  // Investment state
  interface Investment {
    id: number;
    amount: string;
    status: string;
    investedAt: string;
    pool: PoolDetail;
  }

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(false);
  const [investing, setInvesting] = useState(false);
  const [hasInvested, setHasInvested] = useState(false);
  const [userInvestment, setUserInvestment] = useState<Investment | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const authUrl = `${backendUrl}/api/auth/me`;

        console.log('[DEBUG] Checking auth for pool detail page...');
        const response = await fetch(authUrl, getAuthenticatedFetchOptions());
        console.log('[DEBUG] Auth response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[DEBUG] Auth data:', data);

          if (!cancelled && data.authenticated) {
            setIsAuthenticated(true);
            setUserRole(data.role);

            // Only redirect if definitely not an investor
            if (data.role !== 'investor') {
              console.log('[DEBUG] User is not investor, but allowing access anyway');
              // router.push('/');
              // return;
            }
          } else {
            console.log('[DEBUG] User not authenticated');
            // Don't redirect immediately, let them see the page
            // router.push('/');
            // return;
          }
        } else {
          console.log('[DEBUG] Auth check failed, status:', response.status);
          // Don't redirect immediately, let them see the page
          // router.push('/');
          // return;
        }
      } catch (error) {
        console.error('[DEBUG] Auth check error:', error);
        // Don't redirect on error, let them see the page
        // if (!cancelled) {
        //   router.push('/');
        //   return;
        // }
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  // Fetch pool detail by numeric id
  useEffect(() => {
    let cancelled = false;
    const fetchPool = async () => {
      if (!poolId) return; // Only require poolId, not authentication
      const numericMatch = poolId.match(/(\d+)/);
      const numericId = numericMatch ? numericMatch[0] : poolId;
      setLoadingPool(true);
      setPoolError(null);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        console.log('[DEBUG] Fetching pool data from:', `${backendUrl}/api/investor/pools/${numericId}`);
        const resp = await fetch(`${backendUrl}/api/investor/pools/${numericId}`, getAuthenticatedFetchOptions({
          method: 'GET'
        }));
        console.log('[DEBUG] Pool fetch response status:', resp.status);

        if (!resp.ok) {
          if (resp.status === 401 || resp.status === 403) {
            setPoolError('Please log in to view pool details');
          } else {
            setPoolError(`Failed to load pool (status ${resp.status})`);
          }
          setPoolData(null);
        } else {
          const data = await resp.json();
          console.log('[DEBUG] Pool data received:', data);
          if (!cancelled) setPoolData(data);
        }
      } catch (err: unknown) {
        console.error('[DEBUG] Error fetching pool:', err);
        if (!cancelled) {
          const e = err as Error;
          setPoolError(e?.message || 'Network error');
        }
        setPoolData(null);
      } finally {
        if (!cancelled) setLoadingPool(false);
      }
    };
    fetchPool();
    return () => { cancelled = true; };
  }, [poolId]);

  const fetchInvestments = useCallback(async () => {
    setLoadingInvestments(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/investor/investments`, getAuthenticatedFetchOptions());
      
      if (response.ok) {
        const data = await response.json();
        const allInvestments = data.investments || [];
        setInvestments(allInvestments);
        
        // Check if user has invested in current pool
        if (poolData) {
          const currentPoolInvestment = allInvestments.find((inv: Investment) => inv.pool.id === poolData.id);
          setHasInvested(!!currentPoolInvestment);
          setUserInvestment(currentPoolInvestment || null);
        }
      } else {
        console.error('Failed to fetch investments');
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoadingInvestments(false);
    }
  }, [poolData]);

  // Fetch investments when investments tab is active
  useEffect(() => {
    if (activeTab === 'investments' && isAuthenticated && userRole === 'investor') {
      fetchInvestments();
    }
  }, [activeTab, isAuthenticated, userRole, fetchInvestments]);

  // Check user investment status when pool data changes
  useEffect(() => {
    if (poolData && isAuthenticated && userRole === 'investor') {
      fetchInvestments();
    }
  }, [poolData, isAuthenticated, userRole, fetchInvestments]);

  const handleInvest = async () => {
    if (!poolData || hasInvested) return;
    
    setInvesting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/investor/pools/${poolData.id}/invest`, {
        ...getAuthenticatedFetchOptions(),
        method: 'POST',
        body: JSON.stringify({
          amount: poolData.amount // Invest the full amount for now
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update investment status
        setHasInvested(true);
        setUserInvestment(data.investment);
        
        // Show success message
        alert('Investment successful! You can now view this investment in your "My Investments" tab.');
        
        // Refresh investments data
        fetchInvestments();
        
        // Redirect to investments tab after a short delay
        setTimeout(() => {
          router.push('/pools-investor');
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(`Investment failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Investment error:', error);
      alert('Investment failed. Please try again.');
    } finally {
      setInvesting(false);
    }
  };

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
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated or not an investor
  if (isAuthenticated === false || (isAuthenticated && userRole !== 'investor')) {
    console.log('[DEBUG] Authentication check failed:', { isAuthenticated, userRole });
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Please log in as an investor to view pool details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/pools-investor'}>
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
                    <button style={{all: 'unset', alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem" onClick={() => window.location.href = '/pools-investor'}>Pools & Dashboard</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#B2B2B2', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem">Profile</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#CC4747', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem" onClick={handleLogout}>Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="ep-nav-login" style={{cursor: 'pointer'}}>Login</button>
              <button className="ep-cta-join" onClick={() => window.location.href = '/'}>Join Equipool</button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{width: '100%', maxWidth: 1440, margin: '0 auto', padding: '40px 20px'}}>
        <div style={{width: '100%', height: '100%', paddingTop: 120, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
          <div style={{alignSelf: 'stretch', paddingLeft: 140, paddingRight: 140, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
            {/* Breadcrumb */}
            <div style={{alignSelf: 'stretch', paddingBottom: 16}}>
              <div>
                <span style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pools & Dashboard </span>
                <span style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}> &gt; Pool #{poolId}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
              alignSelf: 'stretch',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 32,
              display: 'flex',
              paddingBottom: 24,
              borderBottom: '1px solid #E5E7EB'
            }}>
              <div style={{
                color: activeTab === 'overview' ? '#113D7B' : '#767676',
                fontSize: 18,
                fontFamily: 'var(--ep-font-avenir)',
                fontWeight: '600',
                wordWrap: 'break-word',
                paddingBottom: 8,
                borderBottom: activeTab === 'overview' ? '2px solid #113D7B' : 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onClick={() => setActiveTab('overview')}
              onMouseEnter={(e) => {
                if (activeTab !== 'overview') e.currentTarget.style.color = '#113D7B';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'overview') e.currentTarget.style.color = '#767676';
              }}
              >
                Overview
              </div>
              <div style={{
                color: activeTab === 'documents' ? '#113D7B' : '#767676',
                fontSize: 18,
                fontFamily: 'var(--ep-font-avenir)',
                fontWeight: '600',
                wordWrap: 'break-word',
                paddingBottom: 8,
                borderBottom: activeTab === 'documents' ? '2px solid #113D7B' : 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onClick={() => setActiveTab('documents')}
              onMouseEnter={(e) => {
                if (activeTab !== 'documents') e.currentTarget.style.color = '#113D7B';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'documents') e.currentTarget.style.color = '#767676';
              }}
              >
                Assigned Documents
              </div>
              <div style={{
                color: activeTab === 'investments' ? '#113D7B' : '#767676',
                fontSize: 18,
                fontFamily: 'var(--ep-font-avenir)',
                fontWeight: '600',
                wordWrap: 'break-word',
                paddingBottom: 8,
                borderBottom: activeTab === 'investments' ? '2px solid #113D7B' : 'none',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onClick={() => setActiveTab('investments')}
              onMouseEnter={(e) => {
                if (activeTab !== 'investments') e.currentTarget.style.color = '#113D7B';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'investments') e.currentTarget.style.color = '#767676';
              }}
              >
                My Investments
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Pool Content - Overview Section */}
                <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                  <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Investment Pool Details</div>
                </div>

                {/* Pool Overview Card */}
                {loadingPool ? (
                  <div style={{alignSelf: 'stretch', textAlign: 'center', padding: 40}}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p style={{color: '#767676', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Loading pool details...</p>
                  </div>
                ) : poolError ? (
                  <div style={{alignSelf: 'stretch', textAlign: 'center', padding: 40}}>
                    <p style={{color: '#CC4747', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>{poolError}</p>
                  </div>
                ) : poolData ? (
                  <div style={{
                    width: '100%',
                    padding: 32,
                    background: 'white',
                    borderRadius: 24,
                    border: '1px solid #E5E7EB',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 32,
                    display: 'flex'
                  }}>
                    {/* Header Section */}
                    <div style={{
                      alignSelf: 'stretch',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      display: 'flex'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: 20,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>
                        Pool #EP{poolId} - Overview
                      </div>
                      <div style={{
                        paddingLeft: 10,
                        paddingRight: 10,
                        paddingTop: 4,
                        paddingBottom: 4,
                        background: '#CBD764',
                        borderRadius: 50,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 6,
                        display: 'flex'
                      }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          background: '#7E8C03',
                          borderRadius: 9999
                        }} />
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>
                          Available to invest
                        </div>
                      </div>
                    </div>

                    {/* Pool Repayment Section */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        display: 'flex'
                      }}>
                        <div style={{
                          color: '#113D7B',
                          fontSize: 16,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>
                          Pool Repayment
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          color: 'black',
                          fontSize: 32,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>
                          ${poolData.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Pool Information Section */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 16,
                      display: 'flex'
                    }}>
                      <div style={{
                        alignSelf: 'stretch',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#113D7B',
                        fontSize: 16,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>
                        Pool Information
                      </div>
                      <div style={{
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 12,
                        display: 'flex'
                      }}>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Date Created
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            {poolData.createdAt ? new Date(poolData.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Start Date
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            --/--/----
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            End Date
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            --/--/----
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Type
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            {poolData.poolType || 'Equity pool'}
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Requested amount
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            ${poolData.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Terms
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            {poolData.roiRate ? `${poolData.roiRate}%` : ''} {poolData.term ? `/ ${poolData.term}` : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Property Info Section */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      gap: 16,
                      display: 'flex'
                    }}>
                      <div style={{
                        alignSelf: 'stretch',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex'
                      }}>
                        <div style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: 8,
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#113D7B',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Property Info
                          </div>
                        </div>
                      </div>
                      <div style={{
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 12,
                        display: 'flex'
                      }}>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Address
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word',
                            textAlign: 'right'
                          }}>
                            {poolData.addressLine ? `${poolData.addressLine}, ${poolData.city}, ${poolData.state} ${poolData.zipCode}` : 'N/A'}
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Co-owner(s)
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            {poolData.coOwner || 'N/A'}
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Property Link
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            textDecoration: 'underline',
                            wordWrap: 'break-word',
                            cursor: 'pointer'
                          }}>
                            {poolData.propertyLink || 'N/A'}
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Property value
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            ${poolData.propertyValue || 'N/A'}
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Total mortgage balance
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            ${poolData.mortgageBalance || 'N/A'}
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Ownership
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            {poolData.percentOwned ? `${poolData.percentOwned}% Owned` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Invest Button */}
                    <div style={{
                      alignSelf: 'stretch',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 8,
                      display: 'flex'
                    }}>
                      {hasInvested ? (
                        <div style={{
                          paddingLeft: 16,
                          paddingRight: 16,
                          paddingTop: 10,
                          paddingBottom: 10,
                          background: '#DDF4E6',
                          borderRadius: 12,
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 8,
                          display: 'flex',
                          border: '1px solid #65CC8E'
                        }}>
                          <div style={{
                            width: 8,
                            height: 8,
                            background: '#65CC8E',
                            borderRadius: 9999
                          }} />
                          <div style={{
                            color: '#065F46',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Invested ${userInvestment?.amount ? parseFloat(userInvestment.amount).toLocaleString() : ''}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          paddingLeft: 16,
                          paddingRight: 16,
                          paddingTop: 10,
                          paddingBottom: 10,
                          background: investing ? '#ccc' : 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)',
                          borderRadius: 12,
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 8,
                          display: 'flex',
                          cursor: investing ? 'not-allowed' : 'pointer',
                          opacity: investing ? 0.6 : 1
                        }}
                        onClick={investing ? undefined : handleInvest}>
                          <div style={{
                            color: 'white',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            {investing ? 'Investing...' : 'Invest'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{alignSelf: 'stretch', textAlign: 'center', padding: 40}}>
                    <p style={{color: '#767676', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool not found</p>
                  </div>
                )}
              </>
            )}

            {/* Assigned Documents Tab Content */}
            {activeTab === 'documents' && (
              <>
                {/* Documents Section Header */}
                <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                  <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Assigned Documents</div>
                </div>

                {/* Documents Card */}
                <div style={{
                  width: '100%',
                  padding: 32,
                  background: 'white',
                  borderRadius: 24,
                  border: '1px solid #E5E7EB',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  gap: 32,
                  display: 'flex'
                }}>
                  <div style={{
                    alignSelf: 'stretch',
                    color: '#767676',
                    fontSize: 16,
                    fontFamily: 'var(--ep-font-avenir)',
                    fontWeight: '500',
                    textAlign: 'center',
                    padding: 40
                  }}>
                    Documents will be available once the pool is funded and active.
                  </div>
                </div>
              </>
            )}

            {/* My Investments Tab Content */}
            {activeTab === 'investments' && (
              <>
                {/* Investments Section Header */}
                <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                  <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>My Investments</div>
                </div>

                {/* Investments Content */}
                {loadingInvestments ? (
                  <div style={{alignSelf: 'stretch', textAlign: 'center', padding: 40}}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p style={{color: '#767676', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Loading your investments...</p>
                  </div>
                ) : investments.length === 0 ? (
                  <div style={{
                    width: '100%',
                    padding: 32,
                    background: 'white',
                    borderRadius: 24,
                    border: '1px solid #E5E7EB',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 16,
                    display: 'flex'
                  }}>
                    <div style={{color: '#767676', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', textAlign: 'center'}}>
                      You haven&apos;t made any investments yet.
                    </div>
                    <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', textAlign: 'center'}}>
                      Browse available pools to start investing.
                    </div>
                  </div>
                ) : (
                  <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'flex'}}>
                    {investments.map((investment) => (
                      <div key={investment.id} style={{
                        width: '100%',
                        padding: 32,
                        background: 'white',
                        borderRadius: 24,
                        border: '1px solid #E5E7EB',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 24,
                        display: 'flex'
                      }}>
                        {/* Investment Header */}
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: 'black',
                            fontSize: 20,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Pool #EP{investment.pool.id} - {investment.pool.poolType}
                          </div>
                          <div style={{
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 4,
                            paddingBottom: 4,
                            background: investment.status === 'active' ? '#DDF4E6' : '#DBEAFE',
                            borderRadius: 50,
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: 6,
                            display: 'flex'
                          }}>
                            <div style={{
                              width: 8,
                              height: 8,
                              background: investment.status === 'active' ? '#65CC8E' : '#3B82F6',
                              borderRadius: 9999
                            }} />
                            <div style={{
                              color: investment.status === 'active' ? '#065F46' : '#1E40AF',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                            </div>
                          </div>
                        </div>

                        {/* Investment Details */}
                        <div style={{
                          alignSelf: 'stretch',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                          gap: 16,
                          display: 'flex'
                        }}>
                          <div style={{
                            alignSelf: 'stretch',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            display: 'flex'
                          }}>
                            <div style={{
                              color: '#B2B2B2',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              Investment Amount
                            </div>
                            <div style={{
                              color: 'black',
                              fontSize: 16,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              ${parseFloat(investment.amount).toLocaleString()}
                            </div>
                          </div>
                          <div style={{
                            alignSelf: 'stretch',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            display: 'flex'
                          }}>
                            <div style={{
                              color: '#B2B2B2',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              Expected ROI
                            </div>
                            <div style={{
                              color: 'black',
                              fontSize: 16,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              {investment.pool.roiRate}%
                            </div>
                          </div>
                          <div style={{
                            alignSelf: 'stretch',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            display: 'flex'
                          }}>
                            <div style={{
                              color: '#B2B2B2',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              Invested On
                            </div>
                            <div style={{
                              color: 'black',
                              fontSize: 16,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              {new Date(investment.investedAt).toLocaleDateString('en-GB')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* My Investments Tab Content */}
            {activeTab === 'investments' && (
              <>
                {/* Investments Section Header */}
                <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                  <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>My Investments</div>
                </div>

                {/* Investments Content */}
                {loadingInvestments ? (
                  <div style={{alignSelf: 'stretch', textAlign: 'center', padding: 40}}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p style={{color: '#767676', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Loading your investments...</p>
                  </div>
                ) : investments.length === 0 ? (
                  <div style={{
                    width: '100%',
                    padding: 32,
                    background: 'white',
                    borderRadius: 24,
                    border: '1px solid #E5E7EB',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 16,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: '#767676',
                      fontSize: 18,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      You haven&apos;t made any investments yet.
                    </div>
                    <div style={{
                      color: '#767676',
                      fontSize: 14,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '400',
                      textAlign: 'center'
                    }}>
                      Start by exploring available investment opportunities.
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    flexDirection: 'column',
                    gap: 16,
                    display: 'flex'
                  }}>
                    {investments.map((investment) => (
                      <div key={investment.id} style={{
                        width: '100%',
                        padding: 24,
                        background: 'white',
                        borderRadius: 24,
                        border: '1px solid #E5E7EB',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 16,
                        display: 'flex'
                      }}>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: 'black',
                            fontSize: 18,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            Pool #{investment.pool.id}
                          </div>
                          <div style={{
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 4,
                            paddingBottom: 4,
                            background: investment.status === 'active' ? '#CBD764' : '#FEF3C7',
                            borderRadius: 50,
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: 6,
                            display: 'flex'
                          }}>
                            <div style={{
                              width: 8,
                              height: 8,
                              background: investment.status === 'active' ? '#7E8C03' : '#F59E0B',
                              borderRadius: 9999
                            }} />
                            <div style={{
                              color: 'black',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          alignSelf: 'stretch',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          display: 'flex',
                          gap: 24
                        }}>
                          <div style={{
                            flex: '1 1 0',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            gap: 8,
                            display: 'flex'
                          }}>
                            <div style={{
                              color: '#B2B2B2',
                              fontSize: 12,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              Investment Amount
                            </div>
                            <div style={{
                              color: 'black',
                              fontSize: 20,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              ${parseFloat(investment.amount).toLocaleString()}
                            </div>
                          </div>
                          <div style={{
                            flex: '1 1 0',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            gap: 8,
                            display: 'flex'
                          }}>
                            <div style={{
                              color: '#B2B2B2',
                              fontSize: 12,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              ROI Rate
                            </div>
                            <div style={{
                              color: 'black',
                              fontSize: 16,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              {investment.pool.roiRate}%
                            </div>
                          </div>
                          <div style={{
                            flex: '1 1 0',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            gap: 8,
                            display: 'flex'
                          }}>
                            <div style={{
                              color: '#B2B2B2',
                              fontSize: 12,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              Investment Date
                            </div>
                            <div style={{
                              color: 'black',
                              fontSize: 16,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>
                              {new Date(investment.investedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

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
                  <div style={{color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Soon</div>
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
                    // Handle newsletter signup
                    console.log('Newsletter signup:', newsletterEmail);
                    setNewsletterEmail('');
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
    </div>
  );
}
