import { useState } from "react";
import { arredondar } from "../utils/calculos";

export default function SecaoPreparo() {
  const [textos, setTextos] = useState({
    equipamentos: "",
    tempo: "",
    medidaCaseiraPorcao: "",
  });

  const [pesoTotal, setPesoTotal] = useState<number | "">("");
  const [pesoPorcao, setPesoPorcao] = useState<number | "">("");
  const [rendimento, setRendimento] = useState<number | "">("");
  const [fatorCoccao, setFatorCoccao] = useState<number | "">("");

  const lidarComMudancaTexto = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTextos((prev) => ({ ...prev, [name]: value }));
  };

  const lidarComPesoTotal = (valorStr: string) => {
    if (valorStr === "") {
      setPesoTotal("");
      return;
    }
    const valor = Number(valorStr);
    if (valor < 0) return;
    setPesoTotal(valor);
    if (typeof rendimento === "number" && rendimento > 0) {
      setPesoPorcao(arredondar(valor / rendimento));
    } else if (typeof pesoPorcao === "number" && pesoPorcao > 0) {
      setRendimento(Math.round(valor / pesoPorcao));
    }
  };

  const lidarComPesoPorcao = (valorStr: string) => {
    if (valorStr === "") {
      setPesoPorcao("");
      return;
    }
    const valor = Number(valorStr);
    if (valor < 0) return;
    setPesoPorcao(valor);
    if (typeof pesoTotal === "number" && pesoTotal > 0 && valor > 0) {
      setRendimento(Math.round(pesoTotal / valor));
    }
  };

  const lidarComRendimento = (valorStr: string) => {
    if (valorStr === "") {
      setRendimento("");
      return;
    }
    const valor = Number(valorStr);
    if (valor < 0) return;
    setRendimento(valor);
    if (typeof pesoTotal === "number" && pesoTotal > 0 && valor > 0) {
      setPesoPorcao(arredondar(pesoTotal / valor));
    }
  };

  const lidarComFatorCoccao = (valorStr: string) => {
    if (valorStr === "") {
      setFatorCoccao("");
      return;
    }
    const valor = Number(valorStr);
    if (valor < 0) return;
    setFatorCoccao(valor);
  };

  const estiloInput =
    "w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
  const estiloLabel =
    "text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1";

  return (
    <section className="bg-white dark:bg-gray-800 p-6 shadow-md rounded-md mb-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        Rendimento e Equipamentos
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-rows-4">
          <div className="flex flex-col">
            <label className={estiloLabel}>Tempo de Preparo:</label>
            <input
              type="text"
              name="tempo"
              value={textos.tempo}
              onChange={lidarComMudancaTexto}
              className={estiloInput}
            />
          </div>
          <div className="flex flex-col">
            <label className={estiloLabel}>Peso Total (g):</label>
            <input
              type="number"
              min="0"
              value={pesoTotal}
              onChange={(e) => lidarComPesoTotal(e.target.value)}
              className={estiloInput}
            />
          </div>
          <div className="flex flex-col">
            <label className={estiloLabel}>Fator de Cocção (IC):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fatorCoccao}
              onChange={(e) => lidarComFatorCoccao(e.target.value)}
              className={estiloInput}
            />
          </div>
          <div className="flex flex-col">
            <label className={estiloLabel}>Peso da Porção (g):</label>
            <input
              type="number"
              min="0"
              value={pesoPorcao}
              onChange={(e) => lidarComPesoPorcao(e.target.value)}
              className={`${estiloInput} border-blue-300 dark:border-blue-500`}
            />
          </div>
        </div>
        <div className="grid grid-rows-4">
          <div className="flex flex-col">
            <label className={estiloLabel}>Rendimento (Porções):</label>
            <input
              type="number"
              min="0"
              value={rendimento}
              onChange={(e) => lidarComRendimento(e.target.value)}
              className={`${estiloInput} border-blue-300 dark:border-blue-500`}
            />
          </div>

          <div className="flex flex-col">
            <label className={estiloLabel}>Medida Caseira da Porção:</label>
            <input
              type="text"
              name="medidaCaseiraPorcao"
              value={textos.medidaCaseiraPorcao}
              onChange={lidarComMudancaTexto}
              className={estiloInput}
            />
          </div>

          <div className="flex flex-col space-y-4 row-span-2">
            <div className="flex flex-col h-full">
              <label className={estiloLabel}>Utensílios e Equipamentos:</label>
              <textarea
                name="equipamentos"
                value={textos.equipamentos}
                onChange={lidarComMudancaTexto}
                className={`${estiloInput} h-full resize-none min-h-[150px]`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
