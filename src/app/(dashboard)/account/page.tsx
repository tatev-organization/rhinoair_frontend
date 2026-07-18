'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/redux/features/auth/authSlice';

export default function AccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <div style={{maxWidth:'880px'}}>
      <a className="backlink" href="/dashboard">
        <svg viewBox="0 0 24 24" fill="none" style={{width:14,height:14}}>
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Dashboard
      </a>

      {/* Account header */}
      <div className="acct-header">
        <div className="acct-avatar" id="acctAvatar">MC</div>
        <div>
          <h1 id="acctCompany">Mid Construction Group</h1>
          <div className="since" id="acctSince">Partner since 2024</div>
        </div>
      </div>

      {/* Tier card */}
      <div className="tier-card">
        <div className="tc-left">
          <div className="tc-lbl">
            <Icons.trophy />
            Pricing tier
          </div>
          <div className="tc-tier">Tier <span id="acctTier">4</span></div>
          <div className="tc-meta">15+ projects per year</div>
        </div>
        <div className="tc-note">
          <Icons.lock style={{width:24,height:24,display:'inline-block',marginBottom:'7px'}} />
          <br/>
          Tier is set by Rhino Air based on annual volume. Contact your rep about volume pricing.
        </div>
      </div>

      {/* Company Details */}
      <div className="card">
        <div className="card-title">Company Details</div>
        <div className="field">
          <label>Company name</label>
          <input id="fCompany" defaultValue="Mid Construction Group" />
        </div>
        <div className="field">
          <label>Address</label>
          <input id="fAddress" defaultValue="9100 Wilshire Blvd, Beverly Hills, CA 90212" />
        </div>
        <div className="sec-actions">
          <button className="btn-ghost" onClick={() => alert('Company details saved')}>Save changes</button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card">
        <div className="card-title">Contact Information</div>
        <div className="grid-2">
          <div className="field">
            <label>Contact name</label>
            <input id="fContact" defaultValue="David Mirzakhanian" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input id="fPhone" defaultValue="(310) 555-0148" />
          </div>
        </div>
        <div className="field">
          <label>Email</label>
          <input id="fEmail" defaultValue="david@midconstruction.com" />
        </div>
        <div className="sec-actions">
          <button className="btn-ghost" onClick={() => alert('Contact information saved')}>Save changes</button>
        </div>
      </div>

      {/* Rhino Air Rep */}
      <div className="card">
        <div className="card-title">Your Rhino Air Rep</div>
        <div className="rep-card">
          <div className="rep-photo">
            <div className="rp-img">SY</div>
          </div>
          <div className="rep-info">
            <div className="rep-name">Sam Yaghobi</div>
            <div className="rep-role">Project Manager</div>
          </div>
        </div>
        <a className="contact-line" href="tel:+18189004007">
          <Icons.phone style={{width:15,height:15}} />
          818-900-4007
        </a>
        <a className="contact-line" href="mailto:sam.yaghobi@rhinoair.com">
          <Icons.mail style={{width:15,height:15}} />
          sam.yaghobi@rhinoair.com
        </a>
      </div>

      {/* Rhino Air Office */}
      <div className="card">
        <div className="card-title">Rhino Air Office</div>
        <div className="office-row">
          <span className="office-ico">
            <Icons.office />
          </span>
          <div>
            <a className="contact-line" href="tel:+18185358888" style={{marginTop:0}}>
              <Icons.phone style={{width:15,height:15}} />
              818-535-8888
            </a>
            <a className="contact-line" href="mailto:info@rhinoair.com">
              <Icons.mail style={{width:15,height:15}} />
              info@rhinoair.com
            </a>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <div className="card-title">Login &amp; Security</div>
        <div className="sec-actions">
          <button className="btn-ghost" onClick={() => alert('Opening password change')}>Change password</button>
          <button 
            className="btn-ghost danger" 
            onClick={() => {
              dispatch(logout());
              router.push('/login');
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
