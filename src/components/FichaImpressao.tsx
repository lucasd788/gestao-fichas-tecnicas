import { forwardRef } from "react";
import { useFicha } from "../contexts/FichaContext";
import { Ingrediente, DadosNutricionais } from "../types/ficha";

const MAX_LINHAS_FRENTE = 15;
const MAX_LINHAS_VERSO = 22;

const FichaImpressao = forwardRef<HTMLDivElement>((_, ref) => {
  const {
    informacoesGerais,
    ingredientes,
    rendimento,
    tecnicaPreparo,
    nutricaoECustos,
  } = useFicha();

  const numLinhas = Math.max(1, ingredientes.length, nutricaoECustos.length);
  const indicesGlobais = Array.from({ length: numLinhas }, (_, i) => i);

  const paginasFrente = [];
  for (let i = 0; i < indicesGlobais.length; i += MAX_LINHAS_FRENTE) {
    paginasFrente.push(indicesGlobais.slice(i, i + MAX_LINHAS_FRENTE));
  }

  const paginasVerso = [];
  for (let i = 0; i < indicesGlobais.length; i += MAX_LINHAS_VERSO) {
    paginasVerso.push(indicesGlobais.slice(i, i + MAX_LINHAS_VERSO));
  }

  const totais = nutricaoECustos.reduce(
    (acc, curr) => ({
      custo: acc.custo + (Number(curr.custoUnitario) || 0),
      energia: acc.energia + (Number(curr.energia) || 0),
      carb: acc.carb + (Number(curr.carboidratos) || 0),
      prot: acc.prot + (Number(curr.proteinas) || 0),
      lip: acc.lip + (Number(curr.lipideos) || 0),
      sat: acc.sat + (Number(curr.lipideosSaturados) || 0),
      sodio: acc.sodio + (Number(curr.sodio) || 0),
      fibra: acc.fibra + (Number(curr.fibra) || 0),
    }),
    {
      custo: 0,
      energia: 0,
      carb: 0,
      prot: 0,
      lip: 0,
      sat: 0,
      sodio: 0,
      fibra: 0,
    },
  );

  const formatarNumero = (valor: number | string | undefined | null) => {
    if (valor === undefined || valor === null || valor === "") return "";
    const numero = Number(valor);
    if (isNaN(numero)) return "";
    return numero.toFixed(2).replace(".", ",");
  };

  return (
    <div
      ref={ref}
      className="bg-white text-black w-[297mm] min-h-[210mm] mx-auto text-[11px] leading-tight font-sans"
    >
      <style>
        {`
          @media print {
            @page { size: landscape; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; }
          }
        `}
      </style>

      {paginasFrente.map((indicesDaPagina, indexPagina) => (
        <div
          key={`frente-${indexPagina}`}
          className="break-after-page min-h-[190mm] flex flex-col"
        >
          <h2 className="text-center font-bold text-xl mb-2 uppercase">
            Ficha Técnica de Preparo (Frente){" "}
            {paginasFrente.length > 1
              ? `- Pág ${indexPagina + 1} de ${paginasFrente.length}`
              : ""}
          </h2>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-2 p-4 text-xs">
            <div className="col-span-2">
              <span className="font-bold">Alunos:</span>{" "}
              {informacoesGerais.alunos}
            </div>
            <div>
              <span className="font-bold">Preparação:</span>{" "}
              {informacoesGerais.preparacao}
            </div>
            <div>
              <span className="font-bold">Categoria:</span>{" "}
              {informacoesGerais.categoria}
            </div>
          </div>

          <table className="w-full table-fixed border-collapse border border-black mb-6 text-center text-[10px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 font-bold w-[23%] leading-none">
                  Ingredientes
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Peso
                  <br />
                  Bruto (g)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Peso
                  <br />
                  Líquido (g)
                </th>
                <th className="border border-black p-2 font-bold w-[5%] leading-none">
                  IPC =<br />
                  FC
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Per capita
                  <br />
                  bruto (g)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Per capita
                  <br />
                  líquido (g)
                </th>
                <th className="border border-black p-2 font-bold w-[14%] leading-none">
                  Medida Caseira
                </th>
                <th className="border border-black p-2 font-bold w-[30%] leading-none">
                  Técnica de Preparo
                </th>
              </tr>
            </thead>
            <tbody>
              {indicesDaPagina.map((indiceReal, indexNaPagina) => {
                const ing = ingredientes[indiceReal] as Ingrediente | undefined;
                const nutri = nutricaoECustos[indiceReal] as
                  | DadosNutricionais
                  | undefined;
                const fc =
                  ing && ing.pesoLiquido > 0
                    ? formatarNumero(ing.pesoBruto / ing.pesoLiquido)
                    : "";

                return (
                  <tr key={indiceReal} className="h-7">
                    <td className="border border-black p-1 text-left px-3 truncate">
                      {ing?.nome || " --- "}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(ing?.pesoBruto)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(ing?.pesoLiquido)}
                    </td>
                    <td className="border border-black p-1">{fc || " --- "}</td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.perCapitaBruto)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.perCapitaLiquido)}
                    </td>
                    <td className="border border-black p-1 text-left px-3 truncate">
                      {ing?.medidaCaseira || " --- "}
                    </td>

                    {indexNaPagina === 0 && (
                      <td
                        rowSpan={indicesDaPagina.length}
                        className="border border-black p-3 text-left align-top bg-white"
                      >
                        <div className="whitespace-pre-wrap">
                          {tecnicaPreparo || " --- "}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {indexPagina === paginasFrente.length - 1 && (
            <div className="grid grid-cols-[40%_60%] border border-black p-4 mt-auto text-xs break-inside-avoid">
              <div className="space-y-4">
                <div>
                  <span className="font-bold">Tempo de preparo:</span>{" "}
                  {rendimento.tempoPreparo}
                </div>
                <div>
                  <span className="font-bold">Peso total da preparação:</span>{" "}
                  {rendimento.pesoTotal}
                </div>
                <div>
                  <span className="font-bold">
                    Indicador de Conversão (Fator de Cocção):
                  </span>{" "}
                  {formatarNumero(rendimento.fatorCoccao)}
                </div>
                <div>
                  <span className="font-bold">Peso da porção (g):</span>{" "}
                  {rendimento.pesoPorcao}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="font-bold">
                    Número de porções – rendimento:
                  </span>{" "}
                  {rendimento.rendimentoPorcoes}
                </div>
                <div>
                  <span className="font-bold">Porção em medida caseira:</span>{" "}
                  {rendimento.medidaCaseiraPorcao}
                </div>
                <div>
                  <span className="font-bold">Utensílios e equipamentos:</span>
                  <p className="mt-1">{rendimento.equipamentos}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {paginasVerso.map((indicesDaPagina, indexPagina) => (
        <div
          key={`verso-${indexPagina}`}
          className="break-after-page min-h-[190mm] flex flex-col"
        >
          <h2 className="text-center font-bold text-xl mb-6 uppercase">
            Ficha Técnica de Preparo (Verso){" "}
            {paginasVerso.length > 1
              ? `- Pág ${indexPagina + 1} de ${paginasVerso.length}`
              : ""}
          </h2>

          <table className="w-full table-fixed border-collapse border border-black mb-1 text-center text-[10px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 font-bold w-[23%] leading-none">
                  Ingredientes
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Per capita
                  <br />
                  bruto (g)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Preço
                  <br />
                  Unitário
                  <br />
                  (kg/L) R$
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Custo
                  <br />
                  Unitário
                  <br />
                  (R$)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Per capita
                  <br />
                  líquido (g)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Energia
                  <br />
                  (kcal)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Carboidratos
                  <br />
                  (g)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Proteínas
                  <br />
                  (g)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Lipídeos
                  <br />
                  (g)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Lipídeos
                  <br />
                  Saturados
                  <br />
                  (g)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Sódio
                  <br />
                  (mg)
                </th>
                <th className="border border-black p-2 font-bold w-[7%] leading-none">
                  Fibra
                  <br />
                  Alimentar
                  <br />
                  (g)
                </th>
              </tr>
            </thead>
            <tbody>
              {indicesDaPagina.map((indiceReal) => {
                const nutri = nutricaoECustos[indiceReal] as
                  | DadosNutricionais
                  | undefined;
                return (
                  <tr key={indiceReal} className="h-7">
                    <td className="border border-black p-1 text-left px-3 truncate">
                      {nutri?.nome || " --- "}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.perCapitaBruto)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.precoUnitario)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.custoUnitario)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.perCapitaLiquido)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.energia)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.carboidratos)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.proteinas)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.lipideos)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.lipideosSaturados)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.sodio)}
                    </td>
                    <td className="border border-black p-1">
                      {formatarNumero(nutri?.fibra)}
                    </td>
                  </tr>
                );
              })}

              {indexPagina === paginasVerso.length - 1 && (
                <tr className="bg-gray-100 font-bold border-t-2 border-black break-inside-avoid">
                  <td className="border border-black p-2 text-left px-3">
                    Total
                  </td>
                  <td className="border border-black p-2">- - - -</td>
                  <td className="border border-black p-2">- - - -</td>
                  <td className="border border-black p-2">
                    {formatarNumero(totais.custo)}
                  </td>
                  <td className="border border-black p-2">- - - -</td>
                  <td className="border border-black p-2">
                    {formatarNumero(totais.energia)}
                  </td>
                  <td className="border border-black p-2">
                    {formatarNumero(totais.carb)}
                  </td>
                  <td className="border border-black p-2">
                    {formatarNumero(totais.prot)}
                  </td>
                  <td className="border border-black p-2">
                    {formatarNumero(totais.lip)}
                  </td>
                  <td className="border border-black p-2">
                    {formatarNumero(totais.sat)}
                  </td>
                  <td className="border border-black p-2">
                    {formatarNumero(totais.sodio)}
                  </td>
                  <td className="border border-black p-2">
                    {formatarNumero(totais.fibra)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="text-left break-inside-avoid">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 italic">
              * Dados nutricionais retirados da tabela TBCA e dos ingredientes
              personalizados salvos localmente.
            </span>
          </div>
        </div>
      ))}
    </div>
  );
});

FichaImpressao.displayName = "FichaImpressao";
export default FichaImpressao;
