export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 relative">
      <div className="floating-orb bg-accent w-64 h-64 -top-10 -left-20"></div>
      
      <div className="relative z-10 glass-card p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-card-border pb-6">
          <h1 className="text-4xl font-bold gradient-text">Privacy Policy</h1>
          <span className="text-muted text-sm pb-1 font-medium">Last Updated: July 9, 2026</span>
        </div>
        
        <div className="space-y-6 text-muted leading-relaxed">
          <p>By using our Site/Bot, you agree that you have read and agree to this policy.</p>
          
          <p>
            This is our "Privacy Policy" which sets out the policy which governs our use of information you provide in connection with the Patch Notifier website. 
            The terms "you" and "your" refer to all individuals or entities accessing this website. 
            The terms "we," "us," "our," refer to Patch Notifier and "bot" refers to our Discord bot itself.
          </p>
          
          <p>
            We may update this Privacy Policy from time to time. Changes in our Privacy Policy will be effective immediately. 
            If you are a regular visitor to this website, we recommend that you check this Privacy Policy on a regular basis. 
            By using the website and/or bot, you consent to the collection, use and transfer of your information in accordance with this Privacy Policy. 
            If you do not agree to this Privacy Policy, please do not use this website or our bot.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Privacy Statement</h2>
          <p>
            We respect the privacy of your information. We provide this explanation about our information practices as a show of our commitment to protect your privacy. 
            This policy describes the types of information we may collect from you or that you may provide when you visit this website and our practices for collecting, using, maintaining, protecting and disclosing that information.
          </p>
          <p>This policy applies to information we collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>On this website and/or via our Bot:</li>
            <li>When you interact with our applications on social media or third-party applications.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground pt-4">The Information We Collect and How We Collect It</h2>
          <p>
            <strong className="text-foreground">Personally Identifiable Information.</strong> At our website, we only collect personally identifiable information from individuals that they provide to us voluntarily. 
            This means we do not require you to register or provide information to us in order to view our website.
          </p>
          <p>
            <strong className="text-foreground">Non-Personally Identifiable Information.</strong> We may automatically collect certain technical information from your computer such as your Internet service provider, your IP address, your browser type, your operating system, the pages viewed, the pages viewed immediately before and after accessing the website, and the search terms entered to get to our site. 
            This information allows us to improve and customize our services.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground pt-4">The Way We Use Information</h2>
          <p>
            This Privacy Statement governs use of the information that you provide to us through the website or bot. It does not govern the manner in which we may use information obtained from other sources. We use information that we collect about you or that you provide to us, including any personal information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To present our website and its contents to you.</li>
            <li>To provide you with information on programs, services or products.</li>
            <li>To process online transactions, purchases, or registrations.</li>
            <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us.</li>
            <li>To notify you about changes to our website, bot or any items that we may offer through it.</li>
            <li>To improve our marketing and promotional efforts, to statistically analyze site usage, to improve our content and product offerings, and to customize our site's content, layout and services.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Disclosure of Your Information</h2>
          <p>We may disclose personal information that we collect or you provide as described in this privacy policy:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To contractors, service providers and other third parties we use to support our business.</li>
            <li>To fulfill the purpose for which you provide it.</li>
            <li>To comply with any court order, law or legal process, including to respond to any government or regulatory request.</li>
            <li>To enforce or apply our <a href="/terms-of-use" className="text-accent hover:text-accent-hover underline">Terms of Use</a> and other agreements.</li>
            <li>If we believe disclosure is necessary or appropriate to protect the rights, property or safety of Patch Notifier, our participants or others.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground pt-4">Contact Information</h2>
          <p>
            To ask questions or comment about this Privacy Policy and our privacy practices, please contact us on our <a href="https://discord.gg/JAZH4N9B9K" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover underline font-medium">Official Discord Server</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
