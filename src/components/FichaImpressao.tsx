import { forwardRef } from "react";
import { useFicha } from "../contexts/FichaContext";
import { Ingrediente, DadosNutricionais } from "../types/ficha";

const FichaImpressao = forwardRef<HTMLDivElement>((_, ref) => {
  const {
    informacoesGerais,
    ingredientes,
    rendimento,
    tecnicaPreparo,
    nutricaoECustos,
  } = useFicha();

  const numLinhas = Math.max(10, ingredientes.length, nutricaoECustos.length);
  const indices = Array.from({ length: numLinhas }, (_, i) => i);

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

  return (
    <div
      ref={ref}
      className="bg-white text-black w-[297mm] min-h-[210mm] p-10 mx-auto text-[11px] leading-tight font-sans"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
@media print {
@page { size: landscape; margin: 10mm; }
body { -webkit-print-color-adjust: exact; }
}
`,
        }}
      />
      <div className="break-after-page min-h-[190mm] flex flex-col">
        <h2 className="text-center font-bold text-xl mb-6 uppercase">
          Ficha Técnica de Preparo (Frente)
        </h2>

        <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-6 p-4 text-xs">
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

        <table className="w-full border-collapse border border-black mb-6 text-center text-[10px]">
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
              <th className="border border-black p-2 font-bold w-[16%] leading-none">
                Medida Caseira
              </th>
              <th className="border border-black p-2 font-bold w-[28%] leading-none">
                Técnica de Preparo
              </th>
            </tr>
          </thead>
          <tbody>
            {indices.map((i) => {
              const ing = ingredientes[i] as Ingrediente | undefined;
              const nutri = nutricaoECustos[i] as DadosNutricionais | undefined;
              const fc =
                ing && ing.pesoLiquido > 0
                  ? (ing.pesoBruto / ing.pesoLiquido).toFixed(2)
                  : "";

              return (
                <tr key={i} className="h-7">
                  <td className="border border-black p-1 text-left px-3">
                    {ing?.nome || ""}
                  </td>
                  <td className="border border-black p-1">
                    {ing?.pesoBruto || ""}
                  </td>
                  <td className="border border-black p-1">
                    {ing?.pesoLiquido || ""}
                  </td>
                  <td className="border border-black p-1">{fc}</td>
                  <td className="border border-black p-1">
                    {nutri?.perCapitaBruto || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.perCapitaLiquido || ""}
                  </td>
                  <td className="border border-black p-1 text-left px-3">
                    {ing?.medidaCaseira || ""}
                  </td>

                  {i === 0 && (
                    <td
                      rowSpan={numLinhas}
                      className="border border-black p-3 text-left align-top bg-white"
                    >
                      <div className="whitespace-pre-wrap">
                        {tecnicaPreparo}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="grid grid-cols-2 border border-black p-4 mt-auto text-xs">
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
              {rendimento.fatorCoccao}
            </div>
            <div>
              <span className="font-bold">Peso da porção (g):</span>{" "}
              {rendimento.pesoPorcao}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <span className="font-bold">Número de porções – rendimento:</span>{" "}
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
      </div>

      <div className="break-after-page min-h-[190mm] flex flex-col">
        <h2 className="text-center font-bold text-xl mb-6 uppercase">
          Ficha Técnica de Preparo (Verso)
        </h2>

        <table className="w-full border-collapse border border-black mb-6 text-center text-[10px]">
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
            {indices.map((i) => {
              const nutri = nutricaoECustos[i] as DadosNutricionais | undefined;
              return (
                <tr key={i} className="h-7">
                  <td className="border border-black p-1 text-left px-3 truncate">
                    {nutri?.nome || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.perCapitaBruto || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.precoUnitario || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.custoUnitario || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.perCapitaLiquido || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.energia || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.carboidratos || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.proteinas || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.lipideos || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.lipideosSaturados || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.sodio || ""}
                  </td>
                  <td className="border border-black p-1">
                    {nutri?.fibra || ""}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-gray-100 font-bold border-t-2 border-black">
              <td className="border border-black p-2 text-left px-3">Total</td>
              <td className="border border-black p-2">- - - -</td>
              <td className="border border-black p-2">- - - -</td>
              <td className="border border-black p-2">
                {totais.custo.toFixed(2)}
              </td>
              <td className="border border-black p-2">- - - -</td>
              <td className="border border-black p-2">
                {totais.energia.toFixed(1)}
              </td>
              <td className="border border-black p-2">
                {totais.carb.toFixed(1)}
              </td>
              <td className="border border-black p-2">
                {totais.prot.toFixed(1)}
              </td>
              <td className="border border-black p-2">
                {totais.lip.toFixed(1)}
              </td>
              <td className="border border-black p-2">
                {totais.sat.toFixed(1)}
              </td>
              <td className="border border-black p-2">
                {totais.sodio.toFixed(1)}
              </td>
              <td className="border border-black p-2">
                {totais.fibra.toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

FichaImpressao.displayName = "FichaImpressao";
export default FichaImpressao;
