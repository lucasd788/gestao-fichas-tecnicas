import { useState, useEffect } from "react";
import { FileText, Save, Plus, Trash2, ChevronLeft, Menu } from "lucide-react";
import { useFicha } from "../contexts/FichaContext";
import {
  listarFichasDB,
  salvarFichaDB,
  obterFichaDB,
  apagarFichaDB,
} from "../database/conexao";
import { toast } from "sonner";

interface FichaSalva {
  id: string;
  nome: string;
  data_atualizacao: string;
}

export default function Sidebar() {
  const [fichasSalvas, setFichasSalvas] = useState<FichaSalva[]>([]);
  const [expandido, setExpandido] = useState(true);

  const {
    limparFicha,
    carregarFichaSalva,
    obterFichaAtualParaSalvar,
    fichaId,
  } = useFicha();

  const carregarLista = async () => {
    try {
      const lista = await listarFichasDB();
      setFichasSalvas(lista);
    } catch (error) {
      console.error("Erro ao listar fichas do banco de dados:", error);
    }
  };

  useEffect(() => {
    carregarLista();
    window.addEventListener("fichaSalva", carregarLista);
    return () => {
      window.removeEventListener("fichaSalva", carregarLista);
    };
  }, []);

  const lidarComSalvar = async () => {
    try {
      const dados = obterFichaAtualParaSalvar();
      const nomeFicha =
        dados.informacoesGerais.preparacao.trim() !== ""
          ? dados.informacoesGerais.preparacao
          : "Ficha Sem Nome";
      const json = JSON.stringify(dados);

      await salvarFichaDB(dados.id, nomeFicha, json);
      await carregarLista();

      toast.success("Ficha salva");
    } catch (error) {
      console.error("Erro ao salvar a ficha:", error);
      toast.error("Erro ao salvar a ficha");
    }
  };

  const lidarComAbrirFicha = async (id: string) => {
    try {
      const jsonStr = await obterFichaDB(id);
      if (jsonStr) {
        const dadosCompletos = JSON.parse(jsonStr);
        carregarFichaSalva(dadosCompletos);
      }
    } catch (error) {
      console.error("Erro ao carregar a ficha:", error);
      toast.error("Erro ao carregar a ficha");
    }
  };

  const lidarComApagar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    if (
      confirm(
        "Tem a certeza que deseja apagar esta ficha? Esta ação não pode ser desfeita.",
      )
    ) {
      try {
        await apagarFichaDB(id);
        await carregarLista();

        if (id === fichaId) {
          limparFicha();
        }
        toast.success("Ficha apagada");
      } catch (error) {
        console.error("Erro ao apagar a ficha:", error);
        toast.error("Erro ao apagar a ficha");
      }
    }
  };

  return (
    <aside
      className={`${
        expandido ? "w-64" : "w-16"
      } h-screen bg-white dark:bg-zinc-900 flex flex-col border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out shrink-0 overflow-hidden`}
    >
      <div
        className={`p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center ${
          expandido ? "justify-between" : "justify-center"
        } min-h-[73px]`}
      >
        {expandido && (
          <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2 whitespace-nowrap">
            <FileText
              size={20}
              className="text-indigo-600 dark:text-indigo-500"
            />
            Minhas Fichas
          </h2>
        )}
        <button
          onClick={() => setExpandido(!expandido)}
          className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors focus:outline-none"
          title={expandido ? "Recolher menu" : "Expandir menu"}
        >
          {expandido ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="p-4 space-y-2 border-b border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
        <button
          onClick={limparFicha}
          title="Nova Ficha"
          className={`w-full flex items-center ${
            expandido ? "justify-center gap-2 px-4 py-2" : "justify-center p-2"
          } bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm focus:ring-2 focus:ring-indigo-500 outline-none`}
        >
          <Plus size={16} />{" "}
          {expandido && <span className="whitespace-nowrap">Nova Ficha</span>}
        </button>
        <button
          onClick={lidarComSalvar}
          title="Salvar Atual"
          className={`w-full flex items-center ${
            expandido ? "justify-center gap-2 px-4 py-2" : "justify-center p-2"
          } bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-medium rounded-lg shadow-sm transition-all text-sm focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 outline-none`}
        >
          <Save size={16} />{" "}
          {expandido && <span className="whitespace-nowrap">Salvar Atual</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {expandido ? (
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-3 px-2 mt-2">
            Salvas Recentemente
          </p>
        ) : (
          <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800 my-3" />
        )}

        {fichasSalvas.length === 0
          ? expandido && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 px-2 italic">
                Nenhuma ficha salva.
              </p>
            )
          : fichasSalvas.map((ficha) => (
              <div
                key={ficha.id}
                onClick={() => lidarComAbrirFicha(ficha.id)}
                title={!expandido ? ficha.nome : undefined}
                className={`group flex items-center ${
                  expandido ? "justify-between p-3" : "justify-center p-3"
                } rounded-lg cursor-pointer transition-colors border ${
                  fichaId === ficha.id
                    ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50"
                    : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
                }`}
              >
                {expandido ? (
                  <>
                    <div className="overflow-hidden">
                      <h3
                        className={`text-sm font-semibold truncate ${
                          fichaId === ficha.id
                            ? "text-indigo-700 dark:text-indigo-400"
                            : "text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {ficha.nome}
                      </h3>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {ficha.data_atualizacao}
                      </p>
                    </div>
                    <button
                      onClick={(e) => lidarComApagar(e, ficha.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-md transition-all"
                      title="Apagar ficha"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <FileText
                    size={18}
                    className={
                      fichaId === ficha.id
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-500 dark:text-zinc-400"
                    }
                  />
                )}
              </div>
            ))}
      </div>
    </aside>
  );
}
