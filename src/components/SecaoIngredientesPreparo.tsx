import { useState, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useFicha } from "../contexts/FichaContext";
import { Ingrediente } from "../types/ficha";
import { pesquisarIngredientes } from "../database/conexao";

function AutocompleteIngrediente({
  valor,
  aoMudar,
  aoSelecionar,
  aoPressionarEnterNome,
  aoPressionarApagarLinha,
  inputId,
  inputTabelaClass,
  aoMudarEstadoMenu,
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  aoSelecionar: (sugestao: { nome: string; codigo: string | null }) => void;
  aoPressionarEnterNome: () => void;
  aoPressionarApagarLinha: () => void;
  inputId: string;
  inputTabelaClass: string;
  aoMudarEstadoMenu: (aberto: boolean) => void;
}) {
  const [sugestoes, setSugestoes] = useState<
    { nome: string; codigo: string | null }[]
  >([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const abrirMenu = () => {
    setAberto(true);
    aoMudarEstadoMenu(true);
    setTimeout(() => {
      containerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const fecharMenu = () => {
    setAberto(false);
    aoMudarEstadoMenu(false);
  };

  useEffect(() => {
    const lidarComCliqueFora = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        fecharMenu();
      }
    };
    document.addEventListener("mousedown", lidarComCliqueFora);
    return () => document.removeEventListener("mousedown", lidarComCliqueFora);
  }, []);

  useEffect(() => {
    if (!aberto || valor.length < 2) {
      setSugestoes([]);
      return;
    }

    setCarregando(true);
    const timeoutId = setTimeout(async () => {
      try {
        const resultados = await pesquisarIngredientes(valor);
        setSugestoes(resultados);
      } catch (erro) {
        console.error("Erro na busca de ingredientes:", erro);
      } finally {
        setCarregando(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [valor, aberto]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          fecharMenu();
        }
      }}
    >
      <input
        id={inputId}
        type="text"
        value={valor}
        onChange={(e) => {
          aoMudar(e.target.value);
          abrirMenu();
        }}
        onFocus={abrirMenu}
        onKeyDown={(e) => {
          if (e.ctrlKey && (e.key === "Backspace" || e.key === "Delete")) {
            e.preventDefault();
            fecharMenu();
            aoPressionarApagarLinha();
            return;
          }

          if (e.key === "Enter") {
            e.preventDefault();
            if (aberto && sugestoes.length > 0) {
              aoSelecionar(sugestoes[0]);
            }
            fecharMenu();
            aoPressionarEnterNome();
          }
        }}
        className={inputTabelaClass}
        placeholder="Nome do ingrediente..."
        autoComplete="off"
      />

      {aberto && (sugestoes.length > 0 || carregando) && (
        <ul className="absolute z-50 left-0 top-full w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-xl max-h-56 overflow-y-auto text-[11px] animate-in fade-in duration-200">
          {carregando && sugestoes.length === 0 ? (
            <li className="px-3 py-3 text-zinc-500 text-center animate-pulse">
              Buscando...
            </li>
          ) : (
            sugestoes.map((s, i) => (
              <li
                key={i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  aoSelecionar(s);
                  fecharMenu();
                }}
                className="px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 cursor-pointer flex flex-col gap-0.5 border-b border-zinc-100 dark:border-zinc-700/50 last:border-0 transition-colors"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {s.nome}
                </span>
                {s.codigo && (
                  <span className="text-[9px] text-zinc-400 font-mono">
                    Cód: {s.codigo}
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function LinhaIngrediente({
  ing,
  index,
  totalIngredientes,
  tecnicaPreparo,
  setTecnicaPreparo,
  atualizarCampo,
  removerLinha,
  aoPressionarEnterLinha,
  inputTabelaClass,
  setMenuAbertoId,
}: any) {
  const fc =
    ing.pesoLiquido > 0 ? (ing.pesoBruto / ing.pesoLiquido).toFixed(2) : "-";

  const lidarComTeclas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      removerLinha(ing.id, index);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      aoPressionarEnterLinha(index);
    }
  };

  const focarPesoBruto = () => {
    const inputPesoBruto = document.getElementById(`peso-bruto-${ing.id}`);
    if (inputPesoBruto) {
      inputPesoBruto.focus();
    }
  };

  return (
    <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
      <td className="p-1">
        <div className="flex flex-col gap-0.5">
          <AutocompleteIngrediente
            valor={ing.nome}
            aoMudar={(valor) => atualizarCampo(ing.id, "nome", valor)}
            aoSelecionar={(sugestao) => {
              atualizarCampo(ing.id, "nome", sugestao.nome);
              atualizarCampo(ing.id, "codigoTBCA", sugestao.codigo);
            }}
            aoPressionarEnterNome={focarPesoBruto}
            aoPressionarApagarLinha={() => removerLinha(ing.id, index)}
            inputId={`nome-${ing.id}`}
            inputTabelaClass={inputTabelaClass}
            aoMudarEstadoMenu={(aberto) =>
              setMenuAbertoId(aberto ? ing.id : null)
            }
          />
          {ing.codigoTBCA && (
            <a
              href={`https://www.tbca.net.br/base-dados/composicao_estatistica.php?produto=${ing.codigoTBCA}`}
              target="_blank"
              rel="noreferrer"
              className="text-[9px] font-mono text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline px-1 w-fit truncate"
            >
              Cód: [{ing.codigoTBCA}]
            </a>
          )}
        </div>
      </td>
      <td className="p-1">
        <input
          id={`peso-bruto-${ing.id}`}
          type="number"
          value={ing.pesoBruto || ""}
          onChange={(e) =>
            atualizarCampo(ing.id, "pesoBruto", Number(e.target.value))
          }
          onKeyDown={lidarComTeclas}
          className={`${inputTabelaClass} text-center`}
          placeholder="0"
        />
      </td>
      <td className="p-1">
        <input
          type="number"
          value={ing.pesoLiquido || ""}
          onChange={(e) =>
            atualizarCampo(ing.id, "pesoLiquido", Number(e.target.value))
          }
          onKeyDown={lidarComTeclas}
          className={`${inputTabelaClass} text-center`}
          placeholder="0"
        />
      </td>
      <td className="p-1 text-center font-bold text-zinc-700 dark:text-zinc-300">
        {fc.replace(".", ",")}
      </td>
      <td className="p-1">
        <input
          type="text"
          value={ing.medidaCaseira}
          onChange={(e) =>
            atualizarCampo(ing.id, "medidaCaseira", e.target.value)
          }
          onKeyDown={lidarComTeclas}
          className={`${inputTabelaClass} text-center`}
          placeholder="Ex: 1 xícara"
        />
      </td>

      {index === 0 && (
        <td
          rowSpan={totalIngredientes}
          className="p-1.5 border-x border-zinc-200 dark:border-zinc-800 align-top"
        >
          <textarea
            value={tecnicaPreparo}
            onChange={(e) => setTecnicaPreparo(e.target.value)}
            style={{ minHeight: `${Math.max(120, totalIngredientes * 56)}px` }}
            className="w-full h-full p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-[11px] leading-relaxed transition-all min-h-[100px]"
            placeholder="Descreva a técnica de preparo..."
          />
        </td>
      )}

      <td className="p-1 text-center">
        <button
          onClick={() => removerLinha(ing.id, index)}
          className="text-zinc-400 hover:text-red-500 p-1.5 rounded transition-all opacity-80 dark:opacity-30 group-hover:opacity-100 focus:opacity-100"
          title="Remover Ingrediente"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function SecaoIngredientesPreparo() {
  const { ingredientes, setIngredientes, tecnicaPreparo, setTecnicaPreparo } =
    useFicha();
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  const focarCampoNome = (id: string) => {
    setTimeout(() => {
      document.getElementById(`nome-${id}`)?.focus();
    }, 100);
  };

  const adicionarLinha = () => {
    const novoId = crypto.randomUUID();
    setIngredientes((prev) => [
      ...prev,
      {
        id: novoId,
        nome: "",
        pesoBruto: 0,
        pesoLiquido: 0,
        medidaCaseira: "",
      },
    ]);
    focarCampoNome(novoId);
  };

  const lidarComEnterNaLinha = (index: number) => {
    const proximo = ingredientes[index + 1];
    if (proximo) {
      focarCampoNome(proximo.id);
    } else {
      const novoId = crypto.randomUUID();
      const novaLinha = {
        id: novoId,
        nome: "",
        pesoBruto: 0,
        pesoLiquido: 0,
        medidaCaseira: "",
      };
      setIngredientes((prev) => {
        const copia = [...prev];
        copia.splice(index + 1, 0, novaLinha);
        return copia;
      });
      focarCampoNome(novoId);
    }
  };

  const removerLinha = (id: string, index: number) => {
    let idParaFocar: string | null = null;
    if (index > 0) {
      idParaFocar = ingredientes[index - 1].id;
    } else if (ingredientes.length > 1) {
      idParaFocar = ingredientes[1].id;
    }

    setIngredientes((prev) => prev.filter((ing) => ing.id !== id));

    if (idParaFocar) {
      focarCampoNome(idParaFocar);
    }
  };

  const atualizarCampo = (id: string, campo: keyof Ingrediente, valor: any) => {
    setIngredientes((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [campo]: valor } : ing)),
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

      <div className="overflow-auto border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-[700px] shadow-inner">
        <div
          className={`transition-all duration-300 ${menuAbertoId ? "pb-64" : "pb-0"}`}
        >
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
              {ingredientes.map((ing, index) => (
                <LinhaIngrediente
                  key={ing.id}
                  ing={ing}
                  index={index}
                  totalIngredientes={ingredientes.length}
                  tecnicaPreparo={tecnicaPreparo}
                  setTecnicaPreparo={setTecnicaPreparo}
                  atualizarCampo={atualizarCampo}
                  removerLinha={removerLinha}
                  aoPressionarEnterLinha={lidarComEnterNaLinha}
                  inputTabelaClass={inputTabelaClass}
                  setMenuAbertoId={setMenuAbertoId}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
