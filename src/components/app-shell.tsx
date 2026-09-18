import Link from "next/link";

const nav = [
  { href: "/", label: "Sort" },
  { href: "/lab", label: "SortLab" },
  { href: "/rulebook", label: "Rulebook" },
  { href: "/impact", label: "My Impact" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ borderColor: "var(--line)", background: "rgba(7,20,16,0.75)" }}>
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span aria-hidden className="grid h-7 w-7 place-items-center rounded-lg text-sm" style={{ background: "linear-gradient(135deg,#34d399,#14b8a6)", color: "#04120d" }}>
              SC
            </span>
            <span>
              Sort<span style={{ color: "var(--accent)" }}>Call</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-1.5 font-medium transition hover:bg-white/5"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6">{children}</main>
      <footer className="border-t py-5 text-center text-xs muted" style={{ borderColor: "var(--line)" }}>
        SortCall · Earth Forward · NextStep Hacks 2026 — disposal guidance is educational; always check your local program.
      </footer>
    </div>
  );
}
