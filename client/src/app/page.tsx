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
          <div style={{textAlign: 'center', color: '#113D7B', fontSize: 20, fontFamily: 'Avenir', fontWeight: 800, wordWrap: 'break-word'}}>Welcome to EquiPool</div>
        </div>
        <div style={{width: 566, textAlign: 'center'}}>
          <span style={{color: 'black', fontSize: 48, fontFamily: 'Avenir', fontWeight: 400, wordWrap: 'break-word'}}>Your Property. Your Terms. </span>
          <span style={{color: 'black', fontSize: 48, fontFamily: 'Avenir', fontWeight: 800, wordWrap: 'break-word'}}>Your Capital.</span>
        </div>
        <div style={{alignSelf: 'stretch', textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'Avenir', fontWeight: 500, wordWrap: 'break-word'}}>
          Access fair, fast, and community-powered loans backed by real assets. Whether you’re borrowing or investing — our AI-powered platform gives you control, clarity, and confidence.
        </div>
        <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
          <div data-left-icon={true} data-state="default" style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
            <div data-icon="ic:handshake" style={{width: 24, height: 24, position: 'relative', overflow: 'hidden'}}>
              <div style={{width: 24, height: 18, left: 0, top: 3, position: 'absolute', background: 'var(--Light-Grey, #F4F4F4)'}} />
            </div>
            <div style={{color: 'white', fontSize: 16, fontFamily: 'Avenir', fontWeight: 500, wordWrap: 'break-word'}}>Button</div>
          </div>
          <div data-left-icon={true} data-state="default" style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 12, outline: '1px var(--Stroke-Grey, #E5E7EB) solid', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
            <div data-icon="ic:give" style={{width: 24, height: 24, position: 'relative', overflow: 'hidden'}}>
              <div style={{width: 21, height: 21, left: 1.5, top: 1.5, position: 'absolute', background: '#113D7B'}} />
            </div>
            <div style={{color: '#113D7B', fontSize: 16, fontFamily: 'Avenir', fontWeight: 500, wordWrap: 'break-word'}}>Button</div>
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
            <div style={{textAlign: 'center', color: '#113D7B', fontSize: 20, fontFamily: 'Avenir', fontWeight: 800, wordWrap: 'break-word'}}>Trusted by</div>
          </div>

          <div style={{display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'flex-start'}}>
            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'Avenir', fontWeight: 500}}>Escrow</div>
            </div>

            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'Avenir', fontWeight: 500}}>Title</div>
            </div>

            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'Avenir', fontWeight: 500}}>Logo 1</div>
            </div>

            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'Avenir', fontWeight: 500}}>Loan Service</div>
            </div>

            <div style={{padding: 40, background: '#FAFAFA', boxShadow: '0px 1px 0.5px rgba(29,41,61,0.02)', borderRadius: 26, outline: '1px #E5E7EB solid', outlineOffset: '-1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div style={{color: '#4A5565', fontSize: 16, fontFamily: 'Avenir', fontWeight: 500}}>Logo 1</div>
            </div>
          </div>
        </div>
      </div>
      {/* Value proposition - 10px below Trusted by */}
      <div style={{marginTop: 10}}>
        <div style={{width: '100%', height: '100%', paddingLeft: 180, paddingRight: 180, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'inline-flex', boxSizing: 'border-box'}}>
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div style={{color: '#113D7B', fontSize: 20, fontFamily: 'Avenir', fontWeight: '800', wordWrap: 'break-word'}}>Value proposition</div>
          </div>
          <div style={{width: 566, color: 'black', fontSize: 32, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Fair Capital for Real People</div>
          <div style={{width: 698, color: 'black', fontSize: 20, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>We eliminate middlemen, confusing terms, and bias. Whether you're a homeowner seeking refinancing or an investor looking for real-world returns.</div>
          <div style={{height: 460, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'inline-flex'}}>
            <div style={{width: 350, alignSelf: 'stretch', padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Investors</div>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Earn strong, asset-backed returns by funding vetted borrowers. Transparent data. Clear risks. Full control.</div>
              </div>
            </div>
            <div style={{width: 350, alignSelf: 'stretch', padding: 32, background: 'var(--Light-Grey, #F4F4F4)', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Borrowers</div>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Get access to competitive loan offers without banks, simplified  and straightforward paperwork, avoid vague approval criteria. <br/><br/>Your property speaks for itself.</div>
              </div>
            </div>
            <div style={{width: 350, alignSelf: 'stretch', padding: 32, background: '#F4F4F4', overflow: 'hidden', borderRadius: 24, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10, display: 'inline-flex'}}>
              <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 24, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>Built-In Intelligence</div>
                <div style={{alignSelf: 'stretch', color: 'black', fontSize: 14, fontFamily: 'Avenir', fontWeight: '500', wordWrap: 'break-word'}}>AI verifies documents, suggests ROI ranges, and flags inconsistencies — so you can move faster with confidence.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
