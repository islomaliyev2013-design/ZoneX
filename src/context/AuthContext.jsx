import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProfilesFromCloud, saveProfileToCloud } from '../services/supabaseService';
import { supabase } from '../lib/supabase';

const ACCOUNTS_KEY = 'ps_accounts_v1';
const CURRENT_USER_KEY = 'ps_current_user_v1';

const DEFAULT_ADMIN = {
  id: 'account_admin',
  username: 'admin',
  password: 'admin123',
  fullName: 'Administrator',
  email: 'admin@gmail.com',
  role: 'admin',
  createdAt: 1731140000000,
};

const DEFAULT_JONIBEK = {
  id: 'account_jonibek',
  username: 'jonibek',
  password: 'admin123',
  fullName: 'Jonibek',
  email: 'jonibek@gmail.com',
  role: 'admin',
  createdAt: 1731140000000,
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize accounts in localStorage if not present
  const [accounts, setAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem(ACCOUNTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let updated = [...parsed];
          if (!updated.some((a) => a.username.toLowerCase() === DEFAULT_ADMIN.username.toLowerCase())) {
            updated.push(DEFAULT_ADMIN);
          }
          if (!updated.some((a) => a.username.toLowerCase() === DEFAULT_JONIBEK.username.toLowerCase())) {
            updated.push(DEFAULT_JONIBEK);
          }
          localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
          return updated;
        }
      }
    } catch (e) {
      console.error('Failed to load accounts from localStorage:', e);
    }
    const initial = [DEFAULT_ADMIN, DEFAULT_JONIBEK];
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initial));
    } catch (e) {}
    return initial;
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load current user:', e);
    }
    return null;
  });

  // Sync with Supabase profiles on mount
  useEffect(() => {
    let isMounted = true;
    async function syncCloudProfiles() {
      const cloudProfiles = await fetchProfilesFromCloud();
      if (!isMounted || !cloudProfiles || cloudProfiles.length === 0) return;

      setAccounts((prevAccounts) => {
        const mergedMap = new Map();
        // Add local
        prevAccounts.forEach((acc) => mergedMap.set(acc.username.toLowerCase(), acc));
        // Add/update from cloud
        cloudProfiles.forEach((cp) => {
          mergedMap.set(cp.username.toLowerCase(), {
            id: cp.id,
            username: cp.username,
            password: cp.password,
            fullName: cp.full_name || cp.fullName,
            email: cp.email,
            role: cp.role || 'user',
            createdAt: Number(cp.created_at || cp.createdAt || Date.now()),
          });
        });
        const merged = Array.from(mergedMap.values());
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(merged));
        return merged;
      });
    }

    syncCloudProfiles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist accounts locally
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts:', e);
    }
  }, [accounts]);

  // Persist current user locally
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to update current user in storage:', e);
    }
  }, [currentUser]);

  /**
   * Log in user with username and password
   * Checks local storage and Supabase cloud so any created account can log in immediately
   */
  const login = async (username, password) => {
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, errorKey: 'auth.loginErrorRequired' };
    }

    // 1. Check local accounts (instant - 0ms)
    let found = accounts.find(
      (acc) =>
        (acc.username.toLowerCase() === cleanUsername ||
          (acc.email && acc.email.toLowerCase() === cleanUsername)) &&
        acc.password === cleanPassword
    );

    // Direct fallback for standard admin & jonibek
    if (!found) {
      if (
        (cleanUsername === 'admin' || cleanUsername === 'admin@gmail.com') &&
        cleanPassword === 'admin123'
      ) {
        found = DEFAULT_ADMIN;
      } else if (
        (cleanUsername === 'jonibek' || cleanUsername === 'jonibek@gmail.com') &&
        cleanPassword === 'admin123'
      ) {
        found = DEFAULT_JONIBEK;
      }
    }

    // 2. If not found locally, fast timeout cloud lookup (max 1.5s timeout, never hang)
    if (!found) {
      try {
        const cloudPromise = supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.${cleanUsername},email.ilike.${cleanUsername}`)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 1500)
        );

        const res = await Promise.race([cloudPromise, timeoutPromise]);
        const data = res?.data;

        if (data && data.password === cleanPassword) {
          found = {
            id: data.id,
            username: data.username,
            password: data.password,
            fullName: data.full_name || data.fullName,
            email: data.email,
            role: data.role || 'user',
            createdAt: Number(data.created_at || Date.now()),
          };
          setAccounts((prev) => {
            const exists = prev.some((a) => a.username.toLowerCase() === found.username.toLowerCase());
            if (!exists) {
              const updated = [...prev, found];
              localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
        }
      } catch (err) {
        // Fast fail on network/timeout, never block the user
      }
    }

    if (found) {
      const userSession = {
        id: found.id,
        username: found.username,
        fullName: found.fullName,
        email: found.email,
        role: found.role,
      };
      setCurrentUser(userSession);
      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
      } catch (e) {}
      return { success: true, user: userSession };
    }

    return { success: false, errorKey: 'auth.loginErrorInvalid' };
  };

  /**
   * Register a new user account
   */
  const register = ({ fullName, username, email, password, confirmPassword }) => {
    const cleanFullName = (fullName || '').trim();
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanFullName || !cleanUsername || !cleanEmail || !cleanPassword) {
      return { success: false, errorKey: 'auth.allFieldsRequired' };
    }

    if (cleanPassword !== (confirmPassword || '').trim()) {
      return { success: false, errorKey: 'auth.passwordMismatch' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, errorKey: 'auth.passwordTooShort' };
    }

    // Check duplicate username
    const usernameTaken = accounts.some(
      (acc) => acc.username.toLowerCase() === cleanUsername
    );
    if (usernameTaken) {
      return { success: false, errorKey: 'auth.usernameExists' };
    }

    // Check duplicate email
    const emailTaken = accounts.some(
      (acc) => (acc.email || '').toLowerCase() === cleanEmail
    );
    if (emailTaken) {
      return { success: false, errorKey: 'auth.emailExists' };
    }

    const newUser = {
      id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      username: cleanUsername,
      password: cleanPassword,
      fullName: cleanFullName,
      email: cleanEmail,
      role: 'user',
      createdAt: Date.now(),
    };

    setAccounts((prev) => [...prev, newUser]);

    const userSession = {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    };

    setCurrentUser(userSession);

    // Save to Supabase cloud asynchronously
    saveProfileToCloud(newUser);

    // Also sync to Supabase Auth so user appears in Authentication -> Users dashboard
    try {
      supabase.auth
        .signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              username: cleanUsername,
              full_name: cleanFullName,
            },
          },
        })
        .catch((e) => console.warn('Supabase auth signup notice:', e));
    } catch (e) {
      console.warn('Supabase auth error:', e);
    }

    return { success: true, user: userSession };
  };

  /**
   * Log out user
   */
  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAdmin: Boolean(
          currentUser &&
            (currentUser.role === 'admin' ||
              currentUser.username?.toLowerCase() === 'admin')
        ),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
