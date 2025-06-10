//DESENVOLVIDO POR MATHEUS
import { Peca } from "../models/Peca.js";
import sequelize from '../config/database-connection.js';
import { QueryTypes } from 'sequelize';

class PecaService {
    static async findAll() {
        const objs = await Peca.findAll({ include: { all: true, nested: true } });
        return objs;
    }

    static async findByPk(req) {
        const { id } = req.params;
        const obj = await Peca.findByPk(id, { include: { all: true, nested: true } });
        return obj;
    }

    static async create(req) {
        const body = req.body;

        // Verifica se o body é um array
        if (Array.isArray(body)) {
            const results = [];
            for (const item of body) {
                const { nome, codigo, preco, estoque } = item;
                if (estoque == null) throw `A quantidade em estoque deve ser preenchida para o item ${nome || 'desconhecido'}`;
                const obj = await Peca.create({ nome, codigo, preco, estoque });
                results.push(await Peca.findByPk(obj.id, { include: { all: true, nested: true } }));
            }
            return results; // Retorna a lista de peças criadas
        } else {
            // Lógica original para um único objeto
            const { nome, codigo, preco, estoque } = body;
            if (estoque == null) throw 'A quantidade em estoque deve ser preenchida';
            const obj = await Peca.create({ nome, codigo, preco, estoque });
            return await Peca.findByPk(obj.id, { include: { all: true, nested: true } });
        }
    }

    static async update(req) {
        const body = req.body;
        const { id } = req.params;

        // Caso seja uma requisição para atualizar uma única peça (usando req.params.id)
        if (id && !Array.isArray(body)) {
            const { nome, codigo, preco, estoque } = body;
            if (estoque == null) throw 'A quantidade em estoque deve ser preenchida';
            const obj = await Peca.findByPk(id, { include: { all: true, nested: true } });
            if (obj == null) throw 'Peça não encontrada!';
            Object.assign(obj, { nome, codigo, preco, estoque });
            await obj.save();
            return await Peca.findByPk(obj.id, { include: { all: true, nested: true } });
        }

        // Caso seja uma requisição para atualizar múltiplas peças (array no body)
        if (Array.isArray(body)) {
            const results = [];
            for (const item of body) {
                const { id, nome, codigo, preco, estoque } = item;
                if (!id) throw `O campo 'id' é obrigatório para o item ${nome || 'desconhecido'}`;
                if (estoque == null) throw `A quantidade em estoque deve ser preenchida para o item ${nome || 'desconhecido'}`;
                const obj = await Peca.findByPk(id, { include: { all: true, nested: true } });
                if (obj == null) throw `Peça com ID ${id} não encontrada!`;
                Object.assign(obj, { nome, codigo, preco, estoque });
                await obj.save();
                results.push(await Peca.findByPk(obj.id, { include: { all: true, nested: true } }));
            }
            return results; // Retorna a lista de peças atualizadas
        }

        throw 'Formato inválido: envie um objeto para uma peça ou um array de peças';
    }

    static async delete(req) {
        const { id } = req.params;
        const obj = await Peca.findByPk(id);
        if (obj == null)
            throw 'Peça não encontrada!';
        try {
            await obj.destroy();
            return obj;
        } catch (error) {
            throw "Não é possível remover uma peça associada a um serviço!";
        }
    }

    static async relatorioEstoquePecas() {
        const query = `
            SELECT 
                p.id,
                p.nome,
                p.codigo,
                p.preco,
                p.estoque,
                COALESCE(SUM(ap.quantidade), 0) as quantidade_utilizada,
                p.estoque - COALESCE(SUM(ap.quantidade), 0) as estoque_disponivel
            FROM pecas p
            LEFT JOIN adicao_pecas ap ON p.id = ap.peca_id
            GROUP BY p.id, p.nome, p.codigo, p.preco, p.estoque
            ORDER BY estoque_disponivel ASC;
        `;

        return await sequelize.query(query, {
            type: QueryTypes.SELECT
        });
    }

    static async relatorioPecasPorFuncionario(dataInicio, dataFim) {
        if (!dataInicio || !dataFim) {
            throw new Error('Data de início e fim são obrigatórias');
        }

        const query = `
            SELECT 
                f.nome as funcionario_nome,
                f.especialidade,
                p.nome as peca_nome,
                COUNT(ap.id) as quantidade_servicos,
                SUM(ap.quantidade) as quantidade_total_pecas,
                SUM(ap.quantidade * ap.valor) as valor_total
            FROM funcionarios f
            INNER JOIN abertura_servico ab ON f.id = ab.funcionario_id
            INNER JOIN adicao_pecas ap ON ab.id = ap.abertura_servico_id
            INNER JOIN pecas p ON p.id = ap.peca_id
            WHERE ap.data BETWEEN :dataInicio AND :dataFim
            GROUP BY f.id, f.nome, f.especialidade, p.nome
            ORDER BY f.nome, valor_total DESC;
        `;

        return await sequelize.query(query, {
            replacements: { dataInicio, dataFim },
            type: QueryTypes.SELECT
        });
    }

    static async relatorioValorTotalPecasPorServico(dataInicio, dataFim) {
        if (!dataInicio || !dataFim) {
            throw new Error('Data de início e fim são obrigatórias');
        }

        const query = `
            SELECT 
                s.descricao as servico_descricao,
                s.categoria as servico_categoria,
                COUNT(DISTINCT ab.id) as quantidade_ordens_servico,
                COUNT(ap.id) as quantidade_pecas_utilizadas,
                SUM(ap.quantidade) as quantidade_total_pecas,
                SUM(ap.quantidade * ap.valor) as valor_total_pecas,
                AVG(ap.quantidade * ap.valor) as media_valor_pecas_por_servico
            FROM servicos s
            INNER JOIN abertura_servico ab ON s.id = ab.servico_id
            INNER JOIN adicao_pecas ap ON ab.id = ap.abertura_servico_id
            WHERE ap.data BETWEEN :dataInicio AND :dataFim
            GROUP BY s.id, s.descricao, s.categoria
            ORDER BY valor_total_pecas DESC;
        `;

        return await sequelize.query(query, {
            replacements: { dataInicio, dataFim },
            type: QueryTypes.SELECT
        });
    }
}

export { PecaService };