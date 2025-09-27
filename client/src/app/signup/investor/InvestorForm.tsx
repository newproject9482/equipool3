"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// A lightweight reusable input wrapper to reduce inline style duplication
const Field: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {wrapperStyle?: React.CSSProperties}> = ({wrapperStyle, ...props}) => {
  return (
    <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex', ...(wrapperStyle||{})}}>
      <input
        {...props}
        style={{
          flex: '1 1 0',
          background: 'transparent',
          border: 'none',
            outline: 'none',
          color: props.value ? 'black' : '#B2B2B2',
          fontSize: 14,
          fontFamily: 'var(--ep-font-avenir)',
          fontWeight: 500
        }}
      />
    </div>
  );
};

type InvestorField = 'fullName' | 'dob' | 'email' | 'phone' | 'ssn' | 'address1' | 'address2' | 'city' | 'state' | 'zip' | 'country' | 'password' | 'repeat' | 'acceptedTerms';

export const InvestorForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    dob: '',
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
    repeat: ''
  });

  const [touched, setTouched] = useState<Partial<Record<InvestorField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Error state management similar to main page
  const [investorErrors, setInvestorErrors] = useState<string[]>([]);
  const [showInvestorErrors, setShowInvestorErrors] = useState(false);
  const update = (k: InvestorField, v: string) => {
    setForm(f => ({...f, [k]: v}));
    setTouched(t => ({...t, [k]: true}));
    // Do not show the consolidated error area while typing; only after submit attempt
  };

  // Dedicated handler for terms checkbox to mark touched consistently
  const handleAcceptedTermsChange = (checked: boolean) => {
    setAcceptedTerms(checked);
    setTouched(t => ({...t, acceptedTerms: true}));
    // Do not trigger global error display here
  };

  // Validators
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isAdult18 = (isoDate: string) => {
    if (!isoDate) return false;
    const d = new Date(isoDate + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age >= 18;
  };

  type ErrorMap = Partial<Record<InvestorField, string[]>>;
  const US_STATE_CODES = new Set([
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
  ]);
  
  const computeInvestorErrorsByField = (): ErrorMap => {
    const errs: ErrorMap = {};
    // fullName (require first and last)
    const name = form.fullName.trim();
    if (!name) {
      errs.fullName = ['Full name is required'];
    } else {
      const parts = name.split(/\s+/).filter(Boolean);
      const messages: string[] = [];
      if (parts.length < 2) messages.push('Please enter your full name (first and last)');
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]{2,255}$/.test(name)) {
        messages.push('Name contains invalid characters');
      }
      if (messages.length) errs.fullName = messages;
    }
    // email
    if (!isValidEmail(form.email)) {
      errs.email = ['Valid email required'];
    } else if (emailAvailable === false) {
      errs.email = ['Email already registered'];
    }
    // dob
    if (!form.dob) {
      errs.dob = ['Date of birth is required'];
    } else if (!isAdult18(form.dob)) {
      errs.dob = ['You must be at least 18 years old'];
    }
    // phone (digits only, length 10)
    if (!form.phone) {
      errs.phone = ['Phone number is required'];
    } else if (!/^\d{10}$/.test(form.phone)) {
      errs.phone = ['Enter a 10-digit phone number'];
    }
    // ssn (digits only, length 9)
    if (!form.ssn) {
      errs.ssn = ['SSN is required'];
    } else if (!/^\d{9}$/.test(form.ssn)) {
      errs.ssn = ['Enter a 9-digit SSN'];
    }
    // address1
    if (!form.address1) errs.address1 = ['Address is required'];
    // city (letters, spaces, hyphens and apostrophes)
    if (!form.city) {
      errs.city = ['City is required'];
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]{2,}$/.test(form.city.trim())) {
      errs.city = ['City contains invalid characters'];
    }
    // state (US 2-letter code)
    if (!form.state) {
      errs.state = ['State is required'];
    } else if (!US_STATE_CODES.has(form.state.trim().toUpperCase())) {
      errs.state = ['Enter a valid 2-letter US state code'];
    }
    // zip (5 digits)
    if (!form.zip) {
      errs.zip = ['ZIP code is required'];
    } else if (!/^\d{5}$/.test(form.zip)) {
      errs.zip = ['Enter a 5-digit ZIP code'];
    }
    // country
    if (!form.country) errs.country = ['Country is required'];
    // password + repeatPassword
    const pwMessages: string[] = [];
    if (!form.password || form.password.length < 8) pwMessages.push('Password must be at least 8 characters');
    if (pwMessages.length) errs.password = pwMessages;
    if (form.password !== form.repeat) {
      errs.repeat = ['Passwords do not match'];
    }
    // terms
    if (!acceptedTerms) {
      errs.acceptedTerms = ['You must agree to the Terms of Service and Privacy Policy'];
    }
    return errs;
  };

  const flattenErrors = (map: ErrorMap, onlyFields?: InvestorField[]) => {
    const entries = Object.entries(map) as [InvestorField, string[]][];
    return entries
      .filter(([field]) => !onlyFields || onlyFields.includes(field))
      .flatMap(([, msgs]) => msgs || []);
  };

  // Recompute investor errors when relevant state changes,
  // but only after the user has interacted or submit attempt happened.
  useEffect(() => {
    const map = computeInvestorErrorsByField();
    if (submitAttempted || showInvestorErrors) {
      // After submit attempt (or if explicitly enabled), show all errors
      setInvestorErrors(flattenErrors(map));
    } else {
      // Before submit, keep the consolidated error list hidden
      setInvestorErrors([]);
    }
  }, [form, acceptedTerms, showInvestorErrors, submitAttempted, emailAvailable]);

  // Field-level error helper (mirror borrower UX)
  const errorsByField = computeInvestorErrorsByField();
  const fieldHasError = (field: InvestorField) => !!errorsByField[field] && (showInvestorErrors || touched[field] || submitAttempted);

  // Re-evaluate ability to continue without forcing errors to display
  const investorCanContinue = (() => {
    // Basic form completeness check - don't validate here, just check if fields are filled
    const basicFieldsFilled = !!(
      form.fullName && 
      form.dob && 
      form.email && 
      form.phone && 
      form.ssn && 
      form.address1 && 
      form.city && 
      form.state && 
      form.zip && 
      form.country && 
      form.password && 
      form.repeat && 
      acceptedTerms
    );
    
    // Don't prevent submission based on validation errors - let handleSubmit show them
    return basicFieldsFilled;
  })();

  // Debounced email availability check
  useEffect(() => {
    let active = true;
    const email = form.email.trim();
    if (!isValidEmail(email)) { setEmailAvailable(null); return; }
    setCheckingEmail(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/validate/email?email=${encodeURIComponent(email)}`, { signal: controller.signal });
        const data = await res.json().catch(()=>({available:null}));
        if (!active) return;
        if (typeof data.available === 'boolean') setEmailAvailable(data.available);
        else setEmailAvailable(null);
      } catch {
        if (active) setEmailAvailable(null);
      } finally {
        if (active) setCheckingEmail(false);
      }
    }, 350);
    return () => { active = false; controller.abort(); clearTimeout(t); };
  }, [form.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // On attempt to submit, if errors exist, show them and stop
    const map = computeInvestorErrorsByField();
    const allErrs = flattenErrors(map);
    setInvestorErrors(allErrs);
    if (allErrs.length > 0) {
      setShowInvestorErrors(true);
      setSubmitAttempted(true);
      // Also mark all fields as touched to surface all messages
      setTouched({ 
        fullName: true, 
        dob: true, 
        email: true, 
        phone: true, 
        ssn: true, 
        address1: true, 
        address2: true, 
        city: true, 
        state: true, 
        zip: true, 
        country: true, 
        password: true, 
        repeat: true, 
        acceptedTerms: true 
      });
      return;
    }
    
    setSubmitAttempted(true);
    // Submit to backend
    try {
      const payload = {
        fullName: form.fullName,
        dateOfBirth: form.dob,
        email: form.email,
        phone: form.phone,
        ssn: form.ssn,
        address1: form.address1,
        address2: form.address2,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        password: form.password,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/investors/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(()=>({}));
      if(!res.ok){
        // Surface server error into form error area
        const serverError = data.error || 'Signup failed';
        setInvestorErrors(prev => Array.from(new Set([...(prev||[]), serverError])));
        setShowInvestorErrors(true);
        alert(serverError);
        return;
      }
      // Success: redirect to investor pools page
      alert('Investor account created! Welcome to EquiPool!');
      router.push('/pools-investor');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Network error';
      // Surface server error into form error area
      setInvestorErrors(prev => Array.from(new Set([...(prev||[]), errorMessage])));
      setShowInvestorErrors(true);
      alert(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'row', gap: 10}}>
      <div style={{height: 320, paddingTop: 8, paddingBottom: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 48, display: 'inline-flex'}}>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
          <Field placeholder="Full name" value={form.fullName} onChange={e=>update('fullName', e.target.value)} wrapperStyle={{ outline: fieldHasError('fullName') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('fullName') ? '-1px' : undefined }} />
          <Field type="date" placeholder="Date of Birth" value={form.dob} onChange={e=>update('dob', e.target.value)} wrapperStyle={{ outline: fieldHasError('dob') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('dob') ? '-1px' : undefined }} />
          <div style={{display:'flex', flexDirection:'column', gap:4}}>
            <Field type="email" placeholder="Email" value={form.email} onChange={e=>update('email', e.target.value)} wrapperStyle={{ outline: fieldHasError('email') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('email') ? '-1px' : undefined }} />
            {(touched.email || submitAttempted) && (
              <div style={{fontSize:12, fontFamily:'var(--ep-font-avenir)'}}>
                {!isValidEmail(form.email) ? (
                  <span style={{color:'#cc4747'}}>Valid email required</span>
                ) : checkingEmail ? (
                  <span style={{color:'#767676'}}>Checking availability…</span>
                ) : emailAvailable === false ? (
                  <span style={{color:'#cc4747'}}>Email already registered</span>
                ) : null}
              </div>
            )}
          </div>
          <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex', outline: fieldHasError('phone') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('phone') ? '-1px' : undefined}}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Phone Number"
              aria-label="Phone Number"
              value={form.phone}
              onChange={(e)=>{
                const digits = e.target.value.replace(/[^0-9]/g,'');
                update('phone', digits);
              }}
              onPaste={(e)=>{
                e.preventDefault();
                const text = e.clipboardData.getData('text');
                const digits = text.replace(/[^0-9]/g,'');
                update('phone', digits);
              }}
              onKeyDown={(e)=>{
                const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
                if(allowed.includes(e.key)) return;
                if(!/^[0-9]$/.test(e.key)) e.preventDefault();
              }}
              style={{flex: '1 1 0', background: 'transparent', border: 'none', outline: 'none', color: form.phone? 'black':'#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}
            />
          </div>
          {/* SSN contextual field */}
          <div data-righticon="true" data-state="contextualized" style={{width: 322, padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex', outline: fieldHasError('ssn') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('ssn') ? '-1px' : undefined}}>
            <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--White, white)', borderRadius: 10, outline: '1px var(--Grey, #767676) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <input placeholder="SSN" inputMode="numeric" pattern="\d*" maxLength={9}
                value={form.ssn}
                onChange={e=>{
                  const digits = e.target.value.replace(/[^0-9]/g,'').slice(0,9);
                  update('ssn', digits);
                }}
                style={{flex: '1 1 0', background: 'transparent', border: 'none', outline: 'none', color: form.ssn? 'black': '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}} />
            </div>
            <div style={{alignSelf: 'stretch', paddingLeft: 8, paddingRight: 8, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, lineHeight: 2, wordWrap: 'break-word'}}>Used for identity and investor risk verification</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{height: 320, paddingTop: 8, paddingBottom: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 48, display: 'inline-flex'}}>
        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
          <Field placeholder="Address Line 1" value={form.address1} onChange={e=>update('address1', e.target.value)} wrapperStyle={{ outline: fieldHasError('address1') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('address1') ? '-1px' : undefined }} />
          <Field placeholder="Address Line 2" value={form.address2} onChange={e=>update('address2', e.target.value)} wrapperStyle={{ outline: fieldHasError('address2') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('address2') ? '-1px' : undefined }} />
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
            <Field placeholder="City" value={form.city} onChange={e=>update('city', e.target.value)} wrapperStyle={{flex: '1 1 0', outline: fieldHasError('city') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('city') ? '-1px' : undefined}} />
            <Field placeholder="State" value={form.state} onChange={e=>{
              const letters = e.target.value.replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,2);
              update('state', letters);
            }} wrapperStyle={{flex: '1 1 0', outline: fieldHasError('state') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('state') ? '-1px' : undefined}} />
          </div>
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
            <Field placeholder="Zip Code" value={form.zip} onChange={e=>{
              const digits = e.target.value.replace(/[^0-9]/g,'').slice(0,5);
              update('zip', digits);
            }} wrapperStyle={{flex: '1 1 0', outline: fieldHasError('zip') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('zip') ? '-1px' : undefined}} />
            <Field placeholder="United States" value={form.country} onChange={e=>update('country', e.target.value)} wrapperStyle={{flex: '1 1 0', outline: fieldHasError('country') ? '1px var(--Error, #CC4747) solid' : '1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset: '-1px'}} />
          </div>
          <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex', outline: fieldHasError('password') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('password') ? '-1px' : undefined}}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e=>update('password', e.target.value)}
              style={{flex: '1 1 0', background: 'transparent', border: 'none', outline: 'none', color: form.password? 'black': '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}
            />
            <button type="button" onClick={()=>setShowPassword(p=>!p)} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'}}>
              <Image src="/show_password.svg" alt="Toggle password visibility" width={16} height={16} />
            </button>
          </div>
          <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex', outline: fieldHasError('repeat') ? '1px var(--Error, #CC4747) solid' : undefined, outlineOffset: fieldHasError('repeat') ? '-1px' : undefined}}>
            <input
              type={showRepeatPassword ? 'text' : 'password'}
              placeholder="Repeat"
              value={form.repeat}
              onChange={e=>update('repeat', e.target.value)}
              style={{flex: '1 1 0', background: 'transparent', border: 'none', outline: 'none', color: form.repeat? 'black': '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}
            />
            <button type="button" onClick={()=>setShowRepeatPassword(p=>!p)} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'}}>
              <Image src="/show_password.svg" alt="Toggle password visibility" width={16} height={16} />
            </button>
          </div>
          {/* Investor error list right under the second password field */}
          {investorErrors.length > 0 && (submitAttempted || showInvestorErrors) && (
            <div style={{marginTop: 8, textAlign: 'left', alignSelf: 'stretch'}}>
              {investorErrors.map((err, idx) => (
                <div key={idx} style={{color: '#cc4747', fontSize: 12, fontFamily: 'var(--ep-font-avenir)'}}>{err}</div>
              ))}
            </div>
          )}
        </div>
      </div>
  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8, alignSelf: 'stretch'}}>
        {/* Terms of Service Checkbox */}
        <div style={{display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8}}>
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => handleAcceptedTermsChange(e.target.checked)}
            style={{cursor: 'pointer'}}
          />
          <div style={{fontSize: 12, fontFamily: 'var(--ep-font-avenir)', color: 'black', fontWeight: 400}}>
            I agree to the <span style={{textDecoration: 'underline'}}>Terms of Service</span> and <span style={{textDecoration: 'underline'}}>Privacy Policy</span>
          </div>
        </div>
        
        <button disabled={!investorCanContinue} type="submit" style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: investorCanContinue? 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)' : 'var(--Inactive-Blue, #B8C5D7)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'inline-flex', border: 'none', cursor: investorCanContinue? 'pointer':'not-allowed'}}>
          <div style={{color: 'white', fontSize: 14, fontFamily: 'Avenir', fontWeight: 500, wordWrap: 'break-word'}}>Continue</div>
        </button>

        {/* Error list moved under the second password field to preserve layout */}
      </div>
    </form>
  );
};

export default InvestorForm;
