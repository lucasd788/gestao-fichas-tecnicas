import Database from "@tauri-apps/plugin-sql";
import dadosTBCA from "./TBCA.json";

const DADOS = "sqlite:dados_fichas_tbca.db";

export async function iniciarBancoDeDados() {
  try {
    const db = await Database.load(DADOS);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS ingredientes_tabela (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        nome TEXT NOT NULL,
        precoUnitario REAL DEFAULT 0,
        energia REAL DEFAULT 0,
        carboidratos REAL DEFAULT 0,
        proteinas REAL DEFAULT 0,
        lipideos REAL DEFAULT 0,
        lipideosSaturados REAL DEFAULT 0,
        sodio REAL DEFAULT 0,
        fibra REAL DEFAULT 0
        );
        `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS ingredientes_customizados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        energia REAL DEFAULT 0,
        carboidratos REAL DEFAULT 0,
        proteinas REAL DEFAULT 0,
        lipideos REAL DEFAULT 0,
        lipideosSaturados REAL DEFAULT 0,
        sodio REAL DEFAULT 0,
        fibra REAL DEFAULT 0
        );
        `);

    await db.execute(`
        CREATE TABLE IF NOT EXISTS fichas_salvas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        data_atualizacao TEXT NOT NULL,
        dados_json TEXT NOT NULL
        );
        `);

    await popularBancoSeVazio(db);

    console.log("Banco de dados inicializado.");
    return db;
  } catch (erro) {
    console.error("Erro ao inicializar o banco de dados:", erro);
    throw erro;
  }
}

async function popularBancoSeVazio(db: Database) {
  const resultado = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM ingredientes_tabela",
  );
  if (resultado[0].count === 0) {
    console.log("Inserindo a TBCA.");

    const buscarNutriente = (
      nutrientes: any[],
      nomeDesejado: string,
      unidadeDesejada?: string,
    ) => {
      const nut = nutrientes.find(
        (n) =>
          n.Componente === nomeDesejado &&
          (!unidadeDesejada || n.Unidades === unidadeDesejada),
      );
      if (!nut) return 0;
      let valor = String(nut["Valor por 100g"]);
      if (valor.toLowerCase() === "tr" || valor.toLowerCase() === "na")
        return 0;
      return isNaN(Number(valor.replace(",", ".")))
        ? 0
        : Number(valor.replace(",", "."));
    };
    const dadosTBCA_ = dadosTBCA as any[];

    for (const item of dadosTBCA_) {
      if (
        item.classe === "Preparações mistas" ||
        item.classe === "Produtos infantis"
      )
        continue;

      await db.execute(
        `INSERT INTO ingredientes_tabela (codigo, nome, precoUnitario, energia, carboidratos, proteinas, lipideos, lipideosSaturados, sodio, fibra)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          item.codigo,
          item.descricao,
          0,
          buscarNutriente(item.nutrientes, "Energia", "kcal"),
          buscarNutriente(item.nutrientes, "Carboidrato total") ||
            buscarNutriente(item.nutrientes, "Carboidrato disponível"),
          buscarNutriente(item.nutrientes, "Proteína"),
          buscarNutriente(item.nutrientes, "Lipídios"),
          buscarNutriente(item.nutrientes, "Ácidos graxos saturados"),
          buscarNutriente(item.nutrientes, "Sódio"),
          buscarNutriente(item.nutrientes, "Fibra alimentar"),
        ],
      );
    }
  }
}

export async function pesquisarIngredientes(
  termo: string,
): Promise<{ nome: string; codigo: string | null }[]> {
  if (!termo || termo.trim().length === 0) return [];

  const db = await Database.load(DADOS);
  const termoQualquerLugar = `%${termo}%`;
  const termoNoInicio = `${termo}%`;

  const query = `
    SELECT * FROM (
        SELECT nome, codigo FROM ingredientes_tabela WHERE nome LIKE $1
        UNION ALL
        SELECT nome, NULL as codigo FROM ingredientes_customizados WHERE nome LIKE $1
    )
    ORDER BY 
        CASE WHEN nome LIKE $2 THEN 1 ELSE 2 END,
        nome ASC
    LIMIT 50
    `;

  return await db.select<{ nome: string; codigo: string | null }[]>(query, [
    termoQualquerLugar,
    termoNoInicio,
  ]);
}

export async function buscarDadosTabela(): Promise<Record<string, any>> {
  const db = await Database.load(DADOS);
  const resultadosOficiais = await db.select<any[]>(
    "SELECT * FROM ingredientes_tabela",
  );
  const resultadosCustom = await db.select<any[]>(
    "SELECT * FROM ingredientes_customizados",
  );
  const mapa: Record<string, any> = {};
  for (const item of resultadosOficiais) {
    mapa[item.nome] = item;
  }

  for (const item of resultadosCustom) {
    mapa[item.nome] = { ...item, isCustom: true };
  }

  return mapa;
}

export async function salvarIngredienteCustomizado(ingrediente: any) {
  const db = await Database.load(DADOS);

  await db.execute(
    `INSERT OR REPLACE INTO ingredientes_customizados 
        (nome, energia, carboidratos, proteinas, lipideos, lipideosSaturados, sodio, fibra) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      ingrediente.nome,
      ingrediente.energia || 0,
      ingrediente.carboidratos || 0,
      ingrediente.proteinas || 0,
      ingrediente.lipideos || 0,
      ingrediente.lipideosSaturados || 0,
      ingrediente.sodio || 0,
      ingrediente.fibra || 0,
    ],
  );
}
export async function apagarIngredienteCustomizado(nome: string) {
  const db = await Database.load(DADOS);

  await db.execute("DELETE FROM ingredientes_customizados WHERE nome = $1", [
    nome,
  ]);
}

export async function salvarFichaDB(
  id: string,
  nome: string,
  dadosJson: string,
) {
  const db = await Database.load(DADOS);
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  await db.execute(
    `INSERT OR REPLACE INTO fichas_salvas (id, nome, data_atualizacao, dados_json) 
        VALUES ($1, $2, $3, $4)`,
    [id, nome, dataAtual, dadosJson],
  );
}

export async function listarFichasDB() {
  const db = await Database.load(DADOS);
  return await db.select<
    { id: string; nome: string; data_atualizacao: string }[]
  >(
    "SELECT id, nome, data_atualizacao FROM fichas_salvas ORDER BY data_atualizacao DESC",
  );
}

export async function obterFichaDB(id: string) {
  const db = await Database.load(DADOS);
  const result = await db.select<{ dados_json: string }[]>(
    "SELECT dados_json FROM fichas_salvas WHERE id = $1",
    [id],
  );
  return result.length > 0 ? result[0].dados_json : null;
}

export async function apagarFichaDB(id: string) {
  const db = await Database.load(DADOS);
  await db.execute("DELETE FROM fichas_salvas WHERE id = $1", [id]);
}
