import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProfilesFromCloud, saveProfileToCloud } from '../services/supabaseService';

const ACCOUNTS_KEY = 'ps_accounts_v1';
const CURRENT_USER_KEY = 'ps_current_user_v1';

const DEFAULT_ADMIN = {
  id: 'account_admin',
  username: 'admin',
  password: 'admin123',
  fullName: 'Administrator',
  email: 'admin@playstation.local',
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
          const adminExists = parsed.some(
            (acc) => acc.username.toLowerCase() === DEFAULT_ADMIN.username.toLowerCase()
          );
          if (!adminExists) {
            const updated = [DEFAULT_ADMIN, ...parsed];
            localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
            return updated;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load accounts from localStorage:', e);
    }
    const initial = [DEFAULT_ADMIN];
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
   */
  const login = (username, password) => {
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, errorKey: 'auth.loginErrorRequired' };
    }

    const found = accounts.find(
      (acc) =>
        (acc.username.toLowerCase() === cleanUsername ||
          (acc.email && acc.email.toLowerCase() === cleanUsername)) &&
        acc.password === cleanPassword
    );

    if (found) {
      const userSession = {
        id: found.id,
        username: found.username,
        fullName: found.fullName,
        email: found.email,
        role: found.role,
      };
      setCurrentUser(userSession);
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
        isAdmin: currentUser?.role === 'admin',
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
