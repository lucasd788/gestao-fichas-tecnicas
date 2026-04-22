import { useState } from "react";
import { Ingrediente } from "../types/ficha";

const ingredientesExemplo = [
  "Açúcar",
  "Alho",
  "Azeite",
  "Cebola",
  "Farinha de trigo",
  "Gema de ovo",
  "Grão de bico",
  "Manjericão",
  "Manteiga",
  "Parmesão",
  "Sal",
  "Tomate fresco",
  "Tomate pelado",
];

export default function SecaoIngredientes() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    {
      id: crypto.randomUUID(),
      nome: "",
      pesoBruto: 0,
      pesoLiquido: 0,
      medidaCaseira: "",
    },
  ]);

  const [tecnica, setTecnica] = useState("");

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
  const estiloInputTabela =
    "w-full p-1 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded transition-colors";

  return (
    <section className="bg-white dark:bg-gray-800 p-6 shadow-md rounded-md mb-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Ingredientes, Quantidades e Preparo
        </h2>
        <button
          onClick={adicionarLinha}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-semibold shadow transition-colors"
        >
          + Adicionar Ingrediente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                Ingrediente
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 w-24 text-center">
                Peso <br />
                Bruto (g)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 w-24 text-center">
                Peso <br />
                Líquido (g)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 w-24 text-center">
                IPC = FC
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                Medida Caseira
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 w-1/3 text-center">
                Técnica de Preparo
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 w-12 text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((ing, index) => {
              const fc =
                ing.pesoLiquido > 0
                  ? (ing.pesoBruto / ing.pesoLiquido).toFixed(2)
                  : "-";

              return (
                <tr
                  key={ing.id}
                  className="text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <td className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    <input
                      type="text"
                      list="sugestoes-ingredientes"
                      value={ing.nome}
                      onChange={(e) =>
                        atualizarCampo(ing.id, "nome", e.target.value)
                      }
                      className={estiloInputTabela}
                      placeholder="Ingrediente"
                    />
                  </td>
                  <td className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    <input
                      type="number"
                      min="0"
                      value={ing.pesoBruto || ""}
                      onChange={(e) =>
                        atualizarCampo(
                          ing.id,
                          "pesoBruto",
                          Math.max(0, Number(e.target.value)),
                        )
                      }
                      className={`${estiloInputTabela} text-center`}
                      placeholder="0"
                    />
                  </td>
                  <td className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    <input
                      type="number"
                      min="0"
                      value={ing.pesoLiquido || ""}
                      onChange={(e) =>
                        atualizarCampo(
                          ing.id,
                          "pesoLiquido",
                          Math.max(0, Number(e.target.value)),
                        )
                      }
                      className={`${estiloInputTabela} text-center`}
                      placeholder="0"
                    />
                  </td>
                  <td className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    {fc}
                  </td>
                  <td className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    <input
                      type="text"
                      value={ing.medidaCaseira}
                      onChange={(e) =>
                        atualizarCampo(ing.id, "medidaCaseira", e.target.value)
                      }
                      className={estiloInputTabela}
                      placeholder="Medida Caseira"
                    />
                  </td>

                  {index === 0 && (
                    <td
                      rowSpan={ingredientes.length}
                      className="p-0 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 align-top"
                    >
                      <textarea
                        value={tecnica}
                        onChange={(e) => setTecnica(e.target.value)}
                        style={{
                          minHeight: `${Math.max(50, ingredientes.length * 45)}px`,
                        }}
                        className="w-full h-full p-3 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Técnica de Preparo"
                      />
                    </td>
                  )}

                  <td className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                    <button
                      onClick={() => removerLinha(ing.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded transition-colors"
                      title="Remover Ingrediente"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <datalist id="sugestoes-ingredientes">
        {ingredientesExemplo.map((nomeIngrediente, index) => (
          <option key={index} value={nomeIngrediente} />
        ))}
      </datalist>
    </section>
  );
}
