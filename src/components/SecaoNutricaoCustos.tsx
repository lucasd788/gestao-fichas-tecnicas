import { useState, useEffect } from "react";
import { RotateCcw, Save, Trash2 } from "lucide-react";
import { useFicha } from "../contexts/FichaContext";
import {
  buscarDadosTabela,
  salvarIngredienteCustomizado,
  apagarIngredienteCustomizado,
} from "../database/conexao";
import { DadosNutricionais } from "../types/ficha";
import { toast } from "sonner";

const CAMPOS_NUTRICIONAIS: (keyof DadosNutricionais)[] = [
  "energia",
  "carboidratos",
  "proteinas",
  "lipideos",
  "lipideosSaturados",
  "sodio",
  "fibra",
];

export default function SecaoNutricaoCustos() {
  const {
    ingredientes,
    rendimento,
    dadosExtras,
    setDadosExtras,
    baseExtras,
    setBaseExtras,
    setNutricaoECustos,
  } = useFicha();
  const [bancoTabela, setBancoTabela] = useState<Record<string, any>>({});
  const [modoEdicao, setModoEdicao] = useState<"porcao" | "base100g">("porcao");
  const [celulaAtiva, setCelulaAtiva] = useState<{
    id: string;
    campo: string;
    valor: string;
  } | null>(null);

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
        if (novo[id] && novo[id].precoUnitario !== undefined) {
          novo[id] = { precoUnitario: novo[id].precoUnitario } as any;
        } else {
          delete novo[id];
        }
        return novo;
      });
    } else {
      setDadosExtras((prev) => {
        const novo = { ...prev };
        if (novo[id] && novo[id].precoUnitario !== undefined) {
          novo[id] = { precoUnitario: novo[id].precoUnitario } as any;
        } else {
          delete novo[id];
        }
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

  useEffect(() => {
    const dadosExportacao = ingredientes.map((ing) => ({
      id: ing.id,
      nome: ing.nome,
      perCapitaBruto: obterValorPorcao(ing, "perCapitaBruto"),
      precoUnitario: obterValorBase(ing, "precoUnitario"),
      custoUnitario: obterValorPorcao(ing, "custoUnitario"),
      perCapitaLiquido: obterValorPorcao(ing, "perCapitaLiquido"),
      energia: obterValorPorcao(ing, "energia"),
      carboidratos: obterValorPorcao(ing, "carboidratos"),
      proteinas: obterValorPorcao(ing, "proteinas"),
      lipideos: obterValorPorcao(ing, "lipideos"),
      lipideosSaturados: obterValorPorcao(ing, "lipideosSaturados"),
      sodio: obterValorPorcao(ing, "sodio"),
      fibra: obterValorPorcao(ing, "fibra"),
    }));

    setNutricaoECustos((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(dadosExportacao)) return prev;
      return dadosExportacao;
    });
  }, [
    ingredientes,
    rendimento,
    dadosExtras,
    baseExtras,
    bancoTabela,
    setNutricaoECustos,
  ]);

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
    return Number(valorString.replace(/\D/g, "")) / 100;
  };

  const lidarComSalvarIngrediente = async (ing: any) => {
    const valoresBase = baseExtras[ing.id] || {};
    const valoresPorcao = dadosExtras[ing.id] || {};

    let dadosParaSalvar: any = {
      nome: ing.nome,
    };

    if (modoEdicao === "base100g") {
      CAMPOS_NUTRICIONAIS.forEach((campo) => {
        dadosParaSalvar[campo] = Number(valoresBase[campo]) || 0;
      });
    } else {
      const pesoPerCapita = obterValorPorcao(ing, "perCapitaLiquido") || 1;
      CAMPOS_NUTRICIONAIS.forEach((campo) => {
        const valorPorcao = Number(valoresPorcao[campo]) || 0;
        dadosParaSalvar[campo] = (valorPorcao * 100) / pesoPerCapita;
      });
    }

    const temDados = CAMPOS_NUTRICIONAIS.some(
      (campo) => dadosParaSalvar[campo] > 0,
    );
    if (!temDados) {
      toast.warning("Preencha pelo menos um valor nutricional");
      return;
    }

    try {
      await salvarIngredienteCustomizado(dadosParaSalvar);

      setBancoTabela((prev) => ({
        ...prev,
        [ing.nome]: { ...dadosParaSalvar, isCustom: true },
      }));

      const limparApenasNutrientes = (prev: any) => {
        if (!prev[ing.id]) return prev;
        const novoObjeto = { ...prev[ing.id] };
        CAMPOS_NUTRICIONAIS.forEach((campo) => {
          delete novoObjeto[campo];
        });
        return { ...prev, [ing.id]: novoObjeto };
      };

      setBaseExtras((prev) => limparApenasNutrientes(prev));
      setDadosExtras((prev) => limparApenasNutrientes(prev));

      toast.success(`Ingrediente "${ing.nome}" salvo no banco de dados`);
    } catch (error) {
      console.error("Erro ao salvar ingrediente:", error);
      toast.error("Erro ao salvar o ingrediente");
    }
  };

  const lidarComApagarIngrediente = async (ing: any) => {
    const nome = ing.nome;

    if (
      confirm(
        `Tem a certeza que deseja apagar "${nome}" da base de dados? Os valores vão ser mantidos apenas nesta ficha.`,
      )
    ) {
      try {
        const dadosDoBanco = bancoTabela[nome];
        await apagarIngredienteCustomizado(nome);

        setBancoTabela((prev) => {
          const novoBanco = { ...prev };
          delete novoBanco[nome];
          return novoBanco;
        });

        if (dadosDoBanco) {
          const pesoPerCapita = obterValorPorcao(ing, "perCapitaLiquido") || 0;
          const fatorPorcao = pesoPerCapita / 100;

          const novosValoresBase: any = { ...(baseExtras[ing.id] || {}) };
          const novosValoresPorcao: any = { ...(dadosExtras[ing.id] || {}) };

          CAMPOS_NUTRICIONAIS.forEach((campo) => {
            const valorBase = Number(dadosDoBanco[campo]) || 0;
            novosValoresBase[campo] = valorBase;
            novosValoresPorcao[campo] = valorBase * fatorPorcao;
          });

          setBaseExtras((prev) => ({ ...prev, [ing.id]: novosValoresBase }));
          setDadosExtras((prev) => ({ ...prev, [ing.id]: novosValoresPorcao }));
        }
        toast.info(
          `"${nome}" removido da base de dados. Valores revertidos para manual`,
        );
      } catch (error) {
        console.error("Erro ao apagar ingrediente:", error);
        toast.error("Erro ao apagar o ingrediente");
      }
    }
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
                <span className="block">P.C.B</span>
                <span className="text-[8px] font-normal opacity-70 lowercase italic">
                  (g)
                </span>
              </th>
              <th className="p-1 text-center border-b border-zinc-200 dark:border-zinc-800 w-24">
                <span className="block">Preço</span>
                <span className="text-[8px] font-normal opacity-70 italic">
                  (R$)
                </span>
              </th>
              <th className="p-1 text-center border-b border-zinc-200 dark:border-zinc-800 w-20">
                <span className="block">Custo</span>
                <span className="text-[8px] font-normal opacity-70 italic">
                  (R$)
                </span>
              </th>
              <th className="p-1 text-center border-b border-zinc-200 dark:border-zinc-800 w-16">
                <span className="block">P.C.L</span>
                <span className="text-[8px] font-normal opacity-70 lowercase italic">
                  (g)
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
                  <td className="p-2 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    {ing.nome && (
                      <>
                        {!bancoTabela[ing.nome] && (
                          <button
                            onClick={() => lidarComSalvarIngrediente(ing)}
                            className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 p-1 rounded-md"
                            title="Salvar na Base de Dados"
                          >
                            <Save size={10} />
                          </button>
                        )}
                        {bancoTabela[ing.nome]?.isCustom && (
                          <button
                            onClick={() => lidarComApagarIngrediente(ing)}
                            className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-400/10 p-1 rounded-md"
                            title="Apagar da Base de Dados (reverter para manual)"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </>
                    )}
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

                  {CAMPOS_NUTRICIONAIS.map((c) => {
                    const vBase = obterValorBase(ing, c);
                    const vFinal = exibindoBase
                      ? vBase
                      : obterValorPorcao(ing, c);
                    const editado =
                      baseExtras[ing.id]?.[c as keyof DadosNutricionais] !==
                        undefined ||
                      dadosExtras[ing.id]?.[c as keyof DadosNutricionais] !==
                        undefined;

                    const isAtiva =
                      celulaAtiva?.id === ing.id && celulaAtiva?.campo === c;
                    const valorExibicao = isAtiva
                      ? celulaAtiva.valor
                      : (Number(vFinal) || 0).toFixed(2);

                    return (
                      <td key={c} className="p-0.5">
                        <input
                          type="number"
                          step="0.01"
                          value={valorExibicao}
                          title={`Valor original (100g): ${vBase.toFixed(2)}`}
                          onFocus={() => {
                            setCelulaAtiva({
                              id: ing.id,
                              campo: c,
                              valor: vFinal ? String(vFinal) : "",
                            });
                          }}
                          onChange={(e) => {
                            setCelulaAtiva({
                              id: ing.id,
                              campo: c,
                              valor: e.target.value,
                            });
                            lidarComMudanca(
                              ing.id,
                              c as any,
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                            );
                          }}
                          onBlur={() => setCelulaAtiva(null)}
                          className={`${inputBaseClass} text-center ${
                            editado
                              ? "text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/20"
                              : ""
                          }`}
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
              {CAMPOS_NUTRICIONAIS.map((c) => (
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
      <div className="text-left">
        <span className="text-[10px] text-zinc-500 dark:text-zinc-500 italic">
          * Dados nutricionais retirados da tabela TBCA e dos ingredientes
          personalizados salvos localmente.
        </span>
      </div>
    </section>
  );
}
