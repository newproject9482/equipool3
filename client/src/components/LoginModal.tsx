"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSuccess: (role: 'borrower' | 'investor') => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitchToSignUp, onSuccess, showSuccess, showError }) => {
  const [role, setRole] = useState<'borrower' | 'investor'>('borrower');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { emailInputRef.current?.focus(); }, []);

  const canLogin = email.length > 0 && password.length > 0;
  const [submitting, setSubmitting] = useState(false);
  const handleLogin = async () => {
    if(!canLogin || submitting) return;
    setSubmitting(true);
    try {
      const endpoint = role === 'borrower' ? '/api/borrowers/login' : '/api/investors/login';
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${endpoint}`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(()=>({}));
      if(!res.ok){
        showError(data.error || 'Login failed');
      } else {
        if (typeof window !== 'undefined') localStorage.setItem('ep-auth','1');
        showSuccess(`Welcome back! You have successfully logged in as ${role}.`);
        onSuccess(role);
        onClose();
      }
    } catch (e: unknown){
      const errorMessage = e instanceof Error ? e.message : 'Network error';
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
      zIndex: 1100
    }}>
      <div style={{
        width: 760,
        height: 580,
        background: 'white',
        borderRadius: 24,
        position: 'relative',
        boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)',
        paddingTop: 44,
        paddingBottom: 44,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{width: '100%', height: '100%', position: 'relative', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 70, display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>Log In</div>
          <div style={{alignSelf: 'stretch', paddingLeft: 200, paddingRight: 200, paddingTop: 10, paddingBottom: 10, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div style={{alignSelf: 'stretch', height: 320, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 48, display: 'flex'}}>
              <div style={{padding: 4, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 30, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                <div onClick={() => setRole('borrower')} style={{paddingLeft: 20, paddingRight: 20, paddingTop: 12, paddingBottom: 12, background: role==='borrower'? 'var(--White, white)':'transparent', borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', cursor:'pointer'}}>
                  <div style={{textAlign: 'center', color: role==='borrower'? 'black':'#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}>Borrower</div>
                </div>
                <div onClick={() => setRole('investor')} style={{paddingLeft: 20, paddingRight: 20, paddingTop: 12, paddingBottom: 12, background: role==='investor'? 'var(--White, white)':'transparent', borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', cursor:'pointer'}}>
                  <div style={{textAlign: 'center', color: role==='investor'? 'black':'#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}}>Investor</div>
                </div>
              </div>
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
                <div data-righticon="false" data-state={email? 'focus':'default'} style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                  <input
                    ref={emailInputRef}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: email? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}
                  />
                </div>
                <div data-righticon="true" data-state="password" style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
                  <input
                    type={showPassword? 'text':'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    style={{flex:'1 1 0', background:'transparent', border:'none', outline:'none', color: password? 'black':'#B2B2B2', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}
                  />
                  <button
                    type="button"
                    onClick={()=> setShowPassword(p=>!p)}
                    style={{background:'transparent', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', justifyContent:'center'}}
                    aria-label={showPassword? 'Hide password':'Show password'}
                  >
                    <Image src="/show_password.svg" alt="Toggle" width={16} height={16} />
                  </button>
                </div>
              </div>
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                <div style={{alignSelf: 'stretch', textAlign: 'center'}}>
                  <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, lineHeight: '20px'}}>New Here?</span>
                  <span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, lineHeight: '20px'}}> </span>
                  <span onClick={()=> { onClose(); onSwitchToSignUp(); }} style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 800, textDecoration: 'underline', lineHeight: '20px', cursor:'pointer'}}>Create an account</span>
                </div>
                <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'var(--Grey, #767676)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, textDecoration: 'underline', lineHeight: '20px', cursor:'pointer'}}>Forgot password?</div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{width:32, height:32, right:32, top:32, position:'absolute', background:'transparent', border:'none', cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center'}}
          >
            <Image src="/material-symbols-close.svg" alt="Close" width={24} height={24} />
          </button>
          <div 
            data-left-icon="false" 
            data-state={canLogin? 'active':'inactive'} 
            style={{paddingLeft:16, paddingRight:16, paddingTop:10, paddingBottom:10, background: canLogin? 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)':'var(--Inactive-Blue, #B8C5D7)', opacity: submitting? 0.7:1, borderRadius:12, justifyContent:'center', alignItems:'center', gap:8, display:'inline-flex', cursor: canLogin? 'pointer':'not-allowed'}}
            onClick={handleLogin}
          >
            <div style={{color:'white', fontSize:14, fontFamily:'var(--ep-font-avenir)', fontWeight:500}}>{submitting? 'Logging in...':'Login'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
