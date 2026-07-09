'use client';

import { useState } from 'react';
import { useAuth } from '@/app/components/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const res = await register(username, email, password);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F1115]">
      {/* Left side - Banner/Info */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-[#0a0a0f] relative overflow-hidden p-12 border-r border-white/5">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] text-sm font-bold mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#5865F2] shadow-[0_0_8px_#5865F2]"></span>
            System Online
          </div>
          <h2 className="text-5xl font-black text-white mb-6 leading-tight">
            Level up your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5865F2] to-[#bc58f2] animate-gradient">Discord Server</span>
          </h2>
          <p className="text-[#949BA4] text-lg mb-8">
            Ottieni gli aggiornamenti dei tuoi giochi preferiti in tempo reale. Nessun webhook manuale, tutto gestito automaticamente dal nostro Bot.
          </p>
          <div className="space-y-5">
            <div className="flex items-center gap-4 text-[#DBDEE1] group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-[#1E1F22] border border-white/5 flex items-center justify-center text-[#5865F2] group-hover:bg-[#5865F2]/20 group-hover:border-[#5865F2]/50 group-hover:shadow-[0_0_15px_rgba(88,101,242,0.4)] transition-all duration-300">⚡</div>
              <span className="group-hover:text-white transition-colors">Consegna Patch Istantanea</span>
            </div>
            <div className="flex items-center gap-4 text-[#DBDEE1] group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-[#1E1F22] border border-white/5 flex items-center justify-center text-[#5865F2] group-hover:bg-[#5865F2]/20 group-hover:border-[#5865F2]/50 group-hover:shadow-[0_0_15px_rgba(88,101,242,0.4)] transition-all duration-300">🎮</div>
              <span className="group-hover:text-white transition-colors">Supporto per oltre 20+ Giochi</span>
            </div>
            <div className="flex items-center gap-4 text-[#DBDEE1] group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-[#1E1F22] border border-white/5 flex items-center justify-center text-[#5865F2] group-hover:bg-[#5865F2]/20 group-hover:border-[#5865F2]/50 group-hover:shadow-[0_0_15px_rgba(88,101,242,0.4)] transition-all duration-300">🛡️</div>
              <span className="group-hover:text-white transition-colors">Integrazione Bot Ufficiale</span>
            </div>
          </div>
        </div>
        {/* Animated Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#5865F2]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#bc58f2]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">Create an Account</h1>
            <p className="text-[#949BA4]">Inizia a gestire i tuoi aggiornamenti in 10 secondi</p>
          </div>

          <div className="bg-[#2B2D31] rounded-2xl p-8 shadow-2xl border border-[#1E1F22]">
            {error && (
              <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <a href="/api/auth/discord/login" className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold transition-all shadow-md cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                Registrati con Discord
              </a>
              <a href="/api/auth/google/login" className="flex items-center justify-center gap-3 w-full py-3.5 bg-white hover:bg-gray-100 text-black rounded-xl font-bold transition-all shadow-md cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Registrati con Google
              </a>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-[#313338] flex-1"></div>
              <span className="text-xs text-[#949BA4] font-bold uppercase">Oppure con Email</span>
              <div className="h-px bg-[#313338] flex-1"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#949BA4] uppercase mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1E1F22] border-none rounded-xl text-white focus:ring-2 focus:ring-[#5865F2] transition-all outline-none"
                  placeholder="Il tuo nome su Discord"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#949BA4] uppercase mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1E1F22] border-none rounded-xl text-white focus:ring-2 focus:ring-[#5865F2] transition-all outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#949BA4] uppercase mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1E1F22] border-none rounded-xl text-white focus:ring-2 focus:ring-[#5865F2] transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(88,101,242,0.4)]"
            >
              {loading ? 'Creazione in corso...' : 'Sign Up'}
            </button>

            <div className="mt-6 text-center text-sm text-[#949BA4]">
              Hai già un account?{' '}
              <Link href="/login" className="text-[#5865F2] hover:underline font-bold">
                Log in
              </Link>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
