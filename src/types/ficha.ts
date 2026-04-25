export interface Ingrediente {
    id: string;
    nome: string;
    pesoBruto: number;
    pesoLiquido: number;
    medidaCaseira: string;
}

export interface DadosNutricionais {
    id: string;
    nome: string;
    perCapitaBruto: number;
    precoUnitario: number;
    custoUnitario: number;
    perCapitaLiquido: number;
    energia: number;
    carboidratos: number;
    proteinas: number;
    lipideos: number;
    lipideosSaturados: number;
    sodio: number;
    fibra: number;
}

export interface InformacoesGerais {
    alunos: string;
    preparacao: string;
    categoria: string;
}

export interface DadosRendimento {
    equipamentos: string;
    tempoPreparo: string;
    fatorCoccao: number | "";
    pesoTotal: number | "";
    rendimentoPorcoes: number | "";
    pesoPorcao: number | "";
    medidaCaseiraPorcao: string;
    historico?: string[];
}

export interface FichaTecnicaCompleta {
    id?: string;
    informacoesGerais: InformacoesGerais;
    tecnicaPreparo: string;
    ingredientes: Ingrediente[];
    rendimento: DadosRendimento;
    nutricaoECustos: DadosNutricionais[];
}