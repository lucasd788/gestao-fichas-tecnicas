import { useState } from "react";
import { DadosNutricionais } from "../types/ficha";

export default function SecaoNutricaoCustos() {
  const [itens, setItens] = useState<DadosNutricionais[]>([
    {
      id: crypto.randomUUID(),
      nome: "",
      perCapitaBruto: 0,
      precoUnitario: 0,
      custoUnitario: 0,
      perCapitaLiquido: 0,
      energia: 0,
      carboidratos: 0,
      proteinas: 0,
      lipideos: 0,
      lipideosSaturados: 0,
      sodio: 0,
      fibra: 0,
    },
  ]);

  const atualizarCampo = (
    id: string,
    campo: keyof DadosNutricionais,
    valor: string | number,
  ) => {
    setItens(
      itens.map((item) => {
        if (item.id === id) {
          const novoItem = { ...item, [campo]: valor };

          if (campo === "precoUnitario" || campo === "perCapitaBruto") {
            novoItem.custoUnitario =
              (novoItem.precoUnitario / 1000) * novoItem.perCapitaBruto;
          }
          return novoItem;
        }
        return item;
      }),
    );
  };

  const calcularTotal = (
    campo: keyof Omit<DadosNutricionais, "id" | "nome">,
  ) => {
    return itens.reduce((acc, curr) => acc + (Number(curr[campo]) || 0), 0);
  };

  const estiloInputTabela =
    "w-full p-1 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded transition-colors";

  return (
    <section className="bg-white dark:bg-gray-800 p-6 shadow-md rounded-md mb-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        Custos e Informação Nutricional
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                Ingredientes
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-24">
                Per capita <br />
                bruto (g)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-24">
                Preço Unit
                <br /> (kg/L) R$
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-24">
                Custo Unit. (R$)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-24">
                Per capita
                <br />
                líq. (g)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-16">
                Energia
                <br />
                (Kcal)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-16">
                Carboidratos
                <br />
                (g)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-16">
                Proteinas
                <br />
                (g)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-16">
                Lipídeos <br />
                (g)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-16">
                Lipídeos <br />
                Saturados(g)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-16">
                Sódio <br />
                (mg)
              </th>
              <th className="p-2 border border-gray-300 dark:border-gray-600 text-center w-16">
                Fibra <br />
                Alimentar (g)
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {itens.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="p-1 border border-gray-300 dark:border-gray-600">
                  <input
                    type="text"
                    value={item.nome}
                    onChange={(e) =>
                      atualizarCampo(item.id, "nome", e.target.value)
                    }
                    className={estiloInputTabela}
                  />
                </td>
                <td className="p-1 border border-gray-300 dark:border-gray-600">
                  <input
                    type="number"
                    value={item.perCapitaBruto || ""}
                    onChange={(e) =>
                      atualizarCampo(
                        item.id,
                        "perCapitaBruto",
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                    className={`${estiloInputTabela} text-center`}
                  />
                </td>
                <td className="p-1 border border-gray-300 dark:border-gray-600">
                  <input
                    type="number"
                    value={item.precoUnitario || ""}
                    onChange={(e) =>
                      atualizarCampo(
                        item.id,
                        "precoUnitario",
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                    className={`${estiloInputTabela} text-center`}
                  />
                </td>
                <td className="p-1 border border-gray-300 dark:border-gray-600 text-center">
                  {item.custoUnitario.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="p-1 border border-gray-300 dark:border-gray-600">
                  <input
                    type="number"
                    value={item.perCapitaLiquido || ""}
                    onChange={(e) =>
                      atualizarCampo(
                        item.id,
                        "perCapitaLiquido",
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                    className={`${estiloInputTabela} text-center`}
                  />
                </td>
                {[
                  "energia",
                  "carboidratos",
                  "proteinas",
                  "lipideos",
                  "lipideosSaturados",
                  "sodio",
                  "fibra",
                ].map((campo) => (
                  <td
                    key={campo}
                    className="p-1 border border-gray-300 dark:border-gray-600"
                  >
                    <input
                      type="number"
                      value={item[campo as keyof DadosNutricionais] || ""}
                      onChange={(e) =>
                        atualizarCampo(
                          item.id,
                          campo as keyof DadosNutricionais,
                          Math.max(0, Number(e.target.value)),
                        )
                      }
                      className={`${estiloInputTabela} text-center`}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-gray-200 dark:bg-gray-700 font-bold text-gray-900 dark:text-white">
              <td className="p-2 border border-gray-300 dark:border-gray-600">
                TOTAL
              </td>
              <td className="border border-gray-300 dark:border-gray-600 text-center">
                -
              </td>
              <td className="border border-gray-300 dark:border-gray-600 text-center">
                -
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                {calcularTotal("custoUnitario").toFixed(2)}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 text-center">
                -
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                {calcularTotal("energia").toFixed(1)}
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                {calcularTotal("carboidratos").toFixed(1)}
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                {calcularTotal("proteinas").toFixed(1)}
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                {calcularTotal("lipideos").toFixed(1)}
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                {calcularTotal("lipideosSaturados").toFixed(1)}
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                {calcularTotal("sodio").toFixed(1)}
              </td>
              <td className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                {calcularTotal("fibra").toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">
        * Fonte das Informações Nutricionais: utilizar preferencialmente a TACO
        ou rótulos de alimentos
      </p>
    </section>
  );
}
