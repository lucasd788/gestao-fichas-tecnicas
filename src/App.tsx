import { useState, useEffect } from "react";
import CabecalhoFicha from "./components/CabecalhoFicha";
import SecaoIngredientes from "./components/SecaoIngredientes";
import SecaoPreparo from "./components/SecaoPreparo";
import SecaoNutricaoCustos from "./components/SecaoNutricaoCustos";

function App() {
  const [temaEscuro, setTemaEscuro] = useState(false);

  useEffect(() => {
    if (temaEscuro) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [temaEscuro]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans py-10 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
            Ficha Técnica de Preparo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
            gestao-fichas-tecnicas
          </p>

          {/* Botão alternar tema */}
          <button
            onClick={() => setTemaEscuro(!temaEscuro)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition-colors"
          >
            {temaEscuro
              ? "Mudar para Tema Claro ☀️"
              : "Mudar para Tema Escuro 🌙"}
          </button>
        </header>
        <main>
          <CabecalhoFicha />
          <SecaoIngredientes />
          <SecaoPreparo />
          <SecaoNutricaoCustos />
        </main>
      </div>
    </div>
  );
}

export default App;
