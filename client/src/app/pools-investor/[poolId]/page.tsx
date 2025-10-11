'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { getAuthenticatedFetchOptions, clearAuthData } from '../../../utils/auth';
import Navbar from '../../../components/Navbar';

export default function InvestorPoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const poolId = params?.poolId as string;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<'borrower' | 'investor' | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
      <Navbar 
        variant="default"
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        showProfileMenu={showProfileMenu}
        onProfileMenuToggle={setShowProfileMenu}
        showMobileMenu={showMobileMenu}
        onMobileMenuToggle={setShowMobileMenu}
      />
      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <div className="pb-4">
              <div>
                <span style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pools & Dashboard </span>
                <span style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}> &gt; Pool #{poolId}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4 sm:gap-8 pb-6 border-b border-gray-200">
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
              <div className="w-full flex flex-col lg:flex-row gap-6">
                {/* Left Side - Pool Details */}
                <div className="flex-1">
                  {/* Pool Content - Overview Section */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="text-blue-900 text-xl font-bold">Investment Pool Details</div>
                  </div>

                  {/* Pool Overview Card */}
                  {loadingPool ? (
                    <div className="text-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500 text-base font-medium">Loading pool details...</p>
                    </div>
                  ) : poolError ? (
                    <div className="text-center py-10">
                      <p className="text-red-600 text-base font-medium">{poolError}</p>
                    </div>
                  ) : poolData ? (
                    <div className="w-full bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 flex flex-col gap-6 sm:gap-8">
                      {/* Header Section */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-black text-lg sm:text-xl font-medium">
                          Pool #EP{poolId} - Overview
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-lime-200 rounded-full">
                          <div className="w-2 h-2 bg-lime-700 rounded-full" />
                          <div className="text-black text-sm font-medium">
                            Available to invest
                          </div>
                        </div>
                      </div>

                      {/* Pool Repayment Section */}
                      <div className="flex flex-col gap-3">
                        <div className="text-blue-900 text-base font-medium">
                          Pool Repayment
                        </div>
                        <div className="text-black text-2xl sm:text-3xl font-medium">
                          ${poolData.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                        </div>
                      </div>

                      {/* Pool Information Section */}
                      <div className="flex flex-col gap-4">
                        <div className="text-blue-900 text-base font-medium">
                          Pool Information
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Date Created</div>
                            <div className="text-black text-base font-medium">
                              {poolData.createdAt ? new Date(poolData.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Start Date</div>
                            <div className="text-black text-base font-medium">--/--/----</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">End Date</div>
                            <div className="text-black text-base font-medium">--/--/----</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Type</div>
                            <div className="text-black text-base font-medium">
                              {poolData.poolType || 'Equity pool'}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Requested amount</div>
                            <div className="text-black text-base font-medium">
                              ${poolData.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Terms</div>
                            <div className="text-black text-base font-medium">
                              {poolData.roiRate ? `${poolData.roiRate}%` : ''} {poolData.term ? `/ ${poolData.term}` : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Property Info Section */}
                      <div className="flex flex-col gap-4">
                        <div className="text-blue-900 text-base font-medium">
                          Property Info
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Address</div>
                            <div className="text-black text-base font-medium text-right">
                              {poolData.addressLine ? `${poolData.addressLine}, ${poolData.city}, ${poolData.state} ${poolData.zipCode}` : 'N/A'}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Co-owner(s)</div>
                            <div className="text-black text-base font-medium">
                              {poolData.coOwner || 'N/A'}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Property Link</div>
                            <div className="text-black text-base font-medium underline cursor-pointer">
                              {poolData.propertyLink || 'N/A'}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Property value</div>
                            <div className="text-black text-base font-medium">
                              ${poolData.propertyValue || 'N/A'}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Total mortgage balance</div>
                            <div className="text-black text-base font-medium">
                              ${poolData.mortgageBalance || 'N/A'}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-sm font-medium">Ownership</div>
                            <div className="text-black text-base font-medium">
                              {poolData.percentOwned ? `${poolData.percentOwned}% Owned` : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Invest Button */}
                      <div className="flex justify-center items-center">
                        {hasInvested ? (
                          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-400 rounded-xl">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <div className="text-green-800 text-sm font-medium">
                              Invested ${userInvestment?.amount ? parseFloat(userInvestment.amount).toLocaleString() : ''}
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer ${investing ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-blue-900 to-blue-600'}`}
                            onClick={investing ? undefined : handleInvest}
                          >
                            <div className="text-white text-sm font-medium">
                              {investing ? 'Investing...' : 'Invest'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500 text-base font-medium">Pool not found</p>
                    </div>
                  )}
                </div>

                {/* Right Side - Quick Actions (Mobile: Below, Desktop: Right sidebar) */}
                <div className="w-full lg:w-80 xl:w-96">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                    
                    {/* Investment Summary */}
                    {hasInvested && userInvestment && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="text-sm text-blue-600 mb-1">Your Investment</div>
                        <div className="text-2xl font-bold text-blue-900">
                          ${parseFloat(userInvestment.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700 mt-1">
                          {poolData ? ((parseFloat(userInvestment.amount) / parseFloat(poolData.amount.replace(/\s/g, ''))) * 100).toFixed(2) : '0'}% of pool
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        {hasInvested ? 'Increase Investment' : 'Invest Now'}
                      </button>
                      <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        View Documents
                      </button>
                      {hasInvested && (
                        <button className="w-full bg-red-50 text-red-600 py-3 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors">
                          Manage Investment
                        </button>
                      )}
                    </div>

                    {/* Pool Progress */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Pool Status</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Pool created: {poolData?.createdAt ? new Date(poolData.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
      <footer className="w-full px-4 sm:px-6 py-8 sm:py-12 mt-20 sm:mt-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-black text-sm font-medium">Quick Links</h3>
              <div className="space-y-3">
                <a className="block text-gray-600 text-sm hover:text-gray-900 cursor-pointer">Active Pools</a>
                <a className="block text-gray-600 text-sm hover:text-gray-900 cursor-pointer">About Us</a>
                <a className="block text-gray-600 text-sm hover:text-gray-900 cursor-pointer">Security</a>
                <div className="flex items-center gap-2">
                  <a className="text-gray-600 text-sm hover:text-gray-900 cursor-pointer">Learn</a>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Soon</span>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <div className="space-y-3">
                <a className="block text-gray-600 text-sm hover:text-gray-900 cursor-pointer">Terms of Service</a>
                <a className="block text-gray-600 text-sm hover:text-gray-900 cursor-pointer">Privacy Policy</a>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-black text-sm font-medium">Support</h3>
              <div className="space-y-3">
                <a className="block text-gray-600 text-sm hover:text-gray-900 cursor-pointer">Contact Us</a>
                <a className="block text-gray-600 text-sm hover:text-gray-900 cursor-pointer">FAQs</a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-4 lg:col-span-1">
              <div className="space-y-2">
                <h3 className="text-black text-xl font-bold">Stay Ahead of the Curve</h3>
                <p className="text-gray-600 text-sm">Be the first to discover newly launched pools, platform updates, and investor insights — right in your inbox.</p>
              </div>
              <div className="flex items-center bg-gray-100 rounded-full p-1 max-w-md">
                <input
                  type="email"
                  name="newsletter-email"
                  autoComplete="off"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent border-none outline-none text-gray-600 text-sm px-4 py-2"
                />
                <button
                  onClick={() => {
                    if (newsletterEmail.trim()) {
                      // Handle newsletter signup
                      console.log('Newsletter signup:', newsletterEmail);
                      setNewsletterEmail('');
                    }
                  }}
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-200">
            <span className="text-black text-sm font-medium">Socials</span>
            <div className="flex items-center gap-4">
              <Image src="/mdi-instagram.svg" alt="Instagram" width={24} height={24} className="cursor-pointer hover:opacity-70" />
              <Image src="/ic-baseline-facebook.svg" alt="Facebook" width={24} height={24} className="cursor-pointer hover:opacity-70" />
              <Image src="/mdi-linkedin.svg" alt="LinkedIn" width={24} height={24} className="cursor-pointer hover:opacity-70" />
            </div>
          </div>

          {/* Legal Text */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-xs leading-relaxed">
              Security & Legal: Equipool is a private lending marketplace that connects individual borrowers and accredited investors through secured, property-backed loans. All identities are verified, and sensitive data is encrypted and stored securely in compliance with GDPR and other data privacy regulations. Equipool is not a licensed financial institution. We partner with third-party financial service providers to process payments and hold funds in escrow. All lending agreements are executed via legally binding contracts reviewed by independent legal partners. Investments made through Equipool are not insured by any government protection scheme. As with any private loan, the value of your investment can go up or down — you may lose part or all of your invested capital. © 2025 Equipool. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
