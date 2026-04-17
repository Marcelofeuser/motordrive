// src/pages/legal/Suporte.tsx
import { Headphones, Mail, MessageCircle, Clock3 } from "lucide-react";

export default function Suporte() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md px-5 py-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Falar com suporte</h1>
            <p className="text-sm text-white/60">Atendimento e canais oficiais.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium">E-mail</h2>
                <p className="text-sm text-white/60">suporte@drivercontrolpro.com</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium">WhatsApp</h2>
                <p className="text-sm text-white/60">(62) 99999-9999</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium">Horário de atendimento</h2>
                <p className="text-sm text-white/60">Segunda a sexta, das 08h às 18h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm leading-6 text-amber-100">
            Para agilizar o suporte, informe o problema, a tela afetada e, se possível, envie print
            ou documento relacionado.
          </p>
        </div>
      </div>
    </div>
  );
}