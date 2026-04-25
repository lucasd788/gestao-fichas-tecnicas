import { useEffect } from "react";
import { useFicha } from "../contexts/FichaContext";

export default function SecaoRendimentoEquipamentos() {
  const { rendimento, setRendimento, ingredientes } = useFicha();

  const totalLiquido = ingredientes.reduce(
    (acc, ing) => acc + (Number(ing.pesoLiquido) || 0),
    0,
  );

  useEffect(() => {
    if (totalLiquido > 0 && typeof rendimento.pesoTotal === "number") {
      const novoFC = Number((rendimento.pesoTotal / totalLiquido).toFixed(3));
      if (rendimento.fatorCoccao !== novoFC) {
        setRendimento((prev) => ({ ...prev, fatorCoccao: novoFC }));
      }
    }
  }, [
    totalLiquido,
    rendimento.pesoTotal,
    setRendimento,
    rendimento.fatorCoccao,
  ]);

  const lidarComTexto = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setRendimento((prev) => ({ ...prev, [name]: value }));
  };

  const atualizarNumerico = (campo: string, valorStr: string) => {
    if (valorStr === "") {
      setRendimento((prev) => ({ ...prev, [campo]: "" }));
      return;
    }

    const valor = Math.max(0, Number(valorStr));

    setRendimento((prev) => {
      const novo: any = { ...prev, [campo]: valor };
      const historicoAtual = prev.historico || [];
      const novoHistorico = [
        campo,
        ...historicoAtual.filter((c: string) => c !== campo),
      ].slice(0, 2);

      novo.historico = novoHistorico;

      if (novoHistorico.length === 2) {
        const calcularTotal = !novoHistorico.includes("pesoTotal");
        const calcularPorcao = !novoHistorico.includes("pesoPorcao");
        const calcularRendimento = !novoHistorico.includes("rendimentoPorcoes");

        if (
          calcularTotal &&
          typeof novo.pesoPorcao === "number" &&
          novo.pesoPorcao > 0 &&
          typeof novo.rendimentoPorcoes === "number" &&
          novo.rendimentoPorcoes > 0
        ) {
          novo.pesoTotal = Number(
            (novo.pesoPorcao * novo.rendimentoPorcoes).toFixed(1),
          );
        } else if (
          calcularPorcao &&
          typeof novo.pesoTotal === "number" &&
          typeof novo.rendimentoPorcoes === "number" &&
          novo.rendimentoPorcoes > 0
        ) {
          novo.pesoPorcao = Number(
            (novo.pesoTotal / novo.rendimentoPorcoes).toFixed(1),
          );
        } else if (
          calcularRendimento &&
          typeof novo.pesoTotal === "number" &&
          typeof novo.pesoPorcao === "number" &&
          novo.pesoPorcao > 0
        ) {
          novo.rendimentoPorcoes = Number(
            (novo.pesoTotal / novo.pesoPorcao).toFixed(0),
          );
        }
      }

      return novo;
    });
  };

  const estiloInput =
    "w-full p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-xs shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600";
  const estiloLabel =
    "text-[10px] font-bold text-zinc-600 dark:text-zinc-400 tracking-wider mb-1 ml-1 block uppercase";

  return (
    <section className="bg-white dark:bg-zinc-900 p-4 shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 border-l-4 border-indigo-500 pl-3">
        Rendimento e Equipamentos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={estiloLabel}>FATOR DE COCÇÃO (FC):</label>
              <input
                type="number"
                readOnly
                value={rendimento.fatorCoccao || ""}
                className={`${estiloInput} bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed font-mono text-indigo-600 dark:text-indigo-400`}
                placeholder="0.000"
              />
            </div>
            <div className="flex flex-col">
              <label className={estiloLabel}>PESO TOTAL COZIDO (g):</label>
              <input
                type="number"
                value={rendimento.pesoTotal}
                onChange={(e) => atualizarNumerico("pesoTotal", e.target.value)}
                className={estiloInput}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={estiloLabel}>Nº DE PORÇÕES:</label>
              <input
                type="number"
                value={rendimento.rendimentoPorcoes}
                onChange={(e) =>
                  atualizarNumerico("rendimentoPorcoes", e.target.value)
                }
                className={estiloInput}
                placeholder="1"
              />
            </div>
            <div className="flex flex-col">
              <label className={estiloLabel}>PESO / PORÇÃO (g):</label>
              <input
                type="number"
                value={rendimento.pesoPorcao}
                onChange={(e) =>
                  atualizarNumerico("pesoPorcao", e.target.value)
                }
                className={estiloInput}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className={estiloLabel}>MEDIDA CASEIRA / PORÇÃO:</label>
            <input
              type="text"
              name="medidaCaseiraPorcao"
              value={rendimento.medidaCaseiraPorcao}
              onChange={lidarComTexto}
              className={estiloInput}
              placeholder="Ex: 1 fatia média"
            />
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex flex-col flex-grow">
            <label className={estiloLabel}>UTENSÍLIOS E EQUIPAMENTOS:</label>
            <textarea
              name="equipamentos"
              value={rendimento.equipamentos}
              onChange={lidarComTexto}
              className={`${estiloInput} flex-grow resize-none leading-relaxed min-h-[100px]`}
              placeholder="Liste os equipamentos necessários..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
