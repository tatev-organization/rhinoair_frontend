'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'nav_dashboard' },
  { name: 'Projects', href: '/projects', icon: 'nav_projects' },
  { name: 'Invoices', href: '/invoices', icon: 'nav_invoices' },
  { name: 'Tools', href: '/tools', icon: 'nav_tools' },
  { name: 'Account', href: '/account', icon: 'nav_account' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  narrow?: boolean;
}

export function AppLayout({ children, narrow = false }: AppLayoutProps) {
  const pathname = usePathname();

  // Note: the original portal Python app redirects / to /login, so dashboard starts at /dashboard
  // The user avatar and company names are hardcoded for now until Auth is integrated
  if (pathname === '/calculator') {
    return <>{children}</>;
  }

  return (
    <>
      {/* <div className="preview-ribbon" aria-hidden="true">
        <span>Preview</span>
      </div> */}
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/dashboard" className="brand" aria-label="Rhino Air home">
            <img className="brand-logo" src="/logo.png" alt="Rhino Air" />
            <span className="portal-tag">Partner Portal</span>
          </Link>
          <nav className="nav" aria-label="Primary">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const Icon = Icons[item.icon as keyof typeof Icons];
              return (
                <Link key={item.name} href={item.href} className={isActive ? 'active' : ''}>
                  {Icon && <Icon />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <Link href="/account" className="avatar" id="navAvatar" title="Mid Construction Group">
            MC
          </Link>
        </div>
      </header>
      <main className={`wrap ${narrow ? 'wrap-narrow' : ''}`}>
        {children}
      </main>
      <footer>RHINO AIR &middot; LICENSE C20-1142997 &middot; CONFIDENTIAL PARTNER PORTAL</footer>
    </>
  );
}
