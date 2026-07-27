'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { logout } from '@/redux/features/auth/authSlice';
import { baseApi } from '@/redux/api/baseApi';

const adminNavItems = [
  { name: 'Overview', href: '/admin', icon: 'nav_dashboard' },
  { name: 'Partners', href: '/admin/partners', icon: 'nav_account' },
  { name: 'Projects', href: '/admin/projects', icon: 'nav_dashboard' },
  { name: 'Pricing', href: '/admin/pricing', icon: 'nav_account' },
  { name: 'Settings', href: '/admin/settings', icon: 'nav_account' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
    }
    dispatch(baseApi.util.resetApiState());
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/admin" className="brand" aria-label="Rhino Air Admin">
            <img className="brand-logo" src="/logo.png" alt="Rhino Air" />
            <span className="portal-tag">Admin Portal</span>
          </Link>
          <nav className="nav" aria-label="Primary">
            {adminNavItems.map((item) => {
              // Exact match for /admin, prefix match for others
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);
              const Icon = Icons[item.icon as keyof typeof Icons];
              return (
                <Link key={item.name} href={item.href} className={isActive ? 'active' : ''}>
                  {Icon && <Icon />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
              className="avatar" 
              title={user?.name || 'Admin'} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ cursor: 'pointer' }}
            >
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            
            {isDropdownOpen && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0, 
                marginTop: '8px',
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px',
                zIndex: 100,
                minWidth: '140px'
              }}>
                <a 
                  href="#" 
                  onClick={handleSignOut} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    fontFamily: "'Sometype Mono', monospace", 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: '#b3261e', 
                    textDecoration: 'none', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.08em',
                    borderRadius: '6px',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--paper-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="wrap">
        {children}
      </main>
      <footer>RHINO AIR &middot; ADMIN DASHBOARD</footer>
    </>
  );
}
