'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  if (pathname === '/dashboard') return null;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/games', label: 'Games' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  const isActive = (href) => pathname === href;

  return (
    <nav
      id="navbar"
      className="glass-nav sticky top-0 z-50 border-b border-card-border"
    >
      {/* Gradient glow line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <img src="/logo.png" alt="PatchNotifier Logo" className="w-8 h-8 group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(255,40,0,0.5)]" />
            <span className="gradient-text text-xl font-bold tracking-tight">PatchNotifier</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                id={`nav-${link.label.toLowerCase()}`}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-accent bg-accent/10'
                    : 'text-muted hover:text-foreground hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-card-border mx-2" />
            
            {!loading && (
              user ? (
                <div className="flex items-center gap-3 ml-2">
                  <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold group-hover:bg-accent group-hover:text-white transition-all">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-muted group-hover:text-foreground transition-colors">
                      {user.username}
                    </span>
                  </Link>
                  <button onClick={logout} className="text-sm text-red-400/80 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-2">
                  <Link href="/login" className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive('/login') ? 'text-white bg-[#7059F6] shadow-[0_0_20px_rgba(112,89,246,0.6)]' : 'text-muted hover:text-foreground'}`}>
                    Log in
                  </Link>
                  <Link href="/register" className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive('/register') ? 'text-white bg-[#7059F6] shadow-[0_0_20px_rgba(112,89,246,0.6)]' : 'text-white bg-white/10 hover:bg-white/20'}`}>
                    Sign up
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            id="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span
                className={`h-0.5 w-full bg-current transition-all duration-300 origin-center ${
                  isMobileMenuOpen
                    ? 'rotate-45 translate-y-[4px]'
                    : ''
                }`}
              />
              <span
                className={`h-0.5 w-full bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 scale-0' : ''
                }`}
              />
              <span
                className={`h-0.5 w-full bg-current transition-all duration-300 origin-center ${
                  isMobileMenuOpen
                    ? '-rotate-45 -translate-y-[4px]'
                    : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? 'text-accent bg-accent/10'
                  : 'text-muted hover:text-foreground hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="h-px bg-card-border my-2" />
          
          {!loading && (
            user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors">
                  Dashboard ({user.username})
                </Link>
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-white/5 transition-colors">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors mt-2">
                  Sign up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
