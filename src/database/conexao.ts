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

        await popularBancoSeVazio(db);

        console.log("Banco de dados inicializado.");
        return db;
    } catch (erro) {
        console.error("Erro ao inicializar o banco de dados:", erro);
        throw erro;
    }
}

async function popularBancoSeVazio(db: Database) {
    const resultado = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM ingredientes_tabela");
    if (resultado[0].count === 0) {
        console.log("Inserindo a TBCA.");

        const buscarNutriente = (nutrientes: any[], nomeDesejado: string, unidadeDesejada?: string) => {
            const nut = nutrientes.find((n) => n.Componente === nomeDesejado && (!unidadeDesejada || n.Unidades === unidadeDesejada));
            if (!nut) return 0;
            let valor = String(nut["Valor por 100g"]);
            if (valor.toLowerCase() === "tr" || valor.toLowerCase() === "na") return 0;
            return isNaN(Number(valor.replace(",", "."))) ? 0 : Number(valor.replace(",", "."));
        };
        const dadosTBCA_ = dadosTBCA as any[];

        for (const item of dadosTBCA_) {
            if (item.classe === "Preparações mistas" || item.classe === "Produtos infantis") continue;

            await db.execute(
                `INSERT INTO ingredientes_tabela (codigo, nome, precoUnitario, energia, carboidratos, proteinas, lipideos, lipideosSaturados, sodio, fibra)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    item.codigo,
                    item.descricao,
                    0,
                    buscarNutriente(item.nutrientes, "Energia", "kcal"),
                    buscarNutriente(item.nutrientes, "Carboidrato total") || buscarNutriente(item.nutrientes, "Carboidrato disponível"),
                    buscarNutriente(item.nutrientes, "Proteína"),
                    buscarNutriente(item.nutrientes, "Lipídios"),
                    buscarNutriente(item.nutrientes, "Ácidos graxos saturados"),
                    buscarNutriente(item.nutrientes, "Sódio"),
                    buscarNutriente(item.nutrientes, "Fibra alimentar")
                ]
            );
        }
    }
}

export async function buscarNomesIngredientes(): Promise<{ nome: string, codigo: string }[]> {
    const db = await Database.load(DADOS);
    return await db.select<{ nome: string, codigo: string }[]>("SELECT nome, codigo FROM ingredientes_tabela ORDER BY nome ASC");
}

export async function buscarDadosTabela(): Promise<Record<string, any>> {
    const db = await Database.load(DADOS);
    const resultados = await db.select<any[]>("SELECT * FROM ingredientes_tabela");
    const mapa: Record<string, any> = {};
    for (const item of resultados) {
        mapa[item.nome] = item;
    }
    return mapa;
}