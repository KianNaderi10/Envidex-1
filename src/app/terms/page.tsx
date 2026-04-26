import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Envidex",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-bold mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
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
          Terms of Service
        </h1>
      </div>

      <div className="px-5 pb-12 max-w-prose">
        <p className="text-xs text-muted-foreground mb-8">Last updated: April 25, 2026</p>

        <Section title="Acceptance">
          <p>
            By creating an account or using Envidex, you agree to these terms. If you do not agree,
            do not use the app.
          </p>
        </Section>

        <Section title="What Envidex is">
          <p>
            Envidex is an educational tool that uses AI to identify species from photos and provide
            conservation information. It is intended to raise awareness about wildlife and biodiversity.
          </p>
          <p>
            Species identifications are AI-generated and may not always be accurate. Do not rely on
            Envidex for scientific, medical, safety, or legal decisions.
          </p>
        </Section>

        <Section title="Your account">
          <p>You are responsible for keeping your account credentials secure. You must not:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Share your account with others</li>
            <li>Create accounts using false information</li>
            <li>Attempt to access another user&apos;s account</li>
            <li>Use automated tools to create accounts or make requests</li>
          </ul>
        </Section>

        <Section title="Acceptable use">
          <p>You may use Envidex for personal, non-commercial purposes. You must not:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Upload images that are illegal, harmful, or violate others&apos; rights</li>
            <li>Attempt to reverse-engineer, scrape, or abuse the API</li>
            <li>Use the service in any way that disrupts or damages it</li>
            <li>Use identification results to facilitate harm to wildlife</li>
          </ul>
        </Section>

        <Section title="AI-generated content">
          <p>
            Species identification results, descriptions, conservation data, and advice are generated
            by AI and provided for informational purposes only. We make no warranties about their
            accuracy, completeness, or fitness for any particular purpose.
          </p>
          <p>
            Always verify important information with qualified experts or authoritative sources such
            as the IUCN Red List.
          </p>
        </Section>

        <Section title="Intellectual property">
          <p>
            The Envidex name, logo, design, and code are our property. You may not copy, reproduce,
            or distribute them without permission.
          </p>
          <p>
            Photos you upload remain yours. By uploading them, you grant us a limited licence to
            transmit them to our AI provider solely for the purpose of species identification.
          </p>
        </Section>

        <Section title="Disclaimer of warranties">
          <p>
            Envidex is provided &quot;as is&quot; without any warranty of any kind. We do not
            guarantee the service will be available, error-free, or that identification results will
            be accurate.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the fullest extent permitted by law, Envidex and its creators are not liable for any
            indirect, incidental, or consequential damages arising from your use of the app,
            including reliance on species identification results.
          </p>
        </Section>

        <Section title="Account termination">
          <p>
            You can delete your account at any time in Settings. We reserve the right to suspend or
            terminate accounts that violate these terms without prior notice.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms from time to time. We will update the date at the top of this
            page when we do. Continued use of Envidex after changes constitutes acceptance.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these terms? Email us at{" "}
            <span className="text-primary">legal@envidex.app</span>.
          </p>
        </Section>
      </div>
    </div>
  );
}
