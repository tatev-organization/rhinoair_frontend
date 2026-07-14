'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const adminNavItems = [
  { name: 'Overview', href: '/admin', icon: 'nav_dashboard' },
  { name: 'Partners', href: '/admin/partners', icon: 'nav_account' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/admin" className="brand" aria-label="Rhino Air Admin">
            <img className="brand-logo" src="/logo.png" alt="Rhino Air" />
            <span className="portal-tag" style={{ background: '#3b82f6' }}>Admin Portal</span>
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
          <div className="avatar" title={user?.name || 'Admin'}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
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
