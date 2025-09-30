"use client";
import React from 'react';
import InvestorForm from './InvestorForm';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function InvestorSignupPage() {
  const router = useRouter();
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'white'}}>
      <header style={{padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontFamily: 'var(--ep-font-avenir)', fontWeight: 800, fontSize: 24, color: '#113D7B', cursor: 'pointer'}} onClick={()=>router.push('/')}>EquiPool</div>
        <div style={{display: 'flex', gap: 16}}>
          <button onClick={()=>router.push('/')} style={{background: 'transparent', border: 'none', fontFamily: 'var(--ep-font-avenir)', fontSize: 14, fontWeight: 500, cursor: 'pointer'}}>Home</button>
        </div>
      </header>
      <main style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 32}}>
        <div style={{width: 720, background: 'white', borderRadius: 24, position: 'relative'}}>
          <div style={{width: '100%', height: '100%', position: 'relative', background: 'white', overflow: 'hidden', borderRadius: 24}}>
            <div style={{width: 722, height: 640, paddingTop: 44, paddingBottom: 44, left: -2, top: 0, position: 'relative', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
                <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>Sign Up</div>
                <div style={{alignSelf: 'stretch', textAlign: 'center', color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>Investor</div>
              </div>
              <div style={{alignSelf: 'stretch', height: 455, paddingLeft: 80, paddingRight: 80, paddingTop: 8, paddingBottom: 8, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
                {/* Individual / Company toggle placeholder */}
                <div style={{padding: 4, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 30, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
                  <div style={{paddingLeft: 20, paddingRight: 20, paddingTop: 12, paddingBottom: 12, background: 'var(--White, white)', borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{textAlign: 'center', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>Individual</div>
                  </div>
                  <div style={{paddingLeft: 10, paddingRight: 10, paddingTop: 12, paddingBottom: 12, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div style={{textAlign: 'center', color: '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>Company</div>
                  </div>
                </div>
                <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
                  <InvestorForm />
                </div>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex', alignSelf: 'stretch'}}>
                  <div style={{textAlign: 'center'}}><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, lineHeight: '20px', wordWrap: 'break-word'}}>By signing up, you agree to our </span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word'}}>Terms of Service</span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, lineHeight: '20px', wordWrap: 'break-word'}}> and </span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word'}}>Privacy Policy</span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, lineHeight: '20px', wordWrap: 'break-word'}}>.</span></div>
                  <div style={{alignSelf: 'stretch', textAlign: 'center'}}><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, lineHeight: '20px', wordWrap: 'break-word'}}>Already have an account?</span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, lineHeight: '20px', wordWrap: 'break-word'}}> </span><span style={{color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 800, textDecoration: 'underline', lineHeight: '20px', wordWrap: 'break-word'}}>Log In</span></div>
                </div>
              </div>
              <button onClick={()=>router.push('/')} style={{width: 32, height: 32, position: 'absolute', right: 32, top: 32, background: 'transparent', border: 'none', cursor: 'pointer'}}>
                <Image src="/material-symbols-close.svg" width={24} height={24} alt="Close" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
