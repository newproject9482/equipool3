import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="ep-nav-brand">EquiPool</span>

          <nav className="hidden md:flex items-center gap-6">
            <a className="ep-nav-link">About Us</a>
            <a className="ep-nav-link">Security</a>
            <a className="ep-nav-link">Learn</a>
            <span className="px-2 py-1 rounded bg-gray-100 ep-nav-soon">Soon</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <a className="ep-nav-login">Login</a>
          <button className="ep-cta-join">Join Equipool</button>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start gap-8">
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
          <div data-left-icon={true} data-state="default" style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
            <Image src="/icons.svg" alt="Handshake icon" width={24} height={24} />
            <div style={{color: 'white', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>Button</div>
          </div>
          <div data-left-icon={true} data-state="default" style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
            <Image src="/invest.svg" alt="Investment icon" width={24} height={24} />
            <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500, wordWrap: 'break-word'}}>Button</div>
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
      {/* Value proposition - 10px below Trusted by */}
      <div style={{marginTop: 10}}>
        <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex', boxSizing: 'border-box'}}>
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '800', wordWrap: 'break-word'}}>Value proposition</div>
          </div>
          <div style={{width: 566, color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Fair Capital for Real People</div>
          <div style={{width: 698, color: 'black', fontSize: 20, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>We eliminate middlemen, confusing terms, and bias. Whether you're a homeowner seeking refinancing or an investor looking for real-world returns.</div>
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

    <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 80, display: 'inline-flex'}}>
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
    <div style={{alignSelf: 'stretch', height: 238, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex'}}>
        <div style={{width: 56, height: 56, padding: 8, background: '#ECECEC', overflow: 'hidden', borderRadius: 30, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div style={{width: 16, height: 6, outline: '2px black solid', outlineOffset: '-1px'}} />
          <div style={{width: 6, height: 6, outline: '2px black solid', outlineOffset: '-1px'}} />
        </div>
        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
          <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Receive funding</div>
          <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}> When funded, money is disbursed through escrow and your repayment schedule begins.</div>
        </div>
      </div>
      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex'}}>
        <div style={{width: 56, height: 56, padding: 8, background: '#ECECEC', overflow: 'hidden', borderRadius: 30, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div style={{width: 16, height: 6, outline: '2px black solid', outlineOffset: '-1px'}} />
          <div style={{width: 6, height: 6, outline: '2px black solid', outlineOffset: '-1px'}} />
        </div>
        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
          <div style={{color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Submit property & loan request</div>
          <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Add property details, upload optional documents, and set your loan amount, term, and preferred ROI.</div>
        </div>
      </div>
      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex'}}>
        <div style={{width: 56, height: 56, padding: 8, background: '#ECECEC', overflow: 'hidden', borderRadius: 30, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div style={{width: 16, height: 6, outline: '2px black solid', outlineOffset: '-1px'}} />
          <div style={{width: 6, height: 6, outline: '2px black solid', outlineOffset: '-1px'}} />
        </div>
        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
          <div style={{color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Get AI support & approval</div>
          <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Add property details, upload optional documents, and set your loan amount, term, and preferred ROI.</div>
        </div>
      </div>
      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex'}}>
        <div style={{width: 56, height: 56, padding: 8, background: '#ECECEC', overflow: 'hidden', borderRadius: 30, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div style={{width: 16, height: 6, outline: '2px black solid', outlineOffset: '-1px'}} />
          <div style={{width: 6, height: 6, outline: '2px black solid', outlineOffset: '-1px'}} />
        </div>
        <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
          <div style={{color: 'black', fontSize: 24, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Launch your pool</div>
          <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Once approved, your loan pool is live and visible to investors.</div>
        </div>
      </div>
    </div>
  </div>
</div>

  {/* F.A.Q section */}
  <div style={{width: '100%', height: '100%', paddingTop: 10, paddingBottom: 10, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, display: 'inline-flex'}}>
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
  <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'inline-flex'}}>
  <div style={{width: 1090, height: 422, padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 32, outline: '1px #E5E7EB solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, display: 'flex'}}>
    <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 32, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Start building your wealth today</div>
    <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
      <div data-left-icon="true" data-state="default" style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
        <Image src="/icons.svg" alt="Handshake icon" width={24} height={24} />
        <div style={{color: 'white', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Button</div>
      </div>
      <div data-left-icon="true" data-state="default" style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
        <Image src="/invest.svg" alt="Investment icon" width={24} height={24} />
        <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'var(--ep-font-avenir)', fontWeight: '500', wordWrap: 'break-word'}}>Button</div>
      </div>
    </div>
  </div>
  </div>

  {/* Footer section */}
  <div style={{width: '100%', height: '100%', paddingTop: 32, paddingBottom: 32, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 48, display: 'inline-flex'}}>
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
                <div style={{width: 24, height: 24, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 20, height: 20, left: 2, top: 2, position: 'absolute', background: '#4A5565'}} />
                </div>
                <div style={{width: 24, height: 24, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 20, height: 19.95, left: 2, top: 2, position: 'absolute', background: '#4A5565'}} />
                </div>
                <div style={{width: 24, height: 24, position: 'relative', overflow: 'hidden'}}>
                    <div style={{width: 18, height: 18, left: 3, top: 3, position: 'absolute', background: '#4A5565'}} />
                </div>
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

  </div>
  );
}

