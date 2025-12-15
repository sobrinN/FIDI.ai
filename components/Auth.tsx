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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-transparent">
      {/* Background Ambience - Subtle Blue Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="absolute top-8 left-8 z-50">
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-white font-mono text-xs tracking-widest flex items-center gap-2 transition-colors"
        >
          &larr; BACK
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-8 md:p-10 rounded-2xl border border-blue-500/20 shadow-2xl relative overflow-hidden bg-black/80 backdrop-blur-md">

          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tighter mb-2 text-white">
              {isLogin ? 'IDENTIFICATION' : 'NEW PROTOCOL'}
            </h2>
            <p className="text-blue-300 text-sm font-sans">
              {isLogin ? 'Enter your credentials to access.' : 'Start your registration.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-mono text-blue-400 uppercase tracking-wider">Operator Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-white transition-colors" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-blue-900/10 border border-blue-500/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-blue-400/50 focus:outline-none focus:border-blue-400 focus:bg-blue-900/20 transition-all font-sans"
                      placeholder="Identification..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-mono text-blue-400 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-white transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-blue-900/10 border border-blue-500/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-blue-400/50 focus:outline-none focus:border-blue-400 focus:bg-blue-900/20 transition-all font-sans"
                  placeholder="user@network.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-blue-400 uppercase tracking-wider">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:text-white transition-colors" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-blue-900/10 border border-blue-500/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-blue-400/50 focus:outline-none focus:border-blue-400 focus:bg-blue-900/20 transition-all font-sans"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-300 text-sm bg-red-900/10 p-3 rounded-lg border border-red-500/20"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-blue-200 text-sm bg-blue-900/20 p-3 rounded-lg border border-blue-500/20"
              >
                <CheckCircle size={16} />
                <span>{success}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-display font-bold text-lg py-3 rounded-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? 'PROCESSING...' : (isLogin ? 'START SESSION' : 'REGISTER')}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              className="text-sm text-blue-400 hover:text-white transition-colors font-mono underline decoration-blue-500/50 hover:decoration-white underline-offset-4"
            >
              {isLogin ? 'Request new access credential' : 'Already have access? Connect'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
