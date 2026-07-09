'use client';

'use client';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer
      id="footer"
      className="relative border-t border-card-border bg-surface/30"
    >
      {/* Top gradient glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Branding */}
          <span className="gradient-text text-lg font-bold">
            🎮 PatchNotifier
          </span>

          <p className="text-muted text-sm">
            Game updates, delivered instantly.
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm mt-4 mb-2">
            <a href="/faq" className="text-muted hover:text-foreground transition-colors duration-200">FAQ</a>
            <a href="/permissions" className="text-muted hover:text-foreground transition-colors duration-200">Permissions</a>
            <a href="/terms-of-use" className="text-muted hover:text-foreground transition-colors duration-200">Terms of Use</a>
            <a href="/privacy-policy" className="text-muted hover:text-foreground transition-colors duration-200">Privacy Policy</a>
            <a href="https://discord.gg/JAZH4N9B9K" className="text-accent hover:text-accent-hover font-medium transition-colors duration-200" target="_blank" rel="noopener noreferrer">Join Discord</a>
          </div>

          {/* Disclaimer */}
          <p className="text-muted/60 text-xs max-w-md">
            Not affiliated with Discord, Steam, or any game publisher.
          </p>

          {/* Copyright */}
          <p className="text-muted/40 text-xs">
            © {new Date().getFullYear()} PatchNotifier
          </p>
        </div>
      </div>
    </footer>
  );
}
