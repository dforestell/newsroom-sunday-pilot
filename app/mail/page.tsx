import { siteUrl } from "@/lib/site";
import { DeskMailForm } from "@/components/desk-mail-form";

export const metadata = { title: "Mail the Desk", alternates: { canonical: siteUrl("/mail") } };

export default function MailPage() {
  return (
    <div className="max-w-2xl space-y-5">
      <section className="space-y-2">
        <p className="font-mono text-sm tracking-[0.18em] text-masthead uppercase">Poor Form Desk</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Mail the Desk</h1>
        <p className="text-sm leading-6 text-ink-soft">
          Send a note, a receipt, or a complaint about a lower-third. This is the desk inbox, not a support ticket.
        </p>
      </section>
      <DeskMailForm />
    </div>
  );
}
