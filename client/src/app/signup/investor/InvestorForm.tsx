"use client";
import React, { useState } from 'react';
import Image from 'next/image';

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

export const InvestorForm: React.FC = () => {
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

  const update = (k: string, v: string) => setForm(f => ({...f, [k]: v}));

  const canSubmit = form.fullName && form.email && form.password && form.password === form.repeat;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!canSubmit) return;
    console.log('Submit investor form', form);
    // TODO: hook into API
  };

  return (
    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'row', gap: 10}}>
      <div style={{height: 320, paddingTop: 8, paddingBottom: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 48, display: 'inline-flex'}}>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
          <Field placeholder="Full name" value={form.fullName} onChange={e=>update('fullName', e.target.value)} />
          <Field placeholder="Date of Birth" value={form.dob} onChange={e=>update('dob', e.target.value)} />
          <Field type="email" placeholder="Email" value={form.email} onChange={e=>update('email', e.target.value)} />
          <Field placeholder="Phone Number" value={form.phone} onChange={e=>update('phone', e.target.value)} />
          {/* SSN contextual field */}
          <div data-righticon="true" data-state="contextualized" style={{width: 322, padding: 8, background: 'var(--Light-Grey, #F4F4F4)', borderRadius: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
            <div style={{alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, background: 'var(--White, white)', borderRadius: 10, outline: '1px var(--Grey, #767676) solid', outlineOffset: '-1px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <input placeholder="SSN" value={form.ssn} onChange={e=>update('ssn', e.target.value)} style={{flex: '1 1 0', background: 'transparent', border: 'none', outline: 'none', color: form.ssn? 'black': '#B2B2B2', fontSize: 14, fontFamily: 'var(--ep-font-avenir)', fontWeight: 500}} />
            </div>
            <div style={{alignSelf: 'stretch', paddingLeft: 8, paddingRight: 8, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
              <div style={{flex: '1 1 0', color: 'var(--Black, black)', fontSize: 12, fontFamily: 'var(--ep-font-avenir)', fontWeight: 400, lineHeight: 2, wordWrap: 'break-word'}}>Used for identity and investor risk verification</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{height: 320, paddingTop: 8, paddingBottom: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 48, display: 'inline-flex'}}>
        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
          <Field placeholder="Address Line 1" value={form.address1} onChange={e=>update('address1', e.target.value)} />
          <Field placeholder="Address Line 2" value={form.address2} onChange={e=>update('address2', e.target.value)} />
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
            <Field placeholder="City" value={form.city} onChange={e=>update('city', e.target.value)} wrapperStyle={{flex: '1 1 0'}} />
            <Field placeholder="State" value={form.state} onChange={e=>update('state', e.target.value)} wrapperStyle={{flex: '1 1 0'}} />
          </div>
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'inline-flex'}}>
            <Field placeholder="Zip Code" value={form.zip} onChange={e=>update('zip', e.target.value)} wrapperStyle={{flex: '1 1 0'}} />
            <Field placeholder="United States" value={form.country} onChange={e=>update('country', e.target.value)} wrapperStyle={{flex: '1 1 0', outline: '1px var(--Mid-Grey, #B2B2B2) solid', outlineOffset: '-1px'}} />
          </div>
          <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
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
          <div style={{width: 322, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#F4F4F4', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex'}}>
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
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
        <button disabled={!canSubmit} type="submit" style={{paddingLeft: 16, paddingRight: 16, paddingTop: 10, paddingBottom: 10, background: canSubmit? 'linear-gradient(128deg, #113D7B 0%, #0E4EA8 100%)' : 'var(--Inactive-Blue, #B8C5D7)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, display: 'inline-flex', border: 'none', cursor: canSubmit? 'pointer':'not-allowed'}}>
          <div style={{color: 'white', fontSize: 14, fontFamily: 'Avenir', fontWeight: 500, wordWrap: 'break-word'}}>Continue</div>
        </button>
      </div>
    </form>
  );
};

export default InvestorForm;
