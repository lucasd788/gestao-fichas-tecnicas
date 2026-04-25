import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useFicha } from "../contexts/FichaContext";
import { Ingrediente } from "../types/ficha";
import { buscarNomesIngredientes } from "../database/conexao";

export default function SecaoIngredientesPreparo() {
  const { ingredientes, setIngredientes, tecnicaPreparo, setTecnicaPreparo } =
    useFicha();
  const [sugestoesBanco, setSugestoesBanco] = useState<
    { nome: string; codigo: string }[]
  >([]);

  useEffect(() => {
    buscarNomesIngredientes().then(setSugestoesBanco).catch(console.error);
  }, []);

  const adicionarLinha = () => {
    setIngredientes([
      ...ingredientes,
      {
        id: crypto.randomUUID(),
        nome: "",
        pesoBruto: 0,
        pesoLiquido: 0,
        medidaCaseira: "",
      },
    ]);
  };

  const removerLinha = (id: string) => {
    setIngredientes(ingredientes.filter((ing) => ing.id !== id));
  };

  const atualizarCampo = (
    id: string,
    campo: keyof Ingrediente,
    valor: string | number,
  ) => {
    setIngredientes(
      ingredientes.map((ing) =>
        ing.id === id ? { ...ing, [campo]: valor } : ing,
      ),
    );
  };

  const inputTabelaClass =
    "w-full p-1 bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 rounded outline-none text-[11px] transition-all";

  return (
    <section className="bg-white dark:bg-zinc-900 p-4 shadow-sm rounded-2xl mb-6 border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 border-l-4 border-indigo-500 pl-3">
          Ingredientes e Preparo
        </h2>
        <button
          onClick={adicionarLinha}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <Plus size={16} /> Novo Ingrediente
        </button>
      </div>

      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[600px] shadow-inner">
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-950 shadow-sm">
            <tr className="text-zinc-600 dark:text-zinc-400 text-[10px] font-bold tracking-wider">
              <th className="p-2 text-center border-b border-zinc-200 dark:border-zinc-800 w-[20%]">
                INGREDIENTE
              </th>
              <th className="p-2 text-center border-b border-zinc-200 dark:border-zinc-800 w-20">
                <span className="block">{"P. BRUTO"}</span>
                <span className="text-[8px] font-normal opacity-70 italic">
                  {"(g)"}
                </span>
              </th>
              <th className="p-2 text-center border-b border-zinc-200 dark:border-zinc-800 w-24">
                <span className="block">{"P. LÍQUIDO"}</span>
                <span className="text-[8px] font-normal opacity-70 italic">
                  {"(g)"}
                </span>
              </th>
              <th className="p-2 text-center border-b border-zinc-200 dark:border-zinc-800 w-16">
                FC
              </th>
              <th className="p-2 text-center border-b border-zinc-200 dark:border-zinc-800 w-[15%]">
                MEDIDA CASEIRA
              </th>
              <th className="p-2 text-center border-b border-zinc-200 dark:border-zinc-800 w-[30%]">
                TÉCNICA DE PREPARO
              </th>
              <th className="p-2 border-b border-zinc-200 dark:border-zinc-800 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-[11px]">
            {ingredientes.map((ing, index) => {
              const fc =
                ing.pesoLiquido > 0
                  ? (ing.pesoBruto / ing.pesoLiquido).toFixed(2)
                  : "-";
              const codigoEncontrado = sugestoesBanco.find(
                (s) => s.nome === ing.nome,
              )?.codigo;

              return (
                <tr
                  key={ing.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="p-1">
                    <div className="flex flex-col gap-0.5">
                      <input
                        type="text"
                        list="sugestoes-ingredientes"
                        value={ing.nome}
                        onChange={(e) =>
                          atualizarCampo(ing.id, "nome", e.target.value)
                        }
                        className={inputTabelaClass}
                        placeholder="Nome do ingrediente..."
                      />
                      {codigoEncontrado && (
                        <a
                          href={`https://www.tbca.net.br/base-dados/composicao_estatistica.php?produto=${codigoEncontrado}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] font-mono text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline px-1 w-fit truncate"
                        >
                          Cód: [{codigoEncontrado}]
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      value={ing.pesoBruto || ""}
                      onChange={(e) =>
                        atualizarCampo(
                          ing.id,
                          "pesoBruto",
                          Number(e.target.value),
                        )
                      }
                      className={`${inputTabelaClass} text-center`}
                      placeholder="0"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      value={ing.pesoLiquido || ""}
                      onChange={(e) =>
                        atualizarCampo(
                          ing.id,
                          "pesoLiquido",
                          Number(e.target.value),
                        )
                      }
                      className={`${inputTabelaClass} text-center`}
                      placeholder="0"
                    />
                  </td>
                  <td className="p-1 text-center font-bold">{fc}</td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={ing.medidaCaseira}
                      onChange={(e) =>
                        atualizarCampo(ing.id, "medidaCaseira", e.target.value)
                      }
                      className={`${inputTabelaClass} text-center`}
                      placeholder="Ex: 1 xícara"
                    />
                  </td>
                  {index === 0 && (
                    <td
                      rowSpan={ingredientes.length}
                      className="p-1.5 border-x border-zinc-200 dark:border-zinc-800 align-top"
                    >
                      <textarea
                        value={tecnicaPreparo}
                        onChange={(e) => setTecnicaPreparo(e.target.value)}
                        style={{
                          minHeight: `${Math.max(120, ingredientes.length * 56)}px`,
                        }}
                        className="w-full h-full p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-[11px] leading-relaxed transition-all min-h-[100px]"
                        placeholder="Descreva a técnica de preparo..."
                      />
                    </td>
                  )}
                  <td className="p-1 text-center">
                    <button
                      onClick={() => removerLinha(ing.id)}
                      className="text-zinc-400 hover:text-red-500 p-1.5 rounded transition-all opacity-80 dark:opacity-30 group-hover:opacity-100 focus:opacity-100"
                      title="Remover Ingrediente"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <datalist id="sugestoes-ingredientes">
        {sugestoesBanco.map((item, i) => (
          <option key={i} value={item.nome}>
            {item.nome} ({item.codigo})
          </option>
        ))}
      </datalist>
    </section>
  );
}
