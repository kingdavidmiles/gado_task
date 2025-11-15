'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ClientHeaderManager() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session and listen for auth changes
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    checkAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Task Manager
        </Link>

        {isLoading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        ) : user ? (
          <div className="flex items-center gap-4">
            {/* Create Task button */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-create-task-modal'));
              }}
              className="px-4 py-2 text-primary-foreground bg-primary text-sm font-medium rounded-md hover:bg-primary/80 transition-colors"
            >
              + Create Task
            </button>

            {/* Show email + Logout */}
            <span className="text-gray-700 font-medium">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
