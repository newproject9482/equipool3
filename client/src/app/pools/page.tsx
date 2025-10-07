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
  // const [userData, setUserData] = useState<{[key: string]: unknown} | null>(null); // Store authenticated user data
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPoolTypeModal, setShowPoolTypeModal] = useState(false);
  const [showCreatePoolModal, setShowCreatePoolModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Pool creation states
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPoolType, setSelectedPoolType] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Hover states
  const [equityHover, setEquityHover] = useState(false);
  const [refinanceHover, setRefinanceHover] = useState(false);
  
  // Review page toggle states
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true,
    propertyInfo: false,
    poolTerms: false,
    documentsPhotos: false,
    liabilities: false
  });
  
  const { toasts, removeToast, showSuccess, showError } = useToaster();





  // Personal info form state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Prior names state - now supporting multiple prior names
  const [priorNames, setPriorNames] = useState([{ firstName: '', middleName: '', lastName: '' }]);
  
  // SSN and FICO state
  const [ssn, setSsn] = useState('');
  const [ficoScore, setFicoScore] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Address form state
  const [propertyAddressLine1, setPropertyAddressLine1] = useState('');
  const [propertyAddressLine2, setPropertyAddressLine2] = useState('');
  const [propertyCity, setPropertyCity] = useState('');
  const [propertyZipCode, setPropertyZipCode] = useState('');
  const [sameAsMailingAddress, setSameAsMailingAddress] = useState(false); // Track if property address same as mailing
  const [primaryAddressChoice, setPrimaryAddressChoice] = useState(''); // Track primary address selection
  const [hasCoOwners, setHasCoOwners] = useState(false);
  const [coOwners, setCoOwners] = useState([{ firstName: '', middleName: '', lastName: '', percentage: '' }]);
  const [addressLine, setAddressLine] = useState('');

  // Calculate user's share based on co-owners' percentages
  const calculateUserShare = () => {
    if (!hasCoOwners) return '100';
    const totalCoOwnerShare = coOwners.reduce((sum, owner) => {
      const percentage = parseFloat(owner.percentage) || 0;
      return sum + percentage;
    }, 0);
    const userShare = Math.max(0, 100 - totalCoOwnerShare);
    return userShare.toString();
  };

  // Add new co-owner
  const addCoOwner = () => {
    setCoOwners([...coOwners, { firstName: '', middleName: '', lastName: '', percentage: '' }]);
  };

  // Remove co-owner
  const removeCoOwner = (index: number) => {
    if (coOwners.length > 1) {
      const newCoOwners = coOwners.filter((_, i) => i !== index);
      setCoOwners(newCoOwners);
    }
  };

  // Update co-owner data
  const updateCoOwner = (index: number, field: string, value: string) => {
    const newCoOwners = [...coOwners];
    newCoOwners[index] = { ...newCoOwners[index], [field]: value };
    setCoOwners(newCoOwners);
  };

  // Add new prior name
  const addPriorName = () => {
    setPriorNames([...priorNames, { firstName: '', middleName: '', lastName: '' }]);
  };

  // Remove prior name
  const removePriorName = (index: number) => {
    if (priorNames.length > 1) {
      const newPriorNames = priorNames.filter((_, i) => i !== index);
      setPriorNames(newPriorNames);
    }
  };

  // Update prior name data
  const updatePriorName = (index: number, field: string, value: string) => {
    const newPriorNames = [...priorNames];
    newPriorNames[index] = { ...newPriorNames[index], [field]: value };
    setPriorNames(newPriorNames);
  };

  // Add property link
  const addPropertyLink = () => {
    if (propertyLink.trim()) {
      setPropertyLinks([...propertyLinks, propertyLink.trim()]);
      setPropertyLink('');
    }
  };

  // Remove property link
  const removePropertyLink = (index: number) => {
    setPropertyLinks(propertyLinks.filter((_, i) => i !== index));
  };

  // Add existing loan
  const addExistingLoan = () => {
    setExistingLoans([...existingLoans, { loanAmount: '', remainingBalance: '' }]);
  };

  // Remove existing loan
  const removeExistingLoan = (index: number) => {
    if (existingLoans.length > 1) {
      setExistingLoans(existingLoans.filter((_, i) => i !== index));
    }
  };

  // Update existing loan
  const updateExistingLoan = (index: number, field: string, value: string) => {
    const newLoans = [...existingLoans];
    newLoans[index] = { ...newLoans[index], [field]: value };
    setExistingLoans(newLoans);
  };

  // Term selection functions
  const selectTerm = (months: string) => {
    setTermMonths(months);
    setIsCustomTerm(false);
    setCustomTermMonths('');
  };

  const handleCustomTermChange = (value: string) => {
    setCustomTermMonths(value);
    if (value.trim()) {
      setTermMonths(value);
      setIsCustomTerm(true);
    } else {
      setIsCustomTerm(false);
    }
  };

  // Calculator functions
  const calculateMonthlyInterest = () => {
    const amount = parseFloat(poolAmount) || 0;
    const roi = parseFloat(roiRate) || 0;
    if (amount === 0 || roi === 0) return '0';
    return ((amount * roi / 100) / 12).toFixed(2);
  };

  const calculateFinalRepayment = () => {
    const amount = parseFloat(poolAmount) || 0;
    const roi = parseFloat(roiRate) || 0;
    const term = parseFloat(isCustomTerm ? customTermMonths : termMonths) || 12;
    
    if (amount === 0 || roi === 0) return '0';
    
    if (loanType === 'interest-only') {
      // Interest-only: monthly interest payments + full principal at end
      const monthlyInterest = (amount * roi / 100) / 12;
      const totalInterest = monthlyInterest * term;
      return (amount + totalInterest).toFixed(2);
    } else if (loanType === 'maturity') {
      // Maturity: no payments during term, principal + full interest at end
      const totalInterest = (amount * roi / 100) * (term / 12);
      return (amount + totalInterest).toFixed(2);
    }
    
    return '0';
  };

  // Liability management functions
  const liabilityTypes = [
    'Credit Card Debt',
    'Personal Loan',
    'Auto Loan',
    'Student Loan',
    'Business Loan',
    'Line of Credit',
    'Other Debt'
  ];

  const addLiability = () => {
    setLiabilities([...liabilities, { type: '', amount: '', monthlyPayment: '', remainingBalance: '' }]);
  };

  const removeLiability = (index: number) => {
    if (liabilities.length > 1) {
      setLiabilities(liabilities.filter((_, i) => i !== index));
    }
  };

  const updateLiability = (index: number, field: string, value: string) => {
    const newLiabilities = [...liabilities];
    newLiabilities[index] = { ...newLiabilities[index], [field]: value };
    setLiabilities(newLiabilities);
  };

  const [state, setState] = useState('');
  // const [percentOwned, setPercentOwned] = useState('');
  // const [coOwner, setCoOwner] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [mortgageBalance, setMortgageBalance] = useState('');
  const [propertyLink, setPropertyLink] = useState('');
  // const [loanAmount, setLoanAmount] = useState('');
  // const [remainingBalance, setRemainingBalance] = useState('');
  const [propertyLinks, setPropertyLinks] = useState<string[]>([]);
  const [existingLoans, setExistingLoans] = useState([{ loanAmount: '', remainingBalance: '' }]);
  // const [interestRate, setInterestRate] = useState('');
  const [poolAmount, setPoolAmount] = useState('');
  const [roiRate, setRoiRate] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('12'); // Default to 12 months
  const [customTermMonths, setCustomTermMonths] = useState('');

  // Step 3 - Pool Terms state
  const [loanType, setLoanType] = useState(''); // 'interest-only' or 'maturity'
  const [termMonths, setTermMonths] = useState(''); // '6', '12', '24', or custom number
  const [isCustomTerm, setIsCustomTerm] = useState(false);
  
  // Step 5 - Liability & Credit Info state
  const [otherPropertyLoans, setOtherPropertyLoans] = useState('');
  const [creditCardDebt, setCreditCardDebt] = useState('');
  const [monthlyDebtPayments, setMonthlyDebtPayments] = useState('');
  const [liabilities, setLiabilities] = useState([
    { type: '', amount: '', monthlyPayment: '', remainingBalance: '' }
  ]);
  
  // Legacy state for backward compatibility
  // const [liabilityType, setLiabilityType] = useState('');
  // const [liabilityAmount, setLiabilityAmount] = useState('');
  // const [liabilityMonthlyPayment, setLiabilityMonthlyPayment] = useState('');
  // const [liabilityRemainingBalance, setLiabilityRemainingBalance] = useState('');

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
  }, [isAuthenticated, fetchPools]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to create pool
  const createPool = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Debug: Log all address-related values before creating poolData
      console.log('[DEBUG] Address values before poolData creation:');
      console.log('propertyAddressLine1:', propertyAddressLine1);
      console.log('addressLine:', addressLine);
      console.log('propertyCity:', propertyCity);
      console.log('city:', city);
      console.log('state:', state);
      console.log('sameAsMailingAddress:', sameAsMailingAddress);
      console.log('addressLine1:', addressLine1);
      
      const poolData = {
        // Pool information
        poolType: selectedPoolType,
        addressLine: propertyAddressLine1 || addressLine || '',
        city: propertyCity || city || '',
        state: state || 'California', // Default to California as shown in UI
        zipCode: propertyZipCode || zipCode || '',
        primaryAddressChoice: primaryAddressChoice,
        hasCoOwners: hasCoOwners,
        coOwners: coOwners,
        propertyValue: propertyValue ? parseFloat(propertyValue.replace(/[,$]/g, '')) : null,
        propertyLink: propertyLink || null,
        propertyLinks: propertyLinks,
        mortgageBalance: mortgageBalance ? parseFloat(mortgageBalance.replace(/[,$]/g, '')) : null,
        existingLoans: existingLoans.filter(loan => loan.loanAmount || loan.remainingBalance),
        loanAmount: existingLoans[0]?.loanAmount || '',
        remainingBalance: existingLoans[0]?.remainingBalance || '',
        
        // Step 3 - Pool Terms data
        amount: parseFloat(poolAmount.replace(/[,$]/g, '')) || 0,
        roiRate: parseFloat(roiRate) || 0,
        loanType: loanType,
        termMonths: isCustomTerm ? parseInt(customTermMonths, 10) : parseInt(termMonths, 10),
        isCustomTerm: isCustomTerm,
        
        // Legacy fields for compatibility
        term: selectedTerm,
        customTermMonths: selectedTerm === 'custom' ? (parseInt(customTermMonths, 10) || null) : null,
        otherPropertyLoans: otherPropertyLoans ? parseFloat(otherPropertyLoans.replace(/[,$]/g, '')) : null,
        creditCardDebt: creditCardDebt ? parseFloat(creditCardDebt.replace(/[,$]/g, '')) : null,
        monthlyDebtPayments: monthlyDebtPayments ? parseFloat(monthlyDebtPayments.replace(/[,$]/g, '')) : null,
        
        // Step 5 - Liabilities array
        liabilities: liabilities.filter(liability => liability.type || liability.amount || liability.monthlyPayment || liability.remainingBalance),
        
        // Personal information
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        email: email,
        phone: phoneNumber,
        dateOfBirth: dateOfBirth,
        
        // Prior names (optional)
        // priorFirstName: priorFirstName,
        // priorMiddleName: priorMiddleName,
        // priorLastName: priorLastName,
        
        // Financial information
        ssn: ssn,
        ficoScore: ficoScore ? parseInt(ficoScore) : null,
        
        // Mailing address
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        mailingCity: city, // Using the city from mailing address section
        mailingState: state, // Using the state from mailing address section
        mailingZipCode: zipCode // Using the zip from mailing address section
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const createPoolUrl = `${backendUrl}/api/pools/create`;
      
      console.log('[DEBUG] Creating pool with URL:', createPoolUrl);
      console.log('[DEBUG] Personal info validation:', {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        email: email?.trim(),
        phoneNumber: phoneNumber?.trim(),
        dateOfBirth: dateOfBirth?.trim(),
        ssn: ssn?.trim() ? '***' : 'missing' // Mask SSN for security
      });
      console.log('[DEBUG] Address field values check:', {
        propertyAddressLine1,
        addressLine,
        propertyCity,
        city,
        state,
        propertyZipCode,
        zipCode,
        finalValues: {
          addressLine: propertyAddressLine1 || addressLine || '',
          city: propertyCity || city || '',
          state: state || 'California',
          zipCode: propertyZipCode || zipCode || ''
        }
      });
      console.log('[DEBUG] Mailing address validation:', {
        addressLine1: addressLine1?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        zipCode: zipCode?.trim()
      });
      console.log('[DEBUG] Pool data being sent:', poolData);
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
        setPropertyAddressLine1('');
        setPropertyAddressLine2('');
        setPropertyCity('');
        setPropertyZipCode('');
        setPrimaryAddressChoice('');
        setHasCoOwners(false);
        setCoOwners([{ firstName: '', middleName: '', lastName: '', percentage: '' }]);
        // setPercentOwned('');
        // setCoOwner('');
        setPropertyValue('');
        setPropertyLink('');
        setPropertyLinks([]);
        setMortgageBalance('');
        setExistingLoans([{ loanAmount: '', remainingBalance: '' }]);
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
        console.error('[DEBUG] Pool creation failed:', result);
        const errorMsg = result.error || result.message || 'Failed to create pool. Please try again.';
        showError(`Pool creation failed: ${errorMsg}`);
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
            // setUserData(data); // Store user data
            
            // Auto-fill form fields with user data
            console.log('[DEBUG] User data for auto-fill:', data);
            
            // Handle borrower fields (separate name fields)
            if (data.role === 'borrower') {
              if (data.firstName) {
                setFirstName(data.firstName);
                console.log('[DEBUG] Set firstName:', data.firstName);
              }
              if (data.middleName) {
                setMiddleName(data.middleName);
                console.log('[DEBUG] Set middleName:', data.middleName);
              }
              if (data.lastName) {
                setLastName(data.lastName);
                console.log('[DEBUG] Set lastName:', data.lastName);
              }
              if (data.phone) {
                setPhoneNumber(data.phone);
                console.log('[DEBUG] Set phoneNumber:', data.phone);
              }
            }
            // Handle investor fields (fullName field)
            else if (data.role === 'investor' && data.fullName) {
              const nameParts = data.fullName.trim().split(' ');
              console.log('[DEBUG] Name parts:', nameParts);
              if (nameParts.length >= 2) {
                setFirstName(nameParts[0]);
                setLastName(nameParts[nameParts.length - 1]);
                console.log('[DEBUG] Set firstName:', nameParts[0], 'lastName:', nameParts[nameParts.length - 1]);
                if (nameParts.length > 2) {
                  const middleName = nameParts.slice(1, -1).join(' ');
                  setMiddleName(middleName);
                  console.log('[DEBUG] Set middleName:', middleName);
                }
              } else {
                setFirstName(data.fullName);
                console.log('[DEBUG] Set firstName only:', data.fullName);
              }
              if (data.phone) {
                setPhoneNumber(data.phone);
                console.log('[DEBUG] Set phoneNumber:', data.phone);
              }
            }
            
            if (data.email) {
              setEmail(data.email);
              console.log('[DEBUG] Set email:', data.email);
            }
            
            if (data.dateOfBirth) {
              setDateOfBirth(data.dateOfBirth);
              console.log('[DEBUG] Set dateOfBirth:', data.dateOfBirth);
            }
            
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

  const handleSameAsMailingAddress = () => {
    setSameAsMailingAddress(!sameAsMailingAddress);
    
    if (!sameAsMailingAddress) {
      // Copy mailing address to property address
      setPropertyAddressLine1(addressLine1);
      setPropertyAddressLine2(addressLine2);
      setPropertyCity(city);
      setPropertyZipCode(zipCode);
      // Also update the main address fields used for pool creation
      setAddressLine(addressLine1);
      setCity(city);
      setZipCode(zipCode);
    } else {
      // Clear property address fields when unchecking
      setPropertyAddressLine1('');
      setPropertyAddressLine2('');
      setPropertyCity('');
      setPropertyZipCode('');
      setAddressLine('');
      setCity('');
      setZipCode('');
    }
  };

  const handlePoolTypeSelect = (poolType: string) => {
    setSelectedPoolType(poolType);
    setShowPoolTypeModal(false);
    setShowCreatePoolModal(true);
    setCurrentStep(1); // Start with Personal Info
  };

  const handleCloseModal = () => {
    setShowCreatePoolModal(false);
    setShowPoolTypeModal(false);
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
          <div style={{alignSelf: 'stretch', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
            {/* Breadcrumb */}
            <div style={{alignSelf: 'stretch', paddingBottom: 16}}>
              <div>
                <span style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pools & Dashboard</span>
              </div>
            </div>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Overview</div>
            </div>
            <div style={{width: 1080, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'inline-flex'}}>
              <div style={{width: 350, height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
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
              <div style={{width: 350, height: 280, padding: 32, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
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
              <div style={{width: 350, height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
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
              style={{width: 1080, height: 138, paddingLeft: 40, paddingRight: 40, paddingTop: 24, paddingBottom: 24, background: '#E4EFFF', overflow: 'hidden', borderRadius: 24, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex', cursor: 'pointer'}}
              onClick={() => setShowPoolTypeModal(true)}
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
            <div style={{color: '#B2B2B2', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67}}>#{displayId}</div>
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

      {/* Pool Type Selection Modal */}
      {showPoolTypeModal && (
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
          onClick={() => setShowPoolTypeModal(false)}
        >
          <div 
            style={{
              width: 800,
              height: 500,
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
              padding: 32, 
              flexDirection: 'column', 
              justifyContent: 'flex-start', 
              alignItems: 'flex-start', 
              gap: 32, 
              display: 'flex'
            }}>
              {/* Header */}
              <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                  <div style={{color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1.2, wordWrap: 'break-word'}}>Choose the pool type</div>
                </div>
                <div
                  style={{width: 32, height: 32, position: 'relative', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  onClick={() => setShowPoolTypeModal(false)}
                >
                  <Image src="/material-symbols-close.svg" alt="Close" width={18} height={18} />
                </div>
              </div>
              
              {/* Pool Type Cards */}
              <div style={{alignSelf: 'stretch', flex: '1 1 0', justifyContent: 'center', alignItems: 'center', gap: 24, display: 'flex'}}>
                <div 
                  style={{
                    width: 277, 
                    height: 256, 
                    padding: 32, 
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
                    transform: equityHover ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: equityHover ? '0px 12px 24px rgba(17, 61, 123, 0.2)' : '0px 4px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={() => setEquityHover(true)}
                  onMouseLeave={() => setEquityHover(false)}
                  onClick={() => handlePoolTypeSelect('equity')}
                >
                  <div style={{width: 48, height: 48, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Image src="/mdi-house-edit.svg" alt="Equity Pool icon" width={40} height={40} />
                  </div>
                  <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                    <div style={{color: 'black', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Equity Pool</div>
                    <div style={{alignSelf: 'stretch', color: '#6B7280', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.5, wordWrap: 'break-word'}}>Borrowing against home value</div>
                    <div style={{alignSelf: 'stretch', color: '#6B7280', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.5, wordWrap: 'break-word'}}>(i) Equity pools are ideal when you want to tap into your home&apos;s value for cash.</div>
                  </div>
                </div>
                <div 
                  style={{
                    width: 277, 
                    height: 256, 
                    padding: 32, 
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
                    transform: refinanceHover ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: refinanceHover ? '0px 12px 24px rgba(17, 61, 123, 0.2)' : '0px 4px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={() => setRefinanceHover(true)}
                  onMouseLeave={() => setRefinanceHover(false)}
                  onClick={() => handlePoolTypeSelect('refinance')}
                >
                  <div style={{width: 48, height: 48, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Image src="/mdi-bank-plus.svg" alt="Refinance Pool icon" width={40} height={40} />
                  </div>
                  <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                    <div style={{color: 'black', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Refinance Pool</div>
                    <div style={{alignSelf: 'stretch', color: '#6B7280', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.5, wordWrap: 'break-word'}}>Pay off existing mortgage or debt</div>
                    <div style={{alignSelf: 'stretch', color: '#6B7280', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.5, wordWrap: 'break-word'}}>(i) Refinance pools help you replace high-interest loans with smarter terms.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              width: 750,
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
                /* Personal Info Form */
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
                    <div style={{width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Credentials</div>
                      </div>
                      <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Info is auto-filled from your sign-up details. Please double-check before proceeding.</div>
                      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', background: 'transparent', border: 'none', outline: 'none'}} />
                            </div>
                            <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                              <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', background: 'transparent', border: 'none', outline: 'none'}} />
                            </div>
                          </div>
                          <div data-righticon="false" data-state="default" style={{alignSelf: 'stretch', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', background: 'transparent', border: 'none', outline: 'none'}} />
                          </div>
                          <div data-righticon="true" data-state="dropdown closed" style={{alignSelf: 'stretch', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-US') : '11/09/2002'}</div>
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                              <Image src="/angle-down.svg" alt="Dropdown" width={16} height={16} />
                            </div>
                          </div>
                        </div>
                        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div data-righticon="false" data-state="default" style={{width: 325, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', background: 'transparent', border: 'none', outline: 'none'}} />
                          </div>
                          <div data-righticon="false" data-state="phoneNumber" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
                            <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex'}}>
                              <div style={{width: 22, height: 16, position: 'relative', overflow: 'hidden', borderRadius: 2}}>
                                <Image src="/flagpack-us.svg" alt="US Flag" width={22} height={16} />
                              </div>
                              <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <Image src="/angle-down.svg" alt="Dropdown" width={16} height={16} />
                              </div>
                            </div>
                            <div style={{width: 1, height: 20, background: 'var(--Stroke-Grey, #E5E7EB)'}}></div>
                            <div style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{phoneNumber || '944898988'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prior Names Section */}
                  <div style={{width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'inline-flex'}}>
                    <div style={{width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Prior name(s)</div>
                        <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                      </div>
                      
                      {/* Prior Names List */}
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'flex'}}>
                        {priorNames.map((priorName, index) => (
                          <div key={index} style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                              <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Prior Name {index + 1}</div>
                              <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                                <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                  <input 
                                    type="text" 
                                    value={priorName.firstName} 
                                    onChange={(e) => updatePriorName(index, 'firstName', e.target.value)} 
                                    placeholder="Name" 
                                    style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                                  />
                                </div>
                                <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                  <input 
                                    type="text" 
                                    value={priorName.middleName} 
                                    onChange={(e) => updatePriorName(index, 'middleName', e.target.value)} 
                                    placeholder="Middle name" 
                                    style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                                  />
                                </div>
                              </div>
                              <div data-righticon="false" data-state="default" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                                <input 
                                  type="text" 
                                  value={priorName.lastName} 
                                  onChange={(e) => updatePriorName(index, 'lastName', e.target.value)} 
                                  placeholder="Surname" 
                                  style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                                />
                              </div>
                            </div>
                            <div style={{flex: '0 0 auto', alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                              <div 
                                onClick={addPriorName}
                                data-icon="true" 
                                data-state="Alternative" 
                                style={{
                                  paddingLeft: 20, 
                                  paddingRight: 20, 
                                  paddingTop: 12, 
                                  paddingBottom: 12, 
                                  background: 'var(--White, white)', 
                                  borderRadius: 52, 
                                  outline: '1px var(--Stroke-Grey, #E5E7EB) solid', 
                                  justifyContent: 'center', 
                                  alignItems: 'center', 
                                  gap: 4, 
                                  display: 'inline-flex',
                                  cursor: 'pointer'
                                }}
                              >
                                <div style={{color: 'var(--Grey, #767676)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Add</div>
                                <Image src="/add.svg" alt="Add icon" width={16} height={16} />
                              </div>
                              {priorNames.length > 1 && (
                                <div 
                                  onClick={() => removePriorName(index)}
                                  style={{
                                    paddingLeft: 16, 
                                    paddingRight: 16, 
                                    paddingTop: 8, 
                                    paddingBottom: 8, 
                                    background: '#ff4444', 
                                    borderRadius: 26, 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    gap: 4, 
                                    display: 'inline-flex',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <div style={{color: 'white', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Remove</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SSN and FICO Score Section */}
                  <div style={{width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                    <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                      <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Social security number</div>
                      <div data-righticon="true" data-state="contextualized" style={{alignSelf: 'stretch', minHeight: 79, padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--White, white)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                          <input type="text" value={ssn} onChange={(e) => setSsn(e.target.value)} placeholder="SSN" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                        </div>
                        <div style={{alignSelf: 'stretch', paddingLeft: 8, paddingRight: 8, paddingTop: 4, paddingBottom: 4, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                          <div style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.4, wordWrap: 'break-word'}}>Used for identity and investor risk verification</div>
                        </div>
                      </div>
                    </div>
                    <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>FICO Score</div>
                        <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                      </div>
                      <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>%</div>
                        <input type="text" value={ficoScore} onChange={(e) => setFicoScore(e.target.value)} placeholder="e.g. 76" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                      </div>
                    </div>
                  </div>

                  {/* Mailing Address Section */}
                  <div style={{width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'inline-flex'}}>
                    <div style={{width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Mailing Address</div>
                      </div>
                      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                          <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                              <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Address Line 1" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                              </div>
                            </div>
                            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                              <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Address Line 2" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                              </div>
                            </div>
                          </div>
                          <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                              <div data-righticon="false" data-state="default" style={{flex: '1 1 0', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                              </div>
                              <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, outline: '1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                <div style={{flex: '1 1 0', color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>California</div>
                              </div>
                            </div>
                            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                              <div data-righticon="false" data-state="default" style={{flex: '1 1 0', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="Zip Code" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                              </div>
                              <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, outline: '1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                <div style={{flex: '1 1 0', color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>United States</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Continue Button */}
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', marginTop: 'auto'}}>
                    <div 
                      style={{
                        paddingLeft: 24, 
                        paddingRight: 24, 
                        paddingTop: 12, 
                        paddingBottom: 12, 
                        background: '#113D7B', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                        display: 'inline-flex',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentStep(2)}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Continue and save</div>
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
                  <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                      <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Address</div>
                    </div>
                    <div 
                      style={{
                        alignSelf: 'stretch', 
                        padding: 8, 
                        background: 'var(--White, white)', 
                        borderRadius: 8, 
                        outline: '1px var(--Stroke-Grey, #E5E7EB) solid', 
                        outlineOffset: '-1px', 
                        justifyContent: 'flex-start', 
                        alignItems: 'center', 
                        gap: 8, 
                        display: 'inline-flex',
                        cursor: 'pointer'
                      }}
                      onClick={handleSameAsMailingAddress}
                    >
                      <div style={{width: 20, height: 20, position: 'relative', overflow: 'hidden'}}>
                        <div style={{
                          width: 12.50, 
                          height: 12.50, 
                          left: 3.75, 
                          top: 3.75, 
                          position: 'absolute', 
                          background: sameAsMailingAddress ? '#113D7B' : 'transparent',
                          outline: `1px ${sameAsMailingAddress ? '#113D7B' : 'var(--Grey, #767676)'} solid`, 
                          outlineOffset: '-0.50px', 
                          borderRadius: '50%'
                        }} />
                      </div>
                      <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'inline-flex'}}>
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
                          <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Same as mailing address</div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Select this if your property address is the same as the mailing address you entered in Step 1.</div>
                      </div>
                    </div>
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                      <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                              <input 
                                type="text" 
                                value={propertyAddressLine1} 
                                onChange={(e) => {
                                  setPropertyAddressLine1(e.target.value);
                                  setAddressLine(e.target.value);
                                  if (sameAsMailingAddress) setSameAsMailingAddress(false);
                                }} 
                                placeholder="Address Line 1*" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                          </div>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                              <input 
                                type="text" 
                                value={propertyAddressLine2} 
                                onChange={(e) => {
                                  setPropertyAddressLine2(e.target.value);
                                  if (sameAsMailingAddress) setSameAsMailingAddress(false);
                                }} 
                                placeholder="Address Line 2" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                          </div>
                        </div>
                        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div data-righticon="false" data-state="default" style={{flex: '1 1 0', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                              <input 
                                type="text" 
                                value={propertyCity} 
                                onChange={(e) => {
                                  setPropertyCity(e.target.value);
                                  setCity(e.target.value);
                                  if (sameAsMailingAddress) setSameAsMailingAddress(false);
                                }} 
                                placeholder="City*" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                            <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, outline: '1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                              <div style={{flex: '1 1 0', color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>California</div>
                            </div>
                          </div>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div data-righticon="false" data-state="default" style={{flex: '1 1 0', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                              <input 
                                type="text" 
                                value={propertyZipCode} 
                                onChange={(e) => {
                                  setPropertyZipCode(e.target.value);
                                  setZipCode(e.target.value);
                                  if (sameAsMailingAddress) setSameAsMailingAddress(false);
                                }} 
                                placeholder="Zip Code*" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                            <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, outline: '1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                              <div style={{flex: '1 1 0', color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>United States</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Address Question */}
                  <div style={{width: '100%', height: '100%', borderRadius: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                        <div style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Is this your primary address?*</div>
                    </div>
                    <div style={{color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Tell us how the property is occupied. This helps us assess your loan profile accurately.</div>
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <div 
                          style={{
                            flex: '1 1 0', 
                            paddingLeft: 16, 
                            paddingRight: 16, 
                            paddingTop: 10, 
                            paddingBottom: 10, 
                            background: 'var(--Light-Grey, #F4F4F4)', 
                            borderRadius: 10, 
                            justifyContent: 'flex-start', 
                            alignItems: 'center', 
                            gap: 6, 
                            display: 'flex',
                            cursor: 'pointer'
                          }}
                          onClick={() => setPrimaryAddressChoice('primary')}
                        >
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <div style={{
                                  width: 10, 
                                  height: 10, 
                                  left: 3, 
                                  top: 3, 
                                  position: 'absolute', 
                                  background: primaryAddressChoice === 'primary' ? '#113D7B' : 'transparent',
                                  outline: `1px ${primaryAddressChoice === 'primary' ? '#113D7B' : 'var(--Black, black)'} solid`, 
                                  outlineOffset: '-0.50px',
                                  borderRadius: '50%'
                                }} />
                            </div>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>I live here as my primary residence</div>
                        </div>
                        <div 
                          style={{
                            flex: '1 1 0', 
                            paddingLeft: 16, 
                            paddingRight: 16, 
                            paddingTop: 10, 
                            paddingBottom: 10, 
                            background: 'var(--Light-Grey, #F4F4F4)', 
                            borderRadius: 10, 
                            justifyContent: 'flex-start', 
                            alignItems: 'center', 
                            gap: 6, 
                            display: 'flex',
                            cursor: 'pointer'
                          }}
                          onClick={() => setPrimaryAddressChoice('vacant')}
                        >
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <div style={{
                                  width: 10, 
                                  height: 10, 
                                  left: 3, 
                                  top: 3, 
                                  position: 'absolute', 
                                  background: primaryAddressChoice === 'vacant' ? '#113D7B' : 'transparent',
                                  outline: `1px ${primaryAddressChoice === 'vacant' ? '#113D7B' : 'var(--Black, black)'} solid`, 
                                  outlineOffset: '-0.50px',
                                  borderRadius: '50%'
                                }} />
                            </div>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>It&apos;s vacant</div>
                        </div>
                    </div>
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <div 
                          style={{
                            flex: '1 1 0', 
                            paddingLeft: 16, 
                            paddingRight: 16, 
                            paddingTop: 10, 
                            paddingBottom: 10, 
                            background: 'var(--Light-Grey, #F4F4F4)', 
                            borderRadius: 10, 
                            justifyContent: 'flex-start', 
                            alignItems: 'center', 
                            gap: 6, 
                            display: 'flex',
                            cursor: 'pointer'
                          }}
                          onClick={() => setPrimaryAddressChoice('tenant')}
                        >
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <div style={{
                                  width: 10, 
                                  height: 10, 
                                  left: 3, 
                                  top: 3, 
                                  position: 'absolute', 
                                  background: primaryAddressChoice === 'tenant' ? '#113D7B' : 'transparent',
                                  outline: `1px ${primaryAddressChoice === 'tenant' ? '#113D7B' : 'var(--Black, black)'} solid`, 
                                  outlineOffset: '-0.50px',
                                  borderRadius: '50%'
                                }} />
                            </div>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>It&apos;s tenant-occupied</div>
                        </div>
                        <div 
                          style={{
                            flex: '1 1 0', 
                            paddingLeft: 16, 
                            paddingRight: 16, 
                            paddingTop: 10, 
                            paddingBottom: 10, 
                            background: 'var(--Light-Grey, #F4F4F4)', 
                            borderRadius: 10, 
                            justifyContent: 'flex-start', 
                            alignItems: 'center', 
                            gap: 6, 
                            display: 'flex',
                            cursor: 'pointer'
                          }}
                          onClick={() => setPrimaryAddressChoice('owner-occupied')}
                        >
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <div style={{
                                  width: 10, 
                                  height: 10, 
                                  left: 3, 
                                  top: 3, 
                                  position: 'absolute', 
                                  background: primaryAddressChoice === 'owner-occupied' ? '#113D7B' : 'transparent',
                                  outline: `1px ${primaryAddressChoice === 'owner-occupied' ? '#113D7B' : 'var(--Black, black)'} solid`, 
                                  outlineOffset: '-0.50px',
                                  borderRadius: '50%'
                                }} />
                            </div>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>It&apos;s owner-occupied (not my primary home)</div>
                        </div>
                    </div>
                  </div>

                  {/* Co-Owner(s) Section */}
                  <div style={{width: '100%', height: '100%', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                    <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Co - Owner(s)</div>
                            <div 
                              style={{
                                padding: 2, 
                                background: 'var(--Stroke-Grey, #E5E7EB)', 
                                borderRadius: 30, 
                                justifyContent: 'flex-start', 
                                alignItems: 'center', 
                                gap: 2, 
                                display: 'flex',
                                cursor: 'pointer'
                              }}
                              onClick={() => setHasCoOwners(!hasCoOwners)}
                            >
                                <div style={{
                                  width: 18, 
                                  height: 18, 
                                  background: hasCoOwners ? '#113D7B' : 'transparent', 
                                  borderRadius: 9999,
                                  transition: 'all 0.2s ease'
                                }} />
                                <div style={{
                                  width: 18, 
                                  height: 18, 
                                  background: !hasCoOwners ? '#113D7B' : 'transparent', 
                                  borderRadius: 9999,
                                  transition: 'all 0.2s ease'
                                }} />
                            </div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>If you own less than 100% of the property, please list any co-owners.</div>
                    </div>
                    <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                            <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Your share</div>
                        </div>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                            <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--White, white)', borderRadius: 10, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>%</div>
                                <div style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{calculateUserShare()}</div>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Co-Owner Details (shown when toggle is on) */}
                  {hasCoOwners && (
                    <div style={{width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
                      {coOwners.map((coOwner, index) => (
                        <div key={index} style={{width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                              <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Co Owner {index + 1}</div>
                              <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                                  <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                      <input 
                                        type="text" 
                                        value={coOwner.firstName} 
                                        onChange={(e) => updateCoOwner(index, 'firstName', e.target.value)}
                                        placeholder="First name"
                                        style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}}
                                      />
                                  </div>
                                  <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                      <input 
                                        type="text" 
                                        value={coOwner.middleName} 
                                        onChange={(e) => updateCoOwner(index, 'middleName', e.target.value)}
                                        placeholder="Middle name"
                                        style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}}
                                      />
                                  </div>
                              </div>
                              <div data-righticon="false" data-state="default" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                                  <input 
                                    type="text" 
                                    value={coOwner.lastName} 
                                    onChange={(e) => updateCoOwner(index, 'lastName', e.target.value)}
                                    placeholder="Last name"
                                    style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}}
                                  />
                              </div>
                              <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                                  <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>%</div>
                                  <input 
                                    type="text" 
                                    value={coOwner.percentage} 
                                    onChange={(e) => updateCoOwner(index, 'percentage', e.target.value)}
                                    placeholder="Ownership %"
                                    style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}}
                                  />
                              </div>
                          </div>
                          <div style={{flex: '0 0 auto', alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                              <div 
                                onClick={addCoOwner}
                                data-icon="true" 
                                data-state="Alternative" 
                                style={{
                                  paddingLeft: 20, 
                                  paddingRight: 20, 
                                  paddingTop: 12, 
                                  paddingBottom: 12, 
                                  background: 'var(--White, white)', 
                                  borderRadius: 52, 
                                  outline: '1px var(--Stroke-Grey, #E5E7EB) solid', 
                                  justifyContent: 'center', 
                                  alignItems: 'center', 
                                  gap: 4, 
                                  display: 'inline-flex',
                                  cursor: 'pointer'
                                }}
                              >
                                  <div style={{color: 'var(--Grey, #767676)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Add</div>
                                  <Image src="/add.svg" alt="Add icon" width={16} height={16} />
                              </div>
                              {coOwners.length > 1 && (
                                <div 
                                  onClick={() => removeCoOwner(index)}
                                  style={{
                                    paddingLeft: 16, 
                                    paddingRight: 16, 
                                    paddingTop: 8, 
                                    paddingBottom: 8, 
                                    background: '#ff4444', 
                                    borderRadius: 26, 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    gap: 4, 
                                    display: 'inline-flex',
                                    cursor: 'pointer'
                                  }}
                                >
                                    <div style={{color: 'white', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Remove</div>
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Property Value and Link Section */}
                  <div style={{width: '100%', height: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'inline-flex'}}>
                    <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property value</div>
                            <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Provide your best estimate of the property&apos;s current <br/>market value. This helps us assess and underwrite your loan faster.</div>
                        <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                            <input type="text" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)} placeholder="e.g. 100 000" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                        </div>
                    </div>
                    <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property link</div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Add a listing link (e.g. Zillow, Redfin). If no valid link is provided, we may request an appraisal document in the next step.</div>
                        
                        {/* Added property links list */}
                        {propertyLinks.length > 0 && (
                          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                            {propertyLinks.map((link, index) => (
                              <div key={index} style={{alignSelf: 'stretch', padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 6, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                                <div style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', wordWrap: 'break-word'}}>{link}</div>
                                <div 
                                  onClick={() => removePropertyLink(index)}
                                  style={{width: 16, height: 16, background: '#ff4444', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                >
                                  <div style={{color: 'white', fontSize: 10, fontWeight: 'bold'}}>×</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                                <input type="text" value={propertyLink} onChange={(e) => setPropertyLink(e.target.value)} placeholder="e.g. Zillow, Redfin etc." style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                            </div>
                            <div 
                              onClick={addPropertyLink}
                              data-icon="true" 
                              data-state="Alternative" 
                              style={{
                                paddingLeft: 20, 
                                paddingRight: 20, 
                                paddingTop: 12, 
                                paddingBottom: 12, 
                                background: 'var(--White, white)', 
                                borderRadius: 52, 
                                outline: '1px var(--Stroke-Grey, #E5E7EB) solid', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                gap: 4, 
                                display: 'flex',
                                cursor: 'pointer'
                              }}
                            >
                                <div style={{color: 'var(--Grey, #767676)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Add</div>
                                <Image src="/add.svg" alt="Add icon" width={16} height={16} />
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Existing Loans Section */}
                  <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                    <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 2, display: 'inline-flex'}}>
                        <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Existing loans on this property </div>
                        <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                    </div>
                    <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Enter any active loans currently tied to this property. You can add multiple.</div>
                    
                    {existingLoans.map((loan, index) => (
                      <div key={index} style={{width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Loan {index + 1}</div>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                                <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                                    <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                                    <input 
                                      type="text" 
                                      value={loan.loanAmount} 
                                      onChange={(e) => updateExistingLoan(index, 'loanAmount', e.target.value)} 
                                      placeholder="Loan amount" 
                                      style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                                    />
                                </div>
                                <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                                    <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                                    <input 
                                      type="text" 
                                      value={loan.remainingBalance} 
                                      onChange={(e) => updateExistingLoan(index, 'remainingBalance', e.target.value)} 
                                      placeholder="Remaining Balance (approx.)" 
                                      style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                                    />
                                </div>
                            </div>
                            <div style={{flex: '0 0 auto', height: 86, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                                <div 
                                  onClick={addExistingLoan}
                                  data-icon="true" 
                                  data-state="Alternative" 
                                  style={{
                                    paddingLeft: 20, 
                                    paddingRight: 20, 
                                    paddingTop: 12, 
                                    paddingBottom: 12, 
                                    background: 'var(--White, white)', 
                                    borderRadius: 52, 
                                    outline: '1px var(--Stroke-Grey, #E5E7EB) solid', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    gap: 4, 
                                    display: 'inline-flex',
                                    cursor: 'pointer'
                                  }}
                                >
                                    <div style={{color: 'var(--Grey, #767676)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Add</div>
                                    <Image src="/add.svg" alt="Add icon" width={16} height={16} />
                                </div>
                                {existingLoans.length > 1 && (
                                  <div 
                                    onClick={() => removeExistingLoan(index)}
                                    style={{
                                      paddingLeft: 16, 
                                      paddingRight: 16, 
                                      paddingTop: 8, 
                                      paddingBottom: 8, 
                                      background: '#ff4444', 
                                      borderRadius: 26, 
                                      justifyContent: 'center', 
                                      alignItems: 'center', 
                                      gap: 4, 
                                      display: 'inline-flex',
                                      cursor: 'pointer'
                                    }}
                                  >
                                      <div style={{color: 'white', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Remove</div>
                                  </div>
                                )}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Continue Button */}
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', marginTop: 'auto'}}>
                    <div 
                      style={{
                        paddingLeft: 24, 
                        paddingRight: 24, 
                        paddingTop: 12, 
                        paddingBottom: 12, 
                        background: '#113D7B', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                        display: 'inline-flex',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentStep(3)}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Continue and save</div>
                    </div>
                  </div>
                </div>
              )}



              {currentStep === 3 && (
                /* Pool Terms Step - Clean slate for new design */
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
                  {/* Amount and Pool ROI Section */}
                  <div style={{width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                    <div style={{flex: '1 1 0', borderRadius: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                            <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Amount</div>
                            <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>How much capital are you requesting from investors?</div>
                        </div>
                        <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                            <input type="text" value={poolAmount} onChange={(e) => setPoolAmount(e.target.value)} placeholder="e.g. 350 000" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                        </div>
                    </div>
                    <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                        <div style={{flex: '1 1 0', borderRadius: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                                <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                                    <div style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pool ROI / Interest rate</div>
                                </div>
                                <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>What annual return are you offering investors?</div>
                            </div>
                            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                                <div style={{flex: '1 1 0', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                                    <input type="text" value={roiRate} onChange={(e) => setRoiRate(e.target.value)} placeholder="%" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                                </div>
                                <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 4, paddingBottom: 4, background: 'rgba(89.37, 59.38, 209.33, 0.16)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                                    <div style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Recommended: 6% – 12%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  {/* Loan Type Section */}
                  <div style={{width: '100%', borderRadius: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Loan Type</div>
                    </div>
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <div 
                          onClick={() => setLoanType('interest-only')}
                          style={{
                            flex: '1 1 0', 
                            paddingLeft: 16, 
                            paddingRight: 16, 
                            paddingTop: 10, 
                            paddingBottom: 10, 
                            background: 'var(--Light-Grey, #F4F4F4)', 
                            borderRadius: 10, 
                            justifyContent: 'flex-start', 
                            alignItems: 'center', 
                            gap: 6, 
                            display: 'flex',
                            cursor: 'pointer'
                          }}
                        >
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <div style={{
                                  width: 10, 
                                  height: 10, 
                                  left: 3, 
                                  top: 3, 
                                  position: 'absolute', 
                                  background: loanType === 'interest-only' ? '#113D7B' : 'transparent',
                                  outline: `1px ${loanType === 'interest-only' ? '#113D7B' : 'var(--Black, black)'} solid`, 
                                  outlineOffset: '-0.50px',
                                  borderRadius: '50%'
                                }} />
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Interest-Only</div>
                                <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Pay only interest each month. Full principal due at the end.</div>
                            </div>
                        </div>
                        <div 
                          onClick={() => setLoanType('maturity')}
                          style={{
                            flex: '1 1 0', 
                            paddingLeft: 16, 
                            paddingRight: 16, 
                            paddingTop: 10, 
                            paddingBottom: 10, 
                            background: 'var(--Light-Grey, #F4F4F4)', 
                            borderRadius: 10, 
                            justifyContent: 'flex-start', 
                            alignItems: 'center', 
                            gap: 6, 
                            display: 'flex',
                            cursor: 'pointer'
                          }}
                        >
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <div style={{
                                  width: 10, 
                                  height: 10, 
                                  left: 3, 
                                  top: 3, 
                                  position: 'absolute', 
                                  background: loanType === 'maturity' ? '#113D7B' : 'transparent',
                                  outline: `1px ${loanType === 'maturity' ? '#113D7B' : 'var(--Black, black)'} solid`, 
                                  outlineOffset: '-0.50px',
                                  borderRadius: '50%'
                                }} />
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Maturity</div>
                                <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>No payments during the term. You repay full principal + interest at the end.</div>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  {/* Term Section */}
                  <div style={{width: '100%', borderRadius: 8, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                        <div style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Term</div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>How long do you need to repay the loan?</div>
                    </div>
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <div 
                          onClick={() => selectTerm('6')}
                          style={{
                            paddingLeft: 12, 
                            paddingRight: 12, 
                            paddingTop: 10, 
                            paddingBottom: 10, 
                            background: 'var(--Light-Grey, #F4F4F4)', 
                            borderRadius: 10, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: 6, 
                            display: 'flex',
                            cursor: 'pointer'
                          }}
                        >
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <div style={{
                                  width: 10, 
                                  height: 10, 
                                  left: 3, 
                                  top: 3, 
                                  position: 'absolute', 
                                  background: termMonths === '6' && !isCustomTerm ? '#113D7B' : 'transparent',
                                  outline: `1px ${termMonths === '6' && !isCustomTerm ? '#113D7B' : 'var(--Black, black)'} solid`, 
                                  outlineOffset: '-0.50px',
                                  borderRadius: '50%'
                                }} />
                            </div>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>6 Months</div>
                        </div>
                        <div 
                          onClick={() => selectTerm('12')}
                          style={{
                            paddingLeft: 12, 
                            paddingRight: 12, 
                            paddingTop: 10, 
                            paddingBottom: 10, 
                            background: 'var(--Light-Grey, #F4F4F4)', 
                            borderRadius: 10, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: 6, 
                            display: 'flex',
                            cursor: 'pointer'
                          }}
                        >
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <div style={{
                                  width: 10, 
                                  height: 10, 
                                  left: 3, 
                                  top: 3, 
                                  position: 'absolute', 
                                  background: termMonths === '12' && !isCustomTerm ? '#113D7B' : 'transparent',
                                  outline: `1px ${termMonths === '12' && !isCustomTerm ? '#113D7B' : 'var(--Black, black)'} solid`, 
                                  outlineOffset: '-0.50px',
                                  borderRadius: '50%'
                                }} />
                            </div>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>12 Months</div>
                        </div>
                        <div 
                          onClick={() => selectTerm('24')}
                          style={{
                            paddingLeft: 12, 
                            paddingRight: 12, 
                            paddingTop: 10, 
                            paddingBottom: 10, 
                            background: 'var(--Light-Grey, #F4F4F4)', 
                            borderRadius: 10, 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            gap: 6, 
                            display: 'flex',
                            cursor: 'pointer'
                          }}
                        >
                            <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <div style={{
                                  width: 10, 
                                  height: 10, 
                                  left: 3, 
                                  top: 3, 
                                  position: 'absolute', 
                                  background: termMonths === '24' && !isCustomTerm ? '#113D7B' : 'transparent',
                                  outline: `1px ${termMonths === '24' && !isCustomTerm ? '#113D7B' : 'var(--Black, black)'} solid`, 
                                  outlineOffset: '-0.50px',
                                  borderRadius: '50%'
                                }} />
                            </div>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>24 Months</div>
                        </div>
                        <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>or</div>
                        <div style={{flex: '1 1 0', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                            <input 
                              type="text" 
                              value={customTermMonths} 
                              onChange={(e) => handleCustomTermChange(e.target.value)} 
                              placeholder="Custom" 
                              style={{
                                flex: '1 1 0', 
                                color: 'var(--Black, black)', 
                                fontSize: 14, 
                                fontFamily: 'var(--ep-font-avenir)', 
                                fontWeight: '500', 
                                background: 'transparent', 
                                border: 'none', 
                                outline: 'none'
                              }} 
                            />
                        </div>
                    </div>
                  </div>
                  
                  {/* Calculator Section */}
                  <div style={{width: '100%', padding: 16, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'inline-flex'}}>
                        <div style={{width: 14, height: 14, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Image src="/mdi-calculator.svg" alt="Calculator" width={14} height={14} />
                        </div>
                        <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Calculator</div>
                    </div>
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                        <div style={{flex: '1 1 0', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: '#EAEBE5', borderRadius: 10, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 6, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                                <div style={{flex: '1 1 0', opacity: 0.70, color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Monthly Interest</div>
                                <div data-icon="ic:tooltip" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <Image src="/cons.svg" alt="Info" width={16} height={16} />
                                </div>
                            </div>
                            <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>${calculateMonthlyInterest()}</div>
                        </div>
                        <div style={{flex: '1 1 0', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: '#EBE6E5', borderRadius: 10, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 6, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                                <div style={{flex: '1 1 0', opacity: 0.70, color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Final Repayment</div>
                                <div data-icon="ic:tooltip" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <Image src="/cons.svg" alt="Info" width={16} height={16} />
                                </div>
                            </div>
                            <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>${calculateFinalRepayment()}</div>
                        </div>
                    </div>
                  </div>
                  
                  {/* Continue Button */}
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', marginTop: 'auto'}}>
                    <div 
                      style={{
                        paddingLeft: 24, 
                        paddingRight: 24, 
                        paddingTop: 12, 
                        paddingBottom: 12, 
                        background: '#113D7B', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                        display: 'inline-flex',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentStep(4)}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Continue and save</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                /* Documents Step - Clean slate for new design */
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
                  {/* Documents Grid - 3 rows x 2 columns */}
                  <div style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: 'auto auto auto',
                    gap: 24,
                    alignItems: 'start'
                  }}>
                    {/* Top Left - Government-issued ID */}
                    <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Government-issued ID</div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Upload a valid government ID. Required for verification.</div>
                        <div data-property-1="Dropzone/File upload" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
                            <div data-icon="ic:file" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Image src="/4th_step_files.svg" alt="File" width={16} height={16} />
                            </div>
                            <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex'}}>
                                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Upload a file</div>
                                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Drag and drop or click to upload</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Right - Appraisal Report */}
                    <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Appraisal Report (PDF)</div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>This document validates the declared asset.</div>
                        <div data-property-1="Dropzone/File upload" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
                            <div data-icon="ic:file" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Image src="/4th_step_files.svg" alt="File" width={16} height={16} />
                            </div>
                            <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex'}}>
                                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Upload a file</div>
                                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Drag and drop or click to upload</div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Left - Home Insurance */}
                    <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Home Insurance (PDF)</div>
                            <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Boosts credibility and may reduce approval friction.</div>
                        <div data-property-1="Dropzone/File upload" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
                            <div data-icon="ic:file" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Image src="/4th_step_files.svg" alt="File" width={16} height={16} />
                            </div>
                            <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex'}}>
                                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Upload a file</div>
                                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Drag and drop or click to upload</div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Right - Recent Tax Return */}
                    <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Recent Tax Return (PDF)</div>
                            <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>To validate your financial profile and repayment capacity.</div>
                        <div data-property-1="Dropzone/File upload" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
                            <div data-icon="ic:image" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Image src="/image.svg" alt="Image" width={16} height={16} />
                            </div>
                            <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex'}}>
                                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Upload images</div>
                                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Drag and drop or click to upload</div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Left - Mortgage Statement */}
                    <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Mortgage Statement (PDF)</div>
                            <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Mortgage statement adds context to your liabilities.</div>
                        <div data-property-1="Dropzone/File upload" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
                            <div data-icon="ic:file" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Image src="/4th_step_files.svg" alt="File" width={16} height={16} />
                            </div>
                            <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex'}}>
                                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Upload a file</div>
                                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Drag and drop or click to upload</div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Right - Grant or Title Deed */}
                    <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Grant or Title Deed (PDF)</div>
                            <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                        </div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Shows legal ownership of the property. </div>
                        <div data-property-1="Dropzone/File upload" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
                            <div data-icon="ic:file" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Image src="/4th_step_files.svg" alt="File" width={16} height={16} />
                            </div>
                            <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex'}}>
                                <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Upload a file</div>
                                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Drag and drop or click to upload</div>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  {/* Property Photos Section - Full Width Below Grid */}
                  <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                          <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property Photos (JPG, PNG)</div>
                          <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                      </div>
                      <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Clear photos (2–10) of the property improve trust and funding chances.</div>
                      <div data-property-1="Dropzone/File upload" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
                          <div data-icon="ic:image" style={{width: 16, height: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                              <Image src="/image.svg" alt="Image" width={16} height={16} />
                          </div>
                          <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex'}}>
                              <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Upload images</div>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Drag and drop or click to upload</div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Continue Button */}
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', marginTop: 'auto'}}>
                    <div 
                      style={{
                        paddingLeft: 24, 
                        paddingRight: 24, 
                        paddingTop: 12, 
                        paddingBottom: 12, 
                        background: '#113D7B', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                        display: 'inline-flex',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentStep(5)}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Continue and save</div>
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
                    <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                      <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Other existing liabilities</div>
                      <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>(Optional)</div>
                    </div>
                    <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Give us a picture of your current financial obligations.</div>
                    
                    {/* Liabilities List */}
                    {liabilities.map((liability, index) => (
                      <div key={index} style={{width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Liability {index + 1}</div>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            {/* Liability Type Dropdown */}
                            <div style={{alignSelf: 'stretch', position: 'relative'}}>
                              <select 
                                value={liability.type} 
                                onChange={(e) => updateLiability(index, 'type', e.target.value)}
                                style={{
                                  width: '100%',
                                  height: 43, 
                                  paddingLeft: 16, 
                                  paddingRight: 16, 
                                  paddingTop: 12, 
                                  paddingBottom: 12, 
                                  background: 'var(--Light-Grey, #F4F4F4)', 
                                  borderRadius: 8, 
                                  border: 'none',
                                  outline: 'none',
                                  color: liability.type ? 'var(--Black, black)' : '#B2B2B2',
                                  fontSize: 14, 
                                  fontFamily: 'var(--ep-font-avenir)', 
                                  fontWeight: '500',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="" disabled>Select an option</option>
                                {liabilityTypes.map((type) => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Amount */}
                            <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                              <input 
                                type="text" 
                                value={liability.amount} 
                                onChange={(e) => updateLiability(index, 'amount', e.target.value)} 
                                placeholder="Amount" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                            
                            {/* Monthly Payment */}
                            <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                              <input 
                                type="text" 
                                value={liability.monthlyPayment} 
                                onChange={(e) => updateLiability(index, 'monthlyPayment', e.target.value)} 
                                placeholder="Monthly Payment" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                            
                            {/* Remaining Balance */}
                            <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                              <input 
                                type="text" 
                                value={liability.remainingBalance} 
                                onChange={(e) => updateLiability(index, 'remainingBalance', e.target.value)} 
                                placeholder="Remaining Balance (approx.)" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                          </div>
                          
                          {/* Add/Remove Buttons */}
                          <div style={{flex: '0 0 auto', alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div 
                              onClick={addLiability}
                              style={{
                                paddingLeft: 20, 
                                paddingRight: 20, 
                                paddingTop: 12, 
                                paddingBottom: 12, 
                                background: 'var(--White, white)', 
                                borderRadius: 52, 
                                outline: '1px var(--Stroke-Grey, #E5E7EB) solid', 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                gap: 4, 
                                display: 'inline-flex',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{color: 'var(--Grey, #767676)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Add</div>
                              <Image src="/add.svg" alt="Add icon" width={16} height={16} />
                            </div>
                            {liabilities.length > 1 && (
                              <div 
                                onClick={() => removeLiability(index)}
                                style={{
                                  paddingLeft: 16, 
                                  paddingRight: 16, 
                                  paddingTop: 8, 
                                  paddingBottom: 8, 
                                  background: '#ff4444', 
                                  borderRadius: 26, 
                                  justifyContent: 'center', 
                                  alignItems: 'center', 
                                  gap: 4, 
                                  display: 'inline-flex',
                                  cursor: 'pointer'
                                }}
                              >
                                <div style={{color: 'white', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Remove</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Continue Button */}
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', marginTop: 'auto'}}>
                    <div 
                      style={{
                        paddingLeft: 24, 
                        paddingRight: 24, 
                        paddingTop: 12, 
                        paddingBottom: 12, 
                        background: '#113D7B', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                        display: 'inline-flex',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentStep(6)}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Continue and save</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                /* Step 6 - Clean slate for new design */
                (() => {
                  // Calculate values for review section
                  const calculatedLTV = (() => {
                    const amount = parseFloat(poolAmount) || 0;
                    const propValue = parseFloat(propertyValue) || 0;
                    if (amount === 0 || propValue === 0) return 'N/A';
                    return ((amount / propValue) * 100).toFixed(1);
                  })();
                  
                  const calculatedRate = roiRate ? `${roiRate}` : 'N/A';
                  
                  const calculatedPayment = (() => {
                    const amount = parseFloat(poolAmount) || 0;
                    const roi = parseFloat(roiRate) || 0;
                    if (amount === 0 || roi === 0) return 'N/A';
                    
                    if (loanType === 'interest-only') {
                      return ((amount * roi / 100) / 12).toFixed(2);
                    } else if (loanType === 'maturity') {
                      return '0 (payment at maturity)';
                    }
                    return 'N/A';
                  })();
                  
                  return (
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
                        
                        {/* Review Header */}
                    <div style={{width: '100%', height: '100%', borderRadius: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 2, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Review Your Pool Details</div>
                        <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Take a final look before submitting your request. You can edit any section if needed.</div>
                      </div>
                    </div>

                    {/* Personal Info Section */}
                    <div style={{width: '100%', height: '100%', padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                        <div 
                          style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex', cursor: 'pointer'}}
                          onClick={() => setExpandedSections({...expandedSections, personalInfo: !expandedSections.personalInfo})}
                        >
                          <div style={{width: 16, height: 16, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 50, outline: '1px var(--Success, #248326) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>1</div>
                          </div>
                          <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Personal Info</div>
                          <div style={{transform: expandedSections.personalInfo ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>▼</div>
                        </div>
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
                          <div 
                            style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word', cursor: 'pointer'}}
                            onClick={() => setCurrentStep(1)}
                          >Edit</div>
                        </div>
                      </div>
                      {expandedSections.personalInfo && (
                        <>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Name</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{`${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Date of birth</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{dateOfBirth}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Email</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{email}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Phone</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{phoneNumber}</div>
                            </div>
                          </div>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Prior name</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{priorNames.length > 0 && priorNames[0].firstName ? `${priorNames[0].firstName} ${priorNames[0].middleName} ${priorNames[0].lastName}`.trim() : 'N/A'}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>SSN</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{ssn || 'N/A'}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Fico Score</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{ficoScore ? `${ficoScore}%` : 'N/A'}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Mailing Address</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{`${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}, ${state}, ${zipCode}`}</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Property Info Section */}
                    <div style={{width: '100%', height: '100%', padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                        <div 
                          style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex', cursor: 'pointer'}}
                          onClick={() => setExpandedSections({...expandedSections, propertyInfo: !expandedSections.propertyInfo})}
                        >
                          <div style={{width: 16, height: 16, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 50, outline: '1px var(--Success, #248326) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>2</div>
                          </div>
                          <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Property Info</div>
                          <div style={{transform: expandedSections.propertyInfo ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>▼</div>
                        </div>
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
                          <div 
                            style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word', cursor: 'pointer'}}
                            onClick={() => setCurrentStep(2)}
                          >Edit</div>
                        </div>
                      </div>
                      {expandedSections.propertyInfo && (
                        <>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property Address</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{`${propertyAddressLine1}${propertyAddressLine2 ? ', ' + propertyAddressLine2 : ''}, ${propertyCity}, ${propertyZipCode}`}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Primary Address</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{primaryAddressChoice === 'primary' ? 'Primary residence' : primaryAddressChoice === 'vacant' ? 'Vacant' : primaryAddressChoice === 'tenant' ? 'Tenant-occupied' : 'Owner-occupied'}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Ownership %</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{calculateUserShare()}%</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property Value</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>${propertyValue || 'N/A'}</div>
                            </div>
                          </div>
                          {existingLoans.length > 0 && (
                            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                              <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Existing Loans</div>
                                <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{existingLoans.length} loan(s) listed</div>
                              </div>
                              <div style={{flex: '3 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                                <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property Links</div>
                                <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{propertyLinks.length > 0 ? `${propertyLinks.length} link(s) provided` : 'No links provided'}</div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Pool Terms Section */}
                    <div style={{width: '100%', height: '100%', padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                        <div 
                          style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex', cursor: 'pointer'}}
                          onClick={() => setExpandedSections({...expandedSections, poolTerms: !expandedSections.poolTerms})}
                        >
                          <div style={{width: 16, height: 16, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 50, outline: '1px var(--Success, #248326) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>3</div>
                          </div>
                          <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Pool Terms</div>
                          <div style={{transform: expandedSections.poolTerms ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>▼</div>
                        </div>
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
                          <div 
                            style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word', cursor: 'pointer'}}
                            onClick={() => setCurrentStep(3)}
                          >Edit</div>
                        </div>
                      </div>
                      {expandedSections.poolTerms && (
                        <>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Loan Type</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{loanType === 'bridge' ? 'Bridge Loan' : loanType === 'rental' ? 'Rental DSCR' : loanType === 'fix-flip' ? 'Fix & Flip' : 'N/A'}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Term</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{termMonths ? `${termMonths} months` : 'N/A'}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Funding Amount</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>${poolAmount || 'N/A'}</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>LTV Ratio</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{calculatedLTV}%</div>
                            </div>
                          </div>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Interest Rate</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{calculatedRate}%</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Monthly Payment</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>${calculatedPayment}</div>
                            </div>
                            <div style={{flex: '2 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Renovation Cost</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{'N/A'}</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Photos & Documents Section */}
                    <div style={{width: '100%', height: '100%', padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                        <div 
                          style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex', cursor: 'pointer'}}
                          onClick={() => setExpandedSections({...expandedSections, documentsPhotos: !expandedSections.documentsPhotos})}
                        >
                          <div style={{width: 16, height: 16, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 50, outline: '1px var(--Success, #248326) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>4</div>
                          </div>
                          <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Photos & Documents</div>
                          <div style={{transform: expandedSections.documentsPhotos ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>▼</div>
                        </div>
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
                          <div 
                            style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word', cursor: 'pointer'}}
                            onClick={() => setCurrentStep(4)}
                          >Edit</div>
                        </div>
                      </div>
                      {expandedSections.documentsPhotos && (
                        <>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Government ID</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Not uploaded</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Appraisal Report</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Not uploaded</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Home Insurance</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Not uploaded</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Tax Return</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Not uploaded</div>
                            </div>
                          </div>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Mortgage Statement</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Not uploaded</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Title Deed</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Not uploaded</div>
                            </div>
                            <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Property Photos</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>0 photos</div>
                            </div>
                            <div style={{flex: '1 1 0'}}></div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Liabilities Section */}
                    <div style={{width: '100%', height: '100%', padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                        <div 
                          style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex', cursor: 'pointer'}}
                          onClick={() => setExpandedSections({...expandedSections, liabilities: !expandedSections.liabilities})}
                        >
                          <div style={{width: 16, height: 16, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 50, outline: '1px var(--Success, #248326) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                            <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>5</div>
                          </div>
                          <div style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Liabilities</div>
                          <div style={{transform: expandedSections.liabilities ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}}>▼</div>
                        </div>
                        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
                          <div 
                            style={{color: 'black', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word', cursor: 'pointer'}}
                            onClick={() => setCurrentStep(5)}
                          >Edit</div>
                        </div>
                      </div>
                      {expandedSections.liabilities && (
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                            <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Liabilities Listed</div>
                            <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{liabilities.length > 0 ? `${liabilities.length} liability(ies)` : 'No liabilities listed'}</div>
                          </div>
                          {liabilities.length > 0 && (
                            <div style={{flex: '3 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                              <div style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Details</div>
                              <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>
                                {liabilities.map((liability, index) => liability.type && (
                                  <div key={index} style={{marginBottom: '4px'}}>
                                    {liability.type}: ${liability.amount || '0'} (${liability.monthlyPayment || '0'}/month)
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                  
                  {/* Continue Button */}
                  <div style={{width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', marginTop: 'auto'}}>
                    <div 
                      style={{
                        paddingLeft: 24, 
                        paddingRight: 24, 
                        paddingTop: 12, 
                        paddingBottom: 12, 
                        background: isSubmitting ? '#888' : '#113D7B', 
                        borderRadius: 12, 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 8, 
                        display: 'inline-flex',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                      onClick={createPool}
                    >
                      <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>
                        {isSubmitting ? 'Submitting Pool Request...' : 'Submit Pool Request'}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })()
              )}
            </div>
          </div>
        </div>
      )}
      
      <Toaster toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
