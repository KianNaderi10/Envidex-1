import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Envidex",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-bold mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-4 pt-10 pb-6">
        <Link
          href="/settings"
          className="h-9 w-9 rounded-full border border-border/60 bg-card/60 flex items-center justify-center text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Privacy Policy
        </h1>
      </div>

      <div className="px-5 pb-12 max-w-prose">
        <p className="text-xs text-muted-foreground mb-8">Last updated: April 25, 2026</p>

        <Section title="Overview">
          <p>
            Envidex is an AI-powered species identification app. We take your privacy seriously and
            collect only what is necessary to provide the service. This policy explains what we
            collect, how we use it, and your rights.
          </p>
        </Section>

        <Section title="What we collect">
          <p><span className="font-medium text-foreground">Account information</span> — When you create an account, we store your name, email address, and a hashed (encrypted) version of your password. If you sign in with Google or GitHub, we store your name, email, and profile image provided by that service.</p>
          <p><span className="font-medium text-foreground">Photos you upload</span> — When you use the scan feature, your photo is sent to Anthropic&apos;s API for species identification. We do not store your photos on our servers. The image is transmitted, analysed, and discarded.</p>
          <p><span className="font-medium text-foreground">Your collection</span> — Species you add to your field guide are stored locally on your device. They are not uploaded to our servers.</p>
          <p><span className="font-medium text-foreground">Session data</span> — We use secure, server-side sessions to keep you signed in. Session tokens are stored in our database and expire automatically.</p>
        </Section>

        <Section title="How we use your data">
          <p>We use your information only to:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Authenticate your account and keep you signed in</li>
            <li>Display your name and profile within the app</li>
            <li>Send your photos to Anthropic&apos;s API for species identification</li>
          </ul>
          <p>We do not sell your data, use it for advertising, or share it with any third party beyond what is described here.</p>
        </Section>

        <Section title="Anthropic API">
          <p>
            Species identification is powered by Anthropic&apos;s Claude AI. Photos you upload are
            transmitted to Anthropic&apos;s servers for processing. Anthropic&apos;s own privacy
            policy governs how they handle this data. We recommend reviewing it at{" "}
            <span className="text-primary">anthropic.com/privacy</span>.
          </p>
          <p>
            We do not send any personally identifiable information alongside your photos.
          </p>
        </Section>

        <Section title="Data storage and security">
          <p>
            Your account data is stored in MongoDB Atlas, hosted on secure cloud infrastructure.
            Passwords are hashed using bcrypt and are never stored in plain text. We use
            industry-standard TLS encryption for all data in transit.
          </p>
        </Section>

        <Section title="Your rights">
          <p>You can at any time:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Update your name and email in Settings → Change information</li>
            <li>Delete your account in Settings, which permanently removes all your data from our servers</li>
            <li>Clear your local collection in the app</li>
          </ul>
        </Section>

        <Section title="Cookies">
          <p>
            We use a single session cookie to keep you signed in. We do not use tracking,
            analytics, or advertising cookies.
          </p>
        </Section>

        <Section title="Children">
          <p>
            Envidex is not directed at children under 13. We do not knowingly collect personal
            information from children.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we make material changes to this policy, we will update the date at the top of this
            page. Continued use of Envidex after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Email us at{" "}
            <span className="text-primary">privacy@envidex.app</span>.
          </p>
        </Section>
      </div>
    </div>
  );
}
