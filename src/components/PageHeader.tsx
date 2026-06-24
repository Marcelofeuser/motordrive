import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-3 text-xs font-medium">
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>
      {subtitle && (
        <p className="text-muted-foreground font-medium tracking-widest text-xs uppercase mb-1">
          {subtitle}
        </p>
      )}
      <h1 className="text-2xl font-display font-bold tracking-tight">{title}</h1>
    </div>
  );
}
