"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
const LoginModal = dynamic(()=> import('../components/LoginModal'), { ssr:false });

export default function Home() {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [modalStep, setModalStep] = useState('roleSelection'); // 'roleSelection', 'borrowerSignUp', 'investorSignUp', 'verifyContact', 'livenessCheck', 'emailVerification', 'accountCreated'
  const [selectedRole, setSelectedRole] = useState<'borrower' | 'investor' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    ssn: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    password: '',
    repeatPassword: ''
  });
  const [verificationCode, setVerificationCode] = useState(''); // email verification code (legacy / emailVerification step)
  const [phoneVerificationCode, setPhoneVerificationCode] = useState(''); // phone code for combined verifyContact step
  const [acceptedTerms, setAcceptedTerms] = useState(false); // terms of service checkbox
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(17);
  const [selectedMonth, setSelectedMonth] = useState('June');
  const [selectedYear, setSelectedYear] = useState('1993');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [editingMonth, setEditingMonth] = useState(false);
  const [editingYear, setEditingYear] = useState(false);
  const [monthInput, setMonthInput] = useState('June');
  const [yearInput, setYearInput] = useState('1993');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  const usStates = [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
    'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts',
    'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
    'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
    'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
    'Wisconsin','Wyoming'
  ];
  const stateFieldRef = useRef<HTMLDivElement | null>(null);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [highlightedStateIndex, setHighlightedStateIndex] = useState(-1);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 100}, (_, i) => (currentYear - i).toString());
  const filteredStates = formData.state
    ? usStates.filter(s => s.toLowerCase().startsWith(formData.state.toLowerCase()))
    : usStates;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stateFieldRef.current && !stateFieldRef.current.contains(e.target as Node)) {
        setShowStateDropdown(false);
        setHighlightedStateIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Reset highlight when filter changes
    setHighlightedStateIndex(filteredStates.length ? 0 : -1);
  }, [formData.state, filteredStates.length]);

  const openSignUpModal = () => setShowSignUpModal(true);
  const closeSignUpModal = () => {
    setShowSignUpModal(false);
    setModalStep('roleSelection');
    setAcceptedTerms(false); // Reset terms acceptance
    // Reset form data
    setFormData({
      fullName: '',
      dateOfBirth: '',
      email: '',
      phone: '',
      ssn: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      password: '',
      repeatPassword: ''
    });
  };
  const goToBorrowerSignUp = () => { setSelectedRole('borrower'); setModalStep('borrowerSignUp'); };
  const goToInvestorSignUp = () => { 
    setSelectedRole('investor'); 
    setModalStep('investorSignUp'); 
    // Reset any open date picker UI state when switching steps
    setShowDatePicker(false);
    setShowMonthDropdown(false);
    setShowYearDropdown(false);
    setEditingMonth(false);
    setEditingYear(false);
  };
  const goBackToRoleSelection = () => setModalStep('roleSelection');

  // Handler functions for the main CTA buttons
  const handleBorrowerButtonClick = () => {
    if (isAuthenticated && selectedRole === 'borrower') {
      // User is already authenticated as borrower, do nothing
      return;
    }
    if (isAuthenticated && selectedRole === 'investor') {
      // User is authenticated as investor, do nothing
      return;
    }
    // User is not authenticated, open signup modal for borrower
    setSelectedRole('borrower');
    setModalStep('borrowerSignUp');
    setShowSignUpModal(true);
  };

  const handleInvestorButtonClick = () => {
    if (isAuthenticated && selectedRole === 'investor') {
      // User is already authenticated as investor, do nothing
      return;
    }
    if (isAuthenticated && selectedRole === 'borrower') {
      // User is authenticated as borrower, do nothing
      return;
    }
    // User is not authenticated, open signup modal for investor
    setSelectedRole('investor');
    setModalStep('investorSignUp');
    setShowSignUpModal(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignUp = async () => {
    if(selectedRole === 'borrower') {
      try {
        const payload = {
          fullName: formData.fullName,
            // Backend accepts YYYY-MM-DD; formData.dateOfBirth already stored as ISO string
          dateOfBirth: formData.dateOfBirth,
          email: formData.email,
          password: formData.password,
        };
        const res = await fetch('/api/borrowers/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if(!res.ok){
          const err = await res.json().catch(()=>({error:'Signup failed'}));
          alert(err.error || 'Signup failed');
          return;
        }
        // On success mark authenticated and continue to verification
        setIsAuthenticated(true);
        // Persist simple flag (session cookie is real auth)
        if (typeof window !== 'undefined') localStorage.setItem('ep-auth','1');
  // Borrower flow: go straight to email verification step
  setModalStep('emailVerification');
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Network error';
        alert(errorMessage);
      }
      return;
    }

    // Investor signup path
    if(selectedRole === 'investor') {
      try {
        const payload = {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          email: formData.email,
          phone: formData.phone,
          ssn: formData.ssn,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          password: formData.password,
        };
        const res = await fetch('/api/investors/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if(!res.ok){
          const err = await res.json().catch(()=>({error:'Signup failed'}));
          alert(err.error || 'Signup failed');
          return;
        }
        // On success mark authenticated and continue to verification
        setIsAuthenticated(true);
        // Persist simple flag (session cookie is real auth)
        if (typeof window !== 'undefined') localStorage.setItem('ep-auth','1');
        // Investor flow: go to combined contact verification first
        setModalStep('verifyContact');
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Network error';
        alert(errorMessage);
      }
      return;
    }
  };

  const handleInvestorSignUp = async () => {
    try {
      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
        phone: formData.phone,
        ssn: formData.ssn,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        password: formData.password,
      };
      console.log('Sending investor signup payload:', payload);
      const res = await fetch('/api/investors/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if(!res.ok){
        const err = await res.json().catch(()=>({error:'Signup failed'}));
        alert(err.error || 'Signup failed');
        return;
      }
      // On success mark authenticated and continue to verification
      setSelectedRole('investor');
      setIsAuthenticated(true);
      // Persist simple flag (session cookie is real auth)
      if (typeof window !== 'undefined') localStorage.setItem('ep-auth','1');
      // Investor flow: go to combined contact verification first
      setModalStep('verifyContact');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Network error';
      alert(errorMessage);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method:'POST' });
    } catch {
      // Ignore logout errors
    }
    setIsAuthenticated(false);
    setShowProfileMenu(false);
    if (typeof window !== 'undefined') localStorage.removeItem('ep-auth');
  };

  // On mount, probe backend session; fallback to localStorage flag
  useEffect(()=>{
    let cancelled = false;
    (async()=>{
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
            if(!cancelled && data.authenticated) {
              setIsAuthenticated(true);
              setSelectedRole(data.role);
            }
            return;
        }
      } catch {
        // Ignore auth check errors
      }
      // Fallback
      if(!cancelled && typeof window !== 'undefined' && localStorage.getItem('ep-auth')==='1') {
        setIsAuthenticated(true);
      }
    })();
  return ()=> { cancelled = true; };
  },[]);

  const borrowerCanContinue = (
    !!formData.fullName &&
    !!formData.dateOfBirth &&
    !!formData.email &&
    !!formData.password &&
    formData.password === formData.repeatPassword &&
    acceptedTerms
  );

  const investorCanContinue = (
    !!formData.fullName &&
    !!formData.dateOfBirth &&
    !!formData.email &&
    !!formData.phone &&
    !!formData.ssn &&
    !!formData.address1 &&
    !!formData.city &&
    !!formData.state &&
    !!formData.zip &&
    !!formData.country &&
    !!formData.password &&
    formData.password === formData.repeatPassword &&
    acceptedTerms
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentMonthIndex = months.indexOf(selectedMonth);
    let newMonthIndex = currentMonthIndex;
    let newYear = parseInt(selectedYear);

    if (direction === 'next') {
      newMonthIndex = currentMonthIndex + 1;
      if (newMonthIndex > 11) {
        newMonthIndex = 0;
        newYear += 1;
      }
    } else {
      newMonthIndex = currentMonthIndex - 1;
      if (newMonthIndex < 0) {
        newMonthIndex = 11;
        newYear -= 1;
      }
    }

    setSelectedMonth(months[newMonthIndex]);
    setSelectedYear(newYear.toString());
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(day);
    const dateString = `${selectedYear}-${String(getMonthNumber(selectedMonth)).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    handleInputChange('dateOfBirth', dateString);
    setShowDatePicker(false);
    setShowMonthDropdown(false);
    setShowYearDropdown(false);
  };

  const handleMonthInputSubmit = () => {
    if (months.includes(monthInput)) {
      setSelectedMonth(monthInput);
      setEditingMonth(false);
    } else {
      // Reset to previous value if invalid
      setMonthInput(selectedMonth);
      setEditingMonth(false);
    }
  };

  const handleYearInputSubmit = () => {
    const year = parseInt(yearInput);
    if (year >= 1900 && year <= new Date().getFullYear()) {
      setSelectedYear(yearInput);
      setEditingYear(false);
    } else {
      // Reset to previous value if invalid
      setYearInput(selectedYear);
      setEditingYear(false);
    }
  };

  const handleMonthInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMonthInputSubmit();
    } else if (e.key === 'Escape') {
      setMonthInput(selectedMonth);
      setEditingMonth(false);
    }
  };

  const handleYearInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleYearInputSubmit();
    } else if (e.key === 'Escape') {
      setYearInput(selectedYear);
      setEditingYear(false);
    }
  };

  const getMonthNumber = (monthName: string) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName) + 1;
  };

  const getDaysInMonth = (month: string, year: string) => {
    const monthNum = getMonthNumber(month);
    return new Date(parseInt(year), monthNum, 0).getDate();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const monthNum = getMonthNumber(selectedMonth);
    const year = parseInt(selectedYear);
    
    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(year, monthNum - 1, 1).getDay();
    
    const rows = [];
    let dayCount = 1;
    
    // Create exactly 6 weeks to match standard calendar layout
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      
      for (let dayInWeek = 0; dayInWeek < 7; dayInWeek++) {
        if (week === 0 && dayInWeek < firstDay) {
          // Empty cells before month starts
          weekDays.push(
            <div key={`empty-start-${dayInWeek}`} style={{width: 36, height: 36}} />
          );
        } else if (dayCount <= daysInMonth) {
          // Actual days of the month
          const currentDay = dayCount;
          const isSelected = currentDay === selectedDate;
          
          weekDays.push(
            <div 
              key={currentDay}
              onClick={() => handleDateSelect(currentDay)}
              style={{
                width: 36, 
                height: 36, 
                background: isSelected ? '#113D7B' : 'transparent',
                overflow: 'hidden', 
                borderRadius: 8, 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                display: 'inline-flex',
                cursor: 'pointer'
              }}
            >
              <div style={{
                textAlign: 'center', 
                color: isSelected ? 'white' : '#4A5565', 
                fontSize: 12, 
                fontFamily: 'var(--ep-font-avenir)', 
                fontWeight: '500', 
                wordWrap: 'break-word'
              }}>
                {currentDay}
              </div>
            </div>
          );
          dayCount++;
        } else {
          // Empty cells after month ends
          weekDays.push(
            <div key={`empty-end-${week}-${dayInWeek}`} style={{width: 36, height: 36}} />
          );
        }
      }
      
      rows.push(
        <div key={week} style={{width: 252, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          {weekDays}
        </div>
      );
    }
    
    return rows;
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon.svg" alt="EquiPool Logo" width={26} height={27} />
          <span className="ep-nav-brand">EquiPool</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a className="ep-nav-link">About Us</a>
          <a className="ep-nav-link">Security</a>
          <a className="ep-nav-link">Learn</a>
          <span className="px-2 py-1 rounded bg-gray-100 ep-nav-soon">Soon</span>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4" style={{position:'relative'}}>
          {isAuthenticated ? (
            <>
              {/* Notification Icon (left) */}
              <div
                style={{width:56,height:40,padding:'10px 16px',background:'#F4F4F4',borderRadius:32,outline:'1px #E5E7EB solid',display:'inline-flex',justifyContent:'center',alignItems:'center',cursor:'pointer'}}
                onClick={()=> alert('Notifications placeholder')}
                aria-label="Notifications"
              >
                <Image src="/notifs.svg" alt="Notifications" width={16} height={16} />
              </div>
              {/* Profile Icon (right / opens menu) */}
              <div
                style={{width:56,height:40,padding:'10px 16px',background:'#F4F4F4',borderRadius:32,outline:'1px #E5E7EB solid',display:'inline-flex',justifyContent:'center',alignItems:'center',cursor:'pointer', position:'relative'}}
                onClick={()=> setShowProfileMenu(v=>!v)}
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
              >
                <Image src="/profile.svg" alt="Profile" width={16} height={16} />
                {showProfileMenu && (
                  <div style={{width:220,padding:24,position:'absolute',top:48,right:0,background:'#F4F4F4',overflow:'hidden',borderRadius:24,outline:'1px #E5E7EB solid',display:'inline-flex',flexDirection:'column',justifyContent:'flex-end',alignItems:'flex-start',gap:14,zIndex:50}} role="menu">
                    <button style={{all:'unset',alignSelf:'stretch',color:'black',fontSize:16,fontFamily:'var(--ep-font-avenir)',fontWeight:500,cursor:'pointer'}} role="menuitem" onClick={() => window.location.href = '/pools'}>Pools & Dashboard</button>
                    <button style={{all:'unset',alignSelf:'stretch',color:'#B2B2B2',fontSize:16,fontFamily:'var(--ep-font-avenir)',fontWeight:500,cursor:'pointer'}} role="menuitem">Profile</button>
                    <button style={{all:'unset',alignSelf:'stretch',color:'#CC4747',fontSize:16,fontFamily:'var(--ep-font-avenir)',fontWeight:500,cursor:'pointer'}} role="menuitem" onClick={handleLogout}>Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="ep-nav-login" onClick={()=> setShowLoginModal(true)} style={{cursor:'pointer'}}>Login</button>
              <button className="ep-cta-join" onClick={openSignUpModal}>Join Equipool</button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start gap-8" style={{marginTop: 100}}>
        <section className="flex-1">
      <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32, display: 'inline-flex'}}>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'flex'}}>
        <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
          <div style={{textAlign: 'center', color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: 800, wordWrap: 'break-word'}}>Welcome to EquiPool</div>
        </div>
        <div style={{width: 566, textAlign: 'center'}}>
          <span style={{color: 'black', fontSize: 48, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, wordWrap: 'break-word'}}>Your Property. Your Terms. </span>
          <span style={{color: 'black', fontSize: 48, fontFamily: 'var(--ep-font-avenir)', fontWeight: 800, wordWrap: 'break-word'}}>Your Capital.</span>
        </div>
        <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>
          Access fair, fast, and community-powered loans backed by real assets. Whether you’re borrowing or investing — our AI-powered platform gives you control, clarity, and confidence.
        </div>
        <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
          <div 
            data-left-icon={true} 
            data-state="default" 
            style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex', cursor: 'pointer'}}
            onClick={handleBorrowerButtonClick}
          >
            <Image src="/icons.svg" alt="Handshake icon" width={24} height={24} />
            <div style={{color: 'white', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>I need funding</div>
          </div>
          <div 
            data-left-icon={true} 
            data-state="default" 
            style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex', cursor: 'pointer'}}
            onClick={handleInvestorButtonClick}
          >
            <Image src="/invest.svg" alt="Investment icon" width={24} height={24} />
            <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>I want to invest</div>
          </div>
        </div>
      </div>
      </div>
        </section>
      </main>

      {/* Trusted by section - 160px below hero */}
      <div style={{marginTop: 160}}>
        <div style={{width: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, display: 'flex', boxSizing: 'border-box'}}>
          <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div style={{textAlign: 'center', color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: 800, wordWrap: 'break-word'}}>Trusted by</div>
          </div>

          <div style={{display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'flex-start'}}>
            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}>Escrow</div>
            </div>

            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}>Title</div>
            </div>

            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}>Logo 1</div>
            </div>

            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}>Loan Service</div>
            </div>

            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}>Logo 1</div>
            </div>
          </div>
        </div>
      </div>
      {/* Value proposition - 20px below Trusted by */}
      <div style={{marginTop: 160}}>
        <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex', boxSizing: 'border-box'}}>
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Value proposition</div>
          </div>
          <div style={{width: 566, color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Fair Capital for Real People</div>
          <div style={{width: 698, color: 'black', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>We eliminate middlemen, confusing terms, and bias. Whether you&apos;re a homeowner seeking refinancing or an investor looking for real-world returns.</div>
          <div style={{height: 460, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'inline-flex'}}>
            <div style={{width: 350, alignSelf: 'stretch', padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Investors</div>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Earn strong, asset-backed returns by funding vetted borrowers. Transparent data. Clear risks. Full control.</div>
              </div>
            </div>
            <div style={{width: 350, alignSelf: 'stretch', padding: 32, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Borrowers</div>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Get access to competitive loan offers without banks, simplified  and straightforward paperwork, avoid vague approval criteria. <br/><br/>Your property speaks for itself.</div>
              </div>
            </div>
            <div style={{width: 350, alignSelf: 'stretch', padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Built-In Intelligence</div>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>AI verifies documents, suggests ROI ranges, and flags inconsistencies — so you can move faster with confidence.</div>
              </div>
            </div>
      </div>
    </div>
    </div>

    <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 80, display: 'inline-flex', marginTop: 160}}>
  <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 20, display: 'flex'}}>
    <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
      <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>How it works?</div>
    </div>
    <div style={{color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Simple steps. Smart infrastructure.</div>
  </div>
  <div style={{width: 1090, paddingTop: 32, paddingBottom: 64, paddingLeft: 56, paddingRight: 56, background: '#F4F4F4', borderRadius: 40, outline: '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 80, display: 'flex'}}>
    <div style={{paddingLeft: 10, paddingRight: 10, paddingTop: 8, paddingBottom: 8, background: 'white', borderRadius: 30, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
      <div style={{height: 64, paddingLeft: 20, paddingRight: 20, background: '#F4F4F4', borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div style={{textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Borrower</div>
      </div>
      <div style={{height: 64, paddingLeft: 10, paddingRight: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div style={{textAlign: 'center', color: '#B2B2B2', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Investor</div>
      </div>
    </div>
    
    {/* 2x2 Grid Layout */}
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 40, width: '100%', maxWidth: 900}}>
      {/* Top Left: Submit property & loan request */}
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 24}}>
        <div style={{width: 56, height: 56, padding: 8, background: '#ECECEC', borderRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Image src="/group.svg" alt="Submit property icon" width={24} height={24} />
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 8}}>
          <div style={{color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Submit property & loan request</div>
          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Add property details, upload optional documents, and set your loan amount, term, and preferred ROI.</div>
        </div>
      </div>

      {/* Top Right: Get AI support & approval */}
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 24}}>
        <div style={{width: 56, height: 56, padding: 8, background: '#ECECEC', borderRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Image src="/group.svg" alt="AI support icon" width={24} height={24} />
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 8}}>
          <div style={{color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Get AI support & approval</div>
          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>AI verifies documents, suggests ROI ranges, and flags inconsistencies — so you can move faster with confidence.</div>
        </div>
      </div>

      {/* Bottom Left: Launch your pool */}
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 24}}>
        <div style={{width: 56, height: 56, padding: 8, background: '#ECECEC', borderRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Image src="/group.svg" alt="Launch pool icon" width={24} height={24} />
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 8}}>
          <div style={{color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Launch your pool</div>
          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Once approved, your loan pool is live and visible to investors.</div>
        </div>
      </div>

      {/* Bottom Right: Receive funding */}
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 24}}>
        <div style={{width: 56, height: 56, padding: 8, background: '#ECECEC', borderRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Image src="/group.svg" alt="Receive funding icon" width={24} height={24} />
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 8}}>
          <div style={{color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Receive funding</div>
          <div style={{color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>When funded, money is disbursed through escrow and your repayment schedule begins.</div>
        </div>
      </div>
    </div>
  </div>
</div>

  {/* F.A.Q section */}
  <div style={{width: '100%', height: '100%', paddingTop: 10, paddingBottom: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, display: 'inline-flex', marginTop: 160}}>
  <div style={{width: 1080, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'flex'}}>
    <div style={{alignSelf: 'stretch', color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>F.A.Q</div>
    <div style={{alignSelf: 'stretch', boxShadow: '0px 1px 0.5px 0.05000000074505806px rgba(29, 41, 61, 0.02)', overflow: 'hidden', borderRadius: 12, outline: '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
      <div style={{alignSelf: 'stretch', paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20, background: '#F4F4F4', borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottom: '1px #E5E7EB solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
          <div style={{flex: '1 1 0', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Can I use Flowbite in open-source projects?</div>
        </div>
        <div style={{width: 20, height: 20, position: 'relative'}}>
          <div style={{width: 13.33, height: 7.50, left: 3.33, top: 5.83, position: 'absolute', background: '#101828'}} />
        </div>
      </div>
      <div style={{alignSelf: 'stretch', paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20, background: 'white', borderBottom: '1px #E5E7EB solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'flex'}}>
        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Generally, it is accepted to use Flowbite in open-source projects, as long as it is not a UI library, a theme, a template, a page-builder that would be considered as an alternative to Flowbite itself.</div>
        <div style={{alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>With that being said, feel free to use this design kit for your open-source projects.</div>
      </div>
      <div style={{alignSelf: 'stretch', paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20, background: 'white', borderBottom: '1px #E5E7EB solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
          <div style={{flex: '1 1 0', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Can I contribute to the Flowbite project?</div>
        </div>
        <div style={{width: 20, height: 20, position: 'relative'}}>
          <div style={{width: 13.33, height: 7.50, left: 3.33, top: 6.67, position: 'absolute', background: '#4A5565'}} />
        </div>
      </div>
      <div style={{alignSelf: 'stretch', paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20, background: 'white', borderBottom: '1px #E5E7EB solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
          <div style={{flex: '1 1 0', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Can I contribute to the Flowbite project?</div>
        </div>
        <div style={{width: 20, height: 20, position: 'relative'}}>
          <div style={{width: 13.33, height: 7.50, left: 3.33, top: 6.67, position: 'absolute', background: '#4A5565'}} />
        </div>
      </div>
      <div style={{alignSelf: 'stretch', paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20, background: 'white', borderBottom: '1px #E5E7EB solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
          <div style={{flex: '1 1 0', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Can I contribute to the Flowbite project?</div>
        </div>
        <div style={{width: 20, height: 20, position: 'relative'}}>
          <div style={{width: 13.33, height: 7.50, left: 3.33, top: 6.67, position: 'absolute', background: '#4A5565'}} />
        </div>
      </div>
      <div style={{alignSelf: 'stretch', paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20, background: 'white', borderBottom: '1px #E5E7EB solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
        <div style={{flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
          <div style={{flex: '1 1 0', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Can I contribute to the Flowbite project?</div>
        </div>
        <div style={{width: 20, height: 20, position: 'relative'}}>
          <div style={{width: 13.33, height: 7.50, left: 3.33, top: 6.67, position: 'absolute', background: '#4A5565'}} />
        </div>
      </div>
    </div>
  </div>
</div>

  {/* Call-to-action section under F.A.Q */}
  <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'inline-flex', marginTop: 160}}>
  <div style={{width: 1090, height: 422, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 32, outline: '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, display: 'flex'}}>
    <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Start building your wealth today</div>
    <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
      <div 
        data-left-icon="true" 
        data-state="default" 
        style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex', cursor: 'pointer'}}
        onClick={handleBorrowerButtonClick}
      >
        <Image src="/icons.svg" alt="Handshake icon" width={24} height={24} />
        <div style={{color: 'white', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>I need funding</div>
      </div>
      <div 
        data-left-icon="true" 
        data-state="default" 
        style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex', cursor: 'pointer'}}
        onClick={handleInvestorButtonClick}
      >
        <Image src="/invest.svg" alt="Investment icon" width={24} height={24} />
        <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>I want to invest</div>
      </div>
    </div>
  </div>
  </div>

  {/* Footer section */}
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
                        <div style={{color: 'var(--Grey, #767676)', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Enter your email</div>
                    </div>
                </div>
                <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, background: '#113D7B', boxShadow: '0px 1px 0.5px 0.05000000074505806px rgba(29, 41, 61, 0.02)', borderRadius: 12, outline: '1px #E5E7EB solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 6, display: 'flex'}}>
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
          onClose={()=> setShowLoginModal(false)}
          onSwitchToSignUp={()=> { setShowLoginModal(false); setShowSignUpModal(true); setModalStep('roleSelection'); }}
          onSuccess={(role)=> { setIsAuthenticated(true); setSelectedRole(role); }}
        />
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: 760,
            height: modalStep === 'investorSignUp' ? 640 : 580,
            background: 'white',
            borderRadius: 24,
            position: 'relative',
            boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
            transition: 'height 0.2s ease'
          }}>
            {modalStep === 'roleSelection' && (
              <div style={{width: '100%', height: '100%', paddingTop: 44, paddingBottom: 44, position: 'relative', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Sign Up</div>
                <div style={{alignSelf: 'stretch', paddingLeft: 200, paddingRight: 200, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div style={{height: 320, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32, display: 'flex'}}>
                    <div style={{alignSelf: 'stretch', paddingLeft: 70, paddingRight: 70, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex'}}>
                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Choose your role</div>
                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>You can&apos;t switch roles later, but you can register a second account using a different email if needed.</div>
                    </div>
                    <div style={{width: 452, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                      <div style={{width: 220, height: 200, padding: 24, background: 'white', borderRadius: 24, outline: '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex', cursor: 'pointer'}} onClick={goToBorrowerSignUp}>
                        <div style={{width: 40, height: 40, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                          <Image src="/vaadin-handshake.svg" alt="Borrow icon" width={32} height={32} />
                        </div>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                          <div style={{textAlign: 'center', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>I want to borrow</div>
                          <div style={{alignSelf: 'stretch', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Access community-powered capital using your real estate as collateral.</div>
                        </div>
                      </div>
                      <div style={{width: 220, height: 200, padding: 24, background: 'white', borderRadius: 24, outline: '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex', cursor: 'pointer'}} onClick={goToInvestorSignUp}>
                        <div style={{width: 40, height: 40, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                          <Image src="/invest.svg" alt="Invest icon" width={32} height={32} />
                        </div>
                        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                          <div style={{textAlign: 'center', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>I want to Invest</div>
                          <div style={{alignSelf: 'stretch', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Fund vetted property-backed loans and earn passive income.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={closeSignUpModal}
                  style={{width: 32, height: 32, right: 32, top: 32, position: 'absolute', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                  <Image src="/material-symbols-close.svg" alt="Close" width={24} height={24} />
                </button>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}} />
              </div>
            )}

            {modalStep === 'borrowerSignUp' && (
              <div style={{width: '100%', height: '100%', paddingTop: 24, paddingBottom: 24, position: 'relative', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Sign Up</div>
                  <div style={{alignSelf: 'stretch', textAlign: 'center'}}>
                    <span style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Borrower</span>
                    <span style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}> </span>
                  </div>
                </div>
                <div style={{alignSelf: 'stretch', paddingLeft: 200, paddingRight: 200, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32, display: 'flex'}}>
                    <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 48, display: 'flex'}}>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                          <input
                            type="text"
                            placeholder="Full name"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            style={{
                              flex: '1 1 0',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: formData.fullName ? 'black' : '#B2B2B2',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500'
                            }}
                          />
                        </div>
                        <div style={{width: 322, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'inline-flex', position: 'relative'}}>
                          <div 
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            style={{
                              flex: '1 1 0', 
                              color: formData.dateOfBirth ? 'black' : '#B2B2B2', 
                              fontSize: 14, 
                              fontFamily: 'var(--ep-font-avenir)', 
                              fontWeight: '500', 
                              wordWrap: 'break-word',
                              cursor: 'pointer'
                            }}
                          >
                            {formData.dateOfBirth ? `${selectedMonth} ${selectedDate}, ${selectedYear}` : 'Date of Birth'}
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
                                  onClick={() => navigateMonth('prev')}
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
                                        onKeyDown={handleMonthInputKeyDown}
                                        onBlur={handleMonthInputSubmit}
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
                                          setMonthInput(selectedMonth);
                                          setShowMonthDropdown(!showMonthDropdown);
                                        }}
                                        style={{paddingLeft: 8, paddingRight: 8, paddingTop: 6, paddingBottom: 6, borderRadius: 8, outline: '1px #767676 solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 2, display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer'}}
                                      >
                                        <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#101828', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1.43, wordWrap: 'break-word'}}>{selectedMonth}</div>
                                      </button>
                                    )}
                                    {showMonthDropdown && (
                                      <div style={{position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #767676', borderRadius: 8, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1001, maxHeight: 200, overflowY: 'auto'}}>
                                        {months.map((month) => (
                                          <div
                                            key={month}
                                            onClick={() => {
                                              setSelectedMonth(month);
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
                                        onKeyDown={handleYearInputKeyDown}
                                        onBlur={handleYearInputSubmit}
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
                                          setYearInput(selectedYear);
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
                                  onClick={() => navigateMonth('next')}
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
                                  {renderCalendarDays()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                          <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            style={{
                              flex: '1 1 0',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: formData.email ? 'black' : '#B2B2B2',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500'
                            }}
                          />
                        </div>
                        <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            style={{
                              flex: '1 1 0',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: formData.password ? 'black' : '#B2B2B2',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              WebkitAppearance: 'none',
                              // visually mimic password bullets while allowing toggle; rely on input type instead
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'}}
                          >
                            <Image src="/show_password.svg" alt="Toggle password visibility" width={16} height={16} />
                          </button>
                        </div>
                        <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                          <input
                            type={showRepeatPassword ? 'text' : 'password'}
                            placeholder="Repeat"
                            value={formData.repeatPassword}
                            onChange={(e) => handleInputChange('repeatPassword', e.target.value)}
                            style={{
                              flex: '1 1 0',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: formData.repeatPassword ? 'black' : '#B2B2B2',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                            style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'}}
                          >
                            <Image src="/show_password.svg" alt="Toggle password visibility" width={16} height={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%'}}>
                        <input
                          type="checkbox"
                          id="termsCheckbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: '#113D7B',
                            cursor: 'pointer'
                          }}
                        />
                        <label htmlFor="termsCheckbox" style={{cursor: 'pointer', textAlign: 'center'}}>
                          <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>I agree to the </span>
                          <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word'}}>Terms of Service</span>
                          <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}> and </span>
                          <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word'}}>Privacy Policy</span>
                          <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>.</span>
                        </label>
                      </div>
                      <div style={{alignSelf: 'stretch', textAlign: 'center'}}>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Already have an account?</span>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}> </span>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word'}}>Log In</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={closeSignUpModal}
                  style={{width: 32, height: 32, right: 32, top: 32, position: 'absolute', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                  <Image src="/material-symbols-close.svg" alt="Close" width={24} height={24} />
                </button>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <button 
                    onClick={handleSignUp}
                    disabled={!borrowerCanContinue}
                    style={{
                      paddingLeft: 16, 
                      paddingRight: 16, 
                      paddingTop: 10, 
                      paddingBottom: 10, 
                      background: borrowerCanContinue ? 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)' : '#B2B2B2', 
                      borderRadius: 12, 
                      border: 'none',
                      cursor: borrowerCanContinue ? 'pointer' : 'not-allowed',
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: 8, 
                      display: 'inline-flex'
                    }}
                  >
                    <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Sign Up</div>
                  </button>
                  <button 
                    onClick={goBackToRoleSelection}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#4A5565',
                      fontSize: 12,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '400',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {modalStep === 'investorSignUp' && (
              <div style={{width: '100%', height: '100%', paddingTop: 44, paddingBottom: 44, position: 'relative', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Sign Up</div>
                  <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Investor</div>
                </div>
                <div style={{alignSelf: 'stretch', height: 455, paddingLeft: 32, paddingRight: 32, paddingTop: 8, paddingBottom: 8, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
                  <div style={{padding: 4, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 30, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                    <div style={{paddingLeft: 20, paddingRight: 20, paddingTop: 12, paddingBottom: 12, background: 'var(--White, white)', borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                      <div style={{textAlign: 'center', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Individual</div>
                    </div>
                    <div style={{paddingLeft: 10, paddingRight: 10, paddingTop: 12, paddingBottom: 12, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                      <div style={{textAlign: 'center', color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Company</div>
                    </div>
                  </div>
                  <div style={{width: 654, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                    {/* Left Column */}
                    <div style={{width: 322, height: '100%', paddingTop: 8, paddingBottom: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 48, display: 'inline-flex'}}>
                      <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        {(() => { const error = !!formData.fullName && formData.fullName.length < 5; return (
                          <div data-righticon="false" data-state={error? 'error': (formData.fullName? 'focus':'default')} style={{width: 322, padding: '12px 16px', background: '#F4F4F4', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 16, outline: error? '1px var(--Error, #CC4747) solid': undefined, outlineOffset: error? '-1px': undefined}}>
                            <input
                              type="text"
                              placeholder="Full name"
                              value={formData.fullName}
                              onChange={(e)=>handleInputChange('fullName', e.target.value)}
                              style={{flex: '1 1 0', background: 'transparent', border: 'none', outline: 'none', color: formData.fullName ? 'black':'#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}
                            />
                          </div>
                        ); })()}
                        <div style={{width: 322, height: 43, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'inline-flex', position: 'relative'}}>
                          <div 
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            style={{
                              flex: '1 1 0', 
                              color: formData.dateOfBirth ? 'black' : '#B2B2B2', 
                              fontSize: 14, 
                              fontFamily: 'var(--ep-font-avenir)', 
                              fontWeight: '500', 
                              wordWrap: 'break-word',
                              cursor: 'pointer'
                            }}
                          >
                            {formData.dateOfBirth ? `${selectedMonth} ${selectedDate}, ${selectedYear}` : 'Date of Birth'}
                          </div>
                          {/* Dropdown icon placeholder (calendar toggle) */}
                          <div data-icon="ic:arrowdown" style={{width:16, height:16, position:'relative', overflow:'hidden'}} />
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
                                  onClick={() => navigateMonth('prev')}
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
                                        onKeyDown={handleMonthInputKeyDown}
                                        onBlur={handleMonthInputSubmit}
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
                                          setMonthInput(selectedMonth);
                                          setShowMonthDropdown(!showMonthDropdown);
                                        }}
                                        style={{paddingLeft: 8, paddingRight: 8, paddingTop: 6, paddingBottom: 6, borderRadius: 8, outline: '1px #767676 solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 2, display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer'}}
                                      >
                                        <div style={{textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#101828', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', lineHeight: 1.43, wordWrap: 'break-word'}}>{selectedMonth}</div>
                                      </button>
                                    )}
                                    {showMonthDropdown && (
                                      <div style={{position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #767676', borderRadius: 8, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1001, maxHeight: 200, overflowY: 'auto'}}>
                                        {months.map((month) => (
                                          <div
                                            key={month}
                                            onClick={() => {
                                              setSelectedMonth(month);
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
                                        onKeyDown={handleYearInputKeyDown}
                                        onBlur={handleYearInputSubmit}
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
                                          setYearInput(selectedYear);
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
                                  onClick={() => navigateMonth('next')}
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
                                  {renderCalendarDays()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
            <div data-righticon="false" data-state={!formData.email? 'default': 'focus'} style={{width: 322, padding: '12px 16px', background: '#F4F4F4', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 16}}>
                          <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e)=>handleInputChange('email', e.target.value)}
                            style={{flex: '1 1 0', background: 'transparent', border: 'none', outline: 'none', color: formData.email ? 'black':'#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}
                          />
                        </div>
            <div data-righticon="false" data-state={formData.phone? 'focus':'phoneNumber'} style={{width: 322, padding: '12px 16px', background: '#F4F4F4', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 12}}>
                          {/* Country flag */}
                          <div style={{display:'flex', alignItems:'center', gap:4}}>
                            <Image src="/flagpack-us.svg" alt="US flag" width={22} height={17} style={{borderRadius:2}} />
                          </div>
                          <div style={{width: 20, height: 0, transform: 'rotate(90deg)', transformOrigin: 'top left', outline: '1px var(--Stroke-Grey, #E5E7EB) solid', outlineOffset: '-0.50px'}} />
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Phone Number"
                            aria-label="Phone Number"
                            value={formData.phone}
                            onChange={(e)=>{
                              const digits = e.target.value.replace(/[^0-9]/g,'');
                              handleInputChange('phone', digits);
                            }}
                            onPaste={(e)=>{
                              e.preventDefault();
                              const text = e.clipboardData.getData('text');
                              const digits = text.replace(/[^0-9]/g,'');
                              handleInputChange('phone', digits);
                            }}
                            onKeyDown={(e)=>{
                              // Allow control keys
                              const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                              if(allowed.includes(e.key)) return;
                              if(!/^[0-9]$/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: formData.phone? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500, letterSpacing:'0.5px'}}
                          />
                        </div>
            <div data-righticon="true" data-state="contextualized" style={{width: 322, padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap:4}}>
                          <div style={{alignSelf:'stretch', padding: '10px 12px', background: 'white', borderRadius:10, outline:'1px #767676 solid', outlineOffset:'-1px', display:'inline-flex', alignItems:'center', gap:10}}>
                            <input
                              type="text"
                              placeholder="SSN"
                              value={formData.ssn}
                              onChange={(e)=>handleInputChange('ssn', e.target.value)}
                              style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: formData.ssn? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}
                            />
                          </div>
                          <div style={{alignSelf:'stretch', padding:'0 8px', display:'inline-flex', alignItems:'center', gap:10}}>
                            <div style={{flex:'1 1 0', color:'var(--Black, black)', fontSize:12, fontFamily:'var(--ep-font-avenir)', fontWeight:400, lineHeight: '20px', wordWrap:'break-word'}}>Used for identity and investor risk verification</div>
                          </div>
                        </div>
                      </div>
                    </div>
          {/* Right Column */}
                    <div style={{width: 322, height: '100%', paddingTop: 8, paddingBottom: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 48, display: 'inline-flex'}}>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div data-righticon="false" data-state={formData.address1? 'focus':'default'} style={{width: 322, padding: '12px 16px', background: '#F4F4F4', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 16}}>
                          <input
                            type="text"
                            placeholder="Address Line 1"
                            value={formData.address1}
                            onChange={(e)=>handleInputChange('address1', e.target.value)}
                            style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: formData.address1? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}
                          />
                        </div>
                        <div data-righticon="false" data-state={formData.address2? 'focus':'default'} style={{width: 322, padding: '12px 16px', background: '#F4F4F4', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 16}}>
                          <input
                            type="text"
                            placeholder="Address Line 2"
                            value={formData.address2}
                            onChange={(e)=>handleInputChange('address2', e.target.value)}
                            style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: formData.address2? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}
                          />
                        </div>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div data-righticon="false" data-state={formData.city? 'focus':'default'} style={{flex: '1 1 0', padding: '12px 16px', background:'#F4F4F4', borderRadius:8, display:'flex', alignItems:'center', gap:16}}>
                            <input
                              type="text"
                              placeholder="City"
                              value={formData.city}
                              onChange={(e)=>handleInputChange('city', e.target.value)}
                              style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: formData.city? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}
                            />
                          </div>
                          <div ref={stateFieldRef} data-righticon="true" data-state={formData.state? 'focus':'dropdown'} style={{width:111.2, height:45, padding:'12px 16px', background:'#F4F4F4', borderRadius:8, display:'flex', alignItems:'center', gap:4, flex:'0 0 auto', position:'relative'}}>
                            <input
                              type="text"
                              placeholder="State"
                              value={formData.state}
                              onFocus={()=>{ setShowStateDropdown(true); setHighlightedStateIndex(filteredStates.length?0:-1); }}
                              onChange={(e)=>{ handleInputChange('state', e.target.value); setShowStateDropdown(true); }}
                              onKeyDown={(e)=>{
                                if(!showStateDropdown) return;
                                if(e.key === 'ArrowDown') { e.preventDefault(); setHighlightedStateIndex(i=> Math.min((i<0?0:i+1), filteredStates.length-1)); }
                                else if(e.key === 'ArrowUp') { e.preventDefault(); setHighlightedStateIndex(i=> Math.max((i<=0?0:i-1), 0)); }
                                else if(e.key === 'Enter') { 
                                  e.preventDefault(); 
                                  if(highlightedStateIndex >=0 && filteredStates[highlightedStateIndex]) { 
                                    handleInputChange('state', filteredStates[highlightedStateIndex]); 
                                    setShowStateDropdown(false); 
                                  }
                                } else if(e.key === 'Escape') { setShowStateDropdown(false); }
                              }}
                              style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: formData.state? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}
                            />
                            <div data-icon="ic:arrowdown" style={{width:16, height:16, position:'relative', overflow:'hidden', cursor:'pointer'}} onClick={()=> setShowStateDropdown(o=>!o)} />
                            {showStateDropdown && (
                              <div style={{position:'absolute', top:'100%', left:0, marginTop:4, width:200, maxHeight:200, overflowY:'auto', background:'white', borderRadius:8, boxShadow:'0 4px 10px rgba(0,0,0,0.08)', outline:'1px #E5E7EB solid', outlineOffset:'-1px', zIndex:2000}}>
                                {filteredStates.length ? filteredStates.map((s, idx)=>(
                                  <div
                                    key={s}
                                    onMouseDown={(e)=>{ e.preventDefault(); handleInputChange('state', s); setShowStateDropdown(false); }}
                                    onMouseEnter={()=> setHighlightedStateIndex(idx)}
                                    style={{
                                      padding:'8px 12px',
                                      cursor:'pointer',
                                      background: idx===highlightedStateIndex? '#F4F4F4':'white',
                                      color:'#101828',
                                      fontSize:14,
                                      fontFamily:'var(--ep-font-avenir)',
                                      fontWeight:500,
                                      whiteSpace:'nowrap',
                                      textOverflow:'ellipsis',
                                      overflow:'hidden'
                                    }}
                                  >{s}</div>
                                )) : (
                                  <div style={{padding:'8px 12px', fontSize:12, color:'#4A5565', fontFamily:'var(--ep-font-avenir)'}}>No matches</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                          <div data-righticon="false" data-state={formData.zip? 'focus':'default'} style={{flex:'1 1 0', padding:'12px 16px', background:'#F4F4F4', borderRadius:8, display:'flex', alignItems:'center', gap:16}}>
                            <input
                              type="text"
                              placeholder="Zip Code"
                              value={formData.zip}
                              onChange={(e)=>handleInputChange('zip', e.target.value)}
                              style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: formData.zip? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}
                            />
                          </div>
                          <div data-righticon="false" data-state={formData.country? 'focus':'default'} style={{width:111.2, height:45, padding:'12px 16px', background:'#F4F4F4', borderRadius:8, outline:'1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset:'-1px', display:'flex', alignItems:'center', gap:16, flex:'0 0 auto'}}>
                            <input
                              type="text"
                              placeholder="United States"
                              value={formData.country}
                              onChange={(e)=>handleInputChange('country', e.target.value)}
                              style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: formData.country? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}
                            />
                          </div>
                        </div>
                        <div data-righticon="true" data-state="password" style={{width: 322, padding: '12px 16px', background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            style={{
                              flex: '1 1 0',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: formData.password ? 'black' : '#B2B2B2',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            style={{background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                          >
                            <Image src="/show_password.svg" alt={showPassword ? 'Hide password' : 'Show password'} width={16} height={16} />
                          </button>
                        </div>
                        <div data-righticon="true" data-state="password" style={{width: 322, padding: '12px 16px', background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                          <input
                            type={showRepeatPassword ? 'text' : 'password'}
                            placeholder="Repeat"
                            value={formData.repeatPassword}
                            onChange={(e) => handleInputChange('repeatPassword', e.target.value)}
                            style={{
                              flex: '1 1 0',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: formData.repeatPassword ? 'black' : '#B2B2B2',
                              fontSize: 14,
                              fontFamily: 'var(--ep-font-avenir)',
                              fontWeight: '500',
                              wordWrap: 'break-word'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRepeatPassword(p => !p)}
                            aria-label={showRepeatPassword ? 'Hide repeat password' : 'Show repeat password'}
                            style={{background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                          >
                            <Image src="/show_password.svg" alt={showRepeatPassword ? 'Hide repeat password' : 'Show repeat password'} width={16} height={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%'}}>
                      <input
                        type="checkbox"
                        id="termsCheckboxInvestor"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: '#113D7B',
                          cursor: 'pointer'
                        }}
                      />
                      <label htmlFor="termsCheckboxInvestor" style={{cursor: 'pointer', textAlign: 'center'}}>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>I agree to the </span>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word'}}>Terms of Service</span>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}> and </span>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word'}}>Privacy Policy</span>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>.</span>
                      </label>
                    </div>
                    <div style={{alignSelf: 'stretch', textAlign: 'center'}}><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>Already have an account?</span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}> </span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word'}}>Log In</span></div>
                  </div>
                </div>
                <button 
                  onClick={closeSignUpModal}
                  style={{width: 32, height: 32, right: 32, top: 32, position: 'absolute', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                  <Image src="/material-symbols-close.svg" alt="Close" width={24} height={24} />
                </button>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div
                    onClick={() => { 
                      if(investorCanContinue){ 
                        handleInvestorSignUp();
                      } 
                    }}
                    style={{
                      paddingLeft:16,
                      paddingRight:16,
                      paddingTop:10,
                      paddingBottom:10,
                      background: investorCanContinue ? 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)':'var(--Inactive-Blue, #B8C5D7)',
                      borderRadius:12,
                      justifyContent:'center',
                      alignItems:'center',
                      gap:8,
                      display:'inline-flex',
                      cursor: investorCanContinue ? 'pointer':'not-allowed',
                      opacity: investorCanContinue ? 1 : 1
                    }}
                  >
                    <div style={{color:'white', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}>Continue</div>
                  </div>
                  <button 
                    onClick={goBackToRoleSelection}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#4A5565',
                      fontSize: 12,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '400',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {modalStep === 'verifyContact' && (
              <div style={{width: '100%', height: '100%', paddingTop: 44, paddingBottom: 44, position: 'relative', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Sign Up</div>
                  <div style={{alignSelf: 'stretch', textAlign: 'center'}}>
                    <span style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{selectedRole === 'investor' ? 'Investor' : 'Borrower'}</span>
                    <span style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}> </span>
                  </div>
                </div>
                <div style={{alignSelf: 'stretch', height: 452, paddingLeft: 200, paddingRight: 200, paddingTop: 24, paddingBottom: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
                  <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32, display: 'flex'}}>
                    <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'flex'}}>
                      <div style={{alignSelf: 'stretch', paddingLeft: 70, paddingRight: 70, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Verify your email</div>
                        <div style={{textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>Please enter the code sent to your email</div>
                      </div>
                      <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div data-righticon="false" data-state={verificationCode? 'focus':'default'} style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                          <input
                            type="text"
                            placeholder="_ _ _ _"
                            value={verificationCode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g,'').slice(0,4);
                              setVerificationCode(val);
                            }}
                            maxLength={4}
                            style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: verificationCode? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500, letterSpacing:'0.5em', textAlign:'center'}}
                          />
                        </div>
                      </div>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', textAlign: 'center'}}><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>Didn’t receive the code?</span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}> </span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word', cursor:'pointer'}}>Resend</span></div>
                      </div>
                    </div>
                    <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'flex'}}>
                      <div style={{alignSelf: 'stretch', paddingLeft: 70, paddingRight: 70, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Verify your phone number</div>
                        <div style={{textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>Please enter the code sent to your phone</div>
                      </div>
                      <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                        <div data-righticon="false" data-state={phoneVerificationCode? 'focus':'default'} style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                          <input
                            type="text"
                            placeholder="_ _ _ _"
                            value={phoneVerificationCode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g,'').slice(0,4);
                              setPhoneVerificationCode(val);
                            }}
                            maxLength={4}
                            style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: phoneVerificationCode? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500, letterSpacing:'0.5em', textAlign:'center'}}
                          />
                        </div>
                      </div>
                      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                        <div style={{alignSelf: 'stretch', textAlign: 'center'}}><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>Didn’t receive the code?</span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}> </span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word', cursor:'pointer'}}>Resend</span></div>
                      </div>
                    </div>
                    <div style={{textAlign: 'center'}}><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>By signing up, you agree to our </span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word'}}>Terms of Service</span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}> and </span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word'}}>Privacy Policy</span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>.</span></div>
                  </div>
                </div>
                <button 
                  onClick={closeSignUpModal}
                  style={{width: 32, height: 32, right: 32, top: 32, position: 'absolute', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                  <Image src="/material-symbols-close.svg" alt="Close" width={24} height={24} />
                </button>
                {(() => { const canProceed = verificationCode.length===4 && phoneVerificationCode.length===4; return (
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div 
                    onClick={()=> { if(canProceed){ setModalStep('livenessCheck'); } }}
                    style={{paddingLeft:16, paddingRight:16, paddingTop:10, paddingBottom:10, background: canProceed? 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)':'var(--Inactive-Blue, #B8C5D7)', borderRadius:12, justifyContent:'center', alignItems:'center', gap:8, display:'inline-flex', cursor: canProceed? 'pointer':'not-allowed'}}
                  >
                    <div style={{color:'white', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}>Continue</div>
                  </div>
                  <button 
                    onClick={() => setModalStep(selectedRole === 'investor' ? 'investorSignUp' : 'borrowerSignUp')}
                    style={{background:'transparent', border:'none', cursor:'pointer', color:'#4A5565', fontSize:12, fontFamily:'var(--ep-font-avenir)', fontWeight:400, textDecoration:'underline'}}
                  >
                    ← Back
                  </button>
                </div>
                ) })()}
              </div>
            )}

            {modalStep === 'livenessCheck' && (
              <div style={{width: '100%', height: '100%', paddingTop: 24, paddingBottom: 24, position: 'relative', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{alignSelf:'stretch', flexDirection:'column', justifyContent:'flex-start', alignItems:'flex-start', gap:4, display:'flex'}}>
                  <div style={{alignSelf:'stretch', textAlign:'center', color:'black', fontSize:24, fontFamily:'var(--ep-font-avenir)', fontWeight:500, wordWrap:'break-word'}}>Liveness check</div>
                </div>
                <div style={{alignSelf:'stretch', paddingLeft:200, paddingRight:200, flexDirection:'column', justifyContent:'center', alignItems:'center', gap:16, display:'flex'}}>
                  <div style={{alignSelf:'stretch', textAlign:'center', color:'black', fontSize:20, fontFamily:'var(--ep-font-avenir)', fontWeight:500, wordWrap:'break-word'}}>To start investing we need to verify that you’re a human.</div>
                </div>
                <button 
                  onClick={closeSignUpModal}
                  style={{width:32, height:32, right:32, top:32, position:'absolute', background:'transparent', border:'none', cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center'}}
                >
                  <Image src="/material-symbols-close.svg" alt="Close" width={24} height={24} />
                </button>
                <div style={{alignSelf:'stretch', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:10, display:'flex'}}>
                  <div onClick={()=> setModalStep('accountCreated')} data-left-icon="false" data-state="default" style={{paddingLeft:16, paddingRight:16, paddingTop:10, paddingBottom:10, background:'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)', borderRadius:12, outline:'1px var(--Light-Grey, #F4F4F4) solid', justifyContent:'center', alignItems:'center', gap:8, display:'inline-flex', cursor:'pointer'}}>
                    <div style={{color:'white', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}>Start the check</div>
                  </div>
                  <div data-left-icon="true" data-state="secondary" style={{paddingTop:8, paddingLeft:16, paddingRight:16, borderRadius:12, justifyContent:'center', alignItems:'center', gap:6, display:'inline-flex', cursor:'pointer'}}>
                    <div style={{color:'var(--Black, black)', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500, wordWrap:'break-word'}}>Skip for now</div>
                    <Image src="/skip.svg" alt="Skip" width={12} height={13} />
                  </div>
                </div>
              </div>
            )}

            {modalStep === 'emailVerification' && (
              <div style={{width: '100%', height: '100%', paddingTop: 24, paddingBottom: 24, position: 'relative', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Sign Up</div>
                  <div style={{alignSelf: 'stretch', textAlign: 'center'}}>
                    <span style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>{selectedRole === 'investor' ? 'Investor' : 'Borrower'}</span>
                    <span style={{color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}> </span>
                  </div>
                </div>
                <div style={{alignSelf: 'stretch', paddingLeft: 200, paddingRight: 200, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'flex'}}>
                    <div style={{alignSelf: 'stretch', paddingLeft: 70, paddingRight: 70, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex'}}>
                      <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Verify your email</div>
                      <div style={{textAlign: 'center', color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Please enter the code sent to your email</div>
                    </div>
                    <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                      <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                        <input
                          type="text"
                          placeholder="_ _ _ _"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          maxLength={4}
                          style={{
                            flex: '1 1 0',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: verificationCode ? 'black' : '#B2B2B2',
                            fontSize: 14,
                            fontFamily: 'var(--ep-font-avenir)',
                            fontWeight: '500',
                            letterSpacing: '0.5em',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                      <div style={{alignSelf: 'stretch', textAlign: 'center'}}>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>Didn&apos;t receive the code?</span>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}> </span>
                        <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word', cursor: 'pointer'}}>Resend</span>
                      </div>
                    </div>
                  </div>
                  <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                    <div style={{textAlign: 'center'}}>
                      <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>By signing up, you agree to our </span>
                      <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word'}}>Terms of Service</span>
                      <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}> and </span>
                      <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', textDecoration: 'underline', lineHeight: 1.67, wordWrap: 'break-word'}}>Privacy Policy</span>
                      <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 1.67, wordWrap: 'break-word'}}>.</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={closeSignUpModal}
                  style={{width: 32, height: 32, right: 32, top: 32, position: 'absolute', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                  <Image src="/material-symbols-close.svg" alt="Close" width={24} height={24} />
                </button>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <button 
                    onClick={() => {
                      console.log('Verification code:', verificationCode);
                      if(selectedRole === 'borrower') {
                        setModalStep('accountCreated');
                      } else {
                        setModalStep('livenessCheck');
                      }
                    }}
                    style={{
                      paddingLeft: 16, 
                      paddingRight: 16, 
                      paddingTop: 10, 
                      paddingBottom: 10, 
                      background: '#113D7B', 
                      borderRadius: 12, 
                      outline: '1px #F4F4F4 solid',
                      border: 'none',
                      cursor: 'pointer',
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: 8, 
                      display: 'inline-flex'
                    }}
                  >
                    <div style={{color: 'white', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Sign Up</div>
                  </button>
                  <button 
                    onClick={() => setModalStep(selectedRole === 'investor' ? 'investorSignUp' : 'borrowerSignUp')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#4A5565',
                      fontSize: 12,
                      fontFamily: 'var(--ep-font-avenir)',
                      fontWeight: '400',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {modalStep === 'accountCreated' && (
              <div style={{width:'100%', height:'100%', paddingTop:24, paddingBottom:24, position:'relative', flexDirection:'column', justifyContent:'space-between', alignItems:'center', display:'inline-flex'}}>
                <button
                  onClick={closeSignUpModal}
                  style={{width:32, height:32, right:32, top:32, position:'absolute', background:'transparent', border:'none', cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center'}}
                >
                  <Image src="/material-symbols-close.svg" alt="Close" width={24} height={24} />
                </button>
                {selectedRole === 'investor' ? (
                  <>
                    <div style={{alignSelf:'stretch', flexDirection:'column', justifyContent:'flex-start', alignItems:'flex-start', gap:4, display:'flex'}}>
                      <div style={{alignSelf:'stretch', textAlign:'center', color:'black', fontSize:24, fontFamily:'var(--ep-font-avenir)', fontWeight:500, wordWrap:'break-word'}}>Account successfully created</div>
                    </div>
                    <div style={{alignSelf:'stretch', paddingLeft:200, paddingRight:200, flexDirection:'column', justifyContent:'center', alignItems:'center', gap:16, display:'flex'}}>
                      <div style={{alignSelf:'stretch', textAlign:'center', color:'black', fontSize:20, fontFamily:'var(--ep-font-avenir)', fontWeight:500, wordWrap:'break-word'}}>To start investing please make your first deposit.</div>
                    </div>
                    <div style={{alignSelf:'stretch', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:10, display:'flex'}}>
                      <div data-left-icon="false" data-state="default" style={{paddingLeft:16, paddingRight:16, paddingTop:10, paddingBottom:10, background:'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)', borderRadius:12, outline:'1px var(--Light-Grey, #F4F4F4) solid', justifyContent:'center', alignItems:'center', gap:8, display:'inline-flex', cursor:'pointer'}}>
                        <div style={{color:'white', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500, wordWrap:'break-word'}}>Make a deposit</div>
                      </div>
                      <div data-left-icon="true" data-state="secondary" style={{paddingTop:8, paddingLeft:16, paddingRight:16, borderRadius:12, justifyContent:'center', alignItems:'center', gap:4, display:'inline-flex', cursor:'pointer'}}>
                        <div style={{color:'var(--Black, black)', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500, wordWrap:'break-word'}}>Skip for now</div>
                        <Image src="/skip.svg" alt="Skip" width={12} height={13} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{alignSelf:'stretch', flexDirection:'column', justifyContent:'flex-start', alignItems:'flex-start', gap:4, display:'flex'}}>
                      <div style={{alignSelf:'stretch', textAlign:'center', color:'black', fontSize:32, fontFamily:'var(--ep-font-avenir)', fontWeight:800, wordWrap:'break-word'}}>Welcome to EquiPool</div>
                    </div>
                    <div style={{alignSelf:'stretch', paddingLeft:160, paddingRight:160, flexDirection:'column', justifyContent:'center', alignItems:'center', gap:16, display:'flex'}}>
                      <div style={{alignSelf:'stretch', textAlign:'center', color:'#4A5565', fontSize:16, fontFamily:'var(--ep-font-avenir)', fontWeight:500, wordWrap:'break-word'}}>Your borrower account has been created successfully.</div>
                    </div>
                    <div style={{alignSelf:'stretch', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:10, display:'flex'}}>
                      <div onClick={closeSignUpModal} data-left-icon="false" data-state="default" style={{paddingLeft:16, paddingRight:16, paddingTop:10, paddingBottom:10, background:'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)', borderRadius:12, outline:'1px var(--Light-Grey, #F4F4F4) solid', justifyContent:'center', alignItems:'center', gap:8, display:'inline-flex', cursor:'pointer'}}>
                        <div style={{color:'white', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500, wordWrap:'break-word'}}>Continue</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

  </div>
  );
}