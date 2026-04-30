import { useEffect } from "react";
import { X, Keyboard, Zap, Save } from "lucide-react";

interface ModalAjudaProps {
  aberto: boolean;
  fecharModal: () => void;
}

export default function ModalAjuda({ aberto, fecharModal }: ModalAjudaProps) {
  useEffect(() => {
    const lidarComEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") fecharModal();
    };
    if (aberto) window.addEventListener("keydown", lidarComEsc);
    return () => window.removeEventListener("keydown", lidarComEsc);
  }, [aberto, fecharModal]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={fecharModal}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Guia Rápido de Uso
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Como usar o sistema de forma mais eficiente.
            </p>
          </div>
          <button
            onClick={fecharModal}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
              <Keyboard size={18} /> Navegação por Teclado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CartaoAtalho
                teclas={["Enter"]}
                descricao="Seleciona o primeiro ingrediente sugerido e salta para o peso."
              />
              <CartaoAtalho
                teclas={["Ctrl", "S"]}
                descricao="Salva a Ficha Técnica manualmente a qualquer momento."
              />
              <CartaoAtalho
                teclas={["Enter"]}
                descricao="(Nos campos numéricos) Cria uma nova linha ou salta para a próxima."
              />
              <CartaoAtalho
                teclas={["Ctrl", "Delete"]}
                descricao="Apaga a linha do ingrediente que está focado."
              />
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
              <Zap size={18} /> Funcionalidades Inteligentes
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="text-indigo-500 mt-1">
                  <Save size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Salvamento Automático (AutoSave)
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Não se preocupe em perder dados. O sistema salva a sua ficha
                    automaticamente a cada 30 segundos, desde que ela tenha um
                    nome ou pelo menos um ingrediente preenchido.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-center">
          <button
            onClick={fecharModal}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}

function CartaoAtalho({
  teclas,
  descricao,
}: {
  teclas: string[];
  descricao: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex flex-wrap gap-1 shrink-0 mt-0.5">
        {teclas.map((t, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300"
          >
            {t}
          </span>
        ))}
      </div>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
        {descricao}
      </p>
    </div>
  );
}
