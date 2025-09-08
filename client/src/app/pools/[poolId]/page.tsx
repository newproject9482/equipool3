'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function PoolDetailPage() {
  const params = useParams();
  const poolId = params?.poolId as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/me`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled && data.authenticated) {
            setIsAuthenticated(true);
          }
          return;
        }
      } catch (error) {
        // Ignore auth check errors
      }
      // Fallback to localStorage
      if (!cancelled && typeof window !== 'undefined' && localStorage.getItem('ep-auth') === '1') {
        setIsAuthenticated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setShowProfileMenu(false);
      if (typeof window !== 'undefined') localStorage.removeItem('ep-auth');
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
                    <button style={{all: 'unset', alignSelf: 'stretch', color: 'black', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem" onClick={() => window.location.href = '/pools'}>Pools & Dashboard</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#B2B2B2', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem">Profile</button>
                    <button style={{all: 'unset', alignSelf: 'stretch', color: '#CC4747', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, cursor: 'pointer'}} role="menuitem" onClick={handleLogout}>Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="ep-nav-login" style={{cursor: 'pointer'}}>Login</button>
              <button className="ep-cta-join" onClick={() => window.location.href = '/'}>Join Equipool</button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{width: '100%', maxWidth: 1440, margin: '0 auto', padding: '40px 20px'}}>
        <div style={{width: '100%', height: '100%', paddingTop: 120, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
          <div style={{alignSelf: 'stretch', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
            {/* Breadcrumb */}
            <div style={{alignSelf: 'stretch', paddingBottom: 16}}>
              <div>
                <span style={{color: 'var(--Mid-Grey, #B2B2B2)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Pools & Dashboard </span>
                <span style={{color: 'var(--Black, black)', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}> &gt; Pool #{poolId}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
              alignSelf: 'stretch',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 32,
              display: 'flex',
              paddingBottom: 24,
              borderBottom: '1px solid #E5E7EB'
            }}>
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
                  $350 000
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
                      $350 000
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
                      12% / 24 Months
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
                      Equity pool
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
                      123 Main Street, San Diego, CA, USA
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
                      Jane Hudson
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
                      cursor: 'pointer'
                    }}>
                      https://www.zillow.com/asdadasss...
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
                      $ 350 000
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
                      $ 150 000
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
                      70% Owned
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
                <button style={{
                  padding: '12px 24px',
                  background: 'white',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  display: 'flex',
                  cursor: 'pointer'
                }}>
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
                <button style={{
                  padding: '12px 24px',
                  background: '#CC4747',
                  borderRadius: 12,
                  border: 'none',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  display: 'flex',
                  cursor: 'pointer'
                }}>
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
                      You'll be notified once it's ready to share with investors.
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
                    <button style={{
                      padding: '12px 24px',
                      background: 'white',
                      borderRadius: 12,
                      border: '1px solid #E5E7EB',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 8,
                      display: 'flex',
                      cursor: 'pointer'
                    }}>
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
                    <button style={{
                      padding: '12px 24px',
                      background: '#CC4747',
                      borderRadius: 12,
                      border: 'none',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 8,
                      display: 'flex',
                      cursor: 'pointer'
                    }}>
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
                      You'll be notified once it's ready to share with investors.
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
                          alert('Successfully subscribed to newsletter!');
                          setNewsletterEmail('');
                        } else {
                          alert('Please enter a valid email address');
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
    </div>
  );
}
