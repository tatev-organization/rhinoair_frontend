'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated (using token from localStorage)
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // Render a minimal loading state with Rhino Air colors while redirecting
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#091316' }}>
      <div style={{ color: '#E1E9E7', fontFamily: 'sans-serif' }}>Loading...</div>
    </div>
  );
}
