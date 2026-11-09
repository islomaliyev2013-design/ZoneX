import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Sales from './pages/Sales';
import History from './pages/History';
import Reports from './pages/Reports';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
          <Navbar />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/history" element={<History />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="border-t border-navy-800/80 bg-navy-950 py-4 text-center text-xs text-slate-500">
            <p>PlayStation Manager • Real-time Business Accounting System</p>
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

