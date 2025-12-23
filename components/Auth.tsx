import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { User } from '../types';
import { setUserSession, StorageError } from '../lib/storageUtils';

interface AuthProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

// API response types
interface AuthSuccessResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AuthErrorResponse {
  error?: string;
  code?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Auth: React.FC<AuthProps> = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Login - Call backend API
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required.');
        }

        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important: Include cookies
          body: JSON.stringify({
            email: formData.email,
            password: formData.password, // Send plain password over HTTPS
          }),
        });

        const data: AuthSuccessResponse | AuthErrorResponse = await response.json();

        if (!response.ok) {
          const errorData = data as AuthErrorResponse;
          throw new Error(errorData.error || 'Invalid credentials.');
        }

        // After successful login, fetch complete user data (includes tokenBalance)
        const meResponse = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!meResponse.ok) {
          throw new Error('Failed to fetch user data after login');
        }

        const meData = await meResponse.json();
        const completeUserData: User = meData.user;

        // Save complete session to localStorage
        try {
          setUserSession(completeUserData);
        } catch (storageError) {
          if (storageError instanceof StorageError && storageError.code === 'QUOTA_EXCEEDED') {
            throw new Error('Local storage is full. Please clear some data.');
          }
          // Re-throw other errors
          throw storageError;
        }

        setSuccess('Identity confirmed.');
        setTimeout(() => {
          onLogin(completeUserData);
        }, 1000);
      } else {
        // Register - Call backend API
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('All fields are required.');
        }

        // Client-side validation
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }

        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important: Include cookies
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password, // Send plain password over HTTPS
          }),
        });

        const data: AuthSuccessResponse | AuthErrorResponse = await response.json();

        if (!response.ok) {
          const errorData = data as AuthErrorResponse;
          throw new Error(errorData.error || 'Failed to register user.');
        }

        setSuccess('Registration successful!');
        setTimeout(() => {
          setIsLogin(true);
          setSuccess('');
          setLoading(false);
          setFormData({ name: '', email: '', password: '' });
        }, 1500);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Processing error.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-page selection:bg-accent selection:text-white">
      <div className="absolute top-8 left-8 z-50">
        <button
          onClick={onBack}
          className="text-text-secondary hover:text-text-primary font-mono text-xs tracking-widest flex items-center gap-2 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> BACK
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-8 md:p-12 border border-gray-300 bg-white shadow-sm relative">

          {/* Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-accent"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-gray-300"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-gray-300"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-accent"></div>

          <div className="text-center mb-10">
            <div className="inline-block mb-4 px-2 py-0.5 border border-gray-200 rounded-sm">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">System Access</span>
            </div>
            <h2 className="font-display font-medium text-3xl tracking-tight mb-2 text-text-primary uppercase">
              {isLogin ? 'Identification' : 'Protocol Init'}
            </h2>
            <p className="text-text-secondary text-sm font-sans">
              {isLogin ? 'Enter your credentials to access.' : 'Initialize your registration sequence.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-mono text-text-secondary uppercase tracking-wider pl-1">Operator Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={16} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm py-3 pl-10 pr-4 text-text-primary placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all font-sans text-sm"
                      placeholder="Identification..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-text-secondary uppercase tracking-wider pl-1">Email Coordinates</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm py-3 pl-10 pr-4 text-text-primary placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all font-sans text-sm"
                  placeholder="user@network.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-text-secondary uppercase tracking-wider pl-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-sm py-3 pl-10 pr-4 text-text-primary placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all font-sans text-sm"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-red-600 text-xs bg-red-50 p-3 border-l-2 border-red-500"
              >
                <AlertCircle size={14} />
                <span className="font-mono">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-green-700 text-xs bg-green-50 p-3 border-l-2 border-green-500"
              >
                <CheckCircle size={14} />
                <span className="font-mono">{success}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text-primary text-white font-mono text-xs uppercase tracking-widest py-4 hover:bg-black transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out z-0"></div>
              <span className="relative z-10 flex items-center gap-2">
                {loading ? 'PROCESSING...' : (isLogin ? 'INITIATE SESSION' : 'REGISTER ID')}
                {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              className="text-xs text-text-secondary hover:text-accent transition-colors font-mono uppercase tracking-wide group"
            >
              {isLogin ? (
                <>
                  <span className="opacity-50 mr-2">[ALT]</span>
                  <span className="group-hover:underline underline-offset-4">Request Access</span>
                </>
              ) : (
                <>
                  <span className="opacity-50 mr-2">[ESC]</span>
                  <span className="group-hover:underline underline-offset-4">Connect Existing ID</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
