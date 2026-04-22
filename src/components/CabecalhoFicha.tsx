import { useState } from "react";

export default function CabecalhoFicha() {
  const [cabecalho, setCabecalho] = useState({
    alunos: "",
    preparacao: "",
    categoria: "",
  });

  const lidarComMudanca = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCabecalho((dadosAnteriores) => ({
      ...dadosAnteriores,
      [name]: value,
    }));
  };

  const estiloInput =
    "w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
  const estiloLabel =
    "text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1";

  return (
    <section className="bg-white dark:bg-gray-800 p-6 shadow-md rounded-md mb-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        Informações Gerais
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className={estiloLabel}>Alunos:</label>
          <input
            type="text"
            name="alunos"
            value={cabecalho.alunos}
            onChange={lidarComMudanca}
            className={estiloInput}
          />
        </div>
        <div />

        <div className="flex flex-col">
          <label className={estiloLabel}>Preparação:</label>
          <input
            type="text"
            name="preparacao"
            value={cabecalho.preparacao}
            onChange={lidarComMudanca}
            className={estiloInput}
          />
        </div>

        <div className="flex flex-col">
          <label className={estiloLabel}>Categoria:</label>
          <input
            type="text"
            name="categoria"
            value={cabecalho.categoria}
            onChange={lidarComMudanca}
            className={estiloInput}
          />
        </div>
      </div>
    </section>
  );
}
