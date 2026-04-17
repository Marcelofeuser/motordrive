import { ChevronRight, type LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ReactNode } from "react";

interface SettingsRowProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  value?: ReactNode;
  badge?: string;
  badgeVariant?: "default" | "warning" | "danger" | "success";
  onClick?: () => void;
  toggle?: { checked: boolean; onChange: (v: boolean) => void };
  danger?: boolean;
  hideChevron?: boolean;
}

export function SettingsRow({
  icon: Icon,
  label,
  description,
  value,
  badge,
  badgeVariant = "default",
  onClick,
  toggle,
  danger,
  hideChevron,
}: SettingsRowProps) {
  const badgeColors = {
    default: "bg-muted text-muted-foreground",
    warning: "bg-warning/20 text-warning",
    danger: "bg-destructive/20 text-destructive",
    success: "bg-accent/20 text-accent",
  };

  const interactive = !!onClick && !toggle;
  const Component = interactive ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        interactive ? "hover:bg-muted/40 active:bg-muted/60" : ""
      } ${danger ? "text-destructive" : ""}`}
    >
      {Icon && (
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            danger ? "bg-destructive/15" : "bg-muted"
          }`}
        >
          <Icon className={`w-4.5 h-4.5 ${danger ? "text-destructive" : "text-foreground/80"}`} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${danger ? "text-destructive" : ""}`}>
            {label}
          </span>
          {badge && (
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${badgeColors[badgeVariant]}`}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        )}
      </div>
      {value && <span className="text-xs text-muted-foreground truncate max-w-[40%]">{value}</span>}
      {toggle && (
        <Switch
          checked={toggle.checked}
          onCheckedChange={toggle.onChange}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      {interactive && !hideChevron && !toggle && (
        <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
      )}
    </Component>
  );
}

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  danger?: boolean;
}

export function SettingsSection({ title, children, danger }: SettingsSectionProps) {
  return (
    <section className="mb-6">
      <h3
        className={`text-[11px] font-semibold uppercase tracking-widest mb-2 px-1 ${
          danger ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {title}
      </h3>
      <div
        className={`rounded-2xl border overflow-hidden divide-y divide-border/50 ${
          danger ? "bg-destructive/5 border-destructive/30" : "bg-card border-border"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
