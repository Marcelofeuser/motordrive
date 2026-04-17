import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const legalLinks = [
  { to: "/ajuda", label: "Ajuda" },
  { to: "/suporte", label: "Suporte" },
  { to: "/faq", label: "FAQ" },
  { to: "/privacidade", label: "Privacidade" },
  { to: "/termos", label: "Termos" },
];

interface LegalLayoutProps {
  children: ReactNode;
  icon: LucideIcon;
  meta?: string;
  subtitle: string;
  title: string;
}

export default function LegalLayout({
  children,
  icon: Icon,
  meta,
  subtitle,
  title,
}: LegalLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md px-5 py-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="text-sm text-white/60">{subtitle}</p>
              {meta ? <p className="mt-1 text-xs text-white/40">{meta}</p> : null}
            </div>
          </div>

          <Link
            to="/"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Abrir app
          </Link>
        </div>

        <div className="space-y-3">{children}</div>

        <nav className="mt-6 flex flex-wrap gap-2">
          {legalLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                location.pathname === link.to
                  ? "border-white/20 bg-white text-black"
                  : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
