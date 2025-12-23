import React, { useState } from 'react';
import { NavItem, User } from '../types';
import { LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react';

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
  const isScrolled = scrollY > 20;

  const handleMobileClick = (action?: () => void) => {
    setIsMobileMenuOpen(false);
    if (action) action();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled || isMobileMenuOpen
        ? 'py-3 bg-page border-black shadow-sm'
        : 'py-6 bg-transparent border-transparent'
        }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); handleMobileClick(); }} className="group relative z-50">
          <span className="font-sans text-xl font-bold tracking-tight text-text-primary">
            FIDI<span className="text-accent group-hover:text-accent transition-colors">.ai</span>
          </span>
        </a>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-text-primary hover:text-accent transition-colors relative z-50 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-mono text-xs text-text-secondary hover:text-accent transition-colors uppercase tracking-wide relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}

          {currentUser ? (
            <div className="relative group">
              <button className="flex items-center gap-2 py-1 focus:outline-none">
                <span className="font-mono text-xs font-medium text-text-primary group-hover:text-accent transition-colors">{currentUser.name}</span>
                <ChevronDown size={12} className="text-text-secondary group-hover:text-accent transition-colors duration-300 group-hover:rotate-180" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                <div className="bg-white rounded-md border border-gray-200 shadow-xl overflow-hidden p-1">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-[10px] text-text-secondary font-mono uppercase">Conectado</p>
                    <p className="text-xs text-text-primary truncate font-medium">{currentUser.email}</p>
                  </div>
                  <button className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors flex items-center gap-2 rounded-sm">
                    <Settings size={14} />
                    Configurações
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 rounded-sm"
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
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
              className="font-mono text-xs text-text-secondary hover:text-accent transition-colors uppercase tracking-wide relative group"
            >
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full"></span>
            </a>
          )}

          <button
            onClick={onAccessSystem}
            className="h-[25px] px-3 bg-text-primary hover:bg-accent text-white rounded-sm font-sans text-xs font-medium transition-colors shadow-sm flex items-center justify-center"
          >
            Acessar Sistema
          </button>
        </div>

        {/* Mobile Full Screen Menu */}
        <div className={`fixed inset-0 bg-page z-40 flex flex-col items-center justify-center transition-all duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <div className="flex flex-col items-center gap-6 w-full px-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => handleMobileClick()}
                className="font-mono text-lg text-text-primary hover:text-accent transition-colors uppercase tracking-widest"
              >
                {item.label}
              </a>
            ))}

            <div className="w-12 h-px bg-gray-300 my-4" />

            {currentUser ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex flex-col items-center">
                  <span className="text-text-primary font-medium text-base">{currentUser.name}</span>
                  <span className="text-text-secondary text-xs font-mono">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => handleMobileClick(onLogout)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-400 mt-2 text-xs font-mono uppercase"
                >
                  <LogOut size={14} />
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
                className="font-mono text-lg text-text-primary hover:text-accent transition-colors uppercase tracking-widest"
              >
                Login
              </a>
            )}

            <button
              onClick={() => handleMobileClick(onAccessSystem)}
              className="w-full max-w-xs mt-6 h-[40px] bg-text-primary hover:bg-accent text-white rounded-sm font-sans text-sm font-bold transition-colors shadow-md"
            >
              Acessar Sistema
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};