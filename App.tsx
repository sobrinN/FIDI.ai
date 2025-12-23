import { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValueProposition } from './components/ValueProposition';
import { Features } from './components/Features';
import { TrustSignals } from './components/TrustSignals';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { NeuralBackground } from './components/NeuralBackground';
import { PlanUpgradeModal } from './components/PlanUpgradeModal';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getUserSession, setUserSession, clearUserSession, StorageError } from './lib/storageUtils';
import { runMigrations } from './lib/migration';

// Code-split heavy components
const ChatInterface = lazy(() => import('./components/ChatInterface').then(m => ({ default: m.ChatInterface })));
const Auth = lazy(() => import('./components/Auth').then(m => ({ default: m.Auth })));


type ViewState = 'landing' | 'chat' | 'auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [view, setViewInternal] = useState<ViewState>('landing');

  // DEBUG: Persistent logging helper (survives page reload)
  const debugLog = useCallback((message: string) => {
    const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    logs.push({ time: new Date().toISOString(), message });
    // Keep only last 50 logs
    if (logs.length > 50) logs.shift();
    localStorage.setItem('debug_logs', JSON.stringify(logs));
    console.log(`[DEBUG] ${message}`);
  }, []);

  // On mount, show any previous debug logs (from before reload)
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    if (logs.length > 0) {
      console.log('=== DEBUG LOGS FROM BEFORE RELOAD ===');
      logs.forEach((log: { time: string; message: string }) => {
        console.log(`${log.time}: ${log.message}`);
      });
      console.log('=== END DEBUG LOGS ===');
    }
    // Clear after displaying
    localStorage.removeItem('debug_logs');
  }, []);

  // DEBUG: Wrapper to trace all view state changes
  const setView = useCallback((newView: ViewState) => {
    debugLog(`setView called: ${view} -> ${newView}`);
    console.trace('[DEBUG] setView stack trace');
    setViewInternal(newView);
  }, [view, debugLog]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [intendedView, setIntendedView] = useState<ViewState | null>(null);
  const [showPlanUpgrade, setShowPlanUpgrade] = useState(false);

  /**
   * Verify session with backend and get fresh user data
   * This ensures JWT token is valid and syncs user data (including tokenBalance)
   */
  const verifySession = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // Include JWT cookie
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          // Update localStorage with fresh user data (includes tokenBalance)
          const freshUser: User = data.user;
          setUserSession(freshUser);
          return freshUser;
        }
      }

      // Token invalid or expired - clear session
      clearUserSession();
      return null;
    } catch (error) {
      console.error('[App] Session verification failed:', error);
      // Network error - keep localStorage session but return null to indicate unverified
      // This allows offline-first behavior while still attempting verification
      return null;
    }
  }, []);

  useEffect(() => {
    // Run migrations on mount
    runMigrations();

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Initialize session
    const initSession = async () => {
      setIsVerifyingSession(true);

      try {
        // First check localStorage for existing session
        const savedSession = getUserSession();

        if (savedSession) {
          // Temporarily set user from localStorage (optimistic)
          setCurrentUser(savedSession);

          // Verify with backend and get fresh data
          const verifiedUser = await verifySession();

          if (verifiedUser) {
            // Update with fresh data from server
            setCurrentUser(verifiedUser);
          } else {
            // Verification failed but we have localStorage - check if it was a network error
            // by trying to reach the server
            try {
              const healthCheck = await fetch(`${API_URL}/api/health`);
              if (healthCheck.ok) {
                // Server is reachable but token is invalid
                // FIX: Only clear session if not in active chat to prevent redirect bug
                // User can continue using cached session until they leave the chat
                console.warn('[App] JWT token invalid but keeping cached session to prevent disruption');
                // Don't clear session or user - let them continue with cached data
                // Session will be properly cleared on next app load or explicit logout
              }
              // If health check fails, keep localStorage session (offline mode)
            } catch {
              // Network error - keep localStorage session for offline support
              console.log('[App] Server unreachable, using cached session');
            }
          }
        } else {
          // No localStorage session - try to restore from JWT cookie
          const verifiedUser = await verifySession();
          if (verifiedUser) {
            setCurrentUser(verifiedUser);
          }
        }
      } catch (error) {
        if (error instanceof StorageError) {
          console.error('[App] Failed to load user session:', error.code, error.message);
          clearUserSession();
        } else {
          console.error('[App] Unexpected error loading session:', error);
        }
        setCurrentUser(null);
      } finally {
        setIsVerifyingSession(false);
      }
    };

    initSession();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [verifySession]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Navigate to intended destination if set, otherwise landing
    if (intendedView) {
      setView(intendedView);
      setIntendedView(null); // Clear after use
    } else {
      setView('landing');
    }
  };

  const handleLogout = async () => {
    // Call logout endpoint to clear server-side cookie
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[App] Logout request failed:', error);
    }
    clearUserSession();
    setCurrentUser(null);
    setView('landing');
  };

  const handleUpgradeSuccess = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUserSession(updatedUser);
  };

  const handleAccessSystem = () => {
    if (currentUser) {
      setView('chat');
    } else {
      // Store intended destination before redirecting to auth
      setIntendedView('chat');
      setShowToast(true);
      // After showing toast, redirect to auth
      setTimeout(() => {
        setView('auth');
      }, 1500);
    }
  };

  // Show loading spinner while verifying session
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-page text-text-primary font-sans flex items-center justify-center">
        {/* <NeuralBackground /> */}
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-text-primary font-sans selection:bg-accent selection:text-white relative">
      {/* <NeuralBackground /> */}

      {/* Vignette Overlay to focus center - Disabled for clean look */}
      {/* <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" /> */}

      <Toast
        message="Efetue o login para acessar o sistema."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <AnimatePresence>
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <Navbar
              scrollY={scrollY}
              onAccessSystem={handleAccessSystem}
              onLoginClick={() => setView('auth')}

              currentUser={currentUser}
              onLogout={handleLogout}
            />
            <motion.div
              initial={{ filter: 'blur(20px)' }}
              animate={{ filter: 'blur(0px)' }}
              exit={{ scale: 0.95, filter: 'blur(20px)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <main>
                <Hero />
                <ValueProposition />
                <Features />
                <TrustSignals />
                <CallToAction onAccessSystem={handleAccessSystem} />
              </main>
              <Footer />
            </motion.div>
          </motion.div>
        ) : view === 'auth' ? (
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary>
              <motion.div
                key="auth"
                initial={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 h-screen w-full"
              >
                <Auth onLogin={handleLogin} onBack={() => setView('landing')} />
              </motion.div>
            </ErrorBoundary>
          </Suspense>

        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary>
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 h-screen w-full"
              >
                <ChatInterface
                  onBack={() => setView('landing')}
                  currentUser={currentUser}
                  onUpgradeClick={() => setShowPlanUpgrade(true)}
                />
              </motion.div>
            </ErrorBoundary>
          </Suspense>
        )}
      </AnimatePresence>

      {/* Plan Upgrade Modal */}
      {currentUser && (
        <PlanUpgradeModal
          isOpen={showPlanUpgrade}
          onClose={() => setShowPlanUpgrade(false)}
          currentUser={currentUser}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
      )}
    </div>
  );
}