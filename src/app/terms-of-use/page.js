export default function TermsOfUsePage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 relative">
      <div className="floating-orb bg-secondary w-64 h-64 -top-10 -right-20"></div>
      
      <div className="relative z-10 glass-card p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-card-border pb-6">
          <h1 className="text-4xl font-bold gradient-text">Terms of Use</h1>
          <span className="text-muted text-sm pb-1 font-medium">Last Updated: July 9, 2026</span>
        </div>
        
        <div className="space-y-6 text-muted leading-relaxed">
          <p>
            Patch Notifier ("us" or "we" or "our") owns and operates the Patch Notifier site ("Site") and the Patch Notifier Discord Bot ("Bot"). 
            The following Terms of Use (“TOU”) govern your use of the Site and the Bot. Other sites or content owned or controlled by Patch Notifier may have their own terms of use and should be reviewed.
          </p>
          <p>
            Using Patch Notifier is at-will and can be terminated at any time by either us or you for any reason. 
            By using Patch Notifier, you agree to be bound by these TOU. If you do not agree to be so bound, you are not authorized to use the Site or the Bot. 
            These TOU are a legal contract between you and Patch Notifier and govern your access to and use of the Site together with any services offered through the Site.
          </p>
          <p>
            Patch Notifier is not affiliated with Discord, Blizzard, Ubisoft, Steam or any game developers of the games we support.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Patch Notifier</h2>
          <p>The purpose of Patch Notifier is to provide Discord channels with notifications of changes to games.</p>
          <p>
            The information supplied by Patch Notifier is provided for entertainment and informational purposes only. 
            You agree that you will only use Patch Notifier, or data/information provided by it, for its intended purposes, and not for other commercial ventures without first seeking approval from us.
          </p>
          <p>
            By using Patch Notifier, you may need to interact with other Site users. You are solely responsible for any such interaction and agree to do so in a manner that is legal, respectable, and consistent with these TOU. 
            Patch Notifier is not responsible for the conduct of any other user who may interact with you, regardless of whether or not it is done through the Site or through Patch Notifier's own Discord channel.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">License</h2>
          <p>
            Patch Notifier hereby grants you a revocable and nonexclusive right and license to use Patch Notifier's Site (including any underlying software) and Bot in a manner that is consistent with the other terms in these TOU and Patch Notifier's intended purposes. 
            Patch Notifier reserves the right to terminate this License for any or no reason and at any time without notice to you, including, but not limited to, for breach of any term contained in these TOU.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Content Disclaimers</h2>
          <p>
            Patch Notifier does not warrant or guarantee the accuracy, completeness, timeliness, merchantability or fitness for a particular purpose of the information and data contained on the Site or distributed by the Bot. 
            In no event shall Patch Notifier be liable to you or anyone else for any decision made or action taken by you in reliance of any information or data found on the Site.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Terms of Use Changes</h2>
          <p>
            Patch Notifier reserves the right to modify these TOU at any time without prior notice. You should visit the Site from time to time to review the current TOU. 
            By using the Site subsequent to any modification of these TOU, you agree to be bound by such modification(s).
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Intellectual and Other Property</h2>
          <p>Some content on the Site and distributed by the Bot remains property of the 3rd parties where they are obtained.</p>
          <p>
            Other than the exceptions referenced in these TOU or noted elsewhere, all other content on the Site is the property of Patch Notifier including, but not limited to, all marks, logos, names, text, data, documents, messages, pictures, images, video, audio, graphics, links, software and its underlying code, domain name, or other electronic files (referred hereafter as “Patch Notifier Content”).
          </p>
          <p>
            You acknowledge that you have no right, title, or interest in or to Patch Notifier and/or Patch Notifier Content.
          </p>
          <p>
            There may be other content located on the Site not owned by Patch Notifier, and you should respect those property rights as well. All rights not expressly granted herein are reserved to Patch Notifier.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Other Prohibited Conduct</h2>
          <p>In connection with your access and/or use of the Site or any Site services, you agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violate any federal, state, or local laws or regulations.</li>
            <li>Upload/post anything that imposes an unreasonable or disproportionately large strain on Patch Notifier's network or computer infrastructure.</li>
            <li>Engage in any behavior that is designed to hack into or gain unauthorized access to protected areas of the Site.</li>
            <li>Use any automated technology such as a robot, spider, or scraper to access, scrape, or data mine the Site.</li>
            <li>Discuss, incite, or promote illegal activity.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Disclaimer of Warranties</h2>
          <p className="uppercase text-sm tracking-wide">Your use of the site is at your own risk.</p>
          <p className="uppercase text-sm tracking-wide">
            Patch Notifier makes no express or implied warranties, representations or endorsements whatsoever with respect to the site or any goods or services offered on or through the site. 
            Patch Notifier expressly disclaims all warranties of any kind, (express, implied, statutory, or otherwise), including, but not limited to, implied warranties of merchantability, security, completeness, timeliness, appropriateness, accuracy, fitness for a particular purpose, freedom from computer viruses, title, and non-infringement.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Site Privacy Policy</h2>
          <p>
            Your use of the Site and Bot are governed by the <a href="/privacy-policy" className="text-accent hover:text-accent-hover underline">Site Privacy Policy</a> which is incorporated by reference into these TOU.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Contact</h2>
          <p>
            If you have any questions regarding these Terms of Use, please contact us on our <a href="https://discord.gg/JAZH4N9B9K" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline font-medium">Official Discord Server</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
