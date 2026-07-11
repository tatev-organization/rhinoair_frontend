'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { useLoginMutation } from '@/redux/features/auth/authApi';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSent, setIsForgotSent] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      await login({ email, password }).unwrap();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.data?.message || 'Invalid email or password.');
    }
  };

  const handleSendReset = () => {
    if (!forgotEmail) return;
    setIsForgotSent(true);
  };

  return (
    <>
      <div className="preview-ribbon" aria-hidden="true">
        <span>Preview</span>
      </div>
      <div className="login-wrap">
        <div className="login-card">
          <img className="login-logo" src="/logo.png" alt="Rhino Air" />
          <div className="login-tag">Partner Portal</div>
          <div className="login-h">Partner Sign In</div>
          <div className="login-sub">For Rhino Air GC & developer partners</div>
          
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Email</label>
              <input 
                id="loginEmail" 
                type="email" 
                placeholder="you@company.com" 
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input 
                id="loginPassword" 
                type="password" 
                placeholder="••••••••" 
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="login-forgot">
              <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotModalOpen(true); }}>
                Forgot password?
              </a>
            </div>
            {error && (
              <div id="loginErr" style={{ display: 'block', color: '#b3261e', fontSize: '13px', margin: '-4px 0 12px', lineHeight: 1.4 }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary login-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in \u2192'}
            </button>
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px' }}>
              <Link href="/register" style={{ color: 'var(--rhino)', fontWeight: 700, textDecoration: 'none' }}>Don't have an account? Apply here</Link>
            </div>
          </form>
          
          <div className="login-foot">
            Access is invite-only. Need help?<br/>
            <a href="mailto:info@rhinoair.com">info@rhinoair.com</a> &middot; <a href="tel:8185358888">818-535-8888</a>
          </div>
        </div>
      </div>

      <Modal isOpen={isForgotModalOpen} onClose={() => { setIsForgotModalOpen(false); setIsForgotSent(false); }} title="Reset your password">
        {!isForgotSent ? (
          <div id="forgotForm">
            <p className="forgot-intro">Enter the email on your account and we&rsquo;ll send you a link to reset your password.</p>
            <div className="field">
              <label>Email</label>
              <input 
                type="email" 
                id="forgotEmail" 
                placeholder="you@company.com" 
                autoComplete="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setIsForgotModalOpen(false)}>Cancel</button>
              <button className="btn-dark" onClick={handleSendReset}>Send reset link</button>
            </div>
          </div>
        ) : (
          <div id="forgotMsg" className="forgot-msg" style={{ display: 'block' }}>
            <div className="forgot-ok">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4 10-10" stroke="#5a9e2f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="forgot-intro" style={{ textAlign: 'center' }}>
              If an account exists for <b>{forgotEmail || 'that email'}</b>, a password reset link is on its way. Check your inbox.
            </p>
            <button className="btn-dark" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsForgotModalOpen(false)}>
              Done
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
