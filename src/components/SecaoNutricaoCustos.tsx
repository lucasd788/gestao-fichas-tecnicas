import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { useFicha } from "../contexts/FichaContext";
import { buscarDadosTabela } from "../database/conexao";
import { DadosNutricionais } from "../types/ficha";

export default function SecaoNutricaoCustos() {
  const { ingredientes, rendimento } = useFicha();
  const [bancoTabela, setBancoTabela] = useState<Record<string, any>>({});
  const [modoEdicao, setModoEdicao] = useState<"porcao" | "base100g">("porcao");
  const [dadosExtras, setDadosExtras] = useState<
    Record<string, Partial<DadosNutricionais>>
  >({});
  const [baseExtras, setBaseExtras] = useState<
    Record<string, Partial<DadosNutricionais>>
  >({});

  useEffect(() => {
    buscarDadosTabela().then(setBancoTabela).catch(console.error);
  }, []);

  const lidarComMudanca = (
    id: string,
    campo: keyof DadosNutricionais,
    valor: number,
  ) => {
    if (modoEdicao === "base100g") {
      setBaseExtras((prev) => ({
        ...prev,
        [id]: { ...prev[id], [campo]: valor },
      }));
    } else {
      setDadosExtras((prev) => ({
        ...prev,
        [id]: { ...prev[id], [campo]: valor },
      }));
    }
  };

  const resetarLinha = (id: string) => {
    if (modoEdicao === "base100g") {
      setBaseExtras((prev) => {
        const novo = { ...prev };
        delete novo[id];
        return novo;
      });
    } else {
      setDadosExtras((prev) => {
        const novo = { ...prev };
        delete novo[id];
        return novo;
      });
    }
  };

  const obterValorBase = (ing: any, campo: string) => {
    if (baseExtras[ing.id]?.[campo as keyof DadosNutricionais] !== undefined)
      return Number(baseExtras[ing.id][campo as keyof DadosNutricionais]);
    return bancoTabela[ing.nome]?.[campo] !== undefined
      ? Number(bancoTabela[ing.nome][campo])
      : 0;
  };

  const obterValorPorcao = (ing: any, campo: string) => {
    const nPorcoes = Number(rendimento.rendimentoPorcoes) || 1;
    const perCapitaLiquido = ing.pesoLiquido / nPorcoes;
    const perCapitaBruto = ing.pesoBruto / nPorcoes;

    if (campo === "perCapitaBruto") return perCapitaBruto;
    if (campo === "perCapitaLiquido") return perCapitaLiquido;
    const precoEfetivo = obterValorBase(ing, "precoUnitario");
    if (campo === "precoUnitario") return precoEfetivo;
    if (campo === "custoUnitario")
      return (precoEfetivo / 1000) * perCapitaBruto;

    if (dadosExtras[ing.id]?.[campo as keyof DadosNutricionais] !== undefined)
      return Number(dadosExtras[ing.id][campo as keyof DadosNutricionais]);

    const valorBase = obterValorBase(ing, campo);
    return (valorBase / 100) * perCapitaLiquido;
  };

  const calcularTotal = (campo: string) => {
    return ingredientes.reduce(
      (acc, ing) => acc + (Number(obterValorPorcao(ing, campo)) || 0),
      0,
    );
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatarNumero = (valorString: string) => {
    const apenasNumeros = valorString.replace(/\D/g, "");
    return Number(apenasNumeros) / 100;
  };

  const inputBaseClass =
    "w-full p-1 bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 rounded outline-none text-[11px] transition-all";

  return (
    <section className="bg-white dark:bg-zinc-900 p-4 shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 border-l-4 border-indigo-500 pl-3">
          Custos e Nutrição
        </h2>

        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setModoEdicao("porcao")}
            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${
              modoEdicao === "porcao"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Porção
          </button>
          <button
            onClick={() => setModoEdicao("base100g")}
            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${
              modoEdicao === "base100g"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Base 100g
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[600px]">
        <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
          <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-950 shadow-sm">
            <tr className="text-zinc-600 dark:text-zinc-400 text-[9px] font-bold tracking-wider uppercase">
              <th className="p-2 border-b border-zinc-200 dark:border-zinc-800 w-[25%] text-center">
                Ingrediente
              </th>
              <th className="p-1 text-center border-b border-zinc-200 dark:border-zinc-800 w-16">
                <span className="block">{"P.C.B"}</span>
                <span className="text-[8px] font-normal opacity-70 lowercase italic">
                  {"(g)"}
                </span>
              </th>
              <th className="p-1 text-center border-b border-zinc-200 dark:border-zinc-800 w-24">
                <span className="block">{"Preço"}</span>
                <span className="text-[8px] font-normal opacity-70 italic">
                  {"(R$)"}
                </span>
              </th>
              <th className="p-1 text-center border-b border-zinc-200 dark:border-zinc-800 w-20">
                <span className="block">{"Custo"}</span>
                <span className="text-[8px] font-normal opacity-70 italic">
                  {"(R$)"}
                </span>
              </th>
              <th className="p-1 text-center border-b border-zinc-200 dark:border-zinc-800 w-16">
                <span className="block">{"P.C.L"}</span>
                <span className="text-[8px] font-normal opacity-70 lowercase italic">
                  {"(g)"}
                </span>
              </th>
              {[
                ["Energia", "(kcal)"],
                ["Carbo.", "(g)"],
                ["Prot.", "(g)"],
                ["Lipid.", "(g)"],
                ["Satur.", "(g)"],
                ["Sódio", "(mg)"],
                ["Fibra", "(g)"],
              ].map(([nome, unidade]) => (
                <th
                  key={nome}
                  className="p-1 text-center border-b border-zinc-200 dark:border-zinc-800 w-14 leading-tight"
                >
                  <span className="block">{nome}</span>
                  <span className="text-[8px] font-normal opacity-70 lowercase italic">
                    {unidade}
                  </span>
                </th>
              ))}
              <th className="p-1 border-b border-zinc-200 dark:border-zinc-800 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-[11px]">
            {ingredientes.map((ing) => {
              const exibindoBase = modoEdicao === "base100g";
              return (
                <tr
                  key={ing.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-2 py-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                    <div className="truncate" title={ing.nome}>
                      {ing.nome || "---"}
                    </div>
                    {exibindoBase && (
                      <span className="block text-[8px] text-indigo-500 font-bold uppercase">
                        Base 100g
                      </span>
                    )}
                  </td>
                  <td className="p-1 text-center text-zinc-500">
                    {exibindoBase
                      ? "-"
                      : obterValorPorcao(ing, "perCapitaBruto")
                          .toFixed(2)
                          .replace(".", ",")}
                  </td>

                  <td className="p-1">
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-zinc-400 text-[9px] pointer-events-none mt-px">
                        R$
                      </span>
                      <input
                        type="text"
                        value={formatarMoeda(
                          obterValorBase(ing, "precoUnitario") || 0,
                        )}
                        onChange={(e) => {
                          const numeroReal = formatarNumero(e.target.value);
                          setBaseExtras((prev) => ({
                            ...prev,
                            [ing.id]: {
                              ...prev[ing.id],
                              precoUnitario: numeroReal,
                            },
                          }));
                        }}
                        className={`${inputBaseClass} pl-6 pr-2 text-right`}
                      />
                    </div>
                  </td>

                  <td className="p-1 font-bold">
                    {exibindoBase ? (
                      <div className="text-center">-</div>
                    ) : (
                      <div className="flex justify-between items-center px-1.5 w-full">
                        <span className="text-[9px] mt-px">R$</span>
                        <span>
                          {formatarMoeda(
                            obterValorPorcao(ing, "custoUnitario"),
                          )}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="p-1 text-center text-zinc-500">
                    {exibindoBase
                      ? "-"
                      : obterValorPorcao(ing, "perCapitaLiquido")
                          .toFixed(2)
                          .replace(".", ",")}
                  </td>

                  {[
                    "energia",
                    "carboidratos",
                    "proteinas",
                    "lipideos",
                    "lipideosSaturados",
                    "sodio",
                    "fibra",
                  ].map((c) => {
                    const vBase = obterValorBase(ing, c);
                    const vFinal = exibindoBase
                      ? vBase
                      : obterValorPorcao(ing, c);
                    const editado = exibindoBase
                      ? baseExtras[ing.id]?.[c as keyof DadosNutricionais] !==
                        undefined
                      : dadosExtras[ing.id]?.[c as keyof DadosNutricionais] !==
                        undefined;
                    return (
                      <td key={c} className="p-0.5">
                        <input
                          type="number"
                          value={vFinal ? vFinal.toFixed(2) : "0.00"}
                          title={`Valor original (100g): ${vBase.toFixed(2)}`}
                          step="0.01"
                          onChange={(e) =>
                            lidarComMudanca(
                              ing.id,
                              c as any,
                              Number(e.target.value),
                            )
                          }
                          className={`${inputBaseClass} text-center ${editado ? "text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
                        />
                      </td>
                    );
                  })}

                  <td className="p-1 text-center">
                    <button
                      onClick={() => resetarLinha(ing.id)}
                      className="text-zinc-400 hover:text-indigo-600 p-1 rounded-lg transition-all opacity-80 dark:opacity-30 group-hover:opacity-100 focus:opacity-100"
                      title="Restaurar valores"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          <tfoot className="bg-zinc-200/50 dark:bg-zinc-800/50 font-black sticky bottom-0 text-[11px] backdrop-blur-sm">
            <tr>
              <td className="p-2 uppercase text-[9px] text-zinc-700 dark:text-zinc-300">
                TOTAL
              </td>
              <td colSpan={2}></td>
              <td className="p-1">
                <div className="flex justify-between items-center px-1 w-full">
                  <span className="text-[10px] mt-px">R$</span>
                  <span className="text-center text-zinc-800 dark:text-zinc-200">
                    {formatarMoeda(calcularTotal("custoUnitario"))}
                  </span>
                </div>
              </td>
              <td></td>
              {[
                "energia",
                "carboidratos",
                "proteinas",
                "lipideos",
                "lipideosSaturados",
                "sodio",
                "fibra",
              ].map((c) => (
                <td
                  key={`t-${c}`}
                  className="p-1 text-center text-zinc-800 dark:text-zinc-200"
                >
                  {calcularTotal(c).toFixed(2).replace(".", ",")}
                </td>
              ))}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
