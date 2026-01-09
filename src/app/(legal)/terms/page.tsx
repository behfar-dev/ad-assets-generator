import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Ad Assets Generator",
  description: "Terms of Service for Ad Assets Generator - AI-powered ad creative generation platform",
};

export default function TermsOfServicePage() {
  const lastUpdated = "January 9, 2026";
  const companyName = "Ad Assets Generator";
  const contactEmail = "legal@adassets.io";

  return (
    <article className="space-y-8">
      {/* Header */}
      <header className="space-y-4 border-b-4 border-foreground pb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
          Terms of Service
        </h1>
        <p className="text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      {/* Introduction */}
      <section className="space-y-4">
        <p className="text-lg leading-relaxed">
          Welcome to {companyName}. These Terms of Service (&quot;Terms&quot;) govern your
          access to and use of our website, services, and applications (collectively,
          the &quot;Service&quot;). By accessing or using the Service, you agree to be bound
          by these Terms and our Privacy Policy.
        </p>
        <div className="border-4 border-foreground bg-card p-6">
          <p className="font-bold uppercase tracking-wide text-sm mb-2">Important</p>
          <p className="text-muted-foreground">
            Please read these Terms carefully before using our Service. If you do not
            agree to these Terms, you may not access or use the Service.
          </p>
        </div>
      </section>

      {/* Section 1: Description of Service */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          1. Description of Service
        </h2>
        <p className="leading-relaxed">
          {companyName} provides an AI-powered platform for generating advertising
          creative assets, including but not limited to images, videos, and ad copy.
          The Service allows users to:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Generate AI-powered images for advertising campaigns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Create video content using AI generation models</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Generate advertising copy and text content</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Extract brand elements from existing assets</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary mt-2 flex-shrink-0"></span>
            <span>Organize and manage generated assets within projects</span>
          </li>
        </ul>
      </section>

      {/* Section 2: Account Registration */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          2. Account Registration
        </h2>
        <p className="leading-relaxed">
          To use certain features of the Service, you must register for an account.
          When you register, you agree to:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Provide accurate, current, and complete information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Maintain and promptly update your account information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Maintain the security of your password and account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Accept responsibility for all activities under your account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Notify us immediately of any unauthorized use</span>
          </li>
        </ul>
        <p className="leading-relaxed">
          You must be at least 18 years old to create an account and use the Service.
        </p>
      </section>

      {/* Section 3: Credit System and Payment */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          3. Credit System and Payment
        </h2>

        <h3 className="text-xl font-bold mt-6">3.1 Credits</h3>
        <p className="leading-relaxed">
          The Service operates on a credit-based system. Credits are required to
          generate assets and are consumed based on the type and complexity of
          generation:
        </p>
        <div className="border-4 border-foreground bg-card p-4 space-y-2">
          <div className="flex justify-between items-center border-b border-foreground/20 pb-2">
            <span className="font-bold">Image Generation</span>
            <span>1-2 credits per image</span>
          </div>
          <div className="flex justify-between items-center border-b border-foreground/20 pb-2">
            <span className="font-bold">Video Generation</span>
            <span>5-10 credits per video</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">Ad Copy Generation</span>
            <span>0.5 credits per generation</span>
          </div>
        </div>

        <h3 className="text-xl font-bold mt-6">3.2 Purchases</h3>
        <p className="leading-relaxed">
          Credits can be purchased through our platform. All purchases are processed
          securely through our payment provider, Stripe. By making a purchase, you
          authorize us to charge the payment method you provide.
        </p>

        <h3 className="text-xl font-bold mt-6">3.3 Refunds</h3>
        <p className="leading-relaxed">
          Purchased credits are non-refundable except as required by applicable law.
          If a generation fails due to a technical error on our part, the credits
          used for that generation will be automatically refunded to your account.
        </p>

        <h3 className="text-xl font-bold mt-6">3.4 Credit Expiration</h3>
        <p className="leading-relaxed">
          Purchased credits do not expire as long as your account remains active and
          in good standing.
        </p>
      </section>

      {/* Section 4: User Obligations */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          4. User Obligations
        </h2>
        <p className="leading-relaxed">
          When using the Service, you agree not to:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-destructive mt-2 flex-shrink-0"></span>
            <span>Generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-destructive mt-2 flex-shrink-0"></span>
            <span>Generate content that infringes on intellectual property rights of others</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-destructive mt-2 flex-shrink-0"></span>
            <span>Generate content depicting minors in any inappropriate context</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-destructive mt-2 flex-shrink-0"></span>
            <span>Attempt to circumvent any security features or rate limits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-destructive mt-2 flex-shrink-0"></span>
            <span>Use the Service for any unlawful purpose or in violation of any regulations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-destructive mt-2 flex-shrink-0"></span>
            <span>Share your account credentials with third parties</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-destructive mt-2 flex-shrink-0"></span>
            <span>Use automated systems to access the Service without our express permission</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-destructive mt-2 flex-shrink-0"></span>
            <span>Interfere with or disrupt the Service or servers</span>
          </li>
        </ul>
      </section>

      {/* Section 5: Intellectual Property Rights */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          5. Intellectual Property Rights
        </h2>

        <h3 className="text-xl font-bold mt-6">5.1 Our Content</h3>
        <p className="leading-relaxed">
          The Service, including its original content, features, and functionality,
          is owned by {companyName} and is protected by international copyright,
          trademark, patent, trade secret, and other intellectual property laws.
        </p>

        <h3 className="text-xl font-bold mt-6">5.2 Your Generated Content</h3>
        <p className="leading-relaxed">
          Subject to these Terms, you retain ownership of the assets you generate
          using the Service. You grant us a non-exclusive, worldwide, royalty-free
          license to use, reproduce, and display your generated content solely for
          the purpose of providing and improving the Service.
        </p>

        <h3 className="text-xl font-bold mt-6">5.3 Your Input Content</h3>
        <p className="leading-relaxed">
          You represent and warrant that you own or have the necessary rights to
          any content you upload to the Service (including brand assets, reference
          images, and logos) and that such content does not infringe the rights of
          any third party.
        </p>
      </section>

      {/* Section 6: Third-Party Services */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          6. Third-Party Services
        </h2>
        <p className="leading-relaxed">
          Our Service integrates with third-party AI providers and services to
          deliver functionality. Your use of the Service is also subject to the
          terms and policies of these third-party providers, including but not
          limited to:
        </p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>AI image and video generation services</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Payment processing services (Stripe)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-foreground mt-2 flex-shrink-0"></span>
            <span>Cloud storage and hosting services</span>
          </li>
        </ul>
      </section>

      {/* Section 7: Limitation of Liability */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          7. Limitation of Liability
        </h2>
        <div className="border-4 border-foreground bg-card p-6">
          <p className="leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName.toUpperCase()} SHALL NOT
            BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
            INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
            RESULTING FROM:
          </p>
          <ul className="list-none space-y-2 mt-4">
            <li className="flex items-start gap-2">
              <span className="font-bold">(a)</span>
              <span>Your use of or inability to use the Service</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">(b)</span>
              <span>Any unauthorized access to or use of our servers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">(c)</span>
              <span>Any interruption or cessation of transmission to or from the Service</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">(d)</span>
              <span>Any bugs, viruses, or other harmful code transmitted through the Service</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">(e)</span>
              <span>Any content obtained from the Service</span>
            </li>
          </ul>
        </div>
        <p className="leading-relaxed">
          In no event shall our total liability to you exceed the amount you have
          paid us in the twelve (12) months preceding the claim.
        </p>
      </section>

      {/* Section 8: Disclaimer of Warranties */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          8. Disclaimer of Warranties
        </h2>
        <p className="leading-relaxed">
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
          OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
          IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT.
        </p>
        <p className="leading-relaxed">
          We do not warrant that the Service will be uninterrupted, secure, or
          error-free, that defects will be corrected, or that the Service is free
          of viruses or other harmful components.
        </p>
      </section>

      {/* Section 9: Termination */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          9. Termination
        </h2>
        <p className="leading-relaxed">
          We may terminate or suspend your account and access to the Service
          immediately, without prior notice or liability, for any reason,
          including without limitation if you breach these Terms.
        </p>
        <p className="leading-relaxed">
          Upon termination, your right to use the Service will immediately cease.
          All provisions of these Terms which by their nature should survive
          termination shall survive, including ownership provisions, warranty
          disclaimers, indemnity, and limitations of liability.
        </p>
        <p className="leading-relaxed">
          You may delete your account at any time through your account settings.
          Upon account deletion, your data will be handled in accordance with our
          Privacy Policy.
        </p>
      </section>

      {/* Section 10: Changes to Terms */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          10. Changes to Terms
        </h2>
        <p className="leading-relaxed">
          We reserve the right to modify or replace these Terms at any time. If a
          revision is material, we will provide at least 30 days&apos; notice prior to
          any new terms taking effect. What constitutes a material change will be
          determined at our sole discretion.
        </p>
        <p className="leading-relaxed">
          By continuing to access or use our Service after any revisions become
          effective, you agree to be bound by the revised terms. If you do not
          agree to the new terms, you are no longer authorized to use the Service.
        </p>
      </section>

      {/* Section 11: Governing Law */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          11. Governing Law
        </h2>
        <p className="leading-relaxed">
          These Terms shall be governed and construed in accordance with the laws
          of the United States, without regard to its conflict of law provisions.
          Any disputes arising from these Terms or the Service shall be resolved
          through binding arbitration in accordance with the rules of the American
          Arbitration Association.
        </p>
      </section>

      {/* Section 12: Contact Information */}
      <section className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-primary pl-4">
          12. Contact Information
        </h2>
        <p className="leading-relaxed">
          If you have any questions about these Terms, please contact us:
        </p>
        <div className="border-4 border-foreground bg-card p-6">
          <p className="font-bold">{companyName}</p>
          <p className="text-muted-foreground mt-2">
            Email: <a href={`mailto:${contactEmail}`} className="underline underline-offset-4 hover:text-foreground">{contactEmail}</a>
          </p>
        </div>
      </section>

      {/* Acknowledgment */}
      <section className="border-t-4 border-foreground pt-8 mt-12">
        <div className="border-4 border-primary bg-primary/5 p-6">
          <h3 className="font-black uppercase tracking-wide mb-2">Acknowledgment</h3>
          <p className="text-muted-foreground">
            By using the Service, you acknowledge that you have read these Terms of
            Service, understood them, and agree to be bound by them. If you do not
            agree to these Terms, you are not authorized to use the Service.
          </p>
        </div>
      </section>
    </article>
  );
}
