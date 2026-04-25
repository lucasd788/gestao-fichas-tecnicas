import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Printer, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { FichaProvider } from "./contexts/FichaContext";
import { iniciarBancoDeDados } from "./database/conexao";
import CabecalhoFicha from "./components/CabecalhoFicha";
import SecaoIngredientes from "./components/SecaoIngredientesPreparo";
import SecaoPreparo from "./components/SecaoRendimentoEquipamentos";
import SecaoNutricaoCustos from "./components/SecaoNutricaoCustos";
import FichaImpressao from "./components/FichaImpressao";
import Sidebar from "./components/Sidebar";

function App() {
  const [temaEscuro, setTemaEscuro] = useState(true);
  const [bancoPronto, setBancoPronto] = useState(false);
  const componenteParaImpressaoRef = useRef<HTMLDivElement>(null);

  const lidarComImpressao = useReactToPrint({
    contentRef: componenteParaImpressaoRef,
    documentTitle: "Ficha_Tecnica_Preparo",
  });

  useEffect(() => {
    if (temaEscuro) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [temaEscuro]);

  useEffect(() => {
    iniciarBancoDeDados()
      .then(() => {
        setBancoPronto(true);
      })
      .catch((erro) => {
        console.error("Erro ao iniciar banco de dados:", erro);
      });
  }, []);

  if (!bancoPronto) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-100 dark:bg-zinc-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-3 text-zinc-500 dark:text-zinc-400">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm font-medium animate-pulse">
            Iniciando base de dados...
          </p>
        </div>
      </div>
    );
  }

  return (
    <FichaProvider>
      <div className="flex h-screen bg-zinc-100 dark:bg-zinc-950 transition-colors duration-300 overflow-hidden">
        <div className="print:hidden h-full">
          <Sidebar />
        </div>

        <div className="flex-1 overflow-y-auto text-zinc-900 dark:text-zinc-100 font-sans p-8">
          <div className="w-full max-w-[96%] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
            <header className="mb-8 flex justify-between items-center border-b border-zinc-300 dark:border-zinc-800 pb-6">
              <div className="text-left">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  Ficha Técnica de Preparo
                </h1>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">
                  Planeamento, Nutrição e Custos
                </p>
              </div>

              <div className="flex items-center gap-3 print:hidden">
                <button
                  onClick={() => lidarComImpressao()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm outline-none"
                >
                  <Printer size={18} /> Exportar PDF
                </button>

                <button
                  onClick={() => setTemaEscuro(!temaEscuro)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg shadow-sm transition-all text-sm outline-none"
                >
                  {temaEscuro ? (
                    <>
                      <Sun size={18} /> Modo Claro
                    </>
                  ) : (
                    <>
                      <Moon size={18} /> Modo Escuro
                    </>
                  )}
                </button>
              </div>
            </header>

            <main className="space-y-8">
              <CabecalhoFicha />
              <SecaoIngredientes />
              <SecaoPreparo />
              <SecaoNutricaoCustos />
            </main>

            <footer className="mt-12 text-center text-zinc-500 dark:text-zinc-500 text-sm font-medium pb-10">
              &copy; {new Date().getFullYear()} - Gestor de Fichas Técnicas
            </footer>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <FichaImpressao ref={componenteParaImpressaoRef} />
      </div>
    </FichaProvider>
  );
}

export default App;
