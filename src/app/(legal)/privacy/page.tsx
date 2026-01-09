import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Ad Assets Generator",
  description: "Privacy Policy for Ad Assets Generator - How we collect, use, and protect your personal information",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 9, 2026";
  const companyName = "Ad Assets Generator";
  const contactEmail = "privacy@adassets.io";

  return (
    <article className="space-y-8">
      {/* Header */}
      <header className="space-y-4 border-b-4 border-foreground pb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Introduction */}
      <section className="space-y-4">
        <p className="text-lg leading-relaxed">
          At {companyName}, we take your privacy seriously. This Privacy Policy explains
          how we collect, use, disclose, and safeguard your information when you use our
          AI-powered advertising asset generation platform (the &quot;Service&quot;).
        </p>
        <div className="border-4 border-foreground bg-card p-6">
          <p className="font-bold uppercase tracking-wide text-sm mb-2">Your Privacy Matters</p>
          <p className="text-muted-foreground">
            Please read this Privacy Policy carefully. By using the Service, you agree
            to the collection and use of information in accordance with this policy.
          </p>
        </div>
      </section>

      {/* Section 1: Information We Collect */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          1. Information We Collect
        </h2>

        <h3 className="text-xl font-bold mt-6">1.1 Information You Provide</h3>
        <p className="leading-relaxed">
          We collect information you provide directly to us when you:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span><strong>Create an account:</strong> Name, email address, password, and optional profile information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span><strong>Make purchases:</strong> Payment information (processed securely by Stripe)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span><strong>Upload content:</strong> Brand assets, logos, reference images, and other files you upload</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span><strong>Generate content:</strong> Prompts, generation settings, and preferences</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span><strong>Contact us:</strong> Any information you include in communications with our support team</span>
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-6">1.2 Information Collected Automatically</h3>
        <p className="leading-relaxed">
          When you use the Service, we automatically collect certain information:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span><strong>Device information:</strong> Browser type, operating system, device identifiers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span><strong>Usage data:</strong> Pages visited, features used, generation history, credit transactions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span><strong>Log data:</strong> IP address, access times, referring URLs, error logs</span>
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-6">1.3 Information from Third Parties</h3>
        <p className="leading-relaxed">
          If you sign in using a third-party service (such as Google), we receive your
          name, email address, and profile picture as permitted by that service&apos;s
          privacy settings.
        </p>
      </section>

      {/* Section 2: How We Use Your Information */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          2. How We Use Your Information
        </h2>
        <p className="leading-relaxed">
          We use the information we collect for the following purposes:
        </p>
        <div className="border-4 border-foreground bg-card p-4 space-y-3">
          <div className="flex items-start gap-3 border-b border-foreground/20 pb-3">
            <span className="font-black text-primary">01</span>
            <span>Provide, maintain, and improve the Service</span>
          </div>
          <div className="flex items-start gap-3 border-b border-foreground/20 pb-3">
            <span className="font-black text-primary">02</span>
            <span>Process transactions and manage your account</span>
          </div>
          <div className="flex items-start gap-3 border-b border-foreground/20 pb-3">
            <span className="font-black text-primary">03</span>
            <span>Send transactional communications (receipts, account updates, security alerts)</span>
          </div>
          <div className="flex items-start gap-3 border-b border-foreground/20 pb-3">
            <span className="font-black text-primary">04</span>
            <span>Respond to your comments, questions, and support requests</span>
          </div>
          <div className="flex items-start gap-3 border-b border-foreground/20 pb-3">
            <span className="font-black text-primary">05</span>
            <span>Monitor and analyze usage patterns and trends</span>
          </div>
          <div className="flex items-start gap-3 border-b border-foreground/20 pb-3">
            <span className="font-black text-primary">06</span>
            <span>Detect, prevent, and address fraud and abuse</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-black text-primary">07</span>
            <span>Comply with legal obligations</span>
          </div>
        </div>
      </section>

      {/* Section 3: How We Share Your Information */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          3. How We Share Your Information
        </h2>
        <p className="leading-relaxed">
          We do not sell your personal information. We may share your information in
          the following circumstances:
        </p>

        <h3 className="text-xl font-bold mt-6">3.1 Service Providers</h3>
        <p className="leading-relaxed">
          We share information with third-party vendors who perform services on our behalf:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span><strong>Stripe:</strong> Payment processing (they receive only payment-related data)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span><strong>AI providers:</strong> Image and video generation (prompts and settings)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span><strong>Cloud storage:</strong> Secure storage of generated assets</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span><strong>Analytics providers:</strong> Usage analytics (anonymized where possible)</span>
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-6">3.2 Legal Requirements</h3>
        <p className="leading-relaxed">
          We may disclose your information if required by law, regulation, legal process,
          or governmental request, or when we believe disclosure is necessary to protect
          our rights, protect your safety or the safety of others, investigate fraud, or
          respond to a government request.
        </p>

        <h3 className="text-xl font-bold mt-6">3.3 Business Transfers</h3>
        <p className="leading-relaxed">
          If we are involved in a merger, acquisition, or sale of assets, your information
          may be transferred as part of that transaction. We will notify you of any change
          in ownership or use of your information.
        </p>
      </section>

      {/* Section 4: Data Retention */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          4. Data Retention
        </h2>
        <p className="leading-relaxed">
          We retain your information for as long as your account is active or as needed
          to provide you services. We will retain and use your information as necessary to:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Comply with our legal obligations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Resolve disputes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Enforce our agreements</span>
          </li>
        </ul>
        <div className="border-4 border-foreground bg-card p-6 mt-4">
          <p className="font-bold uppercase tracking-wide text-sm mb-2">Account Deletion</p>
          <p className="text-muted-foreground">
            When you delete your account, we will delete your personal data within 30 days,
            except for information we are required to retain for legal, regulatory, or
            security purposes.
          </p>
        </div>
      </section>

      {/* Section 5: Data Security */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          5. Data Security
        </h2>
        <p className="leading-relaxed">
          We implement appropriate technical and organizational security measures to
          protect your personal information, including:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Encryption of data in transit (TLS/SSL) and at rest</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Secure password hashing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Regular security assessments</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Access controls and authentication</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Rate limiting and abuse prevention</span>
          </li>
        </ul>
        <p className="leading-relaxed mt-4">
          However, no method of transmission over the Internet or electronic storage
          is 100% secure. While we strive to protect your personal information, we
          cannot guarantee its absolute security.
        </p>
      </section>

      {/* Section 6: Your Rights (GDPR) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          6. Your Rights
        </h2>
        <p className="leading-relaxed">
          Depending on your location, you may have certain rights regarding your personal
          information. For users in the European Economic Area (EEA) and other jurisdictions
          with similar laws, these rights include:
        </p>

        <div className="grid gap-4 mt-4">
          <div className="border-4 border-foreground p-4">
            <h4 className="font-bold uppercase tracking-wide">Right to Access</h4>
            <p className="text-muted-foreground text-sm mt-1">
              Request a copy of the personal data we hold about you
            </p>
          </div>
          <div className="border-4 border-foreground p-4">
            <h4 className="font-bold uppercase tracking-wide">Right to Rectification</h4>
            <p className="text-muted-foreground text-sm mt-1">
              Request correction of inaccurate or incomplete personal data
            </p>
          </div>
          <div className="border-4 border-foreground p-4">
            <h4 className="font-bold uppercase tracking-wide">Right to Erasure</h4>
            <p className="text-muted-foreground text-sm mt-1">
              Request deletion of your personal data (&quot;right to be forgotten&quot;)
            </p>
          </div>
          <div className="border-4 border-foreground p-4">
            <h4 className="font-bold uppercase tracking-wide">Right to Restrict Processing</h4>
            <p className="text-muted-foreground text-sm mt-1">
              Request limitation of processing of your personal data
            </p>
          </div>
          <div className="border-4 border-foreground p-4">
            <h4 className="font-bold uppercase tracking-wide">Right to Data Portability</h4>
            <p className="text-muted-foreground text-sm mt-1">
              Receive your personal data in a structured, machine-readable format
            </p>
          </div>
          <div className="border-4 border-foreground p-4">
            <h4 className="font-bold uppercase tracking-wide">Right to Object</h4>
            <p className="text-muted-foreground text-sm mt-1">
              Object to processing of your personal data for certain purposes
            </p>
          </div>
          <div className="border-4 border-foreground p-4">
            <h4 className="font-bold uppercase tracking-wide">Right to Withdraw Consent</h4>
            <p className="text-muted-foreground text-sm mt-1">
              Withdraw consent at any time where we rely on consent to process your data
            </p>
          </div>
        </div>

        <p className="leading-relaxed mt-4">
          To exercise any of these rights, please contact us at{" "}
          <a href={`mailto:${contactEmail}`} className="underline underline-offset-4 hover:text-primary font-bold">
            {contactEmail}
          </a>. We will respond to your request within 30 days.
        </p>
      </section>

      {/* Section 7: Cookies and Tracking */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          7. Cookies and Tracking Technologies
        </h2>
        <p className="leading-relaxed">
          We use cookies and similar tracking technologies to track activity on our
          Service and store certain information.
        </p>

        <h3 className="text-xl font-bold mt-6">7.1 Types of Cookies We Use</h3>
        <div className="border-4 border-foreground bg-card divide-y-4 divide-foreground">
          <div className="p-4">
            <span className="font-bold uppercase text-sm">Essential Cookies</span>
            <p className="text-muted-foreground text-sm mt-1">
              Required for the Service to function. Cannot be disabled. Include session
              cookies for authentication.
            </p>
          </div>
          <div className="p-4">
            <span className="font-bold uppercase text-sm">Functional Cookies</span>
            <p className="text-muted-foreground text-sm mt-1">
              Remember your preferences and settings to enhance your experience.
            </p>
          </div>
          <div className="p-4">
            <span className="font-bold uppercase text-sm">Analytics Cookies</span>
            <p className="text-muted-foreground text-sm mt-1">
              Help us understand how visitors interact with the Service to improve
              functionality and user experience.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-bold mt-6">7.2 Managing Cookies</h3>
        <p className="leading-relaxed">
          Most web browsers allow you to control cookies through their settings. However,
          disabling certain cookies may limit your ability to use some features of the Service.
        </p>
      </section>

      {/* Section 8: International Data Transfers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          8. International Data Transfers
        </h2>
        <p className="leading-relaxed">
          Your information may be transferred to and processed in countries other than
          your country of residence. These countries may have data protection laws that
          are different from the laws of your country.
        </p>
        <p className="leading-relaxed">
          When we transfer your information internationally, we implement appropriate
          safeguards, such as Standard Contractual Clauses approved by the European
          Commission, to protect your information.
        </p>
      </section>

      {/* Section 9: Children's Privacy */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          9. Children&apos;s Privacy
        </h2>
        <div className="border-4 border-destructive bg-destructive/5 p-6">
          <p className="leading-relaxed">
            Our Service is not intended for children under 18 years of age. We do not
            knowingly collect personal information from children under 18. If you are
            a parent or guardian and believe your child has provided us with personal
            information, please contact us immediately at{" "}
            <a href={`mailto:${contactEmail}`} className="underline underline-offset-4 hover:text-foreground font-bold">
              {contactEmail}
            </a>.
          </p>
        </div>
      </section>

      {/* Section 10: Third-Party Links */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          10. Third-Party Links
        </h2>
        <p className="leading-relaxed">
          Our Service may contain links to third-party websites or services that are
          not operated by us. We have no control over and assume no responsibility for
          the content, privacy policies, or practices of any third-party sites or services.
          We encourage you to review the privacy policy of every site you visit.
        </p>
      </section>

      {/* Section 11: Changes to This Privacy Policy */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          11. Changes to This Privacy Policy
        </h2>
        <p className="leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of
          any changes by posting the new Privacy Policy on this page and updating the
          &quot;Last updated&quot; date at the top.
        </p>
        <p className="leading-relaxed">
          For significant changes, we will provide a more prominent notice, such as
          an email notification or an in-app alert. We encourage you to review this
          Privacy Policy periodically.
        </p>
      </section>

      {/* Section 12: Contact Us */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          12. Contact Us
        </h2>
        <p className="leading-relaxed">
          If you have any questions about this Privacy Policy, your personal data, or
          to exercise your data rights, please contact us:
        </p>
        <div className="border-4 border-foreground bg-card p-6">
          <p className="font-bold">{companyName}</p>
          <p className="text-muted-foreground mt-2">
            Privacy Inquiries:{" "}
            <a href={`mailto:${contactEmail}`} className="underline underline-offset-4 hover:text-foreground">
              {contactEmail}
            </a>
          </p>
          <p className="text-muted-foreground mt-1">
            General Support:{" "}
            <a href="mailto:support@adassets.io" className="underline underline-offset-4 hover:text-foreground">
              support@adassets.io
            </a>
          </p>
        </div>
        <p className="leading-relaxed mt-4">
          For users in the EEA, you also have the right to lodge a complaint with your
          local data protection authority if you believe we have not complied with
          applicable data protection laws.
        </p>
      </section>

      {/* Legal Basis (GDPR) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          13. Legal Basis for Processing (GDPR)
        </h2>
        <p className="leading-relaxed">
          For users in the EEA, we process your personal data based on the following
          legal grounds:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span><strong>Contract:</strong> To perform our contract with you (providing the Service)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span><strong>Legitimate Interests:</strong> For our legitimate business interests (improving the Service, preventing fraud)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span><strong>Consent:</strong> Where you have given consent for specific processing activities</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</span>
          </li>
        </ul>
      </section>

      {/* Acknowledgment */}
      <section className="border-t-4 border-foreground pt-8 mt-12">
        <div className="border-4 border-primary bg-primary/5 p-6">
          <h3 className="font-black uppercase tracking-wide mb-2">Your Consent</h3>
          <p className="text-muted-foreground">
            By using {companyName}, you consent to this Privacy Policy and agree to its
            terms. If you do not agree with this policy, please do not use our Service.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link
            href="/terms"
            className="inline-flex items-center justify-center border-4 border-foreground bg-card px-6 py-3 font-bold uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
          >
            Read Terms of Service
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center border-4 border-primary bg-primary px-6 py-3 font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    </article>
  );
}
