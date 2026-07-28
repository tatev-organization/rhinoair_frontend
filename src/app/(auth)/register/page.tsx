'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { useRegisterMutation, useVerifyOtpMutation } from '@/redux/features/auth/authApi';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });
  const [error, setError] = useState('');
  
  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // API Mutations
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.zip) {
      setError('Please fill in all fields to complete registration.');
      return;
    }

    try {
      await register(formData).unwrap();
      // On success, redirect to login directly
      alert('Registration successful! You can now login.');
      router.push('/login');
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to register. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Please enter a valid 6-digit OTP code.');
      return;
    }

    try {
      await verifyOtp({ email: formData.email, otp: otpCode }).unwrap();
      // On success, close modal and redirect to login
      setIsOtpModalOpen(false);
      router.push('/login');
    } catch (err: any) {
      setOtpError(err?.data?.message || 'Invalid OTP code. Please try again.');
    }
  };

  return (
    <>
      {/* <div className="preview-ribbon" aria-hidden="true">
        <span>Preview</span>
      </div> */}
      <div className="login-wrap" style={{ alignItems: 'flex-start', padding: '40px 24px', overflowY: 'auto' }}>
        <div className="login-card" style={{ margin: 'auto', maxWidth: '500px' }}>
          <img className="login-logo" src="/logo.png" alt="Rhino Air" />
          <div className="login-tag">Partner Portal</div>
          <div className="login-h">Apply for an Account</div>
          <div className="login-sub">Create your Rhino Air partner account</div>
          
          <form onSubmit={handleRegister}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Company Name</label>
                <input 
                  name="name" 
                  type="text" 
                  placeholder="ABC Construction" 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Phone Number</label>
                <input 
                  name="phone" 
                  type="text" 
                  placeholder="(555) 123-4567" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Email</label>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="you@company.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Password</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="field">
              <label>Street Address</label>
              <input 
                name="street" 
                type="text" 
                placeholder="123 Main St" 
                value={formData.street}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="field" style={{ flex: 2 }}>
                <label>City</label>
                <input 
                  name="city" 
                  type="text" 
                  placeholder="Los Angeles" 
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>State</label>
                <input 
                  name="state" 
                  type="text" 
                  placeholder="CA" 
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="field" style={{ flex: 1.5 }}>
                <label>ZIP Code</label>
                <input 
                  name="zip" 
                  type="text" 
                  placeholder="90001" 
                  value={formData.zip}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {error && (
              <div id="loginErr" style={{ display: 'block', color: '#b3261e', fontSize: '13px', margin: '-4px 0 12px', lineHeight: 1.4 }}>
                {error}
              </div>
            )}
            
            <button type="submit" className="btn-primary login-btn" disabled={isRegistering}>
              {isRegistering ? 'Registering...' : 'Create Account \u2192'}
            </button>
            
            <div className="login-forgot" style={{ marginTop: '15px', textAlign: 'center' }}>
              <Link href="/login">Already have an account? Sign in</Link>
            </div>
          </form>
          
          <div className="login-foot">
            Access is invite-only. Need help?<br/>
            <a href="mailto:info@rhinoair.com">info@rhinoair.com</a> &middot; <a href="tel:8185358888">818-535-8888</a>
          </div>
        </div>
      </div>

      <Modal isOpen={isOtpModalOpen} onClose={() => {}} title="Verify Your Email">
        <div id="forgotForm">
          <p className="forgot-intro">We've sent a 6-digit OTP code to <b>{formData.email}</b>. Please enter it below to verify your account.</p>
          <div className="field">
            <label>OTP Code</label>
            <input 
              type="text" 
              placeholder="123456" 
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}
            />
          </div>
          {otpError && (
            <div style={{ display: 'block', color: '#b3261e', fontSize: '13px', margin: '-4px 0 12px', lineHeight: 1.4 }}>
              {otpError}
            </div>
          )}
          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <button className="btn-dark" onClick={handleVerifyOtp} disabled={isVerifying} style={{ width: '100%', justifyContent: 'center' }}>
              {isVerifying ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
