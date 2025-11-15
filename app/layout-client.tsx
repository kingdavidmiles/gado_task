'use client';

import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import ClientHeaderManager from '../components/ClientHeaderManager';
import ToastProvider from '@/components/ToastProvider';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setIsMounted(true);
    
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Don't show header on auth pages
  const showHeader = !['/login', '/signup'].includes(pathname || '') && isAuthenticated;

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <>
      {showHeader && <ClientHeaderManager />}
      <main className="flex-1">{children}</main>
      <ToastProvider />
    </>
  );
}
