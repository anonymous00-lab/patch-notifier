import Link from 'next/link';

export default function Home() {
  const features = [
    {
      emoji: '⚡',
      title: 'Instant Alerts',
      description:
        'Get notified within minutes when a game releases a patch, update, or announcement.',
    },
    {
      emoji: '🔧',
      title: 'Easy Setup',
      description:
        "Just paste your Discord webhook URL, pick your games, and you're done. No bots to install.",
    },
    {
      emoji: '🎯',
      title: '20+ Games',
      description:
        'From Steam titles to manually tracked games, we cover the most popular competitive and AAA games.',
    },
  ];

  const steps = [
    {
      num: '1',
      title: 'Create Webhook',
      desc: 'Create a webhook in your Discord channel settings.',
    },
    {
      num: '2',
      title: 'Pick Games',
      desc: 'Choose which games you want to track.',
    },
    {
      num: '3',
      title: 'Get Updates',
      desc: 'Receive rich embed notifications in your channel.',
    },
  ];

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        {/* Floating background orbs */}
        <div
          className="floating-orb w-72 h-72 bg-accent/20 top-10 -left-20"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="floating-orb w-96 h-96 bg-secondary/15 top-40 -right-32"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="floating-orb w-64 h-64 bg-accent/10 bottom-10 left-1/3"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="floating-orb w-48 h-48 bg-secondary/10 bottom-32 right-1/4"
          style={{ animationDelay: '6s' }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight gradient-text-hero leading-tight mb-6">
            Game Updates,
            <br />
            Delivered to Discord
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Get instant patch notes for your favorite games delivered directly to
            your Discord server. Track Call of Duty, CS2, Valorant, and 20+ more
            titles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              id="cta-get-started"
              href="/dashboard"
              className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold"
            >
              <span>Get Started →</span>
            </Link>
            <Link
              id="cta-browse-games"
              href="/games"
              className="text-muted hover:text-accent transition-colors duration-200 text-lg font-medium"
            >
              Browse Games →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 sm:p-8 text-center hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-accent/10 via-accent/30 to-accent/10" />

            {steps.map((step) => (
              <div key={step.num} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-4 text-accent text-xl font-bold relative z-10 bg-background">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-10 sm:p-14 relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted mb-8 text-lg">
                Set up notifications in under a minute. No bots, no
                installations, just webhooks.
              </p>
              <Link
                id="cta-bottom"
                href="/dashboard"
                className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold"
              >
                <span>Start Setup →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
