import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValueProposition } from './components/ValueProposition';
import { Features } from './components/Features';
import { TrustSignals } from './components/TrustSignals';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { NeuralBackground } from './components/NeuralBackground';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getUserSession, clearUserSession, StorageError } from './lib/storageUtils';
import { runMigrations } from './lib/migration';

// Code-split heavy components
const ChatInterface = lazy(() => import('./components/ChatInterface').then(m => ({ default: m.ChatInterface })));
const Auth = lazy(() => import('./components/Auth').then(m => ({ default: m.Auth })));
const AgentsPage = lazy(() => import('./components/AgentsPage').then(m => ({ default: m.AgentsPage })));

type ViewState = 'landing' | 'chat' | 'auth' | 'agents';

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [view, setView] = useState<ViewState>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Run migrations on mount
    runMigrations();

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Check for active session using type-safe storage utility
    try {
      const savedSession = getUserSession();
      if (savedSession) {
        setCurrentUser(savedSession);
      }
    } catch (error) {
      if (error instanceof StorageError) {
        console.error('[App] Failed to load user session:', error.code, error.message);
        // Clear corrupted session data
        clearUserSession();
      } else {
        console.error('[App] Unexpected error loading session:', error);
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('landing');
  };

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
    setView('landing');
  };

  const handleAccessSystem = () => {
    if (currentUser) {
      setView('chat');
    } else {
      setShowToast(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative">
      <NeuralBackground />
      
      {/* Vignette Overlay to focus center */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      <Toast 
        message="Efetue o login para acessar o sistema."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, filter: 'blur(20px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <Navbar 
              scrollY={scrollY} 
              onAccessSystem={handleAccessSystem} 
              onLoginClick={() => setView('auth')}
              onAgentsClick={() => setView('agents')}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
            <main>
              <Hero />
              <ValueProposition />
              <Features />
              <TrustSignals />
              <CallToAction onAccessSystem={handleAccessSystem} />
            </main>
            <Footer />
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
        ) : view === 'agents' ? (
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary>
              <motion.div
                key="agents"
                initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 min-h-screen w-full"
              >
                <AgentsPage onBack={() => setView('landing')} />
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
                <ChatInterface onBack={() => setView('landing')} currentUser={currentUser} />
              </motion.div>
            </ErrorBoundary>
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}