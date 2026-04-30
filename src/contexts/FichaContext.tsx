import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import {
  Ingrediente,
  DadosRendimento,
  InformacoesGerais,
  DadosNutricionais,
} from "../types/ficha";
import { salvarFichaDB } from "../database/conexao";
import { toast } from "sonner";

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
  salvarFichaManualmente: () => void;
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

  const ultimaSalvaRef = useRef<string>("");
  const estadoAtualRef = useRef<string>("");
  const estaSalvandoRef = useRef<boolean>(false);

  useEffect(() => {
    const dados = obterFichaAtualParaSalvar();
    estadoAtualRef.current = JSON.stringify(dados);
  }, [
    fichaId,
    informacoesGerais,
    ingredientes,
    rendimento,
    tecnicaPreparo,
    nutricaoECustos,
    dadosExtras,
    baseExtras,
  ]);

  const salvarFichaAuto = async (mostrarAvisoVisual = false) => {
    if (estaSalvandoRef.current) return;

    const jsonAtual = estadoAtualRef.current;

    if (jsonAtual === ultimaSalvaRef.current) {
      if (mostrarAvisoVisual) toast.info("A ficha já está salva");
      return;
    }

    if (jsonAtual !== "") {
      const dados = JSON.parse(jsonAtual);
      const temNome = dados.informacoesGerais.preparacao.trim() !== "";
      const temIngredientes = dados.ingredientes.some(
        (i: any) => i.nome.trim() !== "",
      );

      if (!mostrarAvisoVisual && !temNome && !temIngredientes) {
        return;
      }

      try {
        estaSalvandoRef.current = true;

        const nomeFicha = temNome
          ? dados.informacoesGerais.preparacao
          : "Ficha Sem Nome";

        const idCorreto = dados.id;

        await salvarFichaDB(idCorreto, nomeFicha, jsonAtual);
        ultimaSalvaRef.current = jsonAtual;

        console.log(`[Save] "${nomeFicha}" salva com ID: ${idCorreto}`);

        if (mostrarAvisoVisual) {
          toast.success("Ficha salva");
        }

        window.dispatchEvent(new Event("fichaSalva"));
      } catch (error) {
        console.error("Erro ao salvar ficha:", error);
        if (mostrarAvisoVisual) {
          toast.error("Erro ao salvar a ficha");
        }
      } finally {
        estaSalvandoRef.current = false;
      }
    }
  };

  const salvarFichaManualmente = () => salvarFichaAuto(true);

  useEffect(() => {
    if (!fichaId) return;
    const timer = setInterval(() => {
      salvarFichaAuto(false);
    }, 30000);

    return () => clearInterval(timer);
  }, [fichaId]);

  useEffect(() => {
    const lidarComAtalhoTeclado = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        salvarFichaManualmente();
      }
    };

    window.addEventListener("keydown", lidarComAtalhoTeclado);

    return () => {
      window.removeEventListener("keydown", lidarComAtalhoTeclado);
    };
  }, []);

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

    ultimaSalvaRef.current = "";
    estadoAtualRef.current = "";
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

    const json = JSON.stringify(dados);
    ultimaSalvaRef.current = json;
    estadoAtualRef.current = json;
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
        salvarFichaManualmente,
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
