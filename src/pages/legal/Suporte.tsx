import { Headphones, Mail, MessageCircle, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import LegalLayout from "@/components/legal/LegalLayout";

export default function Suporte() {
  return (
    <LegalLayout
      icon={Headphones}
      title="Falar com suporte"
      subtitle="Atendimento e canais oficiais."
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-medium">E-mail</h2>
            <a
              href="mailto:suporte@drivercontrolpro.com"
              className="text-sm text-white/70 underline underline-offset-4"
            >
              suporte@drivercontrolpro.com
            </a>
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

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="mb-2 text-base font-medium">Atalhos úteis</h2>
        <p className="text-sm leading-6 text-white/70">
          Antes de abrir um chamado, vale conferir a{" "}
          <Link to="/faq" className="font-medium text-white underline underline-offset-4">
            FAQ
          </Link>{" "}
          e a{" "}
          <Link to="/ajuda" className="font-medium text-white underline underline-offset-4">
            Central de Ajuda
          </Link>
          . Para temas de privacidade ou remoção de conta, consulte também a{" "}
          <Link
            to="/privacidade#exclusao"
            className="font-medium text-white underline underline-offset-4"
          >
            política de privacidade
          </Link>
          .
        </p>
      </div>

      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4">
        <p className="text-sm leading-6 text-amber-100">
          Para agilizar o suporte, informe o problema, a tela afetada e, se possível, envie print
          ou documento relacionado.
        </p>
      </div>
    </LegalLayout>
  );
}
