// src/pages/legal/Termos.tsx
import { FileCheck } from "lucide-react";

export default function Termos() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md px-5 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Termos de Uso</h1>
            <p className="text-sm text-white/60">Regras para uso do Driver Control Pro</p>
          </div>
        </div>

        <div className="space-y-3">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">1. Aceitação</h2>
            <p className="text-sm leading-6 text-white/70">
              Ao utilizar o aplicativo, você concorda com estes termos e com a política de privacidade.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">2. Uso permitido</h2>
            <p className="text-sm leading-6 text-white/70">
              O app deve ser utilizado para gestão pessoal ou profissional de dados operacionais
              relacionados à atividade do motorista.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">3. Responsabilidade do usuário</h2>
            <p className="text-sm leading-6 text-white/70">
              O usuário é responsável pelos dados lançados, pela veracidade das informações e pelo
              uso legal dos documentos enviados.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">4. Funcionalidades e estimativas</h2>
            <p className="text-sm leading-6 text-white/70">
              Algumas análises, alertas e cálculos podem depender de dados informados pelo usuário
              e podem representar estimativas operacionais.
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="mb-2 text-lg font-medium">5. Suspensão e encerramento</h2>
            <p className="text-sm leading-6 text-white/70">
              Podemos atualizar, limitar ou remover funcionalidades do app para manutenção,
              segurança, conformidade técnica ou evolução do produto.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}