'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Set token in API client
        apiClient.setToken(session.access_token);
        
        // Fetch user profile from our API
        apiClient.getUser(session.user.id)
          .then((fullUser) => {
            setUser(fullUser);
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching user data:', error);
            // If fetch fails, try to use basic info from Supabase user
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              first_name: session.user.user_metadata?.first_name || '',
              last_name: session.user.user_metadata?.last_name || '',
              role: (session.user.user_metadata?.role as 'user' | 'admin') || 'user',
            });
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        apiClient.setToken(session.access_token);
        // Fetch user profile
        apiClient.getUser(session.user.id)
          .then((fullUser) => {
            setUser(fullUser);
          })
          .catch(() => {
            // Use basic info from Supabase
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              first_name: session.user.user_metadata?.first_name || '',
              last_name: session.user.user_metadata?.last_name || '',
              role: (session.user.user_metadata?.role as 'user' | 'admin') || 'user',
            });
          });
      } else {
        apiClient.setToken(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    // Use Supabase Auth for login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      // Set token in API client
      apiClient.setToken(data.session.access_token);
      
      // Fetch user profile from our API
      const fullUser = await apiClient.getUser(data.user.id);
      setUser(fullUser);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // Use Supabase Auth for registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'user',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session && data.user) {
      // Set token in API client
      apiClient.setToken(data.session.access_token);
      
      const userId = data.user.id; // Store userId to avoid TypeScript null check issues
      
      // Fetch user profile from our API (after backend creates it)
      // Wait a bit for backend to create the profile
      setTimeout(async () => {
        try {
          const fullUser = await apiClient.getUser(userId);
          setUser(fullUser);
        } catch {
          // If profile not ready yet, use basic info
          setUser({
            id: userId,
            email: data.user?.email || '',
            first_name: firstName,
            last_name: lastName,
            role: 'user',
          });
        }
      }, 500);
    } else if (data.user) {
      // Email confirmation required
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        first_name: firstName,
        last_name: lastName,
        role: 'user',
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    apiClient.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

