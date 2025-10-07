'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Toaster, useToaster } from '../../components/Toaster';
import { getAuthenticatedFetchOptions, clearAuthData } from '../../utils/auth';
import { getPoolsUrlForRole, getSmartPoolsUrl } from '../../utils/navigation';
import FilterDropDown from '../../components/FilterDropDown';

const LoginModal = dynamic(() => import('../../components/LoginModal'), { ssr: false });

interface Pool {
  id: number;
  poolType: string;
  status: string;
  amount: string;
  roiRate: string;
  term: string;
  termMonths: number;
  createdAt: string;
  address: string;
  propertyValue: string | null;
  mortgageBalance: string | null;
  borrowerName: string;
  fundingProgress: number;
}

interface Investment {
  id: number;
  amount: string;
  status: string;
  investedAt: string;
  pool: {
    id: number;
    poolType: string;
    status: string;
    amount: string;
    roiRate: string;
    term: string;
    termMonths: number;
    createdAt: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    percentOwned: string;
    coOwner: string;
    propertyValue: string | null;
    propertyLink: string;
    mortgageBalance: string | null;
    borrowerName: string;
    borrowerEmail: string;
  };
}

interface DashboardData {
  totalInvested: string;
  currentROI: string;
  activePools: number;
  pendingPayouts: {
    amount: string;
    nextDate: string;
  };
}

export default function InvestorPoolsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'borrower' | 'investor' | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [investmentPools, setInvestmentPools] = useState<Pool[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'investments' | 'archive'>('explore');
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState<'newest' | 'oldest' | null>(null);
  
  const { toasts, removeToast, showSuccess, showError } = useToaster();

  // Function to fetch investment opportunities
  const fetchInvestmentPools = useCallback(async () => {
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
  }, [isAuthenticated, userRole]);

  // Function to fetch user investments
  const fetchMyInvestments = useCallback(async () => {
    if (!isAuthenticated || userRole !== 'investor') {
      return;
    }

    setLoadingInvestments(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const investmentsUrl = `${backendUrl}/api/investor/investments`;
      
      const response = await fetch(investmentsUrl, getAuthenticatedFetchOptions({
        method: 'GET'
      }));

      if (response.ok) {
        const result = await response.json();
        setMyInvestments(result.investments || []);
      } else {
        console.error('Failed to fetch investments, status:', response.status);
        setMyInvestments([]);
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
      setMyInvestments([]);
    } finally {
      setLoadingInvestments(false);
    }
  }, [isAuthenticated, userRole]);

  // Function to fetch dashboard metrics
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (!isAuthenticated || userRole !== 'investor') {
      return;
    }

    if (showLoading) {
      setLoadingDashboard(true);
    }
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const dashboardUrl = `${backendUrl}/api/investor/dashboard`;
      
      const response = await fetch(dashboardUrl, getAuthenticatedFetchOptions({
        method: 'GET'
      }));

      if (response.ok) {
        const result = await response.json();
        setDashboardData(result);
      } else {
        console.error('Failed to fetch dashboard data, status:', response.status);
        // Don't clear data on error to prevent UI flickering
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't clear data on error to prevent UI flickering
    } finally {
      if (showLoading) {
        setLoadingDashboard(false);
      }
    }
  }, [isAuthenticated, userRole]);

  // Fetch investment pools when authenticated as investor
  useEffect(() => {
    if (isAuthenticated && userRole === 'investor') {
      // Reset initial data loaded flag
      setInitialDataLoaded(false);
      
      // Fetch both pools and investments, then mark as loaded
      Promise.all([
        fetchInvestmentPools(),
        fetchMyInvestments(),
        fetchDashboardData()
      ]).finally(() => {
        setInitialDataLoaded(true);
      });
    }
  }, [isAuthenticated, userRole, fetchInvestmentPools, fetchMyInvestments, fetchDashboardData]);

  // Refresh data when returning to the page (e.g., after making an investment)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && userRole === 'investor') {
        fetchInvestmentPools();
        fetchMyInvestments();
        fetchDashboardData(false); // Refresh silently to update data
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, userRole, fetchInvestmentPools, fetchMyInvestments, fetchDashboardData]);

  // Filter pools to exclude those the user has already invested in
  const getFilteredPools = () => {
    if (activeTab !== 'explore') return getSortedPools(investmentPools);
    
    // Show pools even if we're still loading investments, but filter them properly
    // This prevents the flickering effect
    if (!initialDataLoaded) {
      // If we haven't loaded initial data yet, show loading state
      return [];
    }
    
    // If we're still loading pools, show empty array
    if (loadingPools) {
      return [];
    }
    
    // Get pool IDs that user has already invested in
    const investedPoolIds = myInvestments.map(investment => investment.pool.id);
    
    // Filter out pools that user has already invested in
    const filteredPools = investmentPools.filter(pool => !investedPoolIds.includes(pool.id));
    
    // Apply sorting
    return getSortedPools(filteredPools);
  };

  // Sort pools based on date filter
  const getSortedPools = (pools: Pool[]) => {
    if (!dateFilter) return pools;
    
    return [...pools].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      if (dateFilter === 'newest') {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  };

  // Sort investments based on date filter
  const getSortedInvestments = (investments: Investment[]) => {
    if (!dateFilter) return investments;
    
    return [...investments].sort((a, b) => {
      const dateA = new Date(a.investedAt).getTime();
      const dateB = new Date(b.investedAt).getTime();
      
      if (dateFilter === 'newest') {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  };

  // Handle filter change
  const handleFilterChange = (filter: 'newest' | 'oldest') => {
    setDateFilter(filter);
  };

  // Handle filter dropdown toggle
  const handleFilterToggle = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFilterDropdown(false);
    };

    if (showFilterDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showFilterDropdown]);

  // Refresh data when switching to investments tab
  const handleTabChange = (tab: 'explore' | 'investments' | 'archive') => {
    setActiveTab(tab);
    if (tab === 'investments' && isAuthenticated && userRole === 'investor') {
      fetchMyInvestments();
      // Don't refresh dashboard data on tab switch - it should persist
    }
  };

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
      <header className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <Image src="/logo-icon.svg" alt="EquiPool Logo" width={26} height={27} />
            <span className="ep-nav-brand">EquiPool</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <a className="ep-nav-link">About Us</a>
            <a className="ep-nav-link">Security</a>
            <div className="flex items-center gap-2">
              <a className="ep-nav-link">Learn</a>
              <span className="px-2 py-1 rounded bg-gray-100 ep-nav-soon">Soon</span>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-500 ease-in-out ${showMobileMenu ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-500 ease-in-out ${showMobileMenu ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-600 transition-all duration-500 ease-in-out ${showMobileMenu ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-4" style={{position:'relative'}}>
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
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 mt-0">
            <div className="px-4 py-4 space-y-4">
              {/* Navigation Links */}
              <div className="space-y-3">
                <a className="block text-gray-700 hover:text-blue-900 cursor-pointer py-2 text-base font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>About Us</a>
                <a className="block text-gray-700 hover:text-blue-900 cursor-pointer py-2 text-base font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Security</a>
                <div className="flex items-center gap-2 py-2">
                  <a className="text-gray-700 hover:text-blue-900 cursor-pointer text-base font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Learn</a>
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Soon</span>
                </div>
              </div>
              
              {/* Auth Section */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <button 
                      className="w-full text-left py-2 text-black text-base font-medium"
                      onClick={() => {
                        const targetUrl = getSmartPoolsUrl(userRole);
                        window.location.href = targetUrl;
                        setShowMobileMenu(false);
                      }}
                    >
                      Pools & Dashboard
                    </button>
                    <button className="w-full text-left py-2 text-gray-500 text-base font-medium">Profile</button>
                    <button 
                      className="w-full text-left py-2 text-red-600 text-base font-medium"
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
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
                        setShowLoginModal(true);
                        setShowMobileMenu(false);
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
                        window.location.href = '/';
                        setShowMobileMenu(false);
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

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="text-black text-base font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
              Pools & Dashboard
            </div>
            <div className="text-blue-900 text-xl font-bold" style={{fontFamily: 'var(--ep-font-avenir)', color: '#113D7B'}}>
              Overview
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
              <div className="p-8 bg-gray-100 rounded-3xl flex flex-col justify-between h-70">
                <div className="flex flex-col gap-2">
                  <div className="text-black text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Total Invested</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-black text-3xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    {dashboardData ? `$${parseFloat(dashboardData.totalInvested).toLocaleString()}` : (loadingDashboard ? 'Loading...' : '$0')}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>(i) Total amount you&apos;ve received across all funded pools.</div>
                </div>
              </div>
              <div className="p-8 bg-gray-100 rounded-3xl flex flex-col justify-between h-70">
                <div className="flex flex-col gap-2">
                  <div className="text-black text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Current ROI</div>
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <div className="text-black text-3xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    {dashboardData ? `${dashboardData.currentROI}%` : (loadingDashboard ? 'Loading...' : '0%')}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>(i) Your upcoming repayment amount and due date.</div>
                </div>
              </div>
              <div className="p-8 bg-gray-100 rounded-3xl flex flex-col justify-between items-center h-70">
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full text-black text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Active pools</div>
                </div>
                <div className="w-full flex flex-col">
                  <div className="w-full text-black text-3xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    {dashboardData ? dashboardData.activePools : (loadingDashboard ? 'Loading...' : '0')}
                  </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>(i) Number of currently running loans.</div>
                </div>
              </div>
              <div className="p-8 bg-gray-100 rounded-3xl flex flex-col justify-between items-center h-70">
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full text-black text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Pending payouts</div>
                </div>
                <div className="w-full flex flex-col justify-center flex-1">
                  <div className="w-full text-black text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    {(dashboardData && dashboardData.pendingPayouts.nextDate) ? dashboardData.pendingPayouts.nextDate : (loadingDashboard ? 'Loading...' : 'No pending payouts')}
                  </div>
                  <div className="w-full text-black text-3xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    {(dashboardData && dashboardData.pendingPayouts.amount) ? `$${parseFloat(dashboardData.pendingPayouts.amount).toLocaleString()}` : (loadingDashboard ? 'Loading...' : '$0')}
                  </div>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>(i) Number of currently running loans.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pools Exploration Section */}
      <div className="w-full px-4 sm:px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-6">
              <div 
                className={`cursor-pointer pb-1 text-base font-medium ${
                  activeTab === 'explore' 
                    ? 'text-blue-900 border-b-2 border-blue-900 font-bold' 
                    : 'text-gray-400 font-medium'
                }`}
                style={{fontFamily: 'var(--ep-font-avenir)', color: activeTab === 'explore' ? '#113D7B' : '#B2B2B2'}}
                onClick={() => handleTabChange('explore')}
              >
                Explore Pools
              </div>
              <div 
                className={`cursor-pointer pb-1 text-base font-medium ${
                  activeTab === 'investments' 
                    ? 'text-blue-900 border-b-2 border-blue-900 font-bold' 
                    : 'text-gray-400 font-medium'
                }`}
                style={{fontFamily: 'var(--ep-font-avenir)', color: activeTab === 'investments' ? '#113D7B' : '#B2B2B2'}}
                onClick={() => handleTabChange('investments')}
              >
                My Investments
              </div>
              <div 
                className={`cursor-pointer pb-1 text-base font-medium ${
                  activeTab === 'archive' 
                    ? 'text-blue-900 border-b-2 border-blue-900 font-bold' 
                    : 'text-gray-400 font-medium'
                }`}
                style={{fontFamily: 'var(--ep-font-avenir)', color: activeTab === 'archive' ? '#113D7B' : '#B2B2B2'}}
                onClick={() => handleTabChange('archive')}
              >
                Archive
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="text-gray-500 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Filters</div>
                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.88889 4H10.1111C10.2143 4 10.3132 4.04162 10.3861 4.11571C10.459 4.1898 10.5 4.29028 10.5 4.39506V5.02162C10.5 5.12638 10.459 5.22685 10.3861 5.30092L7.89172 7.83482C7.81879 7.90889 7.7778 8.00935 7.77778 8.11412V10.605C7.77778 10.665 7.7643 10.7243 7.73837 10.7782C7.71244 10.8322 7.67474 10.8794 7.62814 10.9164C7.58154 10.9533 7.52726 10.979 7.46942 10.9914C7.41159 11.0039 7.35173 11.0028 7.29439 10.9882L6.51661 10.7906C6.43252 10.7692 6.35787 10.7199 6.30453 10.6505C6.2512 10.581 6.22222 10.4955 6.22222 10.4074V8.11412C6.2222 8.00935 6.18121 7.90889 6.10828 7.83482L3.61394 5.30092C3.54101 5.22685 3.50002 5.12638 3.5 5.02162V4.39506C3.5 4.29028 3.54097 4.1898 3.6139 4.11571C3.68683 4.04162 3.78575 4 3.88889 4Z" stroke="#767676" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="relative px-1 py-0.5 rounded-xl flex items-center gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleFilterToggle(); }}>
                <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.91667 2H2.08333C1.6231 2 1.25 2.3731 1.25 2.83333V7.41667C1.25 7.8769 1.6231 8.25 2.08333 8.25H7.91667C8.3769 8.25 8.75 7.8769 8.75 7.41667V2.83333C8.75 2.3731 8.3769 2 7.91667 2Z" stroke="black"/>
                  <path d="M1.25 3.66667C1.25 2.88083 1.25 2.48833 1.49417 2.24417C1.73833 2 2.13083 2 2.91667 2H7.08333C7.86917 2 8.26167 2 8.50583 2.24417C8.75 2.48833 8.75 2.88083 8.75 3.66667H1.25Z" fill="black"/>
                  <path d="M2.91406 0.75V2M7.08073 0.75V2" stroke="black" strokeLinecap="round"/>
                </svg>
                <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                  {dateFilter ? (dateFilter === 'newest' ? 'Newest' : 'Oldest') : 'Date Created'}
                </div>
                {showFilterDropdown && (
                  <FilterDropDown 
                    onFilterChange={handleFilterChange}
                    onClose={() => setShowFilterDropdown(false)}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'explore' && (
              <>
                {(!initialDataLoaded || loadingPools) ? (
                  <div className="col-span-full flex justify-center items-center p-10 text-gray-500 text-base font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    Loading investment opportunities...
                  </div>
                ) : getFilteredPools().length === 0 ? (
                  <div className="col-span-full flex flex-col justify-center items-center p-10 gap-4">
                    <div className="text-gray-500 text-lg font-medium text-center" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                      {investmentPools.length === 0 ? 
                        'No investment opportunities available at the moment.' :
                        'No new investment opportunities available.'}
                    </div>
                    {investmentPools.length > 0 && (
                      <div className="text-gray-400 text-sm font-medium text-center" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                        You have already invested in all available pools. Check "My Investments" tab.
                      </div>
                    )}
                  </div>
                ) : (
                  getFilteredPools().map((pool) => (
                    <div key={pool.id} className="bg-white border border-blue-900 rounded-3xl p-5 flex flex-col justify-between h-80 cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
                      onClick={() => router.push(`/pools-investor/${pool.id}`)}>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-400 text-xs font-normal" style={{fontFamily: 'var(--ep-font-avenir)'}}>#{pool.id.toString().padStart(6, '0')}</div>
                        <div className="px-2.5 py-1 bg-green-300 rounded-full flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-green-800 rounded-full" />
                          <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Available to invest</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div className="flex flex-col">
                            <div className="text-blue-900 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Requested amount</div>
                            <div className="text-black text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>${parseFloat(pool.amount).toLocaleString()}</div>
                          </div>
                          <div className="flex flex-col gap-1.5 mt-2">
                            <div className="flex flex-col gap-0.5">
                              <div className="text-gray-400 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>ROI Rate</div>
                              <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>{pool.roiRate}%</div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="text-gray-400 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Date Created</div>
                              <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>{new Date(pool.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="text-gray-400 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Borrower</div>
                              <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>{pool.borrowerName}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div className="flex flex-col">
                            <div className="text-blue-900 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Property Location</div>
                            <div className="text-black text-sm font-medium leading-tight" style={{fontFamily: 'var(--ep-font-avenir)'}}>{pool.address}</div>
                          </div>
                          <div className="flex flex-col gap-1.5 mt-2">
                            <div className="flex flex-col gap-0.5">
                              <div className="text-gray-400 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Terms</div>
                              <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>{pool.roiRate}% / {pool.termMonths} Months</div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="text-gray-400 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Type</div>
                              <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>{pool.poolType === 'equity' ? 'Equity pool' : 'Refinance pool'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 px-4 rounded-xl flex justify-center items-center gap-1 cursor-pointer">
                        <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>View Pool</div>
                        <Image src="/weui-arrow-filled_right.svg" alt="Arrow Right" width={14} height={14} />
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'investments' && (
              <>
                {loadingInvestments ? (
                  <div className="col-span-full flex justify-center items-center p-10 text-gray-500 text-base font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    Loading your investments...
                  </div>
                ) : myInvestments.length === 0 ? (
                  <div className="col-span-full flex flex-col justify-center items-center p-10 gap-4">
                    <div className="text-gray-500 text-lg font-medium text-center" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                      You haven&apos;t made any investments yet.
                    </div>
                    <div className="text-gray-400 text-sm font-medium text-center" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                      Browse available pools to start investing.
                    </div>
                  </div>
                ) : (
                  getSortedInvestments(myInvestments).map((investment) => (
                    <div key={investment.id} className="bg-white border border-green-400 rounded-3xl p-5 flex flex-col justify-between h-80 cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
                      onClick={() => router.push(`/pools-investor/${investment.pool.id}`)}>
                      {/* Investment card content - similar structure to pool cards */}
                      <div className="flex justify-between items-center">
                        <div className="text-gray-400 text-xs font-normal" style={{fontFamily: 'var(--ep-font-avenir)'}}>#{investment.pool.id.toString().padStart(6, '0')}</div>
                        <div className="px-2.5 py-1 bg-green-400 rounded-full flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-green-700 rounded-full" />
                          <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Invested</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div className="flex flex-col">
                            <div className="text-blue-900 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Your investment</div>
                            <div className="text-black text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>${parseFloat(investment.amount).toLocaleString()}</div>
                          </div>
                          <div className="flex flex-col gap-1.5 mt-2">
                            <div className="flex flex-col gap-0.5">
                              <div className="text-gray-400 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>ROI Rate</div>
                              <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>{investment.pool.roiRate}%</div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="text-gray-400 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Invested On</div>
                              <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>{new Date(investment.investedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div className="flex flex-col">
                            <div className="text-blue-900 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Property Location</div>
                            <div className="text-black text-sm font-medium leading-tight" style={{fontFamily: 'var(--ep-font-avenir)'}}>{investment.pool.addressLine}, {investment.pool.city}</div>
                          </div>
                          <div className="flex flex-col gap-1.5 mt-2">
                            <div className="flex flex-col gap-0.5">
                              <div className="text-gray-400 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Status</div>
                              <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>{investment.status}</div>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="text-gray-400 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Ownership</div>
                              <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>{investment.pool.percentOwned}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 px-4 rounded-xl flex justify-center items-center gap-1 cursor-pointer">
                        <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>View Investment</div>
                        <Image src="/weui-arrow-filled_right.svg" alt="Arrow Right" width={14} height={14} />
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'archive' && (
              <div className="col-span-full flex flex-col justify-center items-center p-10 gap-4">
                <div className="text-gray-500 text-lg font-medium text-center" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                  No archived pools yet.
                </div>
                <div className="text-gray-400 text-sm font-medium text-center" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                  Completed pools will appear here.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full mt-16 lg:mt-40 py-8 lg:py-8 px-4 sm:px-8 lg:px-32 xl:px-44 flex flex-col justify-center items-center gap-12">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row justify-start items-start gap-8 lg:gap-32">
            <div className="flex flex-col justify-start items-start gap-10 w-full lg:w-auto">
                <div className="w-full flex flex-col justify-start items-start gap-4">
                    <div className="rounded-md flex justify-start items-center gap-2">
                        <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Quick Links</div>
                    </div>
                    <div className="rounded-md flex justify-start items-center gap-2">
                        <div className="text-gray-600 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Active Pools</div>
                    </div>
                    <div className="rounded-md flex justify-start items-center gap-2">
                        <div className="text-gray-600 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>About Us</div>
                    </div>
                    <div className="rounded-md flex justify-start items-center gap-2">
                        <div className="text-gray-600 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Security</div>
                    </div>
                    <div className="rounded-md flex justify-start items-center gap-1">
                        <div className="text-gray-600 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Learn</div>
                        <div className="px-2 py-1 bg-gray-100 rounded-full flex justify-center items-center">
                            <div className="text-gray-600 text-xs font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Soon</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-start items-start gap-4">
                    <div className="rounded-md flex justify-start items-center gap-2">
                        <div className="text-gray-600 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Terms of Service</div>
                    </div>
                    <div className="rounded-md flex justify-start items-center gap-2">
                        <div className="text-gray-600 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Privacy Policy</div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-start items-start gap-4 w-full lg:w-auto">
                <div className="rounded-md flex justify-start items-center gap-2">
                    <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Support</div>
                </div>
                <div className="rounded-md flex justify-start items-center gap-2">
                    <div className="text-gray-600 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Contact Us</div>
                </div>
                <div className="rounded-md flex justify-start items-center gap-2">
                    <div className="text-gray-600 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>FAQs</div>
                </div>
            </div>
            <div className="flex flex-col justify-start items-start gap-4 w-full lg:w-auto">
                <div className="rounded-md flex justify-start items-center gap-2">
                    <div className="text-black text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Socials</div>
                </div>
                <div className="flex justify-start items-start gap-4">
                    <Image src="/mdi-instagram.svg" alt="Instagram" width={24} height={24} />
                    <Image src="/ic-baseline-facebook.svg" alt="Facebook" width={24} height={24} />
                    <Image src="/mdi-linkedin.svg" alt="LinkedIn" width={24} height={24} />
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-start items-start gap-4 w-full lg:w-auto">
                <div className="w-full flex flex-col justify-start items-start gap-1">
                    <div className="text-black font-bold" style={{fontSize: 'clamp(16px, 4vw, 20px)', fontFamily: 'var(--ep-font-avenir)'}}>Stay Ahead of the Curve</div>
                    <div className="w-full text-gray-600 text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Be the first to discover newly launched pools, platform updates, and investor insights — right in your inbox.</div>
                </div>
                <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-0 sm:p-1 sm:pl-4 sm:pr-1 sm:bg-gray-100 sm:rounded-full">
                    <div className="flex-1 w-full">
                        <div className="w-full p-3 sm:p-0 bg-gray-100 sm:bg-transparent rounded-lg sm:rounded-none">
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
                      className="w-full sm:w-auto px-4 py-3 sm:px-3 sm:py-2 bg-blue-900 rounded-xl border border-gray-200 flex justify-center items-center gap-2 cursor-pointer shadow-sm"
                      style={{
                        boxShadow: '0px 1px 0.5px 0.05000000074505806px rgba(29, 41, 61, 0.02)'
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
        <div className="w-full max-w-5xl text-gray-600 text-xs font-normal leading-relaxed" style={{fontFamily: 'var(--ep-font-avenir)'}}>Security & Legal Equipool is a private lending marketplace that connects individual borrowers and accredited investors through secured, property-backed loans. All identities are verified, and sensitive data is encrypted and stored securely in compliance with GDPR and other data privacy regulations. Equipool is not a licensed financial institution. We partner with third-party financial service providers to process payments and hold funds in escrow. All lending agreements are executed via legally binding contracts reviewed by independent legal partners. Investments made through Equipool are not insured by any government protection scheme. As with any private loan, the value of your investment can go up or down — you may lose part or all of your invested capital.  © 2025 Equipool. All rights reserved.</div>
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
