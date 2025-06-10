import { AdicaoPeca } from '../models/AdicaoPeca.js';
import { AberturaServico } from '../models/AberturaServico.js';
import sequelize from '../config/database-connection.js';
import { Op } from 'sequelize';
import { QueryTypes } from 'sequelize';

class AdicaoPecaService {
    static async adicionarPeca(req) {
        const { aberturaServicoId: bodyId, quantidade, valor, data } = req.body;
        const routeId = req.params.id;

        try {
            // Validar ID do serviço primeiro
            if (!routeId) {
                throw new Error('ID do serviço na rota é obrigatório');
            }

            // Validar se o ID da rota é igual ao ID do corpo
            if (bodyId && routeId !== bodyId.toString()) {
                throw new Error('O ID da rota deve ser igual ao ID fornecido no corpo da requisição!');
            }

            const aberturaServicoId = routeId;

            // Regra de Negócio 1: Validar existência do serviço de forma mais robusta
            const servico = await AberturaServico.findByPk(aberturaServicoId, {
                rejectOnEmpty: true // Isso garante que um erro será lançado se não encontrar o registro
            });

            // Validações dos outros campos
            if (!quantidade) {
                throw new Error('Quantidade é obrigatória!');
            }
            if (!valor) {
                throw new Error('Valor é obrigatório!');
            }
            if (!data) {
                throw new Error('Data é obrigatória!');
            }

            // Regra de Negócio 2: Validar data da peça em relação à data do serviço
            const dataAdicao = new Date(data);
            const dataServico = new Date(servico.data);
            
            if (dataAdicao < dataServico) {
                throw new Error('A data de adição da peça não pode ser anterior à data do serviço.');
            }

            // Regra de Negócio 2 (continuação): Validar tempo máximo para adição de peças (30 dias)
            const diferencaDias = Math.floor((dataAdicao - dataServico) / (1000 * 60 * 60 * 24));
            if (diferencaDias > 30) {
                throw new Error('Não é possível adicionar peças a um serviço aberto há mais de 30 dias.');
            }

            const t = await sequelize.transaction();

            try {
                const novaPeca = await AdicaoPeca.create({
                    abertura_servico_id: aberturaServicoId,
                    quantidade,
                    valor,
                    data
                }, { transaction: t });

                await t.commit();
                return await AdicaoPeca.findByPk(novaPeca.id, {
                    include: { all: true, nested: true }
                });
            } catch (error) {
                await t.rollback();
                throw new Error('Erro ao adicionar peça ao serviço: ' + error.message);
            }
        } catch (error) {
            if (error.name === 'SequelizeEmptyResultError') {
                throw new Error('Serviço não encontrado! Não é possível adicionar peças a um serviço inexistente.');
            }
            throw error;
        }
    }

    static async excluirPeca(id) {
        if (!id) {
            throw new Error('ID da peça é obrigatório!');
        }

        const t = await sequelize.transaction();

        try {
            const peca = await AdicaoPeca.findByPk(id);
            
            if (!peca) {
                throw new Error('Peça não encontrada!');
            }

            await peca.destroy({ transaction: t });
            await t.commit();
            
            return { mensagem: 'Peça excluída com sucesso!' };
        } catch (error) {
            await t.rollback();
            throw error instanceof Error ? error : new Error('Erro ao excluir a peça.');
        }
    }

    static async relatorioTotalPecasPorPeriodo(dataInicio, dataFim) {
        if (!dataInicio || !dataFim) {
            throw new Error('Data de início e fim são obrigatórias');
        }

        try {
            const resultado = await AdicaoPeca.findAll({
                where: {
                    data: {
                        [Op.between]: [dataInicio, dataFim]
                    }
                },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('quantidade')), 'quantidadeTotal'],
                    [sequelize.fn('SUM', sequelize.literal('quantidade * valor')), 'valorTotal']
                ],
                raw: true
            });

            return {
                periodo: {
                    inicio: dataInicio,
                    fim: dataFim
                },
                quantidadeTotal: parseInt(resultado[0].quantidadeTotal) || 0,
                valorTotal: parseFloat(resultado[0].valorTotal) || 0
            };
        } catch (error) {
            throw new Error('Erro ao gerar relatório de totais: ' + error.message);
        }
    }

    static async relatorioPecasMaisUtilizadas(dataInicio, dataFim) {
        if (!dataInicio || !dataFim) {
            throw new Error('Data de início e fim são obrigatórias');
        }

        try {
            const resultado = await AdicaoPeca.findAll({
                where: {
                    data: {
                        [Op.between]: [dataInicio, dataFim]
                    }
                },
                attributes: [
                    'abertura_servico_id',
                    [sequelize.fn('SUM', sequelize.col('quantidade')), 'quantidadeTotal'],
                    [sequelize.fn('SUM', sequelize.literal('quantidade * valor')), 'valorTotal']
                ],
                include: [{
                    model: AberturaServico,
                    as: 'ordemServico',
                    attributes: ['data']
                }],
                group: ['abertura_servico_id', 'ordemServico.id'],
                order: [[sequelize.fn('SUM', sequelize.col('quantidade')), 'DESC']],
                raw: true,
                nest: true
            });

            return {
                periodo: {
                    inicio: dataInicio,
                    fim: dataFim
                },
                pecas: resultado.map(item => ({
                    ordemServicoId: item.abertura_servico_id,
                    data: item.ordemServico.data,
                    quantidadeTotal: parseInt(item.quantidadeTotal),
                    valorTotal: parseFloat(item.valorTotal)
                }))
            };
        } catch (error) {
            throw new Error('Erro ao gerar relatório de peças mais utilizadas: ' + error.message);
        }
    }

    static async relatorioPecasMaisUtilizadasPorPeriodo(dataInicio, dataFim) {
        if (!dataInicio || !dataFim) {
            throw new Error('Data de início e fim são obrigatórias');
        }

        const query = `
            SELECT 
                p.nome as peca_nome,
                p.codigo as peca_codigo,
                COUNT(DISTINCT ap.abertura_servico_id) as quantidade_servicos,
                SUM(ap.quantidade) as quantidade_total,
                AVG(ap.valor) as valor_medio,
                SUM(ap.quantidade * ap.valor) as valor_total,
                MIN(ap.data) as primeira_utilizacao,
                MAX(ap.data) as ultima_utilizacao
            FROM pecas p
            INNER JOIN adicao_pecas ap ON p.id = ap.peca_id
            WHERE ap.data BETWEEN :dataInicio AND :dataFim
            GROUP BY p.id, p.nome, p.codigo
            ORDER BY quantidade_total DESC;
        `;

        return await sequelize.query(query, {
            replacements: { dataInicio, dataFim },
            type: QueryTypes.SELECT
        });
    }

    static async relatorioEvolucaoUtilizacaoPecas(dataInicio, dataFim) {
        if (!dataInicio || !dataFim) {
            throw new Error('Data de início e fim são obrigatórias');
        }

        const query = `
            WITH RECURSIVE dates AS (
                SELECT :dataInicio::date as date
                UNION ALL
                SELECT date + 1
                FROM dates
                WHERE date < :dataFim::date
            )
            SELECT 
                d.date as data,
                COALESCE(COUNT(DISTINCT ap.id), 0) as quantidade_adicoes,
                COALESCE(SUM(ap.quantidade), 0) as quantidade_pecas,
                COALESCE(SUM(ap.quantidade * ap.valor), 0) as valor_total
            FROM dates d
            LEFT JOIN adicao_pecas ap ON d.date = ap.data
            GROUP BY d.date
            ORDER BY d.date;
        `;

        return await sequelize.query(query, {
            replacements: { dataInicio, dataFim },
            type: QueryTypes.SELECT
        });
    }

    static async relatorioUtilizacaoPecasPorVeiculo(dataInicio, dataFim) {
        if (!dataInicio || !dataFim) {
            throw new Error('Data de início e fim são obrigatórias');
        }

        const query = `
            SELECT 
                v.marca,
                v.modelo,
                v.ano,
                v.placa,
                c.nome as cliente_nome,
                COUNT(DISTINCT ap.id) as quantidade_adicoes,
                COUNT(DISTINCT p.id) as quantidade_pecas_diferentes,
                SUM(ap.quantidade) as quantidade_total_pecas,
                SUM(ap.quantidade * ap.valor) as valor_total
            FROM veiculos v
            INNER JOIN clientes c ON v.cliente_id = c.id
            INNER JOIN abertura_servico ab ON v.id = ab.veiculo_id
            INNER JOIN adicao_pecas ap ON ab.id = ap.abertura_servico_id
            INNER JOIN pecas p ON ap.peca_id = p.id
            WHERE ap.data BETWEEN :dataInicio AND :dataFim
            GROUP BY v.id, v.marca, v.modelo, v.ano, v.placa, c.nome
            ORDER BY valor_total DESC;
        `;

        return await sequelize.query(query, {
            replacements: { dataInicio, dataFim },
            type: QueryTypes.SELECT
        });
    }
}

export { AdicaoPecaService };