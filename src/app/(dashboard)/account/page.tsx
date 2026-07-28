'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '@/redux/features/auth/authSlice';
import { useGetMeQuery } from '@/redux/features/auth/authApi';
import { baseApi } from '@/redux/api/baseApi';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

export default function AccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  
  const { data: userProfile } = useGetMeQuery(undefined);
  const company = userProfile?.data?.company || userProfile?.company;
  const user = userProfile?.data || userProfile;

  const companyName = company?.name || 'Company Name';
  const tier = company?.tier || 4;
  const address = company?.address || '';
  const contactName = company?.contactName || user?.name || '';
  const email = user?.email || '';
  const phone = company?.repPhone || user?.phone || '';
  const partnerSince = company?.partnerSince ? new Date(company.partnerSince).getFullYear() : new Date().getFullYear();

  const handleSignOut = () => {
    setIsSigningOut(true);
    
    // Completely terminate session
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
    }
    
    // Clear Redux state & RTK Query cache
    dispatch(baseApi.util.resetApiState());
    dispatch(logout());
    
    // Force a full browser redirect to wipe memory completely
    window.location.href = '/login';
  };

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
        <div className="acct-avatar" id="acctAvatar">
          {companyName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 id="acctCompany">{companyName}</h1>
          <div className="since" id="acctSince">Partner since {partnerSince}</div>
        </div>
      </div>

      {/* Tier card */}
      <div className="tier-card">
        <div className="tc-left">
          <div className="tc-lbl">
            <Icons.trophy />
            Pricing tier
          </div>
          <div className="tc-tier">Tier <span id="acctTier">{tier}</span></div>
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
          <input id="fCompany" defaultValue={companyName} readOnly />
        </div>
        <div className="field">
          <label>Address</label>
          <input id="fAddress" defaultValue={address} readOnly />
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
            <input id="fContact" defaultValue={contactName} readOnly />
          </div>
          <div className="field">
            <label>Phone</label>
            <input id="fPhone" defaultValue={phone} readOnly />
          </div>
        </div>
        <div className="field">
          <label>Email</label>
          <input id="fEmail" defaultValue={email} readOnly />
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
          <button className="btn-ghost" onClick={() => setIsChangePasswordOpen(true)}>Change password</button>
          <button 
            className="btn-ghost danger" 
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </div>
  );
}
