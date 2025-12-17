import React, { useState } from 'react';
import { NavItem, User } from '../types';
import { User as UserIcon, LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react';

interface NavbarProps {
  scrollY: number;
  onAccessSystem?: () => void;
  onLoginClick?: () => void;

  currentUser?: User | null;
  onLogout?: () => void;
}

const navItems: NavItem[] = [
  { label: 'Suporte', href: '#features' },
];

export const Navbar: React.FC<NavbarProps> = ({ scrollY, onAccessSystem, onLoginClick, currentUser, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isScrolled = scrollY > 50;

  const handleMobileClick = (action?: () => void) => {
    setIsMobileMenuOpen(false);
    if (action) action();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled || isMobileMenuOpen
          ? 'py-4 bg-black/90 backdrop-blur-md border-blue-900/30'
          : 'py-8 bg-transparent border-transparent'
        }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); handleMobileClick(); }} className="group relative z-50">
          <span className="font-brand text-2xl tracking-normal text-white">
            FIDI<span className="text-blue-500 group-hover:text-blue-400 transition-colors">.ai</span>
          </span>
        </a>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-blue-400 hover:text-white transition-colors relative z-50 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-12">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-mono text-sm text-blue-300 hover:text-white transition-colors uppercase tracking-widest relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}

          {currentUser ? (
            <div className="relative group">
              <button className="flex items-center gap-3 py-2 focus:outline-none">
                <div className="flex flex-col items-end mr-1">
                  <span className="font-sans text-sm font-medium text-white group-hover:text-blue-200 transition-colors">{currentUser.name}</span>
                  <span className="font-mono text-[10px] text-blue-400 uppercase tracking-wide">ID: {currentUser.id.toString().slice(-4)}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-900/50 p-[1px] shadow-lg group-hover:shadow-blue-500/20 transition-shadow border border-blue-500/30">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                    <UserIcon size={20} className="text-blue-200" />
                  </div>
                </div>
                <ChevronDown size={14} className="text-blue-400 group-hover:text-white transition-colors duration-300 group-hover:rotate-180" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full pt-4 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="glass-panel rounded-xl border border-blue-500/20 overflow-hidden shadow-2xl bg-black/95">
                  <div className="px-4 py-3 border-b border-blue-500/10 bg-blue-900/10">
                    <p className="text-xs text-blue-400 font-mono uppercase tracking-wider">Conta Conectada</p>
                    <p className="text-sm text-white truncate font-medium mt-1">{currentUser.email}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors flex items-center gap-3">
                      <UserIcon size={16} />
                      Perfil
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors flex items-center gap-3">
                      <Settings size={16} />
                      Configurações
                    </button>
                  </div>
                  <div className="border-t border-blue-500/10 py-2">
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                    >
                      <LogOut size={16} />
                      Desconectar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                if (onLoginClick) onLoginClick();
              }}
              className="font-mono text-sm text-blue-300 hover:text-white transition-colors uppercase tracking-widest relative group"
            >
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </a>
          )}

          <button
            onClick={onAccessSystem}
            className="px-6 py-2 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10 hover:text-white rounded-full font-sans text-sm font-medium transition-all duration-300 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            Acessar Sistema
          </button>
        </div>

        {/* Mobile Full Screen Menu */}
        <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-all duration-500 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <div className="flex flex-col items-center gap-8 w-full px-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => handleMobileClick()}
                className="font-mono text-xl text-blue-300 hover:text-white transition-colors uppercase tracking-widest"
              >
                {item.label}
              </a>
            ))}

            <div className="w-16 h-px bg-blue-900/50 my-4" />

            {currentUser ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center border border-blue-500/30 mb-2">
                    <UserIcon size={32} className="text-blue-300" />
                  </div>
                  <span className="text-white font-medium text-lg">{currentUser.name}</span>
                  <span className="text-blue-500 text-xs font-mono">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => handleMobileClick(onLogout)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 mt-4"
                >
                  <LogOut size={16} />
                  Desconectar
                </button>
              </div>
            ) : (
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  handleMobileClick(onLoginClick);
                }}
                className="font-mono text-xl text-blue-300 hover:text-white transition-colors uppercase tracking-widest"
              >
                Login
              </a>
            )}

            <button
              onClick={() => handleMobileClick(onAccessSystem)}
              className="w-full max-w-xs mt-6 px-8 py-4 border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-white rounded-full font-sans text-lg font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              Acessar Sistema
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};