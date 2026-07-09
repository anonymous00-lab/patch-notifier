export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 relative">
      <div className="floating-orb bg-accent w-64 h-64 -top-10 -left-20"></div>
      
      <div className="relative z-10 glass-card p-8 md:p-12">
        <h1 className="text-4xl font-bold gradient-text mb-10">Frequently Asked Questions</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Why am I being asked for so many permissions?</h2>
            <p className="text-muted leading-relaxed">
              For full details on how we use the various permissions you provide, please see <a href="/permissions" className="text-accent hover:text-accent-hover underline">this page</a>.
            </p>
          </div>



          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">With access to so many Discord servers, what type of information do you store? Chat logs, Members, etc?</h2>
            <p className="text-muted leading-relaxed">
              We're very serious about your server's privacy. We <strong className="text-foreground">DO NOT</strong> track chat logs or server member information
              outside of the total member count of a server. The server administrator is the only user we store information
              on, and it's just enough to contact that person if/when we need to.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              The only message data that we store is completely restricted to the messages Patch Notifier sends to the server.
              e.g. When the latest PUBG update is published, we know when Patch Notifier has posted the update to your server
              and how many people clicked through to the blog post from which it found the update.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              For more information, see our <a href="/privacy-policy" className="text-accent hover:text-accent-hover underline">privacy policy</a>.
            </p>
          </div>



          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Where are my announcement channels?</h2>
            <p className="text-muted leading-relaxed">
              Announcement channels cannot receive patch notes. If servers would like to use Patch Notifier they need to use the
              bot directly rather than subscribing to other server's channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
