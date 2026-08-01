import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup', onAuthSuccess?: () => void) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  pendingDemoBooking: boolean;
  setPendingDemoBooking: (pending: boolean) => void;
  requireAuthForDemo: (onSuccess: () => void) => boolean;
  handleAuthSuccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pendingDemoBooking, setPendingDemoBooking] = useState<boolean>(false);

  // Fetch or construct student profile
  const fetchStudentProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data && !error) {
        setStudentProfile(data as StudentProfile);
      } else {
        // Fallback to user metadata
        setStudentProfile({
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Student',
          email: currentUser.email || '',
          phone: currentUser.user_metadata?.phone || '',
        });
      }
    } catch {
      setStudentProfile({
        id: currentUser.id,
        full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Student',
        email: currentUser.email || '',
        phone: currentUser.user_metadata?.phone || '',
      });
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchStudentProfile(session.user);
      } else {
        setStudentProfile(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchStudentProfile(session.user);
      } else {
        setStudentProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin', onAuthSuccess?: () => void) => {
    setAuthModalMode(mode);
    if (onAuthSuccess) {
      setPendingAction(() => onAuthSuccess);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Called after successful signin/signup
  const handleAuthSuccess = () => {
    closeAuthModal();
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setStudentProfile(null);
  };

  const requireAuthForDemo = (onSuccess: () => void): boolean => {
    if (user) {
      onSuccess();
      return true;
    } else {
      setPendingDemoBooking(true);
      openAuthModal('signup', () => {
        setPendingDemoBooking(false);
        onSuccess();
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        studentProfile,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signOut,
        pendingDemoBooking,
        setPendingDemoBooking,
        requireAuthForDemo,
        handleAuthSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
