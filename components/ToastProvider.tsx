'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export default function ToastProvider() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const handleToast = (e: CustomEvent) => {
      const { type, message } = e.detail;
      if (type === 'success') {
        toast.success(message);
      } else if (type === 'error') {
        toast.error(message);
      }
    };

    window.addEventListener('show-toast', handleToast as EventListener);
    return () => {
      window.removeEventListener('show-toast', handleToast as EventListener);
    };
  }, []);

  if (!isClient) return null;

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
