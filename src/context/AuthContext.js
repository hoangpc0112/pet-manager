import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  observeAuthState,
  resendSignUpEmailOtp,
  requestSignUpEmailOtp,
  signInWithEmail,
  signOutCurrentUser,
  updateCurrentUserProfile,
  verifySignUpEmailOtp
} from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((nextUser) => {
      setCurrentUser(nextUser);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user: currentUser,
      isAuthenticated: Boolean(currentUser),
      isAuthLoading,
      signIn: signInWithEmail,
      signOut: signOutCurrentUser,
      updateUserProfile: updateCurrentUserProfile,
      requestSignUpOtp: requestSignUpEmailOtp,
      resendSignUpOtp: resendSignUpEmailOtp,
      verifySignUpOtp: verifySignUpEmailOtp
    }),
    [currentUser, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
