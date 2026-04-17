import PageHeader from "@/components/PageHeader";

export default function Relatorios() {
  return (
    <div className="px-4 pt-8 pb-28 max-w-md mx-auto">
      <PageHeader title="Relatórios" subtitle="Análise completa" />
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">Em breve — gráficos comparativos, exportação PDF/Excel e insights.</p>
      </div>
    </div>
  );
}
