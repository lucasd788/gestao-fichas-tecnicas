import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Ingrediente,
  DadosRendimento,
  InformacoesGerais,
  DadosNutricionais,
} from "../types/ficha";

interface FichaContextType {
  fichaId: string;
  setFichaId: React.Dispatch<React.SetStateAction<string>>;
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
  dadosExtras: Record<string, Partial<DadosNutricionais>>;
  setDadosExtras: React.Dispatch<
    React.SetStateAction<Record<string, Partial<DadosNutricionais>>>
  >;
  baseExtras: Record<string, Partial<DadosNutricionais>>;
  setBaseExtras: React.Dispatch<
    React.SetStateAction<Record<string, Partial<DadosNutricionais>>>
  >;
  limparFicha: () => void;
  carregarFichaSalva: (dados: any) => void;
  obterFichaAtualParaSalvar: () => any;
}

const FichaContext = createContext<FichaContextType | undefined>(undefined);

export const FichaProvider = ({ children }: { children: ReactNode }) => {
  const [fichaId, setFichaId] = useState<string>(crypto.randomUUID());
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
    { alunos: "", preparacao: "", categoria: "" },
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
  const [nutricaoECustos, setNutricaoECustos] = useState<DadosNutricionais[]>(
    [],
  );

  const [dadosExtras, setDadosExtras] = useState<
    Record<string, Partial<DadosNutricionais>>
  >({});
  const [baseExtras, setBaseExtras] = useState<
    Record<string, Partial<DadosNutricionais>>
  >({});

  const limparFicha = () => {
    setFichaId(crypto.randomUUID());
    setInformacoesGerais({ alunos: "", preparacao: "", categoria: "" });
    setIngredientes([
      {
        id: crypto.randomUUID(),
        nome: "",
        pesoBruto: 0,
        pesoLiquido: 0,
        medidaCaseira: "",
      },
    ]);
    setRendimento({
      equipamentos: "",
      tempoPreparo: "",
      fatorCoccao: 0,
      pesoTotal: 0,
      rendimentoPorcoes: 0,
      pesoPorcao: 0,
      medidaCaseiraPorcao: "",
      historico: [],
    });
    setTecnicaPreparo("");
    setNutricaoECustos([]);
    setDadosExtras({});
    setBaseExtras({});
  };

  const carregarFichaSalva = (dados: any) => {
    setFichaId(dados.id);
    setInformacoesGerais(
      dados.informacoesGerais || { alunos: "", preparacao: "", categoria: "" },
    );
    setIngredientes(dados.ingredientes || []);
    setRendimento(
      dados.rendimento || {
        equipamentos: "",
        tempoPreparo: "",
        fatorCoccao: 0,
        pesoTotal: 0,
        rendimentoPorcoes: 0,
        pesoPorcao: 0,
        medidaCaseiraPorcao: "",
        historico: [],
      },
    );
    setTecnicaPreparo(dados.tecnicaPreparo || "");
    setNutricaoECustos(dados.nutricaoECustos || []);
    setDadosExtras(dados.dadosExtras || {});
    setBaseExtras(dados.baseExtras || {});
  };

  const obterFichaAtualParaSalvar = () => {
    return {
      id: fichaId,
      informacoesGerais,
      ingredientes,
      rendimento,
      tecnicaPreparo,
      nutricaoECustos,
      dadosExtras,
      baseExtras,
    };
  };

  return (
    <FichaContext.Provider
      value={{
        fichaId,
        setFichaId,
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
        dadosExtras,
        setDadosExtras,
        baseExtras,
        setBaseExtras,
        limparFicha,
        carregarFichaSalva,
        obterFichaAtualParaSalvar,
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
