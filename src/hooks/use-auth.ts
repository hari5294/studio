
'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, useMockData } from '@/lib/mock-data';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

type UseAuthOptions = {
  required?: boolean;
};

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { users, loading: mockDataLoading } = useMockData();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // In a real app, you'd check a token in localStorage, etc.
    // For this mock, we'll see if a user is "logged in" via localStorage
    const loggedInUserEmail = typeof window !== 'undefined' ? localStorage.getItem('loggedInUser') : null;
    
    if (loggedInUserEmail) {
      const foundUser = users.find(u => u.email === loggedInUserEmail);
      setUser(foundUser || null);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [users]);

  useEffect(() => {
    if (loading || mockDataLoading) return;

    const isAuthPage = ['/login', '/signup'].includes(pathname);

    if (options.required && !user && !isAuthPage) {
      router.push('/login');
    }

    if (user && (isAuthPage || pathname === '/')) {
      router.push('/dashboard');
    }
  }, [user, loading, mockDataLoading, pathname, router, options.required]);

  const login = (email: string) => {
    const foundUser = users.find(u => u.email === email);
    if(foundUser) {
        localStorage.setItem('loggedInUser', email);
        setUser(foundUser);
        router.push('/dashboard');
    } else {
        // In a real app, you'd show an error. Here we'll just fail silently for simplicity.
        console.error("User not found in mock data");
    }
  };

  const logout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    router.push('/login');
  };

  return { user, loading: loading || mockDataLoading, login, logout };
}

    