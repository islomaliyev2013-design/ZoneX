import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function Login({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const passwordInputRef = useRef(null);

  // Login inputs - start strictly empty
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register inputs - start strictly empty
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchToLogin = () => {
    setMode('login');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSwitchToRegister = () => {
    setMode('register');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/', { replace: true });
        return;
      } else {
        setErrorMsg(t(result.errorKey));
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(t('auth.loginErrorInvalid'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const cleanUsername = (regUsername || '').trim().toLowerCase();
      const result = await register({
        fullName: regFullName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });

      if (result.success) {
        // Clear registration fields
        setRegFullName('');
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setErrorMsg('');

        // Directly navigate into the system without blocking or asking password again ("kirib ketorsin")
        navigate('/', { replace: true });
        return;
      } else {
        setErrorMsg(t(result.errorKey));
      }
    } catch (err) {
      console.error('Register error:', err);
      setErrorMsg(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (mode === 'login') {
        handleLogin(e);
      } else {
        handleRegister(e);
      }
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between overflow-x-hidden font-sans bg-cover bg-center bg-no-repeat selection:bg-purple-500 selection:text-white"
      style={{
        backgroundImage: "url('/login-bg-clean.jpg')",
        backgroundColor: '#160d33',
      }}
    >
      {/* Dark violet gradient overlay for silky depth & contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-purple-950/25 to-black/55 pointer-events-none" />

      {/* Top Navigation Bar (matching & INFLIO and MENU in screenshot) */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-lg border border-white/30 backdrop-blur-md">
            <img
              src="/app-icon.jpg"
              alt="PlayStation Manager"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black tracking-widest text-white uppercase drop-shadow">
              PlayStation <span className="text-purple-300 font-light">Manager</span>
            </span>
          </div>
        </div>

        {/* Right Menu & Language Selector */}
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSelector variant="header" />
          <button
            type="button"
            onClick={() =>
              alert(
                'PlayStation Manager Business Edition\nStandart Admin: admin / admin123'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-bold uppercase tracking-wider transition"
            title="Menu"
          >
            <Menu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MENU</span>
          </button>
        </div>
      </header>

      {/* Center Frosted Glassmorphism Card */}
      <main className="relative z-10 w-full flex items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-[440px] px-7 py-8 sm:px-10 sm:py-10 rounded-[36px] bg-slate-950/35 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_1px_1px_rgba(255,255,255,0.15)_inset] text-white transition-all"
        >
          {/* Card Title & Subtitle */}
          <div className="text-center mb-5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-widest uppercase drop-shadow-sm">
              {mode === 'login' ? 'LOGIN' : 'REGISTER'}
            </h1>
            <p className="text-xs text-white/70 font-normal mt-1.5 tracking-wide">
              {mode === 'login'
                ? t('auth.loginSubtitle')
                : t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Toggle Pill (matching Influencer / Brand pill in screenshot) */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 rounded-full bg-black/35 backdrop-blur-md border border-white/20 shadow-inner">
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {t('auth.tabLogin')}
              </button>
              <button
                type="button"
                onClick={handleSwitchToRegister}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {t('auth.tabRegister')}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-500/40 text-red-100 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-300" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-100 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-300" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Container */}
          <div onKeyDown={handleKeyDown} className="space-y-4">
            {mode === 'login' ? (
              <>
                {/* Email / Username Input */}
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1.5 ml-3">
                    {t('auth.username')}
                  </label>
                  <input
                    type="text"
                    name="sec_acc_code_v1"
                    id="sec_acc_code_v1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('auth.usernamePlaceholder')}
                    className="w-full px-5 py-3 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    onPointerDown={(e) => e.target.removeAttribute('readonly')}
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-autocomplete="none"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-form-type="other"
                  />
                </div>

                {/* Password Input with Security Masking (Blocks Chrome Password Popup) */}
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1.5 ml-3">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      ref={passwordInputRef}
                      type="text"
                      name="sec_acc_token_v1"
                      id="sec_acc_token_v1"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      style={{
                        WebkitTextSecurity: showPassword ? 'none' : 'disc',
                      }}
                      className="w-full pl-5 pr-12 py-3 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition tracking-wider"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      onPointerDown={(e) => e.target.removeAttribute('readonly')}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      aria-autocomplete="none"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                      data-form-type="other"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3 text-slate-400 hover:text-slate-700 transition"
                      tabIndex="-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Extras Row: Remember me + Forgot Password */}
                <div className="flex items-center justify-between text-xs text-white/80 px-2 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-white/40 bg-white/20 text-purple-600 focus:ring-0 cursor-pointer"
                    />
                    <span>{t('auth.rememberMe')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        `Tizim administratori uchun:\nLogin: admin\nParol: admin123`
                      )
                    }
                    className="hover:text-white transition font-medium underline-offset-2 hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Register Mode Inputs */}
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1 ml-3">
                    {t('auth.fullName')}
                  </label>
                  <input
                    type="text"
                    name="sec_reg_name_v1"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    className="w-full px-5 py-2.5 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    onPointerDown={(e) => e.target.removeAttribute('readonly')}
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-autocomplete="none"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1 ml-3">
                    {t('auth.username')}
                  </label>
                  <input
                    type="text"
                    name="sec_reg_alias_v1"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder={t('auth.usernamePlaceholder')}
                    className="w-full px-5 py-2.5 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    onPointerDown={(e) => e.target.removeAttribute('readonly')}
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-autocomplete="none"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1 ml-3">
                    {t('auth.email')}
                  </label>
                  <input
                    type="text"
                    name="sec_reg_inbox_v1"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full px-5 py-2.5 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition"
                    readOnly
                    onFocus={(e) => e.target.removeAttribute('readonly')}
                    onPointerDown={(e) => e.target.removeAttribute('readonly')}
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-autocomplete="none"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                  />
                </div>

                {/* Password Input with Security Masking (Blocks Chrome Password Popup) */}
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1 ml-3">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="sec_reg_token_v1"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      style={{
                        WebkitTextSecurity: showRegPassword ? 'none' : 'disc',
                      }}
                      className="w-full pl-5 pr-12 py-2.5 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition tracking-wider"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      onPointerDown={(e) => e.target.removeAttribute('readonly')}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      aria-autocomplete="none"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-4 top-2.5 text-slate-400 hover:text-slate-700 transition"
                      tabIndex="-1"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input with Security Masking (Blocks Chrome Password Popup) */}
                <div>
                  <label className="block text-xs font-medium text-white/90 mb-1 ml-3">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="sec_reg_retoken_v1"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      style={{
                        WebkitTextSecurity: showRegConfirmPassword ? 'none' : 'disc',
                      }}
                      className="w-full pl-5 pr-12 py-2.5 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition tracking-wider"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readonly')}
                      onPointerDown={(e) => e.target.removeAttribute('readonly')}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      aria-autocomplete="none"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-4 top-2.5 text-slate-400 hover:text-slate-700 transition"
                      tabIndex="-1"
                    >
                      {showRegConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Glowing Pill Submit Button (as in user screenshot) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={mode === 'login' ? handleLogin : handleRegister}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full font-extrabold text-sm text-slate-900 bg-white hover:bg-slate-100 active:scale-[0.99] transition shadow-[0_10px_25px_rgba(0,0,0,0.3)] relative overflow-hidden group disabled:opacity-50"
              >
                {/* Subtle soft pink/purple radial glow highlight in center */}
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-24 h-6 bg-pink-400/30 blur-md rounded-full group-hover:bg-pink-400/40 transition" />
                </span>
                <span className="relative z-10 tracking-wide font-bold">
                  {isLoading
                    ? (mode === 'login'
                        ? t('auth.loggingIn')
                        : t('auth.creatingAccount'))
                    : (mode === 'login'
                        ? t('auth.loginButton')
                        : t('auth.createAccountButton'))}
                </span>
              </button>
            </div>

            {/* Bottom Link: Don't have an account? Register */}
            <div className="text-center pt-2 text-xs text-white/80">
              {mode === 'login' ? (
                <p>
                  {t('auth.dontHaveAccount')}{' '}
                  <button
                    type="button"
                    onClick={handleSwitchToRegister}
                    className="text-white font-bold underline hover:text-purple-200 transition ml-1"
                  >
                    {t('auth.tabRegister')}
                  </button>
                </p>
              ) : (
                <p>
                  {t('auth.alreadyHaveAccount')}{' '}
                  <button
                    type="button"
                    onClick={handleSwitchToLogin}
                    className="text-white font-bold underline hover:text-purple-200 transition ml-1"
                  >
                    {t('auth.tabLogin')}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Copyright */}
      <footer className="relative z-20 w-full py-4 text-center text-xs text-white/60">
        <p>{t('common.footerText')}</p>
      </footer>
    </div>
  );
}
