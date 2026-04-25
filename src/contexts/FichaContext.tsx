import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Ingrediente,
  DadosRendimento,
  InformacoesGerais,
} from "../types/ficha";

interface FichaContextType {
  ingredientes: Ingrediente[];
  setIngredientes: React.Dispatch<React.SetStateAction<Ingrediente[]>>;
  rendimento: DadosRendimento;
  setRendimento: React.Dispatch<React.SetStateAction<DadosRendimento>>;
  informacoesGerais: InformacoesGerais;
  setInformacoesGerais: React.Dispatch<React.SetStateAction<InformacoesGerais>>;
  tecnicaPreparo: string;
  setTecnicaPreparo: React.Dispatch<React.SetStateAction<string>>;
}

const FichaContext = createContext<FichaContextType | undefined>(undefined);

export const FichaProvider = ({ children }: { children: ReactNode }) => {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([
    {
      id: crypto.randomUUID(),
      nome: "",
      pesoBruto: 0,
      pesoLiquido: 0,
      medidaCaseira: "",
    },
  ]);

  const [informacoesGerais, setInformacoesGerais] = useState<InformacoesGerais>(
    {
      alunos: "",
      preparacao: "",
      categoria: "",
    },
  );

  const [rendimento, setRendimento] = useState<DadosRendimento>({
    equipamentos: "",
    tempoPreparo: "",
    fatorCoccao: "",
    pesoTotal: "",
    rendimentoPorcoes: "",
    pesoPorcao: "",
    medidaCaseiraPorcao: "",
    historico: [],
  });

  const [tecnicaPreparo, setTecnicaPreparo] = useState("");

  return (
    <FichaContext.Provider
      value={{
        ingredientes,
        setIngredientes,
        rendimento,
        setRendimento,
        informacoesGerais,
        setInformacoesGerais,
        tecnicaPreparo,
        setTecnicaPreparo,
      }}
    >
      {children}
    </FichaContext.Provider>
  );
};

export const useFicha = () => {
  const context = useContext(FichaContext);
  if (!context) throw new Error("erro useFicha - FichaContext não encontrado");
  return context;
};
