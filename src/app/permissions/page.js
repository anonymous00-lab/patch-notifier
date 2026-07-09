

export default function PermissionsPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 relative">
      <div className="floating-orb bg-secondary w-64 h-64 -top-10 -right-20"></div>
      
      <div className="relative z-10 glass-card p-8 md:p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
            Bot Permissions
            <span className="text-sm px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-medium ml-2">
              Required
            </span>
          </h1>
          <p className="text-muted mt-4 text-lg">
            The following list details what permissions Patch Notifier requires in order to deliver Patch Notes to your server.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Manage Webhooks */}
          <div className="p-6 bg-surface/50 border border-card-border rounded-xl flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 hover:border-accent hover:-translate-y-1">
            <div className="w-12 h-12 flex-shrink-0 bg-accent/20 rounded-full flex items-center justify-center text-accent text-2xl">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-foreground">Manage Webhooks</h3>
                <span className="text-xs text-red-400" title="Required">*</span>
              </div>
              <p className="text-muted">The primary method of delivering messages to channels.</p>
            </div>
          </div>

          {/* Manage Messages */}
          <div className="p-6 bg-surface/50 border border-card-border rounded-xl flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 hover:border-accent hover:-translate-y-1">
            <div className="w-12 h-12 flex-shrink-0 bg-accent/20 rounded-full flex items-center justify-center text-accent text-2xl">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-foreground">Manage Messages</h3>
                <span className="text-xs text-red-400" title="Required">*</span>
              </div>
              <p className="text-muted">Enables us to remove any messages we've sent. Useful when there's a formatting issue or other error we need to correct.</p>
            </div>
          </div>

          {/* Pin Messages */}
          <div className="p-6 bg-surface/50 border border-card-border rounded-xl flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 hover:border-accent hover:-translate-y-1">
            <div className="w-12 h-12 flex-shrink-0 bg-accent/20 rounded-full flex items-center justify-center text-accent text-2xl">
              📌
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-foreground">Pin Messages</h3>
                <span className="text-xs text-muted/60">(Optional)</span>
              </div>
              <p className="text-muted">Used to pin updates so the latest patch notes stay at the top of the channel.</p>
            </div>
          </div>

          {/* Manage Threads */}
          <div className="p-6 bg-surface/50 border border-card-border rounded-xl flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 hover:border-accent hover:-translate-y-1">
            <div className="w-12 h-12 flex-shrink-0 bg-accent/20 rounded-full flex items-center justify-center text-accent text-2xl">
              🗑️
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold text-foreground">Manage Threads</h3>
                <span className="text-xs text-red-400" title="Required">*</span>
              </div>
              <p className="text-muted">Enables us to remove any messages we've sent to forum channels. Useful when there's a formatting issue or other error we need to correct.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-card-border">
          <p className="text-muted">
            For any other questions, please contact us on our <a href="https://discord.gg/JAZH4N9B9K" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline font-medium">Official Discord Server</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
