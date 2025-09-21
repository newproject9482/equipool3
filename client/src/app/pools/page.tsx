'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Frame1116607621 from './Frame1116607621';
import PoolSubmittedForm from './Form';
import Button from './Button';
import { useRouter } from 'next/navigation';
import { Toaster, useToaster } from '../../components/Toaster';
import { getAuthenticatedFetchOptions, clearAuthData } from '../../utils/auth';
import { getPoolsUrlForRole, getSmartPoolsUrl } from '../../utils/navigation';
 

const LoginModal = dynamic(() => import('../../components/LoginModal'), { ssr: false });

// Pool interface
interface Pool {
  id: number;
  poolType: string;
  amount: string;
  roiRate: string;
  term: string;
  termMonths: number;
  status: string;
  fundingProgress: number;
  createdAt: string;
  address?: string;
  propertyValue?: string;
  mortgageBalance?: string;
}

export default function PoolsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'borrower' | 'investor' | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Pool creation states
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPoolType, setSelectedPoolType] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { toasts, removeToast, showSuccess, showError } = useToaster();

  // Hover states for pool type cards
  const [equityHover, setEquityHover] = useState(false);
  const [refinanceHover, setRefinanceHover] = useState(false);





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
  const [poolAmount, setPoolAmount] = useState('');
  const [roiRate, setRoiRate] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('12'); // Default to 12 months
  const [customTermMonths, setCustomTermMonths] = useState('');

  // Step 5 - Liability & Credit Info state
  const [otherPropertyLoans, setOtherPropertyLoans] = useState('');
  const [creditCardDebt, setCreditCardDebt] = useState('');
  const [monthlyDebtPayments, setMonthlyDebtPayments] = useState('');

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real pools data
  const [realPools, setRealPools] = useState<Pool[]>([]);
  const [loadingPools, setLoadingPools] = useState(false);

  // Removed filter states and UI

  // Calculate dynamic summary statistics
  const calculateSummaryStats = () => {
    if (realPools.length === 0) {
      return {
        totalBorrowed: '$0',
        nextPaymentDate: '--',
        nextPaymentAmount: '$0',
        activePools: '0'
      };
    }

    const totalAmount = realPools.reduce((sum, pool) => sum + parseFloat(pool.amount), 0);
    const activePoolsCount = realPools.filter(pool => pool.status === 'active').length;
    
    // For demo purposes, calculate a next payment based on the most recent active pool
    const activePool = realPools.find(pool => pool.status === 'active');
    let nextPayment = { date: '--', amount: '$0' };
    
    if (activePool) {
      const createdDate = new Date(activePool.createdAt);
      const nextPaymentDate = new Date(createdDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      
      const monthlyPayment = (parseFloat(activePool.amount) * (parseFloat(activePool.roiRate) / 100)) / 12;
      
      nextPayment = {
        date: nextPaymentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        amount: `$${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      };
    }

    return {
      totalBorrowed: `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      nextPaymentDate: nextPayment.date,
      nextPaymentAmount: nextPayment.amount,
      activePools: activePoolsCount.toString()
    };
  };

  const summaryStats = calculateSummaryStats();

  // Removed filter sort helpers and dropdown handlers

  // Function to fetch pools from backend
  const fetchPools = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('[DEBUG] fetchPools called but user not authenticated');
      return;
    }

    console.log('[DEBUG] Fetching pools...');
    setLoadingPools(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const poolsUrl = `${backendUrl}/api/pools`;
      
      console.log('[DEBUG] Fetching pools from URL:', poolsUrl);
      
      const response = await fetch(poolsUrl, getAuthenticatedFetchOptions({
        method: 'GET'
      }));

      console.log('[DEBUG] Fetch pools response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('[DEBUG] Fetch pools response data:', result);
        setRealPools(result.pools || []);
      } else {
        console.error('[DEBUG] Failed to fetch pools, status:', response.status);
        setRealPools([]);
      }
    } catch (error) {
      console.error('[DEBUG] Error fetching pools:', error);
      setRealPools([]);
    } finally {
      setLoadingPools(false);
    }
  }, [isAuthenticated]);

  // Fetch pools when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPools();
    }
  }, [isAuthenticated, fetchPools]);

  // Function to create pool
  const createPool = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const poolData = {
        poolType: selectedPoolType,
        addressLine: addressLine,
        city: city,
        state: state,
        zipCode: zipCode,
        percentOwned: parseFloat(percentOwned) || 0,
        coOwner: coOwner || null,
        propertyValue: propertyValue ? parseFloat(propertyValue.replace(/[,$]/g, '')) : null,
        propertyLink: propertyLink || null,
        mortgageBalance: mortgageBalance ? parseFloat(mortgageBalance.replace(/[,$]/g, '')) : null,
        amount: parseFloat(poolAmount.replace(/[,$]/g, '')) || 0,
        roiRate: parseFloat(roiRate) || 0,
    term: selectedTerm,
  customTermMonths: selectedTerm === 'custom' ? (parseInt(customTermMonths, 10) || null) : null,
    otherPropertyLoans: otherPropertyLoans ? parseFloat(otherPropertyLoans.replace(/[,$]/g, '')) : null,
    creditCardDebt: creditCardDebt ? parseFloat(creditCardDebt.replace(/[,$]/g, '')) : null,
    monthlyDebtPayments: monthlyDebtPayments ? parseFloat(monthlyDebtPayments.replace(/[,$]/g, '')) : null
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const createPoolUrl = `${backendUrl}/api/pools/create`;
      
      console.log('[DEBUG] Creating pool with URL:', createPoolUrl);
      console.log('[DEBUG] Pool data:', poolData);
      console.log('[DEBUG] Authentication status:', isAuthenticated);

      const response = await fetch(createPoolUrl, getAuthenticatedFetchOptions({
        method: 'POST',
        body: JSON.stringify(poolData)
      }));

      console.log('[DEBUG] Pool creation response status:', response.status);
      const result = await response.json();
      console.log('[DEBUG] Pool creation response data:', result);

      if (response.ok) {
        showSuccess('Pool created successfully! It will appear in your pools list.');
        // Keep the modal open and show a confirmation screen
        setShowConfirmation(true);
        setCurrentStep(1);

        // Reset form
        setSelectedPoolType('');
        setAddressLine('');
        setCity('');
        setState('');
        setZipCode('');
        setPercentOwned('');
        setCoOwner('');
        setPropertyValue('');
        setPropertyLink('');
        setMortgageBalance('');
        setPoolAmount('');
        setRoiRate('');
        setSelectedTerm('12');
        setCustomTermMonths('');
  setOtherPropertyLoans('');
  setCreditCardDebt('');
  setMonthlyDebtPayments('');

        // Refresh the pools list
        await fetchPools();
      } else {
        showError(result.error || 'Failed to create pool. Please try again.');
      }
    } catch (error) {
      console.error('Error creating pool:', error);
      showError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            
            // Redirect investors to the investor pools page
            if (data.role === 'investor') {
              console.log('[DEBUG] Redirecting investor to /pools-investor');
              router.push(getPoolsUrlForRole('investor'));
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
      clearAuthData(); // Clear both session flag and token
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
  setShowConfirmation(false);
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

  // Only render if user is authenticated and is a borrower
  if (!isAuthenticated || userRole !== 'borrower') {
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
              <button className="ep-nav-login" onClick={() => setShowLoginModal(true)} style={{cursor: 'pointer'}}>Login</button>
              <button className="ep-cta-join" onClick={() => window.location.href = '/'}>Join Equipool</button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{width: '100%', maxWidth: 1440, height: 515, margin: '0 auto'}}>
        <div style={{width: '100%', height: '100%', paddingTop: 120, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div style={{alignSelf: 'stretch', paddingLeft: 140, paddingRight: 140, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
            {/* Breadcrumb */}
            <div style={{alignSelf: 'stretch', paddingBottom: 16}}>
              <div>
                <span style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pools & Dashboard</span>
              </div>
            </div>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Overview</div>
            </div>
            <div style={{width: 1090, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'inline-flex'}}>
              <div style={{flex: '1 1 0', height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', textAlign: 'center'}}>Total Borrowed</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex'}}>
                  <div style={{
                    alignSelf: 'center',
                    color: 'black',
                    fontSize: 48,
                    fontFamily: 'var(--ep-font-avenir)',
                    fontWeight: '500',
                    wordWrap: 'break-word',
                    textAlign: 'center'
                  }}>
                    {summaryStats.totalBorrowed}
                  </div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'center', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', textAlign: 'center'}}>(i) Total amount you&apos;ve received across all funded pools.</div>
                </div>
              </div>
              <div style={{flex: '1 1 0', height: 280, padding: 32, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', textAlign: 'center'}}>Next Payment</div>
                </div>
                <div style={{alignSelf: 'stretch', flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                  <div style={{
                    alignSelf: 'center',
                    color: 'var(--Black, black)',
                    fontSize: 24,
                    fontFamily: 'var(--ep-font-avenir)',
                    fontWeight: '500',
                    wordWrap: 'break-word',
                    textAlign: 'center'
                  }}>
                    {summaryStats.nextPaymentDate}
                  </div>
                  <div style={{
                    alignSelf: 'center',
                    color: 'black',
                    fontSize: 48,
                    fontFamily: 'var(--ep-font-avenir)',
                    fontWeight: '500',
                    wordWrap: 'break-word',
                    textAlign: 'center'
                  }}>
                    {summaryStats.nextPaymentAmount}
                  </div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'center', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', textAlign: 'center'}}>(i) Your upcoming repayment amount and due date.</div>
                </div>
              </div>
              <div style={{height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', textAlign: 'center'}}>Active pools</div>
                </div>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', display: 'flex'}}>
                  <div style={{
                    alignSelf: 'center',
                    color: 'black',
                    fontSize: 48,
                    fontFamily: 'var(--ep-font-avenir)',
                    fontWeight: '500',
                    wordWrap: 'break-word',
                    textAlign: 'center'
                  }}>
                    {summaryStats.activePools}
                  </div>
                </div>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'center', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', textAlign: 'center'}}>(i) Number of currently running loans.</div>
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
      <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
        <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>All Pools</div>
      </div>
    </div>
  <div style={{width: '100%', maxWidth: 1122, height: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 350px)', gap: 24, justifyContent: 'flex-start', alignItems: 'start', margin: '24px 0 0 0'}}>
    {/* Loading state */}
    {loadingPools && (
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
        Loading pools...
      </div>
    )}

    {/* No pools state */}
    {!loadingPools && realPools.length === 0 && (
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
          No pools yet
        </div>
        <div style={{
          color: '#B2B2B2',
          fontSize: 14,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: '400',
          textAlign: 'center'
        }}>
          Create your first pool to get started with raising capital
        </div>
      </div>
    )}

    {/* Dynamic pool cards */}
  {!loadingPools && realPools.map((pool) => {
      // human-friendly display id (EP000123), keep for UI only
      const displayId = `EP${String(pool.id).padStart(6, '0')}`;
      const statusConfig: { [key: string]: { color: string; bgColor: string; label: string } } = {
        'active': { color: '#65CC8E', bgColor: '#DDF4E6', label: 'Active' },
        'draft': { color: '#F59E0B', bgColor: '#FEF3C7', label: 'Draft' },
        'funded': { color: '#3B82F6', bgColor: '#DBEAFE', label: 'Funded' },
        'completed': { color: '#10B981', bgColor: '#D1FAE5', label: 'Completed' },
        'cancelled': { color: '#EF4444', bgColor: '#FEE2E2', label: 'Cancelled' }
      };
      const status = statusConfig[pool.status] || statusConfig['draft'];
      
  return (
        <div key={pool.id} style={{
          width: 350,
          height: 355,
          padding: 32,
          paddingBottom: 56, // leave space for the bottom action
          position: 'relative',
          background: 'white',
          borderRadius: 24,
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
  // navigate to numeric pool id so backend/detail routing can use the integer id
  onClick={() => router.push(`/pools/${pool.id}`)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0px 8px 20px rgba(17, 61, 123, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px'}}>#{displayId}</div>
            <div style={{
              padding: '4px 10px',
              background: status.bgColor,
              borderRadius: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <div style={{width: 8, height: 8, background: status.color, borderRadius: '50%'}} />
              <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>{status.label}</div>
            </div>
          </div>

          {/* Pool Amount */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Pool Amount</div>
            <div style={{
              color: 'black',
              fontSize: 32,
              fontFamily: 'var(--ep-font-avenir)',
              fontWeight: '500'
            }}>
              ${parseFloat(pool.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>

          {/* Progress Bar Section */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>
              {pool.fundingProgress}% Funded
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
                width: `${pool.fundingProgress}%`,
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
              <div style={{
                color: 'black',
                fontSize: 16,
                fontFamily: 'var(--ep-font-avenir)',
                fontWeight: '500'
              }}>
                {new Date(pool.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Type</div>
              <div style={{
                color: 'black',
                fontSize: 16,
                fontFamily: 'var(--ep-font-avenir)',
                fontWeight: '500'
              }}>
                {pool.poolType === 'equity' ? 'Equity pool' : 'Refinancing'}
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Terms</div>
              <div style={{
                color: 'black',
                fontSize: 16,
                fontFamily: 'var(--ep-font-avenir)',
                fontWeight: '500'
              }}>
                {pool.roiRate}% / {pool.termMonths} Months
              </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div style={{color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>Repayment</div>
              <div style={{
                color: 'black',
                fontSize: 16,
                fontFamily: 'var(--ep-font-avenir)',
                fontWeight: '500'
              }}>
                Flexible
              </div>
            </div>
          </div>

          {/* View Pool Button */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 12,
            padding: '8px 16px',
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            background: 'transparent'
          }}>
            <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500'}}>View Pool</div>
            <svg width="12" height="12" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.6819 13.2777L9.53617 19.5L8 17.9447L13.3777 12.5L8 7.05531L9.53617 5.5L15.6819 11.7223C15.8856 11.9286 16 12.2083 16 12.5C16 12.7917 15.8856 13.0714 15.6819 13.2777Z" fill="black"/>
            </svg>
          </div>
        </div>
      );
    })}
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
          onSuccess={() => { setIsAuthenticated(true); setShowLoginModal(false); }}
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
                        <Image src="/material-symbols-close.svg" alt="Close" width={18} height={18} />
                      </div>
                  </div>
                  
                  {/* Progress Steps - external component (clickable steps) */}
                  <div style={{alignSelf: 'stretch'}}>
                    <Frame1116607621
                      currentStep={currentStep}
                      onStepClick={(step) => {
                        // Allow navigating to any previous step or the current/next steps.
                        // We don't clear any state here, so inputs remain preserved.
                        setCurrentStep(step);
                      }}
                    />
                  </div>
              </div>
              
              {/* Step Content */}
              {showConfirmation ? (
                <div style={{alignSelf: 'stretch', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24}}>
                  <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 12}}>
                    <PoolSubmittedForm />
                    <div style={{marginTop: 8}}>
                      <Button onClick={() => { setShowConfirmation(false); setShowCreatePoolModal(false); }} />
                    </div>
                  </div>
                </div>
              ) : currentStep === 1 && (
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
                            <div style={{alignSelf: 'stretch', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>(i) Equity pools are ideal when you want to tap into your home&apos;s value for cash.</div>
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
                          <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>Enter your best estimate of the property&apos;s current market value. This helps us validate and underwrite your loan faster.</div>
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
                          <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>If no link is provided or the URL doesn&apos;t lead to a valid listing, we may request a formal appraisal document in the next step to verify your property&apos;s value.</div>
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
                      <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>Enter your best estimate of the property&apos;s current market value. This helps us validate and underwrite your loan faster.</div>
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
                          }}>Save and Continue</div>
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
                          value={poolAmount}
                          onChange={(e) => setPoolAmount(e.target.value)}
                          placeholder="e.g. 350 000"
                          style={{
                            flex: '1 1 0',
                            color: poolAmount ? 'black' : '#B2B2B2',
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
                          <div style={{width: '100%', height: '100%', paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, background: 'rgba(89.37, 59.38, 209.33, 0.16)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>Recommended range: 6% – 12%</div>
                          </div>
                        </div>
                        <div style={{color: '#767676', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>What return are you offering to your investor?</div>
                      </div>
                      <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: '#F4F4F4', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>%</div>
                        <input
                          type="text"
                          value={roiRate}
                          onChange={(e) => setRoiRate(e.target.value)}
                          placeholder="e.g. 8.5"
                          style={{
                            flex: '1 1 0',
                            color: roiRate ? 'black' : '#B2B2B2',
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
      <div style={{width: '100%', height: 'auto', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
  <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex', cursor: customTermMonths ? 'not-allowed' : 'pointer', opacity: customTermMonths ? 0.6 : 1}} onClick={() => { if (!customTermMonths) setSelectedTerm('6') }}>
        <div style={{width: 14, height: 14, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
            {selectedTerm === '6' ? (
              <>
                <div style={{width: 14, height: 14, borderRadius: 50, background: '#113D7B'}} />
                <div style={{width: 6, height: 6, background: 'white', borderRadius: 50, position: 'absolute'}} />
              </>
            ) : (
              <div style={{width: 14, height: 14, borderRadius: 50, border: '1.5px #B2B2B2 solid'}} />
            )}
        </div>
        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', lineHeight: 1.4}}>6 Months</div>
    </div>
  <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex', cursor: customTermMonths ? 'not-allowed' : 'pointer', opacity: customTermMonths ? 0.6 : 1}} onClick={() => { if (!customTermMonths) setSelectedTerm('12') }}>
        <div style={{width: 14, height: 14, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
            {selectedTerm === '12' ? (
              <>
                <div style={{width: 14, height: 14, borderRadius: 50, background: '#113D7B'}} />
                <div style={{width: 6, height: 6, background: 'white', borderRadius: 50, position: 'absolute'}} />
              </>
            ) : (
              <div style={{width: 14, height: 14, borderRadius: 50, border: '1.5px #B2B2B2 solid'}} />
            )}
        </div>
        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', lineHeight: 1.4}}>12 Months</div>
    </div>
  <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex', cursor: customTermMonths ? 'not-allowed' : 'pointer', opacity: customTermMonths ? 0.6 : 1}} onClick={() => { if (!customTermMonths) setSelectedTerm('24') }}>
        <div style={{width: 14, height: 14, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
            {selectedTerm === '24' ? (
              <>
                <div style={{width: 14, height: 14, borderRadius: 50, background: '#113D7B'}} />
                <div style={{width: 6, height: 6, background: 'white', borderRadius: 50, position: 'absolute'}} />
              </>
            ) : (
              <div style={{width: 14, height: 14, borderRadius: 50, border: '1.5px #B2B2B2 solid'}} />
            )}
        </div>
        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', lineHeight: 1.4}}>24 Months</div>
    </div>
    <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>or</div>
    <div style={{paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}} onClick={() => setSelectedTerm('custom')}>
        <input
          type="number"
          value={customTermMonths}
          onChange={(e) => setCustomTermMonths(e.target.value)}
          onFocus={() => setSelectedTerm('custom')}
          placeholder="Months"
          style={{
            width: 96,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            color: customTermMonths ? 'black' : '#B2B2B2',
            fontSize: 14,
            fontFamily: 'var(--ep-font-avenir)',
            fontWeight: '500',
            lineHeight: 1.4
          }}
        />
    </div>
</div>
            </div>
                    </div>

                  </div>
                  
                  {/* Continue Button */}
                  <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                    <div 
                      style={{
                        paddingLeft: 16, 
                        paddingRight: 16, 
                        paddingTop: 10, 
                        paddingBottom: 10, 
                        background: (poolAmount && roiRate) ? '#113D7B' : 'var(--Inactive-Blue, #B8C5D7)', 
                        boxShadow: '0px 1px 0.5px 0.05000000074505806px rgba(29, 41, 61, 0.02)', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 6, 
                        display: 'inline-flex',
                        cursor: (poolAmount && roiRate) ? 'pointer' : 'not-allowed',
                        opacity: (poolAmount && roiRate) ? 1 : 0.6
                      }}
                      onClick={() => {
                        if (poolAmount && roiRate) {
                          setCurrentStep(4);
                        }
                      }}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Save and Continue</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                /* Documents Step - 2x2 Grid Layout */
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
                  {/* 2x2 Grid Container */}
                  <div style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: 'auto auto',
                    gridAutoRows: 'minmax(80px, auto)',
                    gap: 20,
                    height: 'auto'
                  }}>
                    
                    {/* Top Left - Home Insurance PDF */}
                    <div style={{
                      padding: 20,
                      background: 'white',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 4,
                        display: 'flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>Home insurance (PDF)</div>
                      </div>
                      <div style={{
                        color: '#767676',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        lineHeight: 1.4,
                        wordWrap: 'break-word'
                      }}>Add your most recent home insurance policy. Boosts credibility and reduces approval friction.</div>
                      <div style={{
                        alignSelf: 'stretch',
                        flex: '1 1 0',
                        padding: 16,
                        background: '#F9F9F9',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex',
                        cursor: 'pointer'
                      }}>
                        <div style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 4,
                          display: 'flex'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.33 1.33H4C3.27 1.33 2.67 1.93 2.67 2.67V13.33C2.67 14.07 3.26 14.67 3.99 14.67H12C12.73 14.67 13.33 14.07 13.33 13.33V5.33L9.33 1.33Z" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="9.33,1.33 9.33,5.33 13.33,5.33" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.33 1.33H4C3.27 1.33 2.67 1.93 2.67 2.67V13.33C2.67 14.07 3.26 14.67 3.99 14.67H12C12.73 14.67 13.33 14.07 13.33 13.33V5.33L9.33 1.33Z" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="9.33,1.33 9.33,5.33 13.33,5.33" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div style={{
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 2,
                          display: 'flex'
                        }}>
                          <div style={{
                            color: 'black',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>Upload a file</div>
                          <div style={{
                            color: '#767676',
                            fontSize: 10,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                          }}>Drag and drop or click to upload</div>
                        </div>
                      </div>
                    </div>

                    {/* Top Right - Recent Tax Return PDF */}
                    <div style={{
                      padding: 20,
                      background: 'white',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 4,
                        display: 'flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>Recent tax return (PDF)</div>
                      </div>
                      <div style={{
                        color: '#767676',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        lineHeight: 1.4,
                        wordWrap: 'break-word'
                      }}>Upload a recent tax return to strengthen your financial profile. Helps validate your repayment capacity.</div>
                      <div style={{
                        alignSelf: 'stretch',
                        flex: '1 1 0',
                        padding: 16,
                        background: '#F9F9F9',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex',
                        cursor: 'pointer'
                      }}>
                        <div style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 4,
                          display: 'flex'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.33 1.33H4C3.27 1.33 2.67 1.93 2.67 2.67V13.33C2.67 14.07 3.26 14.67 3.99 14.67H12C12.73 14.67 13.33 14.07 13.33 13.33V5.33L9.33 1.33Z" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="9.33,1.33 9.33,5.33 13.33,5.33" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.33 1.33H4C3.27 1.33 2.67 1.93 2.67 2.67V13.33C2.67 14.07 3.26 14.67 3.99 14.67H12C12.73 14.67 13.33 14.07 13.33 13.33V5.33L9.33 1.33Z" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="9.33,1.33 9.33,5.33 13.33,5.33" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div style={{
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 2,
                          display: 'flex'
                        }}>
                          <div style={{
                            color: 'black',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>Upload a file</div>
                          <div style={{
                            color: '#767676',
                            fontSize: 10,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                          }}>Drag and drop or click to upload</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Left - Appraisal PDF (Optional) */}
                    <div style={{
                      padding: 20,
                      background: 'white',
                      borderRadius: 12,
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>Appraisal PDF</div>
                        <div style={{
                          color: '#767676',
                          fontSize: 10,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '400',
                          wordWrap: 'break-word'
                        }}>(Optional)</div>
                      </div>
                      <div style={{
                        color: '#767676',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        lineHeight: 1.4,
                        wordWrap: 'break-word'
                      }}>The most recent appraisal can increase investor confidence.</div>
                      <div style={{
                        alignSelf: 'stretch',
                        flex: '1 1 0',
                        padding: 16,
                        background: '#F9F9F9',
                        borderRadius: 8,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex',
                        cursor: 'pointer'
                      }}>
                        <div style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 4,
                          display: 'flex'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.33 1.33H4C3.27 1.33 2.67 1.93 2.67 2.67V13.33C2.67 14.07 3.26 14.67 3.99 14.67H12C12.73 14.67 13.33 14.07 13.33 13.33V5.33L9.33 1.33Z" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="9.33,1.33 9.33,5.33 13.33,5.33" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.33 1.33H4C3.27 1.33 2.67 1.93 2.67 2.67V13.33C2.67 14.07 3.26 14.67 3.99 14.67H12C12.73 14.67 13.33 14.07 13.33 13.33V5.33L9.33 1.33Z" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="9.33,1.33 9.33,5.33 13.33,5.33" stroke="#9CA3AF" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div style={{
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 2,
                          display: 'flex'
                        }}>
                          <div style={{
                            color: 'black',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>Upload a file</div>
                          <div style={{
                            color: '#767676',
                            fontSize: 10,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                          }}>Drag and drop or click to upload</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Right - Property Photos */}
                    <div style={{
                      padding: 20,
                      background: 'white',
                      borderRadius: 12,
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 4,
                        display: 'flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>Property photos</div>
                      </div>
                      <div style={{
                        color: '#767676',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        lineHeight: 1.4,
                        wordWrap: 'break-word'
                      }}>Upload clear exterior and interior photos (2–10). Transparency improves your chances of funding.</div>
                      <div style={{
                        alignSelf: 'stretch',
                        flex: '1 1 0',
                        padding: 16,
                        background: '#F9F9F9',
                        borderRadius: 8,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex',
                        cursor: 'pointer'
                      }}>
                        <div style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 4,
                          display: 'flex'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="12" height="12" rx="1.33" ry="1.33" stroke="#9CA3AF" strokeWidth="1.33"/>
                            <circle cx="5.67" cy="5.67" r="1" stroke="#9CA3AF" strokeWidth="1.33"/>
                            <polyline points="14,10 10.67,6.67 3.33,14" stroke="#9CA3AF" strokeWidth="1.33"/>
                          </svg>
                        </div>
                        <div style={{
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 2,
                          display: 'flex'
                        }}>
                          <div style={{
                            color: 'black',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>Upload images</div>
                          <div style={{
                            color: '#767676',
                            fontSize: 10,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                          }}>Drag and drop or click to upload</div>
                        </div>
                      </div>
                    </div>

                  </div>
                  
                  {/* Continue Button */}
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', marginTop: 24}}>
                    <div 
                      style={{
                        paddingLeft: 16, 
                        paddingRight: 16, 
                        paddingTop: 10, 
                        paddingBottom: 10, 
                        background: '#113D7B', 
                        boxShadow: '0px 1px 0.5px 0.05000000074505806px rgba(29, 41, 61, 0.02)', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 6, 
                        display: 'inline-flex',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentStep(5)}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Save and Continue</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                /* Liability & Credit Info Step */
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
                    
                    {/* Header Section */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 8,
                      display: 'flex'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: 16,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>Other existing liabilities</div>
                      <div style={{
                        color: '#767676',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        wordWrap: 'break-word'
                      }}>Give us a picture of your current financial obligations.</div>
                    </div>

                    {/* Other Property-Secured Loans */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 8,
                      display: 'flex'
                    }}>
                      <div style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>Other property-secured loans</div>
                        <div style={{
                          color: '#767676',
                          fontSize: 12,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '400',
                          wordWrap: 'break-word'
                        }}>(Optional)</div>
                      </div>
                      <div style={{
                        color: '#767676',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        lineHeight: 1.4,
                        wordWrap: 'break-word'
                      }}>Include any outstanding loans backed by real estate you own.</div>
                      <div style={{
                        alignSelf: 'stretch',
                        height: 39,
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingTop: 10,
                        paddingBottom: 10,
                        background: '#F4F4F4',
                        borderRadius: 10,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 10,
                        display: 'inline-flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>$</div>
                        <input
                          type="text"
                          value={otherPropertyLoans}
                          onChange={(e) => setOtherPropertyLoans(e.target.value)}
                          placeholder="e.g. 100 000"
                          style={{
                            flex: '1 1 0',
                            color: otherPropertyLoans ? 'black' : '#B2B2B2',
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

                    {/* Credit Card Debt / Consumer Loans */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 8,
                      display: 'flex'
                    }}>
                      <div style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>Credit card debt / consumer loans</div>
                        <div style={{
                          color: '#767676',
                          fontSize: 12,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '400',
                          wordWrap: 'break-word'
                        }}>(Optional)</div>
                      </div>
                      <div style={{
                        color: '#767676',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        lineHeight: 1.4,
                        wordWrap: 'break-word'
                      }}>Include credit card balances, personal loans, car loans, or buy-now-pay-later programs.</div>
                      <div style={{
                        alignSelf: 'stretch',
                        height: 39,
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingTop: 10,
                        paddingBottom: 10,
                        background: '#F4F4F4',
                        borderRadius: 10,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 10,
                        display: 'inline-flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>$</div>
                        <input
                          type="text"
                          value={creditCardDebt}
                          onChange={(e) => setCreditCardDebt(e.target.value)}
                          placeholder="e.g. 100 000"
                          style={{
                            flex: '1 1 0',
                            color: creditCardDebt ? 'black' : '#B2B2B2',
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

                    {/* Monthly Debt Payments */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 8,
                      display: 'flex'
                    }}>
                      <div style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>Monthly debt payments</div>
                        <div style={{
                          color: '#767676',
                          fontSize: 12,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '400',
                          wordWrap: 'break-word'
                        }}>(Optional)</div>
                      </div>
                      <div style={{
                        color: '#767676',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        lineHeight: 1.4,
                        wordWrap: 'break-word'
                      }}>Estimate your total monthly debt payments across all loans and credit.</div>
                      <div style={{
                        alignSelf: 'stretch',
                        height: 39,
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingTop: 10,
                        paddingBottom: 10,
                        background: '#F4F4F4',
                        borderRadius: 10,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 10,
                        display: 'inline-flex'
                      }}>
                        <div style={{
                          color: 'black',
                          fontSize: 14,
                          fontFamily: 'var(--ep-font-avenir)',
                          fontWeight: '500',
                          wordWrap: 'break-word'
                        }}>Monthly</div>
                        <input
                          type="text"
                          value={monthlyDebtPayments}
                          onChange={(e) => setMonthlyDebtPayments(e.target.value)}
                          placeholder="e.g. 100 000"
                          style={{
                            flex: '1 1 0',
                            color: monthlyDebtPayments ? 'black' : '#B2B2B2',
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
                  
                  {/* Continue Button */}
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', marginTop: 24}}>
                    <div 
                      style={{
                        paddingLeft: 16, 
                        paddingRight: 16, 
                        paddingTop: 10, 
                        paddingBottom: 10, 
                        background: '#113D7B', 
                        boxShadow: '0px 1px 0.5px 0.05000000074505806px rgba(29, 41, 61, 0.02)', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 6, 
                        display: 'inline-flex',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentStep(6)}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Save and Continue</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                /* Review & Submit Step */
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
                    
                    {/* Header Section */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 8,
                      display: 'flex'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: 18,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>Review your pool details</div>
                      <div style={{
                        color: '#767676',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        wordWrap: 'break-word'
                      }}>Please review all information before submitting your pool request.</div>
                    </div>

                    {/* Pool Type Summary */}
                    <div style={{
                      alignSelf: 'stretch',
                      padding: 16,
                      background: '#F9FAFB',
                      borderRadius: 12,
                      border: '1px solid #E5E7EB',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 8,
                      display: 'flex'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: 14,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>Pool Type</div>
                      <div style={{
                        color: '#4B5563',
                        fontSize: 12,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '400',
                        wordWrap: 'break-word'
                      }}>{selectedPoolType === 'equity' ? 'Equity Pool' : 'Refinance Pool'}</div>
                    </div>

                    {/* Property Information Summary */}
                    <div style={{
                      alignSelf: 'stretch',
                      padding: 16,
                      background: '#F9FAFB',
                      borderRadius: 12,
                      border: '1px solid #E5E7EB',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: 14,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>Property Information</div>
                      <div style={{
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 8,
                        display: 'flex'
                      }}>
                        <div style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                          }}>Address:</div>
                          <div style={{
                            color: '#4B5563',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>{addressLine}, {city}, {state} {zipCode}</div>
                        </div>
                        <div style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                          }}>Ownership:</div>
                          <div style={{
                            color: '#4B5563',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>{percentOwned}%{coOwner ? ` (Co-owner: ${coOwner})` : ''}</div>
                        </div>
                        {propertyValue && (
                          <div style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            display: 'flex'
                          }}>
                            <div style={{
                              color: '#6B7280',
                              fontSize: 12,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '400',
                              wordWrap: 'break-word'
                            }}>Property Value:</div>
                            <div style={{
                              color: '#4B5563',
                              fontSize: 12,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}>${propertyValue}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pool Terms Summary */}
                    <div style={{
                      alignSelf: 'stretch',
                      padding: 16,
                      background: '#F9FAFB',
                      borderRadius: 12,
                      border: '1px solid #E5E7EB',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        color: 'black',
                        fontSize: 14,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>Pool Terms</div>
                      <div style={{
                        alignSelf: 'stretch',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: 8,
                        display: 'flex'
                      }}>
                        <div style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                          }}>Amount Requested:</div>
                          <div style={{
                            color: '#4B5563',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>${poolAmount}</div>
                        </div>
                        <div style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                          }}>Interest Rate:</div>
                          <div style={{
                            color: '#4B5563',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>{roiRate}%</div>
                        </div>
                        <div style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          display: 'flex'
                        }}>
                          <div style={{
                            color: '#6B7280',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '400',
                            wordWrap: 'break-word'
                          }}>Term:</div>
                          <div style={{
                            color: '#4B5563',
                            fontSize: 12,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>{selectedTerm === 'custom' ? 'Custom' : `${selectedTerm} Months`}</div>
                        </div>
                      </div>
                    </div>

                  </div>
                  
                  {/* Submit Button */}
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', marginTop: 24}}>
                    <div 
                      style={{
                        paddingLeft: 24, 
                        paddingRight: 24, 
                        paddingTop: 12, 
                        paddingBottom: 12, 
                        background: isSubmitting ? '#9CA3AF' : '#10B981', 
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                        display: 'inline-flex',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                      onClick={() => {
                        createPool();
                      }}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>
                        {isSubmitting ? 'Creating Pool...' : 'Submit Pool Request'}
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
