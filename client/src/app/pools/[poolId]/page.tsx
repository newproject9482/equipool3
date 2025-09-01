'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

export default function PoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const poolId = params.poolId as string;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowProfileMenu(false);
    router.push('/');
  };

  const handleNotifications = () => {
    alert('Notifications placeholder');
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <div style={{width: '100%', minHeight: '100vh', background: 'white'}}>
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <Image src="/logo-icon.svg" alt="EquiPool Logo" width={26} height={27} />
          <span className="ep-nav-brand">EquiPool</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a className="ep-nav-link" style={{cursor: 'pointer'}} onClick={() => router.push('/')}>About Us</a>
          <a className="ep-nav-link" style={{cursor: 'pointer'}} onClick={() => router.push('/')}>Security</a>
          <div className="flex items-center gap-2">
            <a className="ep-nav-link" style={{cursor: 'pointer'}} onClick={() => alert('Learn section coming soon!')}>Learn</a>
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
                onClick={handleNotifications}
                aria-label="Notifications"
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
                    <button style={{all: 'unset', alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem" onClick={() => router.push('/pools')}>Pools & Dashboard</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#B2B2B2', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem">Profile</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#CC4747', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem" onClick={handleLogout}>Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="ep-nav-login" onClick={() => setShowLoginModal(true)} style={{cursor: 'pointer'}}>Login</button>
              <button className="ep-cta-join" onClick={() => router.push('/')} style={{cursor: 'pointer'}}>Join Equipool</button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{width: '100%', paddingTop: 40, paddingBottom: 80, display: 'flex', justifyContent: 'center'}}>
        <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
          {/* Breadcrumb */}
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div>
              <span 
                style={{
                  color: 'var(--Mid-Grey, #B2B2B2)', 
                  fontSize: 16, 
                  fontFamily: 'var(--ep-font-avenir)', 
                  fontWeight: '500', 
                  wordWrap: 'break-word',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => router.push('/pools')}
              >
                Pools & Dashboard 
              </span>
              <span style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>&gt; Pool #{poolId}</span>
            </div>
          </div>

          {/* Page Header */}
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'inline-flex'}}>
            <div 
              style={{
                color: activeTab === 'overview' ? '#113D7B' : 'var(--Mid-Grey, #B2B2B2)', 
                fontSize: 20, 
                fontFamily: 'var(--ep-font-avenir)', 
                fontWeight: '800', 
                wordWrap: 'break-word',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </div>
            <div 
              style={{
                color: activeTab === 'documents' ? '#113D7B' : 'var(--Mid-Grey, #B2B2B2)', 
                fontSize: 20, 
                fontFamily: 'var(--ep-font-avenir)', 
                fontWeight: activeTab === 'documents' ? '800' : '500', 
                wordWrap: 'break-word',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('documents')}
            >
              Assigned Documents
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' ? (
            <>
              {/* Pool Details Content */}
              <div style={{width: 1090, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'inline-flex'}}>
                <div style={{width: '100%', height: '100%', padding: 32, background: 'var(--White, white)', overflow: 'hidden', borderRadius: 24, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 40, display: 'inline-flex'}}>
                  {/* Pool Details Screenshot */}
                  <Image 
                    src="/pool_details.png" 
                    alt="Pool Details" 
                    width={1200} 
                    height={1000}
                    quality={100}
                    priority={true}
                    style={{
                      maxWidth: '100%', 
                      height: 'auto',
                      imageRendering: 'crisp-edges'
                    } as React.CSSProperties}
                    unoptimized={true}
                  />
                </div>
              </div>

              {/* Second Pool Details Screenshot - No Container */}
              <div style={{width: 1090, justifyContent: 'center', alignItems: 'center', display: 'flex', marginTop: 20}}>
                <Image 
                  src="/pool_details2.png" 
                  alt="Pool Details Activity" 
                  width={1200} 
                  height={1000}
                  quality={100}
                  priority={true}
                  style={{
                    maxWidth: '100%', 
                    height: 'auto',
                    imageRendering: 'crisp-edges'
                  } as React.CSSProperties}
                  unoptimized={true}
                />
              </div>
            </>
          ) : (
            <>
              {/* Assigned Documents Content */}
              <div style={{width: 1090, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'inline-flex'}}>
                <div style={{width: '100%', height: '100%', padding: 32, background: 'var(--White, white)', overflow: 'hidden', borderRadius: 24, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 40, display: 'inline-flex'}}>
                  {/* Assigned Documents Screenshot */}
                  <Image 
                    src="/assigned_documents.png" 
                    alt="Assigned Documents" 
                    width={1200} 
                    height={1000}
                    quality={100}
                    priority={true}
                    style={{
                      maxWidth: '100%', 
                      height: 'auto',
                      imageRendering: 'crisp-edges'
                    } as React.CSSProperties}
                    unoptimized={true}
                  />
                </div>
              </div>

              {/* Second Pool Details Screenshot - No Container */}
              <div style={{width: 1090, justifyContent: 'center', alignItems: 'center', display: 'flex', marginTop: 20}}>
                <Image 
                  src="/pool_details2.png" 
                  alt="Pool Details Activity" 
                  width={1200} 
                  height={1000}
                  quality={100}
                  priority={true}
                  style={{
                    maxWidth: '100%', 
                    height: 'auto',
                    imageRendering: 'crisp-edges'
                  } as React.CSSProperties}
                  unoptimized={true}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
