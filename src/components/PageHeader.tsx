interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {subtitle && (
        <p className="text-muted-foreground font-medium tracking-widest text-xs uppercase mb-1">
          {subtitle}
        </p>
      )}
      <h1 className="text-2xl font-display font-bold tracking-tight">{title}</h1>
    </div>
  );
}
