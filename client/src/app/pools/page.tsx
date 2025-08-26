'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const LoginModal = dynamic(() => import('../../components/LoginModal'), { ssr: false });

export default function PoolsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'borrower' | 'investor' | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setSelectedRole(data.role);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setSelectedRole(null);
      setShowProfileMenu(false);
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon.svg" alt="EquiPool Logo" width={26} height={27} />
          <a href="/" className="ep-nav-brand" style={{ textDecoration: 'none' }}>EquiPool</a>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a className="ep-nav-link">About Us</a>
          <a className="ep-nav-link">Security</a>
          <a className="ep-nav-link">Learn</a>
          <span className="px-2 py-1 rounded bg-gray-100 ep-nav-soon">Soon</span>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
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
                    <button style={{all: 'unset', alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem">Pools & Dashboard</button>
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
      <main style={{width: 1440, height: 515}}>
        <div style={{width: '100%', height: '100%', paddingTop: 120, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Pools & Dashboard /</div>
            </div>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'Avenir', fontWeight: '800', wordWrap: 'break-word'}}>Overview</div>
            </div>
            <div style={{width: 1090, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'inline-flex'}}>
              <div style={{flex: '1 1 0', height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Total Borrowed</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 48, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>$1 285 000</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>(i) Total amount you've received across all funded pools.</div>
                </div>
              </div>
              <div style={{flex: '1 1 0', height: 280, padding: 32, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Next Payment</div>
                </div>
                <div style={{alignSelf: 'stretch', flex: '1 1 0', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'var(--Black, black)', fontSize: 24, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>July 12</div>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 48, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>$7843.32</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>(i) Your upcoming repayment amount and due date.</div>
                </div>
              </div>
              <div style={{height: 280, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Active pools</div>
                </div>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 48, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>2</div>
                </div>
                <div style={{width: 286, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>(i) Number of currently running loans.</div>
                </div>
              </div>
            </div>
            <div style={{alignSelf: 'stretch', paddingLeft: 40, paddingRight: 40, paddingTop: 24, paddingBottom: 24, background: '#E4EFFF', overflow: 'hidden', borderRadius: 24, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
              <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
                <div style={{flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{color: 'black', fontSize: 32, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Create a pool</div>
                </div>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div style={{color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Start a new funding request backed by your property.<br/>Define your loan amount, term, and target return — we'll guide you from there.</div>
                </div>
              </div>
              <div data-icon="ic:x" style={{width: 40, height: 40, position: 'relative', background: 'white', overflow: 'hidden', borderRadius: 40}}>
                <div style={{width: 25, height: 25, left: 7.50, top: 7.50, position: 'absolute', background: 'var(--Black, black)'}} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{marginTop: 160}}>
        <div style={{width: '100%', height: '100%', paddingTop: 10, paddingBottom: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, display: 'inline-flex'}}>
          <div style={{width: 1080, color: '#4A5565', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: '400', lineHeight: 2, wordWrap: 'break-word'}}>
            Security & Legal Equipool is a private lending marketplace that connects individual borrowers and accredited investors through secured, property-backed loans. All identities are verified, and sensitive data is encrypted and stored securely in compliance with GDPR and other data privacy regulations. Equipool is not a licensed financial institution. We partner with third-party financial service providers to process payments and hold funds in escrow. All lending agreements are executed via legally binding contracts reviewed by independent legal partners. Investments made through Equipool are not insured by any government protection scheme. As with any private loan, the value of your investment can go up or down — you may lose part or all of your invested capital. © 2025 Equipool. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignUp={() => { setShowLoginModal(false); window.location.href = '/'; }}
          onSuccess={(role) => { setIsAuthenticated(true); setSelectedRole(role); setShowLoginModal(false); }}
        />
      )}
    </div>
  );
}
