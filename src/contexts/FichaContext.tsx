import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Ingrediente,
  DadosRendimento,
  InformacoesGerais,
  DadosNutricionais,
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
  nutricaoECustos: DadosNutricionais[];
  setNutricaoECustos: React.Dispatch<React.SetStateAction<DadosNutricionais[]>>;
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
    fatorCoccao: 0,
    pesoTotal: 0,
    rendimentoPorcoes: 0,
    pesoPorcao: 0,
    medidaCaseiraPorcao: "",
    historico: [],
  });

  const [tecnicaPreparo, setTecnicaPreparo] = useState("");
  const [nutricaoECustos, setNutricaoECustos] = useState<DadosNutricionais[]>([
    {
      id: crypto.randomUUID(),
      nome: "",
      perCapitaBruto: 0,
      precoUnitario: 0,
      custoUnitario: 0,
      perCapitaLiquido: 0,
      energia: 0,
      carboidratos: 0,
      proteinas: 0,
      lipideos: 0,
      lipideosSaturados: 0,
      sodio: 0,
      fibra: 0,
    },
  ]);

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
        nutricaoECustos,
        setNutricaoECustos,
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
