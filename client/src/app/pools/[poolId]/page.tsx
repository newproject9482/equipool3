'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { getAuthenticatedFetchOptions, clearAuthData } from '../../../utils/auth';
import Navbar from '../../../components/Navbar';

export default function PoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const poolId = params?.poolId as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
    otherPropertyLoans?: string | null;
    creditCardDebt?: string | null;
    monthlyDebtPayments?: string | null;
    homeInsuranceDoc?: string | null;
    taxReturnDoc?: string | null;
    appraisalDoc?: string | null;
    propertyPhotos?: string[];
  }
  // Allowed term options for the pool
  type TermOption = '6' | '12' | '24' | 'custom' | '';

  // Payload type when updating a pool (only send fields that may change)
  type UpdatePayload = {
    poolType?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    percentOwned?: string;
    coOwner?: string | null;
    propertyValue?: string | null;
    propertyLink?: string | null;
    mortgageBalance?: string | null;
    amount?: string;
    roiRate?: string;
    term?: TermOption | string; // backend may accept string months or 'custom'
    customTermMonths?: number | null;
    otherPropertyLoans?: string;
    creditCardDebt?: string;
    monthlyDebtPayments?: string;
  };
  const [poolData, setPoolData] = useState<PoolDetail | null>(null);
  const [loadingPool, setLoadingPool] = useState(false);
  const [poolError, setPoolError] = useState<string | null>(null);

  // Editable fields for the Edit modal
  const [editFields, setEditFields] = useState({
    poolType: '' as 'equity' | 'refinance' | '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    percentOwned: '',
    coOwner: '',
    propertyValue: '',
    propertyLink: '',
    mortgageBalance: '',
    amount: '',
    roiRate: '',
    term: '' as TermOption,
    customTermMonths: '',
    otherPropertyLoans: '',
    creditCardDebt: '',
    monthlyDebtPayments: ''
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/me`, getAuthenticatedFetchOptions());
        if (response.ok) {
          const data = await response.json();
          if (!cancelled && data.authenticated) {
            setIsAuthenticated(true);
          }
          return;
        }
      } catch {
        // Ignore auth check errors
      }
      // Fallback to localStorage
      if (!cancelled && typeof window !== 'undefined' && localStorage.getItem('ep-auth') === '1') {
        setIsAuthenticated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch pool detail by numeric id (accepts EP000123 or numeric id)
  useEffect(() => {
    let cancelled = false;
    const fetchPool = async () => {
      if (!poolId) return;
      const numericMatch = poolId.match(/(\d+)/);
      const numericId = numericMatch ? numericMatch[0] : poolId;
      setLoadingPool(true);
      setPoolError(null);
      try {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/pools/${numericId}`, getAuthenticatedFetchOptions());
        if (!resp.ok) {
          setPoolError(`Failed to load pool (status ${resp.status})`);
          setPoolData(null);
        } else {
          const data = await resp.json();
          if (!cancelled) setPoolData(data);
        }
      } catch (err: unknown) {
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

  // When opening edit modal, seed fields from current pool data
  useEffect(() => {
    if (showEditModal && poolData) {
      setEditFields({
        poolType: (poolData.poolType as 'equity' | 'refinance') || '',
        addressLine: poolData.addressLine || '',
        city: poolData.city || '',
        state: poolData.state || '',
        zipCode: poolData.zipCode || '',
        percentOwned: poolData.percentOwned || '',
        coOwner: poolData.coOwner || '',
        propertyValue: poolData.propertyValue || '',
        propertyLink: poolData.propertyLink || '',
        mortgageBalance: poolData.mortgageBalance || '',
        amount: poolData.amount || '',
        roiRate: poolData.roiRate || '',
        term: (poolData.term as '6' | '12' | '24' | 'custom') || '',
        customTermMonths: poolData.customTermMonths ? String(poolData.customTermMonths) : '',
        otherPropertyLoans: poolData.otherPropertyLoans || '',
        creditCardDebt: poolData.creditCardDebt || '',
        monthlyDebtPayments: poolData.monthlyDebtPayments || ''
      });
      setSaveError(null);
      setIsSavingEdit(false);
    }
  }, [showEditModal, poolData]);

  const handleSaveEdit = async () => {
    if (!poolData) return;
    setIsSavingEdit(true);
    setSaveError(null);
    try {
      const payload: UpdatePayload = {
        poolType: editFields.poolType || poolData.poolType,
        addressLine: editFields.addressLine,
        city: editFields.city,
        state: editFields.state,
        zipCode: editFields.zipCode,
        percentOwned: editFields.percentOwned,
        coOwner: editFields.coOwner,
        propertyValue: editFields.propertyValue,
        propertyLink: editFields.propertyLink,
        mortgageBalance: editFields.mortgageBalance,
        amount: editFields.amount,
        roiRate: editFields.roiRate,
        term: editFields.term || poolData.term,
        customTermMonths: editFields.term === 'custom' ? (editFields.customTermMonths ? Number(editFields.customTermMonths) : null) : null,
        otherPropertyLoans: editFields.otherPropertyLoans,
        creditCardDebt: editFields.creditCardDebt,
        monthlyDebtPayments: editFields.monthlyDebtPayments,
      };

      const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/pools/${poolData.id}/update`, getAuthenticatedFetchOptions({
        method: 'PUT',
        body: JSON.stringify(payload),
      }));
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Failed to save (status ${resp.status})`);
      }
      const updated = await resp.json();
      setPoolData(updated);
      setShowEditModal(false);
    } catch (e: unknown) {
      const err = e as Error;
      setSaveError(err.message || 'Failed to save changes');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/logout`, getAuthenticatedFetchOptions({
        method: 'POST'
      }));
      setIsAuthenticated(false);
      setShowProfileMenu(false);
      clearAuthData();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeletePool = async () => {
    if (!poolData) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/pools/${poolData.id}/delete`,
        getAuthenticatedFetchOptions({
          method: 'DELETE'
        })
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete pool');
      }
      
      // Redirect to pools page
      router.push('/pools');
    } catch (error) {
      console.error('Delete failed:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete pool');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        variant="default"
        isAuthenticated={isAuthenticated}
        userRole="borrower"
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
            </div>
            
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Pool Content - Overview Section */}
                <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                  <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Pool Details</div>
                </div>
            
            {/* Pool Overview Card */}
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
                  fontSize: 24,
                  fontFamily: 'var(--ep-font-avenir)',
                  fontWeight: '500',
                  wordWrap: 'break-word'
                }}>
                  Pool #{poolId} - Overview
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: '#F7E6D6',
                  borderRadius: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  display: 'flex'
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    background: '#DBAC7E',
                    borderRadius: '50%'
                  }} />
                  <div style={{
                    color: 'black',
                    fontSize: 14,
                    fontFamily: 'var(--ep-font-avenir)',
                    fontWeight: '500',
                    wordWrap: 'break-word'
                  }}>
                    System Pending
                  </div>
                </div>
              </div>

              {/* Pool Repayment Section */}
              <div style={{
                alignSelf: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 8,
                display: 'flex'
              }}>
                <div style={{
                  color: '#B2B2B2',
                  fontSize: 16,
                  fontFamily: 'var(--ep-font-avenir)',
                  fontWeight: '500',
                  wordWrap: 'break-word'
                }}>
                  Pool Repayment
                </div>
                <div style={{
                  color: 'black',
                  fontSize: 32,
                  fontFamily: 'var(--ep-font-avenir)',
                  fontWeight: '500',
                  wordWrap: 'break-word'
                }}>
                  {loadingPool ? 'Loading...' : poolError ? poolError : poolData ?
                    `$${Number(poolData.amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}` : '--'}
                </div>
              </div>

              {/* Pool Information Section */}
              <div style={{
                alignSelf: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 20,
                display: 'flex'
              }}>
                <div style={{
                  color: '#B2B2B2',
                  fontSize: 16,
                  fontFamily: 'var(--ep-font-avenir)',
                  fontWeight: '500',
                  wordWrap: 'break-word'
                }}>
                  Pool Information
                </div>
                <div style={{
                  alignSelf: 'stretch',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 24
                }}>
                  <div style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 8,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: '#767676',
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
                      01/05/2025
                    </div>
                  </div>
                  <div style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 8,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: '#767676',
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
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 8,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: '#767676',
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
                      {poolData ? `$${Number(poolData.amount).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}` : '--'}
                    </div>
                  </div>
                  <div style={{
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
                      {poolData ? `${Number(poolData.roiRate).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}% / ${poolData.termMonths ?? poolData.term ?? '--'} Months` : '--'}
                    </div>
                  </div>
                  <div style={{
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
                      {poolData ? (poolData.poolType === 'equity' ? 'Equity pool' : 'Refinancing') : '--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Info Section */}
              <div style={{
                alignSelf: 'stretch',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 20,
                display: 'flex'
              }}>
                <div style={{
                  color: 'black',
                  fontSize: 16,
                  fontFamily: 'var(--ep-font-avenir)',
                  fontWeight: '500',
                  wordWrap: 'break-word'
                }}>
                  Property Info
                </div>
                <div style={{
                  alignSelf: 'stretch',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 24
                }}>
                  <div style={{
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
                    }}>
                      Address
                    </div>
                    <div style={{
                      color: 'black',
                      fontSize: 16,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word'
                    }}>
                      {poolData ? `${poolData.addressLine ?? ''}${poolData.city ? ', ' + poolData.city : ''}${poolData.state ? ', ' + poolData.state : ''}${poolData.zipCode ? ', ' + poolData.zipCode : ''}` : '--'}
                    </div>
                  </div>
                  <div style={{
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
                      {poolData && poolData.coOwner ? poolData.coOwner : '--'}
                    </div>
                  </div>
                  <div style={{
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
                    }}>
                      Property Link
                    </div>
                    <div style={{
                      color: '#113D7B',
                      fontSize: 16,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word',
                      textDecoration: 'underline',
                      cursor: poolData && poolData.propertyLink ? 'pointer' : 'default'
                    }} onClick={() => {
                      if (poolData && poolData.propertyLink) window.open(poolData.propertyLink, '_blank');
                    }}>
                      {poolData && poolData.propertyLink ? poolData.propertyLink : '--'}
                    </div>
                  </div>
                  <div style={{
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
                      {poolData && poolData.propertyValue ? `$ ${Number(poolData.propertyValue).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}` : '--'}
                    </div>
                  </div>
                  <div style={{
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
                      {poolData && poolData.mortgageBalance ? `$ ${Number(poolData.mortgageBalance).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}` : '--'}
                    </div>
                  </div>
                  <div style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 8,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: '#767676',
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
                      {poolData && poolData.percentOwned ? `${Number(poolData.percentOwned).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}% Owned` : '--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                alignSelf: 'stretch',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 16,
                display: 'flex'
              }}>
                <button 
                  onClick={() => setShowEditModal(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'white',
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    display: 'flex',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    color: 'black',
                    fontSize: 14,
                    fontFamily: 'var(--ep-font-avenir)',
                    fontWeight: '500',
                    wordWrap: 'break-word'
                  }}>
                    Edit
                  </div>
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    padding: '12px 24px',
                    background: '#CC4747',
                    borderRadius: 12,
                    border: 'none',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    display: 'flex',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    color: 'white',
                    fontSize: 14,
                    fontFamily: 'var(--ep-font-avenir)',
                    fontWeight: '500',
                    wordWrap: 'break-word'
                  }}>
                    Abort pool request
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div style={{
              width: '100%',
              padding: 32,
              background: 'white',
              borderRadius: 24,
              border: '1px solid #E5E7EB',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 24,
              display: 'flex',
              marginTop: 24
            }}>
              {/* Recent Activity Header */}
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
                  Recent activity
                </div>
                <div style={{
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 16,
                  display: 'flex'
                }}>
                  <div style={{
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 8,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: '#767676',
                      fontSize: 14,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word'
                    }}>
                      Filters
                    </div>
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.88889 4H10.1111C10.2143 4 10.3132 4.04162 10.3861 4.11571C10.459 4.1898 10.5 4.29028 10.5 4.39506V5.02162C10.5 5.12638 10.459 5.22685 10.3861 5.30092L7.89172 7.83482C7.81879 7.90889 7.7778 8.00935 7.77778 8.11412V10.605C7.77778 10.665 7.7643 10.7243 7.73837 10.7782C7.71244 10.8322 7.67474 10.8794 7.62814 10.9164C7.58154 10.9533 7.52726 10.979 7.46942 10.9914C7.41159 11.0039 7.35173 11.0028 7.29439 10.9882L6.51661 10.7906C6.43252 10.7692 6.35787 10.7199 6.30453 10.6505C6.2512 10.581 6.22222 10.4955 6.22222 10.4074V8.11412C6.2222 8.00935 6.18121 7.90889 6.10828 7.83482L3.61394 5.30092C3.54101 5.22685 3.50002 5.12638 3.5 5.02162V4.39506C3.5 4.29028 3.54097 4.1898 3.6139 4.11571C3.68683 4.04162 3.78575 4 3.88889 4Z" stroke="#767676" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    display: 'flex',
                    cursor: 'pointer'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V12C2 12.7364 2.59695 13.3333 3.33333 13.3333H12.6667C13.403 13.3333 14 12.7364 14 12V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z" stroke="black" strokeWidth="1.5"/>
                      <path d="M2 5.33333H14" stroke="black" strokeWidth="1.5"/>
                      <path d="M5.33594 1.33333V4" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M10.6641 1.33333V4" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div style={{
                      color: 'black',
                      fontSize: 14,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word'
                    }}>
                      Date
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Item */}
              <div style={{
                alignSelf: 'stretch',
                padding: 20,
                background: '#F9F9F9',
                borderRadius: 16,
                justifyContent: 'space-between',
                alignItems: 'center',
                display: 'flex'
              }}>
                <div style={{
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 16,
                  display: 'flex'
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: '#E4EFFF',
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.25 6.875L8.125 15L3.75 10.625" stroke="#113D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 4,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: 'black',
                      fontSize: 16,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word'
                    }}>
                      Your pool was submitted successfully
                    </div>
                    <div style={{
                      maxWidth: 500,
                      color: '#767676',
                      fontSize: 14,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '400',
                      lineHeight: '20px',
                      wordWrap: 'break-word'
                    }}>
                      Our system is now reviewing your data for eligibility and compliance.<br/>
                      You&apos;ll be notified once it&apos;s ready to share with investors.
                    </div>
                  </div>
                </div>
                <div style={{
                  color: '#767676',
                  fontSize: 14,
                  fontFamily: 'var(--ep-font-avenir)',
                  fontWeight: '500',
                  wordWrap: 'break-word'
                }}>
                  12/05/2024
                </div>
              </div>
            </div>
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
                  {/* Header Section */}
                  <div style={{
                    alignSelf: 'stretch',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: 'flex'
                  }}>
                    <div style={{
                      color: 'black',
                      fontSize: 24,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word'
                    }}>
                      Pool #{poolId} - Assigned Documents
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      background: '#F7E6D6',
                      borderRadius: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 8,
                      display: 'flex'
                    }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        background: '#DBAC7E',
                        borderRadius: '50%'
                      }} />
                      <div style={{
                        color: 'black',
                        fontSize: 14,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>
                        System Pending
                      </div>
                    </div>
                  </div>

                  {/* Document Items */}
                  <div style={{
                    alignSelf: 'stretch',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 24,
                    display: 'flex'
                  }}>
                    {/* Home Insurance Document */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        color: '#B2B2B2',
                        fontSize: 16,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>
                        Home Insurance
                      </div>
                      <div style={{
                        alignSelf: 'stretch',
                        padding: 16,
                        background: '#F9F9F9',
                        borderRadius: 12,
                        border: '1px dashed #E5E7EB',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        display: 'flex'
                      }}>
                        <div style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: 12,
                          display: 'flex'
                        }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            background: '#E4EFFF',
                            borderRadius: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 2V6H2L8 12L14 6H10V2H6Z" fill="#113D7B"/>
                            </svg>
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            filename01222.pdf
                          </div>
                        </div>
                        <div style={{
                          width: 32,
                          height: 32,
                          background: '#F4F4F4',
                          borderRadius: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                          display: 'flex',
                          cursor: 'pointer'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6L8 10L4 6" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Recent Tax Return Document */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        color: '#B2B2B2',
                        fontSize: 16,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>
                        Recent tax return
                      </div>
                      <div style={{
                        alignSelf: 'stretch',
                        padding: 16,
                        background: '#F9F9F9',
                        borderRadius: 12,
                        border: '1px dashed #E5E7EB',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        display: 'flex'
                      }}>
                        <div style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: 12,
                          display: 'flex'
                        }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            background: '#E4EFFF',
                            borderRadius: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 2V6H2L8 12L14 6H10V2H6Z" fill="#113D7B"/>
                            </svg>
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            filename01222.pdf
                          </div>
                        </div>
                        <div style={{
                          width: 32,
                          height: 32,
                          background: '#F4F4F4',
                          borderRadius: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                          display: 'flex',
                          cursor: 'pointer'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6L8 10L4 6" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Appraisal Report Document */}
                    <div style={{
                      alignSelf: 'stretch',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 12,
                      display: 'flex'
                    }}>
                      <div style={{
                        color: '#B2B2B2',
                        fontSize: 16,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>
                        Appraisal Report
                      </div>
                      <div style={{
                        alignSelf: 'stretch',
                        padding: 16,
                        background: '#F9F9F9',
                        borderRadius: 12,
                        border: '1px dashed #E5E7EB',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        display: 'flex'
                      }}>
                        <div style={{
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: 12,
                          display: 'flex'
                        }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            background: '#E4EFFF',
                            borderRadius: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex'
                          }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 2V6H2L8 12L14 6H10V2H6Z" fill="#113D7B"/>
                            </svg>
                          </div>
                          <div style={{
                            color: 'black',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            wordWrap: 'break-word'
                          }}>
                            filename01222.pdf
                          </div>
                        </div>
                        <div style={{
                          width: 32,
                          height: 32,
                          background: '#F4F4F4',
                          borderRadius: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                          display: 'flex',
                          cursor: 'pointer'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6L8 10L4 6" stroke="#767676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Images Section */}
                  <div style={{
                    alignSelf: 'stretch',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 16,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: '#B2B2B2',
                      fontSize: 16,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word'
                    }}>
                      Property Images
                    </div>
                    <div style={{
                      alignSelf: 'stretch',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: 12
                    }}>
                      {Array.from({length: 7}, (_, index) => (
                        <div key={index} style={{
                          width: '100%',
                          height: 80,
                          background: '#F4F4F4',
                          borderRadius: 8,
                          border: '1px solid #E5E7EB',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}>
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #E4EFFF 0%, #F4F4F4 100%)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#B2B2B2"/>
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    alignSelf: 'stretch',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 16,
                    display: 'flex'
                  }}>
                    <button 
                      onClick={() => setShowEditModal(true)}
                      style={{
                        padding: '12px 24px',
                        background: 'white',
                        borderRadius: 12,
                        border: '1px solid #E5E7EB',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        color: 'black',
                        fontSize: 14,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>
                        Edit
                      </div>
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{
                        padding: '12px 24px',
                        background: '#CC4747',
                        borderRadius: 12,
                        border: 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 8,
                        display: 'flex',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        color: 'white',
                        fontSize: 14,
                        fontFamily: 'var(--ep-font-avenir)',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                      }}>
                        Abort pool request
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Recent Activity Section - Common to both tabs */}
            <div style={{
              width: '100%',
              padding: 32,
              background: 'white',
              borderRadius: 24,
              border: '1px solid #E5E7EB',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 24,
              display: 'flex',
              marginTop: 24
            }}>
              {/* Recent Activity Header */}
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
                  Recent activity
                </div>
                <div style={{
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 16,
                  display: 'flex'
                }}>
                  <div style={{
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 8,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: '#767676',
                      fontSize: 14,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word'
                    }}>
                      Filters
                    </div>
                    <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.88889 4H10.1111C10.2143 4 10.3132 4.04162 10.3861 4.11571C10.459 4.1898 10.5 4.29028 10.5 4.39506V5.02162C10.5 5.12638 10.459 5.22685 10.3861 5.30092L7.89172 7.83482C7.81879 7.90889 7.7778 8.00935 7.77778 8.11412V10.605C7.77778 10.665 7.7643 10.7243 7.73837 10.7782C7.71244 10.8322 7.67474 10.8794 7.62814 10.9164C7.58154 10.9533 7.52726 10.979 7.46942 10.9914C7.41159 11.0039 7.35173 11.0028 7.29439 10.9882L6.51661 10.7906C6.43252 10.7692 6.35787 10.7199 6.30453 10.6505C6.2512 10.581 6.22222 10.4955 6.22222 10.4074V8.11412C6.2222 8.00935 6.18121 7.90889 6.10828 7.83482L3.61394 5.30092C3.54101 5.22685 3.50002 5.12638 3.5 5.02162V4.39506C3.5 4.29028 3.54097 4.1898 3.6139 4.11571C3.68683 4.04162 3.78575 4 3.88889 4Z" stroke="#767676" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    display: 'flex',
                    cursor: 'pointer'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V12C2 12.7364 2.59695 13.3333 3.33333 13.3333H12.6667C13.403 13.3333 14 12.7364 14 12V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z" stroke="black" strokeWidth="1.5"/>
                      <path d="M2 5.33333H14" stroke="black" strokeWidth="1.5"/>
                      <path d="M5.33594 1.33333V4" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M10.6641 1.33333V4" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div style={{
                      color: 'black',
                      fontSize: 14,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word'
                    }}>
                      Date
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Item */}
              <div style={{
                alignSelf: 'stretch',
                padding: 20,
                background: '#F9F9F9',
                borderRadius: 16,
                justifyContent: 'space-between',
                alignItems: 'center',
                display: 'flex'
              }}>
                <div style={{
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 16,
                  display: 'flex'
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: '#E4EFFF',
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.25 6.875L8.125 15L3.75 10.625" stroke="#113D7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 4,
                    display: 'flex'
                  }}>
                    <div style={{
                      color: 'black',
                      fontSize: 16,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '500',
                      wordWrap: 'break-word'
                    }}>
                      Your pool was submitted successfully
                    </div>
                    <div style={{
                      maxWidth: 500,
                      color: '#767676',
                      fontSize: 14,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '400',
                      lineHeight: '20px',
                      wordWrap: 'break-word'
                    }}>
                      Our system is now reviewing your data for eligibility and compliance.<br/>
                      You&apos;ll be notified once it&apos;s ready to share with investors.
                    </div>
                  </div>
                </div>
                <div style={{
                  color: '#767676',
                  fontSize: 14,
                  fontFamily: 'var(--ep-font-avenir)',
                  fontWeight: '500',
                  wordWrap: 'break-word'
                }}>
                  12/05/2024
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
                        <input
                          type="email"
                          name="newsletter-email"
                          autoComplete="off"
                          placeholder="Enter your email address"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="w-full h-12 sm:h-10 px-4 sm:px-0 bg-gray-100 sm:bg-transparent border border-gray-200 sm:border-none rounded-xl sm:rounded-none text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
                          style={{
                            fontFamily: 'var(--ep-font-avenir)',
                            fontSize: '14px',
                            fontWeight: '400'
                          }}
                        />
                    </div>
                    <div 
                      className="w-full sm:w-auto px-4 py-3 sm:px-3 sm:py-2 bg-blue-900 rounded-xl border border-gray-200 flex justify-center items-center gap-2 cursor-pointer shadow-sm"
                      style={{
                        boxShadow: '0px 1px 0.5px 0.05000000074505806px rgba(29, 41, 61, 0.02)'
                      }}
                      onClick={() => {
                        if (newsletterEmail.trim()) {
                          alert('Successfully subscribed to newsletter!');
                          setNewsletterEmail('');
                        } else {
                          alert('Please enter a valid email address');
                        }
                      }}
                    >
                        <div className="text-white text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Submit</div>
                    </div>
                </div>
            </div>
        </div>
        <div className="w-full max-w-5xl text-gray-600 text-xs font-normal leading-relaxed" style={{fontFamily: 'var(--ep-font-avenir)'}}>Security & Legal Equipool is a private lending marketplace that connects individual borrowers and accredited investors through secured, property-backed loans. All identities are verified, and sensitive data is encrypted and stored securely in compliance with GDPR and other data privacy regulations. Equipool is not a licensed financial institution. We partner with third-party financial service providers to process payments and hold funds in escrow. All lending agreements are executed via legally binding contracts reviewed by independent legal partners. Investments made through Equipool are not insured by any government protection scheme. As with any private loan, the value of your investment can go up or down — you may lose part or all of your invested capital.  © 2025 Equipool. All rights reserved.</div>
      </div>

    {/* Edit Pool Modal */}
    {showEditModal && poolData && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 32,
          maxWidth: 600,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 24,
            fontFamily: 'var(--ep-font-avenir)',
            color: 'black'
          }}>
            Edit Pool Details
          </h2>

          {/* Error notice */}
          {saveError && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 14,
              fontFamily: 'var(--ep-font-avenir)'
            }}>
              {saveError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Pool Type */}
            <div style={{
              padding: 16,
              background: '#F9FAFB',
              borderRadius: 12,
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ color: 'black', fontSize: 14, fontWeight: 500, marginBottom: 12, fontFamily: 'var(--ep-font-avenir)' }}>Pool Type</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['equity','refinance'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setEditFields(f => ({ ...f, poolType: type }))}
                    style={{
                      padding: '8px 12px',
                      background: editFields.poolType === type ? '#113D7B' : '#F4F4F4',
                      color: editFields.poolType === type ? 'white' : 'black',
                      outline: '1px #E5E7EB solid',
                      border: 'none',
                      borderRadius: 12,
                      cursor: 'pointer',
                      fontFamily: 'var(--ep-font-avenir)',
                      fontSize: 14,
                      fontWeight: 500
                    }}
                  >
                    {type === 'equity' ? 'Equity Pool' : 'Refinance Pool'}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Information */}
            <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
              <div style={{ color: 'black', fontSize: 14, fontWeight: 500, marginBottom: 12, fontFamily: 'var(--ep-font-avenir)' }}>Property Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Address */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Address Line</label>
                  <input value={editFields.addressLine} onChange={(e) => setEditFields(f => ({...f, addressLine: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>City</label>
                  <input value={editFields.city} onChange={(e) => setEditFields(f => ({...f, city: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>State</label>
                  <input value={editFields.state} onChange={(e) => setEditFields(f => ({...f, state: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>ZIP Code</label>
                  <input value={editFields.zipCode} onChange={(e) => setEditFields(f => ({...f, zipCode: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Percent Owned (%)</label>
                  <input value={editFields.percentOwned} onChange={(e) => setEditFields(f => ({...f, percentOwned: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Co-owner</label>
                  <input value={editFields.coOwner} onChange={(e) => setEditFields(f => ({...f, coOwner: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Property Value ($)</label>
                  <input value={editFields.propertyValue} onChange={(e) => setEditFields(f => ({...f, propertyValue: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Property Link</label>
                  <input value={editFields.propertyLink} onChange={(e) => setEditFields(f => ({...f, propertyLink: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Mortgage Balance ($)</label>
                  <input value={editFields.mortgageBalance} onChange={(e) => setEditFields(f => ({...f, mortgageBalance: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
              </div>
            </div>

            {/* Pool Terms */}
            <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
              <div style={{ color: 'black', fontSize: 14, fontWeight: 500, marginBottom: 12, fontFamily: 'var(--ep-font-avenir)' }}>Pool Terms</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Amount Requested ($)</label>
                  <input value={editFields.amount} onChange={(e) => setEditFields(f => ({...f, amount: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Interest Rate (%)</label>
                  <input value={editFields.roiRate} onChange={(e) => setEditFields(f => ({...f, roiRate: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Term</label>
                  <select value={editFields.term} onChange={(e) => setEditFields(f => ({...f, term: e.target.value as TermOption}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }}>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {editFields.term === 'custom' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Custom Term (months)</label>
                    <input value={editFields.customTermMonths} onChange={(e) => setEditFields(f => ({...f, customTermMonths: e.target.value}))}
                      style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Liability & Credit Info */}
            <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
              <div style={{ color: 'black', fontSize: 14, fontWeight: 500, marginBottom: 12, fontFamily: 'var(--ep-font-avenir)' }}>Liability & Credit Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Other Property Loans ($)</label>
                  <input value={editFields.otherPropertyLoans} onChange={(e) => setEditFields(f => ({...f, otherPropertyLoans: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Credit Card Debt ($)</label>
                  <input value={editFields.creditCardDebt} onChange={(e) => setEditFields(f => ({...f, creditCardDebt: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ color: '#6B7280', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500 }}>Monthly Debt Payments ($)</label>
                  <input value={editFields.monthlyDebtPayments} onChange={(e) => setEditFields(f => ({...f, monthlyDebtPayments: e.target.value}))}
                    style={{ padding: 10, background: '#F4F4F4', outline: '1px #E5E7EB solid', border: 'none', borderRadius: 12, fontFamily: 'var(--ep-font-avenir)', fontSize: 14, color: 'black' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowEditModal(false)}
              disabled={isSavingEdit}
              style={{
                padding: '12px 24px',
                background: 'white',
                outline: '1px #E5E7EB solid',
                border: 'none',
                borderRadius: 12,
                cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--ep-font-avenir)',
                fontSize: 14,
                fontWeight: 500,
                color: 'black'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              style={{
                padding: '12px 24px',
                background: isSavingEdit ? '#9CA3AF' : '#113D7B',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--ep-font-avenir)',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              {isSavingEdit ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: '90%'
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 16,
            fontFamily: 'var(--ep-font-avenir)',
            color: '#DC2626'
          }}>
            Delete Pool
          </h2>
          
          <p style={{
            marginBottom: 24,
            color: '#6B7280',
            lineHeight: 1.5
          }}>
            Are you sure you want to delete this pool? This action cannot be undone.
          </p>
          
          {poolData && (
            <div style={{
              backgroundColor: '#F3F4F6',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14,
              color: '#374151'
            }}>
              <strong>Pool Status:</strong> {poolData.status}
            </div>
          )}

          {deleteError && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14
            }}>
              {deleteError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              style={{
                padding: '12px 24px',
                background: 'white',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                cursor: isDeleting ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePool}
              disabled={isDeleting}
              style={{
                padding: '12px 24px',
                background: isDeleting ? '#9CA3AF' : '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: isDeleting ? 'not-allowed' : 'pointer'
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Pool'}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
