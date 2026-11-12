import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Sales from './pages/Sales';
import Debts from './pages/Debts';
import ClickPayments from './pages/ClickPayments';
import History from './pages/History';
import Reports from './pages/Reports';

function AppLayout({ children }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#292524] flex flex-col font-sans selection:bg-[#0D9488] selection:text-white">
      {/* Top Full Navbar with Brand, Links, Language, Profile & Settings */}
      <Navbar />

      {/* Main Content Area - Full Width */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="border-t border-[#E7E5E4] bg-white py-4 text-center text-xs text-[#78716C]">
        <p>{t('common.footerText')}</p>
      </footer>
    </div>
  );
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicAuthRoute>
                    <Login initialMode="login" />
                  </PublicAuthRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicAuthRoute>
                    <Register />
                  </PublicAuthRoute>
                }
              />

              {/* Protected Management Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rooms"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Rooms />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Sales />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/debts"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Debts />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/click"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ClickPayments />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <History />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Reports />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
