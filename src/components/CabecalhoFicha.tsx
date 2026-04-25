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
    "w-full p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-xs shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600";
  const estiloLabel =
    "text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1 ml-1 block";

  return (
    <section className="bg-white dark:bg-zinc-900 p-4 shadow-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 border-l-4 border-indigo-500 pl-3">
        Informações Gerais
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={estiloLabel}>Preparação:</label>
          <input
            type="text"
            name="preparacao"
            placeholder="Ex: Bolo de Cenoura com Chocolate"
            value={cabecalho.preparacao}
            onChange={lidarComMudanca}
            className={estiloInput}
          />
        </div>
        <div>
          <label className={estiloLabel}>Categoria:</label>
          <input
            type="text"
            name="categoria"
            placeholder="Ex: Sobremesa, Prato Principal..."
            value={cabecalho.categoria}
            onChange={lidarComMudanca}
            className={estiloInput}
          />
        </div>
        <div>
          <label className={estiloLabel}>Alunos / Clientes:</label>
          <input
            type="text"
            name="alunos"
            placeholder="Ex: Turma A, Evento Corporativo..."
            value={cabecalho.alunos}
            onChange={lidarComMudanca}
            className={estiloInput}
          />
        </div>
      </div>
    </section>
  );
}
