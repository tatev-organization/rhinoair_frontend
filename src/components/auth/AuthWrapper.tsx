'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useGetMeQuery } from '@/redux/features/auth/authApi';
import { logout, setCredentials } from '@/redux/features/auth/authSlice';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/verify'];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const reduxToken = useSelector((state: RootState) => state.auth.token);

  // Sync localStorage → Redux on first mount (handles page refresh)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('accessToken');
    if (stored && !reduxToken) {
      dispatch(setCredentials({ accessToken: stored }));
    }
    setHydrated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const token = reduxToken || (hydrated ? null : undefined);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Only validate token on protected routes (avoids blocking public pages)
  const { error, isLoading, isFetching } = useGetMeQuery(reduxToken ?? undefined, {
    skip: !reduxToken || isPublicRoute,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (isPublicRoute) {
      // Public route: if token exists → go to dashboard immediately, no need to wait for getMe
      if (reduxToken) {
        router.replace('/dashboard');
      } else {
        setIsReady(true);
      }
      return;
    }

    // Protected route: wait for getMe to resolve before deciding
    if (isLoading || isFetching) return;

    if (!reduxToken) {
      router.replace('/login');
      return;
    }

    if (error) {
      dispatch(logout());
      router.replace('/login');
      return;
    }

    setIsReady(true);
  }, [hydrated, reduxToken, error, isLoading, isFetching, isPublicRoute, router, dispatch]);

  // Show spinner while:
  // - localStorage hasn't been read yet (hydration)
  // - On a protected route waiting for getMe
  // - Redirecting (not yet ready)
  if (!hydrated || (!isReady && !isPublicRoute)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f9fa' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#1a6634', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
