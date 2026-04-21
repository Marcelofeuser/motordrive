import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "electric" | "pink" | "green";
  onClick?: () => void;
}

const variantStyles = {
  default: "text-foreground",
  electric: "text-primary",
  pink: "text-secondary",
  green: "text-velocity-green",
};

export default function StatCard({ label, value, unit, subtitle, icon: Icon, variant = "default", onClick }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`glass-card p-5 flex flex-col justify-between${onClick ? " cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          {label}
        </p>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div>
        <div className="flex items-end gap-1.5">
          <span className={`text-3xl font-display font-bold tracking-tighter ${variantStyles[variant]}`}>
            {value}
          </span>
          {unit && (
            <span className="text-base text-muted-foreground font-light pb-0.5 italic">
              {unit}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
