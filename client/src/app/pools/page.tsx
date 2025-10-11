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
import Navbar from '../../components/Navbar';
 

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Pool creation states
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPoolType, setSelectedPoolType] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Hover states
  const [equityHover, setEquityHover] = useState(false);
  const [refinanceHover, setRefinanceHover] = useState(false);
  const [createPoolHover, setCreatePoolHover] = useState(false);
  
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
  
  // Date picker state (same as signup modal)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(17);
  const [selectedMonth, setSelectedMonth] = useState(5); // June = index 5
  const [selectedYear, setSelectedYear] = useState(1993);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [editingMonth, setEditingMonth] = useState(false);
  const [editingYear, setEditingYear] = useState(false);
  const [monthInput, setMonthInput] = useState('June');
  const [yearInput, setYearInput] = useState('1993');
  
  // Prior names state - now supporting multiple prior names
  const [priorNames, setPriorNames] = useState([{ firstName: '', middleName: '', lastName: '' }]);
  
  // SSN and FICO state
  const [ssn, setSsn] = useState('');
  const [ficoScore, setFicoScore] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Personal Info validation state
  const [personalInfoErrors, setPersonalInfoErrors] = useState<string[]>([]);
  const [showPersonalInfoErrors, setShowPersonalInfoErrors] = useState(false);
  type PersonalInfoField = 'firstName' | 'middleName' | 'lastName' | 'email' | 'phoneNumber' | 'dateOfBirth' | 'ssn' | 'ficoScore' | 'addressLine1' | 'city' | 'zipCode';
  const [personalInfoTouched, setPersonalInfoTouched] = useState<Partial<Record<PersonalInfoField, boolean>>>({});
  const [personalInfoSubmitAttempted, setPersonalInfoSubmitAttempted] = useState(false);

  // Property Info validation state
  const [propertyInfoErrors, setPropertyInfoErrors] = useState<string[]>([]);
  const [showPropertyInfoErrors, setShowPropertyInfoErrors] = useState(false);
  type PropertyInfoField = 'propertyAddressLine1' | 'propertyAddressLine2' | 'propertyCity' | 'propertyZipCode' | 'primaryAddressChoice' | 'propertyValue' | 'propertyLink' | 'coOwnerFirstName' | 'coOwnerLastName' | 'coOwnerPercentage' | 'existingLoanAmount' | 'existingLoanBalance';
  const [propertyInfoTouched, setPropertyInfoTouched] = useState<Partial<Record<PropertyInfoField, boolean>>>({});
  const [propertyInfoSubmitAttempted, setPropertyInfoSubmitAttempted] = useState(false);

  // Pool Terms validation state
  const [poolTermsErrors, setPoolTermsErrors] = useState<string[]>([]);
  const [showPoolTermsErrors, setShowPoolTermsErrors] = useState(false);
  type PoolTermsField = 'poolAmount' | 'roiRate' | 'loanType' | 'termMonths';
  const [poolTermsTouched, setPoolTermsTouched] = useState<Partial<Record<PoolTermsField, boolean>>>({});
  const [poolTermsSubmitAttempted, setPoolTermsSubmitAttempted] = useState(false);

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
    handlePoolTermsInputChange('termMonths', months);
  };

  const handleCustomTermChange = (value: string) => {
    setCustomTermMonths(value);
    if (value.trim()) {
      setTermMonths(value);
      setIsCustomTerm(true);
    } else {
      setIsCustomTerm(false);
    }
    handlePoolTermsInputChange('termMonths', value);
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

  // ---------- Personal Info Validation helpers ----------
  const isValidEmail = (email: string) => {
    if (!email) return false;
    // Simple RFC5322-like email check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Name part validator (single field like first/surname)
  const isValidNamePart = (s: string) => {
    if (!s) return false;
    return /^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]{1,255}$/.test(s.trim());
  };

  const isAdult18 = (isoDate: string) => {
    if (!isoDate) return false;
    const dob = new Date(isoDate + 'T00:00:00');
    if (isNaN(dob.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age >= 18;
  };

  // Normalize US phone digits (strip non-digits)
  const normalizePhone = (s: string) => (s || '').replace(/\D/g, '');
  const isValidUSPhone10 = (s: string) => normalizePhone(s).length === 10; // 10 digits required

  // City validator (letters, spaces, hyphens, apostrophes only - no numbers)
  const isValidCityName = (s: string) => {
    if (!s || s.trim().length === 0) return false;
    return /^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]{1,100}$/.test(s.trim());
  };

  // ZIP code validator (US format)
  const isValidZipCode = (s: string) => {
    if (!s) return false;
    return /^\d{5}(-\d{4})?$/.test(s.trim());
  };

  // SSN validator (basic format check)
  const isValidSSN = (s: string) => {
    if (!s) return false;
    const cleaned = s.replace(/\D/g, '');
    return cleaned.length === 9;
  };

  // FICO Score validator (300-850 range)
  const isValidFicoScore = (s: string) => {
    if (!s || s.trim() === '') return true; // Optional field
    const score = parseInt(s);
    return !isNaN(score) && score >= 300 && score <= 850;
  };

  // Date picker utilities
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const formatDate = (day: number, month: number, year: number) => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${monthStr}/${dayStr}/${year}`;
  };

  // Compute personal info validation errors per-field
  type PersonalInfoErrorMap = Partial<Record<PersonalInfoField, string[]>>;
  const computePersonalInfoErrorsByField = (): PersonalInfoErrorMap => {
    const errs: PersonalInfoErrorMap = {};
    // firstName
    if (!firstName || !isValidNamePart(firstName)) {
      errs.firstName = [!firstName ? 'First name is required' : 'First name contains invalid characters'];
    }
    // middleName (optional, but if provided must be valid)
    if (middleName && !isValidNamePart(middleName)) {
      errs.middleName = ['Middle name contains invalid characters'];
    }
    // lastName
    if (!lastName || !isValidNamePart(lastName)) {
      errs.lastName = [!lastName ? 'Last name is required' : 'Last name contains invalid characters'];
    }
    // email
    if (!isValidEmail(email)) {
      errs.email = ['Valid email required'];
    }
    // phone (US 10-digit required)
    if (!isValidUSPhone10(phoneNumber)) {
      errs.phoneNumber = ['Enter a valid 10-digit US phone number'];
    }
    // dateOfBirth
    if (!dateOfBirth) {
      errs.dateOfBirth = ['Date of birth is required'];
    } else if (!isAdult18(dateOfBirth)) {
      errs.dateOfBirth = ['You must be at least 18 years old'];
    }
    // ssn
    if (!ssn || !isValidSSN(ssn)) {
      errs.ssn = [!ssn ? 'SSN is required' : 'Enter a valid 9-digit SSN'];
    }
    // addressLine1
    if (!addressLine1 || addressLine1.trim().length === 0) {
      errs.addressLine1 = ['Address is required'];
    }
    // city
    if (!city || !isValidCityName(city)) {
      errs.city = [!city ? 'City is required' : 'City name can only contain letters, spaces, hyphens, and apostrophes'];
    }
    // zipCode
    if (!zipCode || !isValidZipCode(zipCode)) {
      errs.zipCode = [!zipCode ? 'ZIP code is required' : 'Enter a valid ZIP code (e.g., 12345 or 12345-6789)'];
    }
    // ficoScore (optional but must be valid if provided)
    if (!isValidFicoScore(ficoScore)) {
      errs.ficoScore = ['FICO score must be between 300 and 850'];
    }
    return errs;
  };

  const flattenPersonalInfoErrors = (map: PersonalInfoErrorMap, onlyFields?: PersonalInfoField[]) => {
    const entries = Object.entries(map) as [PersonalInfoField, string[]][];
    return entries
      .filter(([field]) => !onlyFields || onlyFields.includes(field))
      .flatMap(([, msgs]) => msgs || []);
  };

  // Personal Info field error checking for UI highlighting
  const personalInfoErrorsByField = computePersonalInfoErrorsByField();
  const personalInfoFieldHasError = (field: PersonalInfoField) => !!personalInfoErrorsByField[field] && (showPersonalInfoErrors || personalInfoTouched[field] || personalInfoSubmitAttempted);

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

  // Recompute personal info errors when relevant state changes,
  // but only after the user has interacted or submit attempt happened.
  useEffect(() => {
    const map = computePersonalInfoErrorsByField();
    if (showPersonalInfoErrors) {
      if (personalInfoSubmitAttempted) {
        // Show all errors after submit attempt
        setPersonalInfoErrors(flattenPersonalInfoErrors(map));
      } else {
        // Show only touched field errors while typing
        const touchedFields = (Object.keys(personalInfoTouched) as PersonalInfoField[]).filter(k => personalInfoTouched[k]);
        setPersonalInfoErrors(flattenPersonalInfoErrors(map, touchedFields));
      }
    } else {
      setPersonalInfoErrors([]);
    }
  }, [firstName, middleName, lastName, email, phoneNumber, dateOfBirth, ssn, ficoScore, addressLine1, city, zipCode, showPersonalInfoErrors, personalInfoTouched, personalInfoSubmitAttempted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Personal Info input change handlers with validation
  const handlePersonalInfoInputChange = (field: PersonalInfoField, value: string) => {
    // Update the state for the specific field
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'middleName':
        setMiddleName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        break;
      case 'dateOfBirth':
        setDateOfBirth(value);
        break;
      case 'ssn':
        setSsn(value);
        break;
      case 'ficoScore':
        setFicoScore(value);
        break;
      case 'addressLine1':
        setAddressLine1(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'zipCode':
        setZipCode(value);
        break;
    }
    
    // Mark field as touched and show error area after user starts typing
    setPersonalInfoTouched(prev => ({ ...prev, [field]: true }));
    setShowPersonalInfoErrors(true);
  };

  // Date picker event handlers
  const handleDateSelect = (day: number) => {
    setSelectedDate(day);
    const formattedDate = formatDate(day, selectedMonth, selectedYear);
    setDateOfBirth(formattedDate);
    handlePersonalInfoInputChange('dateOfBirth', formattedDate);
    setShowDatePicker(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setEditingMonth(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setEditingYear(false);
  };

  // ---------- Property Info Validation helpers ----------

  // Property Value validator (optional, but if filled must be valid number)
  const isValidPropertyValue = (s: string) => {
    if (!s || s.trim() === '') return true; // Optional field
    const cleaned = s.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    return !isNaN(num) && num > 0;
  };

  // Co-owner percentage validator (must be 1-100)
  const isValidCoOwnerPercentage = (s: string) => {
    if (!s || s.trim() === '') return false;
    const num = parseFloat(s);
    return !isNaN(num) && num > 0 && num <= 100;
  };

  // URL validator for property links
  const isValidPropertyLink = (s: string) => {
    if (!s || s.trim() === '') return true; // Optional field
    try {
      new URL(s);
      return true;
    } catch {
      return false;
    }
  };

  // Loan amount validator (must be positive number)
  const isValidLoanAmount = (s: string) => {
    if (!s || s.trim() === '') return false;
    const cleaned = s.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    return !isNaN(num) && num > 0;
  };

  // Compute property info validation errors per-field
  type PropertyInfoErrorMap = Partial<Record<PropertyInfoField, string[]>>;
  
  const computePropertyInfoErrorsByField = (): PropertyInfoErrorMap => {
    const errs: PropertyInfoErrorMap = {};

    // Required: Property Address Line 1
    if (!propertyAddressLine1 || propertyAddressLine1.trim().length === 0) {
      errs.propertyAddressLine1 = ['Property address is required'];
    }

    // Required: Property City (use same validation as personal info city)
    if (!propertyCity || !isValidCityName(propertyCity)) {
      errs.propertyCity = ['Valid city name is required (letters, spaces, hyphens, apostrophes only)'];
    }

    // Required: Property Zip Code
    if (!propertyZipCode || !isValidZipCode(propertyZipCode)) {
      errs.propertyZipCode = ['Valid zip code is required (format: 12345 or 12345-6789)'];
    }

    // Required: Primary Address Choice
    if (!primaryAddressChoice || primaryAddressChoice.trim().length === 0) {
      errs.primaryAddressChoice = ['Please select how the property is occupied'];
    }

    // Optional: Property Value validation
    if (propertyValue && !isValidPropertyValue(propertyValue)) {
      errs.propertyValue = ['Property value must be a valid positive number'];
    }

    // Optional: Property Link validation
    if (propertyLink && !isValidPropertyLink(propertyLink)) {
      errs.propertyLink = ['Property link must be a valid URL'];
    }

    // Co-owners validation (if enabled)
    if (hasCoOwners) {
      for (let i = 0; i < coOwners.length; i++) {
        const coOwner = coOwners[i];
        
        // Co-owner first name
        if (!coOwner.firstName || coOwner.firstName.trim().length === 0) {
          errs.coOwnerFirstName = [...(errs.coOwnerFirstName || []), `Co-owner ${i + 1} first name is required`];
        }

        // Co-owner last name  
        if (!coOwner.lastName || coOwner.lastName.trim().length === 0) {
          errs.coOwnerLastName = [...(errs.coOwnerLastName || []), `Co-owner ${i + 1} last name is required`];
        }

        // Co-owner percentage
        if (!coOwner.percentage || !isValidCoOwnerPercentage(coOwner.percentage)) {
          errs.coOwnerPercentage = [...(errs.coOwnerPercentage || []), `Co-owner ${i + 1} percentage must be between 1-100`];
        }
      }

      // Check that total percentages don't exceed 100%
      const totalCoOwnerPercentage = coOwners.reduce((sum, co) => {
        const pct = parseFloat(co.percentage || '0');
        return sum + (isNaN(pct) ? 0 : pct);
      }, 0);
      
      if (totalCoOwnerPercentage >= 100) {
        errs.coOwnerPercentage = [...(errs.coOwnerPercentage || []), 'Total co-owner percentages must be less than 100%'];
      }
    }

    // Existing loans validation (if any)
    for (let i = 0; i < existingLoans.length; i++) {
      const loan = existingLoans[i];
      
      if (loan.loanAmount && loan.loanAmount.trim().length > 0) {
        if (!isValidLoanAmount(loan.loanAmount)) {
          errs.existingLoanAmount = [...(errs.existingLoanAmount || []), `Loan ${i + 1} amount must be a valid positive number`];
        }
      }
      
      if (loan.remainingBalance && loan.remainingBalance.trim().length > 0) {
        if (!isValidLoanAmount(loan.remainingBalance)) {
          errs.existingLoanBalance = [...(errs.existingLoanBalance || []), `Loan ${i + 1} remaining balance must be a valid positive number`];
        }
      }
    }

    return errs;
  };

  const propertyInfoErrorsByField = computePropertyInfoErrorsByField();

  // Property Info field error checking for UI highlighting
  const propertyInfoFieldHasError = (field: PropertyInfoField) => !!propertyInfoErrorsByField[field] && (showPropertyInfoErrors || propertyInfoTouched[field] || propertyInfoSubmitAttempted);

  const flattenPropertyInfoErrors = (errorMap: PropertyInfoErrorMap, relevantFields: PropertyInfoField[]) => {
    return relevantFields.flatMap(field => errorMap[field] || []);
  };

  // Recompute property info errors when relevant state changes
  useEffect(() => {
    if (showPropertyInfoErrors || propertyInfoSubmitAttempted || Object.keys(propertyInfoTouched).length > 0) {
      const map = computePropertyInfoErrorsByField();
      if (Object.keys(map).length > 0) {
        const touchedFields = (Object.keys(propertyInfoTouched) as PropertyInfoField[]).filter(k => propertyInfoTouched[k]);
        setPropertyInfoErrors(flattenPropertyInfoErrors(map, touchedFields));
      }
    } else {
      setPropertyInfoErrors([]);
    }
  }, [propertyAddressLine1, propertyAddressLine2, propertyCity, propertyZipCode, primaryAddressChoice, propertyValue, propertyLink, hasCoOwners, coOwners, existingLoans, showPropertyInfoErrors, propertyInfoTouched, propertyInfoSubmitAttempted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Property Info input change handlers with validation
  const handlePropertyInfoInputChange = (field: PropertyInfoField, value: string) => {
    // Update the state for the specific field
    switch (field) {
      case 'propertyAddressLine1':
        setPropertyAddressLine1(value);
        setAddressLine(value);
        if (sameAsMailingAddress) setSameAsMailingAddress(false);
        break;
      case 'propertyAddressLine2':
        setPropertyAddressLine2(value);
        if (sameAsMailingAddress) setSameAsMailingAddress(false);
        break;
      case 'propertyCity':
        setPropertyCity(value);
        setCity(value);
        if (sameAsMailingAddress) setSameAsMailingAddress(false);
        break;
      case 'propertyZipCode':
        setPropertyZipCode(value);
        setZipCode(value);
        if (sameAsMailingAddress) setSameAsMailingAddress(false);
        break;
      case 'propertyValue':
        setPropertyValue(value);
        break;
      case 'propertyLink':
        setPropertyLink(value);
        break;
    }
    
    // Mark field as touched and show error area after user starts typing
    setPropertyInfoTouched(prev => ({ ...prev, [field]: true }));
    setShowPropertyInfoErrors(true);
  };

  // Pool Terms validation functions
  const isValidPoolAmount = (amount: string): boolean => {
    if (!amount.trim()) return false;
    const numericAmount = parseFloat(amount.replace(/[,$\s]/g, ''));
    return !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= 10000000; // Max $10M
  };

  const isValidRoiRate = (rate: string): boolean => {
    if (!rate.trim()) return false;
    const numericRate = parseFloat(rate.replace(/[%\s]/g, ''));
    return !isNaN(numericRate) && numericRate > 0 && numericRate <= 100; // Max 100%
  };

  const isValidTerm = (term: string): boolean => {
    if (!term.trim()) return false;
    const numericTerm = parseFloat(term);
    return !isNaN(numericTerm) && numericTerm > 0 && numericTerm <= 360; // Max 30 years
  };

  type PoolTermsErrorMap = Partial<Record<PoolTermsField, string[]>>;
  const computePoolTermsErrorsByField = (): PoolTermsErrorMap => {
    const errs: PoolTermsErrorMap = {};

    // Pool Amount validation
    if (!poolAmount.trim()) {
      errs.poolAmount = ['Pool amount is required'];
    } else if (!isValidPoolAmount(poolAmount)) {
      errs.poolAmount = ['Please enter a valid amount (between $1 and $10,000,000)'];
    }

    // ROI Rate validation
    if (!roiRate.trim()) {
      errs.roiRate = ['ROI rate is required'];
    } else if (!isValidRoiRate(roiRate)) {
      errs.roiRate = ['Please enter a valid percentage (between 0.1% and 100%)'];
    }

    // Loan Type validation
    if (!loanType) {
      errs.loanType = ['Please select a loan type'];
    }

    // Term validation
    const currentTerm = isCustomTerm ? customTermMonths : termMonths;
    if (!currentTerm || currentTerm === '') {
      errs.termMonths = ['Please select or enter a term length'];
    } else if (isCustomTerm && !isValidTerm(customTermMonths)) {
      errs.termMonths = ['Please enter a valid term (between 1 and 360 months)'];
    }

    return errs;
  };

  const flattenPoolTermsErrors = (map: PoolTermsErrorMap, onlyFields?: PoolTermsField[]) => {
    const fields = onlyFields || Object.keys(map) as PoolTermsField[];
    return fields.flatMap(field => map[field] || []);
  };

  const poolTermsErrorsByField = computePoolTermsErrorsByField();
  const poolTermsFieldHasError = (field: PoolTermsField) => !!poolTermsErrorsByField[field] && (showPoolTermsErrors || poolTermsTouched[field] || poolTermsSubmitAttempted);

  // Update pool terms errors when inputs change
  useEffect(() => {
    const map = computePoolTermsErrorsByField();
    if (showPoolTermsErrors) {
      const touchedFields = Object.keys(poolTermsTouched).filter(field => poolTermsTouched[field as PoolTermsField]) as PoolTermsField[];
      if (touchedFields.length > 0) {
        setPoolTermsErrors(flattenPoolTermsErrors(map, touchedFields));
      } else {
        setPoolTermsErrors(flattenPoolTermsErrors(map));
      }
    } else {
      setPoolTermsErrors([]);
    }
  }, [poolAmount, roiRate, loanType, termMonths, customTermMonths, isCustomTerm, showPoolTermsErrors, poolTermsTouched, poolTermsSubmitAttempted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pool Terms input change handlers with validation
  const handlePoolTermsInputChange = (field: PoolTermsField, value: string) => {
    // Update the state for the specific field
    switch (field) {
      case 'poolAmount':
        setPoolAmount(value);
        break;
      case 'roiRate':
        setRoiRate(value);
        break;
      case 'loanType':
        setLoanType(value);
        break;
      case 'termMonths':
        if (isCustomTerm) {
          setCustomTermMonths(value);
        } else {
          setTermMonths(value);
        }
        break;
    }
    
    // Mark field as touched and show error area after user starts typing
    setPoolTermsTouched(prev => ({ ...prev, [field]: true }));
    setShowPoolTermsErrors(true);
  };

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
      <Navbar 
        variant="fixed"
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onLoginClick={() => setShowLoginModal(true)}
        onSignupClick={() => window.location.href = '/'}
        showProfileMenu={showProfileMenu}
        onProfileMenuToggle={setShowProfileMenu}
        showMobileMenu={showMobileMenu}
        onMobileMenuToggle={setShowMobileMenu}
      />

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="w-full pt-8 sm:pt-16 lg:pt-24 flex flex-col justify-start items-start">
          <div className="w-full flex flex-col justify-start items-start gap-4 lg:gap-6">
            {/* Breadcrumb */}
            <div className="w-full pb-4">
              <div>
                <span style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pools & Dashboard</span>
              </div>
            </div>
            <div className="w-full flex justify-start items-center gap-2 lg:gap-4">
              <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Overview</div>
            </div>
            
            {/* Overview Cards - Responsive Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {/* Total Borrowed Card */}
              <div className="w-full p-6 lg:p-8 bg-gray-50 overflow-hidden rounded-3xl flex flex-col justify-between items-center min-h-[220px] lg:min-h-[280px]">
                <div className="w-full flex flex-col justify-end items-center gap-2">
                  <div className="text-center text-black text-lg lg:text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Total Borrowed</div>
                </div>
                <div className="w-full flex flex-col justify-end items-center gap-2">
                  <div className="text-center text-black text-3xl lg:text-5xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    {summaryStats.totalBorrowed}
                  </div>
                </div>
                <div className="w-full flex flex-col justify-end items-center gap-2">
                  <div className="text-center text-black text-xs lg:text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>(i) Total amount you&apos;ve received across all funded pools.</div>
                </div>
              </div>
              
              {/* Next Payment Card */}
              <div className="w-full p-6 lg:p-8 bg-gray-50 overflow-hidden rounded-3xl flex flex-col justify-between items-center min-h-[220px] lg:min-h-[280px]">
                <div className="w-full flex flex-col justify-end items-center gap-2">
                  <div className="text-center text-black text-lg lg:text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Next Payment</div>
                </div>
                <div className="w-full flex-1 flex flex-col justify-center items-center">
                  <div className="text-center text-black text-lg lg:text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    {summaryStats.nextPaymentDate}
                  </div>
                  <div className="text-center text-black text-3xl lg:text-5xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    {summaryStats.nextPaymentAmount}
                  </div>
                </div>
                <div className="w-full flex flex-col justify-end items-center gap-2">
                  <div className="text-center text-black text-xs lg:text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>(i) Your upcoming repayment amount and due date.</div>
                </div>
              </div>
              
              {/* Active Pools Card */}
              <div className="w-full p-6 lg:p-8 bg-gray-50 overflow-hidden rounded-3xl flex flex-col justify-between items-center min-h-[220px] lg:min-h-[280px] sm:col-span-2 lg:col-span-1">
                <div className="w-full flex flex-col justify-end items-center gap-2">
                  <div className="text-center text-black text-lg lg:text-2xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>Active pools</div>
                </div>
                <div className="w-full flex flex-col justify-end items-center">
                  <div className="text-center text-black text-3xl lg:text-5xl font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
                    {summaryStats.activePools}
                  </div>
                </div>
                <div className="w-full flex flex-col justify-end items-center gap-2">
                  <div className="text-center text-black text-xs lg:text-sm font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>(i) Number of currently running loans.</div>
                </div>
              </div>
            </div>
            
            {/* Create Pool Button - Responsive */}
            <div 
              className="w-full overflow-hidden rounded-3xl cursor-pointer min-h-[120px] lg:min-h-[138px] transition-all duration-300"
              style={{
                width: '100%',
                height: '100%',
                paddingLeft: createPoolHover ? 40 : 24,
                paddingRight: createPoolHover ? 40 : 24,
                paddingTop: 24,
                paddingBottom: 24,
                background: createPoolHover ? '#BFCDE1' : '#EBF4FF',
                overflow: 'hidden',
                borderRadius: createPoolHover ? 54 : 24,
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: createPoolHover ? 8 : 16,
                display: 'inline-flex'
              }}
              onClick={() => setShowPoolTypeModal(true)}
              onMouseEnter={() => setCreatePoolHover(true)}
              onMouseLeave={() => setCreatePoolHover(false)}
            >
              <div className="flex-1 flex flex-col justify-start items-start lg:items-start gap-2">
                <div className="flex flex-col justify-end items-start gap-2">
                  <div 
                    className="text-black font-medium text-center lg:text-left w-full transition-all duration-300" 
                    style={{
                      fontFamily: 'var(--ep-font-avenir)',
                      fontSize: createPoolHover ? 32 : 32,
                      fontWeight: '500'
                    }}
                  >
                    Create a pool
                  </div>
                </div>
                <div className="w-full flex flex-col justify-end items-start gap-2">
                  <div 
                    className="text-black font-medium text-center lg:text-left transition-all duration-300" 
                    style={{
                      fontFamily: 'var(--ep-font-avenir)',
                      fontSize: 14,
                      fontWeight: '500'
                    }}
                  >
                    Start a new funding request backed by your property.<br/>Define your loan amount, term, and target return — we&apos;ll guide you from there.
                  </div>
                </div>
              </div>
              <div 
                className="overflow-hidden flex justify-center items-center flex-shrink-0 transition-all duration-300"
                style={{
                  width: createPoolHover ? 40 : 40,
                  height: createPoolHover ? 40 : 40,
                  background: 'white',
                  borderRadius: createPoolHover ? 40 : 20
                }}
              >
                <Image src="/add_pool.svg" alt="Add Pool" width={26} height={26} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* All Pools Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 mt-12 lg:mt-20">
        <div className="w-full flex justify-start items-center gap-3 mb-6">
          <div className="flex-1 flex justify-start items-center">
            <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>All Pools</div>
          </div>
        </div>
        
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Loading state */}
          {loadingPools && (
            <div className="col-span-full flex justify-center items-center py-10 text-gray-500 text-base font-medium" style={{fontFamily: 'var(--ep-font-avenir)'}}>
              Loading pools...
            </div>
          )}

          {/* No pools state */}
          {!loadingPools && realPools.length === 0 && (
            <div className="col-span-full flex flex-col justify-center items-center py-10 gap-4">
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
              <div 
                key={pool.id} 
                className="w-full max-w-[350px] mx-auto p-6 lg:p-8 pb-14 relative bg-white rounded-3xl border border-gray-200 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-lg"
                style={{minHeight: '355px'}}
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
                              name="newsletter-email"
                              autoComplete="off"
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
              width: 'calc(100vw - 720px)',
              height: 'calc(100vh - 384px)',
              minWidth: 800,
              minHeight: 600,
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
              gap: 130, 
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
              <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 24, display: 'flex', marginBottom: 130}}>
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
                            <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex', outline: personalInfoFieldHasError('firstName') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('firstName') ? '-1px' : undefined}}>
                              <input type="text" value={firstName} onChange={(e) => handlePersonalInfoInputChange('firstName', e.target.value)} placeholder="First name" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', background: 'transparent', border: 'none', outline: 'none'}} />
                            </div>
                            <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex', outline: personalInfoFieldHasError('middleName') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('middleName') ? '-1px' : undefined}}>
                              <input type="text" value={middleName} onChange={(e) => handlePersonalInfoInputChange('middleName', e.target.value)} placeholder="Middle name" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', background: 'transparent', border: 'none', outline: 'none'}} />
                            </div>
                          </div>
                          <div data-righticon="false" data-state="default" style={{alignSelf: 'stretch', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex', outline: personalInfoFieldHasError('lastName') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('lastName') ? '-1px' : undefined}}>
                            <input type="text" value={lastName} onChange={(e) => handlePersonalInfoInputChange('lastName', e.target.value)} placeholder="Last name" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', background: 'transparent', border: 'none', outline: 'none'}} />
                          </div>
                          <div style={{width: '100%', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'inline-flex', position: 'relative', outline: personalInfoFieldHasError('dateOfBirth') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('dateOfBirth') ? '-1px' : undefined}}>
                            <div 
                              onClick={() => setShowDatePicker(!showDatePicker)}
                              style={{
                                flex: '1 1 0', 
                                color: dateOfBirth ? 'black' : '#B2B2B2', 
                                fontSize: 14, 
                                fontFamily: 'var(--ep-font-avenir)', 
                                fontWeight: '500', 
                                wordWrap: 'break-word',
                                cursor: 'pointer'
                              }}
                            >
                              {dateOfBirth ? `${months[selectedMonth]} ${selectedDate}, ${selectedYear}` : 'Date of Birth'}
                            </div>
                            
                            {showDatePicker && (
                              <div 
                                style={{
                                  width: 288, 
                                  padding: 20, 
                                  left: 35, 
                                  top: 47, 
                                  position: 'absolute', 
                                  background: 'white', 
                                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05)', 
                                  overflow: 'hidden', 
                                  borderRadius: 12, 
                                  outline: '1px #E5E7EB solid', 
                                  outlineOffset: '-1px', 
                                  flexDirection: 'column', 
                                  justifyContent: 'flex-start', 
                                  alignItems: 'center', 
                                  gap: 16, 
                                  display: 'inline-flex',
                                  zIndex: 1000
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div style={{alignSelf: 'stretch', overflow: 'hidden', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                                  <button 
                                    onClick={() => {
                                      const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
                                      const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
                                      setSelectedMonth(newMonth);
                                      setSelectedYear(newYear);
                                    }}
                                    style={{width: 24, height: 24, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                  >
                                    <Image src="/weui-arrow-filled-left.svg" alt="Previous month" width={24} height={24} />
                                  </button>
                                  <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex', position: 'relative'}}>
                                    <div style={{position: 'relative'}}>
                                      {editingMonth ? (
                                        <input
                                          type="text"
                                          value={monthInput}
                                          onChange={(e) => setMonthInput(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              const monthIndex = months.indexOf(monthInput);
                                              if (monthIndex !== -1) {
                                                setSelectedMonth(monthIndex);
                                              }
                                              setEditingMonth(false);
                                            }
                                            if (e.key === 'Escape') {
                                              setEditingMonth(false);
                                            }
                                          }}
                                          onBlur={() => {
                                            const monthIndex = months.indexOf(monthInput);
                                            if (monthIndex !== -1) {
                                              setSelectedMonth(monthIndex);
                                            }
                                            setEditingMonth(false);
                                          }}
                                          autoFocus
                                          style={{
                                            paddingLeft: 8, 
                                            paddingRight: 8, 
                                            paddingTop: 6, 
                                            paddingBottom: 6, 
                                            borderRadius: 8, 
                                            outline: '1px #767676 solid', 
                                            outlineOffset: '-1px',
                                            background: 'white',
                                            border: 'none',
                                            textAlign: 'center',
                                            color: '#101828', 
                                            fontSize: 14, 
                                            fontFamily: 'var(--ep-font-avenir)', 
                                            fontWeight: '500',
                                            width: 80
                                          }}
                                        />
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setEditingMonth(true);
                                            setMonthInput(months[selectedMonth]);
                                            setShowMonthDropdown(!showMonthDropdown);
                                          }}
                                          style={{paddingLeft: 8, paddingRight: 8, paddingTop: 6, paddingBottom: 6, borderRadius: 8, outline: '1px #767676 solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 2, display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer'}}
                                        >
                                          <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#101828', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1.43, wordWrap: 'break-word'}}>{months[selectedMonth]}</div>
                                        </button>
                                      )}
                                      {showMonthDropdown && (
                                        <div style={{position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #767676', borderRadius: 8, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1001, maxHeight: 200, overflowY: 'auto'}}>
                                          {months.map((month, index) => (
                                            <div
                                              key={month}
                                              onClick={() => {
                                                setSelectedMonth(index);
                                                setShowMonthDropdown(false);
                                              }}
                                              style={{padding: '8px 12px', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', color: '#101828', borderBottom: '1px solid #f0f0f0'}}
                                              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5'; }}
                                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                                            >
                                              {month}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div style={{position: 'relative'}}>
                                      {editingYear ? (
                                        <input
                                          type="number"
                                          value={yearInput}
                                          onChange={(e) => setYearInput(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              const year = parseInt(yearInput);
                                              if (year >= 1900 && year <= new Date().getFullYear()) {
                                                setSelectedYear(year);
                                              }
                                              setEditingYear(false);
                                            }
                                            if (e.key === 'Escape') {
                                              setEditingYear(false);
                                            }
                                          }}
                                          onBlur={() => {
                                            const year = parseInt(yearInput);
                                            if (year >= 1900 && year <= new Date().getFullYear()) {
                                              setSelectedYear(year);
                                            }
                                            setEditingYear(false);
                                          }}
                                          autoFocus
                                          min="1900"
                                          max={new Date().getFullYear()}
                                          style={{
                                            paddingLeft: 8, 
                                            paddingRight: 8, 
                                            paddingTop: 6, 
                                            paddingBottom: 6, 
                                            borderRadius: 8, 
                                            outline: '1px #767676 solid', 
                                            outlineOffset: '-1px',
                                            background: 'white',
                                            border: 'none',
                                            textAlign: 'center',
                                            color: '#101828', 
                                            fontSize: 14, 
                                            fontFamily: 'var(--ep-font-avenir)', 
                                            fontWeight: '500',
                                            width: 60
                                          }}
                                        />
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setEditingYear(true);
                                            setYearInput(selectedYear.toString());
                                            setShowYearDropdown(!showYearDropdown);
                                          }}
                                          style={{paddingLeft: 8, paddingRight: 8, paddingTop: 6, paddingBottom: 6, borderRadius: 8, outline: '1px #767676 solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 2, display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer'}}
                                        >
                                          <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#101828', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1.43, wordWrap: 'break-word'}}>{selectedYear}</div>
                                        </button>
                                      )}
                                      {showYearDropdown && (
                                        <div style={{position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #767676', borderRadius: 8, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1001, maxHeight: 200, overflowY: 'auto'}}>
                                          {years.map((year) => (
                                            <div
                                              key={year}
                                              onClick={() => {
                                                setSelectedYear(year);
                                                setShowYearDropdown(false);
                                              }}
                                              style={{padding: '8px 12px', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', color: '#101828', borderBottom: '1px solid #f0f0f0'}}
                                              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5'; }}
                                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                                            >
                                              {year}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
                                      const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
                                      setSelectedMonth(newMonth);
                                      setSelectedYear(newYear);
                                    }}
                                    style={{width: 24, height: 24, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                  >
                                    <Image src="/weui-arrow-filled_right.svg" alt="Next month" width={24} height={24} />
                                  </button>
                                </div>
                                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'flex'}}>
                                  <div style={{width: 252, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                    <div style={{flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1, wordWrap: 'break-word'}}>Sun</div>
                                    </div>
                                    <div style={{flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1, wordWrap: 'break-word'}}>Mon</div>
                                    </div>
                                    <div style={{flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1, wordWrap: 'break-word'}}>Tue</div>
                                    </div>
                                    <div style={{flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1, wordWrap: 'break-word'}}>Wed</div>
                                    </div>
                                    <div style={{flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1, wordWrap: 'break-word'}}>Thu</div>
                                    </div>
                                    <div style={{flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1, wordWrap: 'break-word'}}>Fri</div>
                                    </div>
                                    <div style={{flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1, wordWrap: 'break-word'}}>Sat</div>
                                    </div>
                                  </div>
                                  <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                                    {(() => {
                                      const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
                                      const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
                                      const days = [];
                                      
                                      // Create weeks
                                      for (let week = 0; week < 6; week++) {
                                        const weekDays = [];
                                        for (let day = 0; day < 7; day++) {
                                          const dayNumber = week * 7 + day - firstDay + 1;
                                          if (dayNumber > 0 && dayNumber <= daysInMonth) {
                                            const isToday = dayNumber === new Date().getDate() && 
                                                          selectedMonth === new Date().getMonth() && 
                                                          selectedYear === new Date().getFullYear();
                                            const isSelected = dayNumber === selectedDate;
                                            
                                            weekDays.push(
                                              <div key={`${week}-${day}`} style={{flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                                <div 
                                                  onClick={() => handleDateSelect(dayNumber)}
                                                  style={{
                                                    width: 32, 
                                                    height: 32, 
                                                    justifyContent: 'center', 
                                                    alignItems: 'center', 
                                                    display: 'inline-flex',
                                                    borderRadius: 8,
                                                    cursor: 'pointer',
                                                    background: isSelected ? '#113D7B' : isToday ? '#f0f0f0' : 'transparent'
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    if (!isSelected) {
                                                      (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f5f5f5';
                                                    }
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    if (!isSelected) {
                                                      (e.currentTarget as HTMLDivElement).style.backgroundColor = isToday ? '#f0f0f0' : 'transparent';
                                                    }
                                                  }}
                                                >
                                                  <div style={{
                                                    textAlign: 'center', 
                                                    color: isSelected ? 'white' : '#101828', 
                                                    fontSize: 14, 
                                                    fontFamily: 'var(--ep-font-avenir)', 
                                                    fontWeight: '500', 
                                                    lineHeight: 1.43, 
                                                    wordWrap: 'break-word'
                                                  }}>
                                                    {dayNumber}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          } else {
                                            weekDays.push(
                                              <div key={`${week}-${day}`} style={{flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                                <div style={{width: 32, height: 32}} />
                                              </div>
                                            );
                                          }
                                        }
                                        
                                        if (weekDays.some(day => day.props.children.props.style?.width !== 32 || day.props.children.props.children)) {
                                          days.push(
                                            <div key={week} style={{width: 252, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                                              {weekDays}
                                            </div>
                                          );
                                        }
                                      }
                                      
                                      return days;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div data-righticon="false" data-state="default" style={{width: 325, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex', outline: personalInfoFieldHasError('email') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('email') ? '-1px' : undefined}}>
                            <input type="email" value={email} onChange={(e) => handlePersonalInfoInputChange('email', e.target.value)} placeholder="Email address" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word', background: 'transparent', border: 'none', outline: 'none'}} />
                          </div>
                          <div data-righticon="false" data-state="phoneNumber" style={{alignSelf: 'stretch', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex', outline: personalInfoFieldHasError('phoneNumber') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('phoneNumber') ? '-1px' : undefined}}>
                            <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex'}}>
                              <div style={{width: 22, height: 16, position: 'relative', overflow: 'hidden', borderRadius: 2}}>
                                <Image src="/flagpack-us.svg" alt="US Flag" width={22} height={16} />
                              </div>
                              <div style={{width: 16, height: 16, position: 'relative', overflow: 'hidden'}}>
                                <Image src="/angle-down.svg" alt="Dropdown" width={16} height={16} />
                              </div>
                            </div>
                            <div style={{width: 1, height: 20, background: 'var(--Stroke-Grey, #E5E7EB)'}}></div>
                            <input type="tel" value={phoneNumber} onChange={(e) => handlePersonalInfoInputChange('phoneNumber', e.target.value)} placeholder="Phone number" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
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
                      <div data-righticon="true" data-state="contextualized" style={{alignSelf: 'stretch', minHeight: 79, padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex', outline: personalInfoFieldHasError('ssn') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('ssn') ? '-1px' : undefined}}>
                        <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--White, white)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                          <input type="text" pattern="[0-9]{3}-?[0-9]{2}-?[0-9]{4}" maxLength={11} value={ssn} onChange={(e) => handlePersonalInfoInputChange('ssn', e.target.value)} placeholder="123-45-6789" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
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
                      <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', outline: personalInfoFieldHasError('ficoScore') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('ficoScore') ? '-1px' : undefined}}>
                        <input type="number" min="300" max="850" value={ficoScore} onChange={(e) => handlePersonalInfoInputChange('ficoScore', e.target.value)} placeholder="e.g. 750" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
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
                              <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex', outline: personalInfoFieldHasError('addressLine1') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('addressLine1') ? '-1px' : undefined}}>
                                <input type="text" value={addressLine1} onChange={(e) => handlePersonalInfoInputChange('addressLine1', e.target.value)} placeholder="Address Line 1" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
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
                              <div data-righticon="false" data-state="default" style={{flex: '1 1 0', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex', outline: personalInfoFieldHasError('city') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('city') ? '-1px' : undefined}}>
                                <input type="text" value={city} onChange={(e) => handlePersonalInfoInputChange('city', e.target.value)} placeholder="City" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
                              </div>
                              <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, outline: '1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                                <div style={{flex: '1 1 0', color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>California</div>
                              </div>
                            </div>
                            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                              <div data-righticon="false" data-state="default" style={{flex: '1 1 0', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex', outline: personalInfoFieldHasError('zipCode') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: personalInfoFieldHasError('zipCode') ? '-1px' : undefined}}>
                                <input type="text" pattern="[0-9]{5}(-[0-9]{4})?" value={zipCode} onChange={(e) => handlePersonalInfoInputChange('zipCode', e.target.value)} placeholder="Zip Code" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
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
                  
                  {/* Personal Info Error Display */}
                  {personalInfoErrors.length > 0 && showPersonalInfoErrors && (
                    <div style={{marginTop: 8, textAlign: 'left', alignSelf: 'stretch'}}>
                      {personalInfoErrors.map((err, idx) => (
                        <div key={idx} style={{color: '#cc4747', fontSize: 12, fontFamily: 'var(--ep-font-avenir)'}}>{err}</div>
                      ))}
                    </div>
                  )}
                  
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
                      onClick={() => {
                        // Validate personal info before continuing
                        const map = computePersonalInfoErrorsByField();
                        const allErrs = flattenPersonalInfoErrors(map);
                        
                        if (allErrs.length > 0) {
                          // Show all errors and prevent navigation
                          setPersonalInfoErrors(allErrs);
                          setShowPersonalInfoErrors(true);
                          setPersonalInfoSubmitAttempted(true);
                          // Mark all fields as touched to surface all messages
                          setPersonalInfoTouched({ firstName: true, middleName: true, lastName: true, email: true, phoneNumber: true, dateOfBirth: true, ssn: true, ficoScore: true, addressLine1: true, city: true, zipCode: true });
                          return;
                        }
                        
                        // No errors, proceed to next step
                        setCurrentStep(2);
                      }}
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
                            <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex', outline: propertyInfoFieldHasError('propertyAddressLine1') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: propertyInfoFieldHasError('propertyAddressLine1') ? '-1px' : undefined}}>
                              <input 
                                type="text" 
                                value={propertyAddressLine1} 
                                onChange={(e) => handlePropertyInfoInputChange('propertyAddressLine1', e.target.value)} 
                                placeholder="Address Line 1*" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                          </div>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                            <div data-righticon="false" data-state="default" style={{flex: '1 1 0', paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex', outline: propertyInfoFieldHasError('propertyAddressLine2') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: propertyInfoFieldHasError('propertyAddressLine2') ? '-1px' : undefined}}>
                              <input 
                                type="text" 
                                value={propertyAddressLine2} 
                                onChange={(e) => handlePropertyInfoInputChange('propertyAddressLine2', e.target.value)} 
                                placeholder="Address Line 2" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                          </div>
                        </div>
                        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div data-righticon="false" data-state="default" style={{flex: '1 1 0', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex', outline: propertyInfoFieldHasError('propertyCity') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: propertyInfoFieldHasError('propertyCity') ? '-1px' : undefined}}>
                              <input 
                                type="text" 
                                value={propertyCity} 
                                onChange={(e) => handlePropertyInfoInputChange('propertyCity', e.target.value)} 
                                placeholder="City*" 
                                style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} 
                              />
                            </div>
                            <div data-righticon="false" data-state="default" style={{width: 158.5, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, outline: '1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset: '-1px', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
                              <div style={{flex: '1 1 0', color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>California</div>
                            </div>
                          </div>
                          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
                            <div data-righticon="false" data-state="default" style={{flex: '1 1 0', height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex', outline: propertyInfoFieldHasError('propertyZipCode') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: propertyInfoFieldHasError('propertyZipCode') ? '-1px' : undefined}}>
                              <input 
                                type="text" 
                                value={propertyZipCode} 
                                onChange={(e) => handlePropertyInfoInputChange('propertyZipCode', e.target.value)} 
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
                        <div style={{alignSelf: 'stretch', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', outline: propertyInfoFieldHasError('propertyValue') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: propertyInfoFieldHasError('propertyValue') ? '-1px' : undefined}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                            <input type="text" value={propertyValue} onChange={(e) => handlePropertyInfoInputChange('propertyValue', e.target.value)} placeholder="e.g. 100 000" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
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
                            <div style={{flex: '1 1 0', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', outline: propertyInfoFieldHasError('propertyLink') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: propertyInfoFieldHasError('propertyLink') ? '-1px' : undefined}}>
                                <input type="text" value={propertyLink} onChange={(e) => handlePropertyInfoInputChange('propertyLink', e.target.value)} placeholder="e.g. Zillow, Redfin etc." style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
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

                  {/* Property Info Error Display */}
                  {propertyInfoErrors.length > 0 && showPropertyInfoErrors && (
                    <div style={{marginTop: 8, textAlign: 'left', alignSelf: 'stretch'}}>
                      {propertyInfoErrors.map((err, idx) => (
                        <div key={idx} style={{color: '#cc4747', fontSize: 12, fontFamily: 'var(--ep-font-avenir)'}}>{err}</div>
                      ))}
                    </div>
                  )}

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
                      onClick={() => {
                        // Validate property info before continuing
                        setPropertyInfoSubmitAttempted(true);
                        setShowPropertyInfoErrors(true);
                        
                        const errors = computePropertyInfoErrorsByField();
                        if (Object.keys(errors).length === 0) {
                          // No errors, can proceed to next step
                          setCurrentStep(3);
                        } else {
                          // Show errors to user
                          const allErrors = Object.values(errors).flat();
                          setPropertyInfoErrors(allErrors);
                        }
                      }}
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
                        <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex', outline: poolTermsFieldHasError('poolAmount') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: poolTermsFieldHasError('poolAmount') ? '-1px' : undefined}}>
                            <div style={{color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>$</div>
                            <input type="text" value={poolAmount} onChange={(e) => handlePoolTermsInputChange('poolAmount', e.target.value)} placeholder="e.g. 350 000" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
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
                                <div style={{flex: '1 1 0', height: 39, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', outline: poolTermsFieldHasError('roiRate') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: poolTermsFieldHasError('roiRate') ? '-1px' : undefined}}>
                                    <input type="text" value={roiRate} onChange={(e) => handlePoolTermsInputChange('roiRate', e.target.value)} placeholder="%" style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', background: 'transparent', border: 'none', outline: 'none'}} />
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
                          onClick={() => {
                            setLoanType('interest-only');
                            handlePoolTermsInputChange('loanType', 'interest-only');
                          }}
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
                            cursor: 'pointer',
                            outline: poolTermsFieldHasError('loanType') ? '1px var(--Error, #CC4747) solid' : undefined, 
                            outlineOffset: poolTermsFieldHasError('loanType') ? '-1px' : undefined
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
                          onClick={() => {
                            setLoanType('maturity');
                            handlePoolTermsInputChange('loanType', 'maturity');
                          }}
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
                            cursor: 'pointer',
                            outline: poolTermsFieldHasError('loanType') ? '1px var(--Error, #CC4747) solid' : undefined, 
                            outlineOffset: poolTermsFieldHasError('loanType') ? '-1px' : undefined
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
                            cursor: 'pointer',
                            outline: poolTermsFieldHasError('termMonths') ? '1px var(--Error, #CC4747) solid' : undefined, 
                            outlineOffset: poolTermsFieldHasError('termMonths') ? '-1px' : undefined
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
                            cursor: 'pointer',
                            outline: poolTermsFieldHasError('termMonths') ? '1px var(--Error, #CC4747) solid' : undefined, 
                            outlineOffset: poolTermsFieldHasError('termMonths') ? '-1px' : undefined
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
                            cursor: 'pointer',
                            outline: poolTermsFieldHasError('termMonths') ? '1px var(--Error, #CC4747) solid' : undefined, 
                            outlineOffset: poolTermsFieldHasError('termMonths') ? '-1px' : undefined
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
                        <div style={{flex: '1 1 0', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 10, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex', outline: poolTermsFieldHasError('termMonths') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: poolTermsFieldHasError('termMonths') ? '-1px' : undefined}}>
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
                  
                  {/* Pool Terms Error Display */}
                  {poolTermsErrors.length > 0 && showPoolTermsErrors && (
                    <div style={{marginTop: 8, textAlign: 'left', alignSelf: 'stretch'}}>
                      {poolTermsErrors.map((err, idx) => (
                        <div key={idx} style={{color: '#cc4747', fontSize: 12, fontFamily: 'var(--ep-font-avenir)'}}>{err}</div>
                      ))}
                    </div>
                  )}
                  
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
                      onClick={() => {
                        setPoolTermsSubmitAttempted(true);
                        const map = computePoolTermsErrorsByField();
                        const allErrs = flattenPoolTermsErrors(map);
                        if (allErrs.length === 0) {
                          setCurrentStep(4);
                        } else {
                          setPoolTermsErrors(allErrs);
                          setShowPoolTermsErrors(true);
                        }
                      }}
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
